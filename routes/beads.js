var express = require('express');
var router = express.Router();
var connection = require('./connection');
var pg = require('pg');
var promise = require('bluebird');
var options = {
    promiseLib: promise
};
var pgp = require('pg-promise')(options);

router.get('/',  function(req, res) {

  var results = [];
  var sql = "SELECT id, name, type, lotsize, price, name_jp, description, refno, refno_chronic, stock_qty, unreceived_qty, order_qty, backorder_qty FROM beads "
          + "ORDER BY CASE WHEN type = 'Process' THEN 1 "
          + "              WHEN type = 'Special' THEN 2 "
          + "              WHEN type = 'Alphabet' THEN 7 "
          + "              WHEN type = 'Number' THEN 8 "
          + "              WHEN type = 'Discontinued' THEN 9 "
          + "              ELSE 5 END, "
          + "type, refno, name";

  connection.result(sql)
    .then(function (data) {
      results = data.rows;
    })
    .catch(function (error) {
      console.log("ERROR/get:", error);
    })
    .finally(function () {
      pgp.end();
      return res.json(results);
    });
});

router.put('/',  function(req, res) {
  var updBead = {
    id: req.body.id,
    name: req.body.name,
    type: req.body.type,
    lotsize: req.body.lotsize,
    price: req.body.price,
    name_jp: req.body.name_jp,
    description: req.body.description,
    refno: req.body.refno,
    refno_chronic: req.body.refno_chronic
  };

  var results = [];

  connection.result("UPDATE beads SET name = $1, type = $2, lotsize = $3, price = $4, name_jp = $5, description = $6, refno = $7, refno_chronic = $8 WHERE id = $9",
    [updBead.name, updBead.type, updBead.lotsize, updBead.price, updBead.name_jp, updBead.description, updBead.refno, updBead.refno_chronic, updBead.id])
      .then(function (data) {
      })
      .catch(function (error) {
        console.log("ERROR/put:", error);
        res.send(false);
      })
      .finally(function () {
        pgp.end();
        res.send(true);
      });
});

router.post('/',  function(req, res) {
  var results = [];
  var sql = "INSERT INTO beads (name, type, lotsize, price, name_jp, description, refno, refno_chronic) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)";

  var newBead = {
    name: req.body.name,
    type: req.body.type,
    lotsize: req.body.lotsize,
    price: req.body.price,
    name_jp: req.body.name_jp,
    description: req.body.description,
    refno: req.body.refno,
    refno_chronic: req.body.refno_chronic
  };

  connection.result(sql, [newBead.name, newBead.type, newBead.lotsize, newBead.price, newBead.name_jp, newBead.description, newBead.refno, newBead.refno_chronic])
    .then(function (data) {
    })
    .catch(function (error) {
      console.log("ERROR/post:", error);
      res.send(false);
    })
    .finally(function () {
      pgp.end();
      res.send(true);
    });
});

router.put('/delete',  function(req, res) {
  var results = [];
  var sql = "DELETE FROM beads WHERE id = $1";
  var delBead = {
    id: req.body.id
  };

  connection.result(sql, [delBead.id])
    .then(function (data) {
    })
    .catch(function (error) {
      console.log("ERROR/put/delete:", error);
      res.send(false);
    })
    .finally(function () {
      pgp.end();
      res.send(true);
    });
});

module.exports = router;
