DROP TABLE hospitals;
DROP TABLE beads;
DROP TABLE transactions;
--DROP TABLE inventory;
DROP TABLE users;

CREATE TABLE hospitals
     (
     id serial,
     name character varying(100) NOT NULL UNIQUE,
     postal character varying(10),
     address character varying(100),
     phone character varying(50),
     dept character varying(50),
     title character varying(50),
     contact1 character varying(50),
     contact2 character varying(50),
     email character varying(50),
     username character varying(10),
     password character varying(10)
     );

CREATE TABLE beads
     (
     id serial,
     name character varying(100) NOT NULL UNIQUE,
     type character varying(50) NOT NULL,
     lotsize integer,
     price integer,
     name_jp character varying(100),
     description character varying(100),
     refno integer,          -- reference no
     refno_chronic integer,  -- reference no for chronic
     stock_qty integer,      -- Current stock
     unreceived_qty integer,  -- Sent order but unreceived from Beads of Courage
     order_qty integer,      -- Receive order by undelivered to hospitals
     backorder_qty integer   -- Backorder for hospitals
     );

-- ALTER TABLE beads ADD COLUMN refno integer;
-- ALTER TABLE beads ADD COLUMN refno_chronic integer;

CREATE TABLE transactions
     (
     id serial,
     asof date NOT NULL,
     type character varying(30) NOT NULL,
     qty integer NOT NULL,
     bead_id integer NOT NULL,
     hospital_id integer,
     linkid integer,
     timestamp timestamp NOT NULL default CURRENT_TIMESTAMP
     );

CREATE INDEX idx_bead ON transactions (bead_id);
CREATE INDEX idx_hospital ON transactions (hospital_id);

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
