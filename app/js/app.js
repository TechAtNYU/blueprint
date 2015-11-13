'use strict';

angular.module('app.services', ['restangular']);
angular.module('app.controllers', ['app.services']);
angular.module('app',
				['ngSanitize', 'ui.router', 'ui.bootstrap', 'restangular',
				 'app.services', 'app.directives',
				 'app.controllers', 'cgBusy', 'angular.filter',
				 'ezfb', 'nvd3', 'ui.grid',
				]).config(function(RestangularProvider) {
	RestangularProvider.setBaseUrl('https://api.tnyu.org/v3');
	// Configuring Restangular to work with JSONAPI spec
	RestangularProvider.setDefaultHeaders({
		'Accept': 'application/vnd.api+json, application/*, */*',
		'Content-Type': 'application/vnd.api+json; ext=bulk'
	});
	RestangularProvider.addResponseInterceptor(function(data) {
		return data;
	});
}).config(function(datepickerConfig) {
	datepickerConfig.showWeeks = false;
}).config(function (ezfbProvider) {
  ezfbProvider.setInitParams({
    appId: '723930997711071',
    version: 'v2.5'
  });  
});
