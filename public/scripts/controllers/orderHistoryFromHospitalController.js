myApp.controller('orderHistoryFromHospitalController',
  ['$rootScope', '$scope', '$route', '$uibModal', '$log', '$mdDialog', '$cookies', '$filter', 'LoginService', 'DataService', 'TranStatus', 'TranType',
  function($rootScope, $scope, $route, $uibModal, $log, $mdDialog, $cookies, $filter, LoginService, DataService, TranStatus, TranType) {

    LoginService.loginCheck();
    load();
    
    function load() {
      getHospitals().then(function() {
        getTransactions();
      });
      getBeads();
    }

    $scope.reload = function() {
      load();
    }

    function getBeads() {
      DataService.getBeads().then(function(data) {
        $scope.beads = _.uniq(_.map(data, function(bead) {
          return {'id':bead.id, 'name':bead.name, 'name_jp':bead.name_jp, 'stock_qty':bead.stock_qty, 'unreceived_qty':bead.unreceived_qty, 'undelivered_qty':bead.undelivered_qty};
        }), 'id');
      });
    }

    function getHospitals() {
      var promise = DataService.getHospitals().then(function(data) {
        $scope.hospitals = data;

        //var user = JSON.parse(window.localStorage.boc_user);
        //$scope.isAdmin = user.isadmin;

        if ($scope.isAdmin && $scope.hospital) {
          $scope.hospital = _.filter($scope.hospitals, function(hospital) { return hospital.name === $scope.selectedHospital.name; })[0];
        } else {
          $scope.hospital = _.filter($scope.hospitals, function(hospital) { return hospital.username === $rootScope.username; })[0];
        }

        $scope.$watch('hospital', function(newValue) {
          $rootScope.selectedHospital = (newValue) ? newValue.name : '';
        })

        if (! $scope.hospital && $rootScope.selectedHospital) {
          $scope.hospital = _.filter($scope.hospitals, function(hospital) { return hospital.name === $rootScope.selectedHospital; })[0];
        }
      });

      return promise;
    }

    function getTransactions() {
      var hospital_id = ($scope.hospital) ? $scope.hospital.id : -1;
      DataService.getTransactions(hospital_id).then(function(transaction) {
        //var rawData = _.filter(transaction, function(tran) { return tran.status === TranStatus.DELIVER || tran.status === TranStatus.DONE || tran.status === TranStatus.CANCEL });
        var rawData = _.filter(transaction, function(tran) { return tran.type === TranType.ORDER_FROM_HOSPITAL });
        $scope.transactions = _.map(rawData, function(data) {
          data.hospital = {'id':(data.hospital_id) ? data.hospital_id : TranType.getHospitalInWeb(data.type).id,
                           'name':(data.hospital_name) ? data.hospital_name : TranType.getHospitalInWeb(data.type).name};
          data.bead = {'id':data.bead_id, 'name':data.bead_name, 'name_jp':data.bead_name_jp, 'stock_qty':data.stock_qty, 'unreceived_qty':data.unreceived_qty, 'undelivered_qty':data.undelivered_qty};
          data.typeInWeb = TranType.getTypeInWeb(data.type);

          data.statusInWeb = TranStatus.getStatusInHospitalScreen(data.status);
          if (data.status === TranStatus.DELIVER) {
            data.statusInWeb += '<br> - 未発送は ' + data.open_qty.toString() + ' 個';
          }

          var link_trans = _.filter(transaction, function(link_tran) { return link_tran.linkid === data.id; });
          if (link_trans.length > 0) {
            data.statusInWeb += _.reduce(link_trans, function(result, link_tran, index) {
              result += '<br> - ' + link_tran.asof + ' に ' + link_tran.qty.toString() + ' 個発送';
              return result;
            }, '')
          }
          return data;
        })

        var statuses = _.sortBy(_.uniq(_.map(rawData, function(data){ return TranStatus.getStatusInHospitalScreen(data.status); })));
        $scope.statusesForFilter = _.filter(statuses, function(status){ return status; });
        $scope.statusesForFilter.unshift('すべて');

        $scope.$watch('selectedStatus', function(newValue) {
          $rootScope.selectedStatus = newValue;
        })

        if (! $scope.selectedStatus && $rootScope.selectedStatus) {
          $scope.selectedStatus = $rootScope.selectedStatus;
        }

        $scope.statusFilter = function(transaction) {
          if (! $scope.selectedStatus || $scope.selectedStatus == 'すべて' || $scope.selectedStatus == '') {
            return (! $scope.showCancel && transaction.status === TranStatus.CANCEL) ? false : true;
          } else {
            return (transaction.statusInWeb.indexOf($scope.selectedStatus) >= 0) ? true : false;
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

    $scope.cancelTransaction = function(ev, transaction) {
      function dialogController($scope, $mdDialog, beads, hospitals, transaction, link_tran) {
        $scope.beads = beads;
        $scope.hospitals = hospitals;
        $scope.asof = new Date(transaction.asof);
        $scope.type = transaction.type;
        $scope.hospital = transaction.hospital;
        $scope.bead = transaction.bead;
        $scope.qty = transaction.qty;

        $scope.cancel = function() {
          $mdDialog.hide();
        }

        $scope.delete = function() {
          if (confirm('取り消してもいいですか？')) {
            // For linked transaction update
            var updLinkTran = new UpdateTransaction();

            // For bead qty update
            var updBead = new UpdateBead();

            if (transaction.qty != transaction.open_qty) {
              alert('すでに発送済がありますので、取り消しできません。');
              return;
            } else {
              updBead.undelivered_qty = transaction.bead.undelivered_qty - transaction.qty;
              updBead.is_update = true;
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
        ariaLabel:  'Cacnel Transaction',
        clickOutsideToClose: true,
        templateUrl: 'views/templates/cancTransactionFromHospital.html',
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
  }
]);
