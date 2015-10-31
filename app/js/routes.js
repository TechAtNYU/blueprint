'use strict';

angular.module('app')
.config(function($stateProvider, $urlRouterProvider) {
	$urlRouterProvider.otherwise('/');
	$stateProvider
		.state('index', {
			url: '/',
			templateUrl: 'partials/tnyu.html',
			controller: 'MainCtrl'
		});
});
