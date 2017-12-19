myApp.controller('transactionsController',
  ['$rootScope', '$scope', '$route', '$uibModal', '$log', '$mdDialog', '$cookies', '$filter', 'LoginService', 'DataService', 'TranStatus', 'TranType',
  function($rootScope, $scope, $route, $uibModal, $log, $mdDialog, $cookies, $filter, LoginService, DataService, TranStatus, TranType) {

    LoginService.loginCheck();
    getBeads();
    getHospitals();
    getTransactions();

    function getBeads() {
      DataService.getBeads().then(function(data) {
        $scope.beads = _.uniq(_.map(data, function(bead) {
          return {'id':bead.id, 'name':bead.name, 'stock_qty':bead.stock_qty, 'unreceived_qty':bead.unreceived_qty, 'undelivefred_qty':bead.undelivefred_qty};
        }), 'id');
      });
    }

    function getHospitals() {
      DataService.getHospitals().then(function(data) {
        $scope.hospitals = _.uniq(_.map(data, function(hospital) { return {'id':hospital.id, 'name':hospital.name}; }), 'id');
        $scope.hospitalsForFilter = DataService.getHospitalsForFilterHash($scope.hospitals.concat());

        $scope.$watch('selectedHospital', function(newValue) {
          $rootScope.selectedHospital = newValue;
        })

        if (! $scope.selectedHospital && $rootScope.selectedHospital) {
          $scope.selectedHospital = $rootScope.selectedHospital;
        }

        $scope.hospitalFilter = function(transaction) {
          return DataService.isFilteredByHospital($scope.selectedHospital, transaction.hospital.name);
        };
      });
    }

    function getTransactions() {
      DataService.getTransactions().then(function(data) {
        var rawData = data;
        $scope.transactions = _.map(rawData, function(data) {
          data.hospital = {'id':data.hospital_id, 'name':data.hospital_name};
          data.bead = {'id':data.bead_id, 'name':data.bead_name, 'stock_qty':data.stock_qty, 'unreceived_qty':data.unreceived_qty, 'undelivefred_qty':data.undelivefred_qty};
          data.showButton = TranStatus.showButton(data.status);
          return data;
        })

        var statuses = _.sortBy(_.uniq(_.map(rawData, function(data){ return data.status; })));
        $scope.statusesForFilter = _.filter(statuses, function(status){ return status; });
        $scope.statusesForFilter.unshift('All');

        $scope.$watch('selectedStatus', function(newValue) {
          $rootScope.selectedStatus = newValue;
        })

        if (! $scope.selectedStatus && $rootScope.selectedStatus) {
          $scope.selectedStatus = $rootScope.selectedStatus;
        }

        $scope.statusFilter = function(transaction) {
          if (! $scope.selectedStatus || $scope.selectedStatus == 'All' || $scope.selectedStatus == '') {
            return true;
          } else {
            return transaction.status == $scope.selectedStatus;
          }
        };

      });
    }

    $scope.editTransaction = function(ev, transaction) {
      function dialogController($scope, $mdDialog, beads, hospitals, transaction, link_tran) {
        $scope.beads = beads;
        $scope.hospitals = hospitals;
        $scope.asof = new Date(transaction.asof);
        $scope.type = transaction.type;
        $scope.hospital = transaction.hospital;
        $scope.bead = transaction.bead;
        $scope.qty = transaction.qty;

        $scope.ok = function(asof, hospital, bead, qty) {
          var movement = qty - transaction.qty;
          var is_bead_edit = (bead === transaction.bead) ? false : true;

          if (movement != 0 && is_bead_edit) {
            alert('Cannot edit both bead and qty at the same time!');
            return;
          }

          // For transaction update
          var open_qty = null;
          var status = null;

          // For linked transaction update
          var is_link_tran_update = false;
          var link_open_qty = null;
          var link_status = null;

          // For bead qty update
          var is_bead_update = false;
          var stock_qty = null;
          var unreceived_qty = null;
          var undelivered_qty = null;

          // For bead qty update2 (in case of bead change)
          var is_bead_update2 = false;
          var stock_qty2 = null;
          var unreceived_qty2 = null;
          var undelivered_qty2 = null;

          if (is_bead_edit) {
            // ToDo: Add ORDER_FROM_HOSPITAL and DELIVER_TO_HOSTPITAL
            switch (transaction.type) {
              case TranType.ORDER_TO_SUPPLIER:
                if (transaction.qty != transaction.open_qty) {
                  alert('Cannot edit bead\nThis transaction has linked receive transactions');
                  return;
                } else {
                  unreceived_qty = transaction.bead.unreceived_qty - qty;
                  is_bead_update = true;
                  unreceived_qty2 = bead.unreceived_qty + qty;
                  is_bead_update2 = true;
                }
                break;
              case TranType.RECEIVE_FROM_SUPPLIER:
                alert('Cannot edit bead for receive transaction');
                return;
              default:
                break;
            }
          }

          if (movement != 0) {
            // ToDo: Add ORDER_FROM_HOSPITAL and DELIVER_TO_HOSTPITAL
            switch (transaction.type) {
              case TranType.ORDER_TO_SUPPLIER:
                if (transaction.open_qty + movement < 0) {
                  alert('Cannot edit\nOpen quantity becomes negative');
                  return;
                } else {
                  unreceived_qty = bead.unreceived_qty + movement;
                  if (transaction.open_qty == 0) {
                    open_qty = movement;
                    status = TranStatus.RECEIVE;
                  }
                  is_bead_update = true;
                }
                break;
              case TranType.RECEIVE_FROM_SUPPLIER:
                if (link_tran.open_qty - movement < 0) {
                  alert('Cannot edit!\nOpen quantity of linked order transaction becomes negative');
                  return;
                } else {
                  stock_qty = bead.stock_qty + movement;
                  unreceived_qty = bead.unreceived_qty - movement;
                  link_open_qty = link_tran.open_qty - movement;
                  if (link_open_qty == 0) link_status = TranStatus.DONE;
                  if (link_tran.open_qty == 0) link_status = TranStatus.RECEIVE;
                  is_bead_update = true;
                  is_link_tran_update = true;
                }
                break;
              default:
                break;
            }
          }

          DataService.updateTransaction(transaction.id, $filter('date')(asof, "yyyy/MM/dd"), hospital.id, bead.id, qty, open_qty, status);
          if (is_link_tran_update) {
            DataService.updateTransaction(link_tran.id, null, null, null, null, link_open_qty, link_status);
          }
          if (is_bead_update) {
            DataService.updateBead(transaction.bead_id, null, null, null, null, null, null, null, null, stock_qty, unreceived_qty, undelivered_qty);
          }
          if (is_bead_update2) {
            DataService.updateBead(bead.id, null, null, null, null, null, null, null, null, stock_qty2, unreceived_qty2, undelivered_qty2);
          }
          $mdDialog.hide();
        }

        $scope.cancel = function() {
          $mdDialog.hide();
        }

        $scope.delete = function() {
          if (confirm('Is it ok to delete this transaction?')) {
            // For linked transaction update
            var is_link_tran_update = false;
            var link_open_qty = null;
            var link_status = null;

            // For bead qty update
            var is_bead_update = false;
            var stock_qty = null;
            var unreceived_qty = null;
            var undelivered_qty = null;

            // ToDo: Add ORDER_FROM_HOSPITAL and DELIVER_TO_HOSTPITAL
            switch (transaction.type) {
              case TranType.ORDER_TO_SUPPLIER:
                if (transaction.qty != transaction.open_qty) {
                  alert('Cannot delete\nThis transaction has linked receive transactions');
                  return;
                } else {
                  unreceived_qty = transaction.bead.unreceived_qty - transaction.qty;
                  is_bead_update = true;
                }
                break;
              case TranType.RECEIVE_FROM_SUPPLIER:
                stock_qty = transaction.bead.stock_qty - transaction.qty;
                unreceived_qty = transaction.bead.unreceived_qty + transaction.qty;
                link_open_qty = link_tran.open_qty + transaction.qty;
                if (link_tran.open_qty == 0) link_status = TranStatus.RECEIVE;
                is_bead_update = true;
                is_link_tran_update = true;
                break;
              default:
                break;
            }

            DataService.deleteTransaction(transaction.id);
            if (is_link_tran_update) {
              DataService.updateTransaction(link_tran.id, null, null, null, null, link_open_qty, link_status);
            }
            if (is_bead_update) {
              DataService.updateBead(transaction.bead_id, null, null, null, null, null, null, null, null, stock_qty, unreceived_qty, undelivered_qty);
            }
            $mdDialog.hide();
          }
        }
      }

      $mdDialog.show({
        controller: dialogController,
        targetEvent: ev,
        ariaLabel:  'Edit Transaction',
        clickOutsideToClose: true,
        templateUrl: 'views/templates/editTransaction.html',
        onComplete: afterShowAnimation,
        size: 'large',
        bindToController: true,
        autoWrap: false,
        parent: angular.element(document.body),
        preserveScope: true,
        locals: {
          beads: $scope.beads,
          hospitals: $scope.hospitals,
          transaction: transaction,
          link_tran: _.filter($scope.transactions, function(link_tran) { return link_tran.id == transaction.linkid; })[0]
        }
      });

      function afterShowAnimation(scope, element, options) {
       // post-show code here: DOM element focus, etc.
      }
    }

    $scope.receiveBead = function(ev, transaction) {
      function dialogController($scope, $mdDialog, bead, selectedAsof, transaction) {
        $scope.selectedBead = transaction.bead_name;
        $scope.lotsize = transaction.bead_lotsize;
        $scope.asof = (selectedAsof) ? new Date(selectedAsof) : new Date();

        $scope.ok = function(asof, qty) {
          if (qty > transaction.open_qty) {
            alert('Receive quantity should be <= Open quantity');
          } else {
            $cookies.put('asofRecv', asof);
            var type = TranType.RECEIVE_FROM_SUPPLIER;
            var hospital_id = 0;
            var status = TranType.getTranStatus(type);
            DataService.insertTransaction($filter('date')(asof, "yyyy/MM/dd"), type, 0, transaction.bead_id, qty, null, status, transaction.id);

            var open_qty = transaction.open_qty - qty;
            status = (open_qty == 0) ? TranStatus.DONE : null;
            DataService.updateTransaction(transaction.id, null, null, null, null, open_qty, status);

            //var bead = _.filter(beads, function(bead) { return bead.id == transaction.bead_id; })[0];
            var stock_qty = bead.stock_qty + qty;
            var unreceived_qty = bead.unreceived_qty - qty;
            DataService.updateBead(transaction.bead_id, null, null, null, null, null, null, null, null, stock_qty, unreceived_qty, null);
            $mdDialog.hide();
          }
        }

        $scope.cancel = function() {
          $mdDialog.hide();
        }
      }

      $mdDialog.show({
        controller: dialogController,
        targetEvent: ev,
        ariaLabel:  'Receive Bead',
        clickOutsideToClose: true,
        templateUrl: 'views/templates/recvBead.html',
        onComplete: afterShowAnimation,
        size: 'large',
        bindToController: true,
        autoWrap: false,
        parent: angular.element(document.body),
        preserveScope: true,
        locals: {
          bead: _.filter($scope.beads, function(bead) { return bead.id == transaction.bead_id; })[0],
          selectedAsof: $cookies.get('asofRecv'),
          transaction: transaction
        }
      });

      function afterShowAnimation(scope, element, options) {
         // post-show code here: DOM element focus, etc.
      }
    }

  }
]);
