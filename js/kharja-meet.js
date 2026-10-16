// Kharja – Open outings: people who want company join a small group outing at a public place.
// Safety by design: 18+, public venues only, groups of 3–8, host approves each person,
// group chat only for approved members, report button, feedback after the outing.
import { getApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore, doc, collection, query, where, orderBy, limit, onSnapshot, setDoc, updateDoc, deleteDoc,
  addDoc, writeBatch, serverTimestamp, Timestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const db = getFirestore(getApp());
const auth = getAuth(getApp());

const M = {
  ar: { title: "خرجات مفتوحة", intro: "بوحدك وبغيتي تخرج؟ انضم لمجموعة صغيرة غادي تخرج، ولا دير خرجة وخلّي الناس يتزادو ليك.",
        safetyT: "قواعد الأمان", safety: ["18 عام وفوق فقط", "بلايص عمومية فقط (مقهى، مطعم، نشاط)", "مجموعة من 3 حتى 8 أشخاص", "مول الخرجة كيقبل كل واحد", "الشات غير للمقبولين", "بلّغ على أي سلوك ماشي مزيان"],
        create: "+ دير خرجة مفتوحة", none: "حتى خرجة مفتوحة فهاد المدينة دابا. كون الأول!", place: "البلاصة", when: "النهار والساعة", size: "شحال من واحد (معاك)",
        note: "كلمة صغيرة (اختياري)", notePh: "مثلاً: قهوة ودردشة، كنهضرو العربية والفرنسية", adult: "عندي 18 عام وفوق، وموافق على قواعد الأمان", publish: "نشر الخرجة",
        join: "🙋 بغيت نتزاد", pending: "كيتسنى القبول", inS: "مقبول ✓", host: "أنت مول الخرجة", leave: "خرج من الخرجة", cancel: "لغي الخرجة",
        approve: "قبول", decline: "رفض", requests: "طلبات الانضمام", seats: (a, b) => a + " من " + b + " بلايص", full: "كاملة",
        chatT: "شات المجموعة", chatPh: "كتب رسالة…", send: "صيفط", fbT: "كيفاش دازت الخرجة؟", fbPh: "شنو عجبك؟", fbSend: "صيفط الرأي", fbThanks: "شكراً! 🙏",
        shareFeed: "📣 شارك التجربة فالفيد", report: "بلّغ", reported: "تبلّغ. غادي نراجعوه.", past: "دازت", by: "مع", err: "وقع مشكل. عاود.",
        needAdult: "خاصك تأكد أن عندك 18 عام وفوق.", needWhen: "اختار نهار فالمستقبل.", created: "🎉 تنشرات الخرجة!", requested: "🙋 تصيفط الطلب! تسنى القبول.", welcome: "🥳 تقبلتي! مرحبا بيك فالمجموعة." },
  fr: { title: "Sorties ouvertes", intro: "Seul et envie de sortir ? Rejoignez un petit groupe qui sort, ou créez une sortie et laissez d'autres vous rejoindre.",
        safetyT: "Règles de sécurité", safety: ["18 ans et plus uniquement", "Lieux publics uniquement (café, resto, activité)", "Groupes de 3 à 8 personnes", "L'organisateur accepte chaque personne", "Chat réservé aux membres acceptés", "Signalez tout comportement inapproprié"],
        create: "+ Créer une sortie ouverte", none: "Aucune sortie ouverte dans cette ville pour l'instant. Lancez la première !", place: "Lieu", when: "Date et heure", size: "Nombre de personnes (vous inclus)",
        note: "Un petit mot (optionnel)", notePh: "Ex. : café et discussion, on parle arabe et français", adult: "J'ai 18 ans ou plus et j'accepte les règles de sécurité", publish: "Publier la sortie",
        join: "🙋 Je veux venir", pending: "En attente", inS: "Accepté ✓", host: "Vous organisez", leave: "Quitter la sortie", cancel: "Annuler la sortie",
        approve: "Accepter", decline: "Refuser", requests: "Demandes", seats: (a, b) => a + " / " + b + " places", full: "Complet",
        chatT: "Chat du groupe", chatPh: "Écrire un message…", send: "Envoyer", fbT: "Comment s'est passée la sortie ?", fbPh: "Qu'avez-vous aimé ?", fbSend: "Envoyer l'avis", fbThanks: "Merci ! 🙏",
        shareFeed: "📣 Partager l'expérience au feed", report: "Signaler", reported: "Signalé. Nous allons vérifier.", past: "Passée", by: "avec", err: "Un problème est survenu. Réessayez.",
        needAdult: "Confirmez que vous avez 18 ans ou plus.", needWhen: "Choisissez une date future.", created: "🎉 Sortie publiée !", requested: "🙋 Demande envoyée ! En attente d'acceptation.", welcome: "🥳 Accepté ! Bienvenue dans le groupe." },
  en: { title: "Open outings", intro: "On your own and want to go out? Join a small group heading out, or create an outing and let others join you.",
        safetyT: "Safety rules", safety: ["18+ only", "Public places only (café, restaurant, activity)", "Groups of 3 to 8 people", "The host approves each person", "Chat only for approved members", "Report any bad behaviour"],
        create: "+ Create an open outing", none: "No open outings in this city yet. Start the first one!", place: "Place", when: "Date and time", size: "Group size (including you)",
        note: "A short note (optional)", notePh: "E.g. coffee and chat, we speak Arabic and English", adult: "I'm 18 or older and I accept the safety rules", publish: "Publish outing",
        join: "🙋 I want to join", pending: "Waiting", inS: "Accepted ✓", host: "You're hosting", leave: "Leave outing", cancel: "Cancel outing",
        approve: "Accept", decline: "Decline", requests: "Join requests", seats: (a, b) => a + " of " + b + " spots", full: "Full",
        chatT: "Group chat", chatPh: "Write a message…", send: "Send", fbT: "How was the outing?", fbPh: "What did you enjoy?", fbSend: "Send feedback", fbThanks: "Thank you! 🙏",
        shareFeed: "📣 Share the experience to the feed", report: "Report", reported: "Reported. We'll review it.", past: "Past", by: "with", err: "Something went wrong. Try again.",
        needAdult: "Please confirm you're 18 or older.", needWhen: "Pick a future date.", created: "🎉 Outing published!", requested: "🙋 Request sent! Waiting for approval.", welcome: "🥳 You're in! Welcome to the group." },
  es: { title: "Salidas abiertas", intro: "¿Solo y con ganas de salir? Únete a un grupo pequeño o crea una salida y deja que otros se unan.",
        safetyT: "Reglas de seguridad", safety: ["Solo mayores de 18", "Solo lugares públicos (café, restaurante, actividad)", "Grupos de 3 a 8 personas", "El organizador acepta a cada persona", "Chat solo para miembros aceptados", "Denuncia cualquier mal comportamiento"],
        create: "+ Crear salida abierta", none: "Aún no hay salidas abiertas en esta ciudad. ¡Crea la primera!", place: "Lugar", when: "Fecha y hora", size: "Tamaño del grupo (contigo)",
        note: "Una nota (opcional)", notePh: "Ej.: café y charla, hablamos árabe y español", adult: "Tengo 18 años o más y acepto las reglas", publish: "Publicar salida",
        join: "🙋 Quiero unirme", pending: "Pendiente", inS: "Aceptado ✓", host: "Organizas tú", leave: "Salir del grupo", cancel: "Cancelar salida",
        approve: "Aceptar", decline: "Rechazar", requests: "Solicitudes", seats: (a, b) => a + " de " + b + " plazas", full: "Completo",
        chatT: "Chat del grupo", chatPh: "Escribe un mensaje…", send: "Enviar", fbT: "¿Qué tal la salida?", fbPh: "¿Qué te gustó?", fbSend: "Enviar opinión", fbThanks: "¡Gracias! 🙏",
        shareFeed: "📣 Compartir la experiencia en el feed", report: "Denunciar", reported: "Denunciado. Lo revisaremos.", past: "Pasada", by: "con", err: "Algo salió mal. Inténtalo de nuevo.",
        needAdult: "Confirma que tienes 18 años o más.", needWhen: "Elige una fecha futura.", created: "🎉 ¡Salida publicada!", requested: "🙋 ¡Solicitud enviada! Esperando aprobación.", welcome: "🥳 ¡Aceptado! Bienvenido al grupo." },
  pt: { title: "Saídas abertas", intro: "Sozinho e com vontade de sair? Junta-te a um pequeno grupo ou cria uma saída e deixa outros juntarem-se.",
        safetyT: "Regras de segurança", safety: ["Apenas maiores de 18", "Apenas locais públicos (café, restaurante, atividade)", "Grupos de 3 a 8 pessoas", "O organizador aceita cada pessoa", "Chat só para membros aceites", "Denuncia qualquer mau comportamento"],
        create: "+ Criar saída aberta", none: "Ainda não há saídas abertas nesta cidade. Cria a primeira!", place: "Local", when: "Data e hora", size: "Tamanho do grupo (contigo)",
        note: "Uma nota (opcional)", notePh: "Ex.: café e conversa, falamos árabe e português", adult: "Tenho 18 anos ou mais e aceito as regras", publish: "Publicar saída",
        join: "🙋 Quero ir", pending: "Pendente", inS: "Aceite ✓", host: "És o organizador", leave: "Sair do grupo", cancel: "Cancelar saída",
        approve: "Aceitar", decline: "Recusar", requests: "Pedidos", seats: (a, b) => a + " de " + b + " lugares", full: "Completo",
        chatT: "Chat do grupo", chatPh: "Escreve uma mensagem…", send: "Enviar", fbT: "Como correu a saída?", fbPh: "Do que gostaste?", fbSend: "Enviar opinião", fbThanks: "Obrigado! 🙏",
        shareFeed: "📣 Partilhar a experiência no feed", report: "Denunciar", reported: "Denunciado. Vamos verificar.", past: "Passada", by: "com", err: "Algo correu mal. Tenta de novo.",
        needAdult: "Confirma que tens 18 anos ou mais.", needWhen: "Escolhe uma data futura.", created: "🎉 Saída publicada!", requested: "🙋 Pedido enviado! À espera de aprovação.", welcome: "🥳 Aceite! Bem-vindo ao grupo." }
};
const m = k => (M[S.lang] || M.en)[k];
const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
const placeOf = id => P.find(p => p.id === Number(id));
const nameOf = u => u.displayName || (u.email || "").split("@")[0] || "?";
const toast = t => { const e = $("toast"); e.textContent = t; e.hidden = false; clearTimeout(toast._t); toast._t = setTimeout(() => e.hidden = true, 2400); };
const needUser = fn => S.user ? fn() : (openAuth("up"));
const fmtWhen = ts => new Intl.DateTimeFormat(S.lang === "ar" ? "ar-MA" : S.lang, { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(ts.toDate());

/* ---------- Data: meetups in the current city + members of each ---------- */
let meetCity = null, meetSub = null, meetups = [], members = {}, memberSubs = {}, chats = {}, chatSubs = {}, openChat = null;

function watchCity() {
  if (meetCity === S.city && meetSub) return;
  if (meetSub && meetSub !== true) meetSub();
  Object.values(memberSubs).forEach(u => u()); memberSubs = {}; members = {};
  meetCity = S.city; meetSub = true;
  meetSub = onSnapshot(query(collection(db, "meetups"), where("city", "==", S.city), limit(60)), qs => {
    const now = Date.now() - 6 * 3600e3;               // keep outings visible for 6h after start (feedback)
    meetups = [];
    qs.forEach(d => { const v = d.data(); if (v.status !== "cancelled" && v.when && v.when.toMillis() > now - 3 * 86400e3) meetups.push({ id: d.id, ...v }); });
    meetups.sort((a, b) => a.when.toMillis() - b.when.toMillis());
    meetups.forEach(mt => watchMembers(mt.id));
    render();
  }, () => { meetups = null; render(); });
}

function watchMembers(id) {
  if (memberSubs[id]) return;
  memberSubs[id] = () => {};
  memberSubs[id] = onSnapshot(collection(db, "meetups", id, "members"), qs => {
    const prev = members[id] || [], list = [];
    qs.forEach(d => list.push({ uid: d.id, ...d.data() }));
    const me = S.user && list.find(x => x.uid === S.user.uid), was = S.user && prev.find(x => x.uid === S.user.uid);
    if (me && was && was.status === "pending" && me.status === "in") celebrate("🥳", m("welcome"), "", ["🎉", "🫂", "✨"]);
    members[id] = list; render();
  }, () => {});
}

onAuthStateChanged(auth, () => { if (S.view === "meet") render(); });

/* ---------- Actions ---------- */
async function createMeetup(f) {
  const msg = f.querySelector(".note.msg");
  if (!f.querySelector("#mt-adult").checked) { msg.textContent = m("needAdult"); return; }
  const whenVal = f.querySelector("#mt-when").value, when = whenVal ? new Date(whenVal) : null;
  if (!when || when.getTime() < Date.now()) { msg.textContent = m("needWhen"); return; }
  const pid = f.querySelector("#mt-place").value, size = Number(f.querySelector("#mt-size").value);
  const note = f.querySelector("#mt-note").value.trim().slice(0, 200);
  const ref = doc(collection(db, "meetups")), b = writeBatch(db);
  b.set(ref, { host: S.user.uid, hostName: nameOf(S.user), city: S.city, pid: String(pid), when: Timestamp.fromDate(when), size, note, status: "open", at: serverTimestamp() });
  b.set(doc(db, "meetups", ref.id, "members", S.user.uid), { name: nameOf(S.user), status: "in", adult: true, at: serverTimestamp() });
  try { await b.commit(); closeSheet(); celebrate("🫂", m("created"), placeOf(pid).n, ["🎉", "🫂", "✨"]); }
  catch (e) { msg.textContent = m("err"); }
}

async function join(id) {
  try {
    await setDoc(doc(db, "meetups", id, "members", S.user.uid), { name: nameOf(S.user), status: "pending", adult: true, at: serverTimestamp() });
    toast(m("requested"));
  } catch (e) { toast(m("err")); }
}
const setStatus = (id, uid, status) => updateDoc(doc(db, "meetups", id, "members", uid), { status }).catch(() => toast(m("err")));
const leave = (id) => deleteDoc(doc(db, "meetups", id, "members", S.user.uid)).catch(() => toast(m("err")));
const cancel = (id) => updateDoc(doc(db, "meetups", id), { status: "cancelled" }).catch(() => toast(m("err")));
const report = (id) => needUser(() => addDoc(collection(db, "reports"), { kind: "meetup", ref: id, uid: S.user.uid, at: serverTimestamp() }).then(() => toast(m("reported"))).catch(() => toast(m("err"))));

function watchChat(id) {
  if (chatSubs[id]) return;
  chatSubs[id] = () => {};
  chatSubs[id] = onSnapshot(query(collection(db, "meetups", id, "chat"), orderBy("at", "asc"), limit(200)), qs => {
    chats[id] = []; qs.forEach(d => chats[id].push({ id: d.id, ...d.data() })); render();
    const box = document.querySelector(`.chat[data-id="${id}"]`); if (box) box.scrollTop = box.scrollHeight;
  }, () => {});
}
async function sendChat(id, input) {
  const text = input.value.trim(); if (!text) return;
  input.value = "";
  try { await addDoc(collection(db, "meetups", id, "chat"), { uid: S.user.uid, name: nameOf(S.user), text: text.slice(0, 300), at: serverTimestamp() }); }
  catch (e) { toast(m("err")); input.value = text; }
}
async function sendFeedback(id, stars, text, box) {
  try {
    await setDoc(doc(db, "meetups", id, "reviews", S.user.uid), { stars, text: text.slice(0, 300), at: serverTimestamp() });
    box.replaceChildren(el("p", "note", m("fbThanks")));
    burst(["⭐", "🙏", "✨"], innerWidth / 2, innerHeight / 2, 12);
  } catch (e) { toast(m("err")); }
}

/* ---------- Create sheet ---------- */
function openCreate() {
  const sh = $("cmSheet"); sh.innerHTML = "";
  sh.appendChild(el("h3", "", m("create").replace("+ ", "")));
  const f = el("form", "compose"); f.noValidate = true;
  const fp = el("div", "fld2"), lp = el("label", "", m("place")); lp.htmlFor = "mt-place";
  const sel = el("select"); sel.id = "mt-place";
  P.filter(p => p.y === S.city && p.c !== "free").forEach(p => { const o = el("option", "", p.n + " · " + (p.p[1] === 0 ? T[S.lang].free : rng(p.p[0], p.p[1]) + " " + T[S.lang].mad)); o.value = p.id; sel.appendChild(o); });
  fp.append(lp, sel);
  const row = el("div", "row2");
  const fw = el("div", "fld2"), lw = el("label", "", m("when")); lw.htmlFor = "mt-when";
  const iw = el("input"); iw.type = "datetime-local"; iw.id = "mt-when";
  const d = new Date(Date.now() + 86400e3); d.setHours(18, 0, 0, 0);
  iw.value = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  fw.append(lw, iw);
  const fs = el("div", "fld2"), ls = el("label", "", m("size")); ls.htmlFor = "mt-size";
  const ss = el("select"); ss.id = "mt-size"; for (let i = 3; i <= 8; i++) { const o = el("option", "", String(i)); o.value = i; if (i === 4) o.selected = true; ss.appendChild(o); }
  fs.append(ls, ss); row.append(fw, fs);
  const fn = el("div", "fld2"), ln = el("label", "", m("note")); ln.htmlFor = "mt-note";
  const tn = el("textarea"); tn.id = "mt-note"; tn.maxLength = 200; tn.placeholder = m("notePh");
  fn.append(ln, tn);
  const ck = el("label", "check"), cb = el("input"); cb.type = "checkbox"; cb.id = "mt-adult"; ck.append(cb, el("span", "", m("adult")));
  const send = el("button", "btn cta", m("publish")); send.type = "submit";
  f.append(fp, row, fn, safetyBox(), ck, send, el("p", "note msg"));
  f.onsubmit = e => { e.preventDefault(); createMeetup(f); };
  sh.appendChild(f);
  const close = el("button", "link", T[S.lang].auClose); close.onclick = closeSheet; sh.appendChild(close);
  $("cmBg").hidden = false;
}
function closeSheet() { $("cmBg").hidden = true; }

function safetyBox() {
  const s = el("div", "safety"); s.appendChild(el("b", "", "🛡️ " + m("safetyT")));
  const ul = el("ul"); m("safety").forEach(t => ul.appendChild(el("li", "", t))); s.appendChild(ul); return s;
}

/* ---------- Render ---------- */
function renderMeet() {
  watchCity();
  const v = $("vMeet"); v.innerHTML = "";
  v.append(el("h2", "", m("title") + " · " + cityName(S.city)), el("p", "note", m("intro")));
  const cb = el("button", "btn cta", m("create")); cb.onclick = () => needUser(openCreate); v.appendChild(cb);
  v.appendChild(safetyBox());
  if (meetups === null) return v.appendChild(el("p", "empty", m("err")));
  if (!meetups.length) return v.appendChild(el("p", "empty", m("none")));

  meetups.forEach(mt => {
    const p = placeOf(mt.pid), mem = members[mt.id] || [], inL = mem.filter(x => x.status === "in"), pend = mem.filter(x => x.status === "pending");
    const me = S.user && mem.find(x => x.uid === S.user.uid), isHost = S.user && mt.host === S.user.uid, isIn = isHost || (me && me.status === "in");
    const past = mt.when.toMillis() < Date.now();
    const card = el("article", "meet");
    const top = el("div", "acts");
    top.append(el("span", "when", "🗓️ " + fmtWhen(mt.when)));
    if (past) top.appendChild(el("span", "pill", m("past")));
    else if (inL.length >= mt.size) top.appendChild(el("span", "pill", m("full")));
    card.appendChild(top);
    card.appendChild(el("b", "", "📍 " + (p ? p.n : "?") + (p ? " · " + p.a : "")));
    if (p) card.appendChild(el("small", "note num", (p.p[1] === 0 ? T[S.lang].free : "~" + rng(p.p[0], p.p[1]) + " " + T[S.lang].mad + " " + T[S.lang].perP)));
    if (mt.note) card.appendChild(el("div", "txt", "“" + mt.note + "”"));
    card.appendChild(el("small", "note", m("by") + " " + (mt.hostName || "?")));
    const seats = el("div", "seats");
    for (let i = 0; i < mt.size; i++) { const s = el("i", i < inL.length ? "on" : "", i < inL.length ? (inL[i].name || "?").charAt(0).toUpperCase() : ""); seats.appendChild(s); }
    card.append(seats, el("small", "note num", m("seats")(inL.length, mt.size)));

    const acts = el("div", "acts");
    if (isHost) acts.appendChild(el("span", "pill ok", m("host")));
    else if (me) acts.appendChild(el("span", "pill " + (me.status === "in" ? "ok" : "wait"), me.status === "in" ? m("inS") : m("pending")));
    if (!past && !me && !isHost && inL.length < mt.size) { const j = el("button", "btn cta", m("join")); j.onclick = () => needUser(() => openJoin(mt.id)); acts.appendChild(j); }
    if (!past && me && !isHost) { const l = el("button", "linkbtn", m("leave")); l.onclick = () => leave(mt.id); acts.appendChild(l); }
    if (!past && isHost) { const c = el("button", "linkbtn", m("cancel")); c.onclick = () => cancel(mt.id); acts.appendChild(c); }
    if (!isHost) { const r = el("button", "linkbtn", m("report")); r.onclick = () => report(mt.id); acts.appendChild(r); }
    card.appendChild(acts);

    if (isHost && pend.length) {
      card.appendChild(el("span", "lbl", m("requests")));
      pend.forEach(x => {
        const row = el("div", "mini"); row.appendChild(el("span", "", "🙋 " + (x.name || "?")));
        const bx = el("div", "acts");
        const a = el("button", "btn ghost", m("approve")); a.onclick = () => setStatus(mt.id, x.uid, "in");
        const d = el("button", "linkbtn", m("decline")); d.onclick = () => setStatus(mt.id, x.uid, "declined");
        if (inL.length >= mt.size) a.disabled = true;
        bx.append(a, d); row.appendChild(bx); card.appendChild(row);
      });
    }

    if (isIn) {
      watchChat(mt.id);
      card.appendChild(el("span", "lbl", "💬 " + m("chatT")));
      const box = el("div", "chat"); box.dataset.id = mt.id;
      (chats[mt.id] || []).forEach(c => { const b = el("div", "m" + (S.user && c.uid === S.user.uid ? " me" : "")); b.append(el("small", "", c.name || "?"), document.createTextNode(c.text)); box.appendChild(b); });
      const cf = el("form", "row2"); cf.noValidate = true;
      const ci = el("input"); ci.maxLength = 300; ci.placeholder = m("chatPh"); ci.setAttribute("aria-label", m("chatPh"));
      ci.style.cssText = "padding:9px 11px;border-radius:10px;border:1px solid var(--line);background:var(--surface)";
      const cs = el("button", "btn ghost", m("send")); cs.type = "submit"; cs.style.flex = "0 0 auto";
      cf.append(ci, cs); cf.onsubmit = e => { e.preventDefault(); sendChat(mt.id, ci); };
      card.append(box, cf);
      if (past) {
        const fb = el("div", "compose"); let stars = 5;
        const st = el("div", "stars");
        const draw = () => { st.innerHTML = ""; for (let i = 1; i <= 5; i++) { const b = el("button", "", "★"); b.type = "button"; b.setAttribute("aria-pressed", String(i <= stars)); b.onclick = () => { stars = i; draw(); }; st.appendChild(b); } };
        draw();
        const ta = el("textarea"); ta.maxLength = 300; ta.placeholder = m("fbPh");
        const sb = el("button", "btn cta", m("fbSend")); sb.onclick = () => sendFeedback(mt.id, stars, ta.value.trim(), fb);
        const sf = el("button", "btn ghost", m("shareFeed"));
        sf.onclick = () => { if (window.SX && SX.compose) SX.compose(mt.pid); };
        fb.append(el("span", "lbl", "⭐ " + m("fbT")), st, ta, sb, sf);
        card.appendChild(fb);
      }
    }
    v.appendChild(card);
  });
}

function openJoin(id) {
  const sh = $("cmSheet"); sh.innerHTML = "";
  sh.appendChild(el("h3", "", m("join")));
  const f = el("form", "compose"); f.noValidate = true;
  const ck = el("label", "check"), cb = el("input"); cb.type = "checkbox"; ck.append(cb, el("span", "", m("adult")));
  const go = el("button", "btn cta", m("join")); go.type = "submit"; const msg = el("p", "note");
  f.append(safetyBox(), ck, go, msg);
  f.onsubmit = e => { e.preventDefault(); if (!cb.checked) { msg.textContent = m("needAdult"); return; } closeSheet(); join(id); };
  sh.appendChild(f);
  const close = el("button", "link", T[S.lang].auClose); close.onclick = closeSheet; sh.appendChild(close);
  $("cmBg").hidden = false;
}

window.MX = { render: renderMeet };
if (S.view === "meet") render();
