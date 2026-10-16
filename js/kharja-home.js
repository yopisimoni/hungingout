// Kharja – home layer in a travel-app style with a Moroccan identity:
// greeting + search, filter pills, a swipeable carousel of tall place cards,
// a full-screen place page, and a bottom tab bar on phones.
(function () {
  const H = {
    ar: { hi: n => "السلام، " + n + " 👋", hiGuest: "السلام 👋", sub: "فين نخرجو اليوم فالمغرب؟", search: "قلب على بلاصة…", pop: "الأكثر شعبية", near: "قريب مني", fresh: "جداد",
          popular: "بلايص مشهورين", all: "شوف الكل", overview: "نظرة عامة", details: "التفاصيل", perP: "للشخص", fits: "مناسب لـ", vibe: "الجو", hours: "الأوقات",
          add: "زيدها للخطة", added: "✓ فالخطة", menu: "📋 المنيو والعروض", reviews: "💬 الآراء", back: "رجوع", save: "حفظ", empty: "حتى بلاصة كتطابق البحث.",
          descs: { cafe: "قهوة فجو مزيان، مثالية للدردشة مع الصحاب.", food: "بلاصة للماكلة مع الجماعة، الأسعار مناسبة للمجموعة.", roof: "روف توب بمنظر، مثالي لغروب الشمس والسهرة.", act: "نشاط ممتع للمجموعة باش تبدلو الجو.", free: "بلاصة مجانية للتمشية والتصاور." },
          src: "سعر تقديري" },
    fr: { hi: n => "Salam, " + n + " 👋", hiGuest: "Salam 👋", sub: "On sort où aujourd'hui au Maroc ?", search: "Chercher un lieu…", pop: "Populaires", near: "Près de moi", fresh: "Nouveaux",
          popular: "Lieux populaires", all: "Tout voir", overview: "Aperçu", details: "Détails", perP: "par pers.", fits: "Idéal pour", vibe: "Ambiance", hours: "Horaires",
          add: "Ajouter au plan", added: "✓ Dans le plan", menu: "📋 Menu & offres", reviews: "💬 Avis", back: "Retour", save: "Enregistrer", empty: "Aucun lieu ne correspond à la recherche.",
          descs: { cafe: "Un café avec une belle ambiance, parfait pour discuter entre amis.", food: "Un endroit pour manger en groupe, à un prix raisonnable par personne.", roof: "Un rooftop avec vue, idéal pour le coucher du soleil et la soirée.", act: "Une activité fun pour changer d'air en groupe.", free: "Un lieu gratuit pour se balader et prendre des photos." },
          src: "Prix estimé" },
    en: { hi: n => "Salam, " + n + " 👋", hiGuest: "Salam 👋", sub: "Where are we going out in Morocco today?", search: "Search places…", pop: "Most popular", near: "Near me", fresh: "New",
          popular: "Popular places", all: "View all", overview: "Overview", details: "Details", perP: "per person", fits: "Good for", vibe: "Vibe", hours: "Hours",
          add: "Add to plan", added: "✓ In plan", menu: "📋 Menu & offers", reviews: "💬 Reviews", back: "Back", save: "Save", empty: "No place matches your search.",
          descs: { cafe: "A café with a good vibe, perfect for catching up with friends.", food: "A place to eat as a group, at a fair price per person.", roof: "A rooftop with a view, made for sunset and evenings.", act: "A fun group activity for a change of scene.", free: "A free spot to walk around and take photos." },
          src: "Estimated price" },
    es: { hi: n => "Salam, " + n + " 👋", hiGuest: "Salam 👋", sub: "¿Adónde salimos hoy en Marruecos?", search: "Buscar sitios…", pop: "Populares", near: "Cerca de mí", fresh: "Nuevos",
          popular: "Sitios populares", all: "Ver todo", overview: "Resumen", details: "Detalles", perP: "por persona", fits: "Ideal para", vibe: "Ambiente", hours: "Horario",
          add: "Añadir al plan", added: "✓ En el plan", menu: "📋 Carta y ofertas", reviews: "💬 Reseñas", back: "Volver", save: "Guardar", empty: "Ningún sitio coincide con la búsqueda.",
          descs: { cafe: "Un café con buen ambiente, perfecto para charlar con amigos.", food: "Un sitio para comer en grupo a buen precio por persona.", roof: "Una azotea con vistas, ideal para el atardecer.", act: "Una actividad divertida para cambiar de aires en grupo.", free: "Un sitio gratis para pasear y hacer fotos." },
          src: "Precio estimado" },
    pt: { hi: n => "Salam, " + n + " 👋", hiGuest: "Salam 👋", sub: "Onde vamos sair hoje em Marrocos?", search: "Procurar sítios…", pop: "Populares", near: "Perto de mim", fresh: "Novos",
          popular: "Sítios populares", all: "Ver tudo", overview: "Resumo", details: "Detalhes", perP: "por pessoa", fits: "Ideal para", vibe: "Ambiente", hours: "Horário",
          add: "Adicionar ao plano", added: "✓ No plano", menu: "📋 Menu e ofertas", reviews: "💬 Avaliações", back: "Voltar", save: "Guardar", empty: "Nenhum sítio corresponde à pesquisa.",
          descs: { cafe: "Um café com bom ambiente, perfeito para conversar com amigos.", food: "Um sítio para comer em grupo a um preço justo por pessoa.", roof: "Um rooftop com vista, ideal para o pôr do sol.", act: "Uma atividade divertida para mudar de ares em grupo.", free: "Um sítio grátis para passear e tirar fotos." },
          src: "Preço estimado" }
  };
  const h = k => (H[S.lang] || H.en)[k];

  /* Moroccan artwork per category (no photos needed): mint tea, saffron, majorelle night, sahara, atlas sky */
  const ART = {
    cafe: ["#1F7A63", "#0B3B31", "☕"], food: ["#D2691E", "#6B2A0E", "🍽️"], roof: ["#3B57E0", "#12163A", "🌆"],
    act: ["#E0A23B", "#7A3E0C", "🎯"], free: ["#2E8BC0", "#0B3C5D", "🌿"]
  };
  const ZELLIGE = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='56'%3E%3Cg fill='none' stroke='white' stroke-opacity='.16'%3E%3Crect x='17' y='17' width='22' height='22'/%3E%3Crect x='17' y='17' width='22' height='22' transform='rotate(45 28 28)'/%3E%3Ccircle cx='28' cy='28' r='6'/%3E%3C/g%3E%3C/svg%3E\")";
  function artCss(p) {
    const [a, b] = ART[p.c] || ART.free, seed = String(p.id).split("").reduce((s, c) => s + c.charCodeAt(0), 0);
    const x = 20 + seed % 60, y = 15 + (seed * 7) % 40;
    return `radial-gradient(circle at ${x}% ${y}%, rgb(255 255 255 / .28), transparent 42%), ${ZELLIGE}, linear-gradient(160deg, ${a}, ${b})`;
  }
  const emojiOf = p => (ART[p.c] || ART.free)[2];
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  const priceTxt = p => p.p[1] === 0 ? T[S.lang].free : rng(p.p[0], p.p[1]) + " " + T[S.lang].mad;

  let mode = "pop";
  function pool() {
    let list = P.filter(x => x.y === S.city && (!S.q || (x.n + " " + x.a).toLowerCase().includes(S.q)));
    if (mode === "fresh") list = list.slice().sort((a, b) => (b.venue ? 1 : 0) - (a.venue ? 1 : 0) || String(b.id).localeCompare(String(a.id)));
    else list = list.slice().sort((a, b) => (b.tg.includes("iconic") ? 1 : 0) - (a.tg.includes("iconic") ? 1 : 0) || b.p[1] - a.p[1]);
    return list;
  }

  /* ---------- Home top: greeting, search, pills, carousel ---------- */
  let built = false, q, rail, pills, hiEl, subEl, av;
  function build() {
    const top = document.getElementById("homeTop"); if (!top) return;
    const head = el("div", "ht-head"), txt = el("div");
    hiEl = el("h2", "ht-hi"); subEl = el("p", "ht-sub"); txt.append(hiEl, subEl);
    av = el("button", "ht-av"); av.type = "button"; av.onclick = () => { S.view = "me"; render(); scrollTo({ top: 0 }); };
    head.append(txt, av);
    const sb = el("label", "ht-search"); q = el("input"); q.type = "search"; q.id = "ht-q"; q.autocomplete = "off";
    const ic = el("span", "", "🔎"); ic.setAttribute("aria-hidden", "true");
    sb.append(ic, q);
    q.addEventListener("input", () => { S.q = q.value.trim().toLowerCase(); S.showN = 8; render(); });
    pills = el("div", "ht-pills");
    const sec = el("div", "ht-sec"); sec.append(el("h3", "ht-h3"), el("button", "ht-all"));
    sec.lastChild.onclick = () => document.getElementById("list").scrollIntoView({ behavior: "smooth", block: "start" });
    rail = el("div", "ht-rail"); rail.setAttribute("role", "list");
    top.append(head, sb, pills, sec, rail);
    built = true;
  }

  function renderTop() {
    if (!built) build(); if (!built) return;
    const name = S.user ? (S.user.displayName || S.user.email || "").split(/[ @]/)[0] : "";
    hiEl.textContent = name ? h("hi")(name) : h("hiGuest"); subEl.textContent = h("sub");
    av.textContent = name ? name.charAt(0).toUpperCase() : "👤"; av.setAttribute("aria-label", T[S.lang].signin || "Profile");
    q.placeholder = h("search"); q.setAttribute("aria-label", h("search"));
    document.querySelector(".hero").hidden = !!S.user;            // the big hero is for first-time visitors
    pills.innerHTML = "";
    [["pop", h("pop")], ["near", "📍 " + h("near")], ["fresh", "✨ " + h("fresh")]].forEach(([k, l]) => {
      const b = el("button", "ht-pill", l); b.type = "button"; b.setAttribute("aria-pressed", String(mode === k && k !== "near"));
      b.onclick = () => { if (k === "near") { if (window.SX) SX.nearMe(); return; } mode = k; render(); };
      pills.appendChild(b);
    });
    document.querySelector(".ht-h3").textContent = h("popular") + " · " + cityName(S.city);
    document.querySelector(".ht-all").textContent = h("all");
    const list = pool().slice(0, 10), keep = rail.scrollLeft;
    rail.innerHTML = "";
    if (!list.length) { rail.appendChild(el("p", "empty", h("empty"))); return; }
    list.forEach(p => rail.appendChild(bigCard(p)));
    rail.scrollLeft = keep;
  }

  function bigCard(p) {
    const c = el("article", "bc"); c.setAttribute("role", "listitem"); c.tabIndex = 0;
    c.style.background = artCss(p);
    const emo = el("span", "bc-emo", emojiOf(p)); emo.setAttribute("aria-hidden", "true");
    const fav = el("button", "bc-fav", window.SX && SX.isFav(p.id) ? "❤️" : "🤍"); fav.type = "button"; fav.setAttribute("aria-label", "♥");
    fav.onclick = e => { e.stopPropagation(); if (window.SX) SX.fav(p.id); };
    const glass = el("div", "bc-glass"), nm = el("b", "", p.n), row = el("div", "bc-row");
    row.append(el("span", "", "📍 " + (p.a || cityName(p.y))), el("span", "num", p.q === "owner" ? "✓ " + priceTxt(p) : priceTxt(p)));
    glass.append(nm, row);
    c.append(emo, fav, glass);
    const open = () => openDetail(p);
    c.onclick = open; c.onkeydown = e => { if (e.key === "Enter") open(); };
    return c;
  }

  /* ---------- Full-screen place page ---------- */
  let current = null;
  function openDetail(p) {
    current = p;
    const d = document.getElementById("detail"); d.innerHTML = "";
    const hero = el("div", "dt-hero"); hero.style.background = artCss(p);
    const back = el("button", "dt-btn dt-back", document.documentElement.dir === "rtl" ? "›" : "‹"); back.setAttribute("aria-label", h("back")); back.onclick = closeDetail;
    const save = el("button", "dt-btn dt-save", window.SX && SX.isFav(p.id) ? "❤️" : "🔖"); save.setAttribute("aria-label", h("save"));
    save.onclick = () => { if (window.SX) SX.fav(p.id); setTimeout(() => { save.textContent = window.SX && SX.isFav(p.id) ? "❤️" : "🔖"; }, 600); };
    const emo = el("span", "dt-emo", emojiOf(p)); emo.setAttribute("aria-hidden", "true");
    const glass = el("div", "dt-glass"), l = el("div"), r = el("div", "dt-price");
    l.append(el("h2", "", p.n), el("span", "", "📍 " + (p.a ? p.a + ", " : "") + cityName(p.y)));
    r.append(el("small", "", h("perP")), el("b", "num", priceTxt(p)));
    glass.append(l, r);
    hero.append(back, save, emo, glass);

    const body = el("div", "dt-body");
    const tabs = el("div", "dt-tabs"), t1 = el("button", "", h("overview")), t2 = el("button", "", h("details"));
    t1.setAttribute("aria-pressed", "true"); t2.setAttribute("aria-pressed", "false"); tabs.append(t1, t2);
    const stats = el("div", "dt-stats");
    const fits = p.max ? "≤ " + p.max : (p.c === "roof" || p.v === "luxe" ? "2–6" : "2–10");
    [["💸", priceTxt(p)], ["👥", h("fits") + " " + fits], ["✨", (T[S.lang].vibes[p.v] || p.v)]].forEach(([i, t]) => { const s = el("span", "dt-stat"); s.append(el("i", "", i), el("span", "num", t)); stats.appendChild(s); });
    const desc = el("p", "dt-desc", (p.data && p.data.desc) || h("descs")[p.c] || "");
    const tags = el("div", "tags"); (p.tg || []).forEach(tg => tags.appendChild(el("span", "tag", T[S.lang].tg[tg] || tg)));
    const det = el("div", "dt-det"); det.hidden = true;
    det.appendChild(el("p", "note", p.q === "owner" ? "✓ " + (typeof VERIF !== "undefined" ? (VERIF[S.lang] || VERIF.en) : "") : (p.q === "src" ? T[S.lang].src + (SRC[p.s] ? SRC[p.s].t : "") : h("src"))));
    if (p.data && p.data.hours) det.appendChild(el("p", "", "🕒 " + h("hours") + " : " + p.data.hours));
    t1.onclick = () => { t1.setAttribute("aria-pressed", "true"); t2.setAttribute("aria-pressed", "false"); det.hidden = true; stats.hidden = desc.hidden = tags.hidden = false; };
    t2.onclick = () => { t2.setAttribute("aria-pressed", "true"); t1.setAttribute("aria-pressed", "false"); det.hidden = false; stats.hidden = desc.hidden = tags.hidden = true; };
    const links = el("div", "dt-links");
    if (p.venue && window.VX && VX.openVenue) { const m = el("button", "btn ghost", h("menu")); m.onclick = () => VX.openVenue(p); links.appendChild(m); }
    if (window.SX) { const rv = el("button", "btn ghost", h("reviews")); rv.onclick = () => SX.openComments(String(p.id)); links.appendChild(rv); }
    body.append(tabs, stats, desc, tags, det, links);

    const cta = el("button", "dt-cta"); const inPlan = () => S.plan.map(String).includes(String(p.id));
    const label = () => { cta.textContent = inPlan() ? h("added") : h("add") + "  ➤"; };
    label();
    cta.onclick = () => { if (!inPlan()) { S.plan = [...S.plan, p.id]; if (window.burst) burst(["✨", "📍", "🎉"], innerWidth / 2, innerHeight - 80, 12); } else S.plan = S.plan.filter(x => String(x) !== String(p.id)); render(); label(); };
    d.append(hero, body, cta);
    d.hidden = false; document.body.style.overflow = "hidden";
    d.classList.remove("dt-in"); void d.offsetWidth; d.classList.add("dt-in");
    back.focus();
  }
  function closeDetail() { const d = document.getElementById("detail"); d.hidden = true; document.body.style.overflow = ""; current = null; }
  document.addEventListener("keydown", e => { if (e.key === "Escape" && current) closeDetail(); });

  /* list cards open the place page too */
  document.addEventListener("click", e => {
    const card = e.target.closest("#list .card, #overList .card");
    if (!card || e.target.closest("button,a")) return;
    const name = (card.querySelector(".name") || {}).textContent;
    const p = P.find(x => x.n === name && x.y === S.city); if (p) openDetail(p);
  });

  window.HX = { render: () => { const t = document.getElementById("tray"); if (t) t.classList.toggle("dock-empty", !S.plan.length); if (S.view === "explore") renderTop(); }, open: openDetail };
})();
