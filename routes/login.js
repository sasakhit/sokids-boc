var express = require('express');
var router = express.Router();
var connection = require('./connection');
var pg = require('pg');
var promise = require('bluebird');
var options = {
    promiseLib: promise
};
var pgp = require('pg-promise')(options);

router.get('/', function(req, res) {
    return(res.json(req.session.user));
});

router.post('/', function(req, res) {
  var user = req.body.user;
  var password = req.body.password;

  connection.result("SELECT 1 FROM users WHERE username = $1 AND password = $2", [user, password])
    .then(function (data) {
      if (data.rowCount == 1) {
        req.session.user = user;
      }
    })
    .catch(function (error) {
      console.log("ERROR/post:", error);
    })
    .finally(function () {
      pgp.end();
      res.redirect('.');
    });
});

module.exports = router;
