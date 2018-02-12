myApp.factory('LoginService',
    ['$rootScope', '$http', '$mdDialog', '$location',
    function($rootScope, $http, $mdDialog, $location) {

      return {
        loginCheck : loginCheck
      };

      function loginCheck() {
        var promise = $http.get('/login').then(function(response) {
          var user = response.data;
          if (user == '') {
            showPromptLogin();
          } else {
            //window.localStorage['boc_user'] = JSON.stringify(user);
            $rootScope.username = user.username;
            $rootScope.isAdmin = user.isadmin;

            if ($rootScope.isAdmin) {
              if ($location.path() === '/login') $location.path('/beads');
            } else {
              if ($location.path() === '/login') $location.path('/hospital_orders');
            }
          }
        });

        return promise;
      }

      function showPromptLogin() {
        $mdDialog.show({
          ariaLabel:  'Login',
          clickOutsideToClose: false,
          escapeToClose: false,
          templateUrl: 'views/templates/loginDialog.html',
          size: 'large',
          bindToController: true,
          autoWrap: false,
          parent: angular.element(document.body),
          preserveScope: true
        });
      }
    }
]);
