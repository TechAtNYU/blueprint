'use strict';

angular
    .module('app.controllers')
    .controller('AddEventsCtrl', function($scope, Restangular) {
      $scope.formFields = {};
      $scope.submit = function() {

        $http.post('https://api.tnyu.org/v3-test/events',{
          'data': {
            'type': 'events',
            'attributes': {
              'title': $scope.formFields.title,
              'shortTitle': $scope.formFields.shortTitle,
              'description': $scope.formFields.description,
              'details': $scope.formFields.details,
              'startDateTime': $scope.formFields.startTime,
              'endDateTime': $scope.formFields.endTime,
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
