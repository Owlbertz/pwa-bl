App.Predictions = (() => {
  return {
    /**
     * Render's predictions.
     * Attaches event listener to input fields.
     * @param {DOM-Element} resultDiv Result div container to operate on.
     * @param {Object} result Result object to render with.
     */
    render: function(resultDiv, result) {
      let matchId = resultDiv.getAttribute('data-match-id'),
          isOngoing = resultDiv.classList.contains('ongoing'),
          isFinished = resultDiv.classList.contains('finished'),
          predictionDiv = resultDiv.q('.predictions');

      App.Store.open('predictions').then(() => {
        return App.Store.get('predictions', matchId);
      }).then((prediction) => {
        if (prediction) {
          predictionDiv.q('.team1').value = prediction.team1;
          predictionDiv.q('.team2').value = prediction.team2;
          predictionDiv.q('.time').textContent = App.Util.dateParser(prediction.date);
          predictionDiv.q('.time-container').classList.remove('hide');
        } else {
          predictionDiv.q('.time-container').classList.add('hide');
        }
      });

      // Disable form for finished and on-going games
      if (isFinished || isOngoing) {
        predictionDiv.q('.team1').setAttribute('disabled', true);
        predictionDiv.q('.team1').removeAttribute('required');
        predictionDiv.q('.team2').setAttribute('disabled', true);
        predictionDiv.q('.team2').removeAttribute('required');
        predictionDiv.q('.save-prediction-button').remove();
      }
      
      // Add form event
      resultDiv.q('form').on('submit', (e) => {
        e.preventDefault();
        let prediction = {
          team1: parseInt(resultDiv.q('.team1').value),
          team2: parseInt(resultDiv.q('.team2').value),
          date: new Date()
        };

        if (prediction.team1 || prediction.team2) {
          if (new Date(result.MatchDateTime) < new Date()) {
            if (App.showNotice) {
              App.showNotice('Prediction not possible.');
            } else {
              alert('Prediction not possible.');
            }
          }
          App.Store.open('predictions').then(() => {
            return App.Store.add('predictions', matchId, prediction);
          }).then(() => {
            if (App.showNotice) {
              App.showNotice('Saving successful.');
            }
            this.render(resultDiv, result);
          }, (err) => {
            if (App.showNotice) {
              App.showNotice('An error occured.');
            } else {
              alert('An error occured.');
            }
          });
        }
      });
    }
  };
})();