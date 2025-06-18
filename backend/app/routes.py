from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from sqlalchemy import or_, cast, Integer
from typing import Optional
from datetime import datetime, timedelta
import re
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
@router.get("/admin/bds/")
def admin_list_bds(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=100, description="Number of records to return"),
    search: Optional[str] = Query(None, description="Search term for filtering"),
    sort_field: Optional[str] = Query(None, description="Field to sort by"),
    sort_order: Optional[str] = Query("asc", description="Sort order: asc or desc"),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Protected admin endpoint for listing BDs with rental status."""
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
    
    bds = query.offset(skip).limit(limit).all()
    
    # Add rental status to each BD
    result = []
    for bd in bds:
        # Check if this BD is currently rented
        active_rental = db.query(models.Locations).filter(
            models.Locations.bid == bd.bid,
            models.Locations.fin.is_(None)
        ).first()
        
        bd_dict = {
            "bid": bd.bid,
            "cote": bd.cote,
            "titreserie": bd.titreserie,
            "titrealbum": bd.titrealbum,
            "numtome": bd.numtome,
            "scenariste": bd.scenariste,
            "dessinateur": bd.dessinateur,
            "collection": bd.collection,
            "editeur": bd.editeur,
            "genre": bd.genre,
            "date_creation": bd.date_creation,
            "date_modification": bd.date_modification,
            "titre_norm": bd.titre_norm,
            "serie_norm": bd.serie_norm,
            "ISBN": bd.ISBN,
            "is_rented": active_rental is not None,
            "rented_by": None
        }
        
        # If rented, add information about who rented it
        if active_rental:
            member = db.query(models.Membres).filter(models.Membres.mid == active_rental.mid).first()
            if member:
                bd_dict["rented_by"] = f"{member.nom} {member.prenom}"
        
        result.append(bd_dict)
    
    return result

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

# Member management routes
@router.get("/admin/membres/")
def get_members_with_rental_count(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    search: Optional[str] = Query(None, description="Search term for member name"),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get members with their active rental count."""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    query = db.query(models.Membres)
    
    # Apply search filter if provided
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                models.Membres.nom.ilike(search_term),
                models.Membres.prenom.ilike(search_term),
                models.Membres.groupe.ilike(search_term)
            )
        )
    
    members = query.offset(skip).limit(limit).all()
    
    # Add rental count to each member
    result = []
    for member in members:
        active_rentals = db.query(models.Locations).filter(
            models.Locations.mid == member.mid,
            models.Locations.fin.is_(None)
        ).count()
        
        member_dict = {
            "mid": member.mid,
            "nom": member.nom,
            "prenom": member.prenom,
            "gsm": member.gsm,
            "rue": member.rue,
            "numero": member.numero,
            "boite": member.boite,
            "codepostal": member.codepostal,
            "ville": member.ville,
            "mail": member.mail,
            "caution": member.caution,
            "remarque": member.remarque,
            "bdpass": member.bdpass,
            "abonnement": member.abonnement,
            "vip": member.vip,
            "IBAN": member.IBAN,
            "groupe": member.groupe,
            "active_rentals": active_rentals
        }
        result.append(member_dict)
    
    return result

@router.get("/admin/membres/count")
def get_members_count(
    search: Optional[str] = Query(None, description="Search term for member name"),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get total count of members."""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    query = db.query(models.Membres)
    
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                models.Membres.nom.ilike(search_term),
                models.Membres.prenom.ilike(search_term),
                models.Membres.groupe.ilike(search_term)
            )
        )
    
    total = query.count()
    return {"total": total}

@router.get("/admin/membres/{member_id}")
def get_member_details(
    member_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get detailed member information."""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    member = db.query(models.Membres).filter(models.Membres.mid == member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    
    return {
        "mid": member.mid,
        "nom": member.nom,
        "prenom": member.prenom,
        "gsm": member.gsm,
        "rue": member.rue,
        "numero": member.numero,
        "boite": member.boite,
        "codepostal": member.codepostal,
        "ville": member.ville,
        "mail": member.mail,
        "caution": member.caution,
        "remarque": member.remarque,
        "bdpass": member.bdpass,
        "abonnement": member.abonnement,
        "vip": member.vip,
        "IBAN": member.IBAN,
        "groupe": member.groupe
    }

@router.put("/admin/membres/{member_id}")
def update_member(
    member_id: int,
    member_data: schemas.MembresCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update member information."""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Validate email format if provided
    if member_data.mail and member_data.mail.strip():
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_pattern, member_data.mail):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Format d'email invalide"
            )
    
    member = db.query(models.Membres).filter(models.Membres.mid == member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    
    # Update member fields
    for field, value in member_data.dict(exclude_unset=True).items():
        if field == 'mail' and value and not value.strip():
            value = None  # Convert empty string to None
        setattr(member, field, value)
    
    db.commit()
    db.refresh(member)
    
    return {
        "mid": member.mid,
        "nom": member.nom,
        "prenom": member.prenom,
        "gsm": member.gsm,
        "rue": member.rue,
        "numero": member.numero,
        "boite": member.boite,
        "codepostal": member.codepostal,
        "ville": member.ville,
        "mail": member.mail,
        "caution": member.caution,
        "remarque": member.remarque,
        "bdpass": member.bdpass,
        "abonnement": member.abonnement,
        "vip": member.vip,
        "IBAN": member.IBAN,
        "groupe": member.groupe
    }

@router.get("/admin/membres/{member_id}/rentals")
def get_member_rentals(
    member_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get member's current rentals."""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    rentals = db.query(models.Locations, models.BD).join(
        models.BD, models.Locations.bid == models.BD.bid
    ).filter(
        models.Locations.mid == member_id,
        models.Locations.fin.is_(None)
    ).all()
    
    result = []
    for location, bd in rentals:
        result.append({
            "lid": location.lid,
            "bid": location.bid,
            "date": location.date,
            "debut": location.debut,
            "bd_info": {
                "bid": bd.bid,
                "cote": bd.cote,
                "titreserie": bd.titreserie,
                "titrealbum": bd.titrealbum,
                "numtome": bd.numtome,
                "scenariste": bd.scenariste,
                "dessinateur": bd.dessinateur
            }
        })
    
    return result

@router.post("/admin/rentals/{rental_id}/return")
def return_book(
    rental_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark a book as returned."""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    rental = db.query(models.Locations).filter(models.Locations.lid == rental_id).first()
    if not rental:
        raise HTTPException(status_code=404, detail="Rental not found")
    
    if rental.fin is not None:
        raise HTTPException(status_code=400, detail="Book already returned")
    
    rental.fin = datetime.utcnow()
    db.commit()
    
    return {"message": "Book returned successfully", "rental_id": rental_id}

@router.post("/admin/membres/{member_id}/rent/{bd_id}")
def rent_book_to_member(
    member_id: int,
    bd_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Rent a book to a member."""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Check if member exists
    member = db.query(models.Membres).filter(models.Membres.mid == member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    
    # Check if BD exists
    bd = db.query(models.BD).filter(models.BD.bid == bd_id).first()
    if not bd:
        raise HTTPException(status_code=404, detail="BD not found")
    
    # Check if book is already rented
    existing_rental = db.query(models.Locations).filter(
        models.Locations.bid == bd_id,
        models.Locations.fin.is_(None)
    ).first()
    
    if existing_rental:
        raise HTTPException(status_code=400, detail="Book is already rented")
    
    # Create new rental
    new_rental = models.Locations(
        bid=bd_id,
        mid=member_id,
        date=datetime.now().date(),
        debut=datetime.utcnow(),
        paye=False,
        mail_rappel_1_envoye=False,
        mail_rappel_2_envoye=False
    )
    
    db.add(new_rental)
    db.commit()
    db.refresh(new_rental)
    
    return {"message": "Book rented successfully", "rental_id": new_rental.lid}

@router.post("/admin/membres/")
def create_member(
    member_data: schemas.MembresCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new member."""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Check if member with same name already exists
    existing_member = db.query(models.Membres).filter(
        models.Membres.nom == member_data.nom,
        models.Membres.prenom == member_data.prenom
    ).first()
    
    if existing_member:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Un membre avec ce nom et prénom existe déjà"
        )
    
    # Validate email format
    if member_data.mail and not re.match(r"[^@]+@[^@]+\.[^@]+", member_data.mail):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Adresse e-mail invalide"
        )
    
    # Create new member
    new_member = models.Membres(
        nom=member_data.nom,
        prenom=member_data.prenom,
        gsm=member_data.gsm,
        rue=member_data.rue,
        numero=member_data.numero,
        boite=member_data.boite,
        codepostal=member_data.codepostal,
        ville=member_data.ville,
        mail=member_data.mail,
        caution=member_data.caution,
        remarque=member_data.remarque,
        bdpass='0',  # Default value
        abonnement=None,  # Will be set later if needed
        vip=False,  # Default value
        IBAN=member_data.IBAN,
        groupe=member_data.groupe
    )
    
    db.add(new_member)
    db.commit()
    db.refresh(new_member)
    
    return {
        "mid": new_member.mid,
        "nom": new_member.nom,
        "prenom": new_member.prenom,
        "gsm": new_member.gsm,
        "rue": new_member.rue,
        "numero": new_member.numero,
        "boite": new_member.boite,
        "codepostal": new_member.codepostal,
        "ville": new_member.ville,
        "mail": new_member.mail,
        "caution": new_member.caution,
        "remarque": new_member.remarque,
        "bdpass": new_member.bdpass,
        "abonnement": new_member.abonnement,
        "vip": new_member.vip,
        "IBAN": new_member.IBAN,
        "groupe": new_member.groupe
    }

@router.get("/admin/membres/{member_id}/rental-history")
def get_member_rental_history(
    member_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get member's rental history with pagination."""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Get total count
    total = db.query(models.Locations).filter(
        models.Locations.mid == member_id
    ).count()
    
    # Get rentals with pagination
    rentals = db.query(models.Locations, models.BD).join(
        models.BD, models.Locations.bid == models.BD.bid
    ).filter(
        models.Locations.mid == member_id
    ).order_by(
        models.Locations.debut.desc()
    ).offset(skip).limit(limit).all()
    
    result = []
    for location, bd in rentals:
        result.append({
            "lid": location.lid,
            "bid": location.bid,
            "date_location": location.date,
            "date_debut": location.debut,
            "date_retour": location.fin,
            "paye": location.paye,
            "bd_info": {
                "bid": bd.bid,
                "cote": bd.cote,
                "titreserie": bd.titreserie,
                "titrealbum": bd.titrealbum,
                "numtome": bd.numtome,
                "scenariste": bd.scenariste,
                "dessinateur": bd.dessinateur
            }
        })
    
    return {
        "rentals": result,
        "total": total
    }
