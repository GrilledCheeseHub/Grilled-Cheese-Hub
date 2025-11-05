(function(){
  let proxy = 'https://cors-anywhere.herokuapp.com/'; // change if needed
  const faviconLinkId = 'injected-page-favicon';

  // --- Presets: edit these entries or add new ones ---
  const PRESETS = [
    { name: 'Default', title: null, favicon: null }, // will restore original page title/favicon
    { name: 'Clever', title: 'Clever | Portal', favicon: 'https://assets.clever.com/favicon.ico' },
    { name: 'Google', title: 'Google', favicon: 'https://www.google.com/s2/favicons?domain=google.com' },
    { name: 'Classroom', title: 'Home', favicon: 'https://gstatic.com/classroom/favicon.png' }
  ];
  // ---------------------------------------------------

  const css = `
  /* Sidebar base */
  #ddg-sidebar { position: fixed; right: 0; top: 0; height: 100vh; width: 360px; max-width: 92vw; background: linear-gradient(180deg,#ffffff 0%, #fbfdff 100%); color: #0b0b0b; box-shadow: -12px 24px 48px rgba(8,16,30,0.25), -4px 8px 18px rgba(8,16,30,0.12); z-index: 2147483000; font-family: system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial; display: flex; flex-direction: column; padding: 18px; gap: 12px; transform: translateX(100%); transition: transform .28s cubic-bezier(.2,.9,.2,1), box-shadow .18s; border-left: 1px solid rgba(15,23,42,0.06); backdrop-filter: blur(6px); border-top-left-radius: 10px; border-bottom-left-radius: 10px; overflow: auto; }
  #ddg-sidebar.open { transform: translateX(0); }

  .ddg-section { border-radius:10px; padding:10px; background: #fbfdff; border:1px solid rgba(15,23,42,0.03); }
  .ddg-section h4 { margin:0 0 8px 0; font-size:13px; color:#0b1220; }
  .ddg-row { display:flex; gap:8px; align-items:center; }

  input[type="url"], input[type="text"]{ width:100%; padding:10px 12px; box-sizing:border-box; font-size:14px; border:1px solid rgba(15,23,42,0.08); border-radius:8px; outline:none; background: #fff; transition: box-shadow .12s, border-color .12s; }
  input:focus{ box-shadow: 0 6px 18px rgba(13,90,200,0.08); border-color: rgba(13,90,200,0.28); }

  button, #ddg-toggle-btn { padding:8px 12px; font-size:14px; cursor:pointer; border-radius:8px; border: none; background: linear-gradient(180deg,#0b74ff 0%, #0066d6 100%); color: #fff; box-shadow: 0 6px 18px rgba(11,116,255,0.14); transition: transform .08s, box-shadow .12s, opacity .12s; }
  .ddg-ghost { background: transparent; color:#0b0b0b; box-shadow: none; border:1px solid rgba(15,23,42,0.06); }

  #ddg-presets { display:flex; gap:6px; flex-wrap:wrap; margin-top:6px; }
  .ddg-preset { background:#f1f5f9; color:#0b0b0b; border-radius:8px; padding:6px 8px; font-size:13px; cursor:pointer; border:1px solid rgba(15,23,42,0.04); }
  .ddg-preset:hover{ background:#e2e8f0; }

  #ddg-preview { display:flex; gap:8px; align-items:center; padding:8px; border-radius:8px; background:#f8fafc; border:1px solid rgba(15,23,42,0.04); margin-top:8px; }
  #ddg-preview img{ width:32px; height:32px; border-radius:6px; object-fit:contain; background:#fff; }
  #ddg-preview .t { font-weight:600; font-size:14px; color:#0b1220; }

  #ddg-status{ margin-top:6px; color:#334155; min-height:20px; font-size:13px; line-height:1.2; word-break:break-word; }

  #ddg-toggle-btn{ position: fixed; right: 12px; top: 12px; z-index: 2147483001; background: #0b0b0b; color: #fff; border-radius: 10px; padding: 8px 10px; cursor: pointer; box-shadow: 0 8px 22px rgba(2,6,23,0.32); font-family: system-ui, "Segoe UI", Roboto, Arial; border: none; transition: transform .12s ease, background .12s; }
  #ddg-toggle-btn:hover{ transform: translateY(-2px); }

  @media (max-width:520px){ #ddg-sidebar{ width: 88vw; padding:14px; } #ddg-toggle-btn{ right:10px; top:10px; } }
  `;

  const s = document.createElement('style');
  s.textContent = css;
  document.head.appendChild(s);

  // Create toggle button
  const toggle = document.createElement('button');
  toggle.id = 'ddg-toggle-btn';
  toggle.type = 'button';
  toggle.title = 'Toggle Cloak Tab';
  toggle.setAttribute('aria-expanded','false');
  toggle.setAttribute('aria-controls','ddg-sidebar');
  toggle.textContent = '›';
  document.body.appendChild(toggle);

  // Sidebar markup with sections
  const panel = document.createElement('aside');
  panel.id = 'ddg-sidebar';
  panel.setAttribute('role','complementary');
  panel.setAttribute('aria-hidden','true');
  panel.innerHTML = `
    <div class="ddg-section ddg-header">
      <div style="display:flex;justify-content:space-between;align-items:center;width:100%">
        <div>
          <h4>Cloak Tab</h4>
          <div style="font-size:12px;color:#556">Set page title & favicon</div>
        </div>
      </div>
    </div>

    <div class="ddg-section" id="section-url">
      <h4>URL</h4>
      <div class="ddg-row">
        <input id="ddg-url" type="url" placeholder="https://example.com" aria-label="URL"/>
        <button id="ddg-go" type="button">Cloak</button>
      </div>
    </div>

    <div class="ddg-section" id="section-manual">
      <h4>Manual Cloak</h4>
      <div style="display:flex;flex-direction:column;gap:8px">
        <input id="ddg-title" type="text" placeholder="Manual title (optional)" aria-label="Title"/>
        <input id="ddg-favicon" type="url" placeholder="Favicon URL (optional)" aria-label="Favicon URL"/>
      </div>
    </div>

    <div class="ddg-section" id="section-presets">
      <h4>Presets</h4>
      <div id="ddg-presets" aria-hidden="false"></div>
    </div>

    <div class="ddg-section" id="section-preview">
      <h4>Preview</h4>
      <div id="ddg-preview"><img id="ddg-preview-img" src="" alt="favicon preview"/><div class="t" id="ddg-preview-title">Current title</div></div>
    </div>

    <div class="ddg-section" id="section-status">
      <h4>Status</h4>
      <div id="ddg-status" aria-live="polite"></div>
    </div>
  `;
  document.body.appendChild(panel);

  // Elements
  const urlInput = panel.querySelector('#ddg-url');
  const goBtn = panel.querySelector('#ddg-go');
  const titleInput = panel.querySelector('#ddg-title');
  const faviconInput = panel.querySelector('#ddg-favicon');
  const status = panel.querySelector('#ddg-status');
  const presetsContainer = panel.querySelector('#ddg-presets');
  const previewImg = panel.querySelector('#ddg-preview-img');
  const previewTitle = panel.querySelector('#ddg-preview-title');

  // Find favicon from current page DOM (searches link rels and resolves relative URLs)
  function findFaviconHrefFromDom() {
    try {
      const rels = ['icon','shortcut icon','apple-touch-icon','apple-touch-icon-precomposed'];
      for (const rel of rels) {
        const n = document.querySelector('link[rel="' + rel + '"]');
        if (n && n.href) return new URL(n.getAttribute('href'), location.href).href;
      }
      // fallback to any link rel containing "icon"
      const anyIcon = document.querySelector('link[rel*="icon"]');
      if (anyIcon && anyIcon.href) return new URL(anyIcon.getAttribute('href'), location.href).href;
      return '';
    } catch (e) {
      return '';
    }
  }

  // store originals so "Default" preset can restore them
  const original = {
    title: document.title || '',
    favicon: findFaviconHrefFromDom() || ''
  };

  function setStatus(t){ status.textContent = t; }

  async function fetchHtml(url){
    const res = await fetch(proxy + url, { method: 'GET' });
    if (!res.ok) throw new Error('Fetch failed: ' + res.status);
    return await res.text();
  }

  function setFavicon(href){
    // remove previously injected favicon link (only the one we created)
    document.querySelectorAll('#' + faviconLinkId).forEach(n => n.remove());
    if (!href) {
      previewImg.src = '';
      return;
    }
    const link = document.createElement('link');
    link.id = faviconLinkId;
    link.rel = 'icon';
    link.href = href;
    document.head.appendChild(link);
    previewImg.src = href;
  }

  function setTitle(t){
    if (typeof t === 'string' && t !== '') document.title = t;
    previewTitle.textContent = (t || document.title || 'Current title');
  }

  async function setTitleAndFavicon(target, manualTitle, manualFavicon){
    setStatus('Loading...');
    try {
      let title = manualTitle?.trim() || '';
      let favicon = manualFavicon?.trim() || '';

      if (!title || !favicon) {
        const html = await fetchHtml(target);
        const doc = new DOMParser().parseFromString(html, 'text/html');

        // Title from fetched HTML if needed
        const remoteTitle = (doc.querySelector('title')?.textContent || '').trim();
        if (!title && remoteTitle) title = remoteTitle;

        // Favicon: parse link[rel] entries from fetched HTML (prefer icon/shortcut icon/apple-touch-icon)
        if (!favicon) {
          const rels = ['icon','shortcut icon','apple-touch-icon','apple-touch-icon-precomposed'];
          let found = '';
          for (const rel of rels) {
            const node = doc.querySelector('link[rel="' + rel + '"]');
            if (node && node.getAttribute('href')) {
              found = node.getAttribute('href');
              break;
            }
          }
          // also try any link[rel*="icon"]
          if (!found) {
            const iconLink = doc.querySelector('link[rel*="icon"]');
            if (iconLink && iconLink.getAttribute('href')) found = iconLink.getAttribute('href');
          }
          // resolve relative URL against target if needed
          if (found) {
            try {
              favicon = new URL(found, target).href;
            } catch(e){
              favicon = found;
            }
          }
        }
      }

      if (title) setTitle(title);
      if (favicon) setFavicon(favicon);
      setStatus('Updated' + (title ? ' title' : '') + (favicon ? ' and favicon' : '') + (title ? ': "'+title+'"' : '.'));
    } catch (e) {
      setStatus('Error: ' + e.message + '. Make sure you activated cors-anywhere at https://cors-anywhere.herokuapp.com/.');
    }
  }

  // Preset rendering: now only applies title+favicon without changing input fields
  function renderPresets(){
    presetsContainer.innerHTML = '';
    PRESETS.forEach((p, i) => {
      const btn = document.createElement('button');
      btn.className = 'ddg-preset';
      btn.type = 'button';
      btn.textContent = p.name || ('Preset ' + (i+1));
      btn.addEventListener('click', ()=> {
        if (p.name === 'Default') {
          // restore original captured title and favicon
          if (original.title) setTitle(original.title);
          else setTitle('');
          if (original.favicon) setFavicon(original.favicon);
          else setFavicon('');
          setStatus('Restored default title and favicon');
          return;
        }
        if (p.title) setTitle(p.title);
        if (p.favicon) setFavicon(p.favicon);
        setStatus('Applied preset: ' + (p.name || ('Preset ' + (i+1))));
      });
      presetsContainer.appendChild(btn);
    });
  }
  renderPresets();

  goBtn.addEventListener('click', ()=>{
    let u = urlInput.value.trim();
    if (!u) return setStatus('Enter a URL.');
    if (!/^[a-zA-Z]+:\/\//.test(u)) u = 'https://' + u;
    setTitleAndFavicon(u, titleInput.value, faviconInput.value);
  });

  // Live preview when manual inputs change (these still update preview fields)
  titleInput.addEventListener('input', ()=> previewTitle.textContent = titleInput.value || document.title);
  faviconInput.addEventListener('input', ()=> previewImg.src = faviconInput.value || '');

  urlInput.addEventListener('keydown', e => { if (e.key === 'Enter') goBtn.click(); });

  // Toggle behavior (start closed)
  let open = false;
  function setOpen(v){
    open = !!v;
    panel.classList.toggle('open', open);
    panel.setAttribute('aria-hidden', String(!open));
    toggle.setAttribute('aria-expanded', String(open));
    toggle.textContent = open ? '‹' : '›';
    if (open) { urlInput.focus(); } else { toggle.focus(); }
  }
  toggle.addEventListener('click', ()=> setOpen(!open));

  // Initialize preview with current page title and favicon, set URL input, and apply Default preset
  (function initPreviewFromPage() {
    // set preview title from document.title
    previewTitle.textContent = document.title || 'Current title';

    // find existing favicon link on the page (common rels)
    const found = findFaviconHrefFromDom();

    previewImg.src = found || '';
    // populate URL input with current page URL as sensible default
    try { urlInput.value = location.href; } catch(e) { urlInput.value = 'https://example.com'; }

    // capture original favicon/title so Default preset can restore them
    original.title = document.title || '';
    original.favicon = found || '';

    // Apply Default preset behavior (restore originals) so UI starts in "default" state
    if (original.title) setTitle(original.title); else setTitle('');
    if (original.favicon) setFavicon(original.favicon); else setFavicon('');
    setStatus('Default preset applied');
  })();

  // Accessibility: close on Escape when focused inside panel
  panel.addEventListener('keydown', e => { if (e.key === 'Escape') setOpen(false); });

  // Expose API and presets for programmer:
  try {
    Object.defineProperty(window, 'DDG_SIDEBAR', {
      value: {
        setProxy: p => { if (typeof p === 'string') proxy = p; },
        open: () => setOpen(true),
        close: () => setOpen(false),
        toggle: () => setOpen(!open),
        addPreset: pres => { if (pres && pres.name) { PRESETS.push(pres); renderPresets(); } },
        getPresets: () => PRESETS.slice()
      }
    });
  } catch(e){/* ignore */ }

  // Start closed
  setOpen(false);
})();
