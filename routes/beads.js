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
  var sql = "SELECT name, type, lotsize, price, name_jp, description, id, id_chronic FROM beads "
          + "ORDER BY CASE WHEN type = 'Process' THEN 1 "
          + "              WHEN type = 'Special' THEN 2 "
          + "              WHEN type = 'Alphabet' THEN 7 "
          + "              WHEN type = 'Number' THEN 8 "
          + "              WHEN type = 'Discontinued' THEN 9 "
          + "              ELSE 5 END, "
          + "type, id, name";

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
  var newBead = {
    name: req.body.name,
    type: req.body.type,
    lotsize: req.body.lotsize,
    price: req.body.price,
    name_jp: req.body.name_jp,
    description: req.body.description,
    id: req.body.id,
    id_chronic: req.body.id_chronic
  };

  var results = [];

  connection.result("UPDATE beads SET type = $1, lotsize = $2, price = $3, name_jp = $4, description = $5, id = $6, id_chronic = $7 WHERE name = $8",
    [newBead.type, newBead.lotsize, newBead.price, newBead.name_jp, newBead.description, newBead.id, newBead.id_chronic, newBead.name])
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
  var sql = "INSERT INTO beads VALUES ($1, $2, $3, $4, $5, $6, $7, $8)";

  var newBead = {
    name: req.body.name,
    type: req.body.type,
    lotsize: req.body.lotsize,
    price: req.body.price,
    name_jp: req.body.name_jp,
    description: req.body.description,
    id: req.body.id,
    id_chronic: req.body.id_chronic
  };

  connection.result(sql, [newBead.name, newBead.type, newBead.lotsize, newBead.price, newBead.name_jp, newBead.description, newBead.id, newBead.id_chronic])
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
  var sql = "DELETE FROM beads WHERE name = $1";
  var delBead = {
    name: req.body.name
  };

  connection.result(sql, [delBead.name])
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
