// ═══════════════════════════════════════════════════════
//  STARS & BADGES SYSTEM — Teacher Manal Bazzi Platform
//  Persists across all games via localStorage
// ═══════════════════════════════════════════════════════

const STARS_KEY  = 'manalPlatform_totalStars';
const BADGES_KEY = 'manalPlatform_badges';
const NAME_KEY   = 'manalPlatform_studentName';

const BADGE_DEFS = [
  { id:'first_star',   stars:1,    icon:'⭐',  title:'First Star!',        desc:'Earned your very first star',          color:'#fbbf24' },
  { id:'rising_star',  stars:5,    icon:'🌟',  title:'Rising Star',         desc:'5 stars collected',                    color:'#f59e0b' },
  { id:'math_wizard',  stars:15,   icon:'🧙',  title:'Math Wizard',         desc:'15 stars — incredible!',               color:'#8b5cf6' },
  { id:'superstar',    stars:30,   icon:'🏅',  title:'Superstar',           desc:'30 stars — you are amazing!',          color:'#f97316' },
  { id:'champion',     stars:50,   icon:'🏆',  title:'Champion',            desc:'50 stars — true champion!',            color:'#ef4444' },
  { id:'legend',       stars:100,  icon:'👑',  title:'Legend',              desc:'100 stars — you are a legend!',        color:'#6c3fff' },
  { id:'unstoppable',  stars:200,  icon:'🚀',  title:'Unstoppable',         desc:'200 stars — sky is not the limit!',   color:'#0bbfbf' },
];

// ── Read / Write ──────────────────────────────────────────
function getGlobalStars() {
  return parseInt(localStorage.getItem(STARS_KEY) || '0');
}
function setGlobalStars(n) {
  localStorage.setItem(STARS_KEY, String(n));
}
function getEarnedBadges() {
  try { return JSON.parse(localStorage.getItem(BADGES_KEY) || '[]'); }
  catch { return []; }
}
function saveEarnedBadges(arr) {
  localStorage.setItem(BADGES_KEY, JSON.stringify(arr));
}
function getStudentName() {
  return localStorage.getItem(NAME_KEY) || '';
}
function setStudentName(name) {
  if (name) localStorage.setItem(NAME_KEY, name);
}

// ── Add Stars & Unlock Badges ─────────────────────────────
function addGlobalStars(n) {
  const prev    = getGlobalStars();
  const next    = prev + n;
  setGlobalStars(next);

  const earned  = getEarnedBadges();
  const newBadges = [];

  BADGE_DEFS.forEach(b => {
    if (next >= b.stars && !earned.includes(b.id)) {
      earned.push(b.id);
      newBadges.push(b);
    }
  });
  saveEarnedBadges(earned);

  // update any floating counter on the page
  const el = document.getElementById('global-stars-count');
  if (el) el.textContent = next;

  // show badge popups one by one
  newBadges.forEach((b, i) => {
    setTimeout(() => showBadgePopup(b), i * 2200);
  });

  return next;
}

// ── Badge Popup ───────────────────────────────────────────
function showBadgePopup(badge) {
  const existing = document.getElementById('badge-popup-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'badge-popup-overlay';
  overlay.style.cssText = `
    position:fixed;inset:0;background:rgba(0,0,0,.55);
    display:flex;align-items:center;justify-content:center;
    z-index:9999;animation:fadeInOverlay .3s ease;
  `;

  overlay.innerHTML = `
    <style>
      @keyframes fadeInOverlay{from{opacity:0}to{opacity:1}}
      @keyframes badgePop{0%{transform:scale(.4) rotate(-10deg);opacity:0}70%{transform:scale(1.12) rotate(2deg)}100%{transform:scale(1) rotate(0);opacity:1}}
      @keyframes badgeBounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
      @keyframes shimmer{0%,100%{box-shadow:0 0 30px ${badge.color}88}50%{box-shadow:0 0 60px ${badge.color}cc}}
    </style>
    <div style="
      background:white;border-radius:28px;padding:40px 36px;text-align:center;
      max-width:320px;width:90%;
      animation:badgePop .5s cubic-bezier(.34,1.56,.64,1) forwards, shimmer 2s ease-in-out 0.5s infinite;
      box-shadow:0 20px 60px rgba(0,0,0,.25);
    ">
      <div style="font-size:14px;font-weight:800;color:#94a3b8;letter-spacing:2px;margin-bottom:12px">
        🎉 NEW BADGE UNLOCKED!
      </div>
      <div style="font-size:80px;animation:badgeBounce 1.5s ease-in-out infinite;display:block;margin-bottom:12px">
        ${badge.icon}
      </div>
      <div style="font-size:26px;font-weight:900;color:${badge.color};margin-bottom:6px">
        ${badge.title}
      </div>
      <div style="font-size:14px;color:#6b7280;margin-bottom:24px">
        ${badge.desc}
      </div>
      <button onclick="document.getElementById('badge-popup-overlay').remove()" style="
        background:${badge.color};color:white;border:none;
        padding:12px 36px;border-radius:50px;
        font-size:15px;font-weight:800;cursor:pointer;
        transition:opacity .2s;
      " onmouseover="this.style.opacity='.85'" onmouseout="this.style.opacity='1'">
        Awesome! 🌟
      </button>
    </div>
  `;

  document.body.appendChild(overlay);
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
  setTimeout(() => { if (overlay.parentNode) overlay.remove(); }, 6000);
}

// ── Floating Stars Widget ─────────────────────────────────
// Call this once in each game page to inject a persistent counter
function injectStarsWidget() {
  if (document.getElementById('stars-widget')) return;

  const widget = document.createElement('div');
  widget.id = 'stars-widget';
  widget.style.cssText = `
    position:fixed;bottom:20px;right:20px;
    background:linear-gradient(135deg,#1a1150,#6c3fff);
    color:white;border-radius:50px;
    padding:10px 18px;font-size:15px;font-weight:800;
    display:flex;align-items:center;gap:8px;
    box-shadow:0 4px 20px rgba(108,63,255,.4);
    z-index:1000;cursor:pointer;
    transition:transform .2s;
  `;
  widget.onmouseover = () => widget.style.transform = 'scale(1.06)';
  widget.onmouseout  = () => widget.style.transform = 'scale(1)';
  widget.innerHTML = `⭐ <span id="global-stars-count">${getGlobalStars()}</span> Stars`;
  widget.title = 'Total stars across all games';
  document.body.appendChild(widget);
}

// ── Badges Display Panel (for index page) ─────────────────
function renderBadgesPanel(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const earned  = getEarnedBadges();
  const total   = getGlobalStars();

  let html = `
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;flex-wrap:wrap">
      <div style="background:linear-gradient(135deg,#6c3fff,#3a86ff);color:white;border-radius:16px;padding:14px 24px;display:flex;align-items:center;gap:10px;font-weight:900;font-size:1.1rem">
        ⭐ <span id="global-stars-count">${total}</span> Total Stars
      </div>
      <div style="color:#6b7280;font-size:.9rem;font-weight:700">${earned.length} / ${BADGE_DEFS.length} badges unlocked</div>
    </div>
    <div style="display:flex;flex-wrap:wrap;gap:12px">
  `;

  BADGE_DEFS.forEach(b => {
    const unlocked = earned.includes(b.id);
    html += `
      <div style="
        background:${unlocked ? 'white' : '#f8fafc'};
        border:2px solid ${unlocked ? b.color : '#e5e7eb'};
        border-radius:16px;padding:16px;text-align:center;
        width:120px;transition:transform .2s;
        opacity:${unlocked ? '1' : '.45'};
        box-shadow:${unlocked ? '0 4px 16px ' + b.color + '33' : 'none'};
      " title="${b.desc}">
        <div style="font-size:36px;margin-bottom:6px">${unlocked ? b.icon : '🔒'}</div>
        <div style="font-size:.72rem;font-weight:800;color:${unlocked ? b.color : '#9ca3af'}">${b.title}</div>
        <div style="font-size:.64rem;color:#9ca3af;margin-top:3px">${b.stars}⭐ needed</div>
      </div>
    `;
  });

  html += `</div>`;
  container.innerHTML = html;
}
