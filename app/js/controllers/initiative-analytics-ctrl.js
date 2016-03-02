/**
 * Single Initiative Analytics Controller
 *
 */
'use strict';

angular
    .module('app.controllers')
    .controller('InitiativeAnalyticsCtrl', function($scope, $location, $stateParams, Restangular, uiGridConstants, DateService, ResourceService) {
        var resourceId = $stateParams.id;

        /**
         * Gets event data that is filtered for the initiative in question. The resourceId is what is passed
         * when you click an initiative on the events-analytics page or if you supply the resourceId through
         * the URL.
         */
        Restangular.one('events?filter[simple][teams]=' + resourceId + '&sort=-startDateTime')
            .get()
            .then(function(events) {
                events = events.data;

                // Get the people data from the API so we can get the RSVP/Checkin data.
                Restangular.one('people')
                    .get()
                    .then(function(people) {
                        people = people.data;

                        // mostPopular: how many times has each person came to an event.
                        // eventNameValues and attendeesValues needed to generate graphs.
                        var personIdToName = ResourceService.resourceIdToResource(people);
                        console.log(personIdToName);
                        var mostPopular = {};
                        var eventNameValues = [];
                        var attendeesValues = [];

                        // Loop through events and store values for each attendee, and other measures.
                        _(events).forEach(function(event) {
                            if(event && event.relationships && event.relationships.attendees && event.relationships.attendees.data) {
                                var attendees = event.relationships.attendees.data;

                                // In the mostPopular dictionary we put 
                                _(attendees).forEach(function(attendee) {
                                    if(personIdToName[attendee.id] && personIdToName[attendee.id].attributes && personIdToName[attendee.id].attributes.name) {
                                        if(mostPopular[personIdToName[attendee.id].attributes.name]) {
                                            mostPopular[personIdToName[attendee.id].attributes.name] += 1;
                                        }
                                        else {
                                            mostPopular[personIdToName[attendee.id].attributes.name] = 1;
                                        }
                                    }
                                }).value();

                                // Checkins over time graph
                                if(attendees.length > 1) {
                                    eventNameValues.push(event.attributes.title);
                                    attendeesValues.push(event.relationships.attendees.data.length);
                                }
                            }
                        }).value();

                        // Add event checkin data into the array so we can attach it with our gridOptions.
                        var eventCheckinData = [];
                        _(Object.keys(mostPopular)).forEach(function(val) {
                            var current = {};
                            current['Name'] = val;
                            current['Event Checkins'] = mostPopular[val];
                            if(val != 'undefined')
                                eventCheckinData.push(current);
                        }).value();

                        // Basic grid settings that we are required to fill in. The grid has two columns: Name and Event Checkins. One is sorted in ascending order, and the other in descending order.
                        $scope.gridOptions = {
                            enableSorting: true,
                            columnDefs: [{
                                field: 'Name',
                                sort: {
                                    direction: uiGridConstants.ASC,
                                    priority: 1
                                }
                            }, {
                                field: 'Event Checkins',
                                sort: {
                                    direction: uiGridConstants.DESC,
                                    priority: 0
                                }
                            }]
                        };

                        // Setting the gridData as the event checkin data.
                        $scope.gridOptions.data = eventCheckinData;

                        // This is our other charting framework: High Charts.
                        $scope.HCInitiativeAnalysis = {
                            chart: {
                                type: 'line'
                            },
                            title: {
                                text: 'Initiative Analysis'
                            },
                            subtitle: {
                                text: 'Source: API checkin data'
                            },
                            xAxis: {
                                categories: eventNameValues.reverse()
                            },
                            yAxis: {
                                title: {
                                    text: 'Checkins per event'
                                },
                                labels: {
                                    useHTML: true
                                }
                            },
                            plotOptions: {
                                line: {
                                    dataLabels: {
                                        enabled: true
                                    },
                                    enableMouseTracking: false
                                }
                            },
                            series: [{
                                name: 'Events',
                                data: attendeesValues.reverse()
                            }]
                        };

                        // Adding events data to the main scope.
                        $scope.teamEvents = events;
                    });
            });
    
        // We also pass the comparesDate function from the DateService imported above.
        $scope.compareDates = DateService.compareDates;
    });