myApp.controller('ordersFromHospitalController',
  ['$rootScope', '$scope', '$route', '$log', '$mdDialog', '$cookies', '$filter', 'LoginService', 'DataService', 'Utils', 'TranType', 'TranStatus', 'BeadType',
  function($rootScope, $scope, $route, $log, $mdDialog, $cookies, $filter, LoginService, DataService, Utils, TranType, TranStatus, BeadType) {

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

    function getTransactions() {
      var hospital_id = ($scope.hospital) ? $scope.hospital.id : -1;
      DataService.getTransactions(hospital_id).then(function(data) {
        var transactions = data;

        $scope.order = _.reduce(transactions, function(order, transaction) {
          if (transaction.type === TranType.ORDER_FROM_HOSPITAL && transaction.open_qty > 0) {
            if (order[transaction.bead_name]) {
              order[transaction.bead_name] += transaction.open_qty;
            } else {
              order[transaction.bead_name] = transaction.open_qty;
            }
            return order;
          }
        }, {});
      });
    }

    function getHospitals() {
      var promise = DataService.getHospitals().then(function(data) {
        $scope.hospitals = data;

        $scope.isAdmin = true;

        if ($scope.isAdmin && $scope.hospital) {
          $scope.hospital = _.filter($scope.hospitals, function(hospital) { return hospital.name === $scope.selectedHospital.name; })[0];
        } else {
          var username = window.localStorage.boc_user;
          //var username = 'keio';
          $scope.hospital = _.filter($scope.hospitals, function(hospital) { return hospital.username === username; })[0];
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

    function getBeads() {
      DataService.getBeads().then(function(data) {
        $scope.beads = data;
        $scope.beads = _.map(data, function(bead) {
          bead.type_jp = BeadType.getTypeInJapanese(bead.type);
          return bead;
        })

        $scope.names = _.uniq(_.map($scope.beads, function(data) { return data.name; }));
        var types = _.uniq(_.map($scope.beads, function(data) { return data.type_jp; }));
        $scope.types = types.concat();
        $scope.typesForFilter = DataService.getTypesForFilterInJapanese(types.concat());

        $scope.$watch('selectedType', function(newValue) {
          $rootScope.selectedType = BeadType.getTypeInJapanese(newValue);
        })

        if (! $scope.selectedType && $rootScope.selectedType) {
          $scope.selectedType = $rootScope.selectedType;
        }

        $scope.typeFilter = function(bead) {
          return DataService.isFilteredByType($scope.selectedType, bead.type_jp);
        };
      });
    }

    $scope.orderBead = function(ev, bead, hospital) {
      function dialogController($scope, $mdDialog, selectedAsof, bead, hospital) {
        $scope.selectedBead = bead.name_jp;
        $scope.asof = (selectedAsof) ? new Date(selectedAsof) : new Date();

        $scope.ok = function(asof, qty) {
          $cookies.put('asofOrder', asof);
          var type = TranType.ORDER_FROM_HOSPITAL;
          var status = TranType.getTranStatus(type);
          DataService.insertTransaction($filter('date')(asof, "yyyy/MM/dd"), type, hospital.id, bead.id, qty, qty, status);
          var undelivered_qty = bead.undelivered_qty + qty;
          DataService.updateBead(bead.id, null, null, null, null, null, null, null, null, null, null, undelivered_qty);
          $mdDialog.hide();
        }

        $scope.cancel = function() {
          $mdDialog.hide();
        }
      }

      $mdDialog.show({
        controller: dialogController,
        targetEvent: ev,
        ariaLabel:  'Order from Hospital',
        clickOutsideToClose: true,
        templateUrl: 'views/templates/orderBeadFromHospital.html',
        onComplete: afterShowAnimation,
        size: 'large',
        bindToController: true,
        autoWrap: false,
        parent: angular.element(document.body),
        preserveScope: true,
        locals: {
          selectedAsof: $cookies.get('asofOrder'),
          bead: bead,
          hospital: hospital
        }
      });

      function afterShowAnimation(scope, element, options) {
         // post-show code here: DOM element focus, etc.
      }
    }
  }
]);
