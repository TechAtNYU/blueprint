'use strict';

angular
.module('app.controllers')
.controller('InitiativeAnalyticsCtrl', function($scope, $location, $stateParams, Restangular) {
    $scope.compareDates = function (event) {
        var dateObj1 = new Date(event.attributes.startDateTime);
        var dateObj2 = new Date();
        return (dateObj1 < dateObj2);
    };
    var resourceId = $stateParams.id;
    Restangular.one('events?filter[simple][teams]=' + resourceId + '&sort=-startDateTime')
    .get()
    .then(function(data) {
        Restangular.one('people')
        .get()
        .then(function(dataPeople) {
            var idToName = {};
            _(dataPeople).forEach(function(person) {
                idToName[person.id] = person.attributes.name;
            }).value();
            var mostPopular = {};
            var allValues = [];
            _(data).forEach(function(val) {
                if (val && val.relationships && val.relationships.attendees && val.relationships.attendees.data) {
                    var attendees = val.relationships.attendees.data;
                    // Most frequent attendees
                    _(attendees).forEach(function(attendee) {
                        if (mostPopular[idToName[attendee.id]]) {
                            mostPopular[idToName[attendee.id]] += 1;
                        } else {
                            mostPopular[idToName[attendee.id]] = 1;
                        }
                    }).value();
                    // Checkins over time graph
                    if (attendees.length > 1) {
                        allValues.push({
                            "label": val.attributes.title,
                            "value": val.relationships.attendees.data.length
                        });
                    }
                }
            }).value();
            $scope.teamEvents = data;
            $scope.mostPopular = mostPopular;
            $scope.checkinData = [{
                key: "Cumulative Return",
                values: allValues
            }];
        });
    });
    $scope.options = {
        chart: {
            type: 'discreteBarChart',
            height: 450,
            margin : {
                top: 20,
                right: 20,
                bottom: 0,
                left: 55
            },
            x: function(d){ return d.label; },
            y: function(d){ return d.value; },
            showValues: true,
            valueFormat: function(d){
                return d3.format('f')(d);
            },
            transitionDuration: 500,
            xAxis: {
                axisLabel: 'Event',
                rotateLabels: 20,
                tickFormat: function(d) {
                    return d.substring(0, 30);
                },
            },
            yAxis: {
                axisLabel: 'Number of attendees',
                axisLabelDistance: 10
            }
        }
    };
});
