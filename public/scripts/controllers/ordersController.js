myApp.controller('ordersController',
  ['$window', '$rootScope', '$scope', '$route', '$uibModal', '$log', '$mdDialog', 'LoginService', 'DataService', 'TranType', 'BeadType',
  function($window, $rootScope, $scope, $route, $uibModal, $log, $mdDialog, LoginService, DataService, TranType, BeadType) {

    $scope.orders = [];
    var rawData = null;

    LoginService.loginCheck();
    getHospitals();
    getBeads().then(function() {
      getOrders();
    });

    function getBeads() {
      var promise = DataService.getBeads().then(function(data) {
        $scope.beads = data;
      });
      return promise;
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

    function getOrders() {
      DataService.getTransactions().then(function(data) {
        rawData = data;
        var beads = $scope.beads;
        var datesHospitals = _.uniq(_.map(rawData, function(data){ return {'asof':data.asof, 'hospital_name':data.hospital_name, 'type':data.type}; }), function(asofparty) { return asofparty.asof + asofparty.hospital_name + asofparty.type; });

        for (var i = 0, len1 = datesHospitals.length; i < len1; i++){
          var order = {};

          for (var j = 0, len2 = beads.length; j < len2; j++){
            order[beads[j].name] = 0
            for (var k = 0, len3 = rawData.length; k < len3; k++){
              if (rawData[k].asof == datesHospitals[i].asof && rawData[k].hospital_name == datesHospitals[i].hospital_name && rawData[k].type == datesHospitals[i].type && rawData[k].bead_name == beads[j].name){
                order[beads[j].name] += rawData[k].qty;
              }
            }
            if (order[beads[j].name] == 0) {
              order[beads[j].name] = null;
            }
          }
          order['date'] = datesHospitals[i].asof;
          order['hospital'] = (datesHospitals[i].hospital_name) ? {'name':datesHospitals[i].hospital_name} : {'name':TranType.getHospitalInWeb(datesHospitals[i].type).name}
          order['type'] = datesHospitals[i].type;
          order['typeInWeb'] = TranType.getTypeInWeb(datesHospitals[i].type);
          $scope.orders.push(order);
        }
      });
    }

    $scope.genControlSheet = function(ev, order, beads) {
      var $newWindow = $window.open('./reports/orderSheet.html');

      for (var i = 0, len = beads.length; i < len; i++) {
        order[beads[i].name + '.reqd'] = null;
        order[beads[i].name + '.delv'] = null;
        order[beads[i].name + '.miss'] = null;
        if (order[beads[i].name] != null) {
          order[beads[i].name + '.reqd'] = Math.abs(order[beads[i].name]);
        }
      }

      $newWindow.order = order;
      $newWindow.beads = beads;
    }

    $scope.genDeliverySheet = function(ev, order, beads, hospitals) {
      var $newWindow = $window.open('./reports/deliverySheet.html');

      for (var i = 0, len = beads.length; i < len; i++) {
        order[beads[i].name + '.reqd'] = null;
        order[beads[i].name + '.delv'] = null;
        order[beads[i].name + '.miss'] = null;
        if (order[beads[i].name] != null) {
          order[beads[i].name + '.delv'] = Math.abs(order[beads[i].name]);
          beads[i].show = true;
          beads[i].type_jp = BeadType.getTypeInJapanese(beads[i].type);
        }
      }

      $newWindow.order = order;
      $newWindow.beads = beads;
      $newWindow.hospital = _.filter(hospitals, function(hospital) { return hospital.name == order['hospital'].name; })[0];
    }
  }
]);
