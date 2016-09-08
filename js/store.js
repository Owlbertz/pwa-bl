App.Store = (() => {
  const DATA_CACHE_NAME = 'bl-data';
  let dbOpen,
      db;

  return {
    open: function() {
      return new Promise((resolve, reject) => {
        if (db) {
          resolve();
        }

        dbOpen = indexedDB.open(DATA_CACHE_NAME, 1);

        dbOpen.onupgradeneeded = (e) => {
          let thisDB = e.target.result;
         
          if (!thisDB.objectStoreNames.contains('data')) {
            thisDB.createObjectStore('data', {keyPath: 'week'});
          }
        };

        dbOpen.onsuccess = (e) => {
          db = e.target.result;
          resolve();
        };

        dbOpen.onerror = (err) => {
          console.error('Error opening DB:', err);
          reject(err);
        };
      });
    },
    add: function(week, data) {
      return new Promise((resolve, reject) => {
        let transaction = db.transaction(['data'], 'readwrite'),
            store = transaction.objectStore('data');
            request = store.put({
              week: week,
              data: data,
              added: new Date()
            });
   
        request.onerror = (err) => {
          reject(err);
        };
     
        request.onsuccess = (e) => {
          resolve();
        };
      });
    },
    get: function(week) {
      return new Promise((resolve, reject) => {
        let transaction = db.transaction(['data'], 'readonly'),
            store = transaction.objectStore('data'),
            request = store.get(week);
        
        request.onerror = (err) => {
          reject(err);
        };

        request.onsuccess = (e) => {
          let data = e.target.result;

          if (data) {
            data = data.data;
          }
          console.log('Loaded data:', data);
          resolve(data);
        };
      });
    },
    getAll: function() {
      return new Promise((resolve, reject) => {
        let transaction = db.transaction(['data'], 'readonly'),
            store = transaction.objectStore('data'),
            request = store.getAll();
        
        request.onerror = (err) => {
          reject(err);
        };

        request.onsuccess = (e) => {
          let data = e.target.result;

          if (data) {
            let result = [];
            data.forEach(function(d) {
              result = result.concat(d.data);
            });
            data = result;
          }

          console.log('Loaded data:', data);
          resolve(data);
        };
      });
    }
  };
})();