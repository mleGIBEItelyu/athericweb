# 📊 Atheric AI — Financial Terminal & Forecast Analytics

Atheric AI adalah web dashboard terminal finansial modern yang dirancang untuk analisis pasar saham, pemodelan proyeksi harga (*forecast*), dan evaluasi akurasi kecerdasan buatan (AI). Web ini mengintegrasikan data tren historis dengan analisis sentimen untuk menghasilkan ramalan arah pergerakan pasar saham.

---

## ✨ Fitur Utama

### 1. 📈 Proyeksi Harga AI (Forecast Chart)
* Visualisasi grafik aktual vs ramalan harga di masa depan.
* Area gradien **90% Confidence Interval (CI)** untuk melacak tingkat deviasi.
* Garis indikator batas atas & bawah menggunakan **Bollinger Up** & **Bollinger Down**.
* Integrasi grafik volume transaksi langsung di dalam panel grafik utama.

### 2. 🎯 Evaluasi Akurasi Model AI
* Halaman evaluasi komparatif performa model bulan lalu vs bulan depan.
* Dilengkapi dengan ringkasan kelebihan, kekurangan, dan catatan kritis per model (LLM, ARIMA+GARCH, LSTM).
* Rincian persentase deviasi error (*MAPE*) dan detail performa per emiten.
* Tabel komparasi tren performa historis.

### 3. 🌟 Quick Watchlist & Markets
* Tabel peringkat emiten finansial lengkap dengan *Confidence Level* dan rekomendasi model (*BUY/HOLD/SELL*).
* Ekspor data tabel instan ke dalam format berkas CSV.
* Shortcut tombol **Bintang (Star)** pada daftar emiten untuk menambah/menghapus daftar pantau tanpa meninggalkan halaman.

### 4. 🎨 Multi-Theme Switcher (Termasuk Tema Gibei)
* Pengaturan tema tersinkronisasi otomatis dengan pilihan:
  - **Carbon Dark**: Aksen biru neon pada latar hitam pekat terminal.
  - **Deep Ocean Blue**: Aksen biru samudera bergradasi tenang.
  - **Cyber Emerald**: Nuansa peretas dengan kontras hijau terang.
  - **Gibei Theme**: Dominasi hitam legam dengan aksen emas kuning, merah, dan putih bersih.
* Sinkronisasi tema otomatis saat memuat ulang halaman (*Zero Flicker*).

### 5. 📸 16:9 Desktop View ShareModal
* Pengambilan tangkapan layar (*screenshot*) otomatis halaman dengan kualitas tinggi menggunakan `html2canvas`.
* Menghasilkan mockup gambar desktop dengan rasio presisi **16:9**, terlepas dari perangkat yang Anda gunakan (termasuk seluler).
* Dukungan tombol bagikan langsung ke media sosial (X/Twitter, WhatsApp, Telegram, LinkedIn) dan Web Share API.

### 6. ✉️ Pusat Bantuan (Support Ticket Form)
* Halaman pengiriman tiket kendala teknis dan masukan pengguna.
* Integrasi otomatis format data ke sistem klien email `mailto` menuju target email developer: **`mlegibeitelu@gmail.com`**.

---

## 🛠️ Tech Stack

* **Framework & Core**: [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
* **Build Tool**: [Vite](https://vite.dev/)
* **State & Data Fetching**: [TanStack React Query](https://tanstack.com/query/latest)
* **Routing**: [React Router DOM](https://reactrouter.com/)
* **Screenshot Utility**: [html2canvas](https://html2canvas.hertzen.com/)
* **Styling**: Vanilla CSS Variables (Tema dinamis)

---

## 🚀 Cara Menjalankan Proyek Secara Lokal

Pastikan Anda telah memasang [Node.js](https://nodejs.org/) di komputer Anda sebelum memulai.

### 1. Klon Repositori
```bash
git clone https://github.com/mleGIBEItelyu/athericweb.git
cd athericweb
```

### 2. Pasang Dependensi
```bash
npm install
```

### 3. Jalankan Server Development
```bash
npm run dev
```
Buka alamat **[http://localhost:5173](http://localhost:5173)** pada browser Anda untuk menjelajahi terminal.

---

## 📂 Struktur Folder
```
athericweb/
├── public/                # Aset statis publik
├── src/
│   ├── components/
│   │   ├── common/       # Komponen reusable (Select, Toast, ShareModal, dll)
│   │   ├── dashboard/    # Komponen panel dashboard (Chart, Header, dll)
│   │   ├── layout/       # Kerangka navigasi (Sidebar, Topbar, AppLayout)
│   │   └── markets/      # Komponen penunjang halaman Markets
│   ├── data/
│   │   └── dummy.ts      # Pusat simulasi data finansial & evaluasi
│   ├── hooks/            # Hooks React Query terstruktur
│   ├── pages/            # View halaman utama (Dashboard, Settings, Evaluasi, dll)
│   ├── services/
│   │   └── api.ts        # Lapisan pemanggilan API
│   ├── styles/
│   │   └── globals.css   # Desain sistem & media queries responsif
│   ├── types/
│   │   └── index.ts      # Definisi tipe TypeScript
│   ├── App.tsx           # Setup rute utama
│   └── main.tsx          # Wrapper entry point aplikasi
```
