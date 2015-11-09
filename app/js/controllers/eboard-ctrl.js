'use strict';

angular
.module('app.controllers')
.controller('EboardCtrl', function($scope, $location, Restangular) {
    function getMainRole (roles) {
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
            var mainRole = {};
            _(roles).forEach(function (val) {
                if (val.indexOf("LEAD") > -1) {
                    val = val.replace("_LEAD", "");
                    mainRole.isLead = true;
                } 
                mainRole.name = $scope.teams[val];
            }).value();
            return mainRole;
        }
    }

    $scope.loadingPromise = Restangular.one('people')
        .get()
        .then(function(people) {
            Restangular.one('teams')
            .get()
            .then(function(teams) {
                var teamRoleNameToName = {};
                _(teams).forEach(function (val) {
                    teamRoleNameToName[val.attributes.roleName] = val.attributes.name;
                }).value();
                $scope.teams = teamRoleNameToName;

                // Get roles for E-board Members
                var eboardMembers = [];
                _(people).forEach(function(val) {
                    if (val.attributes && val.attributes.roles && val.attributes.roles.length > 0) {
                        val.attributes.mainRole = getMainRole(val.attributes.roles);
                        if (Object.keys(val.attributes.mainRole).length > 0) {
                            eboardMembers.push(val);
                        }
                    }
                }).value();
                $scope.people = eboardMembers;
            });
        });
});
