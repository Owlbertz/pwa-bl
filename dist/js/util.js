App.Util=(()=>{return{resultParser:a=>{try{return JSON.parse(a)}catch(b){return void 0,null}},dateParser:a=>{var b=e=>{return 10>e?`0${e}`:e},c=`${a.getFullYear()}/${b(a.getMonth()+1)}/${b(a.getDate())} ${b(a.getHours())}:${b(a.getMinutes())}`;return c}}})();