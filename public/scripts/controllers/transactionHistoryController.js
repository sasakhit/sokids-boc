myApp.controller('transactionHistoryController',
  ['$rootScope', '$scope', '$route', '$uibModal', '$log', '$mdDialog', '$filter', 'LoginService', 'DataService',
  function($rootScope, $scope, $route, $uibModal, $log, $mdDialog, $filter, LoginService, DataService) {

    LoginService.loginCheck();
    getBeads();
    getParties();
    getInventory();

    function getBeads() {
      DataService.getBeads().then(function(data) {
        $scope.names = _.uniq(_.map(data, function(bead) { return bead.name; }));
      });
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

    function getInventory() {
      DataService.getInventoryDetails().then(function(data) {
        var rawData = data;
        $scope.invs = _.map(rawData, function(data) {
          data.showBracket = DataService.getBracketType(data.comment, data.party);
          data.showBackorder = (data.comment == 'B/O') ? true : false;
          return data;
        })

        var comments = _.sortBy(_.uniq(_.map(rawData, function(data){ return data.comment; })));
        $scope.commentsForFilter = _.filter(comments, function(comment){ return comment; });
        $scope.commentsForFilter.unshift('All');

        $scope.$watch('selectedComment', function(newValue) {
          $rootScope.selectedComment = newValue;
        })

        if (! $scope.selectedComment && $rootScope.selectedComment) {
          $scope.selectedComment = $rootScope.selectedComment;
        }

        $scope.commentFilter = function(inv) {
          if (! $scope.selectedComment || $scope.selectedComment == 'All' || $scope.selectedComment == '') {
            return true;
          } else {
            return inv.comment == $scope.selectedComment;
          }
        };
      });
    }

    $scope.editInventory = function(ev, inv) {
      function dialogController($scope, $mdDialog, names, parties, inv) {
        $scope.names = names;
        $scope.parties = parties;
        $scope.asof = inv.asof;
        $scope.name = inv.name;
        $scope.qty = inv.qty;
        $scope.party = inv.party;
        $scope.comment = inv.comment;

        $scope.ok = function(asof, name, qty, party, comment) {
          DataService.updateInventory(inv, asof, name, qty, party, comment);
          $mdDialog.hide();
        }

        $scope.cancel = function() {
          $mdDialog.hide();
        }

        $scope.delete = function() {
          if (confirm('Is it ok to delete this inventory?')) {
            DataService.deleteInventory(inv);
            $mdDialog.hide();
          }
        }
      }

      $mdDialog.show({
        controller: dialogController,
        targetEvent: ev,
        ariaLabel:  'Edit Inventory',
        clickOutsideToClose: true,
        templateUrl: 'views/templates/editInventory.html',
        onComplete: afterShowAnimation,
        size: 'large',
        bindToController: true,
        autoWrap: false,
        parent: angular.element(document.body),
        preserveScope: true,
        locals: {
          names: $scope.names,
          parties: $scope.parties,
          inv: inv
        }
      });

      function afterShowAnimation(scope, element, options) {
       // post-show code here: DOM element focus, etc.
      }
    }

    $scope.deliverForBackorder = function(ev, inv) {
      var orig_qty = -1 * inv.qty;

      function dialogController($scope, $mdDialog, hospitals, inv) {
        $scope.hospitals = hospitals;
        $scope.selectedBead = inv.name;
        $scope.hospital = inv.party;
        $scope.qty = -1 * inv.qty;
        $scope.lotsize = inv.lotsize;
        $scope.showBracket = inv.showBracket;
        $scope.showBackorder = inv.showBackorder;
        $scope.asof = $filter('date')(new Date(), "yyyy/MM/dd");

        $scope.ok = function(asof, qty, hospital) {
          if (qty < 0) {
            alert('Quantity should be > 0');
          }
          else if (qty > orig_qty) {
            alert('Delivery quantity should be <= backorder quantity');
          }
          else {
            if (qty < orig_qty) {
              var remaining_qty = -1 * (orig_qty - qty)
              DataService.insertInventory(inv, inv.asof, inv.name, remaining_qty, hospital, 'B/O');
            }
            qty = -1* qty;
            DataService.updateInventory(inv, inv.asof, inv.name, qty, hospital, 'B/O [Delivered]');
            DataService.insertInventory(inv, asof, inv.name, qty, hospital, 'Deliver for B/O', inv.id);
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
        ariaLabel:  'Delivery for Backorder',
        clickOutsideToClose: true,
        templateUrl: 'views/templates/delvDialog.html',
        onComplete: afterShowAnimation,
        size: 'large',
        bindToController: true,
        autoWrap: false,
        parent: angular.element(document.body),
        preserveScope: true,
        locals: {
          hospitals: $scope.parties,
          inv: inv
        }
      });

      function afterShowAnimation(scope, element, options) {
       // post-show code here: DOM element focus, etc.
      }
    }
  }
]);
