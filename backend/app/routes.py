from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from sqlalchemy import or_, cast, Integer
from typing import Optional
from datetime import datetime, timedelta
from . import models, schemas
from .database import SessionLocal
from .auth import verify_password, get_password_hash, create_access_token, verify_token

router = APIRouter()
security = HTTPBearer()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    """Get current authenticated user."""
    token = credentials.credentials
    token_data = verify_token(token)
    
    if token_data is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = db.query(models.User).filter(models.User.username == token_data["username"]).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user

def authenticate_user(db: Session, username: str, password: str):
    """Authenticate user with username and password."""
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user

# Authentication routes
@router.post("/auth/login", response_model=schemas.Token)
def login(user_login: schemas.UserLogin, db: Session = Depends(get_db)):
    user = authenticate_user(db, user_login.username, user_login.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=1440)  # 24 hours
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": schemas.UserResponse(
            id=user.id,
            username=user.username,
            email=user.email,
            is_active=user.is_active,
            is_admin=user.is_admin,
            created_at=user.created_at
        )
    }

@router.post("/auth/create-admin", response_model=schemas.UserResponse)
def create_admin_user(user_data: schemas.UserCreate, db: Session = Depends(get_db)):
    """Create the first admin user. This endpoint is disabled if any user already exists."""
    existing_users = db.query(models.User).count()
    if existing_users > 0:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin user already exists. Registration is disabled."
        )
    
    # Check if username or email already exists
    existing_user = db.query(models.User).filter(
        (models.User.username == user_data.username) | (models.User.email == user_data.email)
    ).first()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or email already registered"
        )
    
    # Create admin user
    hashed_password = get_password_hash(user_data.password)
    new_user = models.User(
        username=user_data.username,
        email=user_data.email,
        hashed_password=hashed_password,
        is_active=True,
        is_admin=True,
        created_at=datetime.utcnow()
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return schemas.UserResponse(
        id=new_user.id,
        username=new_user.username,
        email=new_user.email,
        is_active=new_user.is_active,
        is_admin=new_user.is_admin,
        created_at=new_user.created_at
    )

@router.get("/auth/me", response_model=schemas.UserResponse)
def get_current_user_info(current_user: models.User = Depends(get_current_user)):
    """Get current user information."""
    return schemas.UserResponse(
        id=current_user.id,
        username=current_user.username,
        email=current_user.email,
        is_active=current_user.is_active,
        is_admin=current_user.is_admin,
        created_at=current_user.created_at
    )

@router.get("/auth/check-setup")
def check_setup(db: Session = Depends(get_db)):
    """Check if admin setup is required."""
    user_count = db.query(models.User).count()
    return {"setup_required": user_count == 0}

# Protected routes (require authentication)
@router.get("/admin/bds/", response_model=list[schemas.BDBase])
def admin_list_bds(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=100, description="Number of records to return"),
    search: Optional[str] = Query(None, description="Search term for filtering"),
    sort_field: Optional[str] = Query(None, description="Field to sort by"),
    sort_order: Optional[str] = Query("asc", description="Sort order: asc or desc"),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Protected admin endpoint for listing BDs."""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    query = db.query(models.BD)
    
    # Apply search filter if provided
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                models.BD.titrealbum.ilike(search_term),
                models.BD.titreserie.ilike(search_term),
                models.BD.scenariste.ilike(search_term),
                models.BD.dessinateur.ilike(search_term),
                models.BD.editeur.ilike(search_term),
                models.BD.collection.ilike(search_term),
                models.BD.genre.ilike(search_term),
                models.BD.cote.ilike(search_term)
            )
        )
    
    # Apply sorting
    if sort_field and hasattr(models.BD, sort_field):
        column = getattr(models.BD, sort_field)
        if sort_field == 'numtome':
            # Special handling for numtome to sort as integers
            if sort_order == "desc":
                query = query.order_by(cast(column, Integer).desc())
            else:
                query = query.order_by(cast(column, Integer).asc())
        else:
            # For other fields, handle nulls and empty strings
            if sort_order == "desc":
                query = query.order_by(
                    column.is_(None).desc(),
                    (column == '').desc(),
                    column.desc()
                )
            else:
                query = query.order_by(
                    column.is_(None),
                    (column == ''),
                    column.asc()
                )
    else:
        # Default sorting
        query = query.order_by(
            models.BD.titreserie.is_(None),
            models.BD.titreserie == '',
            models.BD.titreserie.asc(),
            cast(models.BD.numtome, Integer).asc()
        )
    
    return query.offset(skip).limit(limit).all()

# Protected admin routes (require authentication and admin privileges)
@router.get("/admin/stats")
def get_admin_stats(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get administrative statistics."""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    total_bds = db.query(models.BD).count()
    total_membres = db.query(models.Membres).count()
    total_locations = db.query(models.Locations).count()
    active_locations = db.query(models.Locations).filter(models.Locations.fin.is_(None)).count()
    
    return {
        "total_bds": total_bds,
        "total_membres": total_membres,
        "total_locations": total_locations,
        "active_locations": active_locations,
        "admin_user": current_user.username
    }

# Protected admin endpoints for each section
@router.get("/admin/bds/manage")
def admin_manage_bds(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Admin endpoint for BD management."""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    return {"message": "BD management section", "admin": current_user.username}

@router.get("/admin/membres/manage")
def admin_manage_membres(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Admin endpoint for member management."""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    return {"message": "Member management section", "admin": current_user.username}

@router.get("/admin/locations/manage")
def admin_manage_locations(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Admin endpoint for location management."""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    return {"message": "Location management section", "admin": current_user.username}

# Public routes (no authentication required)
# List BDs with pagination, search, and sorting
@router.get("/bds/", response_model=list[schemas.BDBase])
def list_bds(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=100, description="Number of records to return"),
    search: Optional[str] = Query(None, description="Search term for filtering"),
    sort_field: Optional[str] = Query(None, description="Field to sort by"),
    sort_order: Optional[str] = Query("asc", description="Sort order: asc or desc"),
    db: Session = Depends(get_db)
):
    query = db.query(models.BD)
    
    # Apply search filter if provided
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                models.BD.titrealbum.ilike(search_term),
                models.BD.titreserie.ilike(search_term),
                models.BD.scenariste.ilike(search_term),
                models.BD.dessinateur.ilike(search_term),
                models.BD.editeur.ilike(search_term),
                models.BD.collection.ilike(search_term),
                models.BD.genre.ilike(search_term),
                models.BD.cote.ilike(search_term)
            )
        )
    
    # Apply sorting
    if sort_field and hasattr(models.BD, sort_field):
        column = getattr(models.BD, sort_field)
        if sort_field == 'numtome':
            # Special handling for numtome to sort as integers
            if sort_order == "desc":
                query = query.order_by(cast(column, Integer).desc())
            else:
                query = query.order_by(cast(column, Integer).asc())
        else:
            # For other fields, handle nulls and empty strings
            if sort_order == "desc":
                query = query.order_by(
                    column.is_(None).desc(),
                    (column == '').desc(),
                    column.desc()
                )
            else:
                query = query.order_by(
                    column.is_(None),
                    (column == ''),
                    column.asc()
                )
    else:
        # Default sorting
        query = query.order_by(
            models.BD.titreserie.is_(None),
            models.BD.titreserie == '',
            models.BD.titreserie.asc(),
            cast(models.BD.numtome, Integer).asc()
        )
    
    return query.offset(skip).limit(limit).all()

# Get BD statistics and total count
@router.get("/bds/count")
def get_bds_count(
    search: Optional[str] = Query(None, description="Search term for filtering"),
    db: Session = Depends(get_db)
):
    query = db.query(models.BD)
    
    # Apply search filter if provided
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                models.BD.titrealbum.ilike(search_term),
                models.BD.titreserie.ilike(search_term),
                models.BD.scenariste.ilike(search_term),
                models.BD.dessinateur.ilike(search_term),
                models.BD.editeur.ilike(search_term),
                models.BD.collection.ilike(search_term),
                models.BD.genre.ilike(search_term),
                models.BD.cote.ilike(search_term)
            )
        )
    
    total = query.count()
    return {"total": total}

# Get single BD by ID
@router.get("/bds/{bid}", response_model=schemas.BDBase)
def get_bd(bid: str, db: Session = Depends(get_db)):
    bd = db.query(models.BD).filter(models.BD.bid == bid).first()
    if bd is None:
        raise HTTPException(status_code=404, detail="BD not found")
    return bd

# List all Membres
@router.get("/membres/", response_model=list[schemas.MembresBase])
def list_membres(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    return db.query(models.Membres).offset(skip).limit(limit).all()

# Get BD statistics
@router.get("/stats/")
def get_stats(db: Session = Depends(get_db)):
    total_bds = db.query(models.BD).count()
    total_membres = db.query(models.Membres).count()
    total_locations = db.query(models.Locations).count()
    
    return {
        "total_bds": total_bds,
        "total_membres": total_membres,
        "total_locations": total_locations
    }
