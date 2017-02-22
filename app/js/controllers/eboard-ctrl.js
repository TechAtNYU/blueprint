/**
 * E-board Team Page Controller
 * Generates a e-board team page using data from the API.
 */
'use strict';

angular
    .module('app.controllers')
    .controller('EboardCtrl', function($scope, $location, Restangular) {
        /**
         * Set the roles of a particular individual. This takes a person object and returns
         * all of their roles.
         */
        function setRoles(person) {
            var roles = person.attributes.roles;
            // Remove if alumni or advisor. This is a string e-board list not an alumni/advisor list.
            // To note: Alumni/Advisors still have roles. They are still able to login to the
            // Tech@NYU Blueprint.
            if(roles.indexOf('ALUM') > -1 || roles.indexOf('ADVISORS') > -1) {
                return false;
            }
            else {

                // Their TEAM_MEMBER role is not important. So we will slice it out
                // of the roles object. It is not useful for us.


                var teamMemberIndex = roles.indexOf('TEAM_MEMBER');
                if(teamMemberIndex > -1) {
                    roles.splice(teamMemberIndex, 1);
                }


                var fullIndexes = []
                roles.findIndex(function(value, index) {
                    if (value.match('FULL_')) {
                        fullIndexes.push(index)
                    }
                });

                for (var i = fullIndexes.length-1; i >= 0; i--) {
                    roles.splice(fullIndexes[i], 1);
                }

                var trialIndexes = []
                roles.findIndex(function(value, index) {
                    if (value.match('TRIAL_')) {
                        trialIndexes.push(index)
                    }
                });

                for (var i = trialIndexes.length-1; i >= 0; i--) {
                    roles.splice(trialIndexes[i], 1);
                }

                // TEAM_LEAD is the same as TEAM_MEMBER. Does not help us determine
                // what team they lead. It just notifies us that they are a team lead.
                var teamLeadIndex = roles.indexOf('TEAM_LEAD');
                if(teamLeadIndex > -1) {
                    roles.splice(teamLeadIndex, 1);
                }

                // We loop through the roles of the individual, and determine their position
                // and append that into the teams object in the main scope.
                _(roles).forEach(function(role, index) {
                    // Determining if the user is a lead
                    var isLead = false;
                    var valWithoutLead = role.replace('_LEAD', '');
                    if(role.indexOf(valWithoutLead + '_LEAD') > -1) {
                        // Here the user is said to be the lead. They have a _LEAD in their role.
                        // An example of this would be DESIGN_DAYS_LEAD.
                        isLead = true;

                        // Every individual has both ADMIN_LEAD and ADMIN. So if you are in the
                        // Infrastructure team you would have INFRASTRUCTURE_LEAD and INFRASTRUCTURE.
                        // Here we are looping through the teams members array and looking to see a
                        // duplicate person, and then slicing that member out.
                        _($scope.teams[valWithoutLead].members).forEach(function(eachMember) {
                            if(eachMember.name === person.attributes.name && eachMember.isLead === false) {
                                var indexOfMember = $scope.teams[valWithoutLead].members.indexOf(eachMember);
                                $scope.teams[valWithoutLead].members.splice(indexOfMember, 1);
                            }
                        });
                    }

                    // Add the person to team. This simply just adds the person to the members array
                    // for that particular team in the team scope.
                    var aPerson = {
                        'name': person.attributes.name,
                        'uniqId': index,
                        'apiId': person.id,
                        'isLead': isLead
                    }

                    if (person.attributes.imgUrl) {
                        aPerson.imgUrl = person.attributes.imgUrl
                    }

                    else {
                        aPerson.imgUrl = '/img/default-image.png'
                    }

                    $scope.teams[valWithoutLead].members.push(aPerson);

                    


                });
            }
        }

        /**
         * Loads all e-board members and teams from the API
         */
        $scope.loadingPromise = Restangular.one('people')
            .get()
            .then(function(people) {
                people = people.data;

                // Getting all of the teams from the API
                Restangular.one('teams')
                    .get()
                    .then(function(teams) {
                        teams = teams.data;

                        // Creating a hash map that uses the team role name as a key and the values are:
                        // name and members. The name is the name of the team itself, and the members are
                        // the e-board members that represent them.
                        var teamRoleNameToName = {};
                        _(teams).forEach(function(team) {
                            teamRoleNameToName[team.attributes.roleName] = {};
                            teamRoleNameToName[team.attributes.roleName].name = team.attributes.name;
                            teamRoleNameToName[team.attributes.roleName].members = [];
                        });
                        $scope.teams = teamRoleNameToName;

                        // Loop through all of the people and set the roles for each individual.
                        // Noting the fact that each person can be in multiple teams.
                        // Also we want to ignore all individuals who no roles.
                        _(people).forEach(function(person) {
                            if(person.attributes && person.attributes.roles && person.attributes.roles.length > 0) {
                                person.attributes.mainRoles = setRoles(person);
                            }
                        });
                    });
            });
    });
