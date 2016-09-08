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
      // Reset stats
      stats = {
        total: 0,
        correct: 0,
        difference: 0,
        winner: 0,
        pointsPerPrediction: 0
      };

      results.filter(function(result) {
        return result.MatchIsFinished; // Only finished matches
      }).forEach(function(result) {
        let matchId = result.MatchID;
        if (predictions[matchId]) {
          pointsForMatch(result, predictions[matchId])
        }
      });

      if (predictions && Object.keys(predictions).length > 0) {
        stats.pointsPerPrediction = Math.round(stats.total / Object.keys(predictions).length * 100) / 100;
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
      ele.q('.prediction-points-total').textContent = stats.total;
      ele.q('.prediction-points-correct').textContent = stats.correct;
      ele.q('.prediction-points-difference').textContent = stats.difference;
      ele.q('.prediction-points-winner').textContent = stats.winner;
      ele.q('.prediction-points-prediction-count').textContent = Object.keys(predictions).length;
      ele.q('.prediction-points-points-per-prediction').textContent = stats.pointsPerPrediction;
    }
  };
})();