'use strict';

// Graph ideas:
// 1. Number of presenters who are male and female per semester

angular
.module('app.controllers')
.controller('ProgressCtrl', function($scope, Restangular, moment) {

	function returnHighChartConfig (title, subtitle, monthCategories, yAxis, yAxisMax, data) {
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

	function dataToArray (values) {
		return $.map(values, function(value) {
			return [value];
		});	
	}

	$scope.loadingPromise = Restangular.one('events?include=attendees&sort=+startDateTime')
		.get()
		.then(function(data) {
			var events = data.data;
			var attendees = data.included;
			var attendeesIdsToAttendee = {};
			_(attendees).forEach(function (val) {
				attendeesIdsToAttendee[val.id] = val.attributes && val.attributes.gender || undefined;
			}).value();

			var eventsWithCheckinsByEventMonth = {};
			var checksByEventMonth = {};
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

						// Check how many events we have done this month
						// that have had checkins
						if (!eventsWithCheckinsByEventMonth[currentMonth]) {
							eventsWithCheckinsByEventMonth[currentMonth] = 0;
						}
						eventsWithCheckinsByEventMonth[currentMonth] += 1;

						// Check how many people checked in this month
						if (!checksByEventMonth[currentMonth]) {
							checksByEventMonth[currentMonth] = 0;
						}
						checksByEventMonth[currentMonth] += val.relationships.attendees.data.length;

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

			var eventsWithCheckinsDataset = [
				{
					name: "Events",
					data: dataToArray(eventsWithCheckinsByEventMonth)
				}
			];

			var checkinDatasetData = dataToArray(checksByEventMonth);
			var checkinDataset = [
				{
					name: "Checkins",
					data: checkinDatasetData
				}
			];

			var genderDataset = [
				{
					name: "Male",
					data: dataToArray(genderByEventMonth.male)
				},
				{
					name: "Female",
					data: dataToArray(genderByEventMonth.female)
				}
			];

			monthCategories[monthCategories.length - 1] = '<b>' + monthCategories[monthCategories.length - 1] + '</b>';

			var maxNumberCheckins = Math.max.apply(Math, checkinDatasetData);

			$scope.HCEventsWithCheckins = returnHighChartConfig('Events per month', 'Source: API checkin data', monthCategories, 'Number of events', null, eventsWithCheckinsDataset);
			$scope.HCCheckins = returnHighChartConfig('Checkins per month', 'Source: API checkin data', monthCategories, 'Checkins', maxNumberCheckins, checkinDataset);
			$scope.HCGender = returnHighChartConfig('Checkins by gender per month', 'Source: API checkin data', monthCategories, 'Checkins', maxNumberCheckins, genderDataset);
		});

	Restangular.one('people?sort=+created')
		.get()
		.then(function(people) {
			people = people.data;
			var newPeoplePerMonth = {};
			var monthCategories = [];

			_(people).forEach(function (val) {
				var aYearAgo = moment().subtract(12, 'months');
				var currentPersonJoinDate = moment(val.attributes.created);
				var dateComparison = currentPersonJoinDate.isAfter(aYearAgo);
					if (dateComparison) {
						var currentMonth = currentPersonJoinDate.format('MMM-YY');
						if (monthCategories.indexOf(currentMonth) === -1) {
							monthCategories.push(currentMonth);
						}
						if (!newPeoplePerMonth[currentMonth]) {
							newPeoplePerMonth[currentMonth] = 0;
						}
						newPeoplePerMonth[currentMonth] += 1;
					}
			}).value();

			var newPeopleDataset = [
				{
					name: "People",
					data: dataToArray(newPeoplePerMonth)
				}
			];
			$scope.HCNewPeople = returnHighChartConfig('New members per month', 'Source: API checkin data', monthCategories, 'Members', null, newPeopleDataset);
		});
});
