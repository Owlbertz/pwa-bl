App.Store = (() => {
  const DATA_CACHE_NAME = 'bl-data',
        INDEX_NAMES = {
          data: 'week',
          predictions: 'matchId'
        };
  let dbOpen,
      db = {};

  return {
    open: function(tableName) {
      return new Promise((resolve, reject) => {
        if (db[tableName]) {
          resolve();
        }

        dbOpen = indexedDB.open(DATA_CACHE_NAME, 9);

        dbOpen.onupgradeneeded = (e) => {
          let thisDB = e.target.result;
         
         for (let key in INDEX_NAMES) {
          if (!thisDB.objectStoreNames.contains(key)) {
            thisDB.createObjectStore(key, {keyPath: INDEX_NAMES[key]});
          }
         }
        };

        dbOpen.onsuccess = (e) => {
          db[tableName] = e.target.result;
          resolve(db[tableName]);
        };

        dbOpen.onerror = (err) => {
          console.error('Error opening DB:', err);
          reject(err);
        };
      });
    },
    add: function(tableName, index, data) {
      return new Promise((resolve, reject) => {
        let transaction = db[tableName].transaction([tableName], 'readwrite'),
            store = transaction.objectStore(tableName),
            entry = {
              data: data,
              added: new Date()
            };
            entry[INDEX_NAMES[tableName]] = index;
            request = store.put(entry);
   
        request.onerror = (err) => {
          reject(err);
        };
     
        request.onsuccess = (e) => {
          resolve();
        };
      });
    },
    get: function(tableName, index) {
      return new Promise((resolve, reject) => {
        let transaction = db[tableName].transaction([tableName], 'readonly'),
            store = transaction.objectStore(tableName),
            request = index ? store.get(index) : store.getAll(); // If no index is set, return all
        
        request.onerror = (err) => {
          reject(err);
        };

        request.onsuccess = (e) => {
          let data = e.target.result;

          if (data) {
            if (index) {
              data = data.data;
            }
          }
          //console.log('Loaded data (' + (index ? 'Index = ' + index : 'All') + '):', data);
          resolve(data);
        };
      });
    },
    getAll: function(tableName) {
      return this.get(tableName, null).then((data) => {
        let result = null; 
        if (data) {
          result = [];
          data.forEach(function(d) {
            result = result.concat(d.data);
          });
          data = result;
        }
        return result;
      });
    },
    getAllPerIndex: function(tableName) {
      return this.get(tableName, null);
    }
  };
})();
