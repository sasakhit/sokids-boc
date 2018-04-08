myApp.factory('DataService',
    ['$http', '$mdDialog', '$q', '$route',
    function($http, $mdDialog, $q, $route) {

      return {
        getTransactions : getTransactions,
        insertTransaction : insertTransaction,
        updateTransaction : updateTransaction,
        deleteTransaction : deleteTransaction,
        getBeads : getBeads,
        getTypesForFilter : getTypesForFilter,
        getTypesForFilterInJapanese : getTypesForFilterInJapanese,
        getHospitals : getHospitals,
        getParties : getParties,
        getHospitalsForFilter : getHospitalsForFilter,
        getHospitalsForFilterHash : getHospitalsForFilterHash,
        isFilteredByHospital : isFilteredByHospital,
        isFilteredByType : isFilteredByType,
        getBracketType : getBracketType,
        getTotalType : getTotalType,
        insertBead : insertBead,
        updateBead : updateBead,
        deleteBead : deleteBead,
        insertHospital : insertHospital,
        updateHospital : updateHospital,
        deleteHospital : deleteHospital
      };

      function getTransactions(hospital_id = null) {
        return $http.get('/transactions', {params: {hospital_id:hospital_id}}).then(function(response) {
          return response.data;
        });
      }

      function insertTransaction(asof, type, hospital_id, bead_id, qty, open_qty, status, comment = null, comment_hospital = null, linkid = null) {
        var deferred = $q.defer();

        $http.post('/transactions', {asof:asof, type:type, hospital_id:hospital_id, bead_id:bead_id, qty:qty, open_qty:open_qty,
                                     status:status, comment:comment, comment_hospital:comment_hospital, linkid:linkid})
          .success(function (data, status) {
            if(status === 200 ){
              deferred.resolve();
            } else {
              deferred.reject();
            }
          })
          .error(function (data) {
            deferred.reject();
          })
          .finally(function () {
            $route.reload();
          });

        return deferred.promise;
      }

      function updateTransaction(id, asof, hospital_id, bead_id, qty, open_qty = null, status = null, comment = null, comment_hospital = null) {
        var deferred = $q.defer();

        $http.put('/transactions/update', {id:id, asof:asof, hospital_id:hospital_id, bead_id:bead_id, qty:qty, open_qty:open_qty,
                                           status:status, comment:comment, comment_hospital:comment_hospital})
          .success(function (data, status) {
            if(status === 200 ){
              deferred.resolve();
            } else {
              deferred.reject();
            }
          })
          .error(function (data) {
            deferred.reject();
          })
          .finally(function () {
            $route.reload();
          });

        return deferred.promise;
      }

      function deleteTransaction(id) {
        var deferred = $q.defer();

        $http.put('/transactions/delete', {id: id})
          .success(function (data, status) {
            if(status === 200 ){
              deferred.resolve();
            } else {
              deferred.reject();
            }
          })
          .error(function (data) {
            deferred.reject();
          })
          .finally(function () {
            $route.reload();
          });

        return deferred.promise;
      }

      function getBeads() {
        return $http.get('/beads').then(function(response) {
          return response.data;
        });
      }

      function getTypesForFilter(types) {
        types.unshift('All');
        return types;
      }

      function getTypesForFilterInJapanese(types) {
        types.unshift('すべて');
        return types;
      }

      function getHospitals() {
        return $http.get('/hospitals').then(function(response) {
          return response.data;
        });
      }

      function getParties(hospitals) {
        for (var party of ['Receive', 'Order']) {
          hospitals.unshift(party);
        }
        return hospitals;
      }

      function getHospitalsForFilter(hospitals) {
        for (var party of ['Receive', 'Order', 'All']) {
          hospitals.unshift(party);
        }
        return hospitals;
      }

      function getHospitalsForFilterHash(hospitals) {
        for (var hospital of [{'id':0, 'name':'BOC', 'postal':'', 'address':''}, {'id':-1, 'name':'All', 'postal':'', 'address':''}]) {
          hospitals.unshift(hospital);
        }
        return hospitals;
      }

      function isFilteredByHospital(selectedHospital, hospital) {
        if (! selectedHospital || selectedHospital == 'All' || selectedHospital == 'すべて' || selectedHospital == '') {
          return true;
        } else {
          return hospital.name == selectedHospital;
        }
      }

      function isFilteredByType(selectedType, type) {
        if (! selectedType || selectedType == "All" || selectedType == "すべて" || selectedType == "") {
          return true;
        } else {
          return type == selectedType;
        }
      };

      function getBracketType(comment, party) {
        return (comment.substr(0,3) == 'B/O') ? 'square' : (party == 'Order') ? 'round' : 'none';
      }

      function getTotalType(comment, party) {
        if (comment == 'Deliver for B/O') {
          return '-backorder_total';
        }
        else {
          switch (party) {
            case 'Order':
              return 'unreceived_total';
            case 'Receive':
              return '-unreceived_total';
            default:
              return 'total';
          }
        }
      }

      function insertBead(name, type, lotsize, price, name_jp, description, refno, lotsize_hospital, description_en) {
        var deferred = $q.defer();

        $http.post('/beads', {name:name, type:type, lotsize:lotsize, price:price, name_jp:name_jp, description:description, refno:refno, lotsize_hospital:lotsize_hospital, description_en:description_en})
          .success(function (data, status) {
            if (status === 200 ) {
              deferred.resolve();
            } else {
              deferred.reject();
            }
          })
          .error(function (data) {
            deferred.reject();
          })
          .finally(function () {
            $route.reload();
          });

        return deferred.promise;
      }

      function updateBead(id, name, type, lotsize, price, name_jp, description, refno, lotsize_hospital, description_en, stock_qty = null, unreceived_qty = null, undelivered_qty = null) {
        var deferred = $q.defer();

        $http.put('/beads', {id:id, name:name, type:type, lotsize:lotsize, price:price, name_jp:name_jp, description:description,
                             refno:refno, lotsize_hospital:lotsize_hospital, description_en:description_en, stock_qty:stock_qty, unreceived_qty:unreceived_qty, undelivered_qty:undelivered_qty})
          .success(function (data, status) {
            if (status === 200 ) {
              deferred.resolve();
            } else {
              deferred.reject();
            }
          })
          .error(function (data) {
            deferred.reject();
          })
          .finally(function () {
            $route.reload();
          });

        return deferred.promise;
      }

      function deleteBead(id) {
        var deferred = $q.defer();

        $http.put('/beads/delete', {id: id})
          .success(function (data, status) {
            if (status === 200 ) {
              deferred.resolve();
            } else {
              deferred.reject();
            }
          })
          .error(function (data) {
            deferred.reject();
          })
          .finally(function () {
            $route.reload();
          });

        return deferred.promise;
      }

      function insertHospital(name, postal, address, phone, dept, title, contact1, contact2, email, username, password) {
        var deferred = $q.defer();

        $http.post('/hospitals', {name:name, postal:postal, address:address, phone:phone, dept:dept, title:title, contact1:contact1, contact2:contact2, email:email, username:username, password:password})
          .success(function (data, status) {
            if(status === 200 ){
              deferred.resolve();
            } else {
              deferred.reject();
            }
          })
          .error(function (data) {
            deferred.reject();
          })
          .finally(function () {
            $route.reload();
          });

        return deferred.promise;
      }

      function updateHospital(id, name, postal, address, phone, dept, title, contact1, contact2, email, username, password) {
        var deferred = $q.defer();

        $http.put('/hospitals', {id:id, name:name, postal:postal, address:address, phone:phone, dept:dept, title:title, contact1:contact1, contact2:contact2, email:email, username:username, password:password})
          .success(function (data, status) {
            if(status === 200 ){
              deferred.resolve();
            } else {
              deferred.reject();
            }
          })
          .error(function (data) {
            deferred.reject();
          })
          .finally(function () {
            $route.reload();
          });

        return deferred.promise;
      }

      function deleteHospital(id) {
        var deferred = $q.defer();

        $http.put('/hospitals/delete', {id: id})
          .success(function (data, status) {
            if(status === 200 ){
              deferred.resolve();
            } else {
              deferred.reject();
            }
          })
          .error(function (data) {
            deferred.reject();
          })
          .finally(function () {
            $route.reload();
          });

        return deferred.promise;
      }

    }
]);
