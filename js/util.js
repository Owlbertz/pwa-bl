App.Util = (() => {
  return {
    /**
     * Parses JSON in a try/catch block.
     * @param  {String} results JSON string to parse.
     * @return {Object}         Parsed JSON string as JavaScript object.
     */
    resultParser: (results) => {
      return JSON.parse(results);
    },
    /**
     * Parses a date into the format yyyy.mm.dd hh:mm.
     * @param  {Date} d   Date to parse.
     * @return {Strong}   Parsed date in format above.
     */
    dateParser: (d) => {
      var o = (number) => { // Prefix single digits with 0
            return number < 10 ? `0${number}` : number;
          },
          // String in format yyyy.mm.dd hh:mm
          s = `${d.getFullYear()}/${o(d.getMonth() + 1)}/${o(d.getDate())} ${o(d.getHours())}:${o(d.getMinutes())}`; 
      return s;
    }
  };
})();