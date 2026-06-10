/* ============================================================
   GUS BENSON — script.js
   ============================================================ */

const DATA_FILE = 'data.json';
let siteData = null;
let carouselIndex = 0;
let carouselSlidesVisible = 3;

/* ── BOOT ── */
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initReveal();
  loadData();
});

/* ── LOAD DATA.JSON ── */
async function loadData() {
  try {
    const res = await fetch(DATA_FILE);
    if (!res.ok) throw new Error('fetch failed');
    siteData = await res.json();
  } catch (e) {
    console.warn('data.json not found — using fallback data');
    siteData = FALLBACK_DATA;
  }
  buildRecords();
  buildVideos();
  buildCarousel();
}

/* ── RECORDS GRID ── */
function buildRecords() {
  const grid = document.getElementById('recordsGrid');
  if (!grid || !siteData?.records) return;
  grid.innerHTML = '';

  siteData.records.forEach(r => {
    const item = document.createElement('div');
    item.className = 'record-item';
    item.innerHTML = `
      <img
        src="${r.image}"
        alt="${r.title}"
        class="record-img"
        onerror="this.style.display='none';this.parentElement.style.background='#111';"
      />
      <div class="record-overlay">
        <div class="record-info">
          <div class="ri-artist">${r.artist}</div>
          <div class="ri-title">${r.title}</div>
          <div class="ri-credit">${r.credit}</div>
        </div>
      </div>
      <a href="${r.spotify}" target="_blank" class="ri-link" aria-label="Listen to ${r.title} on Spotify"></a>
    `;
    grid.appendChild(item);
  });
}

/* ── VIDEOS GRID ── */
function buildVideos() {
  const grid = document.getElementById('videosGrid');
  if (!grid || !siteData?.videos) return;
  grid.innerHTML = '';

  siteData.videos.forEach((v, i) => {
    const item = document.createElement('div');
    item.className = 'video-item' + (v.featured ? ' large' : '');
    item.dataset.yt = v.youtubeId;

    const loop = v.featured ? `&loop=1&playlist=${v.youtubeId}` : '';
    // enablejsapi=1 lets us send postMessage commands to play/pause
    const embedSrc = `https://www.youtube.com/embed/${v.youtubeId}?autoplay=1&mute=1&controls=0&playsinline=1&enablejsapi=1${loop}`;

    item.innerHTML = `
      <div class="video-thumb-wrap">
        <img
          src="https://img.youtube.com/vi/${v.youtubeId}/maxresdefault.jpg"
          alt="${v.title}"
          class="video-thumb"
          onerror="this.src='https://img.youtube.com/vi/${v.youtubeId}/mqdefault.jpg';this.onerror=null;"
        />
      </div>
      <div class="video-embed-wrap">
        <iframe
          src="${embedSrc}"
          allowfullscreen
          allow="autoplay; encrypted-media"
        ></iframe>
      </div>
      <div class="video-overlay">
        <div class="video-info">
          <div class="vi-title">${v.title}</div>
          <div class="vi-meta">${v.credit}</div>
        </div>
      </div>
      <div class="play-btn">
        <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
      </div>
    `;
    grid.appendChild(item);
    attachVideoHover(item);
  });
}

/* ── WBRU CAROUSEL ── */
function buildCarousel() {
  const track = document.getElementById('carouselTrack');
  const dots  = document.getElementById('carouselDots');
  if (!track || !dots || !siteData?.wbru) return;
  track.innerHTML = '';
  dots.innerHTML  = '';

  siteData.wbru.forEach((v, i) => {
    const slide = document.createElement('div');
    slide.className = 'carousel-slide video-item';
    slide.dataset.yt = v.youtubeId;
    slide.innerHTML = `
      <div class="video-thumb-wrap">
        <img
          src="https://img.youtube.com/vi/${v.youtubeId}/maxresdefault.jpg"
          alt="${v.title}"
          class="video-thumb"
          onerror="this.src='https://img.youtube.com/vi/${v.youtubeId}/mqdefault.jpg';this.onerror=null;"
        />
      </div>
      <div class="video-embed-wrap">
        <iframe
          src="https://www.youtube.com/embed/${v.youtubeId}?autoplay=1&mute=1&controls=0&playsinline=1&enablejsapi=1"
          allowfullscreen
          allow="autoplay; encrypted-media"
        ></iframe>
      </div>
      <div class="video-overlay">
        <div class="video-info">
          <div class="vi-title">${v.title}</div>
          <div class="vi-meta">Head Engineer · Mix · Master</div>
        </div>
      </div>
      <div class="play-btn">
        <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
      </div>
    `;
    track.appendChild(slide);
    attachVideoHover(slide);

    const dot = document.createElement('div');
    dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
    dot.onclick = () => goToSlide(i);
    dots.appendChild(dot);
  });

  updateCarouselSlideWidth();
  window.addEventListener('resize', updateCarouselSlideWidth);
}

function updateCarouselSlideWidth() {
  const w = window.innerWidth;
  carouselSlidesVisible = w < 560 ? 1 : w < 960 ? 2 : 3;
  const slides = document.querySelectorAll('.carousel-slide');
  const gap = 20;
  const pct = 100 / carouselSlidesVisible;
  slides.forEach(s => s.style.flex = `0 0 calc(${pct}% - ${gap * (carouselSlidesVisible - 1) / carouselSlidesVisible}px)`);
  goToSlide(0);
}

function moveCarousel(dir) {
  if (!siteData) return;
  const max = Math.max(0, siteData.wbru.length - carouselSlidesVisible);
  carouselIndex = Math.max(0, Math.min(carouselIndex + dir, max));
  applyCarousel();
}

function goToSlide(i) {
  if (!siteData) return;
  const max = Math.max(0, siteData.wbru.length - carouselSlidesVisible);
  carouselIndex = Math.max(0, Math.min(i, max));
  applyCarousel();
}

function applyCarousel() {
  const track = document.getElementById('carouselTrack');
  if (!track) return;
  const slides = track.querySelectorAll('.carousel-slide');
  if (!slides.length) return;
  const slideW = slides[0].offsetWidth + 1;
  track.style.transform = `translateX(-${carouselIndex * slideW}px)`;
  document.querySelectorAll('.carousel-dot').forEach((d, i) => {
    d.classList.toggle('active', i === carouselIndex);
  });
}

/* ── VIDEO HOVER — colour reveal on hover, videos always playing ── */
function attachVideoHover(item) {
  // Videos are always playing in the background (loaded with autoplay=1&mute=1).
  // The hover effect is purely visual — CSS handles the grayscale/colour transition
  // and the iframe fading in. No JS play/pause needed.
}



/* ── NAV SCROLL ── */
function initNav() {
  window.addEventListener('scroll', () => {
    document.getElementById('mainNav').classList.toggle('scrolled', window.scrollY > 20);
  });
}

/* ── MOBILE HAMBURGER ── */
function toggleMenu() {
  const menu = document.getElementById('mobileMenu');
  const btn  = document.getElementById('hamburger');
  const open = menu.classList.toggle('open');
  btn.classList.toggle('open', open);
  // Prevent body scroll when menu is open
  document.body.style.overflow = open ? 'hidden' : '';
}

/* ── PAGE ROUTING ── */
function showPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + name).classList.add('active');
  window.scrollTo({ top: 0, behavior: 'instant' });
  document.querySelectorAll('[data-page]').forEach(a => {
    a.classList.toggle('active', a.dataset.page === name);
  });
  // Close mobile menu if open
  const menu = document.getElementById('mobileMenu');
  const btn  = document.getElementById('hamburger');
  if (menu && menu.classList.contains('open')) {
    menu.classList.remove('open');
    btn && btn.classList.remove('open');
    document.body.style.overflow = '';
  }
  initReveal();
}

/* ── SCROLL REVEAL ── */
function initReveal() {
  const els = document.querySelectorAll('.page.active .reveal');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
    });
  }, { threshold: .08 });
  els.forEach(el => { el.classList.remove('visible'); obs.observe(el); });
  setTimeout(() => els.forEach(el => {
    if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('visible');
  }), 80);
}

/* ============================================================
   FALLBACK DATA
   Used automatically if data.json can't load (e.g. file://)
   To update content, edit data.json instead — not this.
   ============================================================ */
const FALLBACK_DATA = {
  records: [
    { title: "Locomotive",                    artist: "FRAN",                    credit: "Co-Writer · Producer · Mix Engineer · Mastering · Background Vocals", image: "covers/Locomotive.jpg",             spotify: "https://open.spotify.com" },
    { title: "Rockstar Girlfriend",           artist: "Summer Joy",              credit: "Producer · Mix Engineer · Mastering",                                  image: "covers/rockstar-girlfriend.jpg",    spotify: "https://open.spotify.com" },
    { title: "The Long Way Home",             artist: "Kyra Baskin",             credit: "Producer · Mix Engineer · Mastering",                                  image: "covers/the-long-way-home.jpg",     spotify: "https://open.spotify.com" },
    { title: "Two Pint Taylor (In My Solitude)", artist: "Gus Benson",          credit: "Producer · Co-Mix · Mastering",                                        image: "covers/two-pint-taylor.jpg",       spotify: "https://open.spotify.com" },
    { title: "Wiley",                         artist: "gustafer",                credit: "Producer · Writer · Mix Engineer · Mastering",                         image: "covers/wiley.jpg",                  spotify: "https://open.spotify.com" },
    { title: "In the Cards",                  artist: "gustafer",                credit: "Producer · Writer · Mix Engineer · Mastering",                         image: "covers/in-the-cards.jpg",          spotify: "https://open.spotify.com" },
    { title: "View",                          artist: "e.fin",                   credit: "Co-Producer · Guitar · Background Vocals",                             image: "covers/view.jpg",                   spotify: "https://open.spotify.com" },
    { title: "The Mountains",                 artist: "Emma Rosenkranz",         credit: "Producer · Mix Engineer",                                              image: "covers/the-mountains.jpg",         spotify: "https://open.spotify.com" },
    { title: "Vampire Empire - Live",         artist: "Tabatha Rose",            credit: "Background Vocals · Guitar",                                           image: "covers/vampire-empire.jpg",        spotify: "https://open.spotify.com" },
    { title: "Who Else",                      artist: "aloe.401 and Gus Benson", credit: "Co-Producer · Writer",                                                 image: "covers/who-else.jpg",               spotify: "https://open.spotify.com" },
    { title: "Write Your Ticket",             artist: "Gus Benson",              credit: "Writer · Producer · Mix Engineer · Mastering",                         image: "covers/write-your-ticket.jpg",     spotify: "https://open.spotify.com" },
    { title: "Embarrassed",                   artist: "Gus Benson",              credit: "Writer · Producer · Mix Engineer · Mastering",                         image: "covers/embarrassed.jpg",           spotify: "https://open.spotify.com" },
    { title: "Luna",                          artist: "Gus Benson",              credit: "Writer · Producer · Mix Engineer · Mastering",                         image: "covers/luna.jpg",                   spotify: "https://open.spotify.com" },
    { title: "Designer Drugs",                artist: "Gus Benson",              credit: "Writer · Producer · Mix Engineer · Mastering",                         image: "covers/designer-drugs.jpg",        spotify: "https://open.spotify.com" },
    { title: "Halfway Out the Door",          artist: "Gus Benson",              credit: "Writer · Producer · Mix Engineer · Mastering",                         image: "covers/halfway-out-the-door.jpg",  spotify: "https://open.spotify.com" },
    { title: "Changing",                      artist: "Gus Benson",              credit: "Writer · Producer · Mix Engineer · Mastering",                         image: "covers/changing.jpg",               spotify: "https://open.spotify.com" },
    { title: "Until You Came",                artist: "Gus Benson",              credit: "Writer · Producer · Mix Engineer · Mastering",                         image: "covers/until-you-came.jpg",        spotify: "https://open.spotify.com" }
  ],
  videos: [
    { title: "Video Title", artist: "Artist Name", credit: "Producer · Director", youtubeId: "5KDrPzLPLa4", featured: true  },
    { title: "Video Title", artist: "Artist Name", credit: "Producer",            youtubeId: "JRkBTsvG4JU", featured: false },
    { title: "Video Title", artist: "Artist Name", credit: "Producer · Engineer", youtubeId: "yJ8vEb5I8pQ", featured: false },
    { title: "Video Title", artist: "Artist Name", credit: "Producer",            youtubeId: "zHe8R19DkCw", featured: false }
  ],
  wbru: [
    { youtubeId: "7mUD7sH0gYk", title: "WBRU Live Session" },
    { youtubeId: "wkbwMjjj94E", title: "WBRU Live Session" },
    { youtubeId: "x9ZACmFJ5O8", title: "WBRU Live Session" },
    { youtubeId: "K0ML0YLU46s", title: "WBRU Live Session" },
    { youtubeId: "RBWNZPdQsxc", title: "WBRU Live Session" },
    { youtubeId: "kwV3tHRSttE", title: "WBRU Live Session" }
  ]
};
