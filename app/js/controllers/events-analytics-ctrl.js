'use strict';

angular
.module('app.controllers')
.controller('EventsAnalyticsCtrl', function($scope, $location, Restangular) {
    $scope.compareDates = function (event) {
        var dateObj1 = new Date(event.attributes.startDateTime);
        var dateObj2 = new Date();
        return (dateObj1 < dateObj2);
    };
    $scope.loadingPromise = Restangular.one('events?sort=-startDateTime')
        .get()
        .then(function(data) {
            $scope.events = data;
        });
    Restangular.one('teams')
        .get()
        .then(function(data) {
            $scope.teams = data;
        });
});
