'use strict';

angular
.module('app.controllers')
.controller('EventsAnalyticsCtrl', function($scope, $location, Restangular) {
    $scope.compareDates = function (event, isPast) {
        var dateObj1 = new Date(event.attributes.startDateTime);
        var dateObj2 = new Date();
        if (isPast) {
            return (dateObj1 < dateObj2);
        } else {
            return (dateObj1 > dateObj2);
        }
    };
    $scope.loadingPromise = Restangular.one('events?sort=-startDateTime')
        .get()
        .then(function(data) {
            $scope.events = data.data;
        });
    Restangular.one('teams')
        .get()
        .then(function(data) {
            $scope.teams = data.data;
        });
});
