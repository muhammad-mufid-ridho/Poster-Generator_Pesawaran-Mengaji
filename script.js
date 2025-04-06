document.addEventListener("DOMContentLoaded", function () {

   // --- Variabel & Setup Awal ---
   const posterForm = document.getElementById("posterForm");
   const posterPreview = document.getElementById("posterPreview");
   const placeholder = document.getElementById("placeholder");
   const loadingIndicator = document.getElementById("loadingIndicator");
   const downloadBtn = document.getElementById("downloadBtn");
   const refreshBtn = document.getElementById("refreshBtn");
   const shareImageBtn = document.getElementById("shareImageBtn");
   const bgGalleryContainer = document.getElementById("bgGalleryContainer");
   const bgGallery = document.getElementById("bgGallery");
   const undoBtn = document.getElementById("undoBtn");
   const redoBtn = document.getElementById("redoBtn");
   const mobileMenuBtn = document.getElementById("mobileMenuBtn");
   const mainNav = document.getElementById("mainNav");
   const menuIcon = document.getElementById("menuIcon");

   // Variabel state aplikasi
   let history = [];
   let historyIndex = -1;
   const PEXELS_API_KEY = "563492ad6f91700001000001317cc024657d4284baa7f76d22a34179"; // <-- GANTI JIKA PERLU
   let currentBackgrounds = [];
   let currentBackgroundIndex = -1;
   let currentBackgroundUrl = null;
   let lastSearchQuery = "mosque";

   // Inisialisasi Awal
   updateHistoryButtons();
   setTodayDate();

   // --- Fungsi Helper (Bantuan) ---
   function setTodayDate() {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      document.getElementById('date').value = `${yyyy}-${mm}-${dd}`;
   }

   function showLoading(show = true) {
      loadingIndicator.classList.toggle('hidden', !show);
      placeholder.classList.toggle('hidden', show || !!currentBackgroundUrl);
   }

   function getPosterDataFromForm() {
      const getValue = (id, defaultValue = '') => document.getElementById(id)?.value.trim() || defaultValue;
      const dateValue = getValue('date');
      const timeValue = getValue('time');

      return {
         title: getValue('title', 'Judul Kajian Anda'),
         dateRaw: dateValue,
         timeRaw: timeValue,
         dateFormatted: formatDate(dateValue),
         timeFormatted: formatTime(timeValue),
         location: getValue('location', 'Lokasi Acara'),
         organization: getValue('organization', ''), // <-- Ambil penyelenggara, default kosong
         pemateri: getValue('pemateri', ''),
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
   function renderPoster(state, fromHistory = false) {
      if (!fromHistory) {
         currentBackgroundUrl = state.backgroundUrl;
         currentBackgroundIndex = state.backgroundIndex;
         currentBackgrounds = state.backgrounds ? [...state.backgrounds] : [];
         lastSearchQuery = state.category;
      }

      placeholder.classList.toggle('hidden', !!state.backgroundUrl);

      const titleHTML = state.title || 'Judul Kajian';

      // --- PERUBAHAN: Helper dengan Margin Bawah Kustom ---
      const createContactLine = (text, marginBottom = '6px') => { // Default margin kecil
         return text ? `<div style="margin-bottom: ${marginBottom};"><span class="contact-value">${text}</span></div>` : '';
      }
      const createContactLineWithLabel = (label, value, marginBottom = '6px') => {
         return value ? `<div style="margin-bottom: ${marginBottom};"><span class="contact-label">${label}:</span> <span class="contact-value">${value}</span></div>` : '';
      }
      // ---------------------------------------------------

      // Detail untuk bagian bawah (kontak)
      const dateAndTimeText = `${state.dateFormatted} | ${state.timeFormatted}`;
      const dateAndTimeHTML = createContactLine(dateAndTimeText); // Margin default
      // --- Beri margin lebih besar SETELAH Lokasi ---
      const locationHTML = createContactLine(state.location, '14px'); // Margin lebih besar
      // ---------------------------------------------
      const organizationHTML = createContactLineWithLabel('Penyelenggara', state.organization); // Margin default
      const contactHTML = createContactLineWithLabel('CP', state.contact); // Margin default (akhir tidak terlalu penting)

      const footerHTML = `Pesawaran Mengaji Official <i class="fab fa-instagram"></i> <i class="fab fa-whatsapp"></i> <i class="fab fa-youtube"></i>`;

      const fullTitleHTML = `<div class="poster-title">${titleHTML}</div>`;
      const speakerHTML = state.pemateri ? `<div class="poster-speaker">${state.pemateri}</div>` : '';

      posterPreview.innerHTML = `
         <div id="loadingIndicator" class="loading hidden">
             <div class="text-center">
                 <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500 mb-3"></div>
                 <div class="text-lg">Memproses...</div>
             </div>
         </div>
         ${ state.backgroundUrl ? `<div class="poster-background" style="background-image: url('${state.backgroundUrl}');"></div>` : '' }
         ${ state.backgroundUrl ? `<div class="poster-overlay"></div>` : '' }
         <div class="poster-day-indicator">${getRamadanDay()}</div>
         ${fullTitleHTML}
         ${speakerHTML}
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
      shareImageBtn.disabled = !hasContent;
      downloadBtn.classList.toggle('disabled', !hasContent);
      refreshBtn.classList.toggle('disabled', refreshBtn.disabled);
      shareImageBtn.classList.toggle('disabled', !hasContent);
      bgGalleryContainer.classList.toggle("hidden", !hasContent);

      if (!fromHistory) {
         addToHistory(getPosterDataFromForm());
      }
   }

   // --- Fungsi Fetch Pexels & Update Gallery ---
    async function fetchPexelsImages(query) {
        if (!PEXELS_API_KEY || PEXELS_API_KEY === "GANTI_DENGAN_API_KEY_PEXELS_ANDA" || PEXELS_API_KEY.length < 40) {
            console.warn("Pexels API Key tidak valid atau belum diatur di script.js.");
            if (!window.pexelsApiKeyWarningShown) {
                 alert("PERHATIAN: API Key Pexels tidak valid. Fitur background gambar mungkin tidak berfungsi. Silakan periksa variabel PEXELS_API_KEY di file script.js.");
                 window.pexelsApiKeyWarningShown = true;
            }
            return [];
        }
        const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=15&orientation=portrait`;
        try {
            const response = await fetch(url, { headers: { Authorization: PEXELS_API_KEY } });
            if (!response.ok) {
                const errorData = await response.text();
                let errorMsg = `Gagal mengambil gambar (HTTP ${response.status} ${response.statusText}).`;
                if (response.status === 401) errorMsg += " Pastikan API Key Pexels Anda benar.";
                else if (response.status === 429) errorMsg += " Kuota API Pexels mungkin habis.";
                else if (response.status === 400) errorMsg += " Query pencarian mungkin tidak valid.";
                else errorMsg += " Coba lagi nanti atau periksa koneksi internet.";
                console.error("Pexels API Error:", response.status, response.statusText, errorData);
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
            alert("Gagal memuat URL background yang dipilih.");
            return;
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
            lastState.organization === stateCopy.organization && // <-- Cek organization
            lastState.pemateri === stateCopy.pemateri &&
            lastState.contact === stateCopy.contact &&
            lastState.category === stateCopy.category)
        {
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
        document.getElementById("title").value = stateToRestore.title || '';
        document.getElementById("date").value = stateToRestore.dateRaw || '';
        document.getElementById("time").value = stateToRestore.timeRaw || '';
        document.getElementById("location").value = stateToRestore.location || '';
        document.getElementById("organization").value = stateToRestore.organization || ''; // <-- Restore organization
        document.getElementById("pemateri").value = stateToRestore.pemateri || '';
        document.getElementById("contact").value = stateToRestore.contact || '';
        document.getElementById("category").value = stateToRestore.category || 'mosque';
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

   // --- Event Listener Keyboard (Undo/Redo) ---
    document.addEventListener('keydown', (e) => {
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
        const isModifier = e.ctrlKey || e.metaKey;
        if (isModifier && e.key.toLowerCase() === 'z') {
            e.preventDefault(); if (!undoBtn.disabled) undo();
        }
        else if (isModifier && e.key.toLowerCase() === 'y') {
            e.preventDefault(); if (!redoBtn.disabled) redo();
        }
    });

   // --- Event Listener Lain ---
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
                 if (currentBackgrounds && currentBackgrounds.length > 0) {
                    alert(`Gagal mengambil gambar baru untuk kategori "${category}". Menampilkan background sebelumnya.`);
                 } else {
                    alert(`Tidak dapat menemukan gambar untuk kategori "${category}". Silakan coba kategori lain.`);
                    showLoading(false); submitButton.disabled = false; submitButton.innerHTML = '<i class="fas fa-magic mr-2"></i>Generate Poster';
                    placeholder.classList.remove('hidden'); posterPreview.innerHTML = '';
                    downloadBtn.disabled = true; refreshBtn.disabled = true; shareImageBtn.disabled = true;
                    downloadBtn.classList.add('disabled'); refreshBtn.classList.add('disabled'); shareImageBtn.classList.add('disabled');
                    bgGalleryContainer.classList.add("hidden"); return;
                }
            }
        } else { currentBackgroundIndex = 0; }
         if (!currentBackgrounds || currentBackgrounds.length === 0 || currentBackgroundIndex < 0) {
            console.warn("No valid backgrounds available after fetch/check.");
             showLoading(false); submitButton.disabled = false; submitButton.innerHTML = '<i class="fas fa-magic mr-2"></i>Generate Poster';
             placeholder.classList.remove('hidden'); posterPreview.innerHTML = '';
             downloadBtn.disabled = true; refreshBtn.disabled = true; shareImageBtn.disabled = true;
             downloadBtn.classList.add('disabled'); refreshBtn.classList.add('disabled'); shareImageBtn.classList.add('disabled');
             bgGalleryContainer.classList.add("hidden"); return;
        }
        const currentState = getPosterDataFromForm();
        currentState.backgroundUrl = currentBackgrounds[currentBackgroundIndex]?.src?.large2x || currentBackgrounds[currentBackgroundIndex]?.src?.large || currentBackgrounds[currentBackgroundIndex]?.src?.portrait;
        currentState.backgroundIndex = currentBackgroundIndex; currentState.backgrounds = [...currentBackgrounds];
        if (currentState.backgroundUrl) { renderPoster(currentState, false); }
        else { console.error("Failed to get background URL for rendering."); currentState.backgroundUrl = null; renderPoster(currentState, false); }
        showLoading(false); submitButton.disabled = false; submitButton.innerHTML = '<i class="fas fa-magic mr-2"></i>Generate Poster';
    });

    refreshBtn.addEventListener("click", () => {
        if (refreshBtn.disabled || !currentBackgrounds || currentBackgrounds.length <= 1) return;
        let newIndex = (currentBackgroundIndex + 1) % currentBackgrounds.length;
        handleBackgroundSelection(newIndex);
    });

    let inputDebounceTimer;
    posterForm.addEventListener('input', (e) => {
        if (currentBackgroundUrl && e.target.id !== 'category') {
            clearTimeout(inputDebounceTimer);
            inputDebounceTimer = setTimeout(() => {
                const currentState = getPosterDataFromForm();
                renderPoster(currentState, false);
            }, 300);
        }
    });

    undoBtn.addEventListener("click", undo);
    redoBtn.addEventListener("click", redo);

    mobileMenuBtn.addEventListener("click", () => {
        const isHidden = mainNav.classList.contains('hidden');
        mainNav.classList.toggle('hidden');
        menuIcon.classList.toggle('fa-bars', !isHidden);
        menuIcon.classList.toggle('fa-times', isHidden);
    });


   // --- Fungsi untuk Membuat Elemen Poster Off-screen (Untuk Canvas) ---
   function createPosterElementForCanvas(state) {
      const TARGET_WIDTH = 1080;
      const TARGET_HEIGHT = 1920;
      const FONT_SIZE_DAY_INDICATOR = '20px';
      const FONT_SIZE_TITLE = '85px';
      const FONT_SIZE_SPEAKER = '40px';
      const FONT_SIZE_CONTACT = '32px';
      const FONT_SIZE_FOOTER = '16px';
      const TITLE_TOP_POSITION = '48%';
      const SPEAKER_TOP_POSITION = '56%';
      const CONTACT_TOP_POSITION = '64%'; // Kontak mulai dari sini

      const captureContainer = document.createElement('div');
      captureContainer.style.cssText = `position: fixed; left: -9999px; top: 0px; width: ${TARGET_WIDTH}px; height: ${TARGET_HEIGHT}px; overflow: hidden; margin: 0; padding: 0; box-sizing: border-box; background: #ffffff;`;

      // 1. Background Image
      if (state.backgroundUrl) {
         const backgroundDiv = document.createElement('div');
         backgroundDiv.style.cssText = `position:absolute; top:0; left:0; width:100%; height:100%; background-image:url('${state.backgroundUrl}'); background-size:cover; background-position:center; z-index:1;`;
         captureContainer.appendChild(backgroundDiv);
      }
      // 2. Overlay Gelap
      const overlayDiv = document.createElement('div');
      overlayDiv.style.cssText = `position:absolute; top:0; left:0; width:100%; height:100%; background:linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.7) 100%); z-index:2;`;
      captureContainer.appendChild(overlayDiv);
      // 3. Indikator Hari
      const dayIndicatorDiv = document.createElement('div');
      dayIndicatorDiv.textContent = getRamadanDay();
      dayIndicatorDiv.style.cssText = `position:absolute; top:5%; left:0; width:100%; text-align:center; color:white; font-size:${FONT_SIZE_DAY_INDICATOR}; font-weight:500; letter-spacing:1px; z-index:3; text-shadow:1px 1px 3px rgba(0,0,0,0.5); font-family:"Poppins", sans-serif;`;
      captureContainer.appendChild(dayIndicatorDiv);
      // 4. Judul
      const titleDiv = document.createElement('div');
      titleDiv.style.cssText = `position: absolute; top: ${TITLE_TOP_POSITION}; left: 50%; transform: translate(-50%, -50%); width: ${TARGET_WIDTH * 0.90}px; color: white; font-size: ${FONT_SIZE_TITLE}; font-family: "Cinzel", serif; line-height: 1.15; font-weight: 800; text-transform: uppercase; text-align: center; z-index: 3; text-shadow: 1px 1px 4px rgba(0,0,0,0.7); overflow-wrap: break-word; word-wrap: break-word; word-break: break-word;`;
      titleDiv.textContent = state.title || 'Judul Kajian';
      captureContainer.appendChild(titleDiv);
      // 5. Pemateri
      if (state.pemateri) {
          const speakerDiv = document.createElement('div');
          speakerDiv.style.cssText = `position: absolute; top: ${SPEAKER_TOP_POSITION}; left: 50%; transform: translateX(-50%); width: ${TARGET_WIDTH * 0.85}px; color: white; font-family: "Poppins", sans-serif; font-size: ${FONT_SIZE_SPEAKER}; font-weight: 600; text-align: center; z-index: 3; text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.6); overflow-wrap: break-word; word-wrap: break-word; word-break: break-word;`;
          speakerDiv.textContent = state.pemateri;
          captureContainer.appendChild(speakerDiv);
      }
      // 6. Detail Kontak
      const contactDiv = document.createElement('div');
      contactDiv.style.cssText = `position: absolute; top: ${CONTACT_TOP_POSITION}; left: 50%; transform: translateX(-50%); width: ${TARGET_WIDTH * 0.88}px; color: white; font-size: ${FONT_SIZE_CONTACT}; z-index: 3; text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.6); text-align: center; font-family: "Poppins", sans-serif;`;
      // --- Style untuk baris kontak (Canvas) ---
      const contactBaseStyle = `line-height: 1.4; text-align: center; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word;`;
      const labelStyle = `font-weight: 600; display: inline; margin-right: 8px;`;
      const valueStyle = `display: inline;`;
      const normalMarginBottom = '12px'; // Margin normal antar baris kontak
      const extraMarginBottom = '24px'; // Margin ekstra setelah Lokasi
      // -----------------------------------------
      const dateAndTimeText = `${state.dateFormatted} | ${state.timeFormatted}`;
      const dateAndTimeHTML = dateAndTimeText !== "Tanggal Belum Diatur | Waktu Belum Diatur" ? `<div style="${contactBaseStyle} margin-bottom: ${normalMarginBottom};"><span style="${valueStyle}">${dateAndTimeText}</span></div>` : '';
      // --- Tambahkan margin ekstra di bawah Lokasi ---
      const locationHTML = state.location ? `<div style="${contactBaseStyle} margin-bottom: ${extraMarginBottom};"><span style="${valueStyle}">${state.location}</span></div>` : '';
      // --------------------------------------------
      const organizationHTML = state.organization ? `<div style="${contactBaseStyle} margin-bottom: ${normalMarginBottom};"><span style="${labelStyle}">Penyelenggara:</span><span style="${valueStyle}">${state.organization}</span></div>` : '';
      const contactInnerHTML = state.contact ? `<div style="${contactBaseStyle} margin-bottom: ${normalMarginBottom};"><span style="${labelStyle}">CP:</span><span style="${valueStyle}">${state.contact}</span></div>` : '';
      // --- Gabungkan HTML detail kontak ---
      contactDiv.innerHTML = dateAndTimeHTML + locationHTML + organizationHTML + contactInnerHTML;
      // -----------------------------------
      captureContainer.appendChild(contactDiv);
      // 7. Footer
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
      const imageLoadPromise = new Promise((resolve) => {
         if (!state.backgroundUrl) { resolve(); return; }
         const img = new Image(); img.crossOrigin = "anonymous";
         img.onload = resolve;
         img.onerror = () => { console.error("BG Load Error"); resolve(); };
         img.src = state.backgroundUrl + (state.backgroundUrl.includes('?') ? '&' : '?') + 'cache=' + Date.now(); // Cache buster
      });
      try {
         await Promise.all([ document.fonts.ready, imageLoadPromise ]);
         await new Promise(resolve => setTimeout(resolve, 300)); // Render delay
         const canvas = await html2canvas(captureContainer, { scale: 1, useCORS: true, allowTaint: false, logging: false, backgroundColor: null, width: captureContainer.offsetWidth, height: captureContainer.offsetHeight });
         return canvas;
      } catch(error) { console.error("Canvas Gen Error:", error); throw new Error("Gagal membuat gambar."); }
      finally { if (document.body.contains(captureContainer)) document.body.removeChild(captureContainer); }
   }

   // --- Fungsi untuk Generate Blob dari Canvas (Async) ---
   async function generatePosterBlob(state) {
      try {
         const canvas = await generatePosterCanvas(state);
         return new Promise((resolve, reject) => { canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error("Gagal buat Blob.")), 'image/png'); });
      } catch (error) { console.error("Blob Gen Error:", error); throw error; }
   }

   // --- Event Listener Tombol Download ---
   downloadBtn.addEventListener("click", async () => {
      const currentState = getPosterDataFromForm();
      if (!currentState.backgroundUrl || downloadBtn.disabled) return;
      const originalButtonText = downloadBtn.innerHTML;
      downloadBtn.disabled = true; downloadBtn.innerHTML = `<i class="fas fa-spinner fa-spin mr-2"></i>Mempersiapkan...`;
      try {
         downloadBtn.innerHTML = `<i class="fas fa-history mr-2"></i>Rendering...`;
         const canvas = await generatePosterCanvas(currentState);
         downloadBtn.innerHTML = `<i class="fas fa-check mr-2"></i>Memproses...`;
         const imageDataUrl = canvas.toDataURL("image/png");
         const link = document.createElement("a"); link.href = imageDataUrl;
         const titleText = (currentState.title || 'poster').substring(0, 30).replace(/[^a-z0-9]+/gi, '_').toLowerCase();
         const dateText = currentState.dateRaw || 'tanggal';
         link.download = `poster-kajian-${titleText}-${dateText}.png`;
         document.body.appendChild(link); link.click(); document.body.removeChild(link);
      } catch (error) { console.error("Download error:", error); alert("Gagal download: " + error.message); }
      finally { downloadBtn.disabled = false; downloadBtn.innerHTML = originalButtonText; }
   });

   // --- Event Listener Tombol Share Gambar ---
   shareImageBtn.addEventListener("click", async () => {
      const currentState = getPosterDataFromForm();
      if (!currentState.backgroundUrl || shareImageBtn.disabled) return;
      const originalButtonText = shareImageBtn.innerHTML;
      shareImageBtn.disabled = true; shareImageBtn.innerHTML = `<i class="fas fa-spinner fa-spin mr-2"></i>Mempersiapkan...`;
      if (!navigator.share || !navigator.canShare) {
         shareImageBtn.disabled = false; shareImageBtn.innerHTML = originalButtonText;
         alert("Fitur bagikan tidak didukung browser/perangkat ini atau perlu HTTPS."); return;
      }
      let shareInitiated = false;
      try {
         shareImageBtn.innerHTML = `<i class="fas fa-history mr-2"></i>Rendering...`;
         const blob = await generatePosterBlob(currentState);
         const titleText = (currentState.title || 'poster').substring(0, 30).replace(/[^a-z0-9]+/gi, '_').toLowerCase();
         const dateText = currentState.dateRaw || 'tanggal';
         const filename = `poster-kajian-${titleText}-${dateText}.png`;
         const file = new File([blob], filename, { type: 'image/png' });
         const shareData = {
            files: [file], title: `Poster Kajian: ${currentState.title || 'Info'}`,
            text: `Poster Kajian:\nJudul: ${currentState.title||'-'}\nPemateri: ${currentState.pemateri||'-'}\nWaktu: ${currentState.dateFormatted||'-'} | ${currentState.timeFormatted||'-'}\nLokasi: ${currentState.location||'-'}\nPenyelenggara: ${currentState.organization||'-'}\nCP: ${currentState.contact||'-'}`
         };
         if (navigator.canShare(shareData)) {
            shareImageBtn.innerHTML = `<i class="fas fa-share-alt mr-2"></i>Membagikan...`;
            shareInitiated = true; await navigator.share(shareData);
         } else { console.warn('Cannot share file data.'); alert("Tidak bisa share file ini."); }
      } catch (error) { console.error('Share error:', error); if (error.name !== 'AbortError') alert('Gagal share: ' + error.message); }
      finally {
         setTimeout(() => {
            if (!shareImageBtn.isSameNode(document.activeElement)) {
               shareImageBtn.disabled = !currentState.backgroundUrl;
               shareImageBtn.innerHTML = originalButtonText;
               shareImageBtn.classList.toggle('disabled', shareImageBtn.disabled);
            }
         }, 150);
      }
   });

   console.log("Poster generator initialized.");

}); // Akhir DOMContentLoaded