// Kharja – social layer: near me, favorites, recommendations, comments, public feed, "My space" dashboard.
// Loaded after kharja-firebase.js (which initialises the Firebase app and sets S.user).
import { getApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore, doc, setDoc, deleteDoc, addDoc, collection, query, where, orderBy, limit,
  onSnapshot, getDocs, getCountFromServer, serverTimestamp, writeBatch
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const app = getApp();
const auth = getAuth(app);
const db = getFirestore(app);

/* ---------- Strings (5 languages) ---------- */
const X = {
  ar: { fav: "مفضلة", like: "كننصح بيه", cm: "تعليقات", post: "شارك فالفيد", signFirst: "سجّل الدخول باش تكمل.",
        favOn: "❤️ تزاد للمفضلة", favOff: "تحيد من المفضلة", likeOn: "👍 شكراً على النصيحة!", posted: "📣 تنشر فالفيد!",
        cmT: "آش قالو الناس", cmPh: "كيفاش كانت التجربة؟ الأسعار، الخدمة، الأجواء…", cmSend: "نشر التعليق", cmEmpty: "حتى تعليق. كون الأول!",
        stars: "التقييم", del: "حذف", report: "بلّغ", reported: "تبلّغ. شكراً.", close: "سدّ",
        feedT: "الفيد", feedP: "شنو كيدير الناس فالمغرب دابا. شارك بلاصة عجباتك.", newPost: "+ منشور جديد", postPh: "شنو عجبك فهاد البلاصة؟",
        pick: "اختار البلاصة", postSend: "نشر", feedEmpty: "الفيد خاوي. كون أول واحد يشارك!", planIt: "زيدها للخطة",
        allCities: "كل المدن", meT: "فضائي", meSign: "سجّل الدخول باش تشوف المفضلة، الخطط والتعليقات ديالك.", signBtn: "دخول / تسجيل",
        favs: "المفضلة", plans: "الخطط ديالي", myCm: "التعليقات ديالي", noFav: "مازال ما زدتي حتى بلاصة للمفضلة. ضغط ❤️ على أي بلاصة.",
        noPlans: "مازال ما شاركتي حتى خطة.", noCm: "مازال ما كتبتي حتى تعليق.", open: "حلّ", people: "أشخاص",
        nearOk: c => "📍 أقرب مدينة ليك: " + c, nearNo: "ما قدرناش نعرفو موقعك. اختار المدينة يدوياً.", tooLong: "النص طويل بزاف.", err: "وقع مشكل. عاود." },
  fr: { fav: "Favori", like: "Je recommande", cm: "Avis", post: "Partager au feed", signFirst: "Connectez-vous pour continuer.",
        favOn: "❤️ Ajouté aux favoris", favOff: "Retiré des favoris", likeOn: "👍 Merci pour la reco !", posted: "📣 Publié dans le feed !",
        cmT: "Ce qu'en disent les gens", cmPh: "Comment c'était ? Prix, service, ambiance…", cmSend: "Publier l'avis", cmEmpty: "Aucun avis. Soyez le premier !",
        stars: "Note", del: "Supprimer", report: "Signaler", reported: "Signalé. Merci.", close: "Fermer",
        feedT: "Feed", feedP: "Ce que les gens font au Maroc en ce moment. Partagez un lieu que vous aimez.", newPost: "+ Nouvelle publication", postPh: "Qu'avez-vous aimé ici ?",
        pick: "Choisissez le lieu", postSend: "Publier", feedEmpty: "Le feed est vide. Soyez le premier à partager !", planIt: "Ajouter au plan",
        allCities: "Toutes les villes", meT: "Mon espace", meSign: "Connectez-vous pour voir vos favoris, plans et avis.", signBtn: "Connexion / Inscription",
        favs: "Favoris", plans: "Mes plans", myCm: "Mes avis", noFav: "Aucun favori. Touchez ❤️ sur un lieu.",
        noPlans: "Vous n'avez encore partagé aucun plan.", noCm: "Vous n'avez encore écrit aucun avis.", open: "Ouvrir", people: "pers.",
        nearOk: c => "📍 Ville la plus proche : " + c, nearNo: "Position introuvable. Choisissez la ville à la main.", tooLong: "Texte trop long.", err: "Un problème est survenu. Réessayez." },
  en: { fav: "Favorite", like: "Recommend", cm: "Reviews", post: "Share to feed", signFirst: "Sign in to continue.",
        favOn: "❤️ Added to favorites", favOff: "Removed from favorites", likeOn: "👍 Thanks for the tip!", posted: "📣 Posted to the feed!",
        cmT: "What people say", cmPh: "How was it? Prices, service, vibe…", cmSend: "Post review", cmEmpty: "No reviews yet. Be the first!",
        stars: "Rating", del: "Delete", report: "Report", reported: "Reported. Thanks.", close: "Close",
        feedT: "Feed", feedP: "What people are doing in Morocco right now. Share a place you loved.", newPost: "+ New post", postPh: "What did you love here?",
        pick: "Pick the place", postSend: "Post", feedEmpty: "The feed is empty. Be the first to share!", planIt: "Add to plan",
        allCities: "All cities", meT: "My space", meSign: "Sign in to see your favorites, plans and reviews.", signBtn: "Sign in / Sign up",
        favs: "Favorites", plans: "My plans", myCm: "My reviews", noFav: "No favorites yet. Tap ❤️ on any place.",
        noPlans: "You haven't shared a plan yet.", noCm: "You haven't written a review yet.", open: "Open", people: "people",
        nearOk: c => "📍 Closest city: " + c, nearNo: "Couldn't get your location. Pick the city by hand.", tooLong: "Text is too long.", err: "Something went wrong. Try again." },
  es: { fav: "Favorito", like: "Lo recomiendo", cm: "Reseñas", post: "Compartir en el feed", signFirst: "Inicia sesión para continuar.",
        favOn: "❤️ Añadido a favoritos", favOff: "Quitado de favoritos", likeOn: "👍 ¡Gracias por la recomendación!", posted: "📣 ¡Publicado en el feed!",
        cmT: "Lo que dice la gente", cmPh: "¿Qué tal? Precios, servicio, ambiente…", cmSend: "Publicar reseña", cmEmpty: "Sin reseñas. ¡Sé el primero!",
        stars: "Nota", del: "Borrar", report: "Denunciar", reported: "Denunciado. Gracias.", close: "Cerrar",
        feedT: "Feed", feedP: "Lo que la gente hace en Marruecos ahora. Comparte un sitio que te encantó.", newPost: "+ Nueva publicación", postPh: "¿Qué te encantó de aquí?",
        pick: "Elige el sitio", postSend: "Publicar", feedEmpty: "El feed está vacío. ¡Sé el primero en compartir!", planIt: "Añadir al plan",
        allCities: "Todas las ciudades", meT: "Mi espacio", meSign: "Inicia sesión para ver tus favoritos, planes y reseñas.", signBtn: "Entrar / Registrarse",
        favs: "Favoritos", plans: "Mis planes", myCm: "Mis reseñas", noFav: "Sin favoritos. Toca ❤️ en un sitio.",
        noPlans: "Aún no has compartido ningún plan.", noCm: "Aún no has escrito reseñas.", open: "Abrir", people: "pers.",
        nearOk: c => "📍 Ciudad más cercana: " + c, nearNo: "No pudimos obtener tu ubicación. Elige la ciudad a mano.", tooLong: "Texto demasiado largo.", err: "Algo salió mal. Inténtalo de nuevo." },
  pt: { fav: "Favorito", like: "Recomendo", cm: "Avaliações", post: "Partilhar no feed", signFirst: "Inicia sessão para continuar.",
        favOn: "❤️ Adicionado aos favoritos", favOff: "Removido dos favoritos", likeOn: "👍 Obrigado pela dica!", posted: "📣 Publicado no feed!",
        cmT: "O que as pessoas dizem", cmPh: "Como foi? Preços, serviço, ambiente…", cmSend: "Publicar avaliação", cmEmpty: "Sem avaliações. Sê o primeiro!",
        stars: "Nota", del: "Apagar", report: "Denunciar", reported: "Denunciado. Obrigado.", close: "Fechar",
        feedT: "Feed", feedP: "O que as pessoas fazem em Marrocos agora. Partilha um sítio de que gostaste.", newPost: "+ Nova publicação", postPh: "O que adoraste aqui?",
        pick: "Escolhe o sítio", postSend: "Publicar", feedEmpty: "O feed está vazio. Sê o primeiro a partilhar!", planIt: "Adicionar ao plano",
        allCities: "Todas as cidades", meT: "O meu espaço", meSign: "Inicia sessão para ver os teus favoritos, planos e avaliações.", signBtn: "Entrar / Registar",
        favs: "Favoritos", plans: "Os meus planos", myCm: "As minhas avaliações", noFav: "Sem favoritos. Toca em ❤️ num sítio.",
        noPlans: "Ainda não partilhaste nenhum plano.", noCm: "Ainda não escreveste avaliações.", open: "Abrir", people: "pessoas",
        nearOk: c => "📍 Cidade mais próxima: " + c, nearNo: "Não foi possível obter a tua localização. Escolhe a cidade à mão.", tooLong: "Texto demasiado longo.", err: "Algo correu mal. Tenta de novo." }
};
const x = k => (X[S.lang] || X.en)[k];
const EMOJIS = ["🔥", "😍", "🤤", "🌅", "🎉", "😂", "💸", "☕"];
const CITY_XY = { casa: [33.5731, -7.5898], rabat: [34.0209, -6.8416], rak: [31.6295, -7.9811], tng: [35.7595, -5.834],
                  aga: [30.4278, -9.5981], fes: [34.0181, -5.0078], khn: [32.9394, -5.6675] };

/* ---------- Small DOM helpers (user text always goes through textContent) ---------- */
const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
const placeOf = id => P.find(p => p.id === Number(id));
const nameOf = u => u.displayName || (u.email || "").split("@")[0] || "?";
const initial = n => (n || "?").trim().charAt(0).toUpperCase();
function toast(text) {
  const t = $("toast"); t.textContent = text; t.hidden = false;
  clearTimeout(toast._t); toast._t = setTimeout(() => t.hidden = true, 2200);
}
function ago(ts) {
  if (!ts || !ts.toDate) return "";
  const s = (ts.toDate() - new Date()) / 1000, rtf = new Intl.RelativeTimeFormat(S.lang, { numeric: "auto" });
  const a = Math.abs(s);
  if (a < 60) return rtf.format(Math.round(s), "second");
  if (a < 3600) return rtf.format(Math.round(s / 60), "minute");
  if (a < 86400) return rtf.format(Math.round(s / 3600), "hour");
  return rtf.format(Math.round(s / 86400), "day");
}
function needUser(fn) {
  if (S.user) return fn();
  openAuth("up"); $("auMsg").textContent = x("signFirst"); $("auMsg").style.color = "var(--muted)";
}

/* ---------- State ---------- */
const favs = new Set(), myLikes = new Set();
const counts = {};                 // pid -> {likes, cm}
let unsubUser = [];

onAuthStateChanged(auth, user => {
  unsubUser.forEach(u => u()); unsubUser = []; favs.clear(); myLikes.clear();
  if (user) {
    unsubUser.push(onSnapshot(collection(db, "users", user.uid, "favorites"), qs => { favs.clear(); qs.forEach(d => favs.add(d.id)); render(); }));
    unsubUser.push(onSnapshot(collection(db, "users", user.uid, "likes"), qs => { myLikes.clear(); qs.forEach(d => myLikes.add(d.id)); render(); }));
  }
  render();
});

/* ---------- Near me ---------- */
function nearMe() {
  if (!navigator.geolocation) return toast(x("nearNo"));
  navigator.geolocation.getCurrentPosition(pos => {
    const { latitude: la, longitude: lo } = pos.coords;
    let best = null, bd = Infinity;
    for (const [k, [a, b]] of Object.entries(CITY_XY)) {
      const d = Math.hypot(la - a, (lo - b) * Math.cos(la * Math.PI / 180));
      if (d < bd) { bd = d; best = k; }
    }
    S.city = best; S.plan = []; S.showN = 8; render();
    toast(x("nearOk")(cityName(best)));
    $("list").scrollIntoView({ behavior: "smooth", block: "start" });
  }, () => toast(x("nearNo")), { timeout: 10000, maximumAge: 600000 });
}

/* ---------- Place cards: favorite / recommend / reviews / share ---------- */
async function loadCounts(pid) {
  if (counts[pid] && counts[pid].fresh) return;
  counts[pid] = { ...(counts[pid] || { likes: 0, cm: 0 }), fresh: true };
  try {
    const [l, c] = await Promise.all([
      getCountFromServer(collection(db, "places", String(pid), "likes")),
      getCountFromServer(collection(db, "places", String(pid), "comments"))
    ]);
    counts[pid] = { likes: l.data().count, cm: c.data().count, fresh: true };
    render();
  } catch (e) { /* counts are optional */ }
}

function decorate(card, p) {
  const pid = String(p.id), c = counts[pid] || { likes: 0, cm: 0 };
  const row = el("div", "soc");
  const fav = el("button", "fav", (favs.has(pid) ? "❤️ " : "🤍 ") + x("fav"));
  fav.setAttribute("aria-pressed", String(favs.has(pid)));
  fav.onclick = () => needUser(() => toggleFav(pid));
  const like = el("button", "", "👍 " + (c.likes || "") + " " + x("like"));
  like.setAttribute("aria-pressed", String(myLikes.has(pid)));
  like.onclick = () => needUser(() => toggleLike(pid));
  const cm = el("button", "", "💬 " + (c.cm || "") + " " + x("cm"));
  cm.onclick = () => openComments(pid);
  const sh = el("button", "", "📣 " + x("post"));
  sh.onclick = () => needUser(() => openComposer(pid));
  row.append(fav, like, cm, sh);
  card.appendChild(row);
  if (!c.fresh) loadCounts(pid);
}

async function toggleFav(pid) {
  const ref = doc(db, "users", S.user.uid, "favorites", pid);
  try {
    if (favs.has(pid)) { await deleteDoc(ref); toast(x("favOff")); }
    else { await setDoc(ref, { at: serverTimestamp() }); toast(x("favOn")); burst(["❤️", "💖"], innerWidth / 2, innerHeight * 0.6, 10); }
  } catch (e) { toast(x("err")); }
}

async function toggleLike(pid) {
  const b = writeBatch(db), mine = doc(db, "users", S.user.uid, "likes", pid), pub = doc(db, "places", pid, "likes", S.user.uid);
  try {
    if (myLikes.has(pid)) { b.delete(mine); b.delete(pub); }
    else { b.set(mine, { at: serverTimestamp() }); b.set(pub, { at: serverTimestamp() }); }
    await b.commit();
    if (!myLikes.has(pid)) { toast(x("likeOn")); burst(["👍", "✨"], innerWidth / 2, innerHeight * 0.6, 10); }
    counts[pid] = { ...(counts[pid] || {}), fresh: false }; loadCounts(pid);
  } catch (e) { toast(x("err")); }
}

/* ---------- Sheet (reviews + composer) ---------- */
let unsubCm = null;
function openSheet(build) {
  const sh = $("cmSheet"); sh.innerHTML = ""; build(sh);
  const close = el("button", "link", x("close")); close.onclick = closeSheet; sh.appendChild(close);
  $("cmBg").hidden = false;
}
function closeSheet() { $("cmBg").hidden = true; if (unsubCm) { unsubCm(); unsubCm = null; } }
$("cmBg").addEventListener("click", e => { if (e.target === $("cmBg")) closeSheet(); });
document.addEventListener("keydown", e => { if (e.key === "Escape") closeSheet(); });

function starsPicker(get, set) {
  const w = el("div", "stars");
  const draw = () => { w.innerHTML = ""; for (let i = 1; i <= 5; i++) { const b = el("button", "", "★"); b.type = "button"; b.setAttribute("aria-label", i + "/5"); b.setAttribute("aria-pressed", String(i <= get())); b.onclick = () => { set(i); draw(); }; w.appendChild(b); } };
  draw(); return w;
}

function openComments(pid) {
  const p = placeOf(pid); let stars = 5;
  openSheet(sh => {
    sh.appendChild(el("h3", "", p.n));
    sh.appendChild(el("p", "note", x("cmT")));
    const form = el("form", "cm-form compose"); form.noValidate = true;
    const ta = el("textarea"); ta.id = "cm-text"; ta.maxLength = 500; ta.placeholder = x("cmPh");
    const send = el("button", "btn cta", x("cmSend")); send.type = "submit";
    const msg = el("p", "note"); msg.setAttribute("role", "status");
    form.append(el("span", "lbl", x("stars")), starsPicker(() => stars, v => stars = v), ta, send, msg);
    form.onsubmit = e => { e.preventDefault(); needUser(() => postComment(pid, ta.value.trim(), stars, msg, ta)); };
    sh.appendChild(form);
    const list = el("div"); sh.appendChild(list);
    unsubCm = onSnapshot(query(collection(db, "places", pid, "comments"), orderBy("at", "desc"), limit(50)), qs => {
      list.innerHTML = "";
      if (qs.empty) return list.appendChild(el("p", "empty", x("cmEmpty")));
      qs.forEach(d => {
        const c = d.data(), row = el("div", "cm"), top = el("div", "top");
        top.append(el("b", "", (c.name || "?") + "  " + "★".repeat(c.stars || 0)), el("small", "", ago(c.at)));
        row.append(top, el("div", "txt", c.text));
        const acts = el("div");
        if (S.user && c.uid === S.user.uid) { const del = el("button", "linkbtn", x("del")); del.onclick = () => deleteComment(pid, d.id); acts.appendChild(del); }
        else { const rp = el("button", "linkbtn", x("report")); rp.onclick = () => report("comment", pid + "/" + d.id); acts.appendChild(rp); }
        row.appendChild(acts); list.appendChild(row);
      });
    }, () => list.replaceChildren(el("p", "empty", x("err"))));
  });
}

async function postComment(pid, text, stars, msg, ta) {
  if (!text) return;
  if (text.length > 500) { msg.textContent = x("tooLong"); return; }
  const id = doc(collection(db, "places", pid, "comments")).id;
  const b = writeBatch(db), data = { uid: S.user.uid, name: nameOf(S.user), text, stars, at: serverTimestamp() };
  b.set(doc(db, "places", pid, "comments", id), data);
  b.set(doc(db, "users", S.user.uid, "comments", id), { pid, text, stars, at: serverTimestamp() });
  try { await b.commit(); ta.value = ""; msg.textContent = ""; counts[pid] = { ...(counts[pid] || {}), fresh: false }; loadCounts(pid); burst(["⭐", "✨"], innerWidth / 2, innerHeight * 0.5, 10); }
  catch (e) { msg.textContent = x("err"); }
}

async function deleteComment(pid, id) {
  const b = writeBatch(db);
  b.delete(doc(db, "places", pid, "comments", id)); b.delete(doc(db, "users", S.user.uid, "comments", id));
  try { await b.commit(); counts[pid] = { ...(counts[pid] || {}), fresh: false }; loadCounts(pid); } catch (e) { toast(x("err")); }
}

async function report(kind, ref) {
  needUser(async () => {
    try { await addDoc(collection(db, "reports"), { kind, ref: String(ref).slice(0, 200), uid: S.user.uid, at: serverTimestamp() }); toast(x("reported")); }
    catch (e) { toast(x("err")); }
  });
}

/* ---------- Feed ---------- */
function openComposer(pid) {
  let emoji = EMOJIS[0], chosen = pid ? String(pid) : "";
  openSheet(sh => {
    sh.appendChild(el("h3", "", x("newPost").replace("+ ", "")));
    const f = el("form", "compose"); f.noValidate = true;
    const sel = el("select"); sel.id = "post-place";
    P.filter(p => p.y === S.city || String(p.id) === chosen).forEach(p => { const o = el("option", "", p.n + " · " + cityName(p.y)); o.value = p.id; sel.appendChild(o); });
    if (chosen) sel.value = chosen;
    const emo = el("div", "emo");
    const drawEmo = () => { emo.innerHTML = ""; EMOJIS.forEach(e => { const b = el("button", "", e); b.type = "button"; b.setAttribute("aria-pressed", String(e === emoji)); b.onclick = () => { emoji = e; drawEmo(); }; emo.appendChild(b); }); };
    drawEmo();
    const ta = el("textarea"); ta.id = "post-text"; ta.maxLength = 280; ta.placeholder = x("postPh");
    const send = el("button", "btn cta", x("postSend")); send.type = "submit";
    const msg = el("p", "note");
    f.append(el("span", "lbl", x("pick")), sel, emo, ta, send, msg);
    f.onsubmit = async e => {
      e.preventDefault();
      const text = ta.value.trim(); if (!text) return;
      const p = placeOf(sel.value);
      try {
        await addDoc(collection(db, "feed"), { uid: S.user.uid, name: nameOf(S.user), pid: String(p.id), city: p.y, emoji, text: text.slice(0, 280), at: serverTimestamp() });
        closeSheet(); celebrate(emoji, x("posted"), p.n, [emoji, "✨", "🎉"]); S.view = "feed"; render();
      } catch (err) { msg.textContent = x("err"); }
    };
    sh.appendChild(f);
  });
}

let feedDocs = [], feedSub = null, feedCity = "all";
function ensureFeed() {
  if (feedSub) return;
  feedSub = true;               // guard: the first snapshot can arrive synchronously
  feedSub = onSnapshot(query(collection(db, "feed"), orderBy("at", "desc"), limit(60)),
    qs => { feedDocs = []; qs.forEach(d => feedDocs.push({ id: d.id, ...d.data() })); render(); },
    () => { feedDocs = null; render(); });
}

function renderFeed() {
  ensureFeed();
  const v = $("vFeed"); v.innerHTML = "";
  v.append(el("h2", "", x("feedT")), el("p", "note", x("feedP")));
  const nb = el("button", "btn cta", x("newPost")); nb.onclick = () => needUser(() => openComposer(""));
  v.appendChild(nb);
  const chips = el("div", "chips");
  [["all", x("allCities")], ...CITIES.map(([k]) => [k, cityName(k)])].forEach(([k, label]) => {
    const b = el("button", "chip", label); b.setAttribute("aria-pressed", String(feedCity === k)); b.onclick = () => { feedCity = k; render(); }; chips.appendChild(b);
  });
  v.appendChild(chips);
  if (feedDocs === null) return v.appendChild(el("p", "empty", x("err")));
  const items = feedDocs.filter(d => feedCity === "all" || d.city === feedCity);
  if (!items.length) return v.appendChild(el("p", "empty", x("feedEmpty")));
  items.forEach(d => {
    const p = placeOf(d.pid), post = el("article", "post"), who = el("div", "who"), meta = el("div");
    meta.append(el("b", "", d.name || "?"), el("small", "", ago(d.at) + (p ? " · " + cityName(p.y) : "")));
    who.append(el("i", "", initial(d.name)), meta);
    post.append(who, el("div", "em", d.emoji || "🔥"), el("div", "txt", d.text));
    if (p) post.appendChild(el("span", "chip-place", "📍 " + p.n));
    const acts = el("div", "acts");
    if (p) { const pl = el("button", "btn ghost", "➕ " + x("planIt")); pl.onclick = () => { S.city = p.y; if (!S.plan.includes(p.id)) S.plan = [...S.plan, p.id].slice(-6); S.view = "explore"; S.showN = 8; render(); toast("✓ " + p.n); }; acts.appendChild(pl); }
    if (S.user && d.uid === S.user.uid) { const del = el("button", "linkbtn", x("del")); del.onclick = () => deleteDoc(doc(db, "feed", d.id)).catch(() => toast(x("err"))); acts.appendChild(del); }
    else { const rp = el("button", "linkbtn", x("report")); rp.onclick = () => report("post", d.id); acts.appendChild(rp); }
    post.appendChild(acts); v.appendChild(post);
  });
}

/* ---------- My space ---------- */
let myPlans = null, myCms = null, meFor = null;
async function loadMe() {
  if (!S.user || meFor === S.user.uid) return;
  meFor = S.user.uid; myPlans = null; myCms = null;
  try {
    const qs = await getDocs(query(collection(db, "plans"), where("owner", "==", S.user.uid), limit(50)));
    myPlans = []; qs.forEach(d => myPlans.push({ id: d.id, ...d.data() }));
    myPlans.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
  } catch (e) { myPlans = []; }
  try {
    const qs = await getDocs(query(collection(db, "users", S.user.uid, "comments"), orderBy("at", "desc"), limit(50)));
    myCms = []; qs.forEach(d => myCms.push({ id: d.id, ...d.data() }));
  } catch (e) { myCms = []; }
  render();
}

function renderMe() {
  const v = $("vMe"); v.innerHTML = "";
  v.appendChild(el("h2", "", x("meT")));
  if (!S.user) {
    meFor = null;
    v.appendChild(el("p", "empty", x("meSign")));
    const b = el("button", "btn cta", x("signBtn")); b.onclick = () => openAuth("up"); v.appendChild(b);
    return;
  }
  loadMe();
  const head = el("div", "mini"), hi = el("span");
  hi.append(el("b", "", nameOf(S.user)), el("small", "", S.user.email || ""));
  const av = el("i", "av", initial(nameOf(S.user)));
  head.append(av, hi); head.style.justifyContent = "flex-start"; v.appendChild(head);
  const st = el("div", "stats");
  [[favs.size, x("favs")], [myPlans ? myPlans.length : "…", x("plans")], [myCms ? myCms.length : "…", x("myCm")]].forEach(([n, l]) => { const d = el("div"); d.append(el("b", "num", String(n)), el("span", "", l)); st.appendChild(d); });
  v.appendChild(st);

  v.appendChild(el("h3", "lbl", "❤️ " + x("favs")));
  if (!favs.size) v.appendChild(el("p", "empty", x("noFav")));
  [...favs].map(placeOf).filter(Boolean).forEach(p => {
    const row = el("div", "mini"), t = el("span");
    t.append(el("b", "", p.n), el("small", "num", cityName(p.y) + " · " + (p.p[1] === 0 ? T[S.lang].free : rng(p.p[0], p.p[1]) + " " + T[S.lang].mad)));
    const add = el("button", "btn ghost", "➕"); add.setAttribute("aria-label", x("planIt"));
    add.onclick = () => { S.city = p.y; if (!S.plan.includes(p.id)) S.plan = [...S.plan, p.id].slice(-6); S.view = "explore"; render(); toast("✓ " + p.n); };
    row.append(t, add); v.appendChild(row);
  });

  v.appendChild(el("h3", "lbl", "🗓️ " + x("plans")));
  if (myPlans && !myPlans.length) v.appendChild(el("p", "empty", x("noPlans")));
  (myPlans || []).forEach(pl => {
    const row = el("div", "mini"), t = el("span");
    t.append(el("b", "", (pl.stops || []).map(id => (placeOf(id) || {}).n).filter(Boolean).join(" → ")),
             el("small", "num", cityName(pl.city) + " · " + pl.people + " " + x("people") + " · " + fmt(pl.budget) + " " + T[S.lang].mad + (pl.createdAt ? " · " + ago(pl.createdAt) : "")));
    const a = el("a", "btn ghost", x("open")); a.href = location.pathname + "?plan=" + encodeURIComponent(pl.id);
    row.append(t, a); v.appendChild(row);
  });

  v.appendChild(el("h3", "lbl", "💬 " + x("myCm")));
  if (myCms && !myCms.length) v.appendChild(el("p", "empty", x("noCm")));
  (myCms || []).forEach(c => {
    const p = placeOf(c.pid), row = el("div", "cm"), top = el("div", "top");
    top.append(el("b", "", (p ? p.n : "?") + "  " + "★".repeat(c.stars || 0)), el("small", "", ago(c.at)));
    row.append(top, el("div", "txt", c.text)); v.appendChild(row);
  });
}

function renderViews() {
  if (S.view === "feed") renderFeed();
  else if (S.view === "me") renderMe();
}

window.SX = { decorate, nearMe, render: renderViews, refreshMe: () => { meFor = null; } };
render();
