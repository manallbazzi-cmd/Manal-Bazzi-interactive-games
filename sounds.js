// ═══════════════════════════════════════════════════════
//  SOUNDS SYSTEM — Teacher Manal Bazzi Platform
//  Pure Web Audio API — no external files needed
//  Auto-detects correct/wrong answers via MutationObserver
// ═══════════════════════════════════════════════════════

const SFX = (() => {
  let ctx = null;

  function getCtx() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  // ── Core tone generator ──────────────────────────────
  function tone(freq, type, duration, vol, startTime, ctx) {
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type      = type;
    osc.frequency.setValueAtTime(freq, startTime);
    gain.gain.setValueAtTime(vol, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  // ── ✅ Correct answer — happy rising chime ───────────
  function playCorrect() {
    try {
      const c = getCtx();
      const t = c.currentTime;
      const notes = [523, 659, 784, 1047]; // C5 E5 G5 C6
      notes.forEach((f, i) => tone(f, 'sine', 0.18, 0.25, t + i * 0.1, c));
    } catch(e) {}
  }

  // ── ❌ Wrong answer — low buzz ───────────────────────
  function playWrong() {
    try {
      const c = getCtx();
      const t = c.currentTime;
      tone(180, 'sawtooth', 0.12, 0.18, t,        c);
      tone(150, 'sawtooth', 0.12, 0.18, t + 0.13, c);
    } catch(e) {}
  }

  // ── 🏆 Level complete — fanfare ──────────────────────
  function playComplete() {
    try {
      const c = getCtx();
      const t = c.currentTime;
      const seq = [
        [523,0],[659,0.1],[784,0.2],[1047,0.32],[784,0.44],
        [1047,0.54],[1319,0.64]
      ];
      seq.forEach(([f,d]) => tone(f, 'sine', 0.22, 0.28, t + d, c));
    } catch(e) {}
  }

  // ── 🔘 Button click — soft tick ──────────────────────
  function playClick() {
    try {
      const c = getCtx();
      tone(800, 'sine', 0.06, 0.12, c.currentTime, c);
    } catch(e) {}
  }

  // ── ⭐ Star earned — sparkle ──────────────────────────
  function playStar() {
    try {
      const c = getCtx();
      const t = c.currentTime;
      [1200, 1600, 2000].forEach((f, i) => tone(f, 'sine', 0.12, 0.15, t + i * 0.07, c));
    } catch(e) {}
  }

  // ── Auto-detect answers via MutationObserver ──────────
  function autoDetect() {
    // Patterns that indicate correct/wrong in existing games
    const correctPatterns = [
      /correct|success|fb-good|fb-success|right|bravo|excellent|amazing|perfect/i
    ];
    const wrongPatterns = [
      /wrong|error|fb-bad|fb-error|incorrect|oops|missed/i
    ];
    const completePatterns = [
      /result|complete|finish|trophy|winner|champion|well.?done/i
    ];

    const observer = new MutationObserver(mutations => {
      for (const mut of mutations) {
        // Check added nodes text content and classes
        for (const node of mut.addedNodes) {
          if (node.nodeType !== 1) continue;
          const text = (node.textContent || '') + ' ' + (node.className || '');
          if (correctPatterns.some(p => p.test(text))) { playCorrect(); return; }
          if (wrongPatterns.some(p => p.test(text)))   { playWrong();   return; }
          if (completePatterns.some(p => p.test(text))){ playComplete();return; }
        }
        // Check attribute changes (class changes on existing elements)
        if (mut.type === 'attributes' && mut.attributeName === 'class') {
          const el  = mut.target;
          const cls = el.className || '';
          if (correctPatterns.some(p => p.test(cls))) { playCorrect(); return; }
          if (wrongPatterns.some(p => p.test(cls)))   { playWrong();   return; }
        }
        // Check characterData changes (text content changes)
        if (mut.type === 'characterData') {
          const text = mut.target.textContent || '';
          if (correctPatterns.some(p => p.test(text))) { playCorrect(); return; }
          if (wrongPatterns.some(p => p.test(text)))   { playWrong();   return; }
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class'],
      characterData: true,
    });

    // Add click sound to all buttons
    document.addEventListener('click', e => {
      if (e.target.matches('button, .btn, .choice, .balloon, .card, [onclick]')) {
        playClick();
      }
    }, true);
  }

  // Init after DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoDetect);
  } else {
    autoDetect();
  }

  return { playCorrect, playWrong, playComplete, playClick, playStar };
})();
