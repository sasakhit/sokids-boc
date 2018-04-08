myApp.controller('hospitalsController',
  ['$scope', '$route', '$log', '$mdDialog', 'LoginService', 'DataService',
  function($scope, $route, $log, $mdDialog, LoginService, DataService) {

    LoginService.loginCheck();
    getHospitals();

    function getHospitals() {
      DataService.getHospitals().then(function(data) {
        $scope.hospitals = data;
        $scope.names = _.uniq(_.map($scope.hospitals, function(data) { return data.name; }));
      });
    }

    $scope.editHospital = function(ev, hospital) {
      function dialogController($scope, $mdDialog, id, name, postal, address, phone, dept, title, contact1, contact2, email, username, password) {
        $scope.id = id;
        $scope.name = name;
        $scope.postal = postal;
        $scope.address = address;
        $scope.phone = phone;
        $scope.dept = dept;
        $scope.title = title;
        $scope.contact1 = contact1;
        $scope.contact2 = contact2;
        $scope.email = email;
        $scope.username = username;
        $scope.password = password;

        $scope.ok = function(name, postal, address, phone, dept, title, contact1, contact2, email, username, password) {
          DataService.updateHospital(id, name, postal, address, phone, dept, title, contact1, contact2, email, username, password);
          $mdDialog.hide();
        }

        $scope.cancel = function() {
          $mdDialog.hide();
        }

        $scope.delete = function() {
          if (confirm('Is it ok to delete Hospital: ' + name + ' ?')) {
            DataService.deleteHospital(id);
            $mdDialog.hide();
          }
        }
      }

      $mdDialog.show({
        controller: dialogController,
        targetEvent: ev,
        ariaLabel:  'Edit Entry',
        clickOutsideToClose: true,
        templateUrl: 'views/templates/editHospital.html',
        onComplete: afterShowAnimation,
        size: 'large',
        bindToController: true,
        autoWrap: false,
        parent: angular.element(document.body),
        preserveScope: true,
        locals: {
          id: hospital.id,
          name: hospital.name,
          postal: hospital.postal,
          address: hospital.address,
          phone: hospital.phone,
          dept: hospital.dept,
          title: hospital.title,
          contact1: hospital.contact1,
          contact2: hospital.contact2,
          email: hospital.email,
          username: hospital.username,
          password: hospital.password
        }
      });

      function afterShowAnimation(scope, element, options) {
         // post-show code here: DOM element focus, etc.
      }
    }

    $scope.insertHospital = function(ev) {
      function dialogController($scope, $mdDialog, names, name, postal, address, phone, dept, title, contact1, contact2, email, username, password) {
        $scope.names = names;
        $scope.name = name;
        $scope.postal = postal;
        $scope.address = address;
        $scope.phone = phone;
        $scope.dept = dept;
        $scope.title = title;
        $scope.contact1 = contact1;
        $scope.contact2 = contact2;
        $scope.email = email;
        $scope.username = username;
        $scope.password = password;

        $scope.ok = function(name, postal, address, phone, dept, title, contact1, contact2, email, username, password) {
          if (!name) {
            alert('Hospital Name should not be blank');
          }
          else if (names.indexOf(name) > -1) {
            alert('Hospital Name already exists');
          }
          else {
            DataService.insertHospital(name, postal, address, phone, dept, title, contact1, contact2, email, username, password);
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
        templateUrl: 'views/templates/newHospital.html',
        onComplete: afterShowAnimation,
        size: 'large',
        bindToController: true,
        autoWrap: false,
        parent: angular.element(document.body),
        preserveScope: true,
        locals: {
          names: $scope.names,
          name: "",
          postal: "",
          address: "",
          phone: "",
          dept: "",
          title: "",
          contact1: "",
          contact2: "",
          email: "",
          username: "",
          password: ""
        }
      });

      function afterShowAnimation(scope, element, options) {
       // post-show code here: DOM element focus, etc.
      }
    }
  }
]);
