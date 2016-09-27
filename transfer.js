var matches = require('./matches.json');

var dateParser = function (d) {
  var o = function(number) { // Prefix single digits with 0
    return number < 10 ? '0' + number : number;
  },
  // String in format yyyy/mm/dd hh:mm
  s = d.getFullYear()+'/'+o(d.getMonth() + 1)+'/'+o(d.getDate())+' '+o(d.getHours())+':'+o(d.getMinutes()); 
  return s;
}

var result = [];
for (var m in matches) {
  var match = matches[m];

  result.push({
    id: match.MatchID,
    team1: {name: match.Team1.TeamName, icon: match.Team1.TeamIconUrl},
    team2: {name: match.Team2.TeamName, icon: match.Team2.TeamIconUrl},
    time: dateParser(new Date(match.MatchDateTime))
  });
}

console.log(JSON.stringify(result));