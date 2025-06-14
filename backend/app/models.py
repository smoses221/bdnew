from sqlalchemy import Column, String, Integer, Date, TIMESTAMP, Text, ForeignKey, Boolean
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

class BD(Base):
    __tablename__ = "bd"
    bid = Column(String(255), primary_key=True)
    cote = Column(String(255), unique=True, nullable=False)
    titreserie = Column(String(255))
    titrealbum = Column(String(255))
    numtome = Column(String(20))
    scenariste = Column(String(255), nullable=False)
    dessinateur = Column(String(255), nullable=False)
    collection = Column(String(255))
    editeur = Column(String(255))
    genre = Column(String(200))
    date_creation = Column(TIMESTAMP)
    date_modification = Column(TIMESTAMP)
    titre_norm = Column(String(255))
    serie_norm = Column(String(255))
    locations = relationship("Locations", back_populates="bd")

class Membres(Base):
    __tablename__ = "membres"
    mid = Column(Integer, primary_key=True, autoincrement=True)
    nom = Column(String(255), nullable=False)
    prenom = Column(String(255), nullable=False)
    gsm = Column(String(15), nullable=False)
    rue = Column(String(255), nullable=False)
    numero = Column(Integer, nullable=False)
    boite = Column(String(10))
    codepostal = Column(Integer, nullable=False)
    ville = Column(String(255), nullable=False)
    mail = Column(String(50))
    caution = Column(Integer, nullable=False)
    remarque = Column(Text)
    bdpass = Column(String(10), default='0')
    abonnement = Column(Date)
    vip = Column(Integer, default=0)
    bdpass_rel = relationship("BDPass", back_populates="membre")
    locations = relationship("Locations", back_populates="membre")

class BDPass(Base):
    __tablename__ = "bdpass"
    mid = Column(Integer, ForeignKey("membres.mid"), primary_key=True)
    nblocations = Column(String(255))
    date = Column(Date)
    membre = relationship("Membres", back_populates="bdpass_rel")

class Locations(Base):
    __tablename__ = "locations"
    bid = Column(String(255), ForeignKey("bd.bid"), primary_key=True)
    mid = Column(Integer, ForeignKey("membres.mid"), primary_key=True)
    date = Column(Date, primary_key=True)
    paye = Column(Integer, default=0)
    mail_rappel_1_envoye = Column(Integer, default=0)
    mail_rappel_2_envoye = Column(Integer, default=0)
    debut = Column(TIMESTAMP)
    fin = Column(TIMESTAMP)
    bd = relationship("BD", back_populates="locations")
    membre = relationship("Membres", back_populates="locations")
