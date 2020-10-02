BEGIN TRANSACTION;
DROP TABLE IF EXISTS adstxt;

CREATE TABLE adstxt(
       SITE_DOMAIN                  TEXT    NOT NULL,
       SITE_RANK                    INTEGER NOT NULL,
       EXCHANGE_DOMAIN              TEXT    NOT NULL,
       SELLER_ACCOUNT_ID            TEXT    NOT NULL,
       ACCOUNT_TYPE                 TEXT    NOT NULL,
       TAG_ID                       TEXT    NOT NULL,
       ENTRY_COMMENT                TEXT    NOT NULL,
       UPDATED                      DATE    DEFAULT (datetime('now','localtime')),
    PRIMARY KEY (SITE_DOMAIN,EXCHANGE_DOMAIN,SELLER_ACCOUNT_ID)
);

DROP TABLE IF EXISTS cleanadstxt;
CREATE TABLE cleanadstxt(
       SITE_DOMAIN                  TEXT    NOT NULL,
       SITE_RANK                    INTEGER NOT NULL,
       ADSYSTEM_DOMAIN              TEXT    NOT NULL,
    PRIMARY KEY (SITE_DOMAIN,ADSYSTEM_DOMAIN)
);

DROP TABLE IF EXISTS adsystem_domain;
CREATE TABLE "adsystem_domain" (
	URL	TEXT UNIQUE,
	ID INTEGER
);


DROP TABLE IF EXISTS adsystem;
CREATE TABLE "adsystem" (
    DOMAIN	TEXT UNIQUE,
	ID INTEGER PRIMARY KEY
);

COMMIT;
