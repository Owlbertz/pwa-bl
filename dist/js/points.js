var _this=this;App.Points=(()=>{let a={total:0,correct:0,difference:0,winner:0,pointsPerPrediction:0},b=function(c,d){let e=2===c.MatchResults[0].ResultOrderID?c.MatchResults[0]:c.MatchResults[1];return e.PointsTeam1===d.Team1&&e.PointsTeam2===d.Team2?(a.total+=4,a.correct+=1):Math.abs(d.Team1-d.Team2)===Math.abs(e.PointsTeam1-e.PointsTeam2)?(a.total+=3,a.difference+=1):(e.PointsTeam1>e.PointsTeam2&&d.Team1>d.Team2||e.PointsTeam1<e.PointsTeam2&&d.Team1<d.Team2)&&(a.total+=2,a.winner+=1),a};return{init:()=>{_this.calculateAllPoints()},calculateAllPoints:(c,d)=>{return a={total:0,correct:0,difference:0,winner:0,pointsPerPrediction:0},c.filter(function(e){return e.MatchIsFinished}).forEach(function(e){let f=e.MatchID;d[f]&&b(e,d[f])}),d&&0<Object.keys(d).length&&(a.pointsPerPrediction=Math.round(100*(a.total/Object.keys(d).length))/100),a},calculatePoints:(c,d)=>{let e=c.MatchID;return c.MatchIsFinished&&d[e]?b(c,d[e]).points:null},getStats:()=>{return a},renderAllPoints:function(c,d,e){this.calculateAllPoints(d,e),c.q('.prediction-points-total').textContent=a.total,c.q('.prediction-points-correct').textContent=a.correct,c.q('.prediction-points-difference').textContent=a.difference,c.q('.prediction-points-winner').textContent=a.winner,c.q('.prediction-points-prediction-count').textContent=Object.keys(e).length,c.q('.prediction-points-points-per-prediction').textContent=a.pointsPerPrediction}}})();