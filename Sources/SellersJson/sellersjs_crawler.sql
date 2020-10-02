BEGIN TRANSACTION;
DROP TABLE IF EXISTS ACTORS;

CREATE TABLE ACTORS(
       DOMAIN                       TEXT    NOT NULL,
       TYPE                         INTEGER NOT NULL,
       UPDATED                      DATE    DEFAULT (datetime('now','localtime')),
    PRIMARY KEY (DOMAIN)
);

DROP TABLE IF EXISTS RELATION;
CREATE TABLE RELATION(
       ACTOR_FROM                    INTEGER NOT NULL,
       ACTOR_TO                      INTEGER NOT NULL,
    PRIMARY KEY (ACTOR_FROM,ACTOR_TO)
);



COMMIT;
