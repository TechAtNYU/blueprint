/**
 * Single Initiative Analytics Controller
 *
 */
'use strict';

angular
    .module('app.controllers')
    .controller('EventFormCtrl', function($scope, $stateParams, Restangular, DateService, ResourceService, $http) {
        function ready() {
            $scope.fields = {
                "levels": [
                    "Beginner",
                    "Intermediate",
                    "Advanced"
                ],
                "aims": [
                    "Learn New Skills",
                    "Build Something",
                    "Launch a Company",
                    "Party",
                    "Demo & See Demos",
                    "Find a Job",
                    "Use Tech for Social Good",
                    "Improve Tech/Startup Culture",
                    "Plan/Work on Tech@NYU Endeavors"
                ],
                "venueCategories": [
                    "Bar", "Classroom", "Company Office", "School Auditorium",
                    "Incubator or Accelerator", "Other"
                ]
            }
            const resources = ['teams', 'presenters', 'organizations', 'venues', 'skills',]
            resources.forEach(function(resource) {
                Restangular.one(resource)
                    .get()
                    .then(function(data) {
                        $scope.fields[resource] = data.data;
                    });
            });
        }

        $scope.event = {} 
        $scope.submit = function() {
            $scope.event['status'] = "announced";
            $http.post('https://api.tnyu.org/v3-test/events', {
                data: $scope.event
            })
            .success(function(data) {
                
            })
            .error(function(data) {
                console.log(data)
            });
        }
        $scope.draft = function() {
            $scope.event['status'] = "draft";
            $http.post('https://api.tnyu.org/v3-test/events', {
                data: { 'data': $scope.event }
            })
            .success(function(data) {
                
            })
            .error(function(data) {
                console.log(data)
            });
        }
        ready();
    });