var isOnline=location.hash.indexOf("online")!==-1,isOffline=location.hash.indexOf("offline")!==-1,useLocal=location.hash.indexOf("local")!==-1,App=function(){var e=function(e){return new Promise(function(t,n){var o=new XMLHttpRequest;o.open("GET",e,!0),o.onload=function(){var i=e.indexOf("http")===-1;i||200===o.status?i?setTimeout(function(){t(o.responseText)},2e3):t(o.responseText):(console.error("Failed to get:",e),n(new Error(o.statusText)))},o.onerror=function(t){console.error("Failed to get:",e),n(t)},o.send()})},t=[],n=function(e){return"string"==typeof e&&(e=[e]),new Promise(function(n,o){var i=0,r=function(t){++i===e.length&&(console.log("Finished loading all files:",e),n())};e.forEach(function(e){if(t.indexOf(e)>-1)return void r(e);t.push(e);var n=e.indexOf(".js")!==-1?"js":"css";if("js"===n){var o=document.createElement("script");o.setAttribute("src",e),o.onload=r,"undefined"!=typeof o&&document.getElementsByTagName("body")[0].appendChild(o)}else if("css"===n){var o=document.createElement("link");o.setAttribute("rel","stylesheet"),o.setAttribute("href",e),o.onload=r,"undefined"!=typeof o&&document.getElementsByTagName("body")[0].appendChild(o)}})})},o=function(e){return new Promise(function(t,n){document.querySelectorAll(".result:not(.template)").forEach(function(e){e.remove()});var o=document.querySelector(".result.template"),i=document.querySelector(".results");e.forEach(function(e){var n=o.cloneNode(!0),r=n.querySelector(".more-container"),a=r.querySelector(".goals");predictionsContainer=r.querySelector(".predictions"),showMoreButton=n.querySelector(".shore-more-button"),n.classList.remove("template"),n.setAttribute("data-match-id",e.MatchID),n.querySelector(".team1-name").textContent=e.Team1.TeamName,n.querySelector(".team2-name").textContent=e.Team2.TeamName,n.querySelector(".team1-icon").setAttribute("src",e.Team1.TeamIconUrl),n.querySelector(".team1-icon").setAttribute("alt",e.Team1.TeamName+" icon"),n.querySelector(".team1-icon").addEventListener("load",function(){this.classList.add("loaded")}),n.querySelector(".team2-icon").setAttribute("src",e.Team2.TeamIconUrl),n.querySelector(".team2-icon").setAttribute("alt",e.Team2.TeamName+" icon"),n.querySelector(".team2-icon").addEventListener("load",function(){this.classList.add("loaded")});var s=new Date(e.MatchDateTimeUTC),c=App.Util.dateParser(s);n.querySelector(".time").textContent=c;var l="more-container-"+e.MatchID;if(r.setAttribute("id",l),showMoreButton.setAttribute("aria-controls",l),showMoreButton.addEventListener("click",function(e){var t="true"===this.getAttribute("aria-expanded");t?(this.setAttribute("aria-expanded",!1),r.classList.remove("open"),this.setAttribute("title","Show additional information")):(this.setAttribute("aria-expanded",!0),r.classList.add("open"),this.setAttribute("title","Hide additional information"))}),e.MatchIsFinished){n.classList.add("finished");var u=2===e.MatchResults[0].ResultOrderID?0:1;n.querySelector(".points-team1").textContent=e.MatchResults[u].PointsTeam1,n.querySelector(".points-team2").textContent=e.MatchResults[u].PointsTeam2;var d=0,p=0;e.Goals.forEach(function(t){var n;t.ScoreTeam1>d?(n=1,d=t.ScoreTeam1):(n=2,p=t.ScoreTeam2);var o=a.querySelector("li.template").cloneNode(!0);o.classList.add("goal-team-"+n),o.classList.remove("template"),o.querySelector(".goal-scorer").innerHTML=t.GoalGetterName+'<span class="visuallyhidden">for team: '+e["Team"+n].TeamName+"</span>",o.querySelector(".goal-time").textContent=t.MatchMinute,a.querySelector("ul").appendChild(o)})}else new Date(e.MatchDateTime)<new Date?n.classList.add("ongoing"):(n.classList.add("not-started"),a.classList.add("hide"));App.Predictions?App.Predictions.render(n,e):console.warn("Predictions are not available."),i.appendChild(n),t()})})};return{online:!1,init:function(){App.Features.serviceWorker&&navigator.serviceWorker.register("./worker.js").then(function(e){}).catch(function(e){console.warn("Error registering Service Worker:",e)});var e=["js/util.js"];App.Features.store&&e.push("js/store.js"),App.Features.predictions&&e.push("js/predictions.js"),n(e).then(function(){return window.addEventListener("online",function(e){App.loadResults(),App.online=!0},!1),window.addEventListener("offline",function(e){App.online=!1},!1),(isOnline||navigator.onLine)&&(App.online=!0),App.loadResults()}).then(function(){App.hideLoading(),App.Navigation&&App.Navigation.render()})},loadResults:function(t){App.showLoading(),App.hideOffline();var n=this.Navigation.getSelectedWeek(),i=location.protocol||"https:",r=useLocal?"http://localhost/bl/data/data-bl1-2016-"+n+".json":i+"//www.openligadb.de/api/getmatchdata/bl1/2016/"+n,a=void 0;a=App.Features.store&&!t?App.Store.open().then(function(){return App.Store.get(n)}).then(function(o){return o?new Promise(function(e,t){e(o)}):e(r).then(function(e){var t=App.Util.resultParser(e);return App.Features.store&&App.Store.open().then(function(){return App.Store.add(n,t)}),new Promise(function(e,n){e(t)})},function(e){return t?App.showNotice("Unable to fetch data."):App.showOffline()})}):e(r).then(function(e){var t=App.Util.resultParser(e);return App.Features.store&&App.Store.open().then(function(){return App.Store.add(n,t)}),new Promise(function(e,n){e(t)})},function(e){return t?App.showNotice("Unable to fetch data."):App.showOffline()}),a.then(function(e){return e?o(e):void App.showOffline()}).then(function(){App.hideLoading()})},showOffline:function(){if(this.online)return this.offline=!0,this.online=!1,e("offline.html").then(function(e){return new Promise(function(t,n){var o=document.createElement("div");o.setAttribute("id","offline-container"),o.innerHTML=e,document.querySelector("#results-container").appendChild(o),document.querySelector("body").classList.add("offline"),t()})})},hideOffline:function(){if(this.offline){this.offline=!1,this.online=!0;var e=document.querySelector("#offline-container");e&&e.remove(),document.querySelector("body").classList.remove("offline")}},showNotice:function(e){return new Promise(function(t,n){var o=document.createElement("div");o.classList.add("notice"),o.innerHTML=e,document.querySelector("#container").appendChild(o),setTimeout(function(){o.remove()},5e3),t()})},showLoading:function(){this.loading=!0,this.startedLoading=new Date,document.querySelector("body").classList.add("loading"),clearTimeout(this.loadTimeout)},hideLoading:function(){var e=this,t=new Date-this.startedLoading,n=function(){e.loading=!1,document.querySelector("body").classList.remove("loading"),clearTimeout(e.loadTimeout)};t>500?n():this.loadTimeout=setTimeout(n,500-t)},Features:function(){return{predictions:"localStorage"in window,store:"indexedDB"in window,serviceWorker:"serviceWorker"in navigator,touch:"ontouchstart"in window}}(),Navigation:function(){var e=new Date;e.setMinutes(0),e.setHours(0),e.setSeconds(0),e.setMilliseconds(0);var t=new Date("2016-08-25T00:00:00");return msPerWeek=6048e5,weeksSinceSeasonStart=1+Math.floor((e-t)/msPerWeek),rendered=!1,regex=/#!\d{1,2}/,_updateLocation=function(e){location.hash.match(regex)?location.hash=location.hash.replace(regex,"#!"+e):location.hash="#!"+e+location.hash},_getSelectedWeekFromLocation=function(){var e=location.hash.match(regex);if(!e)return null;try{return parseInt(e[0].replace("#!",""))}catch(e){return console.error("Unable to parse week from URL: ",e),null}},selectedWeek=_getSelectedWeekFromLocation()||weeksSinceSeasonStart,{getWeeksSinceSeasonStart:function(){return weeksSinceSeasonStart},getSelectedWeek:function(){return selectedWeek},goToNextWeek:function(){selectedWeek++,_updateLocation(selectedWeek)},goToPrevWeek:function(){selectedWeek--,_updateLocation(selectedWeek)},isPrevButtonActive:function(){return selectedWeek>1},isNextButtonActive:function(){return selectedWeek<34},render:function(){var e=document.querySelector("nav"),t=e.querySelector(".prev"),o=e.querySelector(".next");if(this.isPrevButtonActive()?t.removeAttribute("disabled"):t.setAttribute("disabled",!0),this.isNextButtonActive()?o.removeAttribute("disabled"):o.setAttribute("disabled",!0),e.querySelector(".current-week").textContent=this.getSelectedWeek(),!rendered){var i=this,r=function(e){!App.loading&&i.isNextButtonActive&&(i.goToNextWeek(),i.render(),App.loadResults())},a=function(e){!App.loading&&i.isPrevButtonActive&&(i.goToPrevWeek(),i.render(),App.loadResults())};App.Features.touch&&n("js/app.js").then(function(){document.addEventListener("swipeleft",r),document.addEventListener("swiperight",a)}),o.addEventListener("click",r),t.addEventListener("click",a),rendered=!0}}}}()}}();App.init();