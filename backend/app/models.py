from sqlalchemy import Column, String, Integer, Date, TIMESTAMP, Text, ForeignKey, Boolean, UniqueConstraint
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    created_at = Column(TIMESTAMP)
    UniqueConstraint("email", name="unique_email")
    UniqueConstraint("username", name="unique_username")

class BD(Base):
    __tablename__ = "bd"
    bid = Column(Integer, primary_key=True, autoincrement=True)
    cote = Column(String(255), unique=True, nullable=False)
    titreserie = Column(String(255), nullable=False)
    titrealbum = Column(String(255))
    numtome = Column(String(20))
    scenariste = Column(String(255), nullable=False)
    dessinateur = Column(String(255), nullable=False)
    collection = Column(String(255))
    editeur = Column(String(255))
    genre = Column(String(200))
    date_creation = Column(TIMESTAMP, default="CURRENT_TIMESTAMP")
    date_modification = Column(TIMESTAMP)
    titre_norm = Column(String(255))
    serie_norm = Column(String(255))
    ISBN = Column(Integer)
    locations = relationship("Locations", back_populates="bd")

class Membres(Base):
    __tablename__ = "membres"
    mid = Column(Integer, primary_key=True, autoincrement=True)
    nom = Column(String(255), nullable=False)
    prenom = Column(String(255), nullable=False)
    gsm = Column(String(15))
    rue = Column(String(255))
    numero = Column(Integer)
    boite = Column(String(10))
    codepostal = Column(Integer)
    ville = Column(String(255))
    mail = Column(String(50))
    caution = Column(Integer, nullable=False)
    remarque = Column(Text)
    bdpass = Column(String(10), default='0', nullable=False)
    abonnement = Column(Date)
    vip = Column(Boolean, default=False, nullable=False)
    IBAN = Column(String(50))
    groupe = Column(String(255))
    locations = relationship("Locations", back_populates="membre")
    UniqueConstraint("nom", "prenom", name="unique_nom_prenom")

class Locations(Base):
    __tablename__ = "locations"
    lid = Column(Integer, nullable=False, primary_key=True, autoincrement=True)
    bid = Column(Integer, ForeignKey("bd.bid"), nullable=False)
    mid = Column(Integer, ForeignKey("membres.mid"), nullable=False)
    date = Column(Date, nullable=False)
    paye = Column(Boolean, default=False, nullable=False)
    mail_rappel_1_envoye = Column(Boolean, default=False, nullable=False)
    mail_rappel_2_envoye = Column(Boolean, default=False, nullable=False)
    debut = Column(TIMESTAMP, default="CURRENT_TIMESTAMP", nullable=False)
    fin = Column(TIMESTAMP)
    bd = relationship("BD", back_populates="locations")
    membre = relationship("Membres", back_populates="locations")
    