/* ============================================================
   listing.js — photo gallery, lightbox, and tour-request form
   for the property detail pages.
   ============================================================ */
(function () {
  const gallery = document.getElementById("pd-gallery");
  if (!gallery) return;

  const heroImg = gallery.querySelector(".pd-hero img");
  const thumbs = [...gallery.querySelectorAll(".pd-thumbs button[data-src]")];
  const photos = thumbs.map((b) => b.dataset.src);
  const alt = heroImg.getAttribute("alt");
  let index = 0;

  function show(i) {
    index = (i + photos.length) % photos.length;
    heroImg.src = photos[index];
    heroImg.alt = alt.replace(/photo \d+/, "photo " + (index + 1));
    thumbs.forEach((b, n) => b.setAttribute("aria-current", n === index ? "true" : "false"));
    if (lbImg) {
      lbImg.src = photos[index];
      lbCount.textContent = index + 1 + " / " + photos.length;
    }
  }

  thumbs.forEach((b, n) => b.addEventListener("click", () => show(n)));

  // ── Lightbox ──
  const lb = document.createElement("div");
  lb.className = "pd-lb";
  lb.innerHTML =
    '<button class="pd-lb-close" aria-label="Close">&times;</button>' +
    '<button class="pd-lb-prev" aria-label="Previous photo">&#8249;</button>' +
    '<div class="pd-lb-frame"><img alt="" /></div>' +
    '<button class="pd-lb-next" aria-label="Next photo">&#8250;</button>' +
    '<div class="pd-lb-count"></div>';
  document.body.appendChild(lb);
  const lbImg = lb.querySelector("img");
  const lbCount = lb.querySelector(".pd-lb-count");

  function openLb() {
    lb.classList.add("open");
    document.body.style.overflow = "hidden";
    show(index);
  }
  function closeLb() {
    lb.classList.remove("open");
    document.body.style.overflow = "";
  }

  gallery.querySelector(".pd-hero").addEventListener("click", openLb);
  const moreBtn = gallery.querySelector(".pd-more");
  if (moreBtn) moreBtn.addEventListener("click", openLb);

  lb.querySelector(".pd-lb-close").addEventListener("click", closeLb);
  lb.querySelector(".pd-lb-prev").addEventListener("click", () => show(index - 1));
  lb.querySelector(".pd-lb-next").addEventListener("click", () => show(index + 1));
  lb.addEventListener("click", (e) => {
    if (e.target === lb) closeLb();
  });
  document.addEventListener("keydown", (e) => {
    if (!lb.classList.contains("open")) return;
    if (e.key === "Escape") closeLb();
    if (e.key === "ArrowLeft") show(index - 1);
    if (e.key === "ArrowRight") show(index + 1);
  });

  show(0);

  // ── Tour request form ──
  const form = document.getElementById("tourForm");
  if (!form) return;
  const success = document.getElementById("tourSuccess");
  const content = document.getElementById("tour-form-content");

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const label = btn.textContent;
    btn.textContent = "Sending...";
    btn.disabled = true;
    const data = new FormData(form);
    data.append("access_key", "bae75215-22d5-4ca7-af41-10c7e775c21e");
    data.append("subject", "Tour request: " + form.dataset.property);
    data.append("from_name", "williamcluxury.com");
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });
      if (res.ok) {
        content.style.display = "none";
        success.style.display = "block";
        if (window.gtag) gtag("event", "tour_request", { property: form.dataset.property });
      } else {
        btn.textContent = "Try Again";
        btn.disabled = false;
      }
    } catch {
      btn.textContent = "Try Again";
      btn.disabled = false;
    }
  });
})();
