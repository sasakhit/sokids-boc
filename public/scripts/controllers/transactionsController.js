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
          return {'id':bead.id, 'name':bead.name, 'stock_qty':bead.stock_qty, 'unreceived_qty':bead.unreceived_qty, 'undelivered_qty':bead.undelivered_qty};
        }), 'id');
      });
    }

    function getHospitals() {
      DataService.getHospitals().then(function(data) {
        $scope.hospitals = _.uniq(_.map(data, function(hospital) { return {'id':hospital.id, 'name':hospital.name, 'postal':hospital.postal, 'address':hospital.address}; }), 'id');
        $scope.hospitalsForFilter = DataService.getHospitalsForFilterHash($scope.hospitals.concat());

        $scope.$watch('selectedHospital', function(newValue) {
          $rootScope.selectedHospital = newValue;
        })

        if (! $scope.selectedHospital && $rootScope.selectedHospital) {
          $scope.selectedHospital = $rootScope.selectedHospital;
        }

        $scope.hospitalFilter = function(transaction) {
          return DataService.isFilteredByHospital($scope.selectedHospital, transaction.hospital);
        };
      });
    }

    function getTransactions() {
      DataService.getTransactions().then(function(data) {
        var rawData = data;
        $scope.transactions = _.map(rawData, function(data) {
          data.hospital = {'id':(data.hospital_id) ? data.hospital_id : TranType.getHospitalInWeb(data.type).id,
                           'name':(data.hospital_name) ? data.hospital_name : TranType.getHospitalInWeb(data.type).name};
          data.bead = {'id':data.bead_id, 'name':data.bead_name, 'stock_qty':data.stock_qty, 'unreceived_qty':data.unreceived_qty, 'undelivered_qty':data.undelivered_qty};
          data.typeInWeb = TranType.getTypeInWeb(data.type);
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
          if (! $scope.selectedStatus || $scope.selectedStatus === 'All' || $scope.selectedStatus === '') {
            return (! $scope.showCancel && transaction.status === TranStatus.CANCEL) ? false : true;
          } else {
            return transaction.status === $scope.selectedStatus;
          }
        };

      });
    }

    UpdateTransaction = function(is_update, open_qty, status) {
      this.is_update = false;
      this.open_qty = null;
      this.status = null;
    };

    UpdateBead = function(is_update, stock_qty, unreceived_qty, undelivered_qty) {
      this.is_update = false;
      this.stock_qty = null;
      this.unreceived_qty = null;
      this.undelivered_qty = null;
    };

    $scope.editTransaction = function(ev, transaction) {
      function dialogController($scope, $mdDialog, beads, hospitals, transaction, link_tran) {
        $scope.beads = beads;
        $scope.hospitals = hospitals;
        $scope.asof = new Date(transaction.asof);
        $scope.type = transaction.type;
        $scope.hospital = transaction.hospital;
        $scope.bead = transaction.bead;
        $scope.qty = transaction.qty;
        $scope.comment = transaction.comment;

        $scope.ok = function(asof, hospital, bead, qty, comment) {
          var movement = qty - transaction.qty;
          var is_bead_edit = (bead === transaction.bead) ? false : true;

          if (movement != 0 && is_bead_edit) {
            alert('Cannot edit both bead and qty at the same time!');
            return;
          }

          // For transaction update
          var updTran = new UpdateTransaction();

          // For linked transaction update
          var updLinkTran = new UpdateTransaction();

          // For bead qty update
          var updBead = new UpdateBead();

          // For bead qty update2 (in case of bead change)
          var updBead2 = new UpdateBead();

          if (is_bead_edit) {
            switch (transaction.type) {
              case TranType.ORDER_TO_SUPPLIER:
                if (transaction.qty != transaction.open_qty) {
                  alert('Cannot edit bead\nThis transaction has linked receive transactions');
                  return;
                } else {
                  updBead.unreceived_qty = transaction.bead.unreceived_qty - qty;
                  updBead.is_update = true;
                  updBead2.unreceived_qty = bead.unreceived_qty + qty;
                  updBead2.is_update = true;
                }
                break;
              case TranType.RECEIVE_FROM_SUPPLIER:
                alert('Cannot edit bead for receive transaction');
                return;
              case TranType.ORDER_FROM_HOSPITAL:
                if (transaction.qty != transaction.open_qty) {
                  alert('Cannot edit bead\nThis transaction has linked deliver transactions');
                  return;
                } else {
                  updBead.undelivered_qty = transaction.bead.undelivered_qty - qty;
                  updBead.is_update = true;
                  updBead2.undelivered_qty = bead.undelivered_qty + qty;
                  updBead2.is_update = true;
                }
                break;
              case TranType.DELIVER_TO_HOSPITAL:
                alert('Cannot edit bead for deliver transaction');
                return;
              default:
                alert('Cannot edit bead for this transaction type');
                return;
            }
          }

          if (movement != 0) {
            switch (transaction.type) {
              case TranType.ORDER_TO_SUPPLIER:
                if (transaction.open_qty + movement < 0) {
                  alert('Cannot edit\nOpen quantity becomes negative');
                  return;
                } else {
                  updBead.unreceived_qty = bead.unreceived_qty + movement;
                  updTran.open_qty = transaction.open_qty + movement;
                  if (transaction.status == TranStatus.DONE) updTran.status = TranStatus.RECEIVE;
                  updBead.is_update = true;
                }
                break;
              case TranType.RECEIVE_FROM_SUPPLIER:
                if (link_tran.open_qty - movement < 0) {
                  alert('Cannot edit!\nOpen quantity of linked order transaction becomes negative');
                  return;
                } else {
                  updBead.stock_qty = bead.stock_qty + movement;
                  updBead.unreceived_qty = bead.unreceived_qty - movement;
                  updLinkTran.open_qty = link_tran.open_qty - movement;
                  if (updLinkTran.open_qty == 0) updLinkTran.status = TranStatus.DONE;
                  if (link_tran.status == TranStatus.DONE) updLinkTran.status = TranStatus.RECEIVE;
                  updBead.is_update = true;
                  updLinkTran.is_update = true;
                }
                break;
              case TranType.ORDER_FROM_HOSPITAL:
                if (transaction.open_qty + movement < 0) {
                  alert('Cannot edit\nOpen quantity becomes negative');
                  return;
                } else {
                  updBead.undelivered_qty = bead.undelivered_qty + movement;
                  updTran.open_qty = transaction.open_qty + movement;
                  if (transaction.status == TranStatus.DONE) updTran.status = TranStatus.DELIVER;
                  updBead.is_update = true;
                }
                break;
              case TranType.DELIVER_TO_HOSPITAL:
                if (link_tran.open_qty - movement < 0) {
                  alert('Cannot edit!\nOpen quantity of linked order transaction becomes negative');
                  return;
                } else {
                  updBead.stock_qty = bead.stock_qty - movement;
                  updBead.undelivered_qty = bead.undelivered_qty - movement;
                  updLinkTran.open_qty = link_tran.open_qty - movement;
                  if (updLinkTran.open_qty == 0) updLinkTran.status = TranStatus.DONE;
                  if (link_tran.status == TranStatus.DONE) updLinkTran.status = TranStatus.DELIVER;
                  updBead.is_update = true;
                  updLinkTran.is_update = true;
                }
                break;
              default:
                break;
            }
          }

          DataService.updateTransaction(transaction.id, $filter('date')(asof, "yyyy/MM/dd"), hospital.id, bead.id, qty, updTran.open_qty, updTran.status, comment, null);
          if (updLinkTran.is_update) {
            DataService.updateTransaction(link_tran.id, null, null, null, null, updLinkTran.open_qty, updLinkTran.status, null, null);
          }
          if (updBead.is_update) {
            DataService.updateBead(transaction.bead_id, null, null, null, null, null, null, null, null, updBead.stock_qty, updBead.unreceived_qty, updBead.undelivered_qty);
          }
          if (updBead2.is_update) {
            DataService.updateBead(bead.id, null, null, null, null, null, null, null, null, updBead2.stock_qty, updBead2.unreceived_qty, updBead2.undelivered_qty);
          }
          $mdDialog.hide();
        }

        $scope.cancel = function() {
          $mdDialog.hide();
        }

        $scope.delete = function() {
          if (confirm('Is it ok to delete this transaction?')) {
            // For linked transaction update
            var updLinkTran = new UpdateTransaction();

            // For bead qty update
            var updBead = new UpdateBead();

            switch (transaction.type) {
              case TranType.ORDER_TO_SUPPLIER:
                if (transaction.qty != transaction.open_qty) {
                  alert('Cannot delete\nThis transaction has linked receive transactions');
                  return;
                } else {
                  updBead.unreceived_qty = transaction.bead.unreceived_qty - transaction.qty;
                  updBead.is_update = true;
                }
                break;
              case TranType.RECEIVE_FROM_SUPPLIER:
                updBead.stock_qty = transaction.bead.stock_qty - transaction.qty;
                updBead.unreceived_qty = transaction.bead.unreceived_qty + transaction.qty;
                updLinkTran.open_qty = link_tran.open_qty + transaction.qty;
                if (link_tran.status == TranStatus.DONE) updLinkTran.status = TranStatus.RECEIVE;
                updBead.is_update = true;
                updLinkTran.is_update = true;
                break;
              case TranType.ORDER_FROM_HOSPITAL:
                if (transaction.qty != transaction.open_qty) {
                  alert('Cannot delete\nThis transaction has linked deliver transactions');
                  return;
                } else {
                  updBead.undelivered_qty = transaction.bead.undelivered_qty - transaction.qty;
                  updBead.is_update = true;
                }
                break;
              case TranType.DELIVER_TO_HOSPITAL:
                updBead.stock_qty = transaction.bead.stock_qty + transaction.qty;
                updBead.undelivered_qty = transaction.bead.undelivered_qty + transaction.qty;
                updLinkTran.open_qty = link_tran.open_qty + transaction.qty;
                if (link_tran.status == TranStatus.DONE) updLinkTran.status = TranStatus.DELIVER;
                updBead.is_update = true;
                updLinkTran.is_update = true;
                break;
              default:
                break;
            }

            //DataService.deleteTransaction(transaction.id);
            DataService.updateTransaction(transaction.id, null, null, null, null, null, TranStatus.CANCEL);
            if (updLinkTran.is_update) {
              DataService.updateTransaction(link_tran.id, null, null, null, null, updLinkTran.open_qty, updLinkTran.status);
            }
            if (updBead.is_update) {
              DataService.updateBead(transaction.bead_id, null, null, null, null, null, null, null, null, updBead.stock_qty, updBead.unreceived_qty, updBead.undelivered_qty);
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

    $scope.deliverBead = function(ev, transaction) {
      function dialogController($scope, $mdDialog, bead, selectedAsof, transaction) {
        $scope.selectedBead = transaction.bead_name;
        $scope.hospital = transaction.hospital;
        $scope.lotsize_hospital = transaction.bead_lotsize_hospital;
        $scope.comment = transaction.comment;
        $scope.asof = (selectedAsof) ? new Date(selectedAsof) : new Date();

        $scope.ok = function(asof, qty, comment) {
          if (qty > transaction.open_qty) {
            alert('Deliver quantity should be <= Open quantity');
          } else {
            $cookies.put('asofDelv', asof);
            var type = TranType.DELIVER_TO_HOSPITAL;
            var hospital_id = 0;
            var status = TranType.getTranStatus(type);
            DataService.insertTransaction($filter('date')(asof, "yyyy/MM/dd"), type, transaction.hospital.id, transaction.bead_id, qty, null, status, transaction.id);

            var open_qty = transaction.open_qty - qty;
            status = (open_qty == 0) ? TranStatus.DONE : null;
            DataService.updateTransaction(transaction.id, null, null, null, null, open_qty, status, comment);

            var stock_qty = bead.stock_qty - qty;
            var undelivered_qty = bead.undelivered_qty - qty;
            DataService.updateBead(transaction.bead_id, null, null, null, null, null, null, null, null, stock_qty, null, undelivered_qty);
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
        ariaLabel:  'Deliver Bead',
        clickOutsideToClose: true,
        templateUrl: 'views/templates/delvBead.html',
        onComplete: afterShowAnimation,
        size: 'large',
        bindToController: true,
        autoWrap: false,
        parent: angular.element(document.body),
        preserveScope: true,
        locals: {
          bead: _.filter($scope.beads, function(bead) { return bead.id == transaction.bead_id; })[0],
          selectedAsof: $cookies.get('asofDelv'),
          transaction: transaction
        }
      });

      function afterShowAnimation(scope, element, options) {
         // post-show code here: DOM element focus, etc.
      }
    }

  }
]);
