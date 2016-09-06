App.Util = (function() {
  return {
    /**
     * Parses JSON in a try/catch block.
     * @param  {String} results JSON string to parse.
     * @return {Object}         Parsed JSON string as JavaScript object.
     */
    resultParser: function(results) {
      try {
        return JSON.parse(results);
      } catch (err) {
        console.error('Error parsing results...', err, results);
        return null;
      }
    },
    /**
     * Parses a date into the format yyyy.mm.dd hh:mm.
     * @param  {Date} d   Date to parse.
     * @return {Strong}   Parsed date in format above.
     */
    dateParser: function(d) {
      var o = function(number) { // Prefix single digits with 0
            return number < 10 ? `0${number}` : number;
          },
          // String in format yyyy.mm.dd hh:mm
          s = `${d.getFullYear()}/${o(d.getMonth() + 1)}/${o(d.getDate())} ${o(d.getHours())}:${o(d.getMinutes())}`; 
      return s;
    }
  };
})();