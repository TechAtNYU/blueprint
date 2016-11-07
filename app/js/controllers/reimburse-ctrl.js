'use strict';

angular
    .module('app.controllers')
    .controller('ReimburseCtrl', function($scope, $http) {
      $scope.formFields = {};
      $scope.submit = function() {

        $http.post('https://api.tnyu.org/v3-test/expenses',{
          'data': {
            'type': 'expenses',
            'attributes': {
              'shortName': $scope.formFields.event,
              'amount': $scope.formFields.moneyAmount,
              'date': $scope.formFields.date,
              'withdrawnFrom': $scope.formFields.typeRequest,
            }
          }
        },
        {
          'headers': {
            'Accept': 'application/vnd.api+json',
            'Content-Type': 'application/vnd.api+json'
          }
        }).then(function(result){
            console.log(result);
        });
        }
      }
    );
      //onReady();
