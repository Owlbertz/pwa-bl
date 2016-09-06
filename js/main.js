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

var isOnline = location.hash.indexOf('online') !== -1,
    isOffline = location.hash.indexOf('offline') !== -1,
    useLocal = location.hash.indexOf('local') !== -1;


// Create shorthand for querySelector and querySelectorAll
Node.prototype.q = function(sel) {
  return this.querySelector(sel);
};
Node.prototype.qA = function(sel) {
  return this.querySelectorAll(sel);
};

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

      request.onerror = function(err) {
        console.error('Failed to get:', url);
        reject(err);
      };
      request.send();
    });
  },
  _loadedRessources = [],
  _loadRessource = function (files) {
    if (typeof files === 'string') files = [files];

    return new Promise(function(resolve, reject) {

      let successes = 0;
      let successFn = function(filename) {
        if (++successes === files.length) {
          console.log('Finished loading all files:', files);
          resolve();
        }
      };

      files.forEach(function(filename) {
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
          if (typeof fileref !== 'undefined') document.q('body').appendChild(fileref);
        }
      });
    });
  },

  _renderResults = function (results) { // Generate HTML out of parsed results and returns a Promise
    return new Promise(function(resolve, reject) {   
      // Remove old results
      document.qA('.result:not(.template)').forEach(function(ele) {
        ele.remove();
      });

      var template = document.q('.result.template'),
          container = document.q('.results');

      results.forEach(function(result) {
        var ele = template.cloneNode(true),
            moreContainer = ele.q('.more-container'),
            goalsContainer = moreContainer.q('.goals')
            predictionsContainer = moreContainer.q('.predictions'),
            showMoreButton = ele.q('.shore-more-button');

        ele.classList.remove('template');

        ele.setAttribute('data-match-id', result.MatchID);
        ele.q('.team1-name').textContent = result.Team1.TeamName;
        ele.q('.team2-name').textContent = result.Team2.TeamName;
        ele.q('.team1-icon').setAttribute('src', result.Team1.TeamIconUrl);
        ele.q('.team1-icon').setAttribute('alt', result.Team1.TeamName + ' icon');
        ele.q('.team1-icon').addEventListener('load', function() {
          this.classList.add('loaded');
        });
        ele.q('.team2-icon').setAttribute('src', result.Team2.TeamIconUrl);
        ele.q('.team2-icon').setAttribute('alt', result.Team2.TeamName + ' icon');
        ele.q('.team2-icon').addEventListener('load', function() {
          this.classList.add('loaded');
        });


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

            var goalEle = goalsContainer.q('li.template').cloneNode(true);
            goalEle.classList.add('goal-team-' + scoringTeam);
            goalEle.classList.remove('template');
            goalEle.q('.goal-scorer').innerHTML = goal.GoalGetterName + '<span class="visuallyhidden">for team: '+result['Team'+scoringTeam].TeamName+'</span>';
            goalEle.q('.goal-time').textContent = goal.MatchMinute;
            goalsContainer.q('ul').appendChild(goalEle);
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
          console.warn('Predictions are not available.');
        }

        container.appendChild(ele);

        resolve();
      });
    });
  };

  return {
    online: false,
    init: function() {
      if (App.Features.serviceWorker) {
        navigator.serviceWorker.register('./worker.js').then(function(reg) {
          // ok....
        }).catch(function(err) {
            console.warn('Error registering Service Worker:', err);
        });
      }


      let ressources = ['js/util.js'];
      if (App.Features.store) {
        ressources.push('js/store.js');
      }
      if (App.Features.predictions) {
        ressources.push('js/predictions.js');
      }
      // Load utils before initializing.
      _loadRessource(ressources).then(function() {
        window.addEventListener('online', function(e) {
          //App.hideOffline();
          App.loadResults();
          App.online = true;
        }, false);

        window.addEventListener('offline', function(e) {
          //App.showOffline();
          App.online = false;
        }, false);

         // Initial online check
        if (isOnline || navigator.onLine) {
          App.online = true;
          //return App.loadResults();
        }/* else {
          return new Promise(function(resolve, reject) {
            //App.showOffline();
            reject();
          });
        }*/
        return App.loadResults();
      }).then(function() {
        App.hideLoading();
        if (App.Navigation) {
          App.Navigation.render();
        }
      });
    },
    loadResults: function(forceReload) {
      App.showLoading();
      App.hideOffline();
      let selectedWeek = this.Navigation.getSelectedWeek(),
          protocol = location.protocol || 'https:',
          url = useLocal ? `http://localhost/bl/data/data-bl1-2016-${selectedWeek}.json` : `${protocol}//www.openligadb.de/api/getmatchdata/bl1/2016/${selectedWeek}`;
      


      let promise,
          // Fetch, parse and store in cache
          fetchData = function() {
            return _get(url).then(function(response) {
              let newData = App.Util.resultParser(response);
              if (App.Features.store) { // Store available, store data in store
                App.Store.open().then(function() {
                  return App.Store.add(selectedWeek, newData);
                });
              }
              return new Promise(function(resolve, reject) {
                resolve(newData);
              });
            }, function(err) { // Fetch failed, show offline message
              if (forceReload) {
                return App.showNotice('Unable to fetch data.');
              } else {
                return App.showOffline();
              }
            });
          };
      if (App.Features.store && !forceReload) { // Store available, load data from store
        promise = App.Store.open().then(function() {
          return App.Store.get(selectedWeek);
        }).then(function(data) {
          if (data) { // If data exists in store, resolve with this data
            return new Promise(function(resolve, reject) {
              resolve(data);
            });
          } else { // If data does not exist in store, perform fetch
            return fetchData();
          }
        });
      } else {
        promise = _get(url).then(function(response) {
          let newData = App.Util.resultParser(response);
          if (App.Features.store) { // Store available, store data in store
            App.Store.open().then(function() {
              return App.Store.add(selectedWeek, newData);
            });
          }
          return new Promise(function(resolve, reject) {
            resolve(newData);
          });
        }, function(err) {
          if (forceReload) {
            return App.showNotice('Unable to fetch data.');
          } else {
            return App.showOffline();
          }
        });
      }

      promise.then(function(data) {
        if (data) {
          return _renderResults(data);
        } else {
          App.showOffline();
        }
      }).then(function() {
        App.hideLoading();
      });
    },
    showOffline: function() {
      if (this.online) {
        this.offline = true;
        this.online = false;
        return _get('offline.html').then(function(response) {
          return new Promise(function(resolve, reject) {
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
    hideOffline: function() {
      if (this.offline) {
        this.offline = false;
        this.online = true;
        let offlineContainer = document.q('#offline-container');
        if (offlineContainer) {
          offlineContainer.remove();
        }
        document.q('body').classList.remove('offline');
      }
    },
    showNotice: function(message) {
      return new Promise(function(resolve, reject) {
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
    showLoading: function() {
      this.loading = true;
      this.startedLoading = new Date();
      document.q('body').classList.add('loading');
      clearTimeout(this.loadTimeout);
    },
    hideLoading: function() {
      let _this = this,
          loadDiff = new Date() - this.startedLoading,
          hide = () => {
            this.loading = false;
            document.q('body').classList.remove('loading');
            clearTimeout(this.loadTimeout);
          };
      if (loadDiff > 500) {
        hide();
      } else {
        this.loadTimeout = setTimeout(hide, 500 - loadDiff);
      }
    },
    Features: (function() {
      return {
        predictions: ('localStorage' in window),
        store: ('indexedDB' in window),
        serviceWorker: ('serviceWorker' in navigator),
        touch: ('ontouchstart' in window) 
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
            var _this = this,
                goNextFn = function(e) {
                  if (App.loading|| !_this.isNextButtonActive) {
                    return;
                  }
                  _this.goToNextWeek();
                  _this.render();
                  App.loadResults();
                },
                goPrevFn = function(e) {
                  if (App.loading || !_this.isPrevButtonActive) {
                    return;
                  }
                  _this.goToPrevWeek();
                  _this.render();
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