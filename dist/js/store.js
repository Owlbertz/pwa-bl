App.Store=function(){var n="bl-data",e={data:"week",predictions:"matchId"},t=void 0,r={};return{open:function(o){return new Promise(function(u,c){r[o]&&u(),t=indexedDB.open(n,9),t.onupgradeneeded=function(n){var t=n.target.result;for(var r in e)t.objectStoreNames.contains(r)||t.createObjectStore(r,{keyPath:e[r]})},t.onsuccess=function(n){r[o]=n.target.result,u(r[o])},t.onerror=function(n){void 0,c(n)}})},add:function(n,t,o){return new Promise(function(u,c){var a=r[n].transaction([n],"readwrite"),i=a.objectStore(n),s={data:o,added:new Date};s[e[n]]=t,request=i.put(s),request.onerror=function(n){c(n)},request.onsuccess=function(n){u()}})},get:function(n,e){return new Promise(function(t,o){var u=r[n].transaction([n],"readonly"),c=u.objectStore(n),a=e?c.get(e):c.getAll();a.onerror=function(n){o(n)},a.onsuccess=function(n){var r=n.target.result;r&&e&&(r=r.data),t(r)}})},getAll:function(n){return this.get(n,null).then(function(n){var e=null;return n&&(e=[],n.forEach(function(n){e=e.concat(n.data)}),n=e),e})},getAllPerIndex:function(n){return this.get(n,null)}}}();