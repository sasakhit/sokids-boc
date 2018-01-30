myApp.controller('beadsController',
  ['$rootScope', '$scope', '$route', '$log', '$mdDialog', '$cookies', '$filter', 'LoginService', 'DataService', 'Utils', 'TranType', 'TranStatus', 'BeadType',
  function($rootScope, $scope, $route, $log, $mdDialog, $cookies, $filter, LoginService, DataService, Utils, TranType, TranStatus, BeadType) {

    LoginService.loginCheck();
    getBeads();

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
          DataService.updateBead(bead.id, null, null, null, null, null, null, null, null, null, unreceived_qty, null);
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
      function dialogController($scope, $mdDialog, types, id, name, type, lotsize, price, name_jp, description, refno, refno_chronic) {
        $scope.types = types;
        $scope.id = id;
        $scope.name = name;
        $scope.type = type;
        $scope.lotsize = lotsize;
        $scope.price = price;
        $scope.name_jp = name_jp;
        $scope.description = description;
        $scope.refno = refno;
        $scope.refno_chronic = refno_chronic;

        $scope.ok = function(name, type, lotsize, price, name_jp, description, refno, refno_chronic) {
          if (!type) {
            //alert('Bead Type should not be blank');
            Utils.dialog('Bead Type should not be blank');
          }
          else if (!lotsize) {
            //alert('Lot Size should not be blank');
            Utils.dialog('Lot Size should not be blank');
          }
          else {
            DataService.updateBead(id, name, type, lotsize, price, name_jp, description, refno, refno_chronic);
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
          refno_chronic: bead.refno_chronic
        }
      });

      function afterShowAnimation(scope, element, options) {
       // post-show code here: DOM element focus, etc.
      }
    }

    $scope.newBead = function(ev) {
      function dialogController($scope, $mdDialog, names, types, name, type, lotsize, price, name_jp, description, refno, refno_chronic) {
        $scope.names = names;
        $scope.types = types;
        $scope.name = name;
        $scope.type = type;
        $scope.lotsize = lotsize;
        $scope.price = price;
        $scope.name_jp = name_jp;
        $scope.description = description;
        $scope.refno = refno;
        $scope.refno_chronic = refno_chronic;

        $scope.ok = function(name, type, lotsize, price, name_jp, description, refno, refno_chronic) {
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
            DataService.insertBead(name, type, lotsize, price, name_jp, description, refno, refno_chronic);
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
          refno_chronic: null
        }
      });

      function afterShowAnimation(scope, element, options) {
       // post-show code here: DOM element focus, etc.
      }
    }
  }
]);
