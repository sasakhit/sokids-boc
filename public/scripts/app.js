var myApp = angular.module('myApp',
  ['ngRoute', 'ngAnimate', 'ui.bootstrap', 'ngTagsInput' , 'ngMaterial', 'ngCookies']);

myApp.config(['$routeProvider', '$mdThemingProvider', '$mdDateLocaleProvider', function($routeProvider, $mdThemingProvider, $mdDateLocaleProvider) {


  $routeProvider
    .when('/dashboard', {
      templateUrl: '/views/templates/inventory.html',
      controller: 'inventoryController'
    })
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
    .when('/transaction_histrory', {
      templateUrl: '/views/templates/transactionHistory.html',
      controller: 'transactionHistoryController'
    })
    .when('/order_histrory', {
      templateUrl: '/views/templates/orderHistory.html',
      controller: 'orderHistoryController'
    })
    .when('/notImplemented', {
      templateUrl: '/views/templates/notImplemented.html'
    })
    .otherwise({
      redirectTo: '/dashboard'
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
