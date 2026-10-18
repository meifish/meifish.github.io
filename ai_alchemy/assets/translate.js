/* Free "Translate" picker for AI Alchemy.
 * Uses Google's free website translator to translate the page in place.
 * If Google's script can't load, it opens Google's translated copy of the page instead.
 * Usage: put <span data-translate></span> where the picker should appear, then load this script.
 */
(function () {
  var LANGS = [
    ["en", "English"], ["es", "Español"], ["fr", "Français"], ["de", "Deutsch"],
    ["pt", "Português"], ["it", "Italiano"], ["zh-CN", "中文 (简体)"], ["zh-TW", "中文 (繁體)"],
    ["ja", "日本語"], ["ko", "한국어"], ["hi", "हिन्दी"], ["vi", "Tiếng Việt"], ["id", "Bahasa Indonesia"]
  ];

  var css =
    ".tr-pick{position:relative;display:inline-flex;align-items:center;gap:6px;font-family:var(--mono,ui-monospace,monospace);font-size:.82rem}" +
    ".tr-pick svg{width:15px;height:15px;flex:none;color:var(--basil,#2B7449);pointer-events:none;position:absolute;left:9px}" +
    ".tr-pick select{appearance:none;-webkit-appearance:none;font:inherit;color:var(--basil,#2B7449);background:transparent;border:1px solid var(--line,#D3DAD4);border-radius:999px;padding:3px 26px 3px 28px;cursor:pointer;max-width:160px}" +
    ".tr-pick select:hover{border-color:var(--basil,#2B7449)}" +
    ".tr-pick select:focus-visible{outline:2px solid var(--tomato,#C4402A);outline-offset:2px}" +
    ".tr-pick select option{color:#1B2320;background:#fff}" +
    ".tr-pick::after{content:'';position:absolute;right:11px;top:50%;width:6px;height:6px;border-right:1.5px solid var(--basil,#2B7449);border-bottom:1.5px solid var(--basil,#2B7449);transform:translateY(-70%) rotate(45deg);pointer-events:none}" +
    /* hide Google's own bar, tooltips and highlights so the page keeps its look */
    "body>.skiptranslate,.goog-te-banner-frame,#goog-gt-tt,.goog-te-balloon-frame,.goog-te-gadget,#gt-hidden{display:none!important}" +
    "body{top:0!important}" +
    ".goog-text-highlight{background:none!important;box-shadow:none!important}" +
    "font[style]{background:none!important;box-shadow:none!important}";
  var st = document.createElement("style");
  st.textContent = css;
  document.head.appendChild(st);

  function current() {
    var m = document.cookie.match(/(?:^|;\s*)googtrans=\/[^/]+\/([^;]+)/);
    return m ? decodeURIComponent(m[1]) : "en";
  }

  function clearCookie() {
    var host = location.hostname, parts = host.split(".");
    var domains = ["", host, "." + host];
    if (parts.length > 1) domains.push("." + parts.slice(-2).join("."));
    domains.forEach(function (d) {
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/" + (d ? "; domain=" + d : "");
    });
  }

  function fallback(code) {
    // Google's hosted translation proxy: meifish.github.io -> meifish-github-io.translate.goog
    var host = location.hostname.replace(/-/g, "--").replace(/\./g, "-");
    location.href = "https://" + host + ".translate.goog" + location.pathname +
      "?_x_tr_sl=en&_x_tr_tl=" + encodeURIComponent(code) + "&_x_tr_hl=" + encodeURIComponent(code) + location.hash;
  }

  function choose(code) {
    if (code === "en") { clearCookie(); location.reload(); return; }
    var combo = document.querySelector("select.goog-te-combo");
    if (!combo) { fallback(code); return; }
    combo.value = code;
    combo.dispatchEvent(new Event("change"));
  }

  var icon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/></svg>';
  var cur = current();
  document.querySelectorAll("[data-translate]").forEach(function (slot) {
    var wrap = document.createElement("label");
    wrap.className = "tr-pick notranslate";
    wrap.setAttribute("translate", "no");
    wrap.innerHTML = icon;
    var sel = document.createElement("select");
    sel.setAttribute("aria-label", "Translate this page");
    LANGS.forEach(function (l) {
      var o = document.createElement("option");
      o.value = l[0];
      o.textContent = l[0] === "en" ? "English" : l[1];
      if (l[0] === cur) o.selected = true;
      sel.appendChild(o);
    });
    sel.addEventListener("change", function () { choose(sel.value); });
    wrap.appendChild(sel);
    slot.replaceWith(wrap);
  });

  var holder = document.createElement("div");
  holder.id = "gt-hidden";
  document.body.appendChild(holder);
  window.googleTranslateElementInit = function () {
    new google.translate.TranslateElement({
      pageLanguage: "en",
      includedLanguages: LANGS.map(function (l) { return l[0]; }).join(","),
      autoDisplay: false
    }, "gt-hidden");
  };
  var s = document.createElement("script");
  s.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
  s.async = true;
  document.body.appendChild(s);
})();
