/* ============================================================
   The Work — interactive video portfolio
   Real reels from williamcluxury.com/videos + /social.
   ============================================================ */

// Playable listing videos (local MP4s already in the repo).
const REELS = [
  { file: "oasis-63k",  views: "63,438", cap: "Backyard oasis — pool, glass doors & open living", link: "https://www.instagram.com/reel/Dav9bL4B9fy/" },
  { file: "monami-46k", views: "46,314", cap: "Strip-front lifestyle — the view that sells the city", link: "https://www.instagram.com/reel/Da03KOsSBfa/" },
  { file: "search-28k", views: "28,188", cap: "Half-acre lot with unobstructed Strip views", link: "https://www.instagram.com/reel/DZISrGqp3Q9/" },
  { file: "casita-22k", views: "22,451", cap: "Single-story casita home with a huge backyard", link: "https://www.instagram.com/reel/DallngGyTTl/" },
];

// Extra posts (thumbnails link out) — keeps the page full without more MP4s.
const MORE = [
  { thumb: "7651626676777962766", cap: "Waterfront living — unobstructed lake views", link: "https://www.tiktok.com/@williamc.luxury/video/7651626676777962766" },
  { thumb: "7647335352687987981", cap: "Luxury waterfront — California or Nevada?",  link: "https://www.tiktok.com/@williamc.luxury/video/7647335352687987981" },
  { thumb: "7611596342539848973", cap: "Live in a luxury hotel — that's home",       link: "https://www.tiktok.com/@williamc.luxury/video/7611596342539848973" },
];

const video   = document.getElementById("feature-video");
const frame   = video.closest(".feature-frame");
const playBtn = document.getElementById("feature-play");
const fmViews = document.getElementById("fm-views");
const fmCap   = document.getElementById("fm-cap");
const fmLink  = document.getElementById("fm-link");
const playlist = document.getElementById("playlist");

let current = 0;

/* ---- Build the playlist ---- */
REELS.forEach((r, i) => {
  const item = document.createElement("button");
  item.className = "pl-item" + (i === 0 ? " is-active" : "");
  item.type = "button";
  item.setAttribute("role", "listitem");
  item.innerHTML = `
    <img class="pl-thumb" src="../social/thumbs/${r.file}.jpg" alt="" loading="lazy" />
    <span class="pl-body">
      <span class="pl-rank">No. ${i + 1}</span>
      <span class="pl-cap">${r.cap}</span>
    </span>
    <span class="pl-views">${r.views}</span>`;
  item.addEventListener("click", () => select(i, true));
  playlist.appendChild(item);
});

/* ---- Select a reel into the featured player ---- */
function select(i, play) {
  current = i;
  const r = REELS[i];
  video.pause();
  video.querySelector("source")?.remove();
  const src = document.createElement("source");
  src.src = `../videos/${r.file}.mp4`;
  src.type = "video/mp4";
  video.appendChild(src);
  video.poster = `../social/thumbs/${r.file}.jpg`;
  video.load();

  fmViews.textContent = `${r.views} views`;
  fmCap.textContent = r.cap;
  fmLink.href = r.link;

  [...playlist.children].forEach((el, idx) => el.classList.toggle("is-active", idx === i));

  if (play) {
    video.muted = false;
    video.play().then(() => frame.classList.add("is-playing"))
                .catch(() => { /* if autoplay-with-sound is blocked, user taps play */ });
  }
}

/* ---- Big play button (plays current with sound) ---- */
playBtn.addEventListener("click", () => {
  video.muted = false;
  video.play().then(() => frame.classList.add("is-playing")).catch(() => {});
});
video.addEventListener("pause", () => frame.classList.remove("is-playing"));
video.addEventListener("play",  () => frame.classList.add("is-playing"));
video.addEventListener("ended", () => {                       // auto-advance the playlist
  const next = (current + 1) % REELS.length;
  select(next, true);
});

/* ---- Build the "More" grid ---- */
const moreGrid = document.getElementById("more-grid");
MORE.forEach((m) => {
  const a = document.createElement("a");
  a.className = "more-card";
  a.href = m.link; a.target = "_blank"; a.rel = "noopener";
  a.style.backgroundImage = `url('../social/tiktok/${m.thumb}.jpg')`;
  a.innerHTML = `<span class="mc-scrim"></span><span class="mc-cap">${m.cap}</span>`;
  moreGrid.appendChild(a);
});
