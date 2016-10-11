/**
 * Single Initiative Analytics Controller
 *
 */
'use strict';

angular
    .module('app.controllers')
    .controller('EventFormCtrl', function($scope, $stateParams, Restangular, DateService, ResourceService) {
        function ready() {
            Restangular.one('teams')
            .get()
            .then(function(data) {
                $scope.teams = data.data;
            });
            Restangular.one('presenters')
            .get()
            .then(function(data) {
                $scope.presenters = data.data;
            });
            Restangular.one('organizations')
            .get()
            .then(function(data) {
                $scope.organizations = data.data;
            });
            Restangular.one('venues')
            .get()
            .then(function(data) {
                $scope.venues = data.data;
            });
        }
        $scope.event = {} // event to be submitted
        $scope.submit = function() {

        }
        $scope.draft = function() {

        }
        ready();
    });