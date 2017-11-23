var myApp = angular.module('myApp',
  ['ngRoute', 'ngAnimate', 'ui.bootstrap', 'ngTagsInput' , 'ngMaterial', 'ngCookies']);

myApp.config(['$routeProvider', function($routeProvider) {

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
}]);
