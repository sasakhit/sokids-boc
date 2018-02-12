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
  var username = req.body.username;
  var password = req.body.password;

  var sql = "SELECT username, TRUE isadmin FROM users WHERE username = $1 AND password = $2 "
          + "UNION "
          + "SELECT username, FALSE isadmin FROM hospitals WHERE username = $1 AND password = $2 "

  connection.result(sql, [username, password])
    .then(function (data) {
      if (data.rowCount === 1) {
        //req.session.user = user;
        //req.session.isAdmin = data.rows[0].isAdmin;
        //req.session.user = {username: username, isAdmin: data[0].isAdmin};
        req.session.user = data.rows[0];
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
