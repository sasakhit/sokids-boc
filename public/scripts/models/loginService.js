myApp.factory('LoginService',
    ['$http', '$mdDialog',
    function($http, $mdDialog) {

      return {
        loginCheck : loginCheck
      };

      function loginCheck() {
        $http.get('/login').then(function(response) {
          var user = response.data;
          if (user == '') {
            showPromptLogin();
          } else {
            window.localStorage['boc_user'] = user;
          }
        });
      }

      function showPromptLogin() {
        $mdDialog.show({
          ariaLabel:  'Login',
          clickOutsideToClose: true,
          templateUrl: 'views/templates/loginDialog.html',
          size: 'large',
          bindToController: true,
          autoWrap: false,
          parent: angular.element(document.body),
          preserveScope: true,
        });
      }
    }
]);
