'use strict';

angular
    .module('app.controllers', ['localytics.directives'])
    .controller('ReimburseCtrl', function($scope, Restangular) {
      $scope.formFields = {};
      $scope.submit = function() {
        Restangular.all('expenses').post(
        {
          'data': {
            'type': 'expenses',
            'attributes': {
              'shortName': $scope.formFields.event,
              'amount': $scope.formFields.moneyAmount,
              'date': $scope.formFields.date,
              'withdrawnFrom': $scope.formFields.typeRequest,
            }
          }
        })
      }
    });
