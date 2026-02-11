/* =========================================================
   common.js  —  ヘッダー/フッター読み込み + 共通UI初期化
   前提：common.js / header.html / footer.html は同じフォルダ
   ページ側：<script src="./common.js"></script> もしくは ../, ../../ など
   ========================================================= */
(() => {
  // ========= 設定 =========
  const ENABLE_LOG   = true;          // false にするとログ抑制
  const SHOW_FALLBACK = true;         // 読込失敗時に簡易表示を入れる
  const FETCH_OPTIONS = { cache: 'no-cache' };
  const PARTIALS_DIR  = "";           // 例: "partials/"（末尾スラッシュ必須）
  const SITE_BASE     = "/";          // 例: "/" または "/your-project/"

  // ========= 参照パス（common.js の場所基準） =========
  const thisScript =
    document.currentScript ||
    Array.from(document.scripts).find(s => s.src && /common\.js(?:\?.*)?$/i.test(s.src));
  const BASE_URL = thisScript ? new URL(".", thisScript.src) : new URL("./", location.href);

  // ========= Main =========
  document.addEventListener("DOMContentLoaded", async () => {
    log(`[common.js] BASE_URL=${BASE_URL} PARTIALS_DIR="${PARTIALS_DIR}" SITE_BASE="${SITE_BASE}"`);

    // 1) ヘッダー読込 → 初期化 → active付与（ヘッダーDOMに依存するため await）
    await include("#header", new URL(PARTIALS_DIR + "header.html", BASE_URL));

    // 保存テーマを反映（初期表示のちらつき抑制）
    const saved = localStorage.getItem("theme"); // "dark" or "light"
    if (saved === "dark") {
      document.body.classList.add("dark");
      document.body.classList.remove("light");
    } else if (saved === "light") {
      document.body.classList.add("light");
      document.body.classList.remove("dark");
    }

    initUIOnce();
    fixHeaderLinks(SITE_BASE);
    setActiveNav(SITE_BASE);

    // 2) フッターは並列でもOK（ここでは順次で見通し重視）
    await include("#footer", new URL(PARTIALS_DIR + "footer.html", BASE_URL));

    // 3) 完了イベント（必要ならページ側で listen 可能）
    document.dispatchEvent(new CustomEvent("partials:ready"));
  });

  // ========= include helper =========
  async function include(selector, url) {
    const host = document.querySelector(selector);
    if (!host) {
      warn(`[common.js] "${selector}" が見つかりません。スキップ`);
      return;
    }
    try {
      log("[common.js] fetch =>", url.href);
      const res = await fetch(url, FETCH_OPTIONS);
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      host.innerHTML = await res.text();
      log("[common.js] injected =>", selector);
    } catch (e) {
      error(`[common.js] include失敗: ${url.href}`, e);
      if (SHOW_FALLBACK) {
        host.innerHTML =
          selector === "#header"
            ? '<header style="padding:12px;background:#eee">Header failed to load</header>'
            : '<footer style="padding:12px;background:#eee">Footer failed to load</footer>';
      }
    }
  }

  // ========= active を自動付与 =========
  function setActiveNav(base = "/") {
    const header = document.querySelector("header");
    if (!header) return;

    // 現在パス（末尾スラッシュ揃え、index.html 除去）
    let now = normalizePath(location.pathname, base);

    const links = header.querySelectorAll(".nav__list a.link--nav");
    links.forEach(a => a.classList.remove("active"));

    let best = null;
    let bestLen = -1;
    links.forEach(a => {
      const raw = a.getAttribute("href");
      if (!raw || /^(https?:|mailto:|tel:|#)/i.test(raw)) return;
      const p = normalizePath(raw.startsWith("/") ? raw : base + raw, base);
      if (now.startsWith(p) && p.length > bestLen) {
        best = a;
        bestLen = p.length;
      }
    });

    // 最後に候補がなければ HOME を active
    if (!best) {
      best = Array.from(links).find(a => {
        const p = normalizePath(a.getAttribute("href") || "/", base);
        return p === normalizePath(base, base);
      });
    }
    best?.classList.add("active");
  }

  // ヘッダー内の相対リンクをベース付きの絶対パスに補正（任意）
  function fixHeaderLinks(base = "/") {
    const header = document.querySelector("header");
    if (!header) return;
    header.querySelectorAll("a[href]").forEach(a => {
      const href = a.getAttribute("href");
      if (!href || /^(https?:|mailto:|tel:|#)/i.test(href)) return;
      if (!href.startsWith("/")) {
        a.setAttribute("href", (base.endsWith("/") ? base : base + "/") + href.replace(/^\.\//, ""));
      }
    });
  }

  function normalizePath(path, base = "/") {
    // 絶対化
    let p = path;
    if (!p.startsWith("/")) p = (base.endsWith("/") ? base : base + "/") + p;
    // index.html を除去、末尾スラッシュ付与
    p = p.replace(/index\.html$/i, "");
    if (!p.endsWith("/")) p += "/";
    return p;
  }

  // ========= UI 初期化（1回だけ） =========
  function initUIOnce() {
    if (window.__uiInited) return;
    window.__uiInited = true;

    // テーマ切替（light/dark を排他的に）
    const themeBtn =
      document.getElementById("btn-theme")?.closest("button") ||
      document.getElementById("btn-theme");

    themeBtn?.addEventListener("click", () => {
      const isDark = document.body.classList.toggle("dark");
      document.body.classList.toggle("light", !isDark);

      // アイコン切替（moon <-> sun）
      const icon = document.getElementById("btn-theme");
      if (icon) {
        icon.classList.toggle("fa-moon", !isDark);
        icon.classList.toggle("fa-sun", isDark);
      }
    });

    // ハンバーガー
    const hamBtn  = document.querySelector(".nav__hamburger");
    const navList = document.querySelector(".nav__list");
    const navIcon = document.getElementById("btn-navigation");

    function setNavOpen(open){
      if (!navList) return;
      navList.classList.toggle("is-open", open);

      // アイコン切替（bars -> xmark）
      if (navIcon){
        navIcon.classList.toggle("fa-bars", !open);
        navIcon.classList.toggle("fa-xmark", open);  // Font Awesome 6
        // Font Awesome 5 を使っているなら ↓ を代わりに使う
        // navIcon.classList.toggle("fa-times", open);
      }

      // aria（アクセシビリティ）
      hamBtn?.setAttribute("aria-expanded", open ? "true" : "false");
    }

    hamBtn?.addEventListener("click", () => {
      const open = !navList?.classList.contains("is-open");
      setNavOpen(open);
    });

    // メニューのリンクを押したら閉じる
    navList?.querySelectorAll("a").forEach(a => a.addEventListener("click", () => setNavOpen(false)));

    // ESCで閉じる
    document.addEventListener("keydown", e => {
      if (e.key === "Escape") setNavOpen(false);
    }, { passive: true });

    // ヒーロースライダー
    const hero = document.querySelector(".hero");
    if (hero) initHero(hero);

    // トップへ戻る
    const toTop = document.querySelector("[data-to-top]");
    if (toTop) {
      const THRESHOLD = 300;
      const toggle = () => toTop.classList.toggle("show", window.scrollY > THRESHOLD);
      toggle();
      window.addEventListener("scroll", toggle, { passive: true });
      toTop.addEventListener("click", e => {
        e.preventDefault();
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
      });
    }
  }

  function initHero(hero) {
    const slides   = Array.from(hero.querySelectorAll(".hero__slide"));
    const prevBtn  = hero.querySelector(".hero__nav.prev");
    const nextBtn  = hero.querySelector(".hero__nav.next");
    const dotsWrap = hero.querySelector(".hero__dots");

    let idx = 0, timer = null;
    const INTERVAL_MS = 5000;

    if (dotsWrap) {
      slides.forEach((_, i) => {
        const b = document.createElement("button");
        b.type = "button";
        b.setAttribute("aria-label", `Go to slide ${i + 1}`);
        b.addEventListener("click", () => show(i, true));
        dotsWrap.appendChild(b);
      });
    }

    function show(i, byUser = false) {
      if (!slides.length) return;
      slides[idx]?.classList.remove("is-active");
      idx = (i + slides.length) % slides.length;
      slides[idx]?.classList.add("is-active");
      dotsWrap?.querySelectorAll("button").forEach((b, j) =>
        b.setAttribute("aria-current", j === idx ? "true" : "false")
      );
      if (byUser) { stop(); start(); }
    }
    function next()   { show(idx + 1); }
    function start()  { timer = setInterval(next, INTERVAL_MS); }
    function stop()   { if (timer) { clearInterval(timer); timer = null; } }

    nextBtn?.addEventListener("click", next);
    prevBtn?.addEventListener("click", () => show(idx - 1));
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start, { passive: true });

    show(0);
    start();
  }

  // ========= logs =========
  function log(...a){ if (ENABLE_LOG) console.log(...a); }
  function warn(...a){ if (ENABLE_LOG) console.warn(...a); }
  function error(...a){ console.error(...a); }
})();