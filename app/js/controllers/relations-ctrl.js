'use strict';

angular
.module('app.controllers')
.controller('RelationsCtrl', function($scope, $location, Restangular) {
    $scope.loadingPromise = Restangular.one('people?include=currentEmployer')
        .get()
        .then(function(peopleData) {
            var people = peopleData.data;
            var currentEmployer = peopleData.included;
            Restangular.one('organizations?include=liaisons')
            .get()
            .then(function(organizationData) {
                var organizations = organizationData.data;
                var liaisons = organizationData.included;
                var relations = {};
                relations['Advisors'] = [];
                relations['Alumni'] = [];
                relations['E-board'] = [];

                var organizationIdToName = {};
                var peopleIdToLiasons = {};
                _(organizations).forEach(function (val) {
                    if (val.attributes && val.attributes.name) {
                        organizationIdToName[val.id] = val.attributes.name;
                    }
                    if (val.relationships && val.relationships.liaisons && val.relationships.liaisons.data && val.relationships.liaisons.data) {
                        _(val.relationships.liaisons.data).forEach(function (singleLiason) {
                            if (!(singleLiason.id in peopleIdToLiasons)) {
                                peopleIdToLiasons[singleLiason.id] = [];
                            }
                            peopleIdToLiasons[singleLiason.id].push(val.attributes.name);
                        }).value();
                    }
                }).value();

                _(people).forEach(function (val) {
                    if (val.attributes && val.attributes.roles && val.attributes.roles.length) {
                        var currentRelation = {};
                        currentRelation['name'] = val.attributes.name;
                        currentRelation['organizations'] = [];
                        if (val.relationships && val.relationships.currentEmployer && val.relationships.currentEmployer.data && val.relationships.currentEmployer.data.id) {
                            currentRelation['organizations'].push(organizationIdToName[val.relationships.currentEmployer.data.id]);
                        }
                        if (val.id in peopleIdToLiasons) {
                            _(peopleIdToLiasons[val.id]).forEach(function (singleLiason) {
                                if (currentRelation['organizations'].indexOf(singleLiason) == -1) {
                                    currentRelation['organizations'].push(singleLiason);
                                }
                            }).value();
                        }
                        if (val.attributes.roles.length == 1 && val.attributes.roles.indexOf('ALUM') > -1) {
                            relations['Alumni'].push(currentRelation);
                        } else {
                            if (val.attributes.roles.length == 2 && val.attributes.roles.indexOf('ADVISORS') > -1) {
                                relations['Advisors'].push(currentRelation);
                            } else {
                                relations['E-board'].push(currentRelation);
                            }
                        }
                    }
                }).value();
                console.log(relations);
                $scope.relations = relations;
            });
        });
});
