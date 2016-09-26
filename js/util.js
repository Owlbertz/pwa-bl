App.Util = (() => {
  return {
    /**
     * Parses a date into the format yyyy/mm/dd hh:mm.
     * @param  {Date}   d  Date to parse.
     * @return {String}    Parsed date in format above.
     */
    dateParser: (d) => {
      var o = (number) => { // Prefix single digits with 0
            return number < 10 ? `0${number}` : number;
          },
          // String in format yyyy/mm/dd hh:mm
          s = `${d.getFullYear()}/${o(d.getMonth() + 1)}/${o(d.getDate())} ${o(d.getHours())}:${o(d.getMinutes())}`; 
      return s;
    }
  };
})();