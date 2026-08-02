// mdbook-vi-mode: Vim-style navigation for mdBook, with real vi editing
// inside editable code blocks.
//
// Three states:
//   reading - no cursor; j/k scroll the page, everything else passes through.
//   nav     - a cursor moves through sidebar links and page content.
//   code    - inside an Ace editor with vim keybindings active.
//
// mdBook ships Ace but NOT its vim keybinding module, so the preprocessor
// also writes keybinding-vim.js next to this file and loads it first. Without
// that module `setKeyboardHandler("ace/keyboard/vim")` fails silently and the
// editor behaves like a plain textarea.
//
(function () {
  if (window.__viModeLoaded) return;
  window.__viModeLoaded = true;

  const CFG = Object.assign(
    {
      toggleKey: "`",
      startActive: false,
      cursorColor: "#e46876",
      codeBlocks: true,
    },
    window.__viModeConfig || {},
  );

  document.documentElement.style.setProperty("--vi-cursor", CFG.cursorColor);

  // ── State ──────────────────────────────────────────────────────────────────

  const STATE = { READING: "reading", NAV: "nav", CODE: "code" };
  let state = STATE.READING;

  const ZONE_KEY = "vi-mode-zone";
  const ACTIVE_KEY = "vi-mode-active";
  const storedActive = sessionStorage.getItem(ACTIVE_KEY);
  let active =
    storedActive === null ? CFG.startActive : storedActive === "true";
  let zone = sessionStorage.getItem(ZONE_KEY) || "content";

  const idx = { sidebar: 0, content: 0 };
  let cursorEl = null;
  let pendingG = false;
  let gTimer = null;
  let aceEditor = null;

  // ── Selectors ──────────────────────────────────────────────────────────────

  // mdBook wraps editable code blocks in a <pre> containing a <code class="editable">.
  // There is no .playground div in all mdBook versions — match the <pre> directly.
  const CONTENT_SEL =
    "#mdbook-content main :is(h1,h2,h3,h4,h5,h6,p,li,blockquote,table)";
  const EDITABLE_SEL = "#mdbook-content main pre:has(.editable)";

  const isVisible = (el) => {
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };

  const targets = (z) => {
    if (z === "sidebar") {
      return Array.from(document.querySelectorAll("#mdbook-sidebar a")).filter(
        isVisible,
      );
    }
    const content = Array.from(document.querySelectorAll(CONTENT_SEL)).filter(
      (el) => isVisible(el) && el.textContent.trim().length,
    );
    if (!CFG.codeBlocks) return content;
    const editables = Array.from(
      document.querySelectorAll(EDITABLE_SEL),
    ).filter(isVisible);
    // Merge both sets in document order.
    return Array.from(
      document.querySelectorAll(`${CONTENT_SEL}, ${EDITABLE_SEL}`),
    ).filter((el) =>
      el.tagName === "PRE" ? editables.includes(el) : content.includes(el),
    );
  };

  // ── Cursor / scrolling ─────────────────────────────────────────────────────

  const clearCursor = () => {
    if (cursorEl) cursorEl.classList.remove("vi-cursor");
    cursorEl = null;
  };

  const SCROLL_STEP = 64;

  const scroller = () => {
    const c = document.getElementById("mdbook-content");
    if (c && c.scrollHeight > c.clientHeight + 1) return c;
    return document.scrollingElement || document.documentElement;
  };

  const scrollByPx = (dy, smooth) =>
    scroller().scrollBy({ top: dy, behavior: smooth ? "smooth" : "auto" });
  const scrollToEdge = (bottom) =>
    scroller().scrollTo({
      top: bottom ? scroller().scrollHeight : 0,
      behavior: "smooth",
    });

  // ── Badge ──────────────────────────────────────────────────────────────────

  let indicator;
  let badgeLabel = "VI";

  const setBadge = (text) => {
    badgeLabel = text;
    if (indicator) indicator.textContent = text;
  };

  const updateBadge = () => {
    document.body.classList.toggle("vi-mode-active", state === STATE.NAV);
    document.body.classList.toggle("vi-code-active", state === STATE.CODE);
    if (state === STATE.NAV) setBadge("VI");
  };

  // ── Nav painting ───────────────────────────────────────────────────────────

  const paint = () => {
    if (state === STATE.READING) return;
    const list = targets(zone);
    if (!list.length) return;
    idx[zone] = Math.max(0, Math.min(idx[zone], list.length - 1));
    clearCursor();
    cursorEl = list[idx[zone]];
    cursorEl.classList.add("vi-cursor");
    cursorEl.scrollIntoView({ block: "center", behavior: "smooth" });
    sessionStorage.setItem(ZONE_KEY, zone);
  };

  const move = (delta) => {
    const n = targets(zone).length;
    if (!n) return;
    idx[zone] = (idx[zone] + delta + n) % n;
    paint();
  };

  const currentChapterIndex = () => {
    const list = targets("sidebar");
    const path = location.pathname;
    const i = list.findIndex(
      (a) => a.getAttribute("href") && new URL(a.href).pathname === path,
    );
    return i >= 0 ? i : idx.sidebar;
  };

  const setZone = (z) => {
    if (zone === z) return;
    zone = z;
    if (zone === "sidebar") idx.sidebar = currentChapterIndex();
    paint();
  };

  // ── Ace lookup ─────────────────────────────────────────────────────────────

  // mdBook's editor.js pushes every Ace instance onto window.editors and
  // attaches each to the `.editable` element. Reusing that array avoids
  // calling ace.edit() ourselves, which can re-initialise an existing editor.
  const editorFor = (preEl) => {
    const list = window.editors;
    if (!Array.isArray(list)) return null;
    // The Ace editor's container is the <code class="editable"> inside the <pre>.
    // Match by checking if the editor's container is a child of the <pre>.
    return (
      list.find((ed) => ed && ed.container && preEl.contains(ed.container)) ||
      null
    );
  };

  const isEditableBlock = (el) =>
    !!el && el.tagName === "PRE" && !!editorFor(el);

  // True when the vim handler is loaded and the editor is in normal (or
  // visual) mode rather than insert. Ace's vim layer keeps its state on the
  // CodeMirror shim at editor.state.cm.state.vim.
  // The vim handler's attach() sets editor.state.cm, and the CodeMirror shim
  // keeps its mode flags on cm.state.vim.
  const vimState = (editor) => {
    try {
      return editor.state && editor.state.cm && editor.state.cm.state.vim;
    } catch (_) {
      return null;
    }
  };

  const inInsertMode = (editor) => {
    const v = vimState(editor);
    return !!(v && v.insertMode);
  };

  // Resolve the vim module once. Returns null if keybinding-vim.js never
  // loaded, in which case code-block editing is unavailable.
  const vimModule = () => {
    if (typeof ace === "undefined" || !ace.require) return null;
    try {
      return ace.require("ace/keyboard/vim") || null;
    } catch (_) {
      return null;
    }
  };

  // ── CODE mode ──────────────────────────────────────────────────────────────

  // The vim handler exposes getStatusText(), which already formats INSERT,
  // VISUAL / VISUAL LINE / VISUAL BLOCK and any pending key sequence.
  const refreshCodeBadge = () => {
    if (state !== STATE.CODE || !aceEditor) return;
    const mod = vimModule();
    let text = "";
    if (mod && mod.handler && mod.handler.getStatusText) {
      try {
        text = mod.handler.getStatusText(aceEditor) || "";
      } catch (_) {
        text = "";
      }
    }
    setBadge(text ? "-- " + text + " --" : "-- NORMAL --");
  };

  const enterCodeMode = (playgroundEl, goInsert) => {
    if (!CFG.codeBlocks) return false;
    const editor = editorFor(playgroundEl);
    if (!editor) return false;

    // Bail out loudly if the vim module never loaded, otherwise the editor
    // silently behaves like a plain textarea and the user cannot escape.
    const mod = vimModule();
    if (!mod || !mod.handler) {
      console.warn(
        "[vi-mode] ace/keyboard/vim is not loaded; code-block editing disabled. " +
          "Ensure keybinding-vim.js is served alongside vi-mode.js.",
      );
      return false;
    }

    aceEditor = editor;
    state = STATE.CODE;
    updateBadge();

    // Pass the handler OBJECT, not the string id. Ace resolves a string
    // through config.loadModule, which is callback-based, so editor.state.cm
    // (created by the handler's attach()) would not exist yet on the next
    // line. Handing over the object attaches synchronously.
    editor.setKeyboardHandler(mod.handler);
    editor.focus();

    // The handler signals 'changeStatus' on the Ace editor whenever the vim
    // mode or pending key sequence changes.
    if (!editor._viStatusHook) {
      editor._viStatusHook = () => refreshCodeBadge();
      editor.on("changeStatus", editor._viStatusHook);
    }

    if (goInsert) {
      const V = mod.Vim || (mod.CodeMirror && mod.CodeMirror.Vim);
      const cm = editor.state && editor.state.cm;
      if (V && cm) {
        try {
          V.handleKey(cm, "i", "mapping");
        } catch (_) {
          /* stay in normal */
        }
      }
    }

    refreshCodeBadge();
    return true;
  };

  const leaveCodeMode = () => {
    if (aceEditor) {
      if (aceEditor._viStatusHook) {
        aceEditor.off("changeStatus", aceEditor._viStatusHook);
        aceEditor._viStatusHook = null;
      }
      aceEditor.setKeyboardHandler(null);
      aceEditor.blur();
      aceEditor = null;
    }
    state = STATE.NAV;
    active = true;
    sessionStorage.setItem(ACTIVE_KEY, "true");
    updateBadge();
    document.body.focus({ preventScroll: true });
    paint();
  };

  // ── Activation from nav ────────────────────────────────────────────────────

  const activate = () => {
    const el = targets(zone)[idx[zone]];
    if (!el) return;
    if (CFG.codeBlocks && isEditableBlock(el) && enterCodeMode(el, false))
      return;
    if (zone === "sidebar") {
      el.click();
      return;
    }
    const link = el.tagName === "A" ? el : el.querySelector("a");
    if (link) link.click();
  };

  // ── Reading / nav toggle ───────────────────────────────────────────────────

  const setActive = (on) => {
    active = on;
    state = on ? STATE.NAV : STATE.READING;
    sessionStorage.setItem(ACTIVE_KEY, String(on));
    updateBadge();
    if (on) {
      if (zone === "sidebar") idx.sidebar = currentChapterIndex();
      paint();
    } else {
      clearCursor();
    }
  };

  const handleReadingKey = (e) => {
    switch (e.key) {
      case "j":
        scrollByPx(SCROLL_STEP);
        break;
      case "k":
        scrollByPx(-SCROLL_STEP);
        break;
      case "d":
        scrollByPx(scroller().clientHeight / 2, true);
        break;
      case "u":
        scrollByPx(-scroller().clientHeight / 2, true);
        break;
      case "G":
        scrollToEdge(true);
        break;
      case "g":
        if (pendingG) {
          clearTimeout(gTimer);
          pendingG = false;
          scrollToEdge(false);
        } else {
          pendingG = true;
          gTimer = setTimeout(() => (pendingG = false), 500);
        }
        return;
      default:
        return;
    }
    e.preventDefault();
  };

  // ── Escape out of CODE mode ────────────────────────────────────────────────
  //
  // Ace's vim handler consumes Escape itself to leave insert mode, so we only
  // act when the editor is ALREADY in normal mode. Listening in the capture
  // phase on the editor container lets us see the key before Ace does.
  const onCodeKeydown = (e) => {
    if (state !== STATE.CODE || !aceEditor) return;
    if (e.key !== "Escape") return;
    if (inInsertMode(aceEditor)) return; // let Ace handle insert → normal
    e.preventDefault();
    e.stopPropagation();
    leaveCodeMode();
  };

  // ── Master keydown handler ─────────────────────────────────────────────────

  const onKey = (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    // In CODE mode Ace owns the keyboard; onCodeKeydown handles the exit.
    if (state === STATE.CODE) return;

    // Don't hijack keys typed into real page inputs (e.g. the search box).
    const t = e.target;
    if (t && t.matches && t.matches("input, textarea, [contenteditable]"))
      return;

    if (e.key === CFG.toggleKey) {
      setActive(!active);
      e.preventDefault();
      return;
    }
    if (e.key === "Escape") {
      if (active) {
        setActive(false);
        e.preventDefault();
      }
      return;
    }

    if (!active) {
      handleReadingKey(e);
      return;
    }

    switch (e.key) {
      case "j":
      case "ArrowDown":
        move(1);
        break;
      case "k":
      case "ArrowUp":
        move(-1);
        break;
      case "h":
        setZone("sidebar");
        break;
      case "l":
        setZone("content");
        break;
      case "G":
        idx[zone] = targets(zone).length - 1;
        paint();
        break;
      case "g":
        if (pendingG) {
          clearTimeout(gTimer);
          pendingG = false;
          idx[zone] = 0;
          paint();
        } else {
          pendingG = true;
          gTimer = setTimeout(() => (pendingG = false), 500);
        }
        return;
      case "Enter":
      case "o":
        activate();
        break;
      case "i": {
        const el = targets(zone)[idx[zone]];
        if (CFG.codeBlocks && isEditableBlock(el)) enterCodeMode(el, true);
        break;
      }
      default:
        return;
    }
    e.preventDefault();
  };

  // ── Boot ───────────────────────────────────────────────────────────────────

  const boot = () => {
    indicator = document.createElement("div");
    indicator.className = "vi-mode-indicator";
    indicator.textContent = badgeLabel;
    document.body.appendChild(indicator);

    document.body.setAttribute("tabindex", "-1");
    document.addEventListener("keydown", onKey, true);
    document.addEventListener("keydown", onCodeKeydown, true);

    if (CFG.codeBlocks) {
      // Clicking a playground should land in vim NORMAL mode, not insert.
      // Ace focuses the editor on mousedown, so we let that happen and then
      // install the vim handler immediately afterwards.
      document.addEventListener(
        "mousedown",
        (e) => {
          if (state === STATE.CODE) return; // already editing
          if (e.target.closest("button")) return; // Run / Undo buttons
          const playground = e.target.closest("pre:has(.editable)");
          if (!playground) return;

          // Sync the nav cursor so Escape returns to this block.
          const list = targets("content");
          const i = list.indexOf(playground);
          if (i !== -1) {
            zone = "content";
            idx.content = i;
          }

          // Defer until after Ace has processed the click and placed its cursor.
          setTimeout(() => enterCodeMode(playground, false), 0);
        },
        true,
      );
    }

    const sidebar = document.getElementById("mdbook-sidebar");
    if (sidebar) {
      new MutationObserver(() => {
        if (active && zone === "sidebar") paint();
      }).observe(sidebar, { childList: true, subtree: true });
    }

    if (active) {
      state = STATE.NAV;
      updateBadge();
      if (zone === "sidebar") idx.sidebar = currentChapterIndex();
      paint();
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
