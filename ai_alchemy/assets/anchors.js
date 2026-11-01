/* Shareable section links for AI Alchemy.
 * Gives every h2/h3 inside <main> a stable id (made from its English text) and a small
 * link button. Clicking the button copies a link straight to that section.
 * Loaded automatically by translate.js before Google Translate runs, so ids always come
 * from the English headings and stay the same in every language.
 */
(function () {
  if (window.__aaAnchors) return;
  window.__aaAnchors = true;

  var root = document.querySelector("main") || document.querySelector("article");
  if (!root) return;

  var css =
    ".hd-anchor{position:relative}" +
    ".hd-anchor{scroll-margin-top:16px}" +
    ".hd-link{display:inline-flex;align-items:center;justify-content:center;width:1.4em;height:1.4em;margin-left:.3em;vertical-align:middle;" +
    "border-radius:6px;color:var(--muted,#56615B);opacity:0;text-decoration:none;transition:opacity .15s,background .15s;cursor:pointer}" +
    ".hd-link svg{width:.72em;height:.72em}" +
    ".hd-anchor:hover .hd-link,.hd-link:focus-visible{opacity:.85}" +
    ".hd-link:hover{opacity:1;background:var(--code,rgba(0,0,0,.06))}" +
    ".hd-link:focus-visible{outline:2px solid currentColor;outline-offset:1px}" +
    "@media (hover:none){.hd-link{opacity:.45}}" +
    ".hd-flash{animation:hdflash 1.6s ease-out}" +
    "@keyframes hdflash{0%{background:rgba(240,194,90,.45)}100%{background:transparent}}" +
    ".hd-toast{position:fixed;left:50%;bottom:24px;transform:translateX(-50%) translateY(12px);z-index:9999;" +
    "font:600 .9rem/1.2 var(--body,system-ui,sans-serif);color:#fff;background:#1B2320;padding:9px 16px;border-radius:999px;" +
    "box-shadow:0 6px 20px rgba(0,0,0,.25);opacity:0;pointer-events:none;transition:opacity .2s,transform .2s}" +
    ".hd-toast.on{opacity:1;transform:translateX(-50%) translateY(0)}";
  var st = document.createElement("style");
  st.textContent = css;
  document.head.appendChild(st);

  var icon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.5 1.5"/><path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.5-1.5"/></svg>';

  function slug(text) {
    return text.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase()
      .replace(/['’"“”]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60).replace(/-+$/, "");
  }

  // The link we hand out always points at the real blog, even when the reader is on
  // Google's translated copy (meifish-github-io.translate.goog).
  function shareUrl(id) {
    var host = location.hostname, m = host.match(/^(.+)\.translate\.goog$/);
    if (m) host = m[1].replace(/--/g, "\u0000").replace(/-/g, ".").replace(/\u0000/g, "-");
    return location.protocol + "//" + host + (m ? "" : (location.port ? ":" + location.port : "")) + location.pathname + "#" + id;
  }

  var toast;
  function say(msg) {
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "hd-toast";
      toast.setAttribute("role", "status");
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add("on");
    clearTimeout(say.t);
    say.t = setTimeout(function () { toast.classList.remove("on"); }, 1800);
  }

  function copy(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise(function (ok, bad) {
      var ta = document.createElement("textarea");
      ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy") ? ok() : bad(); } catch (e) { bad(e); }
      ta.remove();
    });
  }

  function flash(el) {
    el.classList.remove("hd-flash"); void el.offsetWidth; el.classList.add("hd-flash");
  }

  var used = {};
  document.querySelectorAll("[id]").forEach(function (el) { used[el.id] = true; });

  root.querySelectorAll("h2, h3").forEach(function (h, i) {
    if (h.closest("[data-no-anchor]")) return;
    if (!h.id) {
      var base = slug(h.textContent) || "section-" + (i + 1), id = base, n = 2;
      while (used[id]) id = base + "-" + n++;
      h.id = id;
    }
    used[h.id] = true;
    h.classList.add("hd-anchor");
    var a = document.createElement("a");
    a.className = "hd-link notranslate";
    a.setAttribute("translate", "no");
    a.href = "#" + h.id;
    a.title = "Copy link to this section";
    a.setAttribute("aria-label", "Copy link to this section");
    a.innerHTML = icon;
    a.addEventListener("click", function (e) {
      e.preventDefault();
      var url = shareUrl(h.id);
      history.replaceState(null, "", "#" + h.id);
      h.scrollIntoView({ behavior: "smooth", block: "start" });
      flash(h);
      copy(url).then(function () { say("Link copied! 🔗"); }, function () { say("Copy this link from the address bar"); });
    });
    h.appendChild(a);
  });

  // Ids are added after the page is parsed, so jump to the section ourselves,
  // then once more after images load and push things around.
  function jump() {
    var id = decodeURIComponent(location.hash.slice(1));
    var el = id && document.getElementById(id);
    if (el) el.scrollIntoView({ block: "start" });
    return el;
  }
  var target = jump();
  if (target) {
    flash(target);
    if (document.readyState !== "complete") window.addEventListener("load", jump, { once: true });
  }
})();
