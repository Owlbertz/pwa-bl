App.Points = (() => {
  const POINTS_CORRECT = 4,
        POINTS_DIFFERENCE = 3,
        POINTS_WINNER = 2;
  let stats = {
        total: 0,
        correct: 0,
        difference: 0,
        winner: 0,
        pointsPerPrediction: 0
      },
      pointsForMatch = function(result, prediction) {
        let resultGoals = result.MatchResults[0].ResultOrderID === 2 ? result.MatchResults[0] : result.MatchResults[1];
        if (resultGoals.PointsTeam1 === prediction.Team1 && resultGoals.PointsTeam2 === prediction.Team2) {
          stats.total += POINTS_CORRECT;
          stats.correct += 1;
        } else if (Math.abs(prediction.Team1 - prediction.Team2) ===  Math.abs(resultGoals.PointsTeam1 - resultGoals.PointsTeam2)) {
          stats.total += POINTS_DIFFERENCE;
          stats.difference += 1;
        } else if (
          (resultGoals.PointsTeam1 > resultGoals.PointsTeam2 && prediction.Team1 > prediction.Team2)
          || (resultGoals.PointsTeam1 < resultGoals.PointsTeam2 && prediction.Team1 < prediction.Team2)
        ) {
          stats.total += POINTS_WINNER;
          stats.winner += 1;
        }
        return stats;
      };

  return {
    init: () => {
      this.calculateAllPoints();

    },
    calculateAllPoints: (results, predictions) => {
      if (!results) {
        return false;
      }
      
      // Reset stats
      stats = {
        total: 0,
        correct: 0,
        difference: 0,
        winner: 0,
        pointsPerPrediction: 0,
        count: 0
      };

      results.filter(function(result) {
        return result.MatchIsFinished; // Only finished matches
      }).forEach(function(result) {
        let matchId = result.MatchID;
        if (predictions[matchId]) {
          pointsForMatch(result, predictions[matchId]);
          stats.count += 1;
        }
      });

      if (predictions && stats.count > 0) {
        stats.pointsPerPrediction = Math.round(stats.total / stats.count * 100) / 100;
      }

      return stats;
    },
    calculatePoints: (result, predictions) => {
      let matchId = result.MatchID;
      if (!result.MatchIsFinished || !predictions[matchId]) {
        return null;
      } else {
        return pointsForMatch(result, predictions[matchId]).points;
      }
    },
    getStats: () => {
      return stats;
    },
    renderAllPoints: function(ele, results, predictions) {
      this.calculateAllPoints(results, predictions);
      ele.q('.total').textContent = stats.total;
      ele.q('.correct').textContent = stats.correct;
      ele.q('.difference').textContent = stats.difference;
      ele.q('.winner').textContent = stats.winner;
      ele.q('.count').textContent = stats.count;
      ele.q('.rate').textContent = stats.pointsPerPrediction;
    }
  };
})();