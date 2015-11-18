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
	$scope.loadingPromise = Restangular.one('events/' + resourceId + '?include=survey,feedback')
		.get()
		.then(function(data) {
			$scope.loadingPromise = Restangular.one('questions')
				.get()
				.then(function(questions) {
					questions = questions.data;
					var eventData = data.data;
					var include = data.included;
					var survey = include[0];
					var surveyRepsonses = include.slice(1, include.length-1)
					var questionIdsToQuestions = {};

					_(questions).forEach(function (val) {
						questionIdsToQuestions[val.id] = val.attributes.text;
					}).value();

					// Push questions
					var questions = [];
					var questionArrayPosition = {};
					if (survey && survey.relationships && survey.relationships.questions && survey.relationships.questions.data && survey.relationships.questions.data.length > 0) {
						_(survey.relationships.questions.data).forEach(function (val) {
							var currentQuestion = {};
							currentQuestion.name = questionIdsToQuestions[val.id];
							currentQuestion.answers = [];
							questions.push(currentQuestion);
							questionArrayPosition[val.id] = questions.length - 1;
						}).value();
					}

					// Find answers
					if (surveyRepsonses) {
						_(surveyRepsonses).forEach(function (val) {
							if (val.relationships && val.relationships.answers && val.relationships.answers.data && val.relationships.answers.data.length > 0) {
								_(val.relationships.answers.data).forEach(function (singleAnswer, key) {
									Restangular.one('answers/' + singleAnswer.id)
										.get()
										.then(function(answer) {
											answer = answer.data;
											var answerQuestionId = answer.relationships && answer.relationships.question && answer.relationships.question.data.id;
											answerQuestionId = questionArrayPosition[answerQuestionId];
											questions[answerQuestionId].answers.push({answer: answer.attributes.answer, id: answer.id});
										});
								}).value();
							}
						}).value();
					}

					$scope.questions = questions;
					$scope.event = eventData;
				});
		});
});
