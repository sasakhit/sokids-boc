myApp.factory('DataService',
    ['$http', '$mdDialog', '$q', '$route',
    function($http, $mdDialog, $q, $route) {

      return {
        getInventorySummary : getInventorySummary,
        getInventoryOrders : getInventoryOrders,
        getInventoryDetails : getInventoryDetails,
        getBeads : getBeads,
        getTypesForFilter : getTypesForFilter,
        getHospitals : getHospitals,
        getParties : getParties,
        getHospitalsForFilter : getHospitalsForFilter,
        isFilteredByHospital : isFilteredByHospital,
        getBracketType : getBracketType,
        getTotalType : getTotalType,
        insertInventory : insertInventory,
        updateInventory : updateInventory,
        deleteInventory : deleteInventory,
        insertBead : insertBead,
        updateBead : updateBead,
        deleteBead : deleteBead,
        insertHospital : insertHospital,
        updateHospital : updateHospital,
        deleteHospital : deleteHospital
      };

      function getInventorySummary() {
        return $http.get('/dashboard/summary').then(function(response) {
          return response.data;
        });
      }

      function getInventoryOrders() {
        return $http.get('/dashboard/orders').then(function(response) {
          return response.data;
        });
      }

      function getInventoryDetails() {
        return $http.get('/dashboard/details').then(function(response) {
          return response.data;
        });
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

      function isFilteredByHospital(selectedHospital, hospital) {
        if (! selectedHospital || selectedHospital == 'All' || selectedHospital == '') {
          return true;
        } else {
          return hospital == selectedHospital;
        }
      }

      function isFilteredByType(selectedType, type) {
        if (! selectedType || selectedType == "All" || selectedType == "") {
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

      function insertInventory(inv, asof, name, qty, party, comment = null, linkid = null) {
        var deferred = $q.defer();

        $http.post('/dashboard', {asof: asof, name: name, qty: qty, party: party, comment: comment, linkid: linkid})
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

      function updateInventory(inv, asof, name, qty, party, comment) {
        var id = inv.id;
        var deferred = $q.defer();

        $http.put('/dashboard', {id:id, asof:asof, name:name, qty:qty, party:party, comment:comment})
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

      function deleteInventory(inv) {
        var id = inv.id;
        var deferred = $q.defer();

        $http.put('/dashboard/delete', {id: id})
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

      function insertBead(name, type, lotsize, price, name_jp, description, refno, refno_chronic) {
        var deferred = $q.defer();

        $http.post('/beads', {name:name, type:type, lotsize:lotsize, price:price, name_jp:name_jp, description:description, refno:refno, refno_chronic:refno_chronic})
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

      function updateBead(id, name, type, lotsize, price, name_jp, description, refno, refno_chronic) {
        var deferred = $q.defer();

        $http.put('/beads', {id:id, name:name, type:type, lotsize:lotsize, price:price, name_jp:name_jp, description:description, refno:refno, refno_chronic:refno_chronic})
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

      function insertHospital(name, postal, address, phone, dept, title, contact1, contact2, email) {
        var deferred = $q.defer();

        $http.post('/hospitals', {name:name, postal:postal, address:address, phone:phone, dept:dept, title:title, contact1:contact1, contact2:contact2, email:email})
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

      function updateHospital(name, postal, address, phone, dept, title, contact1, contact2, email) {
        var deferred = $q.defer();

        $http.put('/hospitals', {name:name, postal:postal, address:address, phone:phone, dept:dept, title:title, contact1:contact1, contact2:contact2, email:email})
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

      function deleteHospital(name) {
        var deferred = $q.defer();

        $http.put('/hospitals/delete', {name: name})
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
