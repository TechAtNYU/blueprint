'use strict';

angular.module('app.services', ['restangular']);
angular.module('app.controllers', ['app.services']);
angular.module('app', [
    'ngSanitize',
    'ui.router',
    'ui.bootstrap',
    'restangular',
    'app.services',
    'app.directives',
    'app.filters',
    'app.controllers',
    'cgBusy',
    'angular.filter',
    'ezfb',
    'nvd3',
    'ui.grid',
    'highcharts-ng',
    'angularMoment',
    'localytics.directives'
]).config(function(RestangularProvider) {
    // Setting the Restangular URL base. In production set to /v3.
    // In staging or development set to /v3-test
    RestangularProvider.setBaseUrl('https://api.tnyu.org/v3-test');

    // Configuring Restangular to work with JSONAPI spec
    RestangularProvider.setDefaultHeaders({
        'Accept': 'application/vnd.api+json, application/*, */*',
        'Content-Type': 'application/vnd.api+json'
    });

    RestangularProvider.addResponseInterceptor(function(data) {
        return data;
    });
}).config(function(datepickerConfig) {
    datepickerConfig.showWeeks = false;
}).config(function(ezfbProvider) {
    ezfbProvider.setInitParams({
        appId: '723930997711071',
        version: 'v2.5'
    });
});
