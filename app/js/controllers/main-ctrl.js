'use strict';

angular
.module('app.controllers')
.controller('MainCtrl', function($scope, $location) {
    $scope.eboard = true;
    $scope.platforms = [
        {
            "name": "Homepage",
            "url": "http://techatnyu.org",
            "description": "Main Tech@NYU site",
            "for": "Public-facing websites"
        },
        {
            "name": "Cal",
            "url": "http://cal.techatnyu.org",
            "description": "Calendar generated using the API",
            "for": "Public-facing websites"
        },
        {
            "name": "Checkin",
            "url": "http://checkin.techatnyu.org",
            "description": "Check people into events",
            "for": "Public-facing websites"
        },
        {
            "name": "Startup Week",
            "url": "http://normal.nyusw.com",
            "description": "Spring 2015 #nyusw site",
            "for": "Public-facing websites"
        },
        {
            "name": "Career Fair",
            "url": "http://fair.nyusw.com",
            "description": "Fall 2015 #nyusw site",
            "for": "Public-facing websites"
        },
        {
            "name": "API",
            "url": "https://api.tnyu.org",
            "description": "Stores/offers access to all Tech@NYU-related data.",
            "for": "General Internal Platforms",
        },
        {
            "name": "Intranet",
            "url": "http://intranet.sexy",
            "description": "Administration system to interact with the API.",
            "for": "General Internal Platforms"
        },
        {
            "name": "Discuss",
            "url": "http://discuss.techatnyu.org",
            "description": "Platform to discuss issues surrounding Tech@NYU.",
            "for": "General Internal Platforms"
        },
        {
            "name": "Zurmo",
            "url": "http://bd.techatnyu.org",
            "description": "Customer relationship management.",
            "for": "Business Development",
        },
        {
            "name": "Jira",
            "url": "http://jira.tnyu.org",
            "description": "Issue and project tracking platform.",
            "for": "General Internal Platforms"
        },
        {
            "name": "Overlord",
            "url": "http://overlord.tnyu.org",
            "description": "Celery task runner.",
            "for": "Infrastructure"
        },
        {
            "name": "Zulip",
            "url": "https://zulip.tnyu.org",
            "description": "Instance of Zulip.",
            "for": "General Internal Platforms"
        }
    ];
});

angular.module('app')
.filter('to_trusted', ['$sce', function($sce){
    return function(text) {
        return $sce.trustAsHtml(text);
    };
}]);