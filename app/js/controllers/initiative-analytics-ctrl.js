'use strict';

angular
.module('app.controllers')
.controller('InitiativeAnalyticsCtrl', function($scope, $location, $stateParams, Restangular, uiGridConstants) {
	$scope.compareDates = function (event) {
		var dateObj1 = new Date(event.attributes.startDateTime);
		var dateObj2 = new Date();
		return (dateObj1 < dateObj2);
	};
	var resourceId = $stateParams.id;
	Restangular.one('events?filter[simple][teams]=' + resourceId + '&sort=-startDateTime')
	.get()
	.then(function(data) {
		data = data.data;
		Restangular.one('people')
		.get()
		.then(function(people) {
			people = people.data;
			var idToName = {};
			_(people).forEach(function(person) {
				idToName[person.id] = person.attributes.name;
			}).value();
			var mostPopular = {};
			var eventNameValues = [];
			var attendeesValues = [];
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
						eventNameValues.push(val.attributes.title);
						attendeesValues.push(val.relationships.attendees.data.length);
					}
				}
			}).value();
			var myData = [];
			_(Object.keys(mostPopular)).forEach(function (val) {
				var current = {};
				current["Name"] = val;
				current["Event Checkins"] = mostPopular[val];
				if (val != "undefined")
					myData.push(current);
			}).value();
			$scope.teamEvents = data;
			$scope.gridOptions = {
				enableSorting: true,
				columnDefs: [
					{
						field: 'Name',
						sort: {
							direction: uiGridConstants.ASC,
							priority: 1
						}
					},
					{ 
						field: 'Event Checkins', 
						sort: {
							direction: uiGridConstants.DESC,
							priority: 0,
						}
					}
				],
			};
			$scope.gridOptions.data = myData;

			console.log(attendeesValues);
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
					},
				},
				plotOptions: {
					line: {
						dataLabels: {
							enabled: true
						},
						enableMouseTracking: false
					}
				},
				series: [{name: "Events", data: attendeesValues.reverse()}]
			};
		});
	});
});
