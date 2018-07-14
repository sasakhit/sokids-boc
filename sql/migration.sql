-- backup
select * into hospitals_backup from hospitals;
select * into beads_backup from beads;
select * into inventory_backup from inventory;

-- drop table
drop table hospitals;
drop table beads;
drop table inventory;

-- create table
CREATE TABLE hospitals
     (
     id serial,
     name character varying(100) NOT NULL,
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
     name character varying(100) NOT NULL,
     type character varying(50) NOT NULL,
     lotsize integer,
     price integer,
     name_jp character varying(100),
     description character varying(100),
     refno integer,            -- reference no
     lotsize_hospital integer,
     stock_qty integer,        -- Current stock
     unreceived_qty integer,   -- Sent order but unreceived from Beads of Courage
     undelivered_qty integer,  -- Receive order by undelivered to hospitals
     description_chronic character varying(100)
     );

CREATE TABLE transactions
     (
     id serial,
     asof date NOT NULL,
     type character varying(30) NOT NULL,
     qty integer NOT NULL,
     open_qty integer,       -- decrease open_qty if received/delivered
     bead_id integer NOT NULL,
     hospital_id integer,
     linkid integer,
     status character varying(10),
     timestamp timestamp NOT NULL default CURRENT_TIMESTAMP,
     comment character varying(100),
     comment_hospital character varying(100)
     );

CREATE INDEX idx_bead ON transactions (bead_id);
CREATE INDEX idx_hospital ON transactions (hospital_id);
CREATE INDEX idx_status ON transactions (status);

-- hospital migration
INSERT INTO hospitals (name, postal, address, phone, dept, title, contact1, contact2, email)
select name, postal, address, phone, dept, title, contact1, contact2, email
from hospitals_backup
order by postal;

-- beads migration
INSERT INTO beads (name, type, lotsize, price, name_jp, description)
select name, type, lotsize, price, name_jp, description
from beads_backup
ORDER BY CASE WHEN type = 'Process' THEN 1
              WHEN type = 'Special' THEN 2
              WHEN type = 'Alphabet' THEN 7
              WHEN type = 'Number' THEN 8
              WHEN type = 'Discontinued' THEN 9
              ELSE 5 END,
          type, name;

update beads set lotsize_hospital = 1;
update beads set lotsize_hospital = 100 where type = 'Process';
update beads set lotsize_hospital = 10 where type = 'Special';
update beads set lotsize_hospital = 30 where name = 'Bumpy Bead';


-- inventory (transaction) migration
SELECT
  i.name,
  SUM(CASE WHEN i.party = 'Order' OR i.comment like 'B/O%' THEN 0 ELSE i.qty END) stock_qty,
  SUM(CASE WHEN i.party = 'Order' THEN i.qty WHEN i.party = 'Receive' THEN -1 * i.qty ELSE 0 END) unreceived_qty,
  SUM(CASE WHEN i.comment like 'B/O%' THEN -1 * i.qty WHEN i.comment = 'Deliver for B/O' THEN i.qty ELSE 0 END) undelivered_qty
INTO TEMP tmp_inventory
FROM inventory_backup i
GROUP BY i.name;

UPDATE beads b
SET stock_qty = i.stock_qty, unreceived_qty = i.unreceived_qty, undelivered_qty = i.undelivered_qty
FROM tmp_inventory i
WHERE i.name = b.name;

DROP TABLE tmp_inventory;

INSERT INTO transactions (asof, type, qty, open_qty, bead_id, hospital_id, linkid, status)
SELECT
  i.asof,
  CASE WHEN i.party = 'Initialize' THEN 'INITIALIZE'
       WHEN i.party = 'Order' THEN 'ORDER_TO_SUPPLIER'
       WHEN i.party = 'Receive' THEN 'RECEIVE_FROM_SUPPLIER'
       WHEN i.comment = 'B/O' THEN 'ORDER_FROM_HOSPITAL'
       WHEN i.comment = 'Deliver for B/O' THEN 'DELIVER_TO_HOSPITAL'
       ELSE 'DELIVER_TO_HOSPITAL' END,
  abs(qty),
  CASE WHEN i.comment = 'B/O' THEN abs(qty) ELSE null END, -- open_qty
  b.id,
  h.id,
  NULL, -- linkid
  CASE WHEN i.comment = 'B/O' THEN 'DELIVER' ELSE 'DONE' END -- status
FROM ( inventory_backup i INNER JOIN beads b ON i.name = b.name )
  LEFT OUTER JOIN hospitals h ON i.party = h.name;
