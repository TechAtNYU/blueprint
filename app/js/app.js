'use strict';

angular.module('app.services', ['restangular']);
angular.module('app.controllers', ['app.services']);
angular.module('app',
				['ngSanitize', 'ui.router', 'ui.bootstrap', 'restangular',
				 'app.services', 'app.directives',
				 'app.controllers', 'cgBusy', 'MassAutoComplete',
				]).config(function(RestangularProvider) {
	RestangularProvider.setBaseUrl('https://api.tnyu.org/v2');
	// Configuring Restangular to work with JSONAPI spec
	RestangularProvider.setDefaultHeaders({
		'Accept': 'application/vnd.api+json, application/*, */*',
		'Content-Type': 'application/vnd.api+json; ext=bulk'
	});
	RestangularProvider.addResponseInterceptor(function(data) {
		return data.data;
	});
	RestangularProvider.addRequestInterceptor(function(data) {
		return {
			data: data
		};
	});
	RestangularProvider.addRequestInterceptor(function(data, operation) {
		// 'deepening' to perform before sending out any request data.
		// This reverses the above flattening process.
		if (operation === 'getList' || operation === 'get') {
			return data;
		}
		_.forOwn(data, function(value, key) {
			var tokens = key.split('.');
			if (tokens.length > 1) {
				var p = data;
				for (var i = 0; i < tokens.length; ++i) {
					var t = tokens[i];
					if (!p[t]) {
						p[t] = {};
					}
					if (i === tokens.length - 1) {
						p[t] = value;
					} else {
						p = p[t];
					}
				}
				delete data[key];
			}
		});
		return data;
	});
}).config(function(datepickerConfig) {
	datepickerConfig.showWeeks = false;
});
