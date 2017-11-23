drop table hospitals;
drop table beads;
drop table inventory;

CREATE TABLE hospitals
     (
     name character varying(100) NOT NULL UNIQUE,
     postal character varying(10),
     address character varying(100),
     phone character varying(50),
     dept character varying(50),
     title character varying(50),
     contact1 character varying(50),
     contact2 character varying(50),
     email character varying(50)
     );

CREATE TABLE beads
     (
     name character varying(100) NOT NULL UNIQUE,
     type character varying(50) NOT NULL,
     lotsize integer,
     price integer,
     name_jp character varying(100),
     description character varying(100)
     );

ALTER TABLE beads ADD COLUMN id integer;
ALTER TABLE beads ADD COLUMN id_chronic integer;

CREATE TABLE inventory
     (
     id serial,
     asof date NOT NULL,
     name character varying(100) NOT NULL,
     qty integer NOT NULL,
     party character varying(100) NOT NULL,
     timestamp timestamp NOT NULL default CURRENT_TIMESTAMP
     );

ALTER TABLE inventory ADD COLUMN comment character varying(20);
ALTER TABLE inventory ADD COLUMN linkid integer;

CREATE TABLE users
     (
     username character varying(10) NOT NULL,
     password character varying(10) NOT NULL
     );
