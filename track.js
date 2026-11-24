/* track.js: GA4 events for AI-assistant visits and form leads (loaded by site.js and index.html).
   ai_referral   = visitor came from an AI assistant (referrer host or utm_source).
   generate_lead = a lead form was submitted (lead_source, ai_assistant, found_via params). */
(function () {
  if (window.__wclTrack) return;
  window.__wclTrack = true;
  function send(name, params) {
    try { if (typeof gtag === "function") gtag("event", name, params); } catch (e) {}
  }
  var AI = /(^|\.)(chatgpt\.com|chat\.openai\.com|openai\.com|perplexity\.ai|gemini\.google\.com|bard\.google\.com|claude\.ai|copilot\.microsoft\.com|you\.com)$/i;
  try {
    var src = "", m = (document.referrer || "").match(/^https?:\/\/([^\/?#]+)(\/[^?#]*)?/i);
    if (m) {
      var host = m[1].toLowerCase(), path = m[2] || "";
      if (AI.test(host) || (/(^|\.)bing\.com$/.test(host) && /^\/chat/i.test(path))) src = host + (/bing\.com$/.test(host) ? "/chat" : "");
    }
    if (!src) {
      var u = (new URLSearchParams(location.search).get("utm_source") || "").toLowerCase();
      if (u && AI.test(u.replace(/^https?:\/\//, "").split("/")[0])) src = u;
    }
    if (src) send("ai_referral", { ai_source: src, referrer_host: m ? m[1].toLowerCase() : "", landing_page: location.pathname });
  } catch (e) {}

  document.addEventListener("submit", function (e) {
    var f = e.target;
    if (!f || f.tagName !== "FORM") return;
    var ls = f.querySelector('[name="lead_source"]');
    if (!ls && !/web3forms/.test(f.getAttribute("action") || "")) return;
    var val = function (n) { var el = f.querySelector('[name="' + n + '"]'); return el ? String(el.value || "") : ""; };
    send("generate_lead", {
      lead_source: ls ? ls.value : location.pathname,
      ai_assistant: val("ai_assistant"),
      found_via: val("found_via"),
      page_path: location.pathname,
      transport_type: "beacon"
    });
  }, true);
})();
