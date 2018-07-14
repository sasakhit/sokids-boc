'use strict';
var promise = require('bluebird'); // or any other Promise/A+ compatible library;
var options = {
    promiseLib: promise // overriding the default (ES6 Promise);
};
var pgp = require('pg-promise')(options);

// Database connection details;
//var cn = process.env.DATABASE_URL;

var cn = {
  host: '127.0.0.1',
  port: 5432,
  database: 'boc',
  user: 'postgres',
  password: 'postgres'
};

var db = pgp(cn); // database instance;

module.exports = db;
