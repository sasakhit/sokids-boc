myApp.controller('beadsController',
  ['$rootScope', '$scope', '$route', '$log', '$mdDialog', '$cookies', '$filter', 'LoginService', 'DataService', 'Utils', 'TranType', 'TranStatus', 'BeadType',
  function($rootScope, $scope, $route, $log, $mdDialog, $cookies, $filter, LoginService, DataService, Utils, TranType, TranStatus, BeadType) {

    LoginService.loginCheck();
    getBeads();
    getHospitals();

    function getBeads() {
      DataService.getBeads().then(function(data) {
        $scope.beads = data;
        $scope.names = _.uniq(_.map($scope.beads, function(data) { return data.name; }));
        var types = _.uniq(_.map($scope.beads, function(data) { return data.type; }));
        $scope.types = types.concat();
        $scope.typesForFilter = DataService.getTypesForFilter(types.concat());

        $scope.$watch('selectedType', function(newValue) {
          $rootScope.selectedType = BeadType.getTypeInEnglish(newValue);
        })

        if (! $scope.selectedType && $rootScope.selectedType) {
          $scope.selectedType = $rootScope.selectedType;
        }

        $scope.typeFilter = function(bead) {
          return DataService.isFilteredByType($scope.selectedType, bead.type);
        };
      });
    }

    function getHospitals() {
      DataService.getHospitals().then(function(data) {
        $scope.hospitals = _.uniq(_.map(data, function(hospital) { return {'id':hospital.id, 'name':hospital.name, 'postal':hospital.postal}; }), 'id');
      });
    }

    $scope.orderBead = function(ev, bead) {
      function dialogController($scope, $mdDialog, selectedAsof, bead) {
        $scope.selectedBead = bead.name;
        $scope.lotsize = bead.lotsize;
        $scope.asof = (selectedAsof) ? new Date(selectedAsof) : new Date();

        $scope.ok = function(asof, qty) {
          $cookies.put('asofOrder', asof);
          var type = TranType.ORDER_TO_SUPPLIER;
          var hospital_id = 0;
          var status = TranType.getTranStatus(type);
          DataService.insertTransaction($filter('date')(asof, "yyyy/MM/dd"), type, hospital_id, bead.id, qty, qty, status);
          var unreceived_qty = bead.unreceived_qty + qty;
          DataService.updateBead(bead.id, null, null, null, null, null, null, null, null, null, null, unreceived_qty, null);
          $mdDialog.hide();
        }

        $scope.cancel = function() {
          $mdDialog.hide();
        }
      }

      $mdDialog.show({
        controller: dialogController,
        targetEvent: ev,
        ariaLabel:  'Order',
        clickOutsideToClose: true,
        templateUrl: 'views/templates/orderBead.html',
        onComplete: afterShowAnimation,
        size: 'large',
        bindToController: true,
        autoWrap: false,
        parent: angular.element(document.body),
        preserveScope: true,
        locals: {
          selectedAsof: $cookies.get('asofOrder'),
          bead: bead
        }
      });

      function afterShowAnimation(scope, element, options) {
         // post-show code here: DOM element focus, etc.
      }
    }

    $scope.editBead = function(ev, bead) {
      function dialogController($scope, $mdDialog, types, id, name, type, lotsize, price, name_jp, description, refno, lotsize_hospital, description_chronic, stock_qty, reasons, selectedAsof) {
        $scope.types = types;
        $scope.id = id;
        $scope.name = name;
        $scope.type = type;
        $scope.lotsize = lotsize;
        $scope.price = price;
        $scope.name_jp = name_jp;
        $scope.description = description;
        $scope.refno = refno;
        $scope.lotsize_hospital = lotsize_hospital;
        $scope.description_chronic = description_chronic;
        $scope.stock_qty = stock_qty;
        $scope.reasons = reasons;
        $scope.reason = reasons[0];
        $scope.asof = (selectedAsof) ? new Date(selectedAsof) : new Date();

        $scope.ok = function(name, type, lotsize, price, name_jp, description, refno, lotsize_hospital, description_chronic, stock_qty_new, reason, asof) {
          if (!type) {
            //alert('Bead Type should not be blank');
            Utils.dialog('Bead Type should not be blank');
          }
          else if (!lotsize) {
            //alert('Lot Size should not be blank');
            Utils.dialog('Lot Size should not be blank');
          }
          else if (stock_qty_new !== stock_qty) {
            $cookies.put('asofAdjust', asof);
            var qty = stock_qty_new - stock_qty;
            DataService.insertTransaction($filter('date')(asof, "yyyy/MM/dd"), TranType.ADJUST, reason.id, id, qty, null, null, null, null, null);
            DataService.updateBead(id, name, type, lotsize, price, name_jp, description, refno, lotsize_hospital, description_chronic, stock_qty_new);
            $mdDialog.hide();
          } else {
            DataService.updateBead(id, name, type, lotsize, price, name_jp, description, refno, lotsize_hospital, description_chronic);
            $mdDialog.hide();
          }
        }

        $scope.cancel = function() {
          $mdDialog.hide();
        }

        $scope.delete = function() {
          if(confirm('Is it ok to delete Bead: ' + name + ' ?')) {
            DataService.deleteBead(id);
            $mdDialog.hide();
          }
        }
      }

      $mdDialog.show({
        controller: dialogController,
        targetEvent: ev,
        ariaLabel:  'Edit Entry',
        clickOutsideToClose: true,
        templateUrl: 'views/templates/editBead.html',
        onComplete: afterShowAnimation,
        size: 'large',
        bindToController: true,
        autoWrap: false,
        parent: angular.element(document.body),
        preserveScope: true,
        locals: {
          types: $scope.types,
          id: bead.id,
          name: bead.name,
          type: bead.type,
          lotsize: bead.lotsize,
          price: bead.price,
          name_jp: bead.name_jp,
          description: bead.description,
          refno: bead.refno,
          lotsize_hospital: bead.lotsize_hospital,
          description_chronic: bead.description_chronic,
          stock_qty: bead.stock_qty,
          reasons: _.filter($scope.hospitals, function(hospital) { return hospital.postal == ''; }),
          selectedAsof: $cookies.get('asofAdjust'),
        }
      });

      function afterShowAnimation(scope, element, options) {
       // post-show code here: DOM element focus, etc.
      }
    }

    $scope.newBead = function(ev) {
      function dialogController($scope, $mdDialog, names, types, name, type, lotsize, price, name_jp, description, refno, lotsize_hospital, description_chronic) {
        $scope.names = names;
        $scope.types = types;
        $scope.name = name;
        $scope.type = type;
        $scope.lotsize = lotsize;
        $scope.price = price;
        $scope.name_jp = name_jp;
        $scope.description = description;
        $scope.refno = refno;
        $scope.lotsize_hospital = lotsize_hospital;
        $scope.description_chronic = description_chronic;

        $scope.ok = function(name, type, lotsize, price, name_jp, description, refno, lotsize_hospital, description_chronic) {
          if (!name) {
            alert('Bead Name should not be blank');
          }
          else if (names.indexOf(name) > -1) {
            alert('Bead Name already exists');
          }
          else if (!type) {
            alert('Bead Type should not be blank');
          }
          else {
            DataService.insertBead(name, type, lotsize, price, name_jp, description, refno, lotsize_hospital, description_chronic);
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
        ariaLabel:  'Edit Entry',
        clickOutsideToClose: true,
        templateUrl: 'views/templates/newBead.html',
        onComplete: afterShowAnimation,
        size: 'large',
        bindToController: true,
        autoWrap: false,
        parent: angular.element(document.body),
        preserveScope: true,
        locals: {
          names: $scope.names,
          types: $scope.types,
          name: "",
          type: "",
          lotsize: null,
          price: null,
          name_jp: "",
          description: "",
          refno: null,
          lotsize_hospital: null,
          description_chronic: null
        }
      });

      function afterShowAnimation(scope, element, options) {
       // post-show code here: DOM element focus, etc.
      }
    }
  }
]);
