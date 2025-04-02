# 🎨 Generator Poster Kajian Otomatis

Aplikasi web sederhana untuk membuat poster acara kajian Islam secara otomatis berdasarkan input pengguna dan latar belakang yang diambil dari Pexels API. 🚀

## ✨ Fitur Utama

✅ **Input Detail Kajian** 📝 - Masukkan Judul, Tanggal, Waktu, Lokasi, Penyelenggara, dan Kontak Person.
✅ **Pemilihan Kategori Background** 🖼️ - Pilih kategori gambar latar belakang (Masjid, Alam Islami, Ramadan, dll.) yang diambil dari Pexels API.
✅ **Pratinjau Langsung** 👀 - Lihat tampilan poster secara *real-time* saat Anda mengisi detail atau mengganti background.
✅ **Galeri Background** 📸 - Pilih dari beberapa opsi background yang tersedia.
✅ **Ganti Background** 🔄 - Ganti background dengan mudah menggunakan tombol "Ganti Background".
✅ **Fungsi Undo/Redo** ↩️↪️ - Batalkan atau ulangi perubahan pada detail poster.
✅ **Download Poster** ⬇️ - Unduh poster yang sudah jadi dalam format PNG (1080x1920).
✅ **Bagikan Gambar** 📲 - Bagikan poster langsung ke aplikasi lain (WhatsApp, dll.).
✅ **Desain Responsif** 📱 - Tampilan dioptimalkan untuk perangkat desktop dan mobile.

---

## 🛠️ Prasyarat

Sebelum menjalankan proyek ini, pastikan Anda memiliki:

1️⃣ **Web Browser Modern** 🌍 (Chrome, Firefox, Safari, Edge, dll.)
2️⃣ **Pexels API Key** 🔑 - Dapatkan API Key gratis dari [Pexels](https://www.pexels.com/api/).
3️⃣ **Web Server Lokal (Opsional)** 🌐 - Disarankan untuk menghindari masalah *CORS*.

---

## 🚀 Instalasi & Setup

1️⃣ **Clone atau Unduh Repository** 📂
```bash
git clone <url-repository-anda>
# atau unduh ZIP dan ekstrak
```
2️⃣ **Dapatkan Pexels API Key** 🔑 dari [Pexels](https://www.pexels.com/api/)
3️⃣ **Masukkan API Key di script.js** ✍️
```javascript
const PEXELS_API_KEY = "YOUR_API_KEY_HERE";
```
4️⃣ **Jalankan Aplikasi** 🏃‍♂️
   * Buka `index.html` langsung di browser.
   * **Disarankan**: Gunakan web server lokal (`http://localhost:8080`).

---

## 🎯 Cara Penggunaan

1️⃣ **Isi semua detail kajian** 📝
2️⃣ **Pilih kategori background** 🖼️
3️⃣ **Klik "Generate Poster"** 🛠️
4️⃣ **Preview poster akan muncul** 👀
5️⃣ **Gunakan tombol**:
   * **🔄 Ganti Background** - Memilih gambar lain dari kategori yang sama.
   * **↩️ Undo / ↪️ Redo** - Membatalkan/mengulang perubahan.
   * **⬇️ Download Poster** - Menyimpan dalam format PNG.
   * **📲 Bagikan Gambar** - Mengirim poster ke aplikasi lain.

---

## 📌 Dependensi Eksternal

📌 **Tailwind CSS** - Framework CSS.
📌 **Font Awesome** - Ikon untuk UI yang menarik.
📌 **Google Fonts (Poppins)** - Font kustom.
📌 **html2canvas.js** - Untuk merender elemen HTML ke gambar.
📌 **Pexels API** - Menyediakan gambar latar belakang berkualitas tinggi.

---

## ⚠️ Batasan / Isu yang Diketahui

🚧 **Web Share API** 📲 - Membutuhkan HTTPS & tidak tersedia di semua browser.
🚧 **Pexels API Key** 🔑 - Wajib dimasukkan agar aplikasi dapat berjalan.
🚧 **CORS Issues** 🌐 - Bisa terjadi saat *html2canvas* merender gambar eksternal.

---

✨ *Dibuat sebagai alat bantu untuk pembuatan poster kajian.* ✨
