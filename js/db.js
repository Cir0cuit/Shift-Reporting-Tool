const DB = {
  db: null,
  dbName: 'ShiftReportsDB',
  version: 3, // Increment version for schema update

  init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = (event) => {
        console.error('Database error:', event.target.error);
        reject(event.target.error);
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('reports')) {
          const reportStore = db.createObjectStore('reports', { keyPath: 'id' });
          reportStore.createIndex('date_shift', ['date', 'shift'], { unique: false });
        } else {
          // If store exists, make sure index exists (for version upgrade)
          const tx = event.target.transaction;
          const reportStore = tx.objectStore('reports');
          if (!reportStore.indexNames.contains('date_shift')) {
            reportStore.createIndex('date_shift', ['date', 'shift'], { unique: false });
          }
        }

        if (!db.objectStoreNames.contains('products')) {
          db.createObjectStore('products', { keyPath: 'id', autoIncrement: true });
        }
      };
    });
  },

  getReportByDateAndShift(date, shift) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error("Database not initialized"));
        return;
      }
      const tx = this.db.transaction('reports', 'readonly');
      const store = tx.objectStore('reports');
      const index = store.index('date_shift');
      const request = index.get([date, shift]);

      request.onsuccess = (event) => {
        resolve(event.target.result);
      };
      request.onerror = (e) => reject(e.target.error);
    });
  },

  getLatestReport() {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('reports', 'readonly');
      const store = tx.objectStore('reports');
      const request = store.getAll();

      request.onsuccess = (event) => {
        const reports = event.target.result;
        if (reports.length > 0) {
          resolve(reports[reports.length - 1]);
        } else {
          resolve(null);
        }
      };
      request.onerror = (e) => reject(e.target.error);
    });
  },

  createReport(date, shift) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('reports', 'readwrite');
      const store = tx.objectStore('reports');
      const report = {
        id: Date.now().toString(),
        reporter: '',
        shift: shift || 'morning',
        date: date || new Date().toISOString().substring(0, 10)
      };
      const request = store.add(report);
      request.onsuccess = () => resolve(report);
      request.onerror = (e) => reject(e.target.error);
    });
  },

  updateReport(report) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('reports', 'readwrite');
      const store = tx.objectStore('reports');
      const request = store.put(report);
      request.onsuccess = () => resolve(report);
      request.onerror = (e) => reject(e.target.error);
    });
  },

  getProducts(reportId) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('products', 'readonly');
      const store = tx.objectStore('products');
      const request = store.getAll();

      request.onsuccess = (event) => {
        const allProducts = event.target.result;
        const reportProducts = allProducts.filter(p => p.reportId === reportId);
        resolve(reportProducts);
      };
      request.onerror = (e) => reject(e.target.error);
    });
  },

  addProduct(product) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('products', 'readwrite');
      const store = tx.objectStore('products');
      const request = store.add(product);
      request.onsuccess = () => resolve(request.result);
      request.onerror = (e) => reject(e.target.error);
    });
  },

  removeProduct(id) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('products', 'readwrite');
      const store = tx.objectStore('products');
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = (e) => reject(e.target.error);
    });
  },

  deleteReportAndProducts(reportId) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(['products', 'reports'], 'readwrite');
      const productStore = tx.objectStore('products');
      const reportStore = tx.objectStore('reports');

      const productRequest = productStore.getAll();
      productRequest.onsuccess = (event) => {
        const products = event.target.result;
        products.filter(p => p.reportId === reportId)
          .forEach(p => productStore.delete(p.id));
      };

      const reportDelete = reportStore.delete(reportId);

      tx.oncomplete = () => resolve();
      tx.onerror = (e) => reject(e.target.error);
    });
  }
};
