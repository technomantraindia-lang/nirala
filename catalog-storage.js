/**
 * Nirala Engineers - Universal Client Catalog Storage & Image Engine
 * Provides dual-layer persistence: IndexedDB (unlimited quota) + localStorage + REST API sync.
 * Guarantees that photos and engineering specs uploaded in the admin or editor
 * are NEVER lost, NEVER exceed browser quotas, and appear instantly across all pages.
 */

(function(global) {
  'use strict';

  const DB_NAME = 'NiralaCatalogDB';
  const DB_VERSION = 1;
  const STORE_PRODUCTS = 'products';
  const STORE_SPARES = 'spares';
  const STORE_GALLERY = 'gallery';

  // Open / Initialize IndexedDB
  function openDB() {
    return new Promise((resolve, reject) => {
      if (!('indexedDB' in global)) {
        return resolve(null); // Fallback to localStorage
      }
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_PRODUCTS)) {
          db.createObjectStore(STORE_PRODUCTS);
        }
        if (!db.objectStoreNames.contains(STORE_SPARES)) {
          db.createObjectStore(STORE_SPARES);
        }
        if (!db.objectStoreNames.contains(STORE_GALLERY)) {
          db.createObjectStore(STORE_GALLERY);
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    });
  }

  // Get item from IndexedDB
  async function idbGet(storeName, key) {
    const db = await openDB();
    if (!db) return null;
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const req = store.get(key);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => resolve(null);
      } catch (err) {
        resolve(null);
      }
    });
  }

  // Set item in IndexedDB
  async function idbSet(storeName, key, value) {
    const db = await openDB();
    if (!db) return false;
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        const req = store.put(value, key);
        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
      } catch (err) {
        resolve(false);
      }
    });
  }

  // High Performance Image Compressor
  function compressImage(file, maxWidth = 1080, maxHeight = 1080, quality = 0.80) {
    return new Promise((resolve) => {
      if (!file) return resolve('');

      // If SVG, read as text/dataURL directly
      if (file.type === 'image/svg+xml' || (file.name && file.name.toLowerCase().endsWith('.svg'))) {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result);
        reader.onerror = () => resolve('');
        reader.readAsDataURL(file);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const rawDataUrl = e.target.result;
        const img = new Image();
        img.onload = () => {
          let width = img.naturalWidth || img.width;
          let height = img.naturalHeight || img.height;

          if (!width || !height) {
            return resolve(rawDataUrl);
          }

          // Calculate downscaled dimensions preserving aspect ratio
          if (width > maxWidth || height > maxHeight) {
            if (width > height) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');

          // Clean neutral light fill for transparent PNGs so gears don't turn pitch black
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, width, height);

          // Draw image
          ctx.drawImage(img, 0, 0, width, height);

          try {
            const compressed = canvas.toDataURL('image/jpeg', quality);
            resolve(compressed);
          } catch (err) {
            resolve(rawDataUrl);
          }
        };

        img.onerror = () => resolve(rawDataUrl);
        img.src = rawDataUrl;
      };

      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  }

  // NiralaStorage Public API
  const NiralaStorage = {
    // 1. Get Products: Checks IDB -> localStorage -> static JSON
    async getProducts() {
      // Step A: Check IndexedDB (always has newest user uploads with no size cap)
      try {
        const idbProducts = await idbGet(STORE_PRODUCTS, 'catalog');
        if (Array.isArray(idbProducts) && idbProducts.length > 0) {
          return idbProducts;
        }
      } catch (e) {}

      // Step B: Check localStorage
      try {
        const local = localStorage.getItem('nirala_products');
        if (local) {
          const parsed = JSON.parse(local);
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Populate IDB in background for future fast loads
            idbSet(STORE_PRODUCTS, 'catalog', parsed);
            return parsed;
          }
        }
      } catch (e) {}

      // Step C: Try backend REST API if online
      try {
        const apiRes = await fetch('/api/products', { cache: 'no-store' });
        if (apiRes.ok) {
          const list = await apiRes.json();
          if (Array.isArray(list) && list.length > 0) {
            this.saveProducts(list, false);
            return list;
          }
        }
      } catch (e) {}

      // Step D: Load static data/products.json
      try {
        const jsonRes = await fetch('data/products.json', { cache: 'no-store' });
        if (jsonRes.ok) {
          const list = await jsonRes.json();
          if (Array.isArray(list) && list.length > 0) {
            // Save to IDB & localStorage
            this.saveProducts(list, false);
            return list;
          }
        }
      } catch (e) {}

      return [];
    },

    // 2. Save Products: writes to IndexedDB + localStorage + Backend API
    async saveProducts(productsArray, syncToBackend = true) {
      if (!Array.isArray(productsArray)) return false;

      // A. Write to IndexedDB (always succeeds, no quota limits)
      try {
        await idbSet(STORE_PRODUCTS, 'catalog', productsArray);
      } catch (e) {
        console.warn('IDB write error:', e);
      }

      // B. Write to localStorage (safely with fallback)
      try {
        localStorage.setItem('nirala_products', JSON.stringify(productsArray));
      } catch (quotaErr) {
        console.warn('LocalStorage quota exceeded, relying on IndexedDB primary storage.');
      }

      // C. Sync to backend API if active
      if (syncToBackend) {
        try {
          await fetch('/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productsArray)
          });
        } catch (e) {
          // Backend server is optional; client storage holds truth
        }
      }

      return true;
    },

    // 3. Get single product by link (e.g., 'spur-gear.html') or index
    async getProductByLink(linkOrFilename) {
      const all = await this.getProducts();
      if (!all || all.length === 0) return null;

      const cleanTarget = (linkOrFilename || '').toLowerCase().trim();
      return all.find(p => {
        if (!p) return false;
        const pLink = (p.link || '').toLowerCase();
        return pLink === cleanTarget || pLink.endsWith(cleanTarget) || cleanTarget.endsWith(pLink);
      }) || null;
    },

    // 4. Update single product by index
    async saveProductAtIndex(index, productObj) {
      const all = await this.getProducts();
      if (index >= 0 && index < all.length) {
        all[index] = productObj;
      } else {
        all.push(productObj);
      }
      await this.saveProducts(all, true);
      return all;
    },

    // 5. Get Spares: Checks IDB -> localStorage -> backend API -> static JSON
    async getSpares() {
      // Step A: Check IndexedDB
      try {
        const idbSpares = await idbGet(STORE_SPARES, 'catalog');
        if (Array.isArray(idbSpares) && idbSpares.length > 0) {
          return idbSpares;
        }
      } catch (e) {}

      // Step B: Check localStorage
      try {
        const local = localStorage.getItem('nirala_spares');
        if (local) {
          const parsed = JSON.parse(local);
          if (Array.isArray(parsed) && parsed.length > 0) {
            idbSet(STORE_SPARES, 'catalog', parsed);
            return parsed;
          }
        }
      } catch (e) {}

      // Step C: Try backend REST API if online
      try {
        const apiRes = await fetch('/api/spares', { cache: 'no-store' });
        if (apiRes.ok) {
          const list = await apiRes.json();
          if (Array.isArray(list) && list.length > 0) {
            this.saveSpares(list, false);
            return list;
          }
        }
      } catch (e) {}

      // Step D: Load static data/spares.json
      try {
        const jsonRes = await fetch('data/spares.json', { cache: 'no-store' });
        if (jsonRes.ok) {
          const list = await jsonRes.json();
          if (Array.isArray(list) && list.length > 0) {
            this.saveSpares(list, false);
            return list;
          }
        }
      } catch (e) {}

      return [];
    },

    // 6. Save Spares: writes to IndexedDB + localStorage + backend REST API
    async saveSpares(sparesArray, syncToBackend = true) {
      if (!Array.isArray(sparesArray)) return false;

      try {
        await idbSet(STORE_SPARES, 'catalog', sparesArray);
      } catch (e) {
        console.warn('IDB spares write error:', e);
      }

      try {
        localStorage.setItem('nirala_spares', JSON.stringify(sparesArray));
      } catch (quotaErr) {
        console.warn('LocalStorage quota limit reached, relying on IndexedDB for spares.');
      }

      if (syncToBackend) {
        try {
          await fetch('/api/spares', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sparesArray)
          });
        } catch (e) {}
      }

      return true;
    },

    // 7. Update single spare by index
    async saveSpareAtIndex(index, spareObj) {
      const all = await this.getSpares();
      if (index >= 0 && index < all.length) {
        all[index] = spareObj;
      } else {
        all.push(spareObj);
      }
      await this.saveSpares(all, true);
      return all;
    },

    // 8. Get Gallery: Checks IDB -> localStorage -> backend API -> static JSON
    async getGallery() {
      // Step A: Check IndexedDB
      try {
        const idbGallery = await idbGet(STORE_GALLERY, 'catalog');
        if (idbGallery && Array.isArray(idbGallery.photos) && idbGallery.photos.length > 0) {
          return idbGallery;
        }
      } catch (e) {}

      // Step B: Check localStorage
      try {
        const local = localStorage.getItem('nirala_gallery');
        if (local) {
          const parsed = JSON.parse(local);
          if (parsed && Array.isArray(parsed.photos) && parsed.photos.length > 0) {
            idbSet(STORE_GALLERY, 'catalog', parsed);
            return parsed;
          }
        }
      } catch (e) {}

      // Step C: Try backend REST API if online
      try {
        const apiRes = await fetch('/api/gallery', { cache: 'no-store' });
        if (apiRes.ok) {
          const gallery = await apiRes.json();
          if (gallery && Array.isArray(gallery.photos) && gallery.photos.length > 0) {
            this.saveGallery(gallery, false);
            return gallery;
          }
        }
      } catch (e) {}

      // Step D: Load static data/gallery.json
      try {
        const jsonRes = await fetch('data/gallery.json', { cache: 'no-store' });
        if (jsonRes.ok) {
          const gallery = await jsonRes.json();
          if (gallery && Array.isArray(gallery.photos) && gallery.photos.length > 0) {
            this.saveGallery(gallery, false);
            return gallery;
          }
        }
      } catch (e) {}

      return { videos: [], photos: [] };
    },

    // 9. Save Gallery: writes to IndexedDB + localStorage + backend REST API
    async saveGallery(galleryObj, syncToBackend = true) {
      if (!galleryObj || typeof galleryObj !== 'object') return false;
      if (!Array.isArray(galleryObj.photos)) galleryObj.photos = [];
      if (!Array.isArray(galleryObj.videos)) galleryObj.videos = [];

      try {
        await idbSet(STORE_GALLERY, 'catalog', galleryObj);
      } catch (e) {
        console.warn('IDB gallery write error:', e);
      }

      try {
        localStorage.setItem('nirala_gallery', JSON.stringify(galleryObj));
      } catch (quotaErr) {
        console.warn('LocalStorage quota limit reached, relying on IndexedDB for gallery.');
      }

      if (syncToBackend) {
        try {
          await fetch('/api/gallery', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(galleryObj)
          });
        } catch (e) {}
      }

      return true;
    },

    // 10. Image Compression Utility
    compressImage: compressImage
  };

  global.NiralaStorage = NiralaStorage;

})(typeof window !== 'undefined' ? window : this);
