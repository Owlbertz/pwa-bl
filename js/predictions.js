App.Predictions = (function() {
  var STORE_NAME = 'bl-predictions',
      /**
       * Initialize predictions by loading them from local storage.
       * @return {Object} Predictions, with match ID as key.
       */
      init = function() {
        var data = localStorage.getItem(STORE_NAME);
        if (data) {
          try {
            var predictions = JSON.parse(data);

            for (var p in predictions) {
              var prediction = predictions[p];
              prediction.date = new Date(prediction.date);
            }

            CACHED = predictions;
            return predictions;
          } catch (err) {
            console.error('Failed to parse JSON:', err);
            return {};
          }
        } else {
          return {};
        }
      },
      CACHED = init(),
      store = localStorage;

  return {
    /**
     * Checks if feature is active.
     * @return {Boolean} True if active, false otherwise.
     */
    isActive: function() {
      return !!store;
    },
    /**
     * Loads predictions.
     * @return {Object} Predictions.
     */
    getPredictions: function() {
      return CACHED;      
    },
    /**
     * Loadds predictions for the given match.
     * Returns `null` if no prediction is found.
     * @param  {Number} id Match ID of the match to load predictions.
     * @return {Object}    Prediction for the match. Null if none is found.
     *                     {Number} Team1 
     *                     {Number} Team2 
     *                     {Date}   date
     */
    getPrediction: function(id) {
      if (CACHED[id]) {
        return CACHED[id];
      }

      return null;
    },
    /**
     * Sets a predicition for the given match.
     * @param {Number} id         ID of the match.
     * @param {Object} prediction Prediction to save.
     *                            {Number} Team1 
     *                            {Number} Team2 
     *                            {Date}   date
     * @return {Boolean} True if success, false otherwise.
     */
    setPrediction: function(id, prediction) {
      CACHED[id] = prediction;
      try {
        var p = JSON.stringify(CACHED);
        localStorage.setItem(STORE_NAME, p);
        return true;
      } catch (err) {
        console.error('Failed to stringify JSON:', err);
        return false;
      }
    },
    /**
     * Render's predictions.
     * Attaches event listener to input fields.
     */
    render: function() {
      var _this = this,
          resultDivs = document.querySelectorAll('.result');

      resultDivs.forEach(function(resultDiv) {
        var matchId = resultDiv.getAttribute('data-match-id'),
            isOngoing = resultDiv.classList.contains('ongoing'),
            isFinished = resultDiv.classList.contains('finished'),
            prediction = _this.getPrediction(matchId);

        if (prediction) {
          resultDiv.querySelector('.prediction-team1').value = prediction.Team1;
          resultDiv.querySelector('.prediction-team2').value = prediction.Team2;
          resultDiv.querySelector('.prediciton-time').textContent = App.Util.dateParser(prediction.date);
          resultDiv.querySelector('.prediction-time-container').classList.remove('hide');
        } else {
          resultDiv.querySelector('.prediction-time-container').classList.add('hide');
        }

        // Disable form for finished and on-going games
        if (isFinished) {
          resultDiv.querySelector('.prediction-team1').setAttribute('disabled', true);
          resultDiv.querySelector('.prediction-team2').setAttribute('disabled', true);
          resultDiv.querySelector('.save-prediction-button').setAttribute('disabled', true);
        }
        
        // Add form event
        resultDiv.querySelector('form').addEventListener('submit', (e) => {
          e.preventDefault();
          var prediction = {
            Team1: resultDiv.querySelector('.prediction-team1').value,
            Team2: resultDiv.querySelector('.prediction-team2').value,
            date: new Date()
          };

          if (prediction.Team1 || prediction.Team2) {
            var success = _this.setPrediction(matchId, prediction);
            if (!success) {
              alert('An error occured.');
            } else {
              _this.render();
            }
          }
        });
      });
    }
  };
})();