'use strict';
/**
 * https://developers.google.com/web/fundamentals/getting-started/your-first-progressive-web-app/step-07?hl=en
 * https://weather-pwa-sample.firebaseapp.com/step-08/
 *
 * https://www.smashingmagazine.com/2016/08/a-beginners-guide-to-progressive-web-apps/
 * https://github.com/IncredibleWeb/pwa-tutorial/blob/master/demo/js/page.js
 *
 * https://flights.airberlin.com/en-DE/your-first-progressive-web-app
 *
 * https://a-k-apart.com/faq
 *
 * TODOS:
 *   Remove localhost workarounds
 * 
 */


// Create shorthand for querySelector and querySelectorAll
Node.prototype.q = function (sel) {
  return this.querySelector(sel);
};
Node.prototype.qA = function (sel) {
  return this.querySelectorAll(sel);
};

var App = (() => {
  // Wrap XHR-calls and return Promise
  var _get = (url) => {
    return new Promise((resolve, reject) => {
      var request = new XMLHttpRequest();
      request.open('GET', url, true);

      request.onload = () => {
        if (request.status === 200) {
          resolve(request.responseText);
        } else {
          console.error('Failed to get:', url);
          reject(new Error(request.statusText));
        }
      };

      request.onerror = (err) => {
        console.error('Failed to get:', url);
        reject(err);
      };
      request.send();
    });
  },
  _loadedRessources = [],
  /**
   * Loads CSS or JS ressources and adds them to the page.
   * @param  {Array} files Array of file paths to add.
   * @return {Promise}       Promise that resolves once all files have been loaded.
   */
  _loadRessource = (files) => {
    if (typeof files === 'string') files = [files];

    return new Promise((resolve, reject) => {

      let successes = 0;
      let successFn = (filename) => {
        if (++successes === files.length) {
          console.log('Finished loading all files:', files);
          resolve();
        }
      };

      files.forEach((filename) => {
        // Prevent file from loading multiple times
        if (_loadedRessources.indexOf(filename) > -1) {
          successFn(filename);
          return;
        } else {
          _loadedRessources.push(filename);
        }
        var filetype = filename.indexOf('.js') !== -1 ? 'js' : 'css';

        if (filetype === 'js'){ //if filename is a external JavaScript file
          var fileref = document.createElement('script');
          fileref.setAttribute('src', filename);
          fileref.onload = successFn;
          if (typeof fileref !== 'undefined') document.q('body').appendChild(fileref);
        }
        else if (filetype === 'css'){ //if filename is an external CSS file
          var fileref = document.createElement('link');
          fileref.setAttribute('rel', 'stylesheet');
          fileref.setAttribute('href', filename);
          fileref.onload = successFn;
          if (typeof fileref !== 'undefined') document.q('head').appendChild(fileref);
        }
      });
    });
  },
  /**
   * Renders results by cloning the result template and filling in the fields.
   * @param  {Array} results Array of result objects provided by the API.
   * @return {Promise}         Promise that resolves once rendering is complete.
   */
  _renderResults = (results) => { // Generate HTML out of parsed results and returns a Promise
    return new Promise((resolve, reject) => {   
      // Remove old results
      document.qA('.result:not(.template)').forEach((ele) => {
        ele.remove();
      });

      var template = document.q('.result.template'),
          container = document.q('.results'),
          fragment = document.createDocumentFragment();

      results.forEach((result) => {
        var ele = template.cloneNode(true),
            moreContainer = ele.q('.more-container'),
            goalsContainer = moreContainer.q('.goals'),
            predictionsContainer = moreContainer.q('.predictions'),
            showMoreButton = ele.q('.shore-more-button');

        ele.classList.remove('template');

        ele.setAttribute('data-match-id', result.MatchID);
        ele.q('.team1-name').textContent = result.Team1.TeamName;
        ele.q('.team2-name').textContent = result.Team2.TeamName;
        if (this.online) { // Only load images if there is a connection to the internet     
          ele.q('.team1-icon').setAttribute('src', result.Team1.TeamIconUrl.replace('http:', location.protocol));
          ele.q('.team1-icon').setAttribute('alt', result.Team1.TeamName + ' icon');
          ele.q('.team1-icon').addEventListener('load', function() {
            this.classList.add('loaded');
          });
          ele.q('.team2-icon').setAttribute('src', result.Team2.TeamIconUrl.replace('http:', location.protocol));
          ele.q('.team2-icon').setAttribute('alt', result.Team2.TeamName + ' icon');
          ele.q('.team2-icon').addEventListener('load', function() {
            this.classList.add('loaded');
          });
        }

        var d = new Date(result.MatchDateTimeUTC), // Math date
            s = App.Util.dateParser(d);
            
        ele.q('.time').textContent = s;



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
          ele.q('.points-team1').textContent = result.MatchResults[resultIndex].PointsTeam1;
          ele.q('.points-team2').textContent = result.MatchResults[resultIndex].PointsTeam2;


          // Needed to see which team scored...
          var goalsTeam1 = 0,
              goalsTeam2 = 0;

          result.Goals.forEach((goal) => {
            // Check which team scored
            var scoringTeam;
            if (goal.ScoreTeam1 > goalsTeam1) {
              scoringTeam = 1;
              goalsTeam1 = goal.ScoreTeam1;
            } else {
              scoringTeam = 2;
              goalsTeam2 = goal.ScoreTeam2;            
            }

            let goalsHeading = goalsContainer.q('.heading'),
                goalsEle = goalsContainer.q('li.template').cloneNode(true);
            goalsHeading.setAttribute('id', `goals-heading-${result.MatchID}`);
            goalsEle.classList.add('goal-team-' + scoringTeam);
            goalsEle.classList.remove('template');
            let goalGetterName = goal.GoalGetterName || '<span class="visuallyhidden">Unknown</span><span aria-hidden="true">???</span>';
            goalsEle.q('.goal-scorer').innerHTML = goalGetterName + '<span class="visuallyhidden">for team: '+result['Team'+scoringTeam].TeamName+'</span>';
            let goalMatchMinute = goal.MatchMinute || '<span class="visuallyhidden">Unknown</span><span aria-hidden="true">??</span>';
            goalsEle.q('.goal-time').innerHTML = goalMatchMinute;
            goalsContainer.q('ul').setAttribute('aria-labelledby', `goals-heading-${result.MatchID}`);
            goalsContainer.q('ul').appendChild(goalsEle);
          });
        } else if (new Date(result.MatchDateTime) < new Date()) {
          ele.classList.add('ongoing');
        } else {
          ele.classList.add('not-started');
          goalsContainer.classList.add('hide'); // Hide list of goals for not started games
        }

        
        

        // Render predictions
        if (App.Predictions) {
          App.Predictions.render(ele, result);
        } else {
          if (!result.MatchIsFinished) { // If predictions are not available, then button only makes sense for finished games to show goals
            showMoreButton.classList.add('hide');
          }
          console.warn('Predictions are not available.');
        }



        fragment.appendChild(ele);
      });
      container.appendChild(fragment);

      resolve();
    });
  };

  return {
    online: false,
    /**
     * Initializes the App.
     */
    init: function() {
      if (App.Features.serviceWorker) {
        navigator.serviceWorker.register('./worker.js').then((reg) => {
          console.log('Registration successful:', reg);
        }).catch((err) => {
            console.warn('Error registering Service Worker:', err);
        });
      }


      let ressources = ['js/util.js', 'css/fonts.css'];
      if (App.Features.store) {
        ressources.push('js/store.js');
      }
      if (App.Features.predictions) {
        ressources.push('js/predictions.js');
        ressources.push('js/points.js');
      }
      // Load utils before initializing.
      _loadRessource(ressources).then(() => {
        window.addEventListener('online', (e) => {
          //App.hideOffline();
          App.loadResults();
          App.online = true;
        }, false);

        window.addEventListener('offline', (e) => {
          //App.showOffline();
          App.online = false;
        }, false);

         // Initial online check
        if (navigator.onLine) {
          App.online = true;
        }
        return App.loadResults();
      }).then(() => {
        if (App.Navigation) {
          App.Navigation.render();
        }
        if (App.Points && App.Store) {
          let pointsButton = document.q('.points-button'),
              pointsContainer = document.q('#prediction-points-container');
          pointsButton.addEventListener('click', function(event) {
            var expanded = this.getAttribute('aria-expanded') === 'true';
            if (expanded) { // Close
              this.setAttribute('aria-expanded', false);
              this.setAttribute('title', 'Show points');
              this.q('span').innerHTML = '&empty;';
              document.q('body').classList.remove('points-visible');
            } else { // Open
              this.setAttribute('aria-expanded', true);
              this.setAttribute('title', 'Hide points');
              this.q('span').innerHTML = '&times;';
              document.q('body').classList.add('points-visible');
              pointsContainer.focus();
            }
          });

          Promise.all([
            App.Store.open('data').then(() => {
              return App.Store.getAll('data');
            }),
            App.Store.open('predictions').then(() => {
              return App.Store.getAll('predictions');
            })
          ]).then((values) => {
            let results = values[0],
                predictions = values[1];
            App.Points.renderAllPoints(document.q('#prediction-points-container'), results, predictions);
            pointsButton.classList.remove('hide');
          });
        }
        App.hideLoading();
      });
    },
    /**
     * Loads results from the external API.
     * Checks cache (Store) before fetching.
     * @param  {Boolean} forceReload Wheter fetching should be forced.
     */
    loadResults: function(forceReload) {
      App.showLoading();
      App.hideOffline();
      let selectedWeek = this.Navigation.getSelectedWeek(),
          protocol = location.protocol || 'https:',
          // url = `http://localhost/bl/data/data-bl1-2016-${selectedWeek}.json`;
          url = `${protocol}//www.openligadb.de/api/getmatchdata/bl1/2016/${selectedWeek}`;
      


      let promise,
          // Fetch, parse and store in cache
          fetchData = function() {
            return _get(url).then(function(response) {
              let newData = App.Util.resultParser(response);
              if (App.store) { // Store available, store data in store
                App.Store.open('data').then(function() {
                  return App.Store.add('data', selectedWeek, newData);
                });
              }
              return newData;
            }, function(err) { // Fetch failed, show offline message
              if (forceReload) {
                return App.showNotice('Unable to fetch data.');
              } else {
                return App.showOffline();
              }
            });
          };
      if (App.Features.store && !forceReload) { // Store available, load data from store
        promise = App.Store.open('data').then(() => {
          return App.Store.get('data', selectedWeek);
        }).then(function(data) {
          if (data) { // If data exists in store, resolve with this data
            return data;
          } else { // If data does not exist in store, perform fetch
            return fetchData();
          }
        });
      } else {
        promise = _get(url).then((response) => {
          let newData = App.Util.resultParser(response);
          if (App.Features.store) { // Store available, store data in store
            App.Store.open('data').then(() => {
              return App.Store.add('data', selectedWeek, newData);
            });
          }
          return newData;
        }, (err) => {
          if (forceReload) {
            return App.showNotice('Unable to fetch data.');
          } else {
            return App.showOffline();
          }
        });
      }

      return promise.then((data) => {
        if (data) {
          return _renderResults(data);
        } else if (!forceReload) {
          return App.showOffline();
        }
      }).then(() => {
        return App.hideLoading();
      });
    },
    /**
     * Shows the offline container.
     * Fetches its contents from the offline.html file.
     * Toggles App.offline to true and App.online to false.
     * Adds offline class to body.
     * @return {Promise} Resolves when the container is shown.
     */
    showOffline: function() {
      if (!this.offlineMessageVisible) {
        this.offline = true;
        this.online = false;
        this.offlineMessageVisible = true;
        return _get('offline.html').then((response) => {
          return new Promise((resolve, reject) => {
            var offlineContainer = document.createElement('div');
            offlineContainer.setAttribute('id', 'offline-container');
            offlineContainer.innerHTML = response;
            document.q('#results-container').appendChild(offlineContainer);
            document.q('body').classList.add('offline');
            resolve();
          });
        });
      }
    },
    /**
     * Hides the offline container.
     * Toggles App.offline to false and App.online to true.
     * Removes offline class from body.
     */
    hideOffline: function() {
      if (this.offlineMessageVisible) {
        this.offline = false;
        this.online = true;
        this.offlineMessageVisible = false;
        let offlineContainer = document.q('#offline-container');
        if (offlineContainer) {
          offlineContainer.remove();
        }
        document.q('body').classList.remove('offline');
      }
    },
    /**
     * Shows a banner notice for a given time.
     * @param  {String} message Message text to show.
     * @return {Promise}         Promise to resolve when the message is visible.
     */
    showNotice: function(message) {
      return new Promise((resolve, reject) => {
        var noticeContainer = document.createElement('div');
        noticeContainer.classList.add('notice');
        noticeContainer.innerHTML = message;
        document.q('#container').appendChild(noticeContainer);
        setTimeout(function() {
          noticeContainer.remove();
        }, 5000);
        resolve();
      });
    },
    /**
     * Shows the loading container.
     * Toggles App.loading to true.
     * Adds loading class to body.
     */
    showLoading: function() {
      this.loading = true;
      this.startedLoading = new Date();
      document.q('body').classList.add('loading');
      document.q('#container').setAttribute('aria-busy', true);
      clearTimeout(this.loadTimeout);
    },
    /**
     * Hides the loading container.
     * Loading container will remain at least 500 ms.
     * Toggles App.loading to false.
     * Removes loading class from body.
     */
    hideLoading: function() {
      let _this = this,
          loadDiff = new Date() - this.startedLoading,
          hide = () => {
            this.loading = false;
            document.q('body').classList.remove('loading');
            document.q('#container').removeAttribute('aria-busy');
            clearTimeout(this.loadTimeout);
          };
      if (loadDiff > 500) {
        hide();
      } else {
        this.loadTimeout = setTimeout(hide, 500 - loadDiff);
      }
    },
    /**
     * Detect is a feature is supported.
     * @type {Object}
     */
    Features: {
      predictions: ('indexedDB' in window),
      store: ('indexedDB' in window),
      serviceWorker: ('serviceWorker' in navigator),
      touch: ('ontouchstart' in window) 
    },
    /**
     * Bundle Navigation API.
     */
    Navigation: (function() {
      var today = new Date();
      today.setMinutes(0);
      today.setHours(0);
      today.setSeconds(0);
      today.setMilliseconds(0);

      var seasonStart = new Date('2016-08-25T00:00:00'),
          msPerWeek = 1000 * 60 * 60 * 24 * 7,
          weeksSinceSeasonStart = 1 + Math.floor((today - seasonStart) / msPerWeek),
          rendered = false,
          regex = /#!\d{1,2}/,
          _updateLocation = (week) => {
            if (location.hash.match(regex)) { // Week is already present
              location.hash = location.hash.replace(regex, `#!${week}`);
            } else {
              location.hash = `#!${week}${location.hash}`;
            }
            
          },
          _getSelectedWeekFromLocation = () => {
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
          var ele = document.q('nav'),
              prev = ele.q('.prev'),
              next =  ele.q('.next');
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

          ele.q('.current-week').textContent = this.getSelectedWeek();

          if (!rendered) {
            var goNextFn = (e) => {
                if (App.loading || !this.isNextButtonActive()) {
                  return;
                }
                this.goToNextWeek();
                this.render();
                App.loadResults();
              },
              goPrevFn = (e) => {
                if (App.loading || !this.isPrevButtonActive()) {
                  return;
                }
                this.goToPrevWeek();
                this.render();
                App.loadResults();
              };

            if (App.Features.touch) {
              _loadRessource('js/app.js').then(function() {
                document.addEventListener('swipeleft', goNextFn);
                document.addEventListener('swiperight', goPrevFn);
              });
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