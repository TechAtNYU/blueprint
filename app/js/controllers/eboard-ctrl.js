'use strict';

angular
.module('app.controllers')
.controller('EboardCtrl', function($scope, $location, Restangular) {
    function setRoles (val) {
        var roles = val.attributes.roles;
        // Remove if alumni
        if (roles.indexOf("ALUM") > -1 || roles.indexOf("ADVISORS") > -1) {
            return false;
        } else {
            // Some cleanup
            var teamMemberIndex = roles.indexOf("TEAM_MEMBER");
            if (teamMemberIndex > -1) {
                roles.splice(teamMemberIndex, 1);
            }
            var teamLeadIndex = roles.indexOf("TEAM_LEAD");
            if (teamLeadIndex > -1) {
                roles.splice(teamLeadIndex, 1);
            }

            // Process and find team
            _(roles).forEach(function (role, index) {
                var isLead = false;
                var valWithoutLead = role.replace("_LEAD", "");
                if (role.indexOf(valWithoutLead + "_LEAD") > -1) {
                    isLead = true;
                    _($scope.teams[valWithoutLead].members).forEach(function(eachMember) {
                        if (eachMember.name === val.attributes.name && eachMember.isLead === false) {
                            var indexOfMember = $scope.teams[valWithoutLead].members.indexOf(eachMember);
                            $scope.teams[valWithoutLead].members.splice(indexOfMember, 1);
                        }
                    }).value();
                }
                $scope.teams[valWithoutLead].members.push({
                    "name": val.attributes.name,
                    "uniqId": index,
                    "isLead": isLead
                });
            }).value();
        }
    }

    $scope.loadingPromise = Restangular.one('people')
        .get()
        .then(function(people) {
            people = people.data;
            Restangular.one('teams')
            .get()
            .then(function(teams) {
                teams = teams.data;
                var teamRoleNameToName = {};
                _(teams).forEach(function (val) {
                    teamRoleNameToName[val.attributes.roleName] = {};
                    teamRoleNameToName[val.attributes.roleName].name = val.attributes.name;
                    teamRoleNameToName[val.attributes.roleName].members = [];
                }).value();
                $scope.teams = teamRoleNameToName;

                // Get roles for E-board Members
                _(people).forEach(function(val) {
                    if (val.attributes && val.attributes.roles && val.attributes.roles.length > 0) {
                        val.attributes.mainRoles = setRoles(val);
                    }
                }).value();
            });
        });
});
