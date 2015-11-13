'use strict';

angular
.module('app.controllers')
.controller('EventAnalyticsCtrl', function($scope, $location, $stateParams, $log, Restangular, ezfb) {

	// Facebook Authentication
	$scope.displayLoginButton = false;
	updateLoginStatus(updateApiMe);
	$scope.login = function () {
		ezfb.login(function (res) {
			if (res.authResponse) {
				updateLoginStatus(updateApiMe);
			}
		}, {scope: 'email, user_likes'});
	};

	$scope.logout = function () {
		ezfb.logout(function () {
			updateLoginStatus(updateApiMe);
		});
	};

	var autoToJSON = ['loginStatus', 'apiMe']; 
	angular.forEach(autoToJSON, function (varName) {
		$scope.$watch(varName, function (val) {
			$scope[varName + 'JSON'] = JSON.stringify(val, null, 2);
		}, true);
	});
  
 	function updateLoginStatus (more) {
		ezfb.getLoginStatus(function (res) {
	  		$scope.loginStatus = res;
	  		(more || angular.noop)();
		});
  	}

  	function updateApiMe () {
		ezfb.api('/me', function (res) {
	  		$scope.apiMe = res;
		});
  	}

	ezfb.getLoginStatus()
	.then(function (res) {
		if (res.status === 'not_authorized') {
		  $scope.displayLoginButton = true;
		} else {
		  $scope.displayLoginButton = true;
		}
	});

	$scope.getDataFromFacebook = function (facebookEvent) {
		$scope.facebookEvent = {};
		var facebookEventID = facebookEvent.attributes.rsvpUrl.split("/");
		if (facebookEventID.last() === "") {
			facebookEventID = facebookEventID[facebookEventID.length - 2];
		} else {
			facebookEventID = facebookEventID.last();
		}
		ezfb.getLoginStatus()
		.then(function (res) {
			if (res.status === 'connected') {
			  	ezfb.api('/' + facebookEventID + '?fields=noreply.limit(1000),declined.limit(1000),attending.limit(1000),maybe.limit(1000)').then(function (resp) {
			  		console.log(resp)
			  		$scope.facebookEvent = resp;
			  		return resp;
			  	});
			}
		});
	};

	var resourceId = $stateParams.id;
	$scope.loadingPromise = Restangular.one('events/' + resourceId)
		.get()
		.then(function(data) {
			$scope.event = data.data;
		});
});
