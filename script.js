document.addEventListener("DOMContentLoaded", function () {

   // --- Variabel & Setup Awal ---
   const posterForm = document.getElementById("posterForm");
   const posterPreview = document.getElementById("posterPreview");
   const placeholder = document.getElementById("placeholder");
   const loadingIndicator = document.getElementById("loadingIndicator");
   const downloadBtn = document.getElementById("downloadBtn");
   const refreshBtn = document.getElementById("refreshBtn");
   const shareImageBtn = document.getElementById("shareImageBtn"); // Tombol share gambar BARU
   const bgGalleryContainer = document.getElementById("bgGalleryContainer");
   const bgGallery = document.getElementById("bgGallery");
   // DIHAPUS: const shareOptions = document.getElementById("shareOptions");
   // DIHAPUS: const whatsappShareBtn = document.getElementById("whatsappShareBtn");
   const undoBtn = document.getElementById("undoBtn");
   const redoBtn = document.getElementById("redoBtn");
   const mobileMenuBtn = document.getElementById("mobileMenuBtn"); // Tombol hamburger
   const mainNav = document.getElementById("mainNav");             // Menu navigasi
   const menuIcon = document.getElementById("menuIcon");           // Ikon hamburger/close

   // Variabel state aplikasi (tetap sama)
   let history = [];
   let historyIndex = -1;
   const PEXELS_API_KEY = "563492ad6f91700001000001317cc024657d4284baa7f76d22a34179"; // <-- GANTI INI JIKA PERLU
   let currentBackgrounds = [];
   let currentBackgroundIndex = -1;
   let currentBackgroundUrl = null;
   let lastSearchQuery = "mosque";

   // Inisialisasi Awal
   updateHistoryButtons();
   setTodayDate();

   // --- Fungsi Helper (Bantuan) ---
   // ... (setTodayDate, showLoading, getPosterDataFromForm, getRamadanDay, formatDate, formatTime tetap sama) ...
   function setTodayDate() {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      document.getElementById('date').value = `${yyyy}-${mm}-${dd}`;
   }

   function showLoading(show = true) {
      loadingIndicator.classList.toggle('hidden', !show);
      if (show) {
         placeholder.classList.add('hidden');
      }
   }

   function getPosterDataFromForm() {
      const getValue = (id, defaultValue = '') => document.getElementById(id)?.value || defaultValue;
      const dateValue = getValue('date');
      const timeValue = getValue('time');

      return {
         title: getValue('title', 'Judul Kajian Anda'),
         dateRaw: dateValue,
         timeRaw: timeValue,
         dateFormatted: formatDate(dateValue),
         timeFormatted: formatTime(timeValue),
         location: getValue('location', 'Lokasi Acara'),
         organization: getValue('organization', 'Nama Penyelenggara'),
         contact: getValue('contact', 'Kontak Person'),
         category: getValue('category', 'mosque'),
         backgroundUrl: currentBackgroundUrl,
         backgroundIndex: currentBackgroundIndex,
         backgrounds: currentBackgrounds ? [...currentBackgrounds] : []
      };
   }

   function getRamadanDay() {
      return "Kajian Islam Ilmiah";
   }

   function formatDate(dateString) {
      if (!dateString) return "Tanggal Belum Diatur";
      try {
         const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
         const dateParts = dateString.split('-');
         if (dateParts.length !== 3) return dateString;
         const date = new Date(Date.UTC(Number(dateParts[0]), Number(dateParts[1]) - 1, Number(dateParts[2])));
         return date.toLocaleDateString("id-ID", { ...options, timeZone: 'Asia/Jakarta' });
      } catch (e) {
         console.error("Error formatting date:", dateString, e);
         return dateString;
      }
   }

   function formatTime(timeString) {
      if (!timeString) return "Waktu Belum Diatur";
      try {
         const [hours, minutes] = timeString.split(":");
         if (hours === undefined || minutes === undefined) return timeString;
         return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} WIB`;
      } catch (e) {
         console.error("Error formatting time:", timeString, e);
         return timeString;
      }
   }

   // --- Fungsi Render Pratinjau Poster ---
   /**
    * Fungsi: Merender pratinjau poster.
    * @param {object} state - Objek berisi data poster.
    * @param {boolean} fromHistory - Menandakan apakah render dari undo/redo.
    */
   function renderPoster(state, fromHistory = false) {
      // ... (Logika render poster tetap sama seperti sebelumnya) ...
      if (!fromHistory) {
         currentBackgroundUrl = state.backgroundUrl;
         currentBackgroundIndex = state.backgroundIndex;
         currentBackgrounds = state.backgrounds ? [...state.backgrounds] : [];
         lastSearchQuery = state.category;
      }

      placeholder.classList.toggle('hidden', !!state.backgroundUrl);

      const titleHTML = state.title || 'Judul Kajian';

      const createContactLine = (text) => {
         return `<div><span class="contact-value">${text}</span></div>`;
      }
      const createContactLineWithLabel = (label, value) => {
         return `<div><span class="contact-label">${label}:</span> <span class="contact-value">${value || ''}</span></div>`;
      }

      const dateAndTimeText = `${state.dateFormatted} | ${state.timeFormatted}`;
      const dateAndTimeHTML = createContactLine(dateAndTimeText);
      const locationHTML = createContactLine(state.location || 'Lokasi Acara');
      const organizationHTML = createContactLineWithLabel('Penyelenggara', state.organization || 'Penyelenggara');
      const contactHTML = createContactLineWithLabel('CP', state.contact || 'Kontak Person');

      const footerHTML = `Pesawaran Mengaji Official <i class="fab fa-instagram"></i> <i class="fab fa-whatsapp"></i> <i class="fab fa-youtube"></i>`;

      const fullTitleHTML = `<div class="poster-title">${titleHTML}</div>`;

      posterPreview.innerHTML = `
         <div id="loadingIndicator" class="loading hidden">...</div>
         <div class="poster-background" style="background-image: url('${state.backgroundUrl || ''}');"></div>
         <div class="poster-overlay"></div>
         <div class="poster-day-indicator">${getRamadanDay()}</div>
         ${fullTitleHTML}
         <div class="poster-contact">
             ${dateAndTimeHTML}
             ${locationHTML}
             ${organizationHTML}
             ${contactHTML}
         </div>
         <div class="poster-footer">${footerHTML}</div>
     `;

      updateBackgroundGallery(state.backgrounds, state.backgroundIndex);

      const hasContent = !!state.backgroundUrl;
      downloadBtn.disabled = !hasContent;
      refreshBtn.disabled = !(hasContent && state.backgrounds && state.backgrounds.length > 1);
      shareImageBtn.disabled = !hasContent; // Aktifkan/nonaktifkan tombol share gambar
      downloadBtn.classList.toggle('disabled', !hasContent);
      refreshBtn.classList.toggle('disabled', refreshBtn.disabled);
      shareImageBtn.classList.toggle('disabled', !hasContent); // Tambahkan toggle class

      bgGalleryContainer.classList.toggle("hidden", !hasContent);
      // DIHAPUS: shareOptions.classList.toggle("hidden", !hasContent);

      if (!fromHistory) {
         addToHistory(getPosterDataFromForm());
      }
   }

   // --- Fungsi Fetch Pexels & Update Gallery ---
   // ... (fetchPexelsImages, updateBackgroundGallery, handleBackgroundSelection tetap sama) ...
   async function fetchPexelsImages(query) {
      if (!PEXELS_API_KEY || PEXELS_API_KEY === "GANTI_DENGAN_API_KEY_PEXELS_ANDA" || PEXELS_API_KEY.length < 40) {
         console.warn("Pexels API Key invalid or not set.");
         alert("PERHATIAN: Harap masukkan API Key Pexels Anda yang valid di dalam kode JavaScript (variabel PEXELS_API_KEY).");
         return [];
      }
      const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=15&orientation=portrait`;
      try {
         const response = await fetch(url, { headers: { Authorization: PEXELS_API_KEY } });
         if (!response.ok) {
            const errorData = await response.text();
            let errorMsg = `Pexels API error: ${response.status} ${response.statusText}.`;
            if (response.status === 401) errorMsg += " Cek API Key.";
            else if (response.status === 429) errorMsg += " Kuota API habis.";
            else errorMsg += " Cek console.";
            throw new Error(errorMsg);
         }
         const data = await response.json();
         return data.photos || [];
      } catch (error) {
         console.error("Error fetching Pexels images:", error);
         alert(`Gagal mengambil gambar dari Pexels: ${error.message}`);
         return [];
      }
   }

   function updateBackgroundGallery(backgrounds = [], activeIndex = -1) {
      bgGallery.innerHTML = '';
      const hasBackgrounds = backgrounds && backgrounds.length > 0;
      bgGalleryContainer.classList.toggle('hidden', !hasBackgrounds);
      if (!hasBackgrounds) return;

      backgrounds.forEach((photo, index) => {
         const thumbnailUrl = photo?.src?.tiny || photo?.src?.small || photo?.src?.portrait;
         if (!thumbnailUrl) return;
         const thumbnail = document.createElement('div');
         thumbnail.className = `bg-thumbnail ${index === activeIndex ? 'active' : ''}`;
         thumbnail.style.backgroundImage = `url(${thumbnailUrl})`;
         thumbnail.dataset.index = index;
         thumbnail.title = `Gunakan background ${index + 1}`;
         thumbnail.addEventListener('click', () => handleBackgroundSelection(index));
         bgGallery.appendChild(thumbnail);
      });

      const activeThumb = bgGallery.querySelector('.bg-thumbnail.active');
      if (activeThumb) {
         activeThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
   }

   function handleBackgroundSelection(index) {
      if (!currentBackgrounds || index < 0 || index >= currentBackgrounds.length) return;
      currentBackgroundIndex = index;
      currentBackgroundUrl = currentBackgrounds[index]?.src?.large2x || currentBackgrounds[index]?.src?.large || currentBackgrounds[index]?.src?.portrait;
      if (!currentBackgroundUrl) {
         alert("Gagal memuat URL background."); return;
      }
      const currentState = getPosterDataFromForm();
      currentState.backgroundUrl = currentBackgroundUrl;
      currentState.backgroundIndex = currentBackgroundIndex;
      currentState.backgrounds = [...currentBackgrounds];
      renderPoster(currentState, false);
      document.querySelectorAll('.bg-thumbnail').forEach(thumb => thumb.classList.remove('active'));
      const clickedThumb = bgGallery.querySelector(`.bg-thumbnail[data-index="${index}"]`);
      if (clickedThumb) clickedThumb.classList.add('active');
   }

   // --- Fungsi History (Undo/Redo) ---
   // ... (addToHistory, restoreState, undo, redo, updateHistoryButtons tetap sama) ...
   function addToHistory(state) {
      const stateCopy = JSON.parse(JSON.stringify(state));
      if (historyIndex < history.length - 1) {
         history = history.slice(0, historyIndex + 1);
      }
      const lastState = history[history.length - 1];
      if (lastState &&
         lastState.title === stateCopy.title &&
         lastState.backgroundUrl === stateCopy.backgroundUrl &&
         lastState.dateRaw === stateCopy.dateRaw &&
         lastState.timeRaw === stateCopy.timeRaw &&
         lastState.location === stateCopy.location &&
         lastState.organization === stateCopy.organization &&
         lastState.contact === stateCopy.contact) {
         return;
      }
      history.push(stateCopy);
      historyIndex++;
      updateHistoryButtons();
   }

   function restoreState(index) {
      if (index < 0 || index >= history.length) return;
      const stateToRestore = history[index];
      historyIndex = index;

      document.getElementById("title").value = stateToRestore.title;
      document.getElementById("date").value = stateToRestore.dateRaw;
      document.getElementById("time").value = stateToRestore.timeRaw;
      document.getElementById("location").value = stateToRestore.location;
      document.getElementById("organization").value = stateToRestore.organization;
      document.getElementById("contact").value = stateToRestore.contact;
      document.getElementById("category").value = stateToRestore.category;

      currentBackgroundUrl = stateToRestore.backgroundUrl;
      currentBackgroundIndex = stateToRestore.backgroundIndex;
      currentBackgrounds = stateToRestore.backgrounds ? [...stateToRestore.backgrounds] : [];
      lastSearchQuery = stateToRestore.category;

      renderPoster(stateToRestore, true);
      updateHistoryButtons();
   }

   function undo() { if (historyIndex > 0) restoreState(historyIndex - 1); }
   function redo() { if (historyIndex < history.length - 1) restoreState(historyIndex + 1); }
   function updateHistoryButtons() {
      undoBtn.disabled = historyIndex <= 0;
      redoBtn.disabled = historyIndex >= history.length - 1;
   }


   // --- Event Listener Keyboard ---
   // ... (Tetap sama) ...
   document.addEventListener('keydown', (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
      const isModifier = e.ctrlKey || e.metaKey;
      if (isModifier && e.key.toLowerCase() === 'z') { e.preventDefault(); if (!undoBtn.disabled) undo(); }
      else if (isModifier && e.key.toLowerCase() === 'y') { e.preventDefault(); if (!redoBtn.disabled) redo(); }
   });

   // --- Event Listener Lain ---
   // ... (posterForm 'submit', refreshBtn 'click', posterForm 'input', undoBtn, redoBtn tetap sama) ...
   posterForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      showLoading(true);
      const submitButton = posterForm.querySelector('button[type="submit"]');
      submitButton.disabled = true;
      submitButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Generating...';

      const category = document.getElementById("category").value;
      let fetchedBackgrounds = [];
      let needsFetch = category !== lastSearchQuery || !currentBackgrounds || currentBackgrounds.length === 0;

      if (needsFetch) {
         fetchedBackgrounds = await fetchPexelsImages(category);
         if (fetchedBackgrounds.length > 0) {
            currentBackgrounds = fetchedBackgrounds; currentBackgroundIndex = 0; lastSearchQuery = category;
         } else {
            if (!currentBackgrounds || currentBackgrounds.length === 0) {
               alert(`Tidak dapat menemukan gambar: "${category}". Coba kategori lain.`);
               showLoading(false); submitButton.disabled = false; submitButton.innerHTML = '<i class="fas fa-magic mr-2"></i>Generate Poster'; return;
            }
            needsFetch = false; currentBackgroundIndex = 0;
         }
      } else {
         if (currentBackgroundIndex !== 0) currentBackgroundIndex = 0;
      }

      const currentState = getPosterDataFromForm();
      if (currentBackgrounds.length > 0 && currentBackgroundIndex >= 0 && currentBackgroundIndex < currentBackgrounds.length) {
         currentState.backgroundUrl = currentBackgrounds[currentBackgroundIndex]?.src?.large2x || currentBackgrounds[currentBackgroundIndex]?.src?.large || currentBackgrounds[currentBackgroundIndex]?.src?.portrait;
         currentState.backgroundIndex = currentBackgroundIndex;
         currentState.backgrounds = [...currentBackgrounds];
         if (currentState.backgroundUrl) renderPoster(currentState, false);
         else { currentState.backgroundUrl = null; renderPoster(currentState, false); }
      } else { currentState.backgroundUrl = null; renderPoster(currentState, false); }

      showLoading(false);
      submitButton.disabled = false;
      submitButton.innerHTML = '<i class="fas fa-magic mr-2"></i>Generate Poster';
   });

   refreshBtn.addEventListener("click", () => {
      if (refreshBtn.disabled) return;
      if (currentBackgrounds && currentBackgrounds.length > 1) {
         let newIndex = (currentBackgroundIndex + 1) % currentBackgrounds.length;
         handleBackgroundSelection(newIndex);
      } else {
         posterForm.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      }
   });

   posterForm.addEventListener('input', (e) => {
      if (currentBackgroundUrl && e.target.id !== 'category') {
         renderPoster(getPosterDataFromForm(), false);
      }
   });

   undoBtn.addEventListener("click", undo);
   redoBtn.addEventListener("click", redo);

   // --- BARU: Event Listener Hamburger Menu ---
   mobileMenuBtn.addEventListener("click", () => {
      const isHidden = mainNav.classList.contains('hidden');
      mainNav.classList.toggle('hidden');

      // Ganti ikon
      if (isHidden) {
         // Jika tadinya hidden, sekarang terbuka -> ikon close
         menuIcon.classList.remove('fa-bars');
         menuIcon.classList.add('fa-times');
      } else {
         // Jika tadinya terlihat, sekarang tertutup -> ikon bars
         menuIcon.classList.remove('fa-times');
         menuIcon.classList.add('fa-bars');
      }
   });

   // --- Fungsi untuk Membuat Elemen Poster Off-screen (Refactor dari download) ---
   function createPosterElementForCanvas(state) {
      // --- Konfigurasi Target Canvas (Sama seperti di fungsi download sebelumnya) ---
      const TARGET_WIDTH = 1080;
      const TARGET_HEIGHT = 1920;
      const FONT_SIZE_DAY_INDICATOR = '20px';
      const FONT_SIZE_TITLE = '85px';
      const FONT_SIZE_CONTACT = '34px';
      const FONT_SIZE_FOOTER = '16px';
      const CONTACT_TOP_POSITION = '57%';
      const TITLE_TOP_POSITION = '48%';

      // --- Buat Kontainer Off-screen ---
      const captureContainer = document.createElement('div');
      captureContainer.style.position = 'fixed'; captureContainer.style.left = '-9999px';
      captureContainer.style.top = '0px'; captureContainer.style.width = `${TARGET_WIDTH}px`;
      captureContainer.style.height = `${TARGET_HEIGHT}px`; captureContainer.style.overflow = 'hidden';
      captureContainer.style.margin = '0'; captureContainer.style.padding = '0';
      captureContainer.style.fontFamily = '"Poppins", sans-serif';
      captureContainer.style.boxSizing = 'border-box';
      captureContainer.style.background = '#ffffff'; // Beri background putih sementara

      // --- Tambahkan Elemen Poster ke Kontainer Off-screen (Sama seperti di download) ---
      // 1. Background
      const backgroundDiv = document.createElement('div');
      backgroundDiv.style.cssText = `position:absolute; top:0; left:0; width:100%; height:100%; background-image:url('${state.backgroundUrl}'); background-size:cover; background-position:center; z-index:1;`;
      captureContainer.appendChild(backgroundDiv);

      // 2. Overlay
      const overlayDiv = document.createElement('div');
      overlayDiv.style.cssText = `position:absolute; top:0; left:0; width:100%; height:100%; background:linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.7) 100%); z-index:2;`;
      captureContainer.appendChild(overlayDiv);

      // 3. Indikator Hari
      const dayIndicatorDiv = document.createElement('div');
      dayIndicatorDiv.textContent = getRamadanDay();
      dayIndicatorDiv.style.cssText = `position:absolute; top:5%; left:0; width:100%; text-align:center; color:white; font-size:${FONT_SIZE_DAY_INDICATOR}; font-weight:500; letter-spacing:1px; z-index:3; text-shadow:1px 1px 3px rgba(0,0,0,0.5);`;
      captureContainer.appendChild(dayIndicatorDiv);

      // 4. Judul
      const titleDiv = document.createElement('div');
      titleDiv.style.position = 'absolute'; titleDiv.style.top = TITLE_TOP_POSITION;
      titleDiv.style.left = '50%'; titleDiv.style.transform = 'translate(-50%, -50%)';
      titleDiv.style.width = `${TARGET_WIDTH * 0.90}px`; titleDiv.style.color = 'white';
      titleDiv.style.fontSize = FONT_SIZE_TITLE;
      titleDiv.style.lineHeight = '1.15'; titleDiv.style.fontWeight = '800';
      titleDiv.style.textTransform = 'uppercase'; titleDiv.style.textAlign = 'center';
      titleDiv.style.zIndex = '3'; titleDiv.style.textShadow = '1px 1px 4px rgba(0,0,0,0.7)';
      titleDiv.style.overflowWrap = 'break-word'; titleDiv.style.wordWrap = 'break-word';
      titleDiv.style.wordBreak = 'break-word'; titleDiv.style.marginBottom = '20px';
      titleDiv.textContent = state.title || 'Judul Kajian';
      captureContainer.appendChild(titleDiv);

      // 5. Detail Kontak
      const contactDiv = document.createElement('div');
      contactDiv.style.position = 'absolute'; contactDiv.style.top = CONTACT_TOP_POSITION;
      contactDiv.style.left = '50%'; contactDiv.style.transform = 'translateX(-50%)';
      contactDiv.style.width = `${TARGET_WIDTH * 0.88}px`; contactDiv.style.color = 'white';
      contactDiv.style.fontSize = FONT_SIZE_CONTACT;
      contactDiv.style.zIndex = '3'; contactDiv.style.textShadow = '1px 1px 3px rgba(0, 0, 0, 0.6)';
      contactDiv.style.textAlign = 'center';
      contactDiv.style.fontFamily = '"Poppins", sans-serif';

      const contactBaseStyle = `margin-bottom: 8px; line-height: 1.4; text-align: center; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word;`;
      const labelStyle = `font-weight: 600; display: inline; margin-right: 6px;`;
      const valueStyle = `display: inline;`;

      const dateAndTimeText = `${state.dateFormatted} | ${state.timeFormatted}`;
      const dateAndTimeHTML = `<div style="${contactBaseStyle}"><span style="${valueStyle}">${dateAndTimeText}</span></div>`;
      const locationHTML = `<div style="${contactBaseStyle}"><span style="${valueStyle}">${state.location || 'Lokasi Acara'}</span></div>`;
      const organizationHTML = `<div style="${contactBaseStyle}"><span style="${labelStyle}">Penyelenggara:</span><span style="${valueStyle}">${state.organization || 'Penyelenggara'}</span></div>`;
      const contactInnerHTML = `<div style="${contactBaseStyle}"><span style="${labelStyle}">CP:</span><span style="${valueStyle}">${state.contact || 'Kontak Person'}</span></div>`;
      contactDiv.innerHTML = dateAndTimeHTML + locationHTML + organizationHTML + contactInnerHTML;
      captureContainer.appendChild(contactDiv);

      // 6. Footer
      const footerDiv = document.createElement('div');
      footerDiv.style.cssText = `position:absolute; bottom:1.5%; left:0; width:100%; text-align:center; color:white; font-size:${FONT_SIZE_FOOTER}; opacity:0.85; z-index:3; font-family:'Poppins', sans-serif;`;
      footerDiv.innerHTML = `Pesawaran Mengaji Official <i class="fab fa-instagram" style="margin: 0 3px; vertical-align: middle;"></i> <i class="fab fa-whatsapp" style="margin: 0 3px; vertical-align: middle;"></i> <i class="fab fa-youtube" style="margin: 0 3px; vertical-align: middle;"></i>`;
      captureContainer.appendChild(footerDiv);

      return captureContainer;
   }

   // --- Fungsi untuk Generate Canvas (Async) ---
   async function generatePosterCanvas(state) {
      const captureContainer = createPosterElementForCanvas(state);
      document.body.appendChild(captureContainer);

      // Pastikan gambar background dimuat sebelum render
      const imageLoadPromise = new Promise((resolve, reject) => {
         const img = new Image();
         img.crossOrigin = "anonymous"; // Penting untuk CORS
         img.onload = resolve;
         img.onerror = reject;
         // Tambahkan timestamp untuk mencegah caching jika perlu
         img.src = state.backgroundUrl + (state.backgroundUrl.includes('?') ? '&cachebust=' : '?cachebust=') + Date.now();
      });

      try {
         // Tunggu font dan gambar siap
         await Promise.all([document.fonts.ready, imageLoadPromise]);

         // Sedikit delay untuk memastikan rendering selesai (terkadang diperlukan)
         await new Promise(resolve => setTimeout(resolve, 300));

         const canvas = await html2canvas(captureContainer, {
            scale: 1, // Render pada skala 1x (ukuran target)
            useCORS: true,
            allowTaint: false, // Jangan izinkan taint jika useCORS true
            logging: false,
            backgroundColor: null, // Transparan jika memungkinkan
            width: captureContainer.offsetWidth, // Gunakan lebar elemen
            height: captureContainer.offsetHeight // Gunakan tinggi elemen
         });
         return canvas;
      } finally {
         // Selalu hapus container setelah selesai
         if (document.body.contains(captureContainer)) {
            document.body.removeChild(captureContainer);
         }
      }
   }

   // --- Fungsi untuk Generate Blob dari Canvas (Async) ---
   async function generatePosterBlob(state) {
      try {
         const canvas = await generatePosterCanvas(state);
         return new Promise((resolve, reject) => {
            canvas.toBlob(blob => {
               if (blob) {
                  resolve(blob);
               } else {
                  reject(new Error("Gagal membuat Blob dari canvas."));
               }
            }, 'image/png'); // Tentukan tipe blob
         });
      } catch (error) {
         console.error("Error generating poster Blob:", error);
         throw error; // Lemparkan error agar bisa ditangkap di pemanggil
      }
   }

   // --- Event Listener Tombol Download (Menggunakan generatePosterCanvas) ---
   downloadBtn.addEventListener("click", async () => {
      const currentState = getPosterDataFromForm();
      if (!currentState.backgroundUrl || downloadBtn.disabled) return;

      const originalButtonText = downloadBtn.innerHTML;
      downloadBtn.disabled = true;
      downloadBtn.innerHTML = `<i class="fas fa-spinner fa-spin mr-2"></i>Mempersiapkan...`;

      try {
         downloadBtn.innerHTML = `<i class="fas fa-history mr-2"></i>Rendering...`;
         const canvas = await generatePosterCanvas(currentState); // Panggil fungsi refactor

         downloadBtn.innerHTML = `<i class="fas fa-check mr-2"></i>Processing...`;
         const imageDataUrl = canvas.toDataURL("image/png");
         const link = document.createElement("a");
         link.href = imageDataUrl;
         const titleText = (currentState.title || 'poster').substring(0, 30);
         const dateText = currentState.dateRaw || 'tanggal';
         const filename = `poster-kajian-${titleText.replace(/[^a-z0-9]+/gi, '_').toLowerCase()}-${dateText}.png`;
         link.download = filename;
         link.click();
         console.log("Download triggered.");

      } catch (error) {
         console.error("Download error:", error);
         alert("Gagal membuat gambar untuk diunduh: " + error.message);
      } finally {
         downloadBtn.disabled = false;
         downloadBtn.innerHTML = originalButtonText;
      }
   });

   // --- BARU: Event Listener Tombol Share Gambar ---
   shareImageBtn.addEventListener("click", async () => {
      const currentState = getPosterDataFromForm();
      if (!currentState.backgroundUrl || shareImageBtn.disabled) return;

      const originalButtonText = shareImageBtn.innerHTML;
      shareImageBtn.disabled = true;
      shareImageBtn.innerHTML = `<i class="fas fa-spinner fa-spin mr-2"></i>Mempersiapkan...`;

      // Cek apakah Web Share API didukung & bisa share file
      if (!navigator.share || !navigator.canShare) {
         shareImageBtn.innerHTML = originalButtonText; // Kembalikan teks tombol
         shareImageBtn.disabled = false; // Aktifkan lagi (meski tidak berfungsi)
         alert("Fitur bagikan gambar tidak didukung di browser/perangkat ini. Silakan download poster lalu bagikan secara manual.");
         return;
      }


      try {
         shareImageBtn.innerHTML = `<i class="fas fa-history mr-2"></i>Rendering...`;
         const blob = await generatePosterBlob(currentState); // Generate Blob

         const titleText = (currentState.title || 'poster').substring(0, 30);
         const dateText = currentState.dateRaw || 'tanggal';
         const filename = `poster-kajian-${titleText.replace(/[^a-z0-9]+/gi, '_').toLowerCase()}-${dateText}.png`;

         // Buat File object dari Blob
         const file = new File([blob], filename, { type: 'image/png' });

         // Data untuk dibagikan
         const shareData = {
            files: [file],
            title: `Poster Kajian: ${currentState.title || 'Info Kajian'}`,
            text: `Berikut poster untuk kajian "${currentState.title || 'Info Kajian'}" pada ${currentState.dateFormatted}.`,
         };

         // Cek apakah bisa share file
         if (navigator.canShare && navigator.canShare(shareData)) {
            shareImageBtn.innerHTML = `<i class="fas fa-share-alt mr-2"></i>Membagikan...`;
            await navigator.share(shareData);
            console.log('Poster berhasil dibagikan.');
            // Mungkin tidak perlu mengubah teks tombol lagi setelah share berhasil
         } else {
            console.warn('Tidak bisa membagikan data file ini.');
            alert("Tidak dapat membagikan gambar ini. Silakan coba download dan bagikan manual.");
         }

      } catch (error) {
         console.error('Error sharing:', error);
         // Cek jika error karena pengguna membatalkan share
         if (error.name !== 'AbortError') {
            alert('Gagal membagikan poster: ' + error.message);
         }
      } finally {
         // Kembalikan state tombol HANYA jika BUKAN AbortError (pengguna cancel)
         if (event && event.type === 'click') { // Pastikan ini dari klik, bukan pembatalan
            shareImageBtn.disabled = false;
            shareImageBtn.innerHTML = originalButtonText;
         } else if (!event) { // Jika dipanggil dari try/catch error non-Abort
            shareImageBtn.disabled = false;
            shareImageBtn.innerHTML = originalButtonText;
         }
         // Jika AbortError, biarkan tombol seperti saat "Membagikan..." atau kembali normal
      }
   });


   console.log("Poster generator initialized (with share & mobile menu).");

}); // Akhir DOMContentLoaded