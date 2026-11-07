# Demo Undangan Pernikahan Adat Jawa — Tema Diky & Yuni

Template undangan online satu halaman (HTML, CSS, JS murni) yang dibuat persis berdasarkan referensi video WhatsApp (`WhatsApp Video 2026-10-30 at 22.15.35.mp4`):
- **Palet Warna**: Taupe, mocha, sogan, dan ivory (`#9c8a7d`, `#877468`, `#f6f1eb`, `#2f211b`).
- **Tampilan Responsif Mobile & Desktop**:
  - Di ponsel: Tampil layar penuh alami (*full screen*).
  - Di laptop/PC: Tampil rapi sebagai kanvas smartphone di tengah layar (maksimal 414px) dengan latar belakang elegan dan panel samping informatif, sehingga ornamen bunga tidak melar melebar dan tidak menutupi tombol.
- **Aset Visual**:
  - `scene-joglo.jpg` (Ilustrasi etsa vintage rumah Joglo dengan gunung dan pepohonan rimbun).
  - `texture-batik-dark.jpg` (Tekstur ukiran batik gelap di dalam Gunungan).
  - `floral-corner.png`, `floral-bottom.png`, `floral-white.png` (Rangkaian bunga anggrek ungu tua, lili persik/krem, dan melati berlatar transparan).
  - `couple.jpg`, `groom.jpg`, `bride.jpg`, `gallery-1.jpg`, `gallery-2.jpg` (Foto prewedding adat Jawa beskap, kebaya beludru cokelat, dan jarik sogan).
- **Efek & Animasi Sesuai Video**:
  - **Sampul Gunungan**: Bentuk gunungan wayang (*clip-path*), foto oval mempelai, nama tamu otomatis, dan tombol "Buka Undangan" yang bercahaya.
  - **Opening Zoom Transition**: Saat "Buka Undangan" diklik:
    1. Teks dan foto sampul memudar halus dalam 0.45 detik.
    2. Lapisan batik gelap memudar menampilkan sketsa rumah Joglo dengan 3 ring kontur bevel Gunungan 3D.
    3. Gerbang Gunungan membesar menembus layar (*zoom-through*).
    4. Kawanan 16 burung merpati putih terbang membubung mengepakkan sayap (*flapping wings*) ke angkasa.
    5. Kamera menembus ke lanskap penuh rumah Joglo, kupu-kupu 3D beterbangan, dan lengkung *Hero Arch* berkontur ganda muncul perlahan.
  - **Audio Musik**: Memutar audio soundtrack asli dari video WhatsApp dengan cadangan synthesizer Gamelan Pelog Nem (Web Audio API) otomatis.
  - **Generator Link Tamu**: Tombol "🔗 Link Tamu" untuk demo membuat link `?to=Nama+Tamu` + draf pesan pengantar WA.

---

## Cara Mencoba Demo
1. Klik dua kali file [**`index.html`**](file:///c:/Users/ASUS/Documents/Project_webmobile/demo_undangan/index.html) untuk membuka di browser.
2. Coba tambahkan nama tamu di URL:
   `index.html?to=Bpk.+Dr.+Haryono+%26+Ibu`
3. Tekan tombol **"Buka Undangan"** untuk melihat transisi zoom portal gunungan dan burung merpati yang terbang.
4. Klik tombol **"🔗 Link Tamu"** di pojok kanan atas (atau di panel samping laptop) untuk mencoba membuat link khusus WhatsApp secara instan di depan pelanggan.
