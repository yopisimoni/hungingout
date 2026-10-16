// Kharja – venues: owners list their place (menu, offers, hours, contacts) from a Pro space;
// approved ("live") venues appear in the app with an owner-verified price and a menu sheet.
// The admin (Firestore doc admins/{uid}) approves or rejects new venues and reads listing requests.
import { getApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore, doc, collection, query, where, limit, onSnapshot, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
  setDoc, increment, getCountFromServer, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const db = getFirestore(getApp());
const auth = getAuth(getApp());

const V = {
  ar: { pro: "فضاء المهنيين", open: "دخل لفضاء المهنيين", intro: "زيد البلاصة ديالك، حط المنيو والعروض، وتبّع شحال من واحد شافك وسجّلك.",
        sign: "سجّل الدخول باش تزيد البلاصة ديالك.", signBtn: "دخول / تسجيل", add: "+ زيد بلاصة", mine: "البلايص ديالي", none: "مازال ما زدتي حتى بلاصة.",
        st: { pending: "كتسنى المراجعة", live: "منشورة ✓", rejected: "مرفوضة" }, views: "شافو الفيش", adds: "زادوها للخطة", likes: "نصحو بيها", reviews: "تعليقات",
        edit: "تعديل", del: "حذف", delAsk: "متأكد؟ ضغط مرة أخرى", preview: "شوف كيف كتبان", save: "حفظ", saved: "✓ تحفظ", sentRev: "✓ تصيفطات للمراجعة. غادي تبان فالتطبيق ملي تتقبل.",
        f: { name: "اسم البلاصة", city: "المدينة", cat: "النوع", area: "الحي", vibe: "الجو", pmin: "أقل سعر للشخص (درهم)", pmax: "أعلى سعر للشخص (درهم)", desc: "وصف قصير", hours: "أوقات العمل", phone: "الهاتف", insta: "إنستغرام", maps: "رابط Google Maps", menu: "المنيو", offers: "العروض" },
        addItem: "+ زيد طبق", addOffer: "+ زيد عرض", item: "الطبق", price: "السعر", offerT: "العرض", offerD: "التفاصيل", rm: "حيد",
        menuBtn: "📋 المنيو والعروض", noMenu: "المنيو مازال ما تزادش.", call: "اتصل", hoursL: "الأوقات", verified: "✓ مول البلاصة أكد المعلومات",
        mod: "المراجعة (Admin)", modNone: "حتى بلاصة كتسنى.", approve: "قبول", reject: "رفض", reqs: "طلبات الإدراج", bad: "عمّر الاسم والأسعار بشكل صحيح.", err: "وقع مشكل. عاود." },
  fr: { pro: "Espace pro", open: "Ouvrir l'espace pro", intro: "Ajoutez votre lieu, publiez votre menu et vos offres, et suivez combien de personnes vous voient et vous ajoutent.",
        sign: "Connectez-vous pour ajouter votre lieu.", signBtn: "Connexion / Inscription", add: "+ Ajouter un lieu", mine: "Mes lieux", none: "Vous n'avez encore ajouté aucun lieu.",
        st: { pending: "En cours de vérification", live: "En ligne ✓", rejected: "Refusé" }, views: "Vues de la fiche", adds: "Ajouts au plan", likes: "Recommandations", reviews: "Avis",
        edit: "Modifier", del: "Supprimer", delAsk: "Sûr ? Touchez encore", preview: "Aperçu", save: "Enregistrer", saved: "✓ Enregistré", sentRev: "✓ Envoyé pour vérification. Votre lieu apparaîtra dans l'app une fois validé.",
        f: { name: "Nom du lieu", city: "Ville", cat: "Type", area: "Quartier", vibe: "Ambiance", pmin: "Prix min. par personne (DH)", pmax: "Prix max. par personne (DH)", desc: "Courte description", hours: "Horaires", phone: "Téléphone", insta: "Instagram", maps: "Lien Google Maps", menu: "Menu", offers: "Offres" },
        addItem: "+ Ajouter un plat", addOffer: "+ Ajouter une offre", item: "Plat", price: "Prix", offerT: "Offre", offerD: "Détails", rm: "Retirer",
        menuBtn: "📋 Menu & offres", noMenu: "Le menu n'a pas encore été ajouté.", call: "Appeler", hoursL: "Horaires", verified: "✓ Infos confirmées par le lieu",
        mod: "Modération (admin)", modNone: "Aucun lieu en attente.", approve: "Valider", reject: "Refuser", reqs: "Demandes de référencement", bad: "Renseignez le nom et des prix valides.", err: "Un problème est survenu. Réessayez." },
  en: { pro: "Pro space", open: "Open the pro space", intro: "Add your place, publish your menu and offers, and see how many people view and plan with you.",
        sign: "Sign in to add your place.", signBtn: "Sign in / Sign up", add: "+ Add a place", mine: "My places", none: "You haven't added a place yet.",
        st: { pending: "Under review", live: "Live ✓", rejected: "Rejected" }, views: "Page views", adds: "Added to plans", likes: "Recommendations", reviews: "Reviews",
        edit: "Edit", del: "Delete", delAsk: "Sure? Tap again", preview: "Preview", save: "Save", saved: "✓ Saved", sentRev: "✓ Sent for review. Your place will show in the app once approved.",
        f: { name: "Place name", city: "City", cat: "Type", area: "Neighbourhood", vibe: "Vibe", pmin: "Min. price per person (MAD)", pmax: "Max. price per person (MAD)", desc: "Short description", hours: "Opening hours", phone: "Phone", insta: "Instagram", maps: "Google Maps link", menu: "Menu", offers: "Offers" },
        addItem: "+ Add item", addOffer: "+ Add offer", item: "Item", price: "Price", offerT: "Offer", offerD: "Details", rm: "Remove",
        menuBtn: "📋 Menu & offers", noMenu: "The menu hasn't been added yet.", call: "Call", hoursL: "Hours", verified: "✓ Details confirmed by the venue",
        mod: "Moderation (admin)", modNone: "No places waiting.", approve: "Approve", reject: "Reject", reqs: "Listing requests", bad: "Add the name and valid prices.", err: "Something went wrong. Try again." },
  es: { pro: "Espacio pro", open: "Abrir el espacio pro", intro: "Añade tu local, publica tu carta y ofertas, y mira cuánta gente te ve y te añade a sus planes.",
        sign: "Inicia sesión para añadir tu local.", signBtn: "Entrar / Registrarse", add: "+ Añadir un local", mine: "Mis locales", none: "Aún no has añadido ningún local.",
        st: { pending: "En revisión", live: "Publicado ✓", rejected: "Rechazado" }, views: "Visitas a la ficha", adds: "Añadido a planes", likes: "Recomendaciones", reviews: "Reseñas",
        edit: "Editar", del: "Borrar", delAsk: "¿Seguro? Toca otra vez", preview: "Vista previa", save: "Guardar", saved: "✓ Guardado", sentRev: "✓ Enviado a revisión. Tu local aparecerá cuando se apruebe.",
        f: { name: "Nombre del local", city: "Ciudad", cat: "Tipo", area: "Barrio", vibe: "Ambiente", pmin: "Precio mín. por persona (MAD)", pmax: "Precio máx. por persona (MAD)", desc: "Descripción corta", hours: "Horario", phone: "Teléfono", insta: "Instagram", maps: "Enlace de Google Maps", menu: "Carta", offers: "Ofertas" },
        addItem: "+ Añadir plato", addOffer: "+ Añadir oferta", item: "Plato", price: "Precio", offerT: "Oferta", offerD: "Detalles", rm: "Quitar",
        menuBtn: "📋 Carta y ofertas", noMenu: "La carta aún no se ha añadido.", call: "Llamar", hoursL: "Horario", verified: "✓ Datos confirmados por el local",
        mod: "Moderación (admin)", modNone: "Ningún local pendiente.", approve: "Aprobar", reject: "Rechazar", reqs: "Solicitudes", bad: "Añade el nombre y precios válidos.", err: "Algo salió mal. Inténtalo de nuevo." },
  pt: { pro: "Espaço pro", open: "Abrir o espaço pro", intro: "Adiciona o teu local, publica o menu e as ofertas, e vê quantas pessoas te veem e te adicionam aos planos.",
        sign: "Inicia sessão para adicionar o teu local.", signBtn: "Entrar / Registar", add: "+ Adicionar local", mine: "Os meus locais", none: "Ainda não adicionaste nenhum local.",
        st: { pending: "Em revisão", live: "Publicado ✓", rejected: "Recusado" }, views: "Visitas à ficha", adds: "Adicionado a planos", likes: "Recomendações", reviews: "Avaliações",
        edit: "Editar", del: "Apagar", delAsk: "Tens a certeza? Toca outra vez", preview: "Pré-visualizar", save: "Guardar", saved: "✓ Guardado", sentRev: "✓ Enviado para revisão. O teu local aparece quando for aprovado.",
        f: { name: "Nome do local", city: "Cidade", cat: "Tipo", area: "Bairro", vibe: "Ambiente", pmin: "Preço mín. por pessoa (MAD)", pmax: "Preço máx. por pessoa (MAD)", desc: "Descrição curta", hours: "Horário", phone: "Telefone", insta: "Instagram", maps: "Link do Google Maps", menu: "Menu", offers: "Ofertas" },
        addItem: "+ Adicionar prato", addOffer: "+ Adicionar oferta", item: "Prato", price: "Preço", offerT: "Oferta", offerD: "Detalhes", rm: "Remover",
        menuBtn: "📋 Menu e ofertas", noMenu: "O menu ainda não foi adicionado.", call: "Ligar", hoursL: "Horário", verified: "✓ Dados confirmados pelo local",
        mod: "Moderação (admin)", modNone: "Nenhum local pendente.", approve: "Aprovar", reject: "Recusar", reqs: "Pedidos de listagem", bad: "Indica o nome e preços válidos.", err: "Algo correu mal. Tenta de novo." }
};
const v = k => (V[S.lang] || V.en)[k];
const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
const toast = t => { const e = $("toast"); e.textContent = t; e.hidden = false; clearTimeout(toast._t); toast._t = setTimeout(() => e.hidden = true, 2600); };
const cn = k => CITIES.some(c => c[0] === k) ? cityName(k) : String(k || "");
const safeUrl = u => /^https:\/\//i.test(u || "") ? u : "";

/* ---------- Live venues join the catalogue ---------- */
const liveIds = new Set();
onSnapshot(query(collection(db, "venues"), where("status", "==", "live"), limit(300)), qs => {
  for (let i = P.length - 1; i >= 0; i--) if (P[i].venue) P.splice(i, 1);
  liveIds.clear();
  qs.forEach(d => {
    const x = d.data(); liveIds.add(d.id);
    P.push({ id: "v_" + d.id, vid: d.id, venue: true, y: x.city, n: x.name, a: x.area || cn(x.city), c: x.cat, v: x.vibe || "casual",
             p: [x.priceMin, x.priceMax], q: "owner", tg: [], data: x });
  });
  render();
}, () => {});

/* ---------- Counters (views, plan adds) ---------- */
const bumpStat = (vid, field) => setDoc(doc(db, "venueStats", vid), { [field]: increment(1) }, { merge: true }).catch(() => {});
let prevPlan = new Set();
function trackPlanAdds() {
  const now = new Set(S.plan.map(String));
  if (S.view === "explore" && !S.shared) now.forEach(id => { if (!prevPlan.has(id) && id.startsWith("v_")) bumpStat(id.slice(2), "planAdds"); });
  prevPlan = now;
}

/* ---------- Venue sheet for users ---------- */
function decorate(card, p) {
  if (!p.venue) return;
  const b = el("button", "btn ghost", v("menuBtn")); b.style.gridColumn = "1 / -1"; b.style.justifySelf = "start";
  b.onclick = () => openVenue(p);
  card.appendChild(b);
}
function openVenue(p) {
  const x = p.data, sh = $("cmSheet"); sh.innerHTML = "";
  bumpStat(p.vid, "views");
  sh.append(el("h3", "", x.name), el("span", "vbadge", v("verified")));
  sh.appendChild(el("small", "note num", cn(x.city) + (x.area ? " · " + x.area : "") + " · " + rng(x.priceMin, x.priceMax) + " " + T[S.lang].mad + " " + T[S.lang].perP));
  if (x.desc) sh.appendChild(el("p", "", x.desc));
  (x.offers || []).forEach(o => { const d = el("div", "offer"); d.append(el("b", "", "🎁 " + o.t), el("span", "", o.d || "")); sh.appendChild(d); });
  sh.appendChild(el("span", "lbl", v("f").menu));
  if (!(x.menu || []).length) sh.appendChild(el("p", "empty", v("noMenu")));
  else { const ml = el("div", "menu-list"); x.menu.forEach(i => { const r = el("div"); r.append(el("span", "", i.n), el("b", "num", fmt(i.p) + " " + T[S.lang].mad)); ml.appendChild(r); }); sh.appendChild(ml); }
  if (x.hours) sh.appendChild(el("p", "note", "🕒 " + v("hoursL") + " : " + x.hours));
  const acts = el("div", "acts"); acts.style.cssText = "display:flex;gap:8px;flex-wrap:wrap";
  if (x.phone) acts.appendChild(el("span", "chip-place", "📞 " + x.phone));
  if (x.insta) { const a = el("a", "btn ghost", "📸 " + x.insta); a.href = "https://instagram.com/" + encodeURIComponent(x.insta.replace(/^@/, "")); a.target = "_blank"; a.rel = "noopener"; acts.appendChild(a); }
  if (safeUrl(x.maps)) { const a = el("a", "btn ghost", "🗺️ Maps"); a.href = safeUrl(x.maps); a.target = "_blank"; a.rel = "noopener"; acts.appendChild(a); }
  const add = el("button", "btn cta", S.plan.map(String).includes(p.id) ? T[S.lang].added : T[S.lang].add);
  add.onclick = () => { if (!S.plan.map(String).includes(p.id)) { S.plan = [...S.plan, p.id]; } $("cmBg").hidden = true; S.view = "explore"; render(); };
  acts.appendChild(add); sh.appendChild(acts);
  const close = el("button", "link", T[S.lang].auClose); close.onclick = () => $("cmBg").hidden = true; sh.appendChild(close);
  $("cmBg").hidden = false;
}

/* ---------- Pro space ---------- */
let myVenues = null, mySub = null, myFor = null, isAdmin = false, pending = [], pendSub = null, reqs = null, kpi = {}, delArm = null;

onAuthStateChanged(auth, async user => {
  if (mySub) { mySub(); mySub = null; } if (pendSub) { pendSub(); pendSub = null; }
  myVenues = null; isAdmin = false; pending = []; reqs = null; myFor = user ? user.uid : null;
  if (!user) return render();
  mySub = onSnapshot(query(collection(db, "venues"), where("owner", "==", user.uid), limit(20)), qs => {
    myVenues = []; qs.forEach(d => myVenues.push({ id: d.id, ...d.data() })); myVenues.forEach(loadKpi); render();
  }, () => { myVenues = []; render(); });
  try { isAdmin = (await getDoc(doc(db, "admins", user.uid))).exists(); } catch (e) { isAdmin = false; }
  if (isAdmin) {
    pendSub = onSnapshot(query(collection(db, "venues"), where("status", "==", "pending"), limit(50)), qs => { pending = []; qs.forEach(d => pending.push({ id: d.id, ...d.data() })); render(); }, () => {});
    try { const qs = await getDocs(query(collection(db, "listingRequests"), limit(50))); reqs = []; qs.forEach(d => reqs.push(d.data())); } catch (e) { reqs = []; }
  }
  render();
});

async function loadKpi(vn) {
  if (kpi[vn.id]) return;
  kpi[vn.id] = { views: 0, planAdds: 0, likes: 0, reviews: 0 };
  try {
    const [s, l, c] = await Promise.all([
      getDoc(doc(db, "venueStats", vn.id)),
      getCountFromServer(collection(db, "places", "v_" + vn.id, "likes")),
      getCountFromServer(collection(db, "places", "v_" + vn.id, "comments"))
    ]);
    const sd = s.exists() ? s.data() : {};
    kpi[vn.id] = { views: sd.views || 0, planAdds: sd.planAdds || 0, likes: l.data().count, reviews: c.data().count };
    render();
  } catch (e) { /* stats are optional */ }
}

function field(label, input) { const w = el("div", "fld2"), l = el("label", "", label); input.id = input.id || "vf-" + Math.random().toString(36).slice(2, 8); l.htmlFor = input.id; w.append(l, input); return w; }
function inp(type, val, max) { const i = el("input"); i.type = type; if (val != null) i.value = val; if (max) i.maxLength = max; return i; }
function sel(opts, val) { const s = el("select"); opts.forEach(([k, l]) => { const o = el("option", "", l); o.value = k; s.appendChild(o); }); if (val) s.value = val; return s; }

function openEditor(vn) {
  const x = vn || { name: "", city: S.city, cat: "cafe", area: "", vibe: "casual", priceMin: 30, priceMax: 80, desc: "", hours: "", phone: "", insta: "", maps: "", menu: [], offers: [] };
  const F = v("f"), sh = $("cmSheet"); sh.innerHTML = "";
  sh.appendChild(el("h3", "", vn ? v("edit") + " · " + x.name : v("add").replace("+ ", "")));
  const f = el("form", "vform"); f.noValidate = true;
  const name = inp("text", x.name, 80), city = sel(CITIES.map(([k]) => [k, cn(k)]), x.city);
  const cat = sel(Object.entries(T[S.lang].cats).filter(([k]) => k !== "all" && k !== "free"), x.cat);
  const area = inp("text", x.area, 60), vibe = sel(Object.entries(T[S.lang].vibes).filter(([k]) => k !== "any"), x.vibe);
  const pmin = inp("number", x.priceMin), pmax = inp("number", x.priceMax); pmin.inputMode = pmax.inputMode = "numeric"; pmin.min = pmax.min = 0;
  const desc = el("textarea"); desc.maxLength = 600; desc.value = x.desc || "";
  const hours = inp("text", x.hours, 120), phone = inp("tel", x.phone, 30), insta = inp("text", x.insta, 60), maps = inp("url", x.maps, 300);
  hours.placeholder = "09:00 – 23:00"; insta.placeholder = "@moncafe"; maps.placeholder = "https://maps.app.goo.gl/…";
  const g = (a, b) => { const d = el("div", "g2"); d.append(a, b); return d; };
  f.append(field(F.name, name), g(field(F.city, city), field(F.cat, cat)), g(field(F.area, area), field(F.vibe, vibe)),
           g(field(F.pmin, pmin), field(F.pmax, pmax)), field(F.desc, desc), field(F.hours, hours), g(field(F.phone, phone), field(F.insta, insta)), field(F.maps, maps));

  const menu = el("div", "lines");
  const addLine = (n = "", p = "") => { const r = el("div", "ln"); const a = inp("text", n, 60), b = inp("number", p); a.placeholder = v("item"); b.placeholder = v("price"); b.inputMode = "numeric";
    a.setAttribute("aria-label", v("item")); b.setAttribute("aria-label", v("price"));
    const rm = el("button", "linkbtn", v("rm")); rm.type = "button"; rm.onclick = () => r.remove(); r.append(a, b, rm); menu.appendChild(r); };
  (x.menu || []).forEach(i => addLine(i.n, i.p));
  const am = el("button", "btn ghost", v("addItem")); am.type = "button"; am.onclick = () => menu.children.length < 40 && addLine();
  const offers = el("div", "lines");
  const addOffer = (t = "", d = "") => { const r = el("div", "ln off"); const a = inp("text", t, 60), b = inp("text", d, 140); a.placeholder = v("offerT"); b.placeholder = v("offerD");
    a.setAttribute("aria-label", v("offerT")); b.setAttribute("aria-label", v("offerD"));
    const rm = el("button", "linkbtn", v("rm")); rm.type = "button"; rm.onclick = () => r.remove(); r.append(a, b, rm); offers.appendChild(r); };
  (x.offers || []).forEach(o => addOffer(o.t, o.d));
  const ao = el("button", "btn ghost", v("addOffer")); ao.type = "button"; ao.onclick = () => offers.children.length < 6 && addOffer();
  f.append(el("span", "lbl", "📋 " + F.menu), menu, am, el("span", "lbl", "🎁 " + F.offers), offers, ao);

  const msg = el("p", "note"), save = el("button", "btn cta", v("save")); save.type = "submit";
  f.append(save, msg);
  f.onsubmit = async e => {
    e.preventDefault();
    const lo = parseInt(pmin.value, 10), hi = parseInt(pmax.value, 10);
    if (!name.value.trim() || isNaN(lo) || isNaN(hi) || lo < 0 || hi < lo || hi > 5000) { msg.textContent = v("bad"); msg.style.color = "var(--over)"; return; }
    const data = {
      name: name.value.trim(), city: city.value, cat: cat.value, area: area.value.trim(), vibe: vibe.value, priceMin: lo, priceMax: hi,
      desc: desc.value.trim(), hours: hours.value.trim(), phone: phone.value.trim(), insta: insta.value.trim(), maps: safeUrl(maps.value.trim()),
      menu: [...menu.children].map(r => ({ n: r.children[0].value.trim(), p: parseInt(r.children[1].value, 10) || 0 })).filter(i => i.n).slice(0, 40),
      offers: [...offers.children].map(r => ({ t: r.children[0].value.trim(), d: r.children[1].value.trim() })).filter(o => o.t).slice(0, 6),
      updated: serverTimestamp()
    };
    save.disabled = true;
    try {
      if (vn) { await updateDoc(doc(db, "venues", vn.id), data); toast(v("saved")); }
      else { await addDoc(collection(db, "venues"), { ...data, owner: S.user.uid, status: "pending", at: serverTimestamp() }); toast(v("sentRev")); celebrate("🏪", v("sentRev"), data.name, ["✨", "🎉"]); }
      $("cmBg").hidden = true;
    } catch (err) { msg.textContent = v("err"); msg.style.color = "var(--over)"; save.disabled = false; }
  };
  sh.appendChild(f);
  const close = el("button", "link", T[S.lang].auClose); close.onclick = () => $("cmBg").hidden = true; sh.appendChild(close);
  $("cmBg").hidden = false;
}

function venueCard(vn, admin) {
  const c = el("article", "vcard"), top = el("div", "top"), h = el("div");
  h.append(el("h3", "", vn.name), el("small", "note num", cn(vn.city) + " · " + (T[S.lang].cats[vn.cat] || vn.cat) + " · " + rng(vn.priceMin, vn.priceMax) + " " + T[S.lang].mad));
  const pill = el("span", "pill " + (vn.status === "live" ? "ok" : vn.status === "rejected" ? "no" : "wait"), v("st")[vn.status] || vn.status);
  top.append(h, pill); c.appendChild(top);
  if (!admin) {
    const k = kpi[vn.id] || {}, g = el("div", "kpis");
    [[k.views, v("views")], [k.planAdds, v("adds")], [k.likes, v("likes")], [k.reviews, v("reviews")]].forEach(([n, l]) => { const d = el("div"); d.append(el("b", "num", String(n ?? "…")), el("span", "", l)); g.appendChild(d); });
    c.appendChild(g);
  } else if (vn.desc) c.appendChild(el("p", "", vn.desc));
  const acts = el("div", "acts"); acts.style.cssText = "display:flex;gap:8px;flex-wrap:wrap;align-items:center";
  if (admin) {
    const a = el("button", "btn cta", v("approve")); a.onclick = () => updateDoc(doc(db, "venues", vn.id), { status: "live" }).catch(() => toast(v("err")));
    const r = el("button", "btn ghost", v("reject")); r.onclick = () => updateDoc(doc(db, "venues", vn.id), { status: "rejected" }).catch(() => toast(v("err")));
    acts.append(a, r);
  } else {
    const e = el("button", "btn ghost", "✏️ " + v("edit")); e.onclick = () => openEditor(vn);
    const pv = el("button", "btn ghost", "👀 " + v("preview")); pv.onclick = () => openVenue({ id: "v_" + vn.id, vid: vn.id, data: vn });
    const d = el("button", "linkbtn", delArm === vn.id ? v("delAsk") : v("del"));
    d.onclick = () => { if (delArm === vn.id) { delArm = null; deleteDoc(doc(db, "venues", vn.id)).catch(() => toast(v("err"))); } else { delArm = vn.id; render(); setTimeout(() => { if (delArm === vn.id) { delArm = null; render(); } }, 3000); } };
    acts.append(e, pv, d);
  }
  c.appendChild(acts);
  return c;
}

function renderPro() {
  const view = $("vPro"); view.innerHTML = "";
  const head = el("div", "pro-head"); head.append(el("h2", "", "🏪 " + v("pro"))); view.appendChild(head);
  view.appendChild(el("p", "note", v("intro")));
  if (!S.user) { view.appendChild(el("p", "empty", v("sign"))); const b = el("button", "btn cta", v("signBtn")); b.onclick = () => openAuth("up"); view.appendChild(b); return; }
  const add = el("button", "btn cta", v("add")); add.onclick = () => openEditor(null); view.appendChild(add);
  view.appendChild(el("span", "lbl", v("mine")));
  if (myVenues === null) view.appendChild(el("p", "empty", "…"));
  else if (!myVenues.length) view.appendChild(el("p", "empty", v("none")));
  else myVenues.forEach(vn => view.appendChild(venueCard(vn, false)));
  if (isAdmin) {
    view.appendChild(el("h2", "", "🛡️ " + v("mod")));
    if (!pending.length) view.appendChild(el("p", "empty", v("modNone")));
    pending.forEach(vn => view.appendChild(venueCard(vn, true)));
    if (reqs && reqs.length) {
      view.appendChild(el("span", "lbl", v("reqs")));
      reqs.forEach(r => { const m = el("div", "mini"), t = el("span"); t.append(el("b", "", r.name), el("small", "", [cn(r.city), r.type, r.price, r.contact].filter(Boolean).join(" · "))); m.appendChild(t); view.appendChild(m); });
    }
  }
}

function renderHook() {
  trackPlanAdds();
  const po = $("proOpen"); if (po) { po.textContent = "🏪 " + v("open"); po.onclick = () => { S.view = "pro"; render(); scrollTo({ top: 0 }); }; }
  if (S.view === "pro") renderPro();
}

window.VX = { decorate, render: renderHook };
if (new URLSearchParams(location.search).has("pro")) S.view = "pro";
render();
