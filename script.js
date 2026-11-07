/**
 * ============================================================================
 * SCRIPT UNDANGAN PERNIKAHAN ADAT JAWA VINTAGE ETCHING
 * (Sesuai Referensi Video: Zoom Gunungan Portal, Burung Merpati, Kupu-kupu, Gamelan)
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  // --------------------------------------------------------------------------
  // 1. DATA KONFIGURASI
  // --------------------------------------------------------------------------
  const CONFIG = {
    coupleShort: 'Aprizal & Afifah',
    weddingDateISO: '2026-12-27T08:00:00+07:00',
    calendarStart: '20261227T010000Z',
    calendarEnd: '20261229T100000Z',
    venueName: 'Jl. Lkr. Alas Roban No.1551, Siwaduk, Sentul, Kec. Gringsing, Kabupaten Batang, Jawa Tengah 51281',
    hostWhatsappNumber: '6285720014330', // Nomor WA penerima RSVP (Afifatul Hidayah)
  };

  // Pastikan browser tidak pernah mengembalikan posisi scroll ke tengah halaman saat reload/buka
  if ('scrollRestoration' in window.history) {
    window.history.scrollRestoration = 'manual';
  }

  function scrollToTopInstant() {
    document.documentElement.style.scrollBehavior = 'auto';
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    requestAnimationFrame(() => {
      document.documentElement.style.scrollBehavior = '';
    });
  }

  // Hapus hash (#quote dll) dari URL saat pertama dimuat agar tidak melompat ke tengah
  if (window.location.hash) {
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
  }
  scrollToTopInstant();
  window.addEventListener('pageshow', scrollToTopInstant);

  // --------------------------------------------------------------------------
  // 2. BACA NAMA TAMU DARI URL (?to=Nama+Tamu)
  // --------------------------------------------------------------------------
  const guestDisplay = document.getElementById('guest-name-display');
  const rsvpName = document.getElementById('rsvp-name');

  function applyGuestName() {
    const params = new URLSearchParams(window.location.search);
    const raw = params.get('to') || params.get('kepada');
    if (raw && raw.trim()) {
      const clean = raw.trim().slice(0, 80);
      if (guestDisplay) guestDisplay.textContent = clean;
      if (rsvpName) rsvpName.value = clean;
    }

    // Aktifkan tombol & panel pembuat link tamu khusus jika URL mengandung ?admin=1
    const isAdmin = params.get('admin') === '1' || params.get('admin') === 'true' || params.get('panel') === '1';
    if (isAdmin) {
      document.body.classList.add('is-admin');
    }
  }
  applyGuestName();

  // --------------------------------------------------------------------------
  // 3. SYNTHESIZER GAMELAN JAWA (Pelog Nem Halus via Web Audio API)
  // --------------------------------------------------------------------------
  class GamelanPlayer {
    constructor() {
      this.ctx = null;
      this.isPlaying = false;
      this.timer = null;
      this.step = 0;
      this.scale = [293.66, 311.13, 369.99, 440.0, 466.16, 587.33, 622.25, 739.99];
      this.melody = [0, 2, 3, 4, 3, 2, 1, 0, 2, 3, 5, 4, 3, 2, 1, 3];
    }

    init() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioCtx();
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    playNote(freq, dur = 2.4, vol = 0.05) {
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'triangle';
      osc1.frequency.setValueAtTime(freq, now);
      osc2.frequency.setValueAtTime(freq * 2.76, now);

      const harmGain = this.ctx.createGain();
      harmGain.gain.setValueAtTime(vol * 0.16, now);
      harmGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(vol, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

      osc1.connect(gain);
      osc2.connect(harmGain);
      harmGain.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + dur);
      osc2.stop(now + dur);
    }

    start() {
      this.init();
      if (this.isPlaying) return;
      this.isPlaying = true;

      const tick = () => {
        if (!this.isPlaying) return;
        const noteIdx = this.melody[this.step % this.melody.length];
        const freq = this.scale[noteIdx];

        this.playNote(freq, 2.5, 0.045);

        if (this.step % 4 === 0) {
          this.playNote(freq * 0.5, 3.8, 0.06);
        }
        if (this.step % 8 === 0) {
          this.playNote(this.scale[0] * 0.25, 5.0, 0.075);
        }

        this.step += 1;
      };

      tick();
      this.timer = setInterval(tick, 1200);
    }

    stop() {
      this.isPlaying = false;
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
    }

    toggle() {
      if (this.isPlaying) this.stop();
      else this.start();
      return this.isPlaying;
    }
  }

  // --------------------------------------------------------------------------
  // 3. AUDIO BACKGROUND: UTAMAKAN LAGU DARI FOLDER assets/mp3
  // --------------------------------------------------------------------------
  const bgAudio = document.getElementById('bg-audio');
  const bgVideoAudio = document.getElementById('bg-video-audio');
  const gamelan = new GamelanPlayer();
  const btnMusic = document.getElementById('btn-music');
  const musicDisc = document.getElementById('music-icon');
  let isMusicPlaying = false;
  let activeMediaEl = bgAudio;

  // Deteksi otomatis file .mp3 di dalam folder assets/mp3/ bila dibuka lewat local server
  (async function detectMp3InFolder() {
    if (!bgAudio) return;
    try {
      const res = await fetch('assets/mp3/');
      if (res.ok) {
        const html = await res.text();
        const match = html.match(/href=["']([^"']*\.mp3)["']/i);
        if (match && match[1]) {
          const found = match[1].includes('assets/mp3/')
            ? match[1]
            : `assets/mp3/${match[1].replace(/^\.\//, '').replace(/^\//, '')}`;
          bgAudio.src = found;
        }
      }
    } catch {
      // Abaikan bila dibuka via file://
    }
  })();

  function fadeInMedia(mediaEl) {
    mediaEl.volume = 0.0;
    let vol = 0;
    const fadeTimer = setInterval(() => {
      vol += 0.05;
      if (vol >= 0.85) {
        mediaEl.volume = 0.85;
        clearInterval(fadeTimer);
      } else {
        mediaEl.volume = Math.min(0.85, vol);
      }
    }, 70);
  }

  function playFallbackVideoOrGamelan() {
    if (bgVideoAudio) {
      activeMediaEl = bgVideoAudio;
      bgVideoAudio.currentTime = 0;
      const vp = bgVideoAudio.play();
      if (vp !== undefined) {
        vp.then(() => fadeInMedia(bgVideoAudio)).catch(() => gamelan.start());
      }
    } else {
      gamelan.start();
    }
  }

  function startMusic() {
    if (isMusicPlaying) return;
    isMusicPlaying = true;
    if (musicDisc) musicDisc.classList.add('playing');

    if (bgAudio) {
      activeMediaEl = bgAudio;
      bgAudio.currentTime = 0;
      const playPromise = bgAudio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => fadeInMedia(bgAudio))
          .catch(() => {
            playFallbackVideoOrGamelan();
          });
      }
    } else {
      playFallbackVideoOrGamelan();
    }
  }

  function pauseMusic() {
    isMusicPlaying = false;
    if (musicDisc) musicDisc.classList.remove('playing');
    if (bgAudio && !bgAudio.paused) bgAudio.pause();
    if (bgVideoAudio && !bgVideoAudio.paused) bgVideoAudio.pause();
    gamelan.stop();
  }

  function toggleMusic() {
    if (isMusicPlaying) {
      pauseMusic();
      showToast('Musik dihentikan');
      return false;
    } else {
      const target = activeMediaEl || bgAudio || bgVideoAudio;
      if (target && target.paused) {
        target.play().catch(() => playFallbackVideoOrGamelan());
      } else {
        gamelan.start();
      }
      isMusicPlaying = true;
      if (musicDisc) musicDisc.classList.add('playing');
      showToast('♫ Musik diputar');
      return true;
    }
  }

  if (btnMusic) {
    btnMusic.addEventListener('click', () => {
      toggleMusic();
    });
  }

  // --------------------------------------------------------------------------
  // 4. BUKA UNDANGAN (PORTAL ZOOM-THROUGH & MERPATI IDENTIK VIDEO)
  // --------------------------------------------------------------------------
  const cover = document.getElementById('cover');
  const btnOpen = document.getElementById('btn-open-invitation');
  const heroArch = document.getElementById('hero-arch');
  const dovesContainer = document.getElementById('flying-doves-container');

  function spawnFlyingDoves() {
    if (!dovesContainer || !cover) return;
    dovesContainer.innerHTML = '';
    const numDoves = 16;
    const canvas = cover.querySelector('.screen-canvas') || cover;
    const rect = canvas.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height * 0.54;

    for (let i = 0; i < numDoves; i++) {
      const dove = document.createElement('div');
      dove.className = 'dove-item';

      // Posisi awal bergerombol di atap Joglo
      const startX = centerX + (Math.random() - 0.5) * 60;
      const startY = centerY + (Math.random() - 0.5) * 40;
      dove.style.left = `${startX}px`;
      dove.style.top = `${startY}px`;

      // Trayektori sebar: separuh ke kiri atas, separuh ke kanan atas
      const isLeft = i % 2 === 0;
      const angleDeg = isLeft ? (-125 + Math.random() * 45) : (-55 + Math.random() * 45);
      const angleRad = (angleDeg * Math.PI) / 180;
      const distance = 320 + Math.random() * 260;

      const tx = Math.cos(angleRad) * distance;
      const ty = Math.sin(angleRad) * distance;

      const rotStart = angleDeg + 90 + (Math.random() - 0.5) * 18;
      const rotEnd = rotStart + (isLeft ? -15 : 15);

      dove.style.setProperty('--tx', `${tx}px`);
      dove.style.setProperty('--ty', `${ty}px`);
      dove.style.setProperty('--rot-start', `${rotStart}deg`);
      dove.style.setProperty('--rot-end', `${rotEnd}deg`);
      dove.style.setProperty('--delay', `${0.1 + i * 0.08}s`);

      dove.innerHTML = `
        <svg class="dove-svg" viewBox="0 0 36 28">
          <use href="#dove-shape"></use>
        </svg>
      `;

      dovesContainer.appendChild(dove);
    }
  }

  if (btnOpen) {
    btnOpen.addEventListener('click', () => {
      // 0. Pastikan halaman langsung terkunci di paling atas (#hero / halaman paling awal)
      scrollToTopInstant();

      // 1. Putar Musik Pernikahan Langsung (fade-in volume lembut)
      startMusic();

      // Gunakan GSAP Timeline Sinematik bila GSAP tersedia
      if (typeof window.gsap !== 'undefined') {
        const gsap = window.gsap;
        cover.classList.add('gsap-active');
        if (heroArch) heroArch.classList.remove('revealed');

        // Set kondisi awal sebelum animasi jalan (tanpa scale < 1 agar tepi gambar tidak pernah terpotong kaku)
        gsap.set('.joglo-scene-img', { scale: 1.12, y: 0, transformOrigin: '50% 62%' });
        gsap.set('.hero-bg', { scale: 1.18, y: 16, transformOrigin: '50% 62%' });
        gsap.set('.portal-bg-joglo', { opacity: 1 });
        gsap.set(['.g-ring-outer', '.g-ring-middle', '.gunungan-portal', '.gunungan-shadow'], {
          xPercent: -50,
          yPercent: -50,
          x: 0,
          y: 0,
          transformOrigin: '50% 62%',
        });
        gsap.set('.g-ring-outer', { scale: 1.15, opacity: 1 });
        gsap.set('.g-ring-middle', { scale: 1.08, opacity: 1 });
        gsap.set('.gunungan-portal', { scale: 1, opacity: 1 });
        gsap.set('.gunungan-shadow', { scale: 1.01, opacity: 0.35 });

        // Kondisi awal Bingkai Oval Utama + Garis Melingkar di halaman paling awal (#hero)
        gsap.set('#hero-arch', { opacity: 0, y: 0, scale: 0.84, transition: 'none' });
        gsap.set('.hero-arch-surface', {
          clipPath: 'ellipse(0% 0% at 50% 50%)',
          transition: 'none',
        });
        gsap.set(['.oval-stroke-outer', '.oval-stroke-inner'], {
          strokeDasharray: 1000,
          strokeDashoffset: 1000,
          transition: 'none',
        });
        gsap.set('.hero-arch-inner', { opacity: 0, y: 14, scale: 0.95 });
        gsap.set('#flying-doves-container', { opacity: 0, scale: 0.85, y: 35 });

        const tl = gsap.timeline();

        // 1. Cover Depan menghilang & membesar sedikit (00:00 - 00:00.9)
        tl.to('.cover-content', {
          opacity: 0,
          scale: 1.15,
          duration: 0.9,
          ease: 'power2.inOut',
          onComplete: () => {
            const cc = document.querySelector('.cover-content');
            if (cc) cc.style.display = 'none';
          },
        })
          .to(
            ['.fl-corner-tl', '.fl-corner-tr'],
            {
              y: -35,
              opacity: 0,
              duration: 0.9,
              ease: 'power2.inOut',
            },
            0
          )
          .to(
            '.fl-band-wrap',
            {
              y: 55,
              opacity: 0,
              duration: 0.9,
              ease: 'power2.inOut',
            },
            0
          )

          // 2. Scene 1 (Tekstur Gunungan Awal) zoom masuk lalu transisi ke Scene 2 Joglo
          .fromTo(
            '.portal-bg-cover',
            { scale: 1, opacity: 1, transformOrigin: '50% 62%' },
            { scale: 2.8, opacity: 0, duration: 1.4, ease: 'power3.in' },
            '-=0.3'
          )

          // 3. Lorong Gunungan membesar ekstrem menembus layar (expo.inOut + stagger 0.15s)
          .to(
            '.g-ring-outer',
            {
              scale: 8,
              opacity: 0,
              duration: 3.2,
              ease: 'expo.inOut',
            },
            '-=0.8'
          )
          .to(
            ['.g-ring-middle', '.gunungan-portal', '.gunungan-shadow'],
            {
              scale: 6.5,
              opacity: 0,
              duration: 3.5,
              ease: 'expo.inOut',
            },
            '<0.15'
          )

          // 4. Counter-scale halus pada gambar Joglo di dalam portal + paralaks lembut pada Hero Joglo
          .to(
            '.joglo-scene-img',
            {
              scale: 0.22,
              y: 0,
              duration: 3.5,
              ease: 'expo.inOut',
            },
            '<'
          )
          .to(
            '.hero-bg',
            {
              scale: 1,
              y: 0,
              duration: 4.2,
              ease: 'power2.out',
              onComplete: () => {
                // Kembalikan ke animasi CSS jogloBreeze agar Rumah Joglo tetap hidup & tidak diam kaku
                gsap.set('.hero-bg', { clearProps: 'transform' });
              },
            },
            '<'
          )

          // 5. Burung putih terbang menyebar ke atas
          .call(() => spawnFlyingDoves(), null, '-=3.2')
          .to(
            '#flying-doves-container',
            {
              opacity: 1,
              scale: 1.15,
              y: -90,
              duration: 3.0,
              ease: 'power1.out',
            },
            '-=3.2'
          )
          .to('#flying-doves-container', { opacity: 0, duration: 0.8 }, '-=1.0')

          // Pudarkan layar cover tepat saat gerbang selesai menembus layar & pastikan di paling atas
          .to(
            '#cover',
            {
              opacity: 0,
              duration: 0.9,
              ease: 'power2.inOut',
              onStart: () => {
                scrollToTopInstant();
              },
              onComplete: () => {
                cover.style.display = 'none';
                document.body.classList.remove('locked');
                scrollToTopInstant();
              },
            },
            '-=1.2'
          )

          // 6. Halaman Paling Awal (#hero): Garis Oval melingkar halus & Bingkai Oval keluar perlahan membentuk lingkaran/oval
          .to(
            '#hero-arch',
            {
              opacity: 1,
              scale: 1,
              duration: 2.3,
              ease: 'sine.out',
            },
            '-=0.85'
          )
          .to(
            '.oval-stroke-outer',
            {
              strokeDashoffset: 0,
              duration: 2.4,
              ease: 'power2.inOut',
            },
            '<'
          )
          .to(
            '.oval-stroke-inner',
            {
              strokeDashoffset: 0,
              duration: 2.5,
              ease: 'power2.inOut',
            },
            '<0.18'
          )
          .to(
            '.hero-arch-surface',
            {
              clipPath: 'ellipse(52% 52% at 50% 50%)',
              duration: 2.3,
              ease: 'sine.inOut',
            },
            '<-0.1'
          )
          .to(
            '.hero-arch-inner',
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 1.6,
              ease: 'power2.out',
              onComplete: () => {
                if (heroArch) heroArch.classList.add('revealed');
              },
            },
            '-=1.5'
          );

        return;
      }

      // Fallback CSS murni bila GSAP tidak termuat (offline)
      cover.classList.add('stage-portal');
      setTimeout(() => cover.classList.add('stage-zooming'), 1400);
      setTimeout(() => spawnFlyingDoves(), 1650);
      setTimeout(() => {
        scrollToTopInstant();
        cover.classList.add('fade-out');
      }, 4600);
      setTimeout(() => {
        if (heroArch) heroArch.classList.add('revealed');
      }, 5000);
      setTimeout(() => {
        cover.style.display = 'none';
        document.body.classList.remove('locked');
        scrollToTopInstant();
      }, 6800);
    });
  }

  // --------------------------------------------------------------------------
  // 5. KUPU-KUPU BETEBANGAN DI HERO (BUTTERFLIES FLUTTERING)
  // --------------------------------------------------------------------------
  const butterfliesContainer = document.getElementById('butterflies');

  function initButterflies() {
    if (!butterfliesContainer) return;
    const count = 8;
    const heroEl = document.getElementById('hero');
    const width = (heroEl ? heroEl.clientWidth : 380) || 380;
    const height = (heroEl ? heroEl.clientHeight : 600) || 600;

    for (let i = 0; i < count; i++) {
      const b = document.createElement('div');
      b.className = 'butterfly';

      const wLeft = document.createElement('div');
      wLeft.className = 'butterfly-wing bw-left';
      const wRight = document.createElement('div');
      wRight.className = 'butterfly-wing bw-right';

      b.appendChild(wLeft);
      b.appendChild(wRight);

      const startLeft = Math.random() < 0.5;
      const x0 = startLeft ? -25 : width + 20;
      const x1 = startLeft ? width + 25 : -25;
      const y0 = 80 + Math.random() * (height - 200);
      const y1 = y0 + (Math.random() - 0.5) * 180;

      const dur = 9 + Math.random() * 7;
      const delay = Math.random() * 10;

      b.style.setProperty('--x0', `${x0}px`);
      b.style.setProperty('--y0', `${y0}px`);
      b.style.setProperty('--x1', `${x1}px`);
      b.style.setProperty('--y1', `${y1}px`);
      b.style.setProperty('--dur', `${dur}s`);
      b.style.setProperty('--delay', `${delay}s`);

      butterfliesContainer.appendChild(b);
    }
  }
  initButterflies();

  // --------------------------------------------------------------------------
  // 6. HITUNG MUNDUR (COUNTDOWN TIMER)
  // --------------------------------------------------------------------------
  const targetTime = new Date(CONFIG.weddingDateISO).getTime();
  const elDays = document.getElementById('cd-days');
  const elHours = document.getElementById('cd-hours');
  const elMinutes = document.getElementById('cd-minutes');
  const elSeconds = document.getElementById('cd-seconds');

  function updateCountdown() {
    const diff = Math.max(0, targetTime - Date.now());
    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const m = Math.floor((diff / (1000 * 60)) % 60);
    const s = Math.floor((diff / 1000) % 60);

    if (elDays) elDays.textContent = String(d).padStart(2, '0');
    if (elHours) elHours.textContent = String(h).padStart(2, '0');
    if (elMinutes) elMinutes.textContent = String(m).padStart(2, '0');
    if (elSeconds) elSeconds.textContent = String(s).padStart(2, '0');
  }
  updateCountdown();
  setInterval(updateCountdown, 1000);

  // Link Google Calendar
  const btnCal = document.getElementById('btn-save-calendar');
  if (btnCal) {
    const calUrl = new URL('https://calendar.google.com/calendar/render');
    calUrl.searchParams.set('action', 'TEMPLATE');
    calUrl.searchParams.set('text', `Pernikahan ${CONFIG.coupleShort}`);
    calUrl.searchParams.set('dates', `${CONFIG.calendarStart}/${CONFIG.calendarEnd}`);
    calUrl.searchParams.set('details', `Akad Nikah: Minggu, 27 Desember 2026 (Jam 08.00 - Selesai) di Ds. Sentul 06/04 Kec. Gringsing Kab. Batang.\nResepsi: Selasa, 29 Desember 2026 (Jam 13.00 - Selesai) di Ds. Sentul 05/03 Kec. Gringsing Kab. Batang.`);
    calUrl.searchParams.set('location', CONFIG.venueName);
    btnCal.href = calUrl.toString();
  }

  // --------------------------------------------------------------------------
  // 7. ANIMASI SCROLL REVEAL
  // --------------------------------------------------------------------------
  const reveals = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });
  reveals.forEach((el) => observer.observe(el));

  // --------------------------------------------------------------------------
  // 8. GALERI LIGHTBOX
  // --------------------------------------------------------------------------
  const lbModal = document.getElementById('lightbox-modal');
  const lbImg = document.getElementById('lightbox-img');
  const lbCaption = document.getElementById('lightbox-caption');
  const lbClose = document.getElementById('lightbox-close');

  document.querySelectorAll('.gallery-item').forEach((item) => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      if (img && lbImg) {
        // Tampilkan foto utuh (data-full) bila ada, thumbnail galeri hanya potongan
        lbImg.src = img.dataset.full || img.src;
        if (lbCaption) lbCaption.textContent = item.getAttribute('data-caption') || '';
        lbModal.classList.remove('hidden');
      }
    });
  });

  if (lbClose) lbClose.addEventListener('click', () => lbModal.classList.add('hidden'));
  if (lbModal) {
    lbModal.addEventListener('click', (e) => {
      if (e.target === lbModal) lbModal.classList.add('hidden');
    });
  }

  // --------------------------------------------------------------------------
  // 9. SALIN NOMOR REKENING / ALAMAT & TOAST
  // --------------------------------------------------------------------------
  const toastEl = document.getElementById('toast');
  let toastTimer = null;

  function showToast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2400);
  }

  async function copyText(text, label) {
    try {
      await navigator.clipboard.writeText(text);
      showToast(`✓ ${label} disalin`);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showToast(`✓ ${label} disalin`);
    }
  }

  document.querySelectorAll('.btn-copy').forEach((btn) => {
    btn.addEventListener('click', () => {
      const copyVal = btn.getAttribute('data-copy');
      const copyLabel = btn.getAttribute('data-label') || 'Data';
      copyText(copyVal, copyLabel);
    });
  });

  // --------------------------------------------------------------------------
  // 10. RSVP & BUKU TAMU (LOCALSTORAGE)
  // --------------------------------------------------------------------------
  const STORAGE_KEY = 'undangan_aprizal_afifah_wishes_v1';
  const defaultWishes = [];

  function getWishes() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : defaultWishes;
    } catch {
      return defaultWishes;
    }
  }

  function setWishes(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {}
  }

  let wishes = getWishes();
  const wishesListEl = document.getElementById('wishes-list');
  const rsvpStatsEl = document.querySelector('.rsvp-stats');
  const countHadir = document.getElementById('count-hadir');
  const countAbsen = document.getElementById('count-absen');
  const countTotal = document.getElementById('count-total');

  function renderWishes() {
    if (!wishesListEl) return;
    wishesListEl.innerHTML = '';
    let hadir = 0;
    let absen = 0;

    if (wishes.length === 0) {
      if (rsvpStatsEl) rsvpStatsEl.style.display = 'none';
      const empty = document.createElement('p');
      empty.className = 'wish-empty';
      empty.textContent = 'Tuliskan doa & ucapan terbaik Anda untuk kedua mempelai.';
      wishesListEl.appendChild(empty);
    } else {
      if (rsvpStatsEl) rsvpStatsEl.style.display = '';
      wishes.forEach((w) => {
        if (w.attendance === 'Hadir') hadir++;
        else absen++;

        const div = document.createElement('div');
        div.className = 'wish';

        const head = document.createElement('div');
        head.className = 'wish-head';

        const author = document.createElement('span');
        author.className = 'wish-author';
        author.textContent = w.name;

        const badge = document.createElement('span');
        badge.className = 'wish-badge';
        badge.textContent = w.attendance === 'Hadir' ? `Hadir (${w.pax})` : 'Berhalangan';

        head.appendChild(author);
        head.appendChild(badge);

        const msg = document.createElement('p');
        msg.className = 'wish-text';
        msg.textContent = w.message;

        div.appendChild(head);
        div.appendChild(msg);
        wishesListEl.appendChild(div);
      });
    }

    if (countHadir) countHadir.textContent = hadir;
    if (countAbsen) countAbsen.textContent = absen;
    if (countTotal) countTotal.textContent = wishes.length;
  }
  renderWishes();

  const rsvpForm = document.getElementById('rsvp-form');
  if (rsvpForm) {
    rsvpForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('rsvp-name').value.trim();
      const att = document.getElementById('rsvp-attendance').value;
      const pax = document.getElementById('rsvp-pax').value;
      const msg = document.getElementById('rsvp-message').value.trim();

      if (!name || !msg) return;

      wishes.unshift({ name, attendance: att, pax, message: msg });
      setWishes(wishes);
      renderWishes();
      document.getElementById('rsvp-message').value = '';
      showToast('✓ Doa & ucapan Anda tersimpan!');
    });
  }

  const btnRsvpWa = document.getElementById('btn-rsvp-wa');
  if (btnRsvpWa) {
    btnRsvpWa.addEventListener('click', () => {
      const name = document.getElementById('rsvp-name').value.trim() || 'Tamu Undangan';
      const att = document.getElementById('rsvp-attendance').value;
      const pax = document.getElementById('rsvp-pax').value;
      const msg = document.getElementById('rsvp-message').value.trim() || 'Semoga berbahagia selalu.';

      const text = [
        `Halo, saya *${name}* konfirmasi kehadiran pernikahan *${CONFIG.coupleShort}*:`,
        `• Status: *${att}*`,
        `• Jumlah: *${pax}*`,
        `• Ucapan: _"${msg}"_`,
        `Matur nuwun.`,
      ].join('\n');

      window.open(`https://wa.me/${CONFIG.hostWhatsappNumber}?text=${encodeURIComponent(text)}`, '_blank');
    });
  }

  // --------------------------------------------------------------------------
  // 11. GENERATOR LINK TAMU WHATSAPP (DEMO CUSTOMER)
  // --------------------------------------------------------------------------
  const shareModal = document.getElementById('share-modal');
  const btnDemoShare = document.getElementById('btn-demo-share');
  const btnDemoPanel = document.getElementById('btn-demo-panel');
  const btnShareClose = document.getElementById('share-modal-close');
  const inputGuest = document.getElementById('input-target-guest');
  const genLink = document.getElementById('generated-link');
  const genWaText = document.getElementById('generated-wa-text');
  const btnTestGuest = document.getElementById('btn-test-guest-link');
  const btnCopyWa = document.getElementById('btn-copy-wa-text');
  const btnSendWa = document.getElementById('btn-send-wa-direct');

  function updateShare() {
    const name = inputGuest.value.trim() || 'Tamu Kehormatan';
    const baseUrl = window.location.origin + window.location.pathname;
    const link = `${baseUrl}?to=${encodeURIComponent(name)}`;
    if (genLink) genLink.value = link;

    const wa = [
      `Kepada Yth.`,
      `Bapak/Ibu/Saudara/i *${name}*`,
      `di Tempat`,
      ``,
      `_Assalamu’alaikum Warahmatullahi Wabarakatuh_`,
      ``,
      `Tanpa mengurangi rasa hormat, perkenankan kami mengundang Anda untuk menghadiri acara pernikahan kami:`,
      ``,
      `*A APRIZAL RIZQI K I., S.H., M.H & AFIFATUL HIDAYAH*`,
      ``,
      `*Akad Nikah:*`,
      `🗓 Minggu, 27 Desember 2026`,
      `⏰ Jam 08.00 WIB – Selesai`,
      `📍 Ds. Sentul 06/04 Kec. Gringsing Kab. Batang`,
      ``,
      `*Resepsi:*`,
      `🗓 Selasa, 29 Desember 2026`,
      `⏰ Jam 13.00 WIB – Selesai`,
      `📍 (Depan Balai desa) Ds. Sentul 05/03 Kec. Gringsing Kab. Batang`,
      ``,
      `Tautan undangan khusus:`,
      `👉 ${link}`,
      ``,
      `Merupakan kehormatan bagi kami atas kehadiran dan doa restunya.`,
      `_Matur Nuwun_ 🙏`,
    ].join('\n');

    if (genWaText) genWaText.value = wa;
  }

  function openShareModal() {
    updateShare();
    shareModal.classList.remove('hidden');
  }

  if (btnDemoShare) btnDemoShare.addEventListener('click', openShareModal);
  if (btnDemoPanel) btnDemoPanel.addEventListener('click', openShareModal);

  if (btnShareClose) btnShareClose.addEventListener('click', () => shareModal.classList.add('hidden'));
  if (shareModal) {
    shareModal.addEventListener('click', (e) => {
      if (e.target === shareModal) shareModal.classList.add('hidden');
    });
  }

  if (inputGuest) inputGuest.addEventListener('input', updateShare);

  if (btnTestGuest) {
    btnTestGuest.addEventListener('click', () => {
      const name = inputGuest.value.trim() || 'Tamu Kehormatan';
      if (guestDisplay) guestDisplay.textContent = name;
      if (rsvpName) rsvpName.value = name;

      const isAdmin = document.body.classList.contains('is-admin');
      const newUrl = `${window.location.pathname}?to=${encodeURIComponent(name)}${isAdmin ? '&admin=1' : ''}`;
      window.history.replaceState({}, '', newUrl);

      shareModal.classList.add('hidden');
      cover.style.display = '';
      cover.style.opacity = '';
      cover.classList.remove('fade-out', 'stage-portal', 'stage-zooming', 'gsap-active');
      const cc = document.querySelector('.cover-content');
      if (cc) cc.style.display = '';
      if (typeof window.gsap !== 'undefined') {
        window.gsap.set(
          [
            '#cover',
            '.cover-content',
            '.portal-bg-cover',
            '.portal-bg-joglo',
            '.joglo-scene-img',
            '.g-ring-outer',
            '.g-ring-middle',
            '.gunungan-portal',
            '.gunungan-shadow',
            '.fl-corner-tl',
            '.fl-corner-tr',
            '.fl-band-wrap',
            '#flying-doves-container',
            '#hero-arch',
            '.hero-arch-surface',
            '.hero-arch-inner',
            '.oval-stroke-outer',
            '.oval-stroke-inner',
            '.hero-bg',
          ],
          { clearProps: 'all' }
        );
      }
      if (heroArch) heroArch.classList.remove('revealed');
      scrollToTopInstant();
      document.body.classList.add('locked');
      showToast(`Tamu diubah: ${name}`);
    });
  }

  if (btnCopyWa) {
    btnCopyWa.addEventListener('click', () => {
      copyText(genWaText.value, 'Pesan WhatsApp');
    });
  }

  if (btnSendWa) {
    btnSendWa.addEventListener('click', () => {
      window.open(`https://wa.me/?text=${encodeURIComponent(genWaText.value)}`, '_blank');
    });
  }

  // --------------------------------------------------------------------------
  // 13. TOMBOL KEMBALI KE ATAS (BACK TO TOP)
  // --------------------------------------------------------------------------
  const btnBackTop = document.getElementById('btn-back-to-top');
  if (btnBackTop) {
    btnBackTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
});
