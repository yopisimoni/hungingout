// Kharja – Firebase layer: accounts, saved plans with share links, live votes, venue listing requests.
// The web config below is public by design (it identifies the project; access is controlled by firestore.rules).
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult,
  createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore, doc, getDoc, setDoc, addDoc, collection, onSnapshot, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAp4ATE2QpTWPf54sOHBNiBcnbS2iNziDg", // gitleaks:allow (public Firebase web key, restricted by referrer)
  authDomain: "hanging-out-dbfd0.firebaseapp.com",
  projectId: "hanging-out-dbfd0",
  storageBucket: "hanging-out-dbfd0.firebasestorage.app",
  messagingSenderId: "588189884164",
  appId: "1:588189884164:web:8082b4bae9dfe3b87bfa51"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

/* ---------- Strings (5 languages) ---------- */
const TX = {
  ar: { saving: "جاري حفظ الخطة…", needSign: "سجّل الدخول باش تشارك الخطة ديالك.", voteSign: "سجّل الدخول باش تصوّت.",
        copied: "تنسخ مع الرابط ✓", out: "خروج؟", sent: n => "✓ توصلنا بالطلب ديال «" + n + "». غادي نتواصلو معاك قريباً.",
        err: "وقع مشكل. عاود من بعد شوية.", wrongPass: "الإيميل ولا كلمة السر غالطين.", inUse: "هاد الإيميل عندو حساب. دير دخول.",
        weak: "كلمة السر خاصها 6 حروف على الأقل.", notFound: "هاد الخطة ما بقاتش موجودة.", voted: "✓ تسجل التصويت ديالك" },
  fr: { saving: "Enregistrement du plan…", needSign: "Connectez-vous pour partager votre plan.", voteSign: "Connectez-vous pour voter.",
        copied: "Copié avec le lien ✓", out: "Déconnexion ?", sent: n => "✓ Demande pour « " + n + " » reçue. On vous recontacte bientôt.",
        err: "Un problème est survenu. Réessayez.", wrongPass: "E-mail ou mot de passe incorrect.", inUse: "Cet e-mail a déjà un compte. Connectez-vous.",
        weak: "Le mot de passe doit faire au moins 6 caractères.", notFound: "Ce plan n'existe plus.", voted: "✓ Vote enregistré" },
  en: { saving: "Saving your plan…", needSign: "Sign in to share your plan.", voteSign: "Sign in to vote.",
        copied: "Copied with link ✓", out: "Sign out?", sent: n => "✓ Request for “" + n + "” received. We'll be in touch soon.",
        err: "Something went wrong. Try again.", wrongPass: "Wrong email or password.", inUse: "This email already has an account. Sign in instead.",
        weak: "Password needs at least 6 characters.", notFound: "This plan no longer exists.", voted: "✓ Vote saved" },
  es: { saving: "Guardando el plan…", needSign: "Inicia sesión para compartir tu plan.", voteSign: "Inicia sesión para votar.",
        copied: "Copiado con enlace ✓", out: "¿Cerrar sesión?", sent: n => "✓ Solicitud de «" + n + "» recibida. Te contactamos pronto.",
        err: "Algo salió mal. Inténtalo de nuevo.", wrongPass: "Email o contraseña incorrectos.", inUse: "Este email ya tiene cuenta. Inicia sesión.",
        weak: "La contraseña necesita al menos 6 caracteres.", notFound: "Este plan ya no existe.", voted: "✓ Voto guardado" },
  pt: { saving: "A guardar o plano…", needSign: "Inicia sessão para partilhar o teu plano.", voteSign: "Inicia sessão para votar.",
        copied: "Copiado com link ✓", out: "Terminar sessão?", sent: n => "✓ Pedido de «" + n + "» recebido. Entramos em contacto em breve.",
        err: "Algo correu mal. Tenta de novo.", wrongPass: "Email ou palavra-passe incorretos.", inUse: "Este email já tem conta. Inicia sessão.",
        weak: "A palavra-passe precisa de pelo menos 6 caracteres.", notFound: "Este plano já não existe.", voted: "✓ Voto guardado" }
};
const t = k => (TX[S.lang] || TX.en)[k];
const msg = (el, text, color) => { el.textContent = text; el.style.color = color || "var(--muted)"; };
const authErr = e => {
  const c = e && e.code || "";
  if (c.includes("invalid-credential") || c.includes("wrong-password") || c.includes("user-not-found") || c.includes("invalid-email")) return t("wrongPass");
  if (c.includes("email-already-in-use")) return t("inUse");
  if (c.includes("weak-password")) return t("weak");
  return t("err");
};

/* ---------- Auth ---------- */
let pending = null;              // action to resume after sign-in (share / vote)
S.user = null;

onAuthStateChanged(auth, async user => {
  S.user = user;
  S.signOutAsk = false;
  render();
  if (user) {
    try {
      await setDoc(doc(db, "users", user.uid),
        { name: user.displayName || "", email: user.email || "", lang: S.lang, lastSeen: serverTimestamp() }, { merge: true });
    } catch (e) { /* profile is optional */ }
    if (pending) { const p = pending; pending = null; closeAuth(); p(); }
  }
});
getRedirectResult(auth).catch(() => {});

async function google() {
  const m = $("auMsg");
  try {
    await signInWithPopup(auth, new GoogleAuthProvider());
    closeAuth();
  } catch (e) {
    if (e.code === "auth/popup-blocked" || e.code === "auth/operation-not-supported-in-this-environment") {
      return signInWithRedirect(auth, new GoogleAuthProvider());
    }
    if (e.code !== "auth/popup-closed-by-user" && e.code !== "auth/cancelled-popup-request") msg(m, authErr(e), "var(--over)");
  }
}

async function emailAuth() {
  const L = T[S.lang], m = $("auMsg");
  const email = $("au-email").value.trim(), pass = $("au-pass").value, name = $("au-name").value.trim();
  if (!email || !pass) return msg(m, L.auErr, "var(--over)");
  try {
    if (S.auth === "up") {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      if (name) { await updateProfile(cred.user, { displayName: name }); S.user = auth.currentUser; render(); }
    } else {
      await signInWithEmailAndPassword(auth, email, pass);
    }
    closeAuth();
  } catch (e) { msg(m, authErr(e), "var(--over)"); }
}

function userBtn() {
  if (S.signOutAsk) { S.signOutAsk = false; signOut(auth); return; }
  S.signOutAsk = true; render();
  setTimeout(() => { if (S.signOutAsk) { S.signOutAsk = false; render(); } }, 3000);
}

function requireUser(action, why) {
  if (S.user) return action();
  pending = action;
  openAuth("up");
  msg($("auMsg"), why);
}

/* ---------- Plans: save, share, open ---------- */
let saved = { key: "", id: "" };
const planKey = () => [S.city, S.people, S.budget, S.plan.join(",")].join("|");
const planUrl = id => location.origin + location.pathname + "?plan=" + id;

async function savePlan() {
  if (saved.key === planKey() && saved.id) return saved.id;
  const ref = await addDoc(collection(db, "plans"), {
    owner: S.user.uid, ownerName: S.user.displayName || "", city: S.city, people: S.people,
    budget: S.budget, stops: S.plan.slice(0, 6), lang: S.lang, createdAt: serverTimestamp()
  });
  saved = { key: planKey(), id: ref.id };
  return ref.id;
}

async function share(kind) {
  if (!S.plan.length) return;
  requireUser(async () => {
    const btn = kind === "copy" ? $("copyBtn") : $("waBtn"), old = btn.textContent;
    btn.textContent = t("saving");
    try {
      const id = await savePlan();
      const text = $("waBtn").dataset.msg + "\n\n👉 " + planUrl(id);
      if (kind === "copy") {
        try { await navigator.clipboard.writeText(text); } catch (e) {
          const ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta); ta.select();
          try { document.execCommand("copy"); } catch (_) {} ta.remove();
        }
        btn.textContent = t("copied"); setTimeout(() => btn.textContent = T[S.lang].copy, 1800);
      } else {
        btn.textContent = old;
        location.href = "https://wa.me/?text=" + encodeURIComponent(text);
      }
    } catch (e) { btn.textContent = old; alertMsg(t("err")); }
  }, t("needSign"));
}

$("waBtn").addEventListener("click", e => { e.preventDefault(); share("wa"); });

let unsubVotes = null;
async function openSharedPlan(id) {
  try {
    const snap = await getDoc(doc(db, "plans", id));
    if (!snap.exists()) return alertMsg(t("notFound"));
    const d = snap.data();
    Object.assign(S, { city: d.city, people: d.people, budget: d.budget, plan: d.stops || [], friend: true, shared: { id, owner: d.owner } });
    $("budget").value = d.budget;
    saved = { key: planKey(), id };
    render();
    $("friendView").scrollIntoView({ block: "start" });
    unsubVotes = onSnapshot(collection(db, "plans", id, "votes"), qs => {
      const tally = {}; S.votes = {};
      qs.forEach(v => {
        const vv = v.data().v || {};
        for (const [pid, val] of Object.entries(vv)) {
          tally[pid] = tally[pid] || { y: 0, n: 0 };
          if (val === "y") tally[pid].y++; else if (val === "n") tally[pid].n++;
        }
        if (S.user && v.id === S.user.uid) S.votes = { ...vv };
      });
      S.tally = tally; render();
    });
  } catch (e) { alertMsg(t("err")); }
}

function vote(pid, val) {
  requireUser(async () => {
    try {
      await setDoc(doc(db, "plans", S.shared.id, "votes", S.user.uid),
        { name: S.user.displayName || "", v: { [pid]: val }, at: serverTimestamp() }, { merge: true });
    } catch (e) { alertMsg(t("err")); }
  }, t("voteSign"));
}

/* ---------- Venue listing requests ---------- */
async function listing() {
  const L = T[S.lang], m = $("bzMsg");
  const name = $("bz-name").value.trim(), contact = $("bz-contact").value.trim();
  if (!name || !contact) return msg(m, L.bzErr, "var(--over)");
  const btn = $("bzSend"); btn.disabled = true;
  try {
    await addDoc(collection(db, "listingRequests"), {
      name: name.slice(0, 120), city: $("bz-city").value, type: $("bz-type").value,
      price: $("bz-price").value.trim().slice(0, 40), contact: contact.slice(0, 120), lang: S.lang, createdAt: serverTimestamp()
    });
    msg(m, t("sent")(name), "var(--ok)");
    $("bizForm").reset();
  } catch (e) { msg(m, t("err"), "var(--over)"); }
  btn.disabled = false;
}

/* small inline notice under the tray (no alert() dialogs) */
function alertMsg(text) {
  const el = $("trayStops"); el.textContent = text; el.style.color = "var(--over)";
  setTimeout(() => { el.style.color = ""; render(); }, 3500);
}

window.KX = { google, emailAuth, userBtn, share, vote, listing, t };

const planId = new URLSearchParams(location.search).get("plan");
if (planId && /^[A-Za-z0-9]{10,40}$/.test(planId)) openSharedPlan(planId);
