var myApp = angular.module('myApp',
  ['ngRoute', 'ngAnimate', 'ui.bootstrap', 'ngTagsInput' , 'ngMaterial', 'ngCookies', 'ngSanitize']);

myApp.config(['$routeProvider', '$mdThemingProvider', '$mdDateLocaleProvider', function($routeProvider, $mdThemingProvider, $mdDateLocaleProvider) {


  $routeProvider
    .when('/hospitals', {
      templateUrl: '/views/templates/hospitals.html',
      controller: 'hospitalsController'
    })
    .when('/beads', {
      templateUrl: '/views/templates/beads.html',
      controller: 'beadsController'
    })
    .when('/transactions', {
      templateUrl: '/views/templates/transactions.html',
      controller: 'transactionsController'
    })
    .when('/orders', {
      templateUrl: '/views/templates/orders.html',
      controller: 'ordersController'
    })
    .when('/hospital_orders', {
      templateUrl: '/views/templates/ordersFromHospital.html',
      controller: 'ordersFromHospitalController'
    })
    .when('/hospital_order_history', {
      templateUrl: '/views/templates/orderHistoryFromHospital.html',
      controller: 'orderHistoryFromHospitalController'
    })
    .when('/login', {
      templateUrl: '/views/templates/login.html',
      controller: 'loginController'
    })
    .otherwise({
      redirectTo: '/login'
    });

    $mdThemingProvider.theme('default')
      .primaryPalette('indigo')
      .accentPalette('pink')
      .warnPalette('green')
      .backgroundPalette('grey');

    $mdDateLocaleProvider.formatDate = function(date) {
      return moment(date).format('YYYY/MM/DD');
    };
}]);

myApp.controller('navController', ['$scope', '$location', function($scope, $location) {
  $scope.currentNavItem = $location.path().replace('/','');
}]);
