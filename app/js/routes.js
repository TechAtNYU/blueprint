'use strict';

angular.module('app')
.config(function($stateProvider, $urlRouterProvider) {
	$urlRouterProvider.otherwise('/');
	$stateProvider
    .state('index', {
        url: '/',
        templateUrl: 'partials/tnyu.html',
        controller: 'MainCtrl'
    })
    .state('events-analytics', {
        url: '/events-analytics',
        templateUrl: 'partials/events-analytics.html',
        controller: 'EventsAnalyticsCtrl'
    })
    .state('event-analytics', {
        url: '/event-analytics/:id',
        templateUrl: 'partials/event-analytics.html',
        controller: 'EventAnalyticsCtrl'
    })
    .state('initiative-analytics', {
        url: '/initiative-analytics/:id',
        templateUrl: 'partials/initiative-analytics.html',
        controller: 'InitiativeAnalyticsCtrl'
    })
    .state('eboard', {
        url: '/eboard',
        templateUrl: 'partials/eboard.html',
        controller: 'EboardCtrl'
    });
});
