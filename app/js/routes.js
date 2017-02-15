'use strict';

// Front-end angular routes
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
            })
            .state('relations', {
                url: '/relations',
                templateUrl: 'partials/relations.html',
                controller: 'RelationsCtrl'
            })
            .state('diversity', {
                url: '/diversity',
                templateUrl: 'partials/diversity.html',
                controller: 'DiversityCtrl'
            })
            .state('progress', {
                url: '/progress',
                templateUrl: 'partials/progress.html',
                controller: 'ProgressCtrl'
            })
            .state('reimbursment', {
                url: '/reimburse',
                templateUrl: 'partials/reimburse.html',
                controller: 'ReimburseCtrl'
            });
    });
