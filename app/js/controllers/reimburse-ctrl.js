'use strict';

angular
    .module('app.controllers')
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
              'withdrawnFrom': $scope.formFields.typeRequest
              }
          }

        
        }).then(function(){ 
          $scope.message = "Your entry has been sent!";
        });
      }
      
    });
