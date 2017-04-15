/**
 * Single Event Analytics Controller
 * Displays statistics regarding a single event
 */
'use strict';

angular
    .module('app.controllers')
    .controller('EventAnalyticsCtrl', function($scope, $location, $stateParams, $log, Restangular, ezfb, ResourceService) {
        /**
         * Methods to get data from Facebook.
         */
        // Login button we display on the front-end. We set it to default
        // Then toggle it depending on if the user is logged in or not.
        $scope.displayLoginButton = false;

        /**
         * Takes the different states that are possible for the application
         * and puts them into the angular scope.
         */
        var autoToJSON = ['loginStatus', 'apiMe'];
        angular.forEach(autoToJSON, function(varName) {
            $scope.$watch(varName, function(val) {
                $scope[varName + 'JSON'] = JSON.stringify(val, null, 2);
            }, true);
        });

        /**
         * Method to update the login status in the angular scope.
         */
        function updateLoginStatus(more) {
            ezfb.getLoginStatus(function(res) {
                $scope.loginStatus = res;
                (more || angular.noop)();
            });
        }

        // Initially just sets the loginStatus. We can then toggle displayLoginButton
        // or not depending on the result of this.
        updateLoginStatus(updateApiMe);

        /**
         * Method to login to the Facebook API.
         */
        $scope.login = function() {
            ezfb.login(function(res) {
                if(res.authResponse) {
                    updateLoginStatus(updateApiMe);
                }
            }, {
                scope: 'email, user_likes'
            });
        };

        /**
         * Method to logout to the Facebook API.
         */
        $scope.logout = function() {
            ezfb.logout(function() {
                updateLoginStatus(updateApiMe);
            });
        };

        /**
         * Method to get the data of the current logged in user and put it into
         * the main API state.
         */
        function updateApiMe() {
            ezfb.api('/me', function(res) {
                $scope.apiMe = res;
            });
        }

        /**
         * Initially gets login status for the user.
         */
        ezfb.getLoginStatus()
            .then(function(res) {
                if(res.status === 'not_authorized') {
                    $scope.displayLoginButton = true;
                }
                else {
                    $scope.displayLoginButton = true;
                }
            });

        /**
         * Method to get data from the Facebook API. This gets the data for a particular
         * event that we are running.
         */
        $scope.getDataFromFacebook = function(facebookEvent) {
            // We take an event and split it by the slash.
            $scope.facebookEvent = {};
            var facebookEventID = facebookEvent.attributes.rsvpUrl.split('/');

            // This is just some logic to try and figure out if we have the URL or not.
            // The different cases here are '/1234/' or '/1234'. This logic exists to try
            // and get around the slash at the end.
            if(facebookEventID.last() === '') {
                facebookEventID = facebookEventID[facebookEventID.length - 2];
            }
            else {
                facebookEventID = facebookEventID.last();
            }

            // Then we try and search that event on the Facebook Graph API.
            ezfb.getLoginStatus()
                .then(function(res) {
                    if(res.status === 'connected') {
                        ezfb.api('/' + facebookEventID + '?fields=noreply.limit(1000),declined.limit(1000),attending.limit(1000),maybe.limit(1000)').then(function(resp) {
                            $scope.facebookEvent = resp;
                            return resp;
                        });
                    }
                });
        };

        var resourceId = $stateParams.id;

        /**
         * This is what primarily runs to try and get data from the API for a particular event.
         * It gets the survey data and feedback data along with the data for the event itself.
         */
        $scope.loadingPromise = Restangular.one('events/' + resourceId + '?include=survey,feedback')
            .get()
            .then(function(data) {

                /**
                 * We also load the questions so we can match them to each of the surveys.
                 */
                $scope.loadingPromise = Restangular.one('questions')
                    .get()
                    .then(function(questions) {
                        questions = questions.data;
                        var eventData = data.data;
                        var include = data.included;
                        var survey = include[0];
                        var surveyRepsonses = include.slice(1, include.length);
                        var questionIdsToQuestions = ResourceService.resourceIdToResource(questions);

                        /**
                         * This part just goes to the API and gets the question data.
                         * The logic is a little tricky since it needs to extract the names
                         * and the answers for each particular question.
                         */
                        var questions = [];
                        var questionArrayPosition = {};
                        if(survey && survey.relationships && survey.relationships.questions && survey.relationships.questions.data && survey.relationships.questions.data.length > 0) {

                            // Loop through all of the questions for a particular survey
                            _(survey.relationships.questions.data).forEach(function(val) {

                                // Creates an object of the question and pushes it into the current question.
                                // We create an empty answers array to pop in the questions in the next loop.
                                var currentQuestion = {};
                                currentQuestion.name = questionIdsToQuestions[val.id].attributes.text;
                                currentQuestion.answers = [];
                                questions.push(currentQuestion);

                                // Maps the ID of a question in the API to the position of the question in the questions array.
                                questionArrayPosition[val.id] = questions.length - 1;
                            });
                        }

                        /**
                         * Matches each particular question to the answers from the survey.
                         */
                        if(surveyRepsonses) {
                            // Loop through all the survey responses for a particular survey.
                            _(surveyRepsonses).forEach(function(val) {
                                if(val.relationships && val.relationships.answers && val.relationships.answers.data && val.relationships.answers.data.length > 0) {

                                    // Loop through each answer
                                    _(val.relationships.answers.data).forEach(function(singleAnswer, key) {
                                        // We need to get the answer from the API. They are not included in the surveyresponses response.
                                        Restangular.one('answers/' + singleAnswer.id)
                                            .get()
                                            .then(function(answer) {
                                                // We unfold the answer and get the answer ID. Then we can use the questionArrayPosition array to figure out the position in the questions array.
                                                // Then we append each answer.
                                                answer = answer.data;
                                                var answerQuestionId = answer.relationships && answer.relationships.question && answer.relationships.question.data.id;
                                                answerQuestionId = questionArrayPosition[answerQuestionId];
                                                questions[answerQuestionId].answers.push({
                                                    answer: answer.attributes.answer,
                                                    id: answer.id
                                                });
                                            });
                                    });
                                }
                            });
                        }

                        // We put the event data and the questions data into the global scope.
                        $scope.questions = questions;
                        $scope.event = eventData;
                    });
            });
    });
