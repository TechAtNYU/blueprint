'use strict';

angular
.module('app.controllers')
.controller('ProgressCtrl', function($scope, Restangular, moment) {
	$scope.loadingPromise = Restangular.one('events?include=attendees&sort=+startDateTime')
		.get()
		.then(function(data) {
			var events = data.data;
			var attendees = data.included;
			var attendeesIdsToAttendee = {};
			_(attendees).forEach(function (val) {
				attendeesIdsToAttendee[val.id] = val.attributes && val.attributes.gender || undefined;
			}).value();

			var genderByEventMonth = {
				'male': {},
				'female': {}
			};

			var monthCategories = [];
			var aYearAgo = moment().subtract(12, 'months');
			_(events).forEach(function (val) {
				// First we check if this event has checkin data
				if (val.relationships && val.relationships.attendees && val.relationships.attendees.data && val.relationships.attendees.data.length > 1) {

					// Generate the monthCategories that we want to show
					// Some months don't count since we don't have events on them
					// There is some obscurity and lie factor associated with this 
					// data, but that is okay for now.
					var currentEventTime = moment(val.attributes.startDateTime);
					var dateComparison = currentEventTime.isAfter(aYearAgo);
					if (dateComparison) {
						var currentMonth = currentEventTime.format('MMM-YY');
						if (monthCategories.indexOf(currentMonth) === -1) {
							monthCategories.push(currentMonth);
						}

						// Now we know this event falls within the last 12 months.
						_(val.relationships.attendees.data).forEach(function (checkin) {
							var gender = attendeesIdsToAttendee[checkin.id];
							if (gender) {
								gender = attendeesIdsToAttendee[checkin.id].toLowerCase();
								if (!genderByEventMonth[gender][currentMonth]) {
									genderByEventMonth[gender][currentMonth] = 0;
								}
								genderByEventMonth[gender][currentMonth] += 1;
							}
						}).value();
					}
				}
			}).value();
			
			function dataToArray (values) {
				return $.map(values, function(value) {
					return [value];
				});	
			}

			var maleData = dataToArray(genderByEventMonth.male);
			var femaleData = dataToArray(genderByEventMonth.female);

			$scope.highchartsNG = {
				chart: {
					type: 'line'
				},
				title: {
					text: 'Checkins by gender per month'
				},
				subtitle: {
					text: 'Source: API checkin data'
				},
				xAxis: {
					categories: monthCategories
				},
				yAxis: {
					title: {
						text: 'Checkins'
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
					name: 'Male',
					data: maleData
				}, {
					name: 'Female',
					data: femaleData
				}]
			};
		});
});
