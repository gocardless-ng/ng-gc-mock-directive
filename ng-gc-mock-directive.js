/**
 * @license ng-gc-mock-directive v0.1.0
 * (c) 2013-2013 GoCardless, Ltd.
 * https://github.com/gocardless-ng/ng-gc-mock-directive.git
 * License: MIT
 */angular.module('mock-template.html', []).run(function($templateCache) {
  $templateCache.put('mock-template.html',
    '<div><div ng-show="user.real_user.admin" ng-init="mockVisible = false" class="mock-bar" ng-class="{\n' +
    '      \'mock-bar--mocked\': user.email != user.real_user.email\n' +
    '    }"><button toggle="mockVisible" class="mock-bar__toggle">{{ user.email }}</button><div class="mock-bar__content" ng-show="mockVisible"><div class="u-padding-Am u-padding-Bn u-cf"><div class="u-cf"><label class="label label--stacked u-pull-start" for="mock-user">Admin account: {{ user.real_user.email }}, viewing:</label><a class="u-pull-end u-text-h5" ng-click="endSession()" href="" ng-show="user.email != user.real_user.email">End session</a></div><form name="mockForm"><input type="text" class="input input--small input--block" ng-model="user.email" required="" placeholder="email or user id" id="mock-user"><div class="error-label" ng-show="mockError">{{ mockError }}</div><div class="u-padding-Vs"></div><input class="btn btn--info input--stacked btn--small btn--block" ng-click="changeSession()" type="submit" value="Change session" ng-disabled="mockForm.$invalid"></form></div></div></div></div>');
});

'use strict';

angular.module('gc.mockController', [
  'ngGcUserApiService',
  'gc.mockService'
]).controller('MockController', [
  '$scope', '$window', 'MockService', 'UserApiService',
  function MockController($scope, $window, MockService,
    UserApiService) {

    UserApiService.findOne().then(function(user) {
      $scope.user = user;
    });

    $scope.endSession = function endSession() {
      MockService.destroy().then(function() {
        $window.location.replace('/');
      });
    };

    $scope.mockErrorMessage = function mockErrorMessage(status) {
      var mappings = {
        404: 'User not found',
        fallback: 'Error, try again'
      };

      return status in mappings ? mappings[status] : mappings.fallback;
    };

    $scope.changeSession = function changeSession() {
      if ($scope.user.real_user) {
        MockService.create({
          data: {
            user: $scope.user.email
          }
        }).then(function changeSuccess() {
          $window.location.replace('/');
        }, function changeError(response) {
          $scope.mockError = $scope.mockErrorMessage(response.status);
        });
      }
    };

  }
]);

'use strict';

angular.module('gc.mock', [
  'gc.toggle',
  'gc.mockController',
  'mock-template.html'
]).directive('mock',
  [function mockDirective() {

    return {
      restrict: 'E',
      templateUrl: 'mock-template.html',
      replace: true,
      controller: 'MockController',
      scope: {}
    };

  }]);

'use strict';

angular.module('gc.mockService', [
  'ngHttpFactory'
]).factory('MockService', [
  'HttpFactory',
  function MockService(HttpFactory) {

    return HttpFactory.create({
      url: '/api/admin/user_mock/:id'
    }, {
      'create': { method: 'POST' },
      'destroy': { method: 'DELETE' }
    });

  }
]);
