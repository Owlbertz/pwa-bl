App.Util=function(){return{resultParser:function(r){try{return JSON.parse(r)}catch(t){return void 0,null}},dateParser:function(r){var t=function(r){return r<10?"0"+r:r},e=r.getFullYear()+"/"+t(r.getMonth()+1)+"/"+t(r.getDate())+" "+t(r.getHours())+":"+t(r.getMinutes());return e}}}();