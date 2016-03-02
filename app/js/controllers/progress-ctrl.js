/**
 * Progress Dashboard Controller
 * Displays how well we are doing month-after-month on different statistics.
 */
'use strict';

angular
    .module('app.controllers')
    .controller('ProgressCtrl', function($scope, Restangular, moment, ResourceService) {
        /**
         * Returns configuration for high chart. Makes it easier so we don't have to duplicate
         * the same kind of object structure.
         */
        function returnHighChartConfig(title, subtitle, monthCategories, yAxis, yAxisMax, data) {
            return {
                chart: {
                    type: 'line'
                },
                title: {
                    text: title
                },
                subtitle: {
                    text: subtitle
                },
                xAxis: {
                    categories: monthCategories
                },
                yAxis: {
                    title: {
                        text: yAxis
                    },
                    labels: {
                        useHTML: true
                    },
                    max: yAxisMax
                },
                plotOptions: {
                    line: {
                        dataLabels: {
                            enabled: true
                        },
                        enableMouseTracking: false
                    }
                },
                series: data
            };
        }

        /**
         * Gets rid off the keys, and returns the data as an array instead
         * of a dictionary.
         */
        function dataToArray(values) {
            return $.map(values, function(value) {
                return [value];
            });
        }

        /**
         * Function to check if the semester is during this semester.
         * Should be simplified into finding out when the semester is going forward.
         * This function relies on user input for when the semester starts and ends.
         */
        function eventThisSemester(event) {
            var beginning = moment('20160125', 'YYYYMMDD');
            var ending = moment('20160517', 'YYYYMMDD');
            var currentEventTime = moment(event.attributes.startDateTime);
            var dateComparisonAfter = currentEventTime.isAfter(beginning);
            var dateComparisonBefore = currentEventTime.isBefore(ending);
            if(dateComparisonAfter && dateComparisonBefore) {
                return true;
            }
            else {
                return false;
            }
        }

        /**
         * Loads the data from each event along with the attendees data, and sorts it descending.
         */
        $scope.loadingPromise = Restangular.one('events?include=attendees&sort=+startDateTime')
            .get()
            .then(function(data) {
                var events = data.data;
                var attendees = data.included;

                // Simple hashmap that takes an attendee ID and spits out the attendee.
                var attendeesIdsToAttendee = ResourceService.resourceIdToResource(attendees);

                // Very simple hashmaps that each map a particular month to a certain amount
                // of data.
                var eventsWithCheckinsByEventMonth = {};
                var checksByEventMonth = {};
                var rsvpsByEventMonth = {};
                var genderByEventMonth = {
                    'male': {},
                    'female': {}
                };

                // Simple hashmap that map the id of a particular person (either 'eboard' or not)
                // to the number of checkins they do.
                var userIdToNumberOfCheckins = {};
                var userIdToOnEboard = {};

                // Using moment to only build data on the last twelve months of events.
                var monthCategories = [];
                var aYearAgo = moment().subtract(12, 'months');
                _(events).forEach(function(val) {
                    // First we check if this event has checkin data
                    if(val.relationships && val.relationships.attendees && val.relationships.attendees.data && val.relationships.attendees.data.length > 1) {
                        // Generate the monthCategories that we want to show
                        // Some months don't count since we don't have events on them
                        // There is some obscurity and lie factor associated with this
                        // data, but that is okay for now.
                        var currentEventTime = moment(val.attributes.startDateTime);
                        var dateComparison = currentEventTime.isAfter(aYearAgo);
                        if(dateComparison) {
                            var currentMonth = currentEventTime.format('MMM-YY');
                            if(monthCategories.indexOf(currentMonth) === -1) {
                                monthCategories.push(currentMonth);
                            }

                            // Check how many events we have done this month.
                            // that have had checkins.
                            if(!eventsWithCheckinsByEventMonth[currentMonth]) {
                                eventsWithCheckinsByEventMonth[currentMonth] = 0;
                            }
                            eventsWithCheckinsByEventMonth[currentMonth] += 1;

                            // Check how many people checked this month.
                            if(!checksByEventMonth[currentMonth]) {
                                checksByEventMonth[currentMonth] = 0;
                            }
                            checksByEventMonth[currentMonth] += val.relationships.attendees.data.length;

                            // Checks how many people have RSVPed this month.
                            if(!rsvpsByEventMonth[currentMonth]) {
                                rsvpsByEventMonth[currentMonth] = 0;
                            }
                            if(val.relationships && val.relationships.rsvps && val.relationships.rsvps.data && val.relationships.rsvps.data.length > 1) {
                                rsvpsByEventMonth[currentMonth] += val.relationships.rsvps.data.length;
                            }

                            // Checks if the event is this particular semester.
                            var isEventThisSemester = eventThisSemester(val);

                            // Now we know this event falls within the last 12 months.
                            // This particular loop generates the attendees chart.
                            _(val.relationships.attendees.data).forEach(function(checkin) {
                                // Finding multiple checkins for this semester
                                // Perform date comparisons

                                // First we check each user in general.
                                if(isEventThisSemester) {
                                    if(!userIdToNumberOfCheckins[checkin.id]) {
                                        userIdToNumberOfCheckins[checkin.id] = 0;
                                    }
                                    userIdToNumberOfCheckins[checkin.id] += 1;
                                }

                                // Then we can check people on the e-board.
                                if(!userIdToOnEboard[checkin.id]) {
                                    if(attendeesIdsToAttendee[checkin.id].attributes.roles && attendeesIdsToAttendee[checkin.id].attributes.roles.length > 0) {
                                        userIdToOnEboard[checkin.id] = true;
                                    }
                                }

                                // Last we can look at data through gender.
                                var gender = attendeesIdsToAttendee[checkin.id].attributes.gender || undefined;
                                if(gender) {
                                    gender = attendeesIdsToAttendee[checkin.id].attributes.gender.toLowerCase();
                                    if(!genderByEventMonth[gender][currentMonth]) {
                                        genderByEventMonth[gender][currentMonth] = 0;
                                    }
                                    genderByEventMonth[gender][currentMonth] += 1;
                                }
                            }).value();
                        }
                    }
                }).value();

                // Simple hash map we use to generate the main chart. This basically
                // splits up the checkins depending on if they are on the e-board
                // or not.
                var checkinsAnalytics = {
                    general: 0,
                    eboard: 0
                };

                _(userIdToNumberOfCheckins).forEach(function(val, key) {
                    if(val > 1) {
                        if(userIdToOnEboard[key]) {
                            checkinsAnalytics.eboard += 1;
                        }
                        checkinsAnalytics.general += 1;
                    }
                }).value();

                // We create a dataset, which is basically just an array with
                // a simple object. This is what is required by the library.
                // We use the dataToArray function, which takes the hashmap (month -> data)
                // and gives us back an array of the data. Basically just removes the hash map.
                var eventsWithCheckinsDataset = [{
                    name: 'Events',
                    data: dataToArray(eventsWithCheckinsByEventMonth)
                }];

                // We do the same with the other datasets we utilize.
                var checkinDatasetData = dataToArray(checksByEventMonth);
                var rsvpsDatasetData = dataToArray(rsvpsByEventMonth);
                var checkinDataset = [{
                    name: 'Checkins',
                    data: checkinDatasetData
                }, {
                    name: 'RSVPs',
                    data: rsvpsDatasetData
                }];

                var genderDataset = [{
                    name: 'Male',
                    data: dataToArray(genderByEventMonth.male)
                }, {
                    name: 'Female',
                    data: dataToArray(genderByEventMonth.female)
                }];

                // We bold the last month. This is just to show the current month we are considering.
                monthCategories[monthCategories.length - 1] = '<b>' + monthCategories[monthCategories.length - 1] + '</b>';

                // This helps us normalize the charts. We want to use the same max number
                // in both the RSVP chart and the checkin chart. This is to help compare the 
                // data in a more useful manner.
                var maxNumberCheckins = Math.max.apply(Math, checkinDatasetData);
                var maxNumberRSVPs = Math.max.apply(Math, rsvpsDatasetData);
                var maxNumber = Math.max(maxNumberCheckins, maxNumberRSVPs);

                // These are just using the returnHighChartConfig function to generate the charts
                // and putting them into the main scope for the UI to render.
                $scope.HCEventsWithCheckins = returnHighChartConfig('Events per month', 'Source: API checkin data', monthCategories, 'Number of events', null, eventsWithCheckinsDataset);
                $scope.HCCheckins = returnHighChartConfig('RSVPs vs Checkins per month', 'Source: API checkin data', monthCategories, 'Number', maxNumber, checkinDataset);
                $scope.HCGender = returnHighChartConfig('Checkins by gender per month', 'Source: API checkin data', monthCategories, 'Checkins', maxNumber, genderDataset);
                $scope.checkinsAnalytics = checkinsAnalytics;
            });

        /**
         * Method to get data by the time they were created. It's newest person first.
         * The purpose is to get a count of the number of people created this month.
         */
        Restangular.one('people?sort=+created')
            .get()
            .then(function(people) {
                people = people.data;

                // Hash map to do month -> number.
                var newPeoplePerMonth = {};
                var monthCategories = [];

                // Loop through the people in the API.
                _(people).forEach(function(val) {
                    // We are only considering the 12 months (similar to above).
                    var aYearAgo = moment().subtract(12, 'months');
                    var currentPersonJoinDate = moment(val.attributes.created);
                    var dateComparison = currentPersonJoinDate.isAfter(aYearAgo);

                    // If the person is created within the last year then we add them to this dataset.
                    if(dateComparison) {
                        var currentMonth = currentPersonJoinDate.format('MMM-YY');
                        if(monthCategories.indexOf(currentMonth) === -1) {
                            monthCategories.push(currentMonth);
                        }
                        if(!newPeoplePerMonth[currentMonth]) {
                            newPeoplePerMonth[currentMonth] = 0;
                        }
                        newPeoplePerMonth[currentMonth] += 1;
                    }
                }).value();

                // Take the hashmap and create a dataset out of it.
                var newPeopleDataset = [{
                    name: 'People',
                    data: dataToArray(newPeoplePerMonth)
                }];

                // Generate a chart, and put it into the global scope.
                $scope.HCNewPeople = returnHighChartConfig('New members per month', 'Source: API checkin data', monthCategories, 'Members', null, newPeopleDataset);
            });
    });