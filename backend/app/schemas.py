from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime

class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    is_active: bool
    is_admin: bool
    created_at: Optional[datetime]

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class BDBase(BaseModel):
    bid: int
    cote: str
    titreserie: str
    titrealbum: Optional[str] = None
    numtome: Optional[str] = None
    scenariste: str
    dessinateur: str
    collection: Optional[str] = None
    editeur: Optional[str] = None
    genre: Optional[str] = None
    date_creation: Optional[datetime] = None
    date_modification: Optional[datetime] = None
    titre_norm: Optional[str] = None
    serie_norm: Optional[str] = None
    ISBN: Optional[int] = None

class BDCreate(BaseModel):
    cote: str
    titreserie: str
    titrealbum: Optional[str] = None
    numtome: Optional[str] = None
    scenariste: str
    dessinateur: str
    collection: Optional[str] = None
    editeur: Optional[str] = None
    genre: Optional[str] = None
    titre_norm: Optional[str] = None
    serie_norm: Optional[str] = None
    ISBN: Optional[int] = None

class BDResponse(BDBase):
    class Config:
        from_attributes = True

class MembresBase(BaseModel):
    mid: Optional[int] = None
    nom: str
    prenom: str
    gsm: str
    rue: str
    numero: int
    boite: Optional[str] = None
    codepostal: int
    ville: str
    mail: Optional[str] = None
    caution: int
    remarque: Optional[str] = None
    bdpass: str = '0'
    abonnement: Optional[date] = None
    vip: bool = False
    IBAN: Optional[str] = None
    groupe: Optional[str] = None

class MembresCreate(BaseModel):
    nom: str
    prenom: str
    gsm: Optional[str] = None
    rue: Optional[str] = None
    numero: Optional[int] = None
    boite: Optional[str] = None
    codepostal: Optional[int] = None
    ville: Optional[str] = None
    mail: Optional[str] = None
    caution: int
    remarque: Optional[str] = None
    IBAN: Optional[str] = None
    groupe: Optional[str] = None

class MembresResponse(MembresBase):
    mid: int
    class Config:
        from_attributes = True

class MembresWithRentals(MembresResponse):
    active_rentals: int = 0
    
    class Config:
        from_attributes = True

class BDPassBase(BaseModel):
    mid: int
    nblocations: Optional[str]
    date: Optional[date]

class LocationsBase(BaseModel):
    lid: Optional[int] = None
    bid: int
    mid: int
    date: date
    paye: bool = False
    mail_rappel_1_envoye: bool = False
    mail_rappel_2_envoye: bool = False
    debut: datetime
    fin: Optional[datetime] = None

class LocationsCreate(BaseModel):
    bid: int
    mid: int
    date: date
    paye: bool = False
    mail_rappel_1_envoye: bool = False
    mail_rappel_2_envoye: bool = False
    fin: Optional[datetime] = None

class LocationsResponse(LocationsBase):
    lid: int
    class Config:
        from_attributes = True
