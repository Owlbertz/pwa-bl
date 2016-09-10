App.Predictions = (() => {
  return {
    /**
     * Loadds predictions for the given match.
     * Returns `null` if no prediction is found.
     * @param  {Number} matchId Match ID of the match to load predictions.
     * @return {Promise}        Resolves when the predition is loaded. Contains data:
     *                          {Number} team1 
     *                          {Number} team2 
     *                          {Date}   date
     */
    getPrediction: function(matchId) {
      return App.Store.open('predictions').then(() => {
        return App.Store.get('predictions', matchId);
      });
    },
    /**
     * Sets a predicition for the given match.
     * @param {Number} matchId    ID of the match.
     * @param {Object} prediction Prediction to save.
     *                            {Number} team1 
     *                            {Number} team2
     *                            {Date}   date
     * @return {Promise} Resolves when saving is done.
     */
    setPrediction: function(matchId, prediction) {
      return App.Store.open('predictions').then(() => {
        return App.Store.add('predictions', matchId, prediction);
      });
    },
    /**
     * Render's predictions.
     * Attaches event listener to input fields.
     * @param {DOM-Element} resultDiv Result div container to operate on.
     * @param {Object} result Result object to render with.
     */
    render: function(resultDiv, result) {
      let matchId = resultDiv.getAttribute('data-match-id'),
          isOngoing = resultDiv.classList.contains('ongoing'),
          isFinished = resultDiv.classList.contains('finished');

      this.getPrediction(matchId).then((prediction) => {
        if (prediction) {
          resultDiv.q('.prediction-team1').value = prediction.team1;
          resultDiv.q('.prediction-team2').value = prediction.team2;
          resultDiv.q('.prediciton-time').textContent = App.Util.dateParser(prediction.date);
          resultDiv.q('.prediction-time-container').classList.remove('hide');
        } else {
          resultDiv.q('.prediction-time-container').classList.add('hide');
        }
      });

      // Disable form for finished and on-going games
      if (isFinished || isOngoing) {
        resultDiv.q('.prediction-team1').setAttribute('disabled', true);
        resultDiv.q('.prediction-team2').setAttribute('disabled', true);
        resultDiv.q('.save-prediction-button').remove();
      }
      
      // Add form event
      resultDiv.q('form').addEventListener('submit', (e) => {
        e.preventDefault();
        let prediction = {
          team1: parseInt(resultDiv.q('.prediction-team1').value),
          team2: parseInt(resultDiv.q('.prediction-team2').value),
          date: new Date()
        };

        if (prediction.team1 || prediction.team2) {
          this.setPrediction(matchId, prediction).then(() => {
            if (App.showNotice) {
              App.showNotice('Saving successful.');
            }
            this.render(resultDiv, result);
          }, (err) => {
            if (App.showNotice) {
              App.showNotice('Saving successful.');
            } else {
              alert('An error occured.');
            }
          });
        }
      });
    }
  };
})();