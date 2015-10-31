'use strict';

angular
.module('app.controllers')
.controller('MainCtrl', function($scope, $location) {
    $scope.eboard = true;
    $scope.platforms = [
        {
            "name": "<a href=\"https://api.tnyu.org\">API</a>",
            "description": "Stores/offers access to all Tech@NYU-related data."
        },
        {
            "name": "<a href=\"http://intranet.sexy\">Intranet</a>",
            "description": "Administration system to interact with the API."
        },
        {
            "name": "<a href=\"http://discuss.techatnyu.org/\">Discuss</a>",
            "description": "Platform to discuss issues surrounding Tech@NYU."
        },
        {
            "name": "<a href=\"http://bd.techatnyu.org/\">Zurmo</a>",
            "description": "Customer relationship management."
        },
        {
            "name": "<a href=\"http://jira.tnyu.org/\">Jira</a>",
            "description": "Issue and project tracking platform."
        },
        {
            "name": "<a href=\"http://overlord.tnyu.org/\">Overlord</a>",
            "description": "Celery task runner."
        },
        {
            "name": "<a href=\"https://zulip.tnyu.org/\">Zulip</a>",
            "description": "Instance of Zulip."
        }
    ];
    $scope.staticsites = [
        {
            "name": "<a href=\"http://techatnyu.org\">Homepage</a>",
            "description": "Main Tech@NYU site"
        },
        {
            "name": "<a href=\"http://cal.techatnyu.org\">Cal</a>",
            "description": "Calendar generated using the API"
        },
        {
            "name": "<a href=\"http://checkin.techatnyu.org\">Checkin</a>",
            "description": "Check people into events"
        },
        {
            "name": "<a href=\"http://normal.nyusw.com\">Startup Week</a>",
            "description": "Spring 2015 #nyusw site"
        },
        {
            "name": "<a href=\"http://fair.nyusw.com\">Career Fair</a>",
            "description": "Fall 2015 #nyusw site"
        }
    ];
});

angular.module('app')
.filter('to_trusted', ['$sce', function($sce){
    return function(text) {
        return $sce.trustAsHtml(text);
    };
}]);