/**
 * https://developers.google.com/web/fundamentals/getting-started/your-first-progressive-web-app/step-07?hl=en
 * https://weather-pwa-sample.firebaseapp.com/step-08/
 *
 * https://www.smashingmagazine.com/2016/08/a-beginners-guide-to-progressive-web-apps/
 * https://github.com/IncredibleWeb/pwa-tutorial/blob/master/demo/js/page.js
 *
 * https://flights.airberlin.com/en-DE/progressive-web-app
 *
 * https://a-k-apart.com/faq
 *
 * TODOS:
 *   Service Worker Caching
 *   Icons
 *   Remove localhost workarounds
 * 
 */

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./worker.js').then(function(reg) {
    // ok....
  }).catch(function(err) {
      console.warn('Error registering Service Worker:', err);
  });
}

var isOnline = location.hash.indexOf('online') !== -1,
    isOffline = location.hash.indexOf('offline') !== -1,
    useLocal = location.hash.indexOf('local') !== -1;

var App = (function() {
  // Wrap XHR-calls and return Promise
  var _get = function(url) {
    return new Promise(function(resolve, reject) {
      var request = new XMLHttpRequest();
      request.open('GET', url, true);

      request.onload = function() {
        var isLocal = url.indexOf('http') === -1;
        if (isLocal || request.status === 200) {
          if (isLocal) { // For local connections delay result for better feeling
            setTimeout(function() {
              resolve(request.responseText);
            }, 2000);
          } else {
            resolve(request.responseText);
          }
        } else {
          console.error('Failed to get:', url);
          reject(new Error(request.statusText));
        }
      };

      request.onerror = function() {
        App.showOffline();
        console.error('Failed to get:', url);
        reject(new Error('Offline'));
      };
      request.send();
    });
  },
  _loadedRessources = [],
  _loadRessource = function (files) {
    if (typeof files === 'string') files = [files];

    return new Promise(function(resolve, reject) {

      let successes = 0;
      let successFn = function() {
        if (++successes === files.length) {
          console.log('Finished loading all files!');
          resolve();
        }
      };

      files.forEach(function(filename) {
        // Prevent file from loading multiple times
        if (_loadedRessources.indexOf(filename) > -1) {
          successFn();
          return;
        }
        var filetype = filename.indexOf('.js') !== -1 ? 'js' : 'css';

        if (filetype === 'js'){ //if filename is a external JavaScript file
          var fileref = document.createElement('script');
          fileref.setAttribute('src', filename);
          fileref.onload = successFn;
          if (typeof fileref !== 'undefined') document.getElementsByTagName('body')[0].appendChild(fileref);
        }
        else if (filetype === 'css'){ //if filename is an external CSS file
          var fileref = document.createElement('link');
          fileref.setAttribute('rel', 'stylesheet');
          fileref.setAttribute('href', filename);
          fileref.onload = successFn;
          if (typeof fileref !== 'undefined') document.getElementsByTagName('body')[0].appendChild(fileref);
        }
      });
    });
  },

  _renderResults = function (results) { // Generate HTML out of parsed results and returns a Promise
    return new Promise(function(resolve, reject) {   
      // Remove old results
      document.querySelectorAll('.result:not(.template)').forEach(function(ele) {
        ele.remove();
      });

      var template = document.querySelector('.result.template'),
          container = document.querySelector('.results');

      results.forEach(function(result) {
        var ele = template.cloneNode(true),
            moreContainer = ele.querySelector('.more-container'),
            goalsContainer = moreContainer.querySelector('.goals')
            predictionsContainer = moreContainer.querySelector('.predictions'),
            showMoreButton = ele.querySelector('.shore-more-button');

        ele.classList.remove('template');

        ele.setAttribute('data-match-id', result.MatchID);
        ele.querySelector('.team1-name').textContent = result.Team1.TeamName;
        ele.querySelector('.team2-name').textContent = result.Team2.TeamName;
        ele.querySelector('.team1-icon').setAttribute('src', result.Team1.TeamIconUrl);
        ele.querySelector('.team1-icon').setAttribute('alt', result.Team1.TeamName + ' icon');
        ele.querySelector('.team1-icon').addEventListener('load', function() {
          this.classList.add('loaded');
        });
        ele.querySelector('.team2-icon').setAttribute('src', result.Team2.TeamIconUrl);
        ele.querySelector('.team2-icon').setAttribute('alt', result.Team2.TeamName + ' icon');
        ele.querySelector('.team2-icon').addEventListener('load', function() {
          this.classList.add('loaded');
        });


        var d = new Date(result.MatchDateTimeUTC), // Math date
            s = App.Util.dateParser(d);
            
        ele.querySelector('.time').textContent = s;



        var moreContainerId = 'more-container-' + result.MatchID;
        moreContainer.setAttribute('id', moreContainerId);
        showMoreButton.setAttribute('aria-controls', moreContainerId);

        showMoreButton.addEventListener('click', function(event) {
          var expanded = this.getAttribute('aria-expanded') === 'true';
          if (expanded) { // Close
            this.setAttribute('aria-expanded', false);
            moreContainer.classList.remove('open');
            this.setAttribute('title', 'Show additional information');
          } else { // Open
            this.setAttribute('aria-expanded', true);
            moreContainer.classList.add('open');
            this.setAttribute('title', 'Hide additional information');
          }
        });

        if (result.MatchIsFinished) {
          ele.classList.add('finished');

          var resultIndex = result.MatchResults[0].ResultOrderID === 2 ? 0 : 1;
          ele.querySelector('.points-team1').textContent = result.MatchResults[resultIndex].PointsTeam1;
          ele.querySelector('.points-team2').textContent = result.MatchResults[resultIndex].PointsTeam2;


          // Needed to see which team scored...
          var goalsTeam1 = 0,
              goalsTeam2 = 0;

          result.Goals.forEach(function(goal) {
            // Check which team scored
            var scoringTeam;
            if (goal.ScoreTeam1 > goalsTeam1) {
              scoringTeam = 1;
              goalsTeam1 = goal.ScoreTeam1;
            } else {
              scoringTeam = 2;
              goalsTeam2 = goal.ScoreTeam2;            
            }

            var goalEle = goalsContainer.querySelector('li.template').cloneNode(true);
            goalEle.classList.add('goal-team-' + scoringTeam);
            goalEle.classList.remove('template');
            goalEle.querySelector('.goal-scorer').innerHTML = goal.GoalGetterName + '<span class="visuallyhidden">for team: '+result['Team'+scoringTeam].TeamName+'</span>';
            goalEle.querySelector('.goal-time').textContent = goal.MatchMinute;
            goalsContainer.querySelector('ul').appendChild(goalEle);
          });
        } else if (new Date(result.MatchDateTime) < new Date()) {
          ele.classList.add('ongoing');
        } else {
          ele.classList.add('not-started');
          goalsContainer.classList.add('hide'); // Hide list of goals for not started games
        }

        
        container.appendChild(ele);

        resolve();
      });
    });
  };

  return {
    init: function() {
      // Load utils before loading predictions.
      _loadRessource('js/util.js').then(function() {

        window.addEventListener('online', function(e) {
          App.hideOffline();
          App.loadResults();
        }, false);

        window.addEventListener('offline', function(e) {
          App.showOffline();
        }, false);

        // Initial online check
        if (isOnline || navigator.onLine) {
          App.loadResults();
        } else {
          App.showOffline();
        }

        if (App.Navigation) {
          App.Navigation.render();
        }

        if (App.Features.predictions) {
          _loadRessource('js/predictions.js').then(function() {
            App.Predictions.render();
          });
        } else {
          console.warn('Predictions are not available.');
        }

      });
    },
    loadResults: function() {
      App.showLoading();
      var selectedWeek = this.Navigation.getSelectedWeek(),
          url = useLocal ? `http://localhost/bl/data/data-bl1-2016-${selectedWeek}.json` : `http://www.openligadb.de/api/getmatchdata/bl1/2016/${selectedWeek}`;
      _get(url).then(function(response) {
        console.log(App.Util.resultParser(response));
        return _renderResults(App.Util.resultParser(response));
      }).then(function() {
        App.hideLoading();
      });
    },
    showOffline: function() {
      this.offline = true;
      _get('offline.html').then(function(response) {
        var offlineContainer = document.createElement('div');
        offlineContainer.setAttribute('id', 'offline-container');
        offlineContainer.innerHTML = response;
        document.querySelector('#container').appendChild(offlineContainer);
        document.querySelector('body').classList.add('offline');
      });
    },
    hideOffline: function() {
      this.offline = true;
      document.querySelector('#offline-container').remove();
      document.querySelector('body').classList.remove('offline');
    },
    showLoading: function() {
      this.loading = true;
      document.querySelector('body').classList.add('loading');
    },
    hideLoading: function() {
      this.loading = false;
      document.querySelector('body').classList.remove('loading');
    },
    Features: (function() {
      return {
        predictions: (function() {
          var test = 'test';
          try {
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
          } catch(e) {
            return false;
          }
        })()
      };
    })(),
    Navigation: (function() {
      var today = new Date();
      today.setMinutes(0);
      today.setHours(0);
      today.setSeconds(0);
      today.setMilliseconds(0);

      var seasonStart = new Date('2016-08-25T00:00:00')
          msPerWeek = 1000 * 60 * 60 * 24 * 7,
          weeksSinceSeasonStart = 1 + Math.floor((today - seasonStart) / msPerWeek),
          rendered = false,
          regex = /#!\d{1,2}/,
          _updateLocation = function(week) {
            if (location.hash.match(regex)) { // Week is already present
              location.hash = location.hash.replace(regex, `#!${week}`);
            } else {
              location.hash = `#!${week}${location.hash}`;
            }
            
          },
          _getSelectedWeekFromLocation = function() {
            var current = location.hash.match(regex)
            if (current) {
              try {
                return parseInt(current[0].replace('#!', ''));
              } catch (err) {
                console.error('Unable to parse week from URL: ', err);
                return null;
              }
            } else {
              return null;
            }
          },
          selectedWeek = _getSelectedWeekFromLocation() || weeksSinceSeasonStart;

      return {
        getWeeksSinceSeasonStart: function() {
          return weeksSinceSeasonStart;
        },
        getSelectedWeek: function() {
          return selectedWeek;
        },
        goToNextWeek: function() {
          selectedWeek++;
          _updateLocation(selectedWeek);
        },
        goToPrevWeek: function() {
          selectedWeek--;
          _updateLocation(selectedWeek);
        },
        isPrevButtonActive: function() {
          return selectedWeek > 1;
        },
        isNextButtonActive: function() {
          return selectedWeek < 34;
        },
        render: function() {
          var ele = document.querySelector('nav'),
              prev = ele.querySelector('.prev'),
              next =  ele.querySelector('.next');
          if (!this.isPrevButtonActive()) {
            prev.setAttribute('disabled', true);
          } else {
            prev.removeAttribute('disabled');
          }
          if (!this.isNextButtonActive()) {
            next.setAttribute('disabled', true);
          } else {
            next.removeAttribute('disabled');
          }

          ele.querySelector('.current-week').textContent = this.getSelectedWeek();

          if (!rendered) {
            var _this = this,
                goNextFn = function(e) {
                  if (App.loading || App.offline || !_this.isNextButtonActive) {
                    return;
                  }
                  _this.goToNextWeek();
                  _this.render();
                  App.loadResults();
                },
                goPrevFn = function(e) {
                  if (App.loading || App.offline || !_this.isPrevButtonActive) {
                    return;
                  }
                  _this.goToPrevWeek();
                  _this.render();
                  App.loadResults();
                };

            if ('ontouchstart' in window) {
              _loadRessource('js/app.js').then(function() {
                document.addEventListener('swipeleft', goNextFn);
                document.addEventListener('swiperight', goPrevFn);
              });
              //next.classList.add('hide');
              //prev.classList.add('hide');
            } else {
              //next.addEventListener('click', goNextFn);
              //prev.addEventListener('click', goPrevFn);
            }
            next.addEventListener('click', goNextFn);
            prev.addEventListener('click', goPrevFn);

            rendered = true;
          }
        }
      };
    })()
  }
})();

App.init();