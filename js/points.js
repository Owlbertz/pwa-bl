App.Points = (() => {
  const POINTS_CORRECT = 4,
        POINTS_DIFFERENCE = 3,
        POINTS_WINNER = 2;
  let points = 0,
      stats = {
        correct: 0,
        difference: 0,
        winner: 0
      },
      pointsForMatch = function(result, prediction) {
        let resultGoals = result.MatchResults[0].ResultOrderID === 2 ? result.MatchResults[0] : result.MatchResults[1];
        if (resultGoals.PointsTeam1 === prediction.Team1 && resultGoals.PointsTeam2 === prediction.Team2) {
          points += POINTS_CORRECT;
          stats.correct += 1;
        } else if (Math.abs(prediction.Team1 - prediction.Team2) ===  Math.abs(resultGoals.PointsTeam1 - resultGoals.PointsTeam2)) {
          points += POINTS_DIFFERENCE;
          stats.difference += 1;
        } else if (
          (resultGoals.PointsTeam1 > resultGoals.PointsTeam2 && prediction.Team1 > prediction.Team2)
          || (resultGoals.PointsTeam1 < resultGoals.PointsTeam2 && prediction.Team1 < prediction.Team2)
        ) {
          points += POINTS_WINNER;
          stats.winner += 1;
        }
        return {
          points,
          stats
        };
      };

  return {
    init: () => {
      this.calculateAllPoints();

    },
    calculateAllPoints: (results, predictions) => {
      points = 0;
      stats = {
        correct: 0,
        difference: 0,
        winner: 0
      };
      results.filter(function(result) {
        return result.MatchIsFinished; // Only finished matches
      }).forEach(function(result) {
        let matchId = result.MatchID;
        if (predictions[matchId]) {
          pointsForMatch(result, predictions[matchId])
        }
      });
      console.log(points, stats);
    },
    calculatePoints: (result, predictions) => {
      let matchId = result.MatchID;
      if (!result.MatchIsFinished || !predictions[matchId]) {
        return null;
      } else {
        return pointsForMatch(result, predictions[matchId]).points;
      }
    },
    getPoints: () => {
      return points;
    },
    getStats: () => {
      return stats;
    }
  };
})();