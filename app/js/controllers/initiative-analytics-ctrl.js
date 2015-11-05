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
        $scope.teamEvents = data;
        var allValues = [];
        for (var i = data.length - 1; i >= 0; i--) {
            if(data[i] && data[i].relationships && data[i].relationships.attendees && data[i].relationships.attendees.data && data[i].relationships.attendees.data.length > 1){
                allValues.push({
                    "label": data[i].attributes.title, 
                    "value": data[i].relationships.attendees.data.length
                });
            }
        };
        $scope.data = [{
                key: "Cumulative Return",
                values: allValues
            }
        ];
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
                return d3.format(',.4f')(d);
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
