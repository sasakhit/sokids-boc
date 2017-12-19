myApp.factory('Utils',
      ['$rootScope', '$mdDialog', '$mdToast', function($rootScope, $mdDialog, $mdToast) {

    return {
      toast : toast,
      dialog : dialog,
      confirm: confirm
    };

    function toast(data) {
      $mdToast.show(
        $mdToast.simple()
        .textContent(data)
        .position("top right")
        .hideDelay(3000)
      );
    }

    function dialog(title, data) {
      $mdDialog.show(
        $mdDialog.alert()
        .parent(angular.element(document.querySelector('#popupContainer')))
        .clickOutsideToClose(true)
        .title(title)
        .textContent(data)
        .ariaLabel('Dialog')
        .ok('OK')
      );
    }

    function confirm(title, data) {
      return $mdDialog.show(
        $mdDialog.confirm()
        .title(title)
        .textContent(data)
        .ariaLabel('Confirm')
        .ok('OK')
        .cancel('CANCEL')
      );
    }

  }
]);

myApp.directive('onErrorSrc', function() {
    return {
        link: function(scope, element, attrs) {
          element.bind('error', function() {
            if (attrs.src != attrs.onErrorSrc) {
              attrs.$set('src', attrs.onErrorSrc);
            }
          });
        }
    }
});
