/**
 * Home Page Controller
 * Checks if the user has logged into the API, and if so then the user has then displays the initial documentation.
 */
'use strict';

angular
    .module('app.controllers')
    .controller('MainCtrl', function($scope, $location, Restangular) {
        /**
         * Get the API profile of the user.
         * If not authenticated: log user into the API.
         * If not on e-board: set eboard flag to false.
         */
        $scope.loadingPromise = Restangular.one('people/me')
            .get()
            .then(function(data) {
                data = data.data;
                $scope.eboard = true;
                $scope.user = data;
            })
            .catch(function(res) {
                var status = res.data.errors[0].status;
                if(status === '401') {
                    $scope.signIn();
                }
                if(status === '403') {
                    $scope.eboard = false;
                }
            });

        /**
         * Uses a basic redirect to authenticate to the API.
         */
        $scope.signIn = function() {
            var url = 'https://api.tnyu.org/v3/auth/facebook?success=' + window.encodeURIComponent($location.absUrl());
            window.location = url;
        };

        /**
         * Uses a basic redirect to log out of the API.
         */
        $scope.signOut = function() {
            var url = 'https://api.tnyu.org/v3/auth/facebook/logout?doExternalServiceLogout=true&success=' + window.encodeURIComponent('http://techatnyu.org/');
            window.location = url;
        };

        /**
         * List of available platforms that will be presented to the user on the homepage.
         */
        $scope.platforms = [{
            'name': 'Homepage',
            'url': 'http://techatnyu.org',
            'description': 'Main Tech@NYU site',
            'for': 'Public-facing websites'
        }, {
            'name': 'Cal',
            'url': 'http://cal.techatnyu.org',
            'description': 'Calendar generated using the API',
            'for': 'Public-facing websites'
        }, {
            'name': 'Checkin',
            'url': 'http://checkin.techatnyu.org',
            'description': 'Check people into events',
            'for': 'Public-facing websites'
        }, {
            'name': 'RSVP',
            'url': 'http://rsvp.techatnyu.org',
            'description': 'RSVP members to one of our events',
            'for': 'Public-facing websites'
        }, {
            'name': 'Job Board',
            'url': 'http://jobs.techatnyu.org/',
            'description': 'Find a job.',
            'for': 'Public-facing websites'
        }, {
            'name': 'Learn',
            'url': 'http://learn.techatnyu.org/',
            'description': 'Learn a skill.',
            'for': 'Public-facing websites'
        }, {
            'name': 'Startup Week 2015',
            'url': 'http://normal.nyusw.com',
            'description': 'Spring 2015 #nyusw site',
            'for': 'Public-facing websites'
        }, {
            'name': 'Startup Week 2016',
            'url': 'http://nyusw.com',
            'description': 'Spring 2016 #nyusw site',
            'for': 'Public-facing websites'
        }, {
            'name': 'Career Fair',
            'url': 'http://fair.nyusw.com',
            'description': 'Fall 2015 #nyusw site',
            'for': 'Public-facing websites'
        }, {
            'name': 'Ship',
            'url': 'http://ship.techatnyu.org',
            'description': 'List of the stuff we have shipped',
            'for': 'Public-facing websites'
        }, {
            'name': 'Demodays',
            'url': 'http://demodays.co',
            'description': 'Permanent DemoDays site',
            'for': 'Public-facing websites'
        }, {
            'name': 'API',
            'url': 'https://api.tnyu.org',
            'description': 'Stores/offers access to all Tech@NYU-related data.',
            'for': 'General Internal Platforms'
        }, {
            'name': 'Intranet',
            'url': 'http://intranet.sexy',
            'description': 'Administration system to interact with the API.',
            'for': 'General Internal Platforms'
        }, {
            'name': 'Discuss',
            'url': 'http://discuss.techatnyu.org',
            'description': 'Platform to discuss issues surrounding Tech@NYU.',
            'for': 'General Internal Platforms'
        }, {
            'name': 'Jira',
            'url': 'http://jira.tnyu.org',
            'description': 'Issue and project tracking platform.',
            'for': 'General Internal Platforms'
        }, {
            'name': 'Overlord',
            'url': 'http://overlord.tnyu.org',
            'description': 'Celery task runner.',
            'for': 'Infrastructure'
        }, {
            'name': 'Frontify',
            'url': 'https://app.frontify.com/d/MlLYiAFc3BzO/tech-nyu-style-guide',
            'description': 'Our internal style guide.',
            'for': 'Marketing'
        }];
    });
