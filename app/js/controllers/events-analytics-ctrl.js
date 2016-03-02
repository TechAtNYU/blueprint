/**
 * Events Analytics Controller
 * Loads team and events data from the API to display on the view partial
 * events-analytics.html.
 */
'use strict';

angular
    .module('app.controllers')
    .controller('EventsAnalyticsCtrl', function($scope, $location, Restangular, DateService) {
        /**
         * Loads all of the event data from the API:
         * It is loading the events in a descending order.
         * Where the first event object is the newest event.
         */
        $scope.loadingPromise = Restangular.one('events?sort=-startDateTime')
            .get()
            .then(function(data) {
                // Inserts the 'data' field from the API into the events scope.
                $scope.events = data.data;
            });

        // Loads all of the teams data from the API
        Restangular.one('teams')
            .get()
            .then(function(data) {
                // Inserts the 'data' field from the API into the teams scope.
                $scope.teams = data.data;
            });

        $scope.compareDates = DateService.compareDates;
    });