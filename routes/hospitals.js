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
  var sql = "SELECT name, postal, address, phone, dept, title, contact1, contact2, email FROM hospitals ORDER BY postal";

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
  var newHospital = {
    name: req.body.name,
    postal: req.body.postal,
    address: req.body.address,
    phone: req.body.phone,
    dept: req.body.dept,
    title: req.body.title,
    contact1: req.body.contact1,
    contact2: req.body.contact2,
    email: req.body.email
  };

  var results = [];

  connection.result("UPDATE hospitals SET postal = $1, address = $2, phone = $3, dept = $4, title = $5, contact1 = $6, contact2 = $7, email = $8 WHERE name = $9",
    [newHospital.postal, newHospital.address, newHospital.phone, newHospital.dept, newHospital.title, newHospital.contact1, newHospital.contact2, newHospital.email, newHospital.name])
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
  var sql = "INSERT INTO hospitals VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)";
  var newHospital = {
    name: req.body.name,
    postal: req.body.postal,
    address: req.body.address,
    phone: req.body.phone,
    dept: req.body.dept,
    title: req.body.title,
    contact1: req.body.contact1,
    contact2: req.body.contact2,
    email: req.body.email
  };

  connection.result(sql, [newHospital.name, newHospital.postal, newHospital.address, newHospital.phone, newHospital.dept, newHospital.title, newHospital.contact1, newHospital.contact2, newHospital.email])
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
  var sql = "DELETE FROM hospitals WHERE name = $1";
  var delHospital = {
    name: req.body.name
  };

  connection.result(sql, [delHospital.name])
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
