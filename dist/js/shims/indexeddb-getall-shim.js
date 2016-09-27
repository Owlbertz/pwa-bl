!function(t){"use strict";var e,o,n,l,i,r,s;if(n=t.IDBObjectStore||t.webkitIDBObjectStore||t.mozIDBObjectStore||t.msIDBObjectStore,o=t.IDBIndex||t.webkitIDBIndex||t.mozIDBIndex||t.msIDBIndex,"undefined"!=typeof n&&"undefined"!=typeof o&&(void 0===n.prototype.getAll||void 0===o.prototype.getAll||void 0===n.prototype.getAllKeys||void 0===o.prototype.getAllKeys)){if(void 0!==n.prototype.mozGetAll&&void 0!==o.prototype.mozGetAll)return n.prototype.getAll=n.prototype.mozGetAll,void(o.prototype.getAll=o.prototype.mozGetAll);l=function(){this.result=null,this.error=null,this.source=null,this.transaction=null,this.readyState="pending",this.onsuccess=null,this.onerror=null,this.toString=function(){return"[object IDBRequest]"}},e=function(t){this.type=t,this.target=null,this.currentTarget=null,this.NONE=0,this.CAPTURING_PHASE=1,this.AT_TARGET=2,this.BUBBLING_PHASE=3,this.eventPhase=this.NONE,this.stopPropagation=function(){void 0},this.stopImmediatePropagation=function(){void 0},this.bubbles=!1,this.cancelable=!1,this.preventDefault=function(){void 0},this.defaultPrevented=!1,this.isTrusted=!1,this.timestamp=Date.now()},r=function(t){return function(o,n){var i,r;o=void 0!==o?o:null,i=new l,r=[];var s=this.openCursor(o);return s.onsuccess=function(o){var l,s;return l=o.target.result,l&&(r.push(l[t]),void 0===n||r.length<n)?void l.continue():void("function"==typeof i.onsuccess&&(s=new e("success"),s.target={readyState:"done",result:r},i.result=r,i.onsuccess(s)))},s.onerror=function(t){void 0,i.onerror(t)},i}},i=r("value"),s=r("key"),void 0===n.prototype.getAll&&(n.prototype.getAll=i),void 0===o.prototype.getAll&&(o.prototype.getAll=i),void 0===n.prototype.getAllKeys&&(n.prototype.getAllKeys=s),void 0===o.prototype.getAllKeys&&(o.prototype.getAllKeys=s)}}("undefined"==typeof window?global:window);