/**
 * Progressive Web Application that displays the results of the first German soccer league.
 * Will also allow making predictions if IndexedDB is available.
 *
 * Made by Marius Olbertz, https://github.com/Owlbertz
 */

'use strict';
// Create shorthand for querySelector and querySelectorAll
Node.prototype.q = function (sel) {
  return this.querySelector(sel);
};
Node.prototype.qA = function (sel) {
  let nodes = this.querySelectorAll(sel);
  return nodes.length ? nodes : [];
};
Node.prototype.on = function (name, cb) {
  return this.addEventListener(name, cb);
};
Node.prototype.attr = function (name, value) {
  return this.setAttribute(name, value);
};
NodeList.prototype.forEach = HTMLCollection.prototype.forEach = Array.prototype.forEach;

if (!('remove' in Element.prototype)) {
  Element.prototype.remove = function() {
    if (this.parentNode) {
      this.parentNode.removeChild(this);
      }
  };
}

document.body.classList.remove('no-js');

let App = (() => {
  // Wrap XHR-calls and return Promise
  let _get = (url) => {
    return new Promise((resolve, reject) => {
      let request = new XMLHttpRequest();
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
        let filetype = filename.indexOf('.js') !== -1 ? 'js' : 'css';

        if (filetype === 'js'){ //if filename is a external JavaScript file
          let fileref = document.createElement('script');
          fileref.attr('src', filename);
          fileref.onload = successFn;
          /*if (typeof fileref !== 'undefined')*/ document.q('body').appendChild(fileref);
        } else if (filetype === 'css') { //if filename is an external CSS file
          let fileref = document.createElement('link');
          fileref.attr('rel', 'stylesheet');
          fileref.attr('href', filename);
          fileref.onload = successFn;
          /*if (typeof fileref !== 'undefined')*/ document.q('head').appendChild(fileref);
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

      let template = document.q('.result.template'),
          container = document.q('.results'),
          fragment = document.createDocumentFragment();

      results.forEach((result) => {
        let ele = template.cloneNode(true),
            moreContainer = ele.q('.more-container'),
            goalsContainer = moreContainer.q('.goals'),
            predictionsContainer = moreContainer.q('.predictions'),
            showMoreButton = ele.q('.shore-more-button');

        ele.classList.remove('template');

        ele.attr('data-match-id', result.MatchID);
        ele.q('.team1-name').textContent = result.Team1.TeamName;
        ele.q('.team2-name').textContent = result.Team2.TeamName;
        if (this.online) { // Only load images if there is a connection to the internet     
          ele.q('.team1-icon').attr('src', result.Team1.TeamIconUrl.replace('http:', location.protocol));
          ele.q('.team1-icon').attr('alt', result.Team1.TeamName + ' icon');
          ele.q('.team1-icon').on('load', function() {
            this.classList.add('loaded');
          });
          ele.q('.team2-icon').attr('src', result.Team2.TeamIconUrl.replace('http:', location.protocol));
          ele.q('.team2-icon').attr('alt', result.Team2.TeamName + ' icon');
          ele.q('.team2-icon').on('load', function() {
            this.classList.add('loaded');
          });
        }
        
        // Set parsed match date            
        ele.q('.time').textContent = App.Util.dateParser(new Date(result.MatchDateTimeUTC));


        // Show more container logic
        let moreContainerId = 'more-container-' + result.MatchID;
        moreContainer.attr('id', moreContainerId);
        showMoreButton.attr('aria-controls', moreContainerId);

        showMoreButton.on('click', function(event) {
          let expanded = this.getAttribute('aria-expanded') === 'true';
          if (expanded) { // Close
            this.attr('aria-expanded', false);
            moreContainer.classList.remove('open');
            this.attr('title', 'Show additional information');
          } else { // Open
            this.attr('aria-expanded', true);
            moreContainer.classList.add('open');
            this.attr('title', 'Hide additional information');
          }
        });

        if (result.MatchIsFinished) {
          ele.classList.add('finished');

          let resultIndex = result.MatchResults[0].ResultOrderID === 2 ? 0 : 1;
          ele.q('.points-team1').textContent = result.MatchResults[resultIndex].PointsTeam1;
          ele.q('.points-team2').textContent = result.MatchResults[resultIndex].PointsTeam2;


          // Needed to see which team scored...
          let goalsTeam1 = 0,
              goalsTeam2 = 0;

          result.Goals.forEach((goal) => {
            // Check which team scored
            let scoringTeam;
            if (goal.ScoreTeam1 > goalsTeam1) {
              scoringTeam = 1;
              goalsTeam1 = goal.ScoreTeam1;
            } else {
              scoringTeam = 2;
              goalsTeam2 = goal.ScoreTeam2;            
            }

            let goalsHeading = goalsContainer.q('.heading'),
                goalsEle = goalsContainer.q('li.template').cloneNode(true);
            goalsHeading.attr('id', `goals-heading-${result.MatchID}`);
            goalsEle.classList.add('goal-team-' + scoringTeam);
            goalsEle.classList.remove('template');
            let goalGetterName = goal.GoalGetterName || '<span class="visuallyhidden">Unknown</span><span aria-hidden="true">???</span>';
            goalsEle.q('.goal-scorer').innerHTML = goalGetterName + '<span class="visuallyhidden">for team: '+result['Team'+scoringTeam].TeamName+'</span>';
            let goalMatchMinute = goal.MatchMinute || '<span class="visuallyhidden">Unknown</span><span aria-hidden="true">??</span>';
            goalsEle.q('.goal-time').innerHTML = goalMatchMinute;
            goalsContainer.q('ul').attr('aria-labelledby', `goals-heading-${result.MatchID}`);
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

      // Render points
      if (App.Points) {
        Promise.all([
          App.Store.open('data').then(() => {
            return App.Store.getAll('data');
          }),
          App.Store.open('predictions').then(() => {
            return App.Store.getAllPerIndex('predictions');
          })
        ]).then((values) => {
          let results = values[0],
              predictions = values[1];
          App.Points.renderAllPoints(document.q('#prediction-points-container'), results, predictions);
          document.q('.points-button').classList.remove('hide');
          resolve();
        });
      } else {
        resolve();
      }

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

      let ressources = ['js/util.js'];
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
          pointsButton.on('click', function(event) {
            let expanded = this.getAttribute('aria-expanded') === 'true';
            if (expanded) { // Close
              this.attr('aria-expanded', false);
              this.attr('title', 'Show points');
              this.q('span').innerHTML = '&empty;';
              document.q('body').classList.remove('points-visible');
            } else { // Open
              this.attr('aria-expanded', true);
              this.attr('title', 'Hide points');
              this.q('span').innerHTML = '&times;';
              document.q('body').classList.add('points-visible');
              pointsContainer.focus();
            }
          });
        }

        // Load fonts afterwards so they're non-blocking
        _loadRessource(['css/fonts.css']);
        
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
      if (App.Store && !forceReload) { // Store available, load data from store
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
            let offlineContainer = document.createElement('div');
            offlineContainer.attr('id', 'offline-container');
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
        let noticeContainer = document.createElement('div');
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
      document.q('#container').attr('aria-busy', true);
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
    Navigation: (() => {
      let today = new Date();
      today.setMinutes(0);
      today.setHours(0);
      today.setSeconds(0);
      today.setMilliseconds(0);

      let seasonStart = new Date('2016-08-25T00:00:00'),
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
            let current = location.hash.match(regex)
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
        getSelectedWeek: () => {
          return selectedWeek;
        },
        next: () => {
          selectedWeek++;
          _updateLocation(selectedWeek);
        },
        prev: () => {
          selectedWeek--;
          _updateLocation(selectedWeek);
        },
        isPrev: () => {
          return selectedWeek > 1;
        },
        isNext: () => {
          return selectedWeek < 34;
        },
        render: function() {
          let ele = document.q('nav'),
              prev = ele.q('.prev'),
              next =  ele.q('.next');
          if (!this.isPrev()) {
            prev.attr('disabled', true);
          } else {
            prev.removeAttribute('disabled');
          }
          if (!this.isNext()) {
            next.attr('disabled', true);
          } else {
            next.removeAttribute('disabled');
          }

          ele.q('.current-week').textContent = this.getSelectedWeek();

          if (!rendered) {
            let goNextFn = (e) => {
                if (App.loading || !this.isNext()) {
                  return;
                }
                this.next();
                this.render();
                App.loadResults();
              },
              goPrevFn = (e) => {
                if (App.loading || !this.isPrev()) {
                  return;
                }
                this.prev();
                this.render();
                App.loadResults();
              };

            if (App.Features.touch) {
              _loadRessource('js/touch.js').then(function() {
                document.on('swipeleft', goNextFn);
                document.on('swiperight', goPrevFn);
              });
            }
            next.on('click', goNextFn);
            prev.on('click', goPrevFn);

            rendered = true;
          }
        }
      };
    })()
  }
})();

let _polyfillsLoaded = 0,
    _polyFillCallback = () => {
      if (++_polyfillsLoaded === 2) {
        App.init();
      }
    };
// Add polyfills if necessary...
if (typeof Promise !== 'undefined' && Promise.toString().indexOf('[native code]') !== -1) {
  _polyFillCallback();
} else { // No Promises...
  let promisePolyfill = document.createElement('script');
  promisePolyfill.attr('src', 'js/shims/promise.js');
  promisePolyfill.onload = function() {
    _polyFillCallback();
  };
  document.q('body').appendChild(promisePolyfill);
}
if (typeof IDBObjectStore.prototype.getAll !== 'undefined' && IDBObjectStore.prototype.getAll.toString().indexOf('[native code]') !== -1) {
  _polyFillCallback();
} else { // No getAll for ObjectStore
  let getAllPolyfill = document.createElement('script');
  getAllPolyfill.attr('src', 'js/shims/indexeddb-getall-shim.js');
  getAllPolyfill.onload = function() {
    _polyFillCallback();
  };
  document.q('body').appendChild(getAllPolyfill);
}