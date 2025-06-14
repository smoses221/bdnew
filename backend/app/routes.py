from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, cast, Integer
from typing import Optional
from . import models, schemas
from .database import SessionLocal

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

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
                    column == '',
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
