/**
 * Date Service
 * Service to declare methods around date issues that happen throughout blueprint.
 */
'use strict';

angular
    .module('app.services')
    .service('DateService', function() {
        /**
         * Compare Dates
         * Converts a API date to Date Object and returns if the event is in the past
         * or the future.
         */
        this.compareDates = function(event, isPast) {
            var dateObj1 = new Date(event.attributes.startDateTime);
            return dateObj1.compareDateToPast(isPast);
        };
    });