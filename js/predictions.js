App.Predictions=function(){var e="bl-predictions",t=function(){var t=localStorage.getItem(e);if(!t)return{};try{var i=JSON.parse(t);for(var n in i){var o=i[n];o.date=new Date(o.date)}return r=i,i}catch(e){return console.error("Failed to parse JSON:",e),{}}},r=t(),i=localStorage;return{isActive:function(){return!!i},getPredictions:function(){return r},getPrediction:function(e){return r[e]?r[e]:null},setPrediction:function(t,i){r[t]=i;try{var n=JSON.stringify(r);return localStorage.setItem(e,n),!0}catch(e){return console.error("Failed to stringify JSON:",e),!1}},render:function(){var e=this,t=document.querySelectorAll(".result");t.forEach(function(t){var r=t.getAttribute("data-match-id"),i=(t.classList.contains("ongoing"),t.classList.contains("finished")),n=e.getPrediction(r);n?(t.querySelector(".prediction-team1").value=n.Team1,t.querySelector(".prediction-team2").value=n.Team2,t.querySelector(".prediciton-time").textContent=App.Util.dateParser(n.date),t.querySelector(".prediction-time-container").classList.remove("hide")):t.querySelector(".prediction-time-container").classList.add("hide"),i&&(t.querySelector(".prediction-team1").setAttribute("disabled",!0),t.querySelector(".prediction-team2").setAttribute("disabled",!0),t.querySelector(".save-prediction-button").setAttribute("disabled",!0)),t.querySelector("form").addEventListener("submit",function(i){i.preventDefault();var n={Team1:t.querySelector(".prediction-team1").value,Team2:t.querySelector(".prediction-team2").value,date:new Date};if(n.Team1||n.Team2){var o=e.setPrediction(r,n);o?e.render():alert("An error occured.")}})})}}}();