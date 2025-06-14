from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime

class BDBase(BaseModel):
    bid: str
    cote: str
    titreserie: Optional[str]
    titrealbum: Optional[str]
    numtome: Optional[str]
    scenariste: str
    dessinateur: str
    collection: Optional[str]
    editeur: Optional[str]
    genre: Optional[str]
    date_creation: Optional[datetime]
    date_modification: Optional[datetime]
    titre_norm: Optional[str]
    serie_norm: Optional[str]

class MembresBase(BaseModel):
    mid: Optional[int]
    nom: str
    prenom: str
    gsm: str
    rue: str
    numero: int
    boite: Optional[str]
    codepostal: int
    ville: str
    mail: Optional[str]
    caution: int
    remarque: Optional[str]
    bdpass: Optional[str]
    abonnement: Optional[date]
    vip: Optional[int]

class BDPassBase(BaseModel):
    mid: int
    nblocations: Optional[str]
    date: Optional[date]

class LocationsBase(BaseModel):
    bid: str
    mid: int
    date: date
    paye: Optional[int]
    mail_rappel_1_envoye: Optional[int]
    mail_rappel_2_envoye: Optional[int]
    debut: Optional[datetime]
    fin: Optional[datetime]
