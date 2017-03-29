/**
 * Diversity Dashboard Controller
 * Creates a dashboard to get make simple graphs for the diversity data in the API.
 * Diversity could mean: education or gender (easy to add new ones).
 */
'use strict';

angular
    .module('app.controllers')
    .controller('DiversityCtrl', function($scope, $location, Restangular, uiGridConstants, ResourceService) {
        /**
         * Gets all the people in the API alongside their details so we can generate graphs for
         * diversity.
         */
        $scope.loadingPromise = Restangular.one('people?include=schools')
            .get()
            .then(function(data) {
                var people = data.data;
                var schools = data.included;
                var schoolIdsToSchoolNames = ResourceService.resourceIdToResource(schools);

                // Function to take a school, and some data and return a gridOptions object.
                // This is used to generate a chart to show off the show diversity.
                function addGridOptionsToSchools(school, myData) {
                    school.gridOptions = {
                        data: myData,
                        enableSorting: true,
                        columnDefs: [{
                            field: 'University Name',
                            sort: {
                                direction: uiGridConstants.ASC,
                                priority: 1
                            }
                        }, {
                            field: 'Count',
                            sort: {
                                direction: uiGridConstants.DESC,
                                priority: 0
                            }
                        }]
                    };
                }

                // Sample object layout for the diversity object. Everything is empty at the beginning.
                // Just creating this at the beginning to give structure to the definition of diversity.
                var diversity = {
                    gender: {
                        eboard: {
                            'name': 'E-board',
                            'male': 0,
                            'female': 0
                        },
                        general: {
                            'name': 'General',
                            'male': 0,
                            'female': 0
                        },
                        alumni: {
                            'name': 'Alumni',
                            'male': 0,
                            'female': 0
                        }
                    },
                    school: {
                        eboard: {
                            'name': 'E-board',
                            'schools': {}
                        },
                        general: {
                            'name': 'General',
                            'schools': {}
                        },
                        alumni: {
                            'name': 'Alumni',
                            'schools': {}
                        }
                    }
                };

                // Returns the group they are in based on the group we pass through.
                // It makes it easier to determine what number of increment for the
                // particular school or diversity group they belong to.
                // We have to break it down to diversity for the eboard, alumni, and our general community.
                function determineGroup(group, type) {
                    if(group === 'eboard') {
                        return type.eboard;
                    }
                    else if(group === 'general') {
                        return type.general;
                    }
                    else {
                        return type.alumni;
                    }
                }

                // Depending on the role it places them into either general, e-board, or alumni.
                // Just breaking these into separate bits to make it easier to add new types
                // in the future.
                function determineTypeAndGroup(roles, type) {
                    var currentGroup = {};
                    if(roles && roles.length > 0) {
                        if(roles.indexOf('TEAM_MEMBER') > -1) {
                            currentGroup = determineGroup('eboard', type);
                        }
                        else {
                            currentGroup = determineGroup('alumni', type);
                        }
                    }
                    else {
                        currentGroup = determineGroup('general', type);
                    }
                    return currentGroup;
                }

                // This is looking for diversity in all the person data for the API.
                // Utilizing determineTypeAndGroup makes it really easy to add new
                // variables to the diversity object, and be able to determine grouping for them.
                _(people).forEach(function(val) {
                    // Gender Breakdown
                    // Places them into a gender group depending on their gender.
                    var roles = val.attributes && val.attributes.roles;
                    if(val.attributes && val.attributes.gender) {
                        var currentGender = val.attributes.gender.toLowerCase();
                        var currentGroup = determineTypeAndGroup(roles, diversity.gender);
                        currentGroup[currentGender] += 1;
                    }

                    // School Breakdown
                    // Places them into a particular school group depending on their education.
                    if(val.relationships && val.relationships.schools) {
                        var currentGroup = determineTypeAndGroup(roles, diversity.school);
                        var currentSchools = val.relationships.schools.data;

                        // An individual can be in multiple schools. So we have to loop through them.
                        // This basically means that we record their schooling.
                        _(currentSchools).forEach(function(val) {
                            val = schoolIdsToSchoolNames[val.id].attributes.schoolName;
                            if(!currentGroup.schools[val]) {
                                currentGroup.schools[val] = 1;
                            }
                            else {
                                currentGroup.schools[val] += 1;
                            }
                        });
                    }
                });

                // Create diversity for ui-grid
                // This utilizes the functions above to create the ui-grid.
                _(diversity.school).forEach(function(val) {
                    var myData = [];
                    _(Object.keys(val.schools)).forEach(function(valschools) {
                        var current = {};
                        current['University Name'] = valschools;
                        current.Count = val.schools[valschools];
                        myData.push(current);
                    });
                    addGridOptionsToSchools(val, myData);
                });

                $scope.diversity = diversity;
            });
    });
