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

	function eventThisSemester (event) {
		var beginning = moment('20150902', 'YYYYMMDD');
		var ending = moment('20151223', 'YYYYMMDD');
		var currentEventTime = moment(event.attributes.startDateTime);
		var dateComparisonAfter = currentEventTime.isAfter(beginning);
		var dateComparisonBefore = currentEventTime.isBefore(ending);
		if (dateComparisonAfter && dateComparisonBefore) {
			return true;
		} else {
			return false;
		}
	}

	$scope.loadingPromise = Restangular.one('events?include=attendees&sort=+startDateTime')
		.get()
		.then(function(data) {
			var events = data.data;
			var attendees = data.included;
			var attendeesIdsToAttendee = {};
			_(attendees).forEach(function (val) {
				attendeesIdsToAttendee[val.id] = val.attributes || undefined;
			}).value();

			var eventsWithCheckinsByEventMonth = {};
			var checksByEventMonth = {};
			var rsvpsByEventMonth = {};
			var genderByEventMonth = {
				'male': {},
				'female': {}
			};
			var userIdToNumberOfCheckins = {};
			var userIdToOnEboard = {};

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

						if (!rsvpsByEventMonth[currentMonth]) {
							rsvpsByEventMonth[currentMonth] = 0;
						}
						if (val.relationships && val.relationships.rsvps && val.relationships.rsvps.data && val.relationships.rsvps.data.length > 1) {
							rsvpsByEventMonth[currentMonth] += val.relationships.rsvps.data.length;
						}

						var isEventThisSemester = eventThisSemester(val);
						// Now we know this event falls within the last 12 months.
						_(val.relationships.attendees.data).forEach(function (checkin) {
							// Finding multiple checkins for this semester
							// Perform date comparisons
							if (isEventThisSemester) {
								if (!userIdToNumberOfCheckins[checkin.id]) {
									userIdToNumberOfCheckins[checkin.id] = 0;
								}
								userIdToNumberOfCheckins[checkin.id] += 1;
							}

							// User is on E-Board
							if (!userIdToOnEboard[checkin.id]) {
								if (attendeesIdsToAttendee[checkin.id].roles && attendeesIdsToAttendee[checkin.id].roles.length > 0) {
									userIdToOnEboard[checkin.id] = true;
								}
							}

							// Gender
							var gender = attendeesIdsToAttendee[checkin.id].gender || undefined;
							if (gender) {
								gender = attendeesIdsToAttendee[checkin.id].gender.toLowerCase();
								if (!genderByEventMonth[gender][currentMonth]) {
									genderByEventMonth[gender][currentMonth] = 0;
								}
								genderByEventMonth[gender][currentMonth] += 1;
							}
						}).value();
					}
				}
			}).value();
			
			var checkinsAnalytics = {
				general: 0,
				eboard: 0
			};

			_(userIdToNumberOfCheckins).forEach(function (val, key) {
				if (val > 1) {
					if (userIdToOnEboard[key]) {
						checkinsAnalytics.eboard += 1;
					}
					checkinsAnalytics.general += 1;
				}
			}).value();

			var eventsWithCheckinsDataset = [
				{
					name: 'Events',
					data: dataToArray(eventsWithCheckinsByEventMonth)
				}
			];

			var checkinDatasetData = dataToArray(checksByEventMonth);
			var rsvpsDatasetData = dataToArray(rsvpsByEventMonth);
			var checkinDataset = [
				{
					name: 'Checkins',
					data: checkinDatasetData
				},
				{
					name: 'RSVPs',
					data: rsvpsDatasetData
				}
			];

			var genderDataset = [
				{
					name: 'Male',
					data: dataToArray(genderByEventMonth.male)
				},
				{
					name: 'Female',
					data: dataToArray(genderByEventMonth.female)
				}
			];

			monthCategories[monthCategories.length - 1] = '<b>' + monthCategories[monthCategories.length - 1] + '</b>';

			var maxNumberCheckins = Math.max.apply(Math, checkinDatasetData);
			var maxNumberRSVPs = Math.max.apply(Math, rsvpsDatasetData);
			var maxNumber = Math.max(maxNumberCheckins, maxNumberRSVPs);

			$scope.HCEventsWithCheckins = returnHighChartConfig('Events per month', 'Source: API checkin data', monthCategories, 'Number of events', null, eventsWithCheckinsDataset);
			$scope.HCCheckins = returnHighChartConfig('RSVPs vs Checkins per month', 'Source: API checkin data', monthCategories, 'Number', maxNumber, checkinDataset);
			$scope.HCGender = returnHighChartConfig('Checkins by gender per month', 'Source: API checkin data', monthCategories, 'Checkins', maxNumber, genderDataset);
			$scope.checkinsAnalytics = checkinsAnalytics;
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
					name: 'People',
					data: dataToArray(newPeoplePerMonth)
				}
			];
			$scope.HCNewPeople = returnHighChartConfig('New members per month', 'Source: API checkin data', monthCategories, 'Members', null, newPeopleDataset);
		});
});
