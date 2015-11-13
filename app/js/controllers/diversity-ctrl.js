'use strict';

angular
.module('app.controllers')
.controller('DiversityCtrl', function($scope, $location, Restangular, uiGridConstants) {
    $scope.loadingPromise = Restangular.one('people?include=schools')
        .get()
        .then(function(data) {
            var people = data.data;
            var schools = data.included;
            var schoolIdsToSchoolNames = {};
            _(schools).forEach(function (val) {
                if (val.type === "school-attendances" && val.attributes.schoolName) {
                    schoolIdsToSchoolNames[val.id] = val.attributes.schoolName;
                }
            }).value();

            function addGridOptionsToSchools (school, myData) {
                school.gridOptions = {
                    data: myData,
                    enableSorting: true,
                    columnDefs: [
                        {
                            field: 'University Name',
                            sort: {
                                direction: uiGridConstants.ASC,
                                priority: 1
                            }
                        },
                        { 
                            field: 'Count', 
                            sort: {
                                direction: uiGridConstants.DESC,
                                priority: 0,
                            }
                        }
                    ],
                };
            }

            var diversity = {
                gender: {
                    eboard: {"name": "E-board", "male": 0, "female": 0},
                    general: {"name": "General", "male": 0, "female": 0},
                    alumni: {"name": "Alumni", "male": 0, "female": 0}
                },
                school: {
                    eboard: {"name": "E-board", "schools": {}},
                    general: {"name": "General", "schools": {}},
                    alumni: {"name": "Alumni", "schools": {}}
                }
            };

            function determineGroup(group, type) {
                if (group === 'eboard') return type.eboard;
                else if (group === 'general') return type.general;
                else return type.alumni
            }

            function determineTypeAndGroup(roles, type) {
                var currentGroup = {};
                if (roles && roles.length > 0) {
                    if (roles.indexOf("TEAM_MEMBER") > -1) {
                        currentGroup = determineGroup('eboard', type);
                    } else {
                        currentGroup = determineGroup('alumni', type);
                    }
                } else {
                    currentGroup = determineGroup('general', type);
                }
                return currentGroup;
            }

            _(people).forEach(function(val) {
                // Gender Breakdown
                var roles = val.attributes && val.attributes.roles;
                if (val.attributes && val.attributes.gender) {
                    var currentGender = val.attributes.gender.toLowerCase();
                    var currentGroup = determineTypeAndGroup(roles, diversity.gender);
                    currentGroup[currentGender] += 1;
                }

                // School Breakdown
                if (val.relationships && val.relationships.schools) {
                    var currentGroup = determineTypeAndGroup(roles, diversity.school);
                    var currentSchools = val.relationships.schools.data;
                    _(currentSchools).forEach(function (val) {
                        val = schoolIdsToSchoolNames[val.id];
                        if (!currentGroup.schools[val]) {
                            currentGroup.schools[val] = 1;
                        } else {
                            currentGroup.schools[val] += 1;
                        }
                    }).value();
                }
            }).value();

            // Create diversity for ui-grid
            _(diversity.school).forEach(function (val) {
                var myData = [];
                _(Object.keys(val.schools)).forEach(function (valschools) {
                    var current = {};
                    current["University Name"] = valschools;
                    current["Count"] = val.schools[valschools];
                    myData.push(current);
                }).value();
                addGridOptionsToSchools(val, myData);
            }).value();

            $scope.diversity = diversity;
        });
});
