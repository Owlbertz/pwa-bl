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
      /**
       * Calculate points for a single match.
       * @param  {Object} result     Result of the match.
       * @param  {Object} prediction Prediction for this match.
       * @return {Object}            Stats based on prediction.
       */
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
    /**
     * Initializes the points.
     */
    init: () => {
      this.calculateAllPoints();
    },
    /**
     * Calculates points for all matches.
     * @param  {Array} results     Results so far.
     * @param  {Object} predictions Predictions so far.
     * @return {Object}             Stats based on predictions.
     *                              {Number} total Total points.
     *                              {Number} correct Number of correct predictions.
     *                              {Number} difference Number of correct difference in prediction.
     *                              {Number} winner Number of correct predicted winner.
     *                              {Number} pointsPerPrediction Ratio of matches and points.
     *                              {Number} count Amount of predictions.
     *                              
     *                              
     */
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
    /**
     * Renders the points popup.
     * @param  {DOM-Element} ele    Element to render in.
     * @param  {Array} results      Results so far.
     * @param  {Object} predictions Predictions so far.
     */
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