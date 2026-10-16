// Kharja – motion layer: how the app answers every tap (user side only).
// Wraps render() and animates what changed: views slide in, cards cascade, chips pop,
// places fly into the plan tray, numbers count up. Respects prefers-reduced-motion.
(function () {
  const reduce = (() => { try { return matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { return false; } })();
  if (reduce || typeof render !== "function") return;

  const ORDER = ["explore", "meet", "feed", "me"];
  const haptic = ms => { try { navigator.vibrate && navigator.vibrate(ms); } catch (e) {} };
  let lastTap = null, lastTapEl = null;
  document.addEventListener("pointerdown", e => { lastTap = { x: e.clientX, y: e.clientY }; lastTapEl = e.target.closest("button,a"); }, true);

  const snap = () => ({ view: S.view || "explore", city: S.city, vibe: S.vibe, cat: S.cat, plan: S.plan.length, people: S.people, budget: S.budget,
                        pp: S.people ? Math.round(S.budget / S.people) : 0, sugg: (document.querySelector("#suggest li") || {}).textContent || "" });

  // State changes happen before render() is called, so compare with the state of the previous render.
  const original = render;
  let prev = snap();
  window.render = render = function () {
    original.apply(this, arguments);
    const now = snap(), before = prev; prev = now;
    try { resumeCascades(); animate(before, now); } catch (e) { /* motion must never break the app */ }
  };

  function enter(el, cls) { if (!el) return; el.classList.remove("k-in", "k-left", "k-right"); void el.offsetWidth; el.classList.add("k-in"); if (cls) el.classList.add(cls); }
  // Other modules re-render shortly after (e.g. live counts), which rebuilds the cards.
  // Keep the cascade going across those re-renders by resuming each card's animation where it was.
  let running = [];
  function cascade(selector, resumeAt) {
    const t0 = resumeAt || performance.now(), elapsed = performance.now() - t0;
    if (!resumeAt) running = running.filter(r => r.sel !== selector).concat([{ sel: selector, t0 }]);
    document.querySelectorAll(selector).forEach((c, i) => {
      if (i > 11) return;
      if (!resumeAt) { c.classList.remove("k-in"); void c.offsetWidth; }
      c.style.animationDelay = (i * 45 - elapsed) + "ms"; c.classList.add("k-in");
    });
  }
  function resumeCascades() {
    const now = performance.now();
    running = running.filter(r => now - r.t0 < 1100);
    running.forEach(r => cascade(r.sel, r.t0));
  }
  function bump(el) { if (!el) return; el.classList.remove("k-bump"); void el.offsetWidth; el.classList.add("k-bump"); }

  function countUp(el, from, to) {
    if (!el || from === to) return;
    const t0 = performance.now(), dur = 420;
    const step = t => { const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      el.textContent = fmt(from + (to - from) * e); if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }

  function flyToTray() {
    const tray = document.getElementById("tray"); if (!tray || tray.hidden) return;
    const from = lastTapEl ? lastTapEl.getBoundingClientRect() : null;
    const to = tray.getBoundingClientRect();
    const name = lastTapEl && lastTapEl.closest(".card") ? (lastTapEl.closest(".card").querySelector(".name") || {}).textContent : "";
    const b = document.createElement("div"); b.className = "k-fly"; b.textContent = "📍 " + (name || "");
    document.body.appendChild(b);
    const sx = from ? from.left + from.width / 2 : innerWidth / 2, sy = from ? from.top : innerHeight / 2;
    const ex = to.left + to.width / 2, ey = to.top + 20;
    b.animate([
      { transform: `translate(${sx}px,${sy}px) translate(-50%,-50%) scale(1)`, opacity: 1 },
      { transform: `translate(${(sx + ex) / 2}px,${Math.min(sy, ey) - 120}px) translate(-50%,-50%) scale(1.1)`, opacity: 1, offset: .5 },
      { transform: `translate(${ex}px,${ey}px) translate(-50%,-50%) scale(.4)`, opacity: .2 }
    ], { duration: 650, easing: "cubic-bezier(.3,.7,.2,1)" }).onfinish = () => { b.remove(); bump(tray.querySelector(".tray-in")); haptic(12); };
  }

  function animate(a, b) {
    if (a.view !== b.view) {
      const dir = (ORDER.indexOf(b.view) > ORDER.indexOf(a.view)) !== (document.documentElement.dir === "rtl") ? "k-right" : "k-left";
      enter(document.getElementById({ explore: "vExplore", meet: "vMeet", feed: "vFeed", me: "vMe" }[b.view]), dir);
      bump(document.querySelector('#mainNav [aria-current="true"]'));
      haptic(8);
      if (b.view === "explore") cascade("#list > .card");
      if (b.view === "feed") cascade("#vFeed .post");
      if (b.view === "meet") cascade("#vMeet .meet");
      return;
    }
    if (b.view !== "explore") return;
    if (a.city !== b.city) {
      cascade("#list > .card"); enter(document.getElementById("suggest"));
      if (lastTap && window.burst) burst(["📍", "✨"], lastTap.x, lastTap.y, 7);
      haptic(10);
    } else if (a.vibe !== b.vibe || a.cat !== b.cat) {
      cascade("#list > .card");
      if (lastTap && window.burst) burst([b.vibe === "luxe" ? "💎" : b.vibe === "chic" ? "✨" : b.vibe === "casual" ? "☕" : "🎯"], lastTap.x, lastTap.y, 6);
      haptic(8);
    }
    if (b.plan > a.plan) flyToTray();
    else if (b.plan < a.plan) bump(document.querySelector("#tray .tray-in"));
    if (a.pp !== b.pp) { countUp(document.getElementById("ppVal"), a.pp, b.pp); bump(document.querySelector(".pp")); }
    if (a.people !== b.people) { bump(document.getElementById("people")); haptic(6); }
    if (a.sugg && b.sugg && a.sugg !== b.sugg) bump(document.getElementById("suggest"));
  }

  // first paint: gentle entrance
  requestAnimationFrame(() => {
    ["header.top", ".tagline", ".hero", "#mainNav", "#cityChips", ".panel"].forEach((s, i) => {
      const e = document.querySelector(s); if (!e) return; e.style.animationDelay = (i * 70) + "ms"; e.classList.add("k-in");
    });
    cascade("#list > .card");
  });

  // every chip / city / nav tap gets a tactile pop
  document.addEventListener("click", e => {
    const t = e.target.closest(".chip,.city,.mainnav button,.stepper button,.react button,.emo button,.stars button,.add");
    if (t) bump(t);
  });
})();
