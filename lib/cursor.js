var moment = require('moment');
var _ = require('lodash');

module.exports = {
  extend: 'apostrophe-pieces-cursor',

  construct: function(self, options) {
    // If set to true, the upcoming flag ensures we 
    // only get events that haven't already happened.
    self.addFilter('upcoming', {
      def: null,
      safeFor: 'public',
      finalize: function() {
        // Navigation by year, month or day should
        // trump this filter allowing you to
        // browse the past
        if (self.get('year')) {
          return;
        }
        if (self.get('month')) {
          return;
        }
        if (self.get('day')) {
          return;
        }
        if (self.get('start')) {
          return;
        }
        if (self.get('end')) {
          return;
        }

        var upcoming = self.get('upcoming');

        if (upcoming === null) {
          return;
        }

        var now = moment().format('YYYY-MM-DD');

        if (upcoming) {
          self.and({
            endDate: { $gte: now },
          });
        } else {
          self.and({
            endDate: { $lte: now }
          });
        }
      },
      launder: function(s) {
        return self.apos.launder.booleanOrNull(s);
      }    
    });

    // Filter by year, in YYYY-MM-DD format. The event must
    // be taking place during that month (it might surround it).
    // Use of this filter cancels the upcoming filter
    self.addFilter('year', {
      def: null,
      safeFor: 'public',
      finalize: function() {
        var year = self.get('year');

        if (year === null) {
          return;
        }

        self.and({
          startDate: { $lte: year + '-12-31' },
          endDate: { $gte: year + '-01-01' }
        });
      },
      launder: function(s) {
        s = self.apos.launder.string(s);

        if (!s.match(/^\d\d\d\d$/)) {
          return null;
        }

        return s;
      },
      choices: function(callback) {
        return self.clone().upcoming(null).toDistinct('startDate', function(err, results) {
          if (err) {
            return callback(err);
          }
          return callback(null, _.uniq(_.each(results, function(value, key) { results[key] = value.substr(0,4) })).sort().reverse());
        });
      }
    });

    // Filter by day, in YYYY-MM-DD format. The event must
    // be taking place during that month (it might surround it).
    // Use of this filter cancels the upcoming filter
    self.addFilter('month', {
      def: null,
      safeFor: 'public',
      finalize: function() {
        var month = self.get('month');

        if (month === null) {
          return;
        }

        self.and({
          startDate: { $lte: month + '-31' },
          endDate: { $gte: month + '-01' }
        });
      },
      launder: function(s) {
        s = self.apos.launder.string(s);

        if (!s.match(/^\d\d\d\d\-\d\d$/)) {
          return null;
        }

        return s;
      },
      choices: function(callback) {
        return self.clone().upcoming(null).toDistinct('startDate', function(err, results) {
          if (err) {
            return callback(err);
          }
          return callback(null, _.uniq(_.each(results, function(value, key) { results[key] = value.substr(0,7) })).sort().reverse());
        });
      }
    });
    
    // Filter by day, in YYYY-MM-DD format. The event must
    // be taking place during that day (it might surround it).
    // Use of this filter cancels the upcoming filter
    self.addFilter('day', {
      def: null,
      safeFor: 'public',
      finalize: function() {
        var day = self.get('day');

        if (day === null) {
          return;
        }

        self.and({
          startDate: { $lte: day },
          endDate: { $gte: day }
        });
      },
      launder: function(s) {
        s = self.apos.launder.string(s);

        if (!s.match(/^\d\d\d\d\-\d\d\-\d\d$/)) {
          return null;
        }

        return s;
      },
      choices: function(callback) {
        return self.clone().upcoming(null).toDistinct('startDate', function(err, results) {
          if (err) {
            return callback(err);
          }
          results.sort();
          results.reverse();
          return callback(null, results);
        });
      }
    });
    
    // Filter for events that are active after a certain date, in YYYY-MM-DD format.
    // The event must end on or after that day.
    // Use of this filter cancels the upcoming filter
    self.addFilter('start', {
      def: null,
      safeFor: 'public',
      finalize: function() {
        var start = self.get('start');

        if (start === null) {
          return;
        }

        self.and({
          endDate: { $gte: start }
        });
      },
      launder: function(s) {
        s = self.apos.launder.string(s);

        if (!s.match(/^\d\d\d\d\-\d\d\-\d\d$/)) {
          return null;
        }

        return s;
      }
    });

    // Filter for events that are active up until a certain day, in YYYY-MM-DD format.
    // The event must start on or before that day.
    // Use of this filter cancels the upcoming filter
    self.addFilter('end', {
      def: null,
      safeFor: 'public',
      finalize: function() {
        var end = self.get('end');

        if (end === null) {
          return;
        }

        self.and({
          startDate: { $lte: end }
        });
      },
      launder: function(s) {
        s = self.apos.launder.string(s);

        if (!s.match(/^\d\d\d\d\-\d\d\-\d\d$/)) {
          return null;
        }

        return s;
      }
    });
    
    // Accepted for bc, wraps the date filter
    self.addFilter('date', {
      def: null,
      safeFor: 'public',
      finalize: function() {
        self.day(self.get('date'));
      },
      launder: function(s) {
        return self.apos.launder.string(s);
      }
    });
  }
};
