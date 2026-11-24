/* market-signup.js: monthly market report email signup (form[data-mr]) -> Web3Forms -> billy@ -> Apps Script -> FUB
   tag "Market Report - <Area>". Used on the market report pages, /home-value and /sell.
   track.js sends the GA4 generate_lead event (lead_source=market_report_signup). */
(function () {
  document.querySelectorAll("form[data-mr]").forEach(function (f) {
    f.addEventListener("submit", async function (ev) {
      ev.preventDefault();
      var btn = f.querySelector('button[type="submit"]');
      var area = (f.querySelector('[name="market_area"]') || {}).value || "Las Vegas";
      btn.textContent = "Sending...";
      btn.disabled = true;
      var data = new FormData(f);
      data.append("access_key", "bae75215-22d5-4ca7-af41-10c7e775c21e");
      data.append("subject", "Source: williamcluxury.com - Market report signup - " + area);
      data.append("from_name", "williamcluxury.com");
      try {
        var res = await fetch("https://api.web3forms.com/submit", { method: "POST", body: data, headers: { Accept: "application/json" } });
        if (!res.ok) throw new Error("bad");
        f.querySelectorAll(".form-row, .form-group, .mr-check, button, .form-note").forEach(function (el) { el.style.display = "none"; });
        f.querySelector(".mr-done").hidden = false;
      } catch (e) {
        btn.textContent = "Try again";
        btn.disabled = false;
      }
    });
  });
})();
