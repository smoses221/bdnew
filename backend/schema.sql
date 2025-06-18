create table bd
(
    bid               int auto_increment
        primary key,
    cote              varchar(255)                        not null,
    titreserie        varchar(255)                        not null,
    titrealbum        varchar(255)                        null,
    numtome           varchar(20)                         null,
    scenariste        varchar(255)                        not null,
    dessinateur       varchar(255)                        not null,
    collection        varchar(255)                        null,
    editeur           varchar(255)                        null,
    genre             varchar(200)                        null,
    date_creation     timestamp default CURRENT_TIMESTAMP null,
    date_modification timestamp                           null,
    titre_norm        varchar(255)                        null,
    serie_norm        varchar(255)                        null,
    ISBN              int                                 null,
    constraint cote
        unique (cote)
);

create table membres
(
    mid           int auto_increment
        primary key,
    nom           varchar(255)                          not null,
    prenom        varchar(255)                          not null,
    gsm           varchar(15)                           not null,
    rue           varchar(255)                          not null,
    numero        int                                   not null,
    boite         varchar(10)                           null,
    codepostal    int                                   not null,
    ville         varchar(255)                          not null,
    mail          varchar(50)                           null,
    caution       int                                   not null,
    remarque      longtext                              null,
    bdpass        varchar(10) default '0'               not null,
    abonnement    date                                  null,
    vip           tinyint(1)  default 0                 not null,
    IBAN          int                                   null,
    groupe        varchar(255)                          null,
    creation_date timestamp   default CURRENT_TIMESTAMP not null,
    constraint nom
        unique (nom, prenom)
)
    charset = latin1;

create table locations
(
    lid                  int auto_increment
        primary key,
    bid                  int                                  not null,
    mid                  int                                  not null,
    date                 date                                 not null,
    paye                 tinyint(1) default 0                 not null comment 'true si payÃ©, false sinon',
    mail_rappel_1_envoye tinyint(1) default 0                 not null,
    mail_rappel_2_envoye tinyint(1) default 0                 not null,
    debut                timestamp  default CURRENT_TIMESTAMP not null,
    fin                  timestamp                            null,
    constraint fk_bid
        foreign key (bid) references bd (bid),
    constraint fk_mid
        foreign key (mid) references membres (mid)
)
    charset = latin1;

create index mid
    on locations (mid);

create table users
(
    id              int auto_increment
        primary key,
    username        varchar(50)  not null,
    email           varchar(100) not null,
    hashed_password varchar(255) not null,
    is_active       tinyint(1)   null,
    is_admin        tinyint(1)   null,
    created_at      timestamp    null,
    constraint email
        unique (email),
    constraint username
        unique (username)
);

