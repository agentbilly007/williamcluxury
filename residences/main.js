import * as THREE from "three";

/* ============================================================================
   1. RESIDENCE / DIGITAL-TWIN CONFIG   ← this is the only block you edit
   ----------------------------------------------------------------------------
   • No street addresses ever live here — only a code name + region, so nothing
     private is rendered publicly.
   • `provider` is "matterport", "treedis", or "iframe" (any full embed URL).
   • `embed` is the Matterport model id (the ?m= value), or a full URL for the
     other two providers.
   • `locked: true` means the tour stays gated until a valid access code is
     entered in the Private Access section.
   ============================================================================ */
const TOURS = [
  {
    name: "Residence 01",
    region: "Ridge — Henderson",
    spec: "5 Bed · 6,200 Sq Ft",
    provider: "matterport",
    embed: "SxQL3iGyoDo",          // ← Matterport model id (?m=SxQL3iGyoDo). Replace with yours.
    locked: true,
  },
  {
    name: "Residence 02",
    region: "Ridge — Summerlin",
    spec: "4 Bed · 4,800 Sq Ft",
    provider: "matterport",
    embed: "SxQL3iGyoDo",          // ← Replace with your model id
    locked: true,
  },
  {
    name: "Residence 03",
    region: "Waterfront — Lake Las Vegas",
    spec: "6 Bed · 8,100 Sq Ft",
    provider: "matterport",
    embed: "SxQL3iGyoDo",          // ← Replace with your model id, or use a Treedis URL
    locked: true,
  },
];

/* Access codes that unlock the collection.  Presentation-gating only — see
   README for how to move this behind a real server endpoint. */
const ACCESS_CODES = new Set(["WC-PRIVATE", "PREVIEW"]);

/* ============================================================================
   2. THREE.JS HERO  —  minimalist architectural wireframe + particle depth
   Optimised: capped DPR, fog-culled depth, and a render loop that fully STOPS
   when the tab is hidden, the hero is scrolled off-screen, or the user has
   requested reduced motion.
   ============================================================================ */
const canvas = document.getElementById("bg-canvas");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let renderer, scene, camera, grid, particles;
let running = false;
let heroVisible = true;
let tabVisible = true;
const pointer = { x: 0, y: 0, tx: 0, ty: 0 };  // t* = target, eased toward
let scrollN = 0;                                 // 0..1 progress through hero

function initScene() {
  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: false,               // points/lines don't need MSAA → cheaper
    alpha: false,
    powerPreference: "high-performance",
  });
  renderer.setClearColor(0x000000, 1);
  // Cap pixel ratio — the single biggest battery/perf lever on retina screens.
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));

  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x000000, 0.055);   // distant geometry melts into black

  camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
  camera.position.set(0, 1.1, 9);

  // — Architectural wireframe floor: a large grid receding into fog —
  grid = new THREE.GridHelper(60, 60, 0xffffff, 0xffffff);
  grid.material.transparent = true;
  grid.material.opacity = 0.14;
  grid.position.y = -2.2;
  scene.add(grid);

  // A second, finer grid overhead gives a faint "structure" ceiling.
  const ceiling = new THREE.GridHelper(60, 30, 0xffffff, 0xffffff);
  ceiling.material.transparent = true;
  ceiling.material.opacity = 0.05;
  ceiling.position.y = 6;
  scene.add(ceiling);

  // — Particle depth field: sparse white points drifting slowly —
  const COUNT = window.innerWidth < 700 ? 700 : 1400;   // fewer on mobile
  const positions = new Float32Array(COUNT * 3);
  for (let i = 0; i < COUNT; i++) {
    positions[i * 3 + 0] = (Math.random() - 0.5) * 40;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 16 + 2;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 40 - 6;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.02,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.6,
    depthWrite: false,
  });
  particles = new THREE.Points(geo, mat);
  scene.add(particles);

  resize();
}

function resize() {
  const w = window.innerWidth;
  const h = canvas.clientHeight || window.innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}

const clock = new THREE.Clock();

function frame() {
  if (!running) return;
  requestAnimationFrame(frame);

  const t = clock.getElapsedTime();

  // Ease pointer for buttery parallax (never snaps).
  pointer.x += (pointer.tx - pointer.x) * 0.045;
  pointer.y += (pointer.ty - pointer.y) * 0.045;

  // Camera: subtle mouse parallax + gentle scroll dolly through the hero.
  camera.position.x = pointer.x * 1.4;
  camera.position.y = 1.1 - pointer.y * 0.8 + scrollN * 0.6;
  camera.position.z = 9 - scrollN * 2.2;
  camera.lookAt(0, 1 + scrollN * 0.4, 0);

  // Slow, continuous drift — the "premium" quiet motion.
  grid.position.z = (t * 0.35) % 2;          // grid glides toward camera
  particles.rotation.y = t * 0.02;

  renderer.render(scene, camera);
}

function start() {
  if (running || prefersReducedMotion) return;
  running = true;
  clock.start();
  requestAnimationFrame(frame);
}
function stop() {
  running = false;
}
/* Only run when the tab is visible AND the hero is on screen. */
function evaluateRunState() {
  if (tabVisible && heroVisible && !prefersReducedMotion) start();
  else stop();
}

/* ---- Inputs & lifecycle ---- */
function onPointerMove(e) {
  const nx = (e.clientX / window.innerWidth) * 2 - 1;
  const ny = (e.clientY / window.innerHeight) * 2 - 1;
  pointer.tx = nx;
  pointer.ty = ny;
}
function onScroll() {
  const heroH = document.querySelector(".hero").offsetHeight || window.innerHeight;
  scrollN = Math.min(1, Math.max(0, window.scrollY / heroH));
}

let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(resize, 150);
});
document.addEventListener("visibilitychange", () => {
  tabVisible = document.visibilityState === "visible";
  evaluateRunState();
});
window.addEventListener("pointermove", onPointerMove, { passive: true });
window.addEventListener("scroll", onScroll, { passive: true });

/* Stop rendering entirely once the hero scrolls away (huge battery saver). */
const heroObserver = new IntersectionObserver(
  ([entry]) => { heroVisible = entry.isIntersecting; evaluateRunState(); },
  { threshold: 0.02 }
);

/* Boot the 3D scene. If WebGL is unavailable, the page degrades to pure black
   (still perfectly legible) — no error surfaced to the visitor. */
try {
  initScene();
  heroObserver.observe(document.querySelector(".hero"));
  if (prefersReducedMotion) renderer.render(scene, camera); // one static frame
  else evaluateRunState();
} catch (err) {
  console.warn("3D hero disabled:", err);
  canvas.style.display = "none";
}

/* ============================================================================
   3. RESIDENCE CARDS · ACCESS GATE · DIGITAL-TWIN VIEWER
   ============================================================================ */
let unlocked = false;
const grid_el = document.getElementById("tour-grid");
const viewer = document.getElementById("viewer");
const viewerSlot = document.getElementById("viewer-slot");
const viewerName = document.getElementById("viewer-name");
const viewerRegion = document.getElementById("viewer-region");

function buildEmbedURL(tour) {
  if (tour.provider === "matterport") {
    return `https://my.matterport.com/show/?m=${encodeURIComponent(tour.embed)}&play=1&qs=1`;
  }
  // treedis + generic iframe both pass a full URL through unchanged.
  return tour.embed;
}

function renderCards() {
  grid_el.innerHTML = "";
  TOURS.forEach((tour, i) => {
    const open = unlocked || !tour.locked;
    const card = document.createElement("button");
    card.className = "tour-card " + (open ? "is-unlocked" : "is-locked");
    card.type = "button";
    card.innerHTML = `
      <span class="tc-index">${String(i + 1).padStart(2, "0")} / ${String(TOURS.length).padStart(2, "0")}</span>
      <span class="tc-body">
        <span class="tc-region">${tour.region}</span>
        <span class="tc-name">${tour.name}</span>
        <span class="tc-spec">${tour.spec}</span>
        <span class="tc-state">
          <span class="tc-dot"></span>${open ? "Enter Tour" : "Locked — Private Access"}
        </span>
      </span>`;
    card.addEventListener("click", () => {
      if (open) openViewer(tour);
      else gotoAccess();
    });
    grid_el.appendChild(card);
  });
}

function openViewer(tour) {
  // iframe is created only now — the embed URL is never in the initial page DOM.
  viewerSlot.innerHTML = "";
  const iframe = document.createElement("iframe");
  iframe.src = buildEmbedURL(tour);
  iframe.setAttribute("allow", "fullscreen; xr-spatial-tracking; accelerometer; gyroscope; vr");
  iframe.setAttribute("allowfullscreen", "true");
  iframe.setAttribute("loading", "lazy");
  iframe.title = `${tour.name} — immersive tour`;
  viewerSlot.appendChild(iframe);

  viewerName.textContent = tour.name;
  viewerRegion.textContent = tour.region;
  viewer.hidden = false;
  viewer.scrollIntoView({ behavior: "smooth", block: "start" });
}

function closeViewer() {
  viewerSlot.innerHTML = "";   // removing the iframe stops the tour + frees memory
  viewer.hidden = true;
}

function gotoAccess() {
  const access = document.getElementById("access");
  access.scrollIntoView({ behavior: "smooth", block: "center" });
  setTimeout(() => document.getElementById("access-code").focus(), 500);
}

document.getElementById("viewer-close").addEventListener("click", closeViewer);

/* ---- Access gate ---- */
const form = document.getElementById("access-form");
const msg = document.getElementById("access-msg");
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const code = document.getElementById("access-code").value.trim().toUpperCase();
  if (ACCESS_CODES.has(code)) {
    unlocked = true;
    renderCards();
    msg.textContent = "Access granted. The full collection is now open.";
    msg.className = "access-msg ok";
    document.getElementById("tours").scrollIntoView({ behavior: "smooth" });
  } else {
    msg.textContent = "That code was not recognised. Please contact your advisor.";
    msg.className = "access-msg err";
  }
});

renderCards();
