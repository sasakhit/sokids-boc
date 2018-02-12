var express = require('express');
var moment = require('moment');
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
  var hospital_id = req.query.hospital_id;
  var sql = "SELECT t.id, to_char(t.asof, 'YYYY/MM/DD') asof, t.type, t.qty, t.open_qty, "
          + "       b.id bead_id, b.name bead_name, b.name_jp bead_name_jp, b.type bead_type, b.refno bead_refno, "
          + "       b.lotsize bead_lotsize, b.lotsize_hospital bead_lotsize_hospital, b.stock_qty, b.unreceived_qty, b.undelivered_qty, "
          + "       h.id hospital_id, h.name hospital_name, t.linkid, t.status, t.comment, t.comment_hospital "
          + "FROM ( transactions t LEFT OUTER JOIN beads b ON t.bead_id = b.id ) "
          + "                      LEFT OUTER JOIN hospitals h ON t.hospital_id = h.id "
          + "WHERE t.hospital_id = COALESCE($1, t.hospital_id)"
          + "ORDER BY t.asof DESC, h.name ASC, t.timestamp DESC";
  
  connection.result(sql, [hospital_id])
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

router.post('/',  function(req, res) {
  var results = [];
  var sql = "INSERT INTO transactions (asof, type, hospital_id, bead_id, qty, open_qty, status, comment, comment_hospital, linkid) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)"
  var newTransaction = {
    asof: req.body.asof,
    type: req.body.type,
    hospital_id: req.body.hospital_id,
    bead_id: req.body.bead_id,
    qty: req.body.qty,
    open_qty: req.body.open_qty,
    status: req.body.status,
    comment: req.body.comment,
    comment_hospital: req.body.comment_hospital,
    linkid: req.body.linkid
  };

  connection.result(sql, [newTransaction.asof, newTransaction.type, newTransaction.hospital_id, newTransaction.bead_id,
                          newTransaction.qty, newTransaction.open_qty, newTransaction.status, newTransaction.comment, newTransaction.comment_hospital, newTransaction.linkid])
    .then(function (data) {
    })
    .catch(function (error) {
      console.log("ERROR/post:", error)
      res.send(false);
    })
    .finally(function () {
      pgp.end();
      res.send(true);
    });
});

router.put('/update',  function(req, res) {
  var results = [];
  var sql = "UPDATE transactions "
          + "SET asof = COALESCE($1, asof), "
          + "    hospital_id = COALESCE($2, hospital_id), "
          + "    bead_id = COALESCE($3, bead_id), "
          + "    qty = COALESCE($4, qty), "
          + "    open_qty = COALESCE($5, open_qty), "
          + "    status = COALESCE($6, status), "
          + "    comment = COALESCE($7, comment), "
          + "    comment_hospital = COALESCE($8, comment_hospital) "
          + "WHERE id = $9";
  var updTransaction = {
    asof: req.body.asof,
    hospital_id: req.body.hospital_id,
    bead_id: req.body.bead_id,
    qty: req.body.qty,
    open_qty: req.body.open_qty,
    status: req.body.status,
    comment: req.body.comment,
    comment_hospital: req.body.comment_hospital,
    id: req.body.id
  };

  connection.result(sql, [updTransaction.asof, updTransaction.hospital_id, updTransaction.bead_id,
                          updTransaction.qty, updTransaction.open_qty, updTransaction.status, updTransaction.comment, updTransaction.comment_hospital, updTransaction.id])
    .then(function (data) {
    })
    .catch(function (error) {
      console.log("ERROR/put/update:", error);
      res.send(false);
    })
    .finally(function () {
      pgp.end();
      res.send(true);
    });
});

router.put('/delete',  function(req, res) {
  var results = [];
  var sql = "DELETE FROM transactions WHERE id = $1";
  var delTransaction = {
    id: req.body.id
  };

  connection.result(sql, [delTransaction.id])
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
