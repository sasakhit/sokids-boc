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
  var sql = "SELECT id, name, postal, address, phone, dept, title, contact1, contact2, email, username, password "
          + "FROM hospitals ORDER BY postal";

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
  var results = [];
  var sql = "UPDATE hospitals SET name = $1, postal = $2, address = $3, phone = $4, dept = $5, title = $6, "
          + "                     contact1 = $7, contact2 = $8, email = $9, username = $10, password = $11 "
          + "WHERE id = $12";
  var updHospital = {
    id: req.body.id,
    name: req.body.name,
    postal: req.body.postal,
    address: req.body.address,
    phone: req.body.phone,
    dept: req.body.dept,
    title: req.body.title,
    contact1: req.body.contact1,
    contact2: req.body.contact2,
    email: req.body.email,
    username: req.body.username,
    password: req.body.password
  };

  connection.result(sql,
    [updHospital.name, updHospital.postal, updHospital.address, updHospital.phone, updHospital.dept, updHospital.title,
     updHospital.contact1, updHospital.contact2, updHospital.email, updHospital.username, updHospital.password, updHospital.id])
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
  var sql = "INSERT INTO hospitals (name, postal, address, phone, dept, title, contact1, contact2, email, username, password) "
          + "VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)";
  var newHospital = {
    name: req.body.name,
    postal: req.body.postal,
    address: req.body.address,
    phone: req.body.phone,
    dept: req.body.dept,
    title: req.body.title,
    contact1: req.body.contact1,
    contact2: req.body.contact2,
    email: req.body.email,
    username: req.body.username,
    password: req.body.password
  };

  connection.result(sql,
    [newHospital.name, newHospital.postal, newHospital.address, newHospital.phone, newHospital.dept, newHospital.title,
     newHospital.contact1, newHospital.contact2, newHospital.email, newHospital.username, newHospital.password])
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
  var sql = "DELETE FROM hospitals WHERE id = $1";
  var delHospital = {
    id: req.body.id
  };

  connection.result(sql, [delHospital.id])
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
