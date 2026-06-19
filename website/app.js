/* SymptomsEase AI — "Clinical Editorial" render. EN/AR (RTL), dark/light. */
(function () {
  "use strict";

  // Replace with your hosted ZIP (e.g. a GitHub Releases URL) before publishing.
  var DOWNLOAD_URL = "SymptomsEaseAI-Windows.zip";

  var SHOTS = [
    { src: "assets/screens/01-empty.png" },
    { src: "assets/screens/02-analysis.png" },
    { src: "assets/screens/03-recording.png" },
  ];
  var ARCH = [
    { name: "Input", val: "2730", io: true },
    { name: "Dense·ReLU", val: "116" }, { name: "Dense·ReLU", val: "36" },
    { name: "Dense·ReLU", val: "116" }, { name: "Dense·ReLU", val: "84" },
    { name: "Dense·ReLU", val: "84" }, { name: "Softmax", val: "7", io: true },
  ];

  var PAGE = ["overview", "features", "screenshots", "how", "model", "dataset",
    "results", "stack", "install", "requirements", "faq", "disclaimer", "download"];
  var NAV = ["overview", "how", "model", "results", "screenshots", "download"];

  var UI = {
    en: {
      skip: "Skip to content", langName: "العربية",
      nav: { overview: "Overview", how: "How it works", model: "Model", results: "Results", screenshots: "Screenshots", download: "Download" },
      eyebrows: { overview: "About", features: "Features", how: "Pipeline", model: "Architecture", dataset: "Data", results: "Evaluation", stack: "Built with", install: "Get started", requirements: "Requirements", faq: "Questions", screenshots: "Interface" },
      screenshotsTitle: "Inside the app",
      screenshotsLead: "Real screens from the SymptomsEase AI desktop app.",
      shots: [
        { b: "Welcome", s: "The empty state — create a session to start a new screening.", alt: "App home screen: a sidebar of chat sessions and a centered ‘Start a new screening’ prompt." },
        { b: "Analysis", s: "Top-2 conditions with confidence bars after analyzing a transcript.", alt: "Analysis view showing Upper Respiratory Tract Infection at 86% and Rhinitis at 8% with violet-to-blue confidence bars." },
        { b: "Recording", s: "A live recording indicator while you speak.", alt: "The app recording: a red ‘Recording…’ status indicator above the transcript." },
      ],
      stats: [{ v: "7", k: "conditions" }, { v: "95%", k: "test accuracy" }, { v: "100%", k: "offline" }, { v: "0", k: "data sent" }],
      accuracyLabel: "Overall test accuracy", zoom: "View larger image",
      footerTagline: "Audio-based preliminary health screening — fully offline.",
      footerRights: "Built as a graduation project at the University of Jeddah.",
      footerDisclaimer: "Academic proof-of-concept. Not a medical device — not for real diagnosis. Always consult a licensed clinician.",
      reqMore: "System requirements",
    },
    ar: {
      skip: "تخطَّ إلى المحتوى", langName: "English",
      nav: { overview: "نظرة عامة", how: "كيف يعمل", model: "النموذج", results: "النتائج", screenshots: "لقطات", download: "تنزيل" },
      eyebrows: { overview: "حول", features: "المزايا", how: "المسار", model: "البنية", dataset: "البيانات", results: "التقييم", stack: "بُني باستخدام", install: "ابدأ", requirements: "المتطلبات", faq: "أسئلة", screenshots: "الواجهة" },
      screenshotsTitle: "من داخل التطبيق",
      screenshotsLead: "لقطات حقيقية من تطبيق SymptomsEase AI لسطح المكتب.",
      shots: [
        { b: "الترحيب", s: "الحالة الفارغة — أنشئ جلسة لبدء فحص جديد.", alt: "الشاشة الرئيسية للتطبيق: شريط جانبي للجلسات ودعوة لبدء فحص جديد في المنتصف." },
        { b: "التحليل", s: "الحالتان الأكثر احتمالًا مع أشرطة الثقة بعد تحليل النص.", alt: "عرض التحليل يُظهر التهاب الجهاز التنفسي العلوي بنسبة 86% والتهاب الأنف بنسبة 8% مع أشرطة ثقة بتدرّج بنفسجي إلى أزرق." },
        { b: "التسجيل", s: "مؤشّر تسجيل مباشر أثناء حديثك.", alt: "التطبيق أثناء التسجيل: مؤشّر حالة أحمر «جارٍ التسجيل» أعلى النص." },
      ],
      stats: [{ v: "7", k: "حالات" }, { v: "95%", k: "دقة الاختبار" }, { v: "100%", k: "دون اتصال" }, { v: "0", k: "بيانات مُرسَلة" }],
      accuracyLabel: "الدقة الإجمالية على الاختبار", zoom: "عرض الصورة بحجم أكبر",
      footerTagline: "فحص صحي أولي يعتمد على الصوت — دون اتصال بالإنترنت تمامًا.",
      footerRights: "بُني كمشروع تخرّج في جامعة جدة.",
      footerDisclaimer: "نموذج أكاديمي لإثبات المفهوم. ليس جهازًا طبيًا — وليس للتشخيص الفعلي. استشر دائمًا طبيبًا مرخّصًا.",
      reqMore: "متطلبات النظام",
    },
  };

  var AUTHOR_LINKS = [
    { label: "GitHub", href: "https://github.com/FerasAlhkodari/SymptomsEaseAi" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/feraswe/" },
    { label: "Email", href: "mailto:me@feraswe.com" },
    { label: "Portfolio", href: "https://feraswe.com" },
  ];

  // monochrome inline icons (inherit currentColor) — no colored emoji
  var ICONS = {
    moon: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>',
    sun: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
  };

  var state = {
    lang: localStorage.getItem("se_lang") || "en",
    theme: localStorage.getItem("se_theme") || "dark",
  };
  var lastFocus = null;

  function t() { return UI[state.lang]; }
  function sections() { return (window.CONTENT && window.CONTENT[state.lang]) || []; }
  function getSection(k) { return sections().filter(function (s) { return s.key === k; })[0]; }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function rmotion() { return window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches; }

  function el(tag, attrs, children) {
    var n = document.createElement(tag);
    attrs = attrs || {};
    Object.keys(attrs).forEach(function (k) {
      if (k === "class") n.className = attrs[k];
      else if (k === "html") n.innerHTML = attrs[k];
      else if (k === "text") n.textContent = attrs[k];
      else n.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (c) { if (c || c === 0) n.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return n;
  }
  function paragraphs(arr) { return (arr || []).map(function (p) { return el("p", { text: p }); }); }

  // ---- components ----
  function tiles(bullets, three) {
    return el("div", { class: "tiles" + (three ? " three" : "") }, (bullets || []).map(function (b, i) {
      return el("div", { class: "tile reveal" }, [
        el("span", { class: "ti", text: pad(i + 1) }),
        el("h3", { text: b.title }),
        b.desc ? el("p", { text: b.desc }) : null,
      ]);
    }));
  }
  function steps(arr) {
    return el("div", { class: "steps reveal" }, (arr || []).map(function (s, i) {
      var title = (s.title || "").replace(/^\s*\d+[.\)]\s*/, "");
      return el("div", { class: "step" }, [
        el("span", { class: "sn", text: pad(i + 1) }),
        el("div", {}, [el("h3", { text: title }), s.desc ? el("p", { text: s.desc }) : null]),
      ]);
    }));
  }
  function spec(bullets) {
    return el("ul", { class: "spec reveal" }, (bullets || []).map(function (b) {
      return el("li", {}, [el("b", { class: "label-text", text: b.title }), b.desc ? el("span", { text: b.desc }) : null]);
    }));
  }
  function table(tbl) {
    if (!tbl || !tbl.headers) return null;
    var kids = [];
    if (tbl.caption) kids.push(el("caption", { text: tbl.caption }));   // caption first (valid order)
    kids.push(el("thead", {}, [el("tr", {}, tbl.headers.map(function (h) { return el("th", { text: h }); }))]));
    kids.push(el("tbody", {}, (tbl.rows || []).map(function (r) {
      return el("tr", {}, r.map(function (c) { return el("td", { text: c }); }));
    })));
    return el("div", { class: "table-wrap reveal" }, [el("table", {}, kids)]);
  }
  function architecture() {
    var kids = [];
    ARCH.forEach(function (l, i) {
      kids.push(el("div", { class: "layer" + (l.io ? " io" : "") }, [
        el("div", { class: "lname", text: l.name }), el("div", { class: "lval", text: l.val }),
      ]));
      if (i < ARCH.length - 1) kids.push(el("div", { class: "arrow", text: "→" }));
    });
    return el("div", { class: "arch reveal" }, kids);
  }

  function railSection(key, num) {
    var sec = getSection(key);
    var ui = t();
    var main = [];

    if (key !== "screenshots" && sec) {
      main.push(el("h2", { class: "reveal", text: sec.title }));
      if (sec.lead) main.push(el("p", { class: "lead reveal", text: sec.lead }));
    }

    if (key === "screenshots") {
      main.push(el("h2", { class: "reveal", text: ui.screenshotsTitle }));
      main.push(el("p", { class: "lead reveal", text: ui.screenshotsLead }));
      main.push(el("div", { class: "gallery" }, SHOTS.map(function (sh, i) {
        var cap = ui.shots[i] || {};
        return el("figure", { class: "shot reveal" }, [
          el("button", { class: "shot-trigger", type: "button", "aria-label": ui.zoom + " — " + (cap.b || ""), "data-cap": cap.alt || cap.b || "" }, [
            el("img", { src: sh.src, alt: cap.alt || cap.b || "", loading: "lazy" }),
          ]),
          el("figcaption", {}, [el("b", { text: cap.b }), cap.s ? el("span", { text: cap.s }) : null]),
        ]);
      })));
    } else if (key === "overview") {
      paragraphs(sec.paragraphs).forEach(function (p) { main.push(p); });
    } else if (key === "features") {
      main.push(tiles(sec.bullets, false));
    } else if (key === "how") {
      main.push(steps(sec.steps));
    } else if (key === "model") {
      paragraphs(sec.paragraphs).forEach(function (p) { main.push(p); });
      main.push(architecture());
      main.push(spec(sec.bullets));
    } else if (key === "dataset") {
      paragraphs(sec.paragraphs).forEach(function (p) { main.push(p); });
      if (sec.table) main.push(table(sec.table));
      if (sec.bullets) main.push(spec(sec.bullets));
      if (sec.note) main.push(el("p", { class: "reveal", style: "color:var(--muted);font-size:.9rem", text: sec.note }));
    } else if (key === "results") {
      main.push(el("div", { class: "metric reveal" }, [
        el("span", { class: "big", text: "95%" }), el("span", { class: "lbl", text: ui.accuracyLabel }),
      ]));
      paragraphs(sec.paragraphs).forEach(function (p) { main.push(p); });
      if (sec.table) main.push(table(sec.table));
      if (sec.note) main.push(el("p", { class: "reveal", style: "color:var(--muted);font-size:.9rem", text: sec.note }));
    } else if (key === "stack") {
      main.push(tiles(sec.bullets, true));
    } else if (key === "install") {
      main.push(steps(sec.steps));
      if (sec.note) main.push(el("p", { class: "reveal", style: "color:var(--muted);font-size:.9rem", text: sec.note }));
      main.push(el("div", { class: "hero-cta reveal" }, [
        el("a", { class: "btn btn-primary", href: "#download" }, [sec.ctaPrimary || "Download"]),
        sec.ctaSecondary ? el("a", { class: "btn btn-link", href: "#requirements" }, [sec.ctaSecondary]) : null,
      ]));
    } else if (key === "requirements") {
      main.push(tiles(sec.bullets, false));
    } else if (key === "faq") {
      main.push(el("div", { class: "faq reveal" }, (sec.bullets || []).map(function (b) {
        return el("details", {}, [el("summary", { text: b.title }), el("p", { text: b.desc })]);
      })));
    }

    var rail = el("div", { class: "sec-rail reveal" }, [
      el("span", { class: "num", text: num }),
      el("span", { class: "label label-text", text: (ui.eyebrows[key] || "") }),
    ]);
    var altBg = (key === "features" || key === "dataset" || key === "faq");
    return el("section", { id: key, class: altBg ? "alt-bg" : "" }, [
      el("div", { class: "container" }, [el("div", { class: "section-grid" }, [rail, el("div", { class: "sec-main stack-gap" }, main)])]),
    ]);
  }

  function renderHero(sec) {
    var ui = t();
    var head;
    if (sec.lead && sec.lead.indexOf("—") > -1) {
      var parts = sec.lead.split("—");
      head = el("h1", { class: "reveal" }, [parts[0], el("em", { text: "—" + parts.slice(1).join("—") })]);
    } else {
      head = el("h1", { class: "reveal", text: sec.lead || sec.title });
    }
    var left = el("div", {}, [
      el("div", { class: "hero-kicker", text: sec.title }),
      head,
      (sec.paragraphs && sec.paragraphs[0]) ? el("p", { class: "reveal", text: sec.paragraphs[0] }) : null,
      el("div", { class: "hero-cta reveal" }, [
        el("a", { class: "btn btn-primary btn-lg", href: "#download" }, [sec.ctaPrimary || "Download"]),
        el("a", { class: "btn btn-ghost btn-lg", href: "#how" }, [sec.ctaSecondary || "How it works"]),
      ]),
    ]);
    var aside = el("div", { class: "hero-aside reveal" }, [
      el("img", { class: "hero-mark", src: "assets/logo.png", alt: "SymptomsEase AI logo", width: "78", height: "78" }),
      el("div", { class: "hero-stats" }, ui.stats.map(function (s) {
        return el("div", { class: "hero-stat" }, [el("span", { class: "v", text: s.v }), el("span", { class: "k", text: s.k })]);
      })),
      sec.note ? el("div", { class: "hero-note", text: sec.note }) : null,
    ]);
    return el("section", { class: "hero no-rule", id: "top" }, [el("div", { class: "container" }, [el("div", { class: "hero-grid" }, [left, aside])])]);
  }

  function renderDisclaimer(sec) {
    return el("section", { id: "disclaimer" }, [el("div", { class: "container" }, [
      el("div", { class: "disclaimer reveal" }, [
        el("div", { class: "dlabel label-text", text: (t().eyebrows.disclaimer || "Disclaimer") }),
        el("h2", { text: sec.title }),
      ].concat(paragraphs(sec.paragraphs))),
    ])]);
  }

  function renderDownload(sec, num) {
    var ui = t();
    var main = [
      el("h2", { class: "reveal", text: sec.title }),
      sec.lead ? el("p", { class: "lead reveal", text: sec.lead }) : null,
      el("div", { class: "hero-cta reveal" }, [
        el("a", { class: "btn btn-primary btn-lg", href: DOWNLOAD_URL, download: "" }, [
          el("span", { class: "btn-arrow", "aria-hidden": "true", text: "↓" }), sec.ctaPrimary || "Download for Windows",
        ]),
        sec.ctaSecondary ? el("a", { class: "btn btn-link", href: "#install" }, [sec.ctaSecondary]) : null,
      ]),
      sec.note ? el("div", { class: "download-meta reveal", text: sec.note }) : null,
    ];
    var rail = el("div", { class: "sec-rail reveal" }, [
      el("span", { class: "num", text: num }), el("span", { class: "label label-text", text: ui.eyebrows.download || "Download" }),
    ]);
    return el("section", { id: "download", class: "download" }, [
      el("div", { class: "container" }, [el("div", { class: "section-grid" }, [rail, el("div", { class: "sec-main stack-gap" }, main)])]),
    ]);
  }

  // make "disclaimer" eyebrow available
  UI.en.eyebrows.disclaimer = "Important"; UI.ar.eyebrows.disclaimer = "تنبيه";
  UI.en.eyebrows.download = "Get the app"; UI.ar.eyebrows.download = "احصل على التطبيق";

  function buildNav() {
    var nav = document.getElementById("mainNav"); nav.innerHTML = "";
    NAV.forEach(function (k) { nav.appendChild(el("a", { href: "#" + k, text: t().nav[k] })); });
  }
  function buildFooter() {
    var ui = t(), f = document.getElementById("footer"); f.innerHTML = "";
    f.appendChild(el("div", { class: "container" }, [
      el("div", { class: "footer-inner" }, [
        el("div", {}, [
          el("div", { class: "footer-brand" }, [el("img", { src: "assets/logo.png", alt: "" }), "SymptomsEase AI"]),
          el("p", { style: "margin:.6em 0 0;max-width:380px;color:var(--text-2)", text: ui.footerTagline }),
        ]),
        el("nav", { class: "footer-links", "aria-label": "Author links" }, AUTHOR_LINKS.map(function (l) {
          return el("a", { href: l.href, target: "_blank", rel: "noopener", text: l.label });
        })),
      ]),
      el("div", { class: "footer-meta" }, [
        el("div", { text: ui.footerRights }),
        el("div", { style: "margin-top:6px", text: ui.footerDisclaimer }),
      ]),
    ]));
  }

  function render() {
    document.documentElement.lang = state.lang;
    document.documentElement.dir = state.lang === "ar" ? "rtl" : "ltr";
    document.documentElement.setAttribute("data-theme", state.theme);
    document.querySelector(".theme-icon").innerHTML = state.theme === "dark" ? ICONS.moon : ICONS.sun;
    document.getElementById("langToggle").textContent = t().langName;
    document.querySelector(".skip-link").textContent = t().skip;

    var main = document.getElementById("main"); main.innerHTML = "";
    var hero = getSection("hero"); if (hero) main.appendChild(renderHero(hero));
    var num = 0;
    PAGE.forEach(function (k) {
      var node;
      if (k === "disclaimer") node = renderDisclaimer(getSection(k));
      else if (k === "download") { num++; node = renderDownload(getSection(k), pad(num)); }
      else { num++; node = railSection(k, pad(num)); }
      if (node) main.appendChild(node);
    });
    buildNav(); buildFooter(); observeReveal();
    document.getElementById("mainNav").classList.remove("open");
  }

  var io;
  function observeReveal() {
    if (io) io.disconnect();
    if (rmotion() || !("IntersectionObserver" in window)) {
      document.querySelectorAll(".reveal").forEach(function (n) { n.classList.add("in"); }); return;
    }
    io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -7% 0px", threshold: 0.04 });
    document.querySelectorAll(".reveal").forEach(function (n) { io.observe(n); });
  }

  function initEvents() {
    document.getElementById("themeToggle").addEventListener("click", function () {
      state.theme = state.theme === "dark" ? "light" : "dark";
      localStorage.setItem("se_theme", state.theme);
      document.documentElement.setAttribute("data-theme", state.theme);
      document.querySelector(".theme-icon").innerHTML = state.theme === "dark" ? ICONS.moon : ICONS.sun;
    });
    document.getElementById("langToggle").addEventListener("click", function () {
      state.lang = state.lang === "en" ? "ar" : "en";
      localStorage.setItem("se_lang", state.lang); render();
    });
    var menuToggle = document.getElementById("menuToggle");
    menuToggle.addEventListener("click", function () {
      var open = document.getElementById("mainNav").classList.toggle("open");
      menuToggle.setAttribute("aria-expanded", String(open));
      menuToggle.setAttribute("aria-label", open ? "Close menu" : "Menu");
    });
    document.getElementById("mainNav").addEventListener("click", function (e) {
      if (e.target.tagName === "A") { document.getElementById("mainNav").classList.remove("open"); menuToggle.setAttribute("aria-expanded", "false"); }
    });

    // accessible lightbox
    var lb = el("div", { class: "lightbox", id: "lightbox", role: "dialog", "aria-modal": "true", "aria-label": "Screenshot viewer" }, [
      el("button", { class: "lb-close", id: "lbClose", type: "button", "aria-label": "Close", text: "✕" }),
      el("img", { id: "lbImg", alt: "" }),
    ]);
    document.body.appendChild(lb);
    function closeLb() { lb.classList.remove("open"); if (lastFocus) { lastFocus.focus(); lastFocus = null; } }
    document.addEventListener("click", function (e) {
      var trig = e.target.closest ? e.target.closest(".shot-trigger") : null;
      if (trig) {
        var img = trig.querySelector("img");
        document.getElementById("lbImg").src = img.src;
        document.getElementById("lbImg").alt = trig.getAttribute("data-cap") || "";
        lastFocus = trig; lb.classList.add("open"); document.getElementById("lbClose").focus();
      } else if (e.target === lb || e.target.id === "lbClose" || e.target.id === "lbImg") { closeLb(); }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && lb.classList.contains("open")) closeLb();
      if (e.key === "Tab" && lb.classList.contains("open")) { e.preventDefault(); document.getElementById("lbClose").focus(); }
    });

    var toTop = document.getElementById("toTop");
    toTop.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: rmotion() ? "auto" : "smooth" }); });
    var header = document.getElementById("siteHeader");
    window.addEventListener("scroll", function () {
      toTop.classList.toggle("show", window.scrollY > 600);
      header.classList.toggle("scrolled", window.scrollY > 4);
    }, { passive: true });
  }

  document.addEventListener("DOMContentLoaded", function () {
    // optional ?lang=ar|en and ?theme=dark|light overrides (shareable links)
    try {
      var q = new URLSearchParams(location.search);
      var ql = q.get("lang"); if (ql === "ar" || ql === "en") { state.lang = ql; localStorage.setItem("se_lang", ql); }
      var qt = q.get("theme"); if (qt === "dark" || qt === "light") { state.theme = qt; localStorage.setItem("se_theme", qt); }
    } catch (e) {}
    initEvents();
    render();
  });
})();
