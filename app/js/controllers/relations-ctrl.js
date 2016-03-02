/**
 * E-board Relations Controller
 * This takes the relationships our club has and generates a list for them.
 * A relationship could be a user's current employer or the liaisons he/she may have.
 */
'use strict';

angular
    .module('app.controllers')
    .controller('RelationsCtrl', function($scope, $location, Restangular, ResourceService) {
        /**
         * Gets all the people in the API alongside with their current employers.
         */
        $scope.loadingPromise = Restangular.one('people?include=currentEmployer')
            .get()
            .then(function(peopleData) {
                var people = peopleData.data;

                /**
                 * Gets all the organizations in the API alongside with their liaisons
                 * which are also people.
                 */
                Restangular.one('organizations?include=liaisons')
                    .get()
                    .then(function(organizationData) {
                        var organizations = organizationData.data;

                        // Relations hash map is just the key with the three different keys:
                        // Advisors, Alumni, and E-board. These just categorize the three big
                        // relationships the club has. We set these as arrays at the beginning
                        // so we can just append objects into them.
                        var relations = {};
                        relations['Advisors'] = [];
                        relations['Alumni'] = [];
                        relations['E-board'] = [];

                        // We need to generate organization Id -> organization
                        // and people Id -> liaisons (which are people objects)
                        var organizationIdToName = ResourceService.resourceIdToResource(organizations);
                        var peopleIdToLiasons = {};

                        // This takes a resource such as an organization and develops a map from
                        // peopleId To Liaisons. Loops through each organization and creates a map from
                        // the Id that the relationship represents (such as person) to the person data (or liaison data).
                        _(organizations).forEach(function(organization) {
                            if(organization.relationships && organization.relationships.liaisons && organization.relationships.liaisons.data && organization.relationships.liaisons.data) {
                                ResourceService.resourceRelationToMap(organization, organization.relationships.liaisons.data, peopleIdToLiasons);
                            }
                        }).value();

                        // This is to map the person to the relationship and start building the relations hashmap.
                        // First thing we do is just loop through the person array.
                        _(people).forEach(function(person) {
                            // We only consider people attached with our e-board at this point.
                            if(person.attributes && person.attributes.roles && person.attributes.roles.length) {
                                // Build a object with the name of the person, and all the organizations he/she represents.
                                var currentRelation = {};
                                currentRelation.name = person.attributes.name;
                                currentRelation.organizations = [];

                                // Look for the current employer that the person has. This is important as this represents a direct
                                // relationship that they have. This is different to being a liaison. We push this relationship into
                                // the organizations that they are in.
                                if(person.relationships && person.relationships.currentEmployer && person.relationships.currentEmployer.data && person.relationships.currentEmployer.data.id) {
                                    currentRelation.organizations.push(organizationIdToName[person.relationships.currentEmployer.data.id].attributes.name);
                                }

                                // If the person is a liaison for any organization then we want to loop through and add their
                                // relationships to the organizations they represent.
                                if(person.id in peopleIdToLiasons) {
                                    _(peopleIdToLiasons[person.id]).forEach(function(singleLiason) {
                                        if(currentRelation.organizations.indexOf(singleLiason.attributes.name) === -1) {
                                            currentRelation.organizations.push(singleLiason.attributes.name);
                                        }
                                    }).value();
                                }

                                // Here we easily decide what role we have to insert their data into.
                                // The three are ALUMNI, ADVISORS, and EBOARD. Advisors still have a TEAM_MEMBER
                                // role since they are still technically working for our e-board.
                                if(person.attributes.roles.length === 1 && person.attributes.roles.indexOf('ALUM') > -1) {
                                    relations['Alumni'].push(currentRelation);
                                }
                                else {
                                    if(person.attributes.roles.length === 2 && person.attributes.roles.indexOf('ADVISORS') > -1) {
                                        relations['Advisors'].push(currentRelation);
                                    }
                                    else {
                                        relations['E-board'].push(currentRelation);
                                    }
                                }
                            }
                        }).value();

                        // Add the relations object to the current scope.
                        $scope.relations = relations;
                    });
            });
    });