myApp.controller('orderHistoryController',
  ['$window', '$rootScope', '$scope', '$route', '$uibModal', '$log', '$mdDialog', 'LoginService', 'DataService',
  function($window, $rootScope, $scope, $route, $uibModal, $log, $mdDialog, LoginService, DataService) {

    $scope.orders = [];
    var rawData = null;

    LoginService.loginCheck();
    getParties();
    getBeads().then(function() {
      getOrders();
    });

    function getBeads() {
      var promise = DataService.getBeads().then(function(data) {
        $scope.beads = data;
      });
      return promise;
    }

    function getParties() {
      DataService.getHospitals().then(function(data) {
        var hospitals = _.uniq(_.map(data, function(hospital) { return hospital.name; }));
        $scope.parties = DataService.getParties(hospitals.concat());
        $scope.hospitalsForFilter = DataService.getHospitalsForFilter(hospitals.concat());

        $scope.$watch('selectedHospital', function(newValue) {
          $rootScope.selectedHospital = newValue;
        })

        if (! $scope.selectedHospital && $rootScope.selectedHospital) {
          $scope.selectedHospital = $rootScope.selectedHospital;
        }

        $scope.hospitalFilter = function(inv) {
          return DataService.isFilteredByHospital($scope.selectedHospital, inv.party);
        };
      });
    }

    function getOrders() {
      DataService.getInventoryOrders().then(function(data) {
        rawData = data;
        var beads = _.map($scope.beads, function(bead){ bead.total = 0; bead.unreceived_total = 0; bead.backorder_total = 0; return bead });
        var datesParties = _.uniq(_.map(rawData, function(data){ return {'asof':data.asof, 'party':data.party, 'comment':data.comment}; }), function(asofparty) { return asofparty.asof + asofparty.party + asofparty.comment; });

        for (var i = 0, len1 = datesParties.length; i < len1; i++){
          var order = {};
          var boExist = false;

          for (var j = 0, len2 = beads.length; j < len2; j++){
            order[beads[j].name] = 0
            order[beads[j].name + '.bo'] = 0
            for (var k = 0, len3 = rawData.length; k < len3; k++){
              if (rawData[k].asof == datesParties[i].asof && rawData[k].party == datesParties[i].party && rawData[k].comment == datesParties[i].comment && rawData[k].name == beads[j].name){
                order[beads[j].name] += rawData[k].qty;
                order[beads[j].name + '.bo'] += rawData[k].backorder_qty;

                switch (DataService.getTotalType(rawData[k].comment, rawData[k].party)) {
                  case 'total':
                    beads[j].total += rawData[k].qty;
                    beads[j].backorder_total += rawData[k].backorder_qty;
                    break;
                  case 'unreceived_total':
                    beads[j].unreceived_total += rawData[k].qty;
                    break;
                  case '-unreceived_total':
                    beads[j].unreceived_total -= rawData[k].qty;
                    beads[j].total += rawData[k].qty;
                    break;
                  case '-backorder_total':
                    beads[j].total += rawData[k].qty;
                    beads[j].backorder_total -= rawData[k].qty;
                    break;
                }
              }
            }
            if (order[beads[j].name] == 0) {
              order[beads[j].name] = null;
            }
            if (order[beads[j].name + '.bo'] == 0) {
              order[beads[j].name + '.bo'] = null;
            } else {
              boExist = true;
            }
          }
          order['date'] = datesParties[i].asof;
          order['party'] = datesParties[i].party;
          if (boExist) {
            order['comment'] = "Incl. B/O";
          } else {
            order['comment'] = datesParties[i].comment;
          }
          order['showBracket'] = DataService.getBracketType(datesParties[i].comment, datesParties[i].party);
          $scope.orders.push(order);
        }
      });
    }

    $scope.genReport = function(ev, order, beads) {

      var $newWindow = $window.open('./reports/orderSheet.html');

      for (var i = 0, len = beads.length; i < len; i++) {
        order[beads[i].name + '.reqd'] = 0;
        order[beads[i].name + '.delv'] = 0;
        order[beads[i].name + '.miss'] = 0;
        if (order[beads[i].name] != null) {
          order[beads[i].name + '.delv'] = Math.abs(order[beads[i].name]);
          order[beads[i].name + '.reqd'] += order[beads[i].name + '.delv'];
        }
        if (order[beads[i].name + '.bo'] != null) {
          order[beads[i].name + '.miss'] = Math.abs(order[beads[i].name + '.bo']);
          order[beads[i].name + '.reqd'] += order[beads[i].name + '.miss'];
        }
        if (order[beads[i].name + '.reqd'] == 0) {
          order[beads[i].name + '.reqd'] = null;
          order[beads[i].name + '.delv'] = null;
          order[beads[i].name + '.miss'] = null;
        }
      }

      $newWindow.order = order;
      $newWindow.beads = beads;
    }
  }
]);
