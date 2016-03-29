// This file contains
// Useful Extentions to Native Types
(function() {
    'use strict';
    // Formats a Date obj as a "yyyy-mm-dd" String
    Date.prototype.formatForInputTypeDate = function() {
        var yyyy = this.getFullYear().toString(),
            // keep these as numbers for comparison
            mm = this.getMonth() + 1, // zero-based month
            dd = this.getDate();

        return yyyy + '-' +
            (mm > 9 ? mm.toString() : '0' + mm) + '-' +
            (dd > 9 ? dd.toString() : '0' + dd);
    };

    // Formats an RFC2822 or ISO 8601 dateString
    // as a "yyyy-mm-dd" String
    String.prototype.formatForInputTypeDate = function() {
        var date = new Date(this);
        return date.formatForInputTypeDate();
    };

    // Date comparison function for the front-end.
    // Is useful to help classify past and future events in a very simple
    // manner.
    Date.prototype.compareDateToPast = function(isPast) {
        var dateObj2 = new Date();
        if(isPast) {
            return (this < dateObj2);
        }
        else {
            return (this > dateObj2);
        }
    };

    if(!Array.prototype.last) {
        Array.prototype.last = function() {
            return this[this.length - 1];
        };
    }
})();