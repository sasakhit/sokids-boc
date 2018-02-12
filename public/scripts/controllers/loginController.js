myApp.controller('loginController',
  ['LoginService',
  function(LoginService) {

    LoginService.loginCheck();
    
  }
]);
