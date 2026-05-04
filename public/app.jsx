const { useState, useEffect, useRef, useMemo } = React;

const cx = (...xs) => xs.filter(Boolean).join(' ');

const CLOAK_PRESETS = [
  { id: 'schoology', short: 'Schoology', title: 'Home | Schoology', icon: 'https://www.nicepng.com/png/full/433-4330628_schoology-icon-schoology-logo-png.png', host: 'app.schoology.com' },
  { id: 'canvas', short: 'Canvas', title: 'Dashboard', icon: 'https://www.google.com/s2/favicons?domain=canvas.instructure.com&sz=64', host: 'canvas.instructure.com' },
  { id: 'classroom', short: 'Classroom', title: 'Classroom', icon: 'https://ssl.gstatic.com/classroom/favicon.png', host: 'classroom.google.com' },
];

function readInitialCloak() {
  const title = localStorage.getItem('websiteTitle');
  const icon = localStorage.getItem('websiteIcon');
  const host = localStorage.getItem('websiteCloakHost');
  let presetId = localStorage.getItem('websiteCloakPreset');
  const valid = new Set([...CLOAK_PRESETS.map(p => p.id), 'custom']);
  if (!presetId || !valid.has(presetId)) {
    presetId = null;
    for (const p of CLOAK_PRESETS) {
      if (p.title === title && p.icon === icon) presetId = p.id;
    }
    if (!presetId) {
      presetId = title == null && icon == null && host == null ? 'classroom' : 'custom';
    }
  }
  const preset = CLOAK_PRESETS.find(p => p.id === presetId);
  const classroom = CLOAK_PRESETS.find(p => p.id === 'classroom');
  return {
    cloakPresetId: presetId,
    cloakTitle: title ?? preset?.title ?? classroom.title,
    cloakIcon: icon ?? preset?.icon ?? classroom.icon,
    cloakAddressHost: host ?? preset?.host ?? classroom.host,
  };
}

function normalizePastedUrl(raw) {
  const t = raw.trim();
  if (!t) return null;
  try {
    return new URL(t).href;
  } catch {
    try {
      return new URL(`https://${t}`).href;
    } catch {
      return null;
    }
  }
}

const FoilThumb = ({ id, title }) => {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  const hue = h % 360;
  const initials = title.split(' ').filter(Boolean).slice(0, 2).map(s => s[0]).join('').toUpperCase();
  return (
    <div className="thumb-fallback" style={{
      background: `linear-gradient(135deg, oklch(0.38 0.10 ${hue}), oklch(0.22 0.06 ${(hue + 50) % 360}))`,
      color: `oklch(0.85 0.12 ${hue})`,
    }}>
      {initials}
    </div>
  );
};

const FloatingLogo = () => {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const SIZE = 96;
    const REST = 0.82;
    const p = {
      x: window.innerWidth / 2 - SIZE / 2,
      y: 72,
      vx: 0,
      vy: 0,
      mx: -999,
      my: -999,
    };

    const obstacleSelectors = [
      '.topbar',
      '.hero h1',
      '.hero-sub',
      '.launcher',
      '.hero-actions button.btn',
      '.hero-actions a.discord-btn',
      '.hero .status-line',
      '.footer',
    ];

    function collectObstacles() {
      const rects = [];
      for (const sel of obstacleSelectors) {
        document.querySelectorAll(sel).forEach((node) => {
          const r = node.getBoundingClientRect();
          if (r.width < 4 || r.height < 4) return;
          rects.push({
            left: r.left,
            right: r.right,
            top: r.top,
            bottom: r.bottom,
          });
        });
      }
      return rects;
    }

    function resolveAABB(r) {
      const L = p.x;
      const R = p.x + SIZE;
      const T = p.y;
      const B = p.y + SIZE;
      if (R <= r.left || L >= r.right || B <= r.top || T >= r.bottom) return;

      const lc = (L + R) / 2;
      const tc = (T + B) / 2;
      const oc = (r.left + r.right) / 2;
      const ot = (r.top + r.bottom) / 2;
      const nx = lc - oc;
      const ny = tc - ot;
      const halfX = SIZE / 2 + (r.right - r.left) / 2;
      const halfY = SIZE / 2 + (r.bottom - r.top) / 2;
      if (Math.abs(nx) >= halfX || Math.abs(ny) >= halfY) return;

      const penX = halfX - Math.abs(nx);
      const penY = halfY - Math.abs(ny);

      if (penX < penY) {
        p.x += nx < 0 ? -penX : penX;
        p.vx *= -REST;
      } else {
        p.y += ny < 0 ? -penY : penY;
        p.vy *= -REST;
      }
    }

    function resolveAllObstacles() {
      const rects = collectObstacles();
      for ( let pass = 0; pass < 4; pass++) {
        for ( const r of rects) {
          resolveAABB(r);
        }
      }
    }

    requestAnimationFrame(() => {
      const h1 = document.querySelector('.hero h1');
      if (h1) {
        const rect = h1.getBoundingClientRect();
        const topbar = document.querySelector('.topbar');
        const top = topbar ? topbar.getBoundingClientRect().bottom : 56;
        p.x = window.innerWidth / 2 - SIZE / 2;
        p.y = Math.max(top + 4, rect.top - SIZE - 44);
      }
      el.style.transform = `translate(${p.x}px, ${p.y}px)`;
    });

    const onMove = (e) => {
      p.mx = e.clientX;
      p.my = e.clientY;
    };
    window.addEventListener('mousemove', onMove);

    let raf;
    function tick() {
      const cx = p.x + SIZE / 2;
      const cy = p.y + SIZE / 2;
      const dx = cx - p.mx;
      const dy = cy - p.my;
      const dist = Math.hypot(dx, dy);

      if (dist < 55 && dist > 0) {
        const f = ((55 - dist) / 55) * 0.52;
        p.vx += (dx / dist) * f;
        p.vy += (dy / dist) * f;
      }

      p.vx *= 0.982;
      p.vy *= 0.982;
      p.x += p.vx;
      p.y += p.vy;

      resolveAllObstacles();

      const topbar = document.querySelector('.topbar');
      const topBound = topbar ? topbar.getBoundingClientRect().bottom : 56;
      const maxX = window.innerWidth - SIZE;
      const maxY = window.innerHeight - SIZE;
      if (p.x < 0) {
        p.x = 0;
        p.vx = Math.abs(p.vx) * 0.72;
      }
      if (p.x > maxX) {
        p.x = maxX;
        p.vx = -Math.abs(p.vx) * 0.72;
      }
      if (p.y < topBound) {
        p.y = topBound;
        p.vy = Math.abs(p.vy) * 0.72;
      }
      if (p.y > maxY) {
        p.y = maxY;
        p.vy = -Math.abs(p.vy) * 0.72;
      }

      el.style.transform = `translate(${p.x}px, ${p.y}px)`;
      raf = requestAnimationFrame(tick);
    }

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMove);
    };
  }, []);

  return (
    <img
      ref={ref}
      src="/assets/foil.png"
      alt=""
      className="floating-logo"
    />
  );
};

const PAGE_KEYS = ['home', 'games', 'apps', 'chatroom', 'settings', 'about'];

function pageFromHash() {
  const raw = (location.hash || '').replace(/^#/, '').replace(/^\//, '');
  const seg = (raw.split('/')[0] || 'home').toLowerCase();
  return PAGE_KEYS.includes(seg) ? seg : 'home';
}

const TopBar = ({ page, navigate }) => {
  const pages = PAGE_KEYS;
  return (
    <header className="topbar">
      <div className="shell topbar-inner">
        <a href="/index.html#/home" className="brand" onClick={e => { e.preventDefault(); navigate('home'); }}>
          <img src="/assets/foil.png" alt="" className="brand-logo" />
          <span>tinf<em>0</em>il</span>
        </a>
        <nav className="nav-pill">
          {pages.map(p => (
            <button key={p} type="button" className={cx(page === p && 'active')} onClick={() => navigate(p)}>{p}</button>
          ))}
        </nav>
        <div className="status-chip">
          <span className="status-dot" />
          online
        </div>
      </div>
    </header>
  );
};

const Footer = () => (
  <footer className="footer">
    <div className="shell footer-inner">
      <span className="small">tinf0il · aluminum depot</span>
      <span className="small">no logs. no leaks.</span>
      <a className="small" href="https://github.com/Aluminum-Depot" target="_blank" rel="noopener noreferrer">github ↗</a>
    </div>
  </footer>
);

const Home = ({ navigate, voice }) => {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState(null);
  const [splash] = useState(() => SPLASHES[Math.floor(Math.random() * SPLASHES.length)]);

  const launch = async e => {
    e?.preventDefault();
    if (!query.trim()) { setStatus({ msg: 'paste something first', warn: true }); return; }
    const url = window.Tinf0il?.normalizeUrl(query.trim());
    setStatus({ msg: 'starting proxy...' });
    try {
      await window.Tinf0ilProxy.open(url);
    } catch (err) {
      setStatus({ msg: err.message || 'proxy failed.', warn: true });
    }
  };

  return (
    <main>
      <FloatingLogo />
      <section className="shell hero">
        <h1>probe the internet privately. <em>{voice.headline ? voice.headline : splash}</em></h1>
        <p className="hero-sub">{voice.lede}</p>

        <form className="launcher" onSubmit={launch}>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="paste a url or search"
            autoFocus
          />
          <button type="submit">go →</button>
        </form>

        <div className="hero-actions">
          <button className="btn" onClick={() => navigate('settings')}>tab cloak</button>
          <button className="btn" onClick={() => window.Tinf0il?.openBlank()}>about:blank</button>
          <button className="btn" onClick={() => navigate('games')}>games</button>
          <button className="btn" onClick={() => navigate('apps')}>apps</button>
          <a className="btn discord-btn" href="https://discord.gg/rYWBs6Hezs" target="_blank" rel="noopener noreferrer" data-tooltip="windows exploits · school unblocking · web proxy community">
            join the discord ↗
          </a>
        </div>

        {status && (
          <div className={cx('status-line', status.warn ? 'warn' : 'ok')}>
            {status.msg}
          </div>
        )}
      </section>

    </main>
  );
};

const Proxy = ({ navigate }) => {
  const [query, setQuery] = useState('');
  const [history, setHistory] = useState([
    { url: 'youtube.com', t: '2m ago' },
    { url: 'reddit.com/r/all', t: '14m ago' },
    { url: 'docs.google.com', t: '1h ago' },
  ]);
  const [status, setStatus] = useState(null);

  const launch = async e => {
    e?.preventDefault();
    if (!query.trim()) return;
    const url = window.Tinf0il?.normalizeUrl(query.trim());
    const display = query.replace(/^https?:\/\//, '').slice(0, 40);
    setHistory(h => [{ url: display, t: 'just now' }, ...h.slice(0, 4)]);
    setStatus(`routing → ${display}...`);
    setQuery('');
    try {
      await window.Tinf0ilProxy.open(url);
    } catch (err) {
      setStatus(err.message || 'proxy failed.');
    }
  };

  return (
    <main>
      <section className="shell page-hero">
        <h1>paste it. <em>send it.</em></h1>
        <p className="lede">routes through scramjet. that's it.</p>
      </section>

      <section className="shell proxy-wrap">
        <form className="launcher" onSubmit={launch}>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="youtube.com, reddit, whatever"
            autoFocus
          />
          <button type="submit">go →</button>
        </form>

        {status && <div className="status-line ok">{status}</div>}

        <div className="hero-actions" style={{ justifyContent: 'flex-start' }}>
          <button className="btn" onClick={() => window.Tinf0il?.openBlank()}>about:blank</button>
          <button className="btn" onClick={() => navigate('settings')}>settings</button>
        </div>

        <div className="flow-grid">
          <div className="panel">
            <span className="panel-tag">// recents</span>
            <ul className="recents-list">
              {history.map((h, i) => (
                <li key={i}>
                  <button onClick={() => setQuery(h.url)}>→ {h.url}</button>
                  <span className="t">{h.t}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="panel">
            <span className="panel-tag">// under the hood</span>
            <ul className="stack-list">
              <li><span className="k">routing</span><span className="v">scramjet</span><span className="stat">live</span></li>
              <li><span className="k">transport</span><span className="v">wisp + libcurl</span><span className="stat">on</span></li>
              <li><span className="k">noise</span><span className="v">stripped</span><span className="stat">low</span></li>
              <li><span className="k">mobile</span><span className="v">supported</span><span className="stat">yes</span></li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
};

const CatalogThumb = ({ id, title, image }) => {
  const [broken, setBroken] = useState(false);
  if (!image || broken) return <FoilThumb id={id} title={title} />;
  return (
    <img
      className="catalog-thumb-img"
      src={image}
      alt=""
      loading="lazy"
      decoding="async"
      onError={() => setBroken(true)}
    />
  );
};

const Catalog = ({ kind, items, tags, setActiveItem }) => {
  const [search, setSearch] = useState('');
  const [tag, setTag] = useState('all');

  const filtered = useMemo(() =>
    items.filter(it => {
      if (tag !== 'all' && it.tag !== tag) return false;
      if (search && !it.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    }),
    [items, search, tag]
  );

  return (
    <main>
      <section className="shell page-hero">
        <h1>{kind === 'games' ? <>games, <em>unfiltered.</em></> : <>apps, <em>untangled.</em></>}</h1>
        <p className="lede">
          {kind === 'games'
            ? 'search, filter, tap. all proxied, no ads.'
            : 'every web app you actually use, one tap away.'}
        </p>
      </section>

      <section className="shell">
        <div className="toolbar">
          <div className="toolbar-left">
            <span className="toolbar-count">{filtered.length} / {items.length}</span>
            <div className="chip-row">
              {tags.map(t => (
                <button key={t} className={cx('chip', tag === t && 'active')} onClick={() => setTag(t)}>{t}</button>
              ))}
            </div>
          </div>
          <div className="search-wrap">
            <input
              className="search-input"
              placeholder={`search ${kind}`}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="catalog-grid">
          <button className="catalog-card add-card">
            <div className="thumb" />
            <div className="meta">
              <span className="name">add your own</span>
            </div>
          </button>
          {filtered.map((it, i) => (
            <button key={it.id} className="catalog-card" onClick={() => {
              const param = kind === 'games' ? 'game' : 'app';
              window.location.href = `/load.html?${param}=${encodeURIComponent(it.id)}`;
            }}>
              <div className="thumb">
                <CatalogThumb id={it.id} title={it.title} image={it.image} />
              </div>
              <div className="meta">
                <span className="name">{it.title}</span>
                <span className="id-tag">{String(i + 1).padStart(3, '0')}</span>
              </div>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
};

const LaunchModal = ({ item, onClose }) => {
  if (!item) return null;
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <div className="modal-thumb">
            <FoilThumb id={item.id} title={item.title} />
          </div>
          <div className="modal-meta">
            <div className="kind">{item.kind} · {item.tag}</div>
            <h3>{item.title}</h3>
          </div>
        </div>
        <p>ready to go. how do you want to open it?</p>
        <div className="modal-actions">
          <button className="btn accent">deploy</button>
          <button className="btn">new tab</button>
          <button className="btn">cloak + go</button>
          <button className="btn" onClick={onClose}>nvm</button>
        </div>
      </div>
    </div>
  );
};

const Settings = ({ theme, setTheme }) => {
  const initial = useMemo(() => readInitialCloak(), []);
  const [cloakPresetId, setCloakPresetId] = useState(initial.cloakPresetId);
  const [cloakTitle, setCloakTitle] = useState(initial.cloakTitle);
  const [cloakIcon, setCloakIcon] = useState(initial.cloakIcon);
  const [cloakAddressHost, setCloakAddressHost] = useState(initial.cloakAddressHost);
  const [importUrl, setImportUrl] = useState('');
  const [importBusy, setImportBusy] = useState(false);
  const [importErr, setImportErr] = useState('');

  const applyImportedMeta = (data) => {
    setCloakPresetId('custom');
    setCloakTitle(data.title || 'untitled');
    setCloakIcon((prev) => data.iconUrl || data.fallbackIconUrl || prev);
    setCloakAddressHost((prev) => data.hostname || prev);
  };

  const pickPreset = (id) => {
    setImportErr('');
    if (id === 'custom') {
      setCloakPresetId('custom');
      return;
    }
    const p = CLOAK_PRESETS.find(x => x.id === id);
    if (!p) return;
    setCloakPresetId(p.id);
    setCloakTitle(p.title);
    setCloakIcon(p.icon);
    setCloakAddressHost(p.host);
  };

  const runImportFromUrl = async () => {
    const href = normalizePastedUrl(importUrl);
    if (!href) {
      setImportErr('paste a full URL or domain');
      return;
    }
    setImportErr('');
    setImportBusy(true);
    try {
      const r = await fetch(`/api/tab-meta?url=${encodeURIComponent(href)}`);
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        setImportErr(typeof data.error === 'string' ? data.error : 'could not read that page');
        return;
      }
      applyImportedMeta(data);
    } catch {
      setImportErr('network error');
    } finally {
      setImportBusy(false);
    }
  };

  const onImportPaste = (e) => {
    const text = e.clipboardData?.getData('text')?.trim();
    if (!text || text.includes('\n')) return;
    const href = normalizePastedUrl(text);
    if (!href) return;
    setImportUrl(text);
    setImportBusy(true);
    setImportErr('');
    fetch(`/api/tab-meta?url=${encodeURIComponent(href)}`)
      .then((r) => r.json().then((data) => ({ ok: r.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) {
          setImportErr(typeof data.error === 'string' ? data.error : 'could not read that page');
          return;
        }
        applyImportedMeta(data);
      })
      .catch(() => setImportErr('network error'))
      .finally(() => setImportBusy(false));
  };

  const [autoBlank, setAutoBlank] = useState(false);
  const [stealth, setStealth] = useState(true);
  const [reduce, setReduce] = useState(false);
  const [bigText, setBigText] = useState(false);

  const themes = [
    { id: 'midnight', name: 'midnight', pal: ['#07090d', '#69b4cc', '#334'] },
    { id: 'daylight', name: 'daylight', pal: ['#f0ede8', '#4a8a74', '#ccc'] },
    { id: 'acid',     name: 'acid',     pal: ['#0c0c0f', '#7eb8a4', '#1a2'] },
    { id: 'bubblegum',name: 'bubblegum',pal: ['#120910', '#c47aaa', '#412'] },
  ];

  const toggles = [
    { key: 'autoBlank', val: autoBlank, set: setAutoBlank, label: 'auto about:blank', sub: 'open everything in a cloak window by default.' },
    { key: 'stealth',   val: stealth,   set: setStealth,   label: 'stealth route',    sub: 'strip referrers and telemetry on every jump.' },
    { key: 'reduce',    val: reduce,    set: setReduce,    label: 'reduce motion',     sub: 'turn off background animations.' },
    { key: 'bigText',   val: bigText,   set: setBigText,   label: 'larger text',      sub: 'bumps up font sizes a notch.' },
  ];

  return (
    <main>
      <section className="shell page-hero">
        <h1>make it <em>yours.</em></h1>
        <p className="lede">cloak the tab, pick a theme, flip some switches.</p>
      </section>

      <section className="shell settings-wrap">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="panel">
            <span className="panel-tag">// tab cloak</span>
            <h3>cloak</h3>
            <p className="h-sub">pick a classroom tab, or paste any site — we&apos;ll pull title and icon.</p>

            <div className="cloak-browser-mock">
              <div className="cloak-tab-strip" role="tablist" aria-label="cloak preset">
                {CLOAK_PRESETS.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    role="tab"
                    aria-selected={cloakPresetId === p.id}
                    className={cx('cloak-tab-pick', cloakPresetId === p.id && 'on')}
                    onClick={() => pickPreset(p.id)}
                  >
                    <img src={p.icon} alt="" onError={e => { e.currentTarget.style.visibility = 'hidden'; }} />
                    <span>{p.short}</span>
                  </button>
                ))}
                <button
                  type="button"
                  role="tab"
                  aria-selected={cloakPresetId === 'custom'}
                  className={cx('cloak-tab-pick', cloakPresetId === 'custom' && 'on')}
                  onClick={() => pickPreset('custom')}
                >
                  <span>custom</span>
                </button>
              </div>
              <div className="cloak-preview">
                <div className="cloak-bar">
                  <span>← →</span>
                  <span>{cloakAddressHost || 'example.com'}</span>
                </div>
              </div>
            </div>

            <div className="field" style={{ marginTop: 16 }}>
              <span className="field-label">import from url</span>
              <div className="cloak-import-row">
                <input
                  value={importUrl}
                  onChange={e => { setImportUrl(e.target.value); setImportErr(''); }}
                  onPaste={onImportPaste}
                  placeholder="https://… or any domain"
                  disabled={importBusy}
                />
                <button type="button" className="btn" disabled={importBusy} onClick={runImportFromUrl}>
                  {importBusy ? '…' : 'grab'}
                </button>
              </div>
              {importErr ? <p className="cloak-import-err">{importErr}</p> : null}
            </div>

            <div className="field">
              <span className="field-label">tab title</span>
              <input value={cloakTitle} onChange={e => setCloakTitle(e.target.value)} placeholder="Classroom" />
            </div>
            <div className="field">
              <span className="field-label">icon url</span>
              <input value={cloakIcon} onChange={e => setCloakIcon(e.target.value)} placeholder="https://…/favicon.png" />
            </div>
            <div className="field">
              <span className="field-label">address bar host</span>
              <input value={cloakAddressHost} onChange={e => setCloakAddressHost(e.target.value)} placeholder="classroom.google.com" />
            </div>

            <div style={{ marginTop: 20, display: 'flex', gap: 8 }}>
              <button className="btn accent" onClick={() => {
                window.Tinf0ilSettings?.save({
                  title: cloakTitle,
                  icon: cloakIcon,
                  theme,
                  cloakPreset: cloakPresetId,
                  cloakHost: cloakAddressHost,
                });
                document.title = cloakTitle || 'tinf0il';
                const fav = document.querySelector("link[rel='icon']");
                if (fav && cloakIcon) fav.href = cloakIcon;
              }}>save</button>
              <button className="btn" onClick={() => {
                window.Tinf0ilSettings?.clear();
                const classroom = CLOAK_PRESETS.find(p => p.id === 'classroom');
                setCloakPresetId('classroom');
                setCloakTitle(classroom.title);
                setCloakIcon(classroom.icon);
                setCloakAddressHost(classroom.host);
                setImportUrl('');
                setImportErr('');
                document.title = 'tinf0il · the foil';
                const fav = document.querySelector("link[rel='icon']");
                if (fav) fav.href = '/assets/foil.png';
              }}>reset</button>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="panel">
            <span className="panel-tag">// theme</span>
            <h3>palette</h3>
            <p className="h-sub">pick a vibe.</p>
            <div className="theme-grid">
              {themes.map(t => (
                <button key={t.id} className={cx('theme-swatch', theme === t.id && 'on')} onClick={() => setTheme(t.id)}>
                  <div className="pal">{t.pal.map((c, i) => <i key={i} style={{ background: c }} />)}</div>
                  <div className="name">{t.name}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="panel">
            <span className="panel-tag">// flags</span>
            <h3>switches</h3>
            {toggles.map(({ key, val, set, label, sub }) => (
              <div key={key} className="toggle">
                <div className="lab">
                  <strong>{label}</strong>
                  <span>{sub}</span>
                </div>
                <button className={cx('tg-switch', val && 'on')} onClick={() => set(!val)} aria-pressed={val} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

const About = () => (
  <main>
    <section className="shell page-hero">
      <h1>tinf<em>0</em>il</h1>
      <p className="lede">a lightweight proxy portal. browse, play, work — privately.</p>
    </section>

    <section className="shell about-grid">
      <div className="panel">
        <span className="panel-tag">// the deal</span>
        <h3>why this exists</h3>
        <p className="h-sub" style={{ fontSize: 14, lineHeight: 1.7 }}>
          ads everywhere, paywalls everywhere, your school blocking half the web. tinf0il is a clean room — route what you need, skip the noise, don't get tracked doing it. that's the whole pitch.
        </p>
        <div className="tile-row">
          <div className="tile"><div className="num">{window.GAMES?.length ?? "—"}</div><div className="lab">games</div></div>
          <div className="tile"><div className="num">{window.APPS?.length ?? "—"}</div><div className="lab">apps</div></div>
          <div className="tile"><div className="num">0</div><div className="lab">trackers</div></div>
        </div>
        <p className="h-sub" style={{ fontSize: 13, marginTop: 20 }}>
          built on scramjet by mercury workshop. shoutout to everyone keeping the open web actually open.
        </p>
      </div>

      <div className="panel">
        <span className="panel-tag">// stack</span>
        <h3>under the hood</h3>
        <ul className="stack-list">
          <li><span className="k">games</span><span className="v"><a href="https://github.com/3kh0/3kh0-lite" target="_blank" rel="noreferrer">3kh0 lite</a> links</span><span className="stat">proxied</span></li>
          <li><span className="k">proxy</span><span className="v">scramjet</span><span className="stat">live</span></li>
          <li><span className="k">transport</span><span className="v">wisp + libcurl</span><span className="stat">on</span></li>
          <li><span className="k">server</span><span className="v">express</span><span className="stat">solid</span></li>
          <li><span className="k">ui</span><span className="v">react</span><span className="stat">clean</span></li>
          <li><span className="k">hosting</span><span className="v">node + docker</span><span className="stat">portable</span></li>
          <li><span className="k">license</span><span className="v">open source · mit</span><span className="stat">free</span></li>
        </ul>
      </div>
    </section>
  </main>
);

const Chatroom = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.id = 'widgetbot-embed-script';
    script.src = 'https://cdn.jsdelivr.net/npm/@widgetbot/html-embed@1';
    script.async = true;
    document.head.appendChild(script);

    const widget = document.createElement('widgetbot');
    widget.setAttribute('server', '1065018473459228783');
    widget.style.cssText = 'width:100%;height:100%;border:none;display:block;';

    if (mountRef.current) mountRef.current.appendChild(widget);

    return () => {
      script.remove();
      widget.remove();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        position: 'fixed',
        top: 53,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    />
  );
};

const SPLASHES = [
  'no cap.', 'fr fr.', 'on god.', 'bussin.',
  'understood the assignment.', 'it\'s giving privacy.',
  'slay.', 'lowkey goated.', 'main character energy.',
  'hits different.', 'we\'re so back.', 'ate and left no crumbs.',
  'sigma proxy.', 'ngl this slaps.', 'W proxy.',
  'school can\'t stop us.', 'based.', 'built different.',
  'chronically online? yes. filtered? no.',
  'fanum tax not included.', 'era: unbanned.',
  'rent free in IT\'s firewall.', 'mogging the school filter.',
  'caught in 4k... jk.', 'no logs, only vibes.',
  'ohio won\'t find us.', 'not your parents\' browser.',
  'certified hood classic.', 'cooked the firewall.',
  'it\'s giving freedom.', 'real ones know.', 'sheesh.',
  'imagine being filtered lol.', 'rizzing past the firewall.',
  'he\'s so cooked (the filter).', 'mewing while browsing.',
  'sigma grindset includes this.', 'bro thought he could filter us 💀',
  'pov: you\'re free.', 'let him cook.', 'locked in.',
  'peak browsing.', 'the lore continues.', 'delulu to free pipeline.',
  'touch grass later.', 'glaze responsibly.', 'skibidi.',
  'giving 🔒 energy.', 'absolutely unhinged.', 'bestie behavior.',
  'we go jim.', 'brain rot but make it private.',
  'not me bypassing the firewall 💀', 'gyatt (the proxy).',
  'no diddy.', 'real sigma hours.', 'this is so demure.',
  'it\'s giving undetectable.', 'core memory: bypassing the filter.',
];

const VOICE_PRESETS = {
  punchy: {
    headline: null,
    lede: 'paste a link, cook a search. tinf0il routes it, you get there.',
  },
  chill: {
    headline: <>browse privately. <em>that's it.</em></>,
    lede: 'drop a link and go. no drama, no noise.',
  },
  serious: {
    headline: <>private browsing, <em>simplified.</em></>,
    lede: 'a clean proxy portal routing through scramjet. low noise, low leaks.',
  },
};

const App = () => {
  const [tweaks, setTweak] = useTweaks(window.TWEAK_DEFAULTS);
  const [page, setPageState] = useState(pageFromHash);
  const [theme, setTheme] = useState(tweaks.theme);
  const [activeItem, setActiveItem] = useState(null);

  const navigate = (next) => {
    const p = PAGE_KEYS.includes(next) ? next : 'home';
    setPageState(p);
    const nextHash = `#/${p}`;
    if (location.hash !== nextHash) {
      history.pushState({ spa: true, page: p }, '', `${location.pathname}${location.search}${nextHash}`);
    }
  };

  useEffect(() => {
    if (!location.hash || location.hash === '#' || location.hash === '#/') {
      history.replaceState({ spa: true, page: 'home' }, '', `${location.pathname}${location.search}#/home`);
    }
  }, []);

  useEffect(() => {
    const syncFromUrl = () => setPageState(pageFromHash());
    window.addEventListener("hashchange", syncFromUrl);
    window.addEventListener("popstate", syncFromUrl);
    return () => {
      window.removeEventListener("hashchange", syncFromUrl);
      window.removeEventListener("popstate", syncFromUrl);
    };
  }, []);

  useEffect(() => { setTheme(tweaks.theme); }, [tweaks.theme]);
  useEffect(() => { document.documentElement.setAttribute('data-theme', theme); }, [theme]);
  useEffect(() => {
    const titles = { home: 'tinf0il · the foil', games: 'tinf0il · games', apps: 'tinf0il · apps', chatroom: 'tinf0il · chatroom', settings: 'tinf0il · settings', about: 'tinf0il · about' };
    document.title = titles[page] || 'tinf0il';
  }, [page]);

  const voice = VOICE_PRESETS[tweaks.voice] || VOICE_PRESETS.punchy;

  return (
    <>
      <TopBar page={page} navigate={navigate} />

      {page === 'home'     && <Home navigate={navigate} voice={voice} />}
      {page === 'games'    && <Catalog kind="games" items={window.GAMES} tags={window.GAME_TAGS} setActiveItem={setActiveItem} />}
      {page === 'apps'     && <Catalog kind="apps"  items={window.APPS}  tags={window.APP_TAGS}  setActiveItem={setActiveItem} />}
      {page === 'chatroom' && <Chatroom />}
      {page === 'settings' && <Settings theme={theme} setTheme={t => { setTheme(t); setTweak('theme', t); }} />}
      {page === 'about'    && <About />}

      <Footer />
      <LaunchModal item={activeItem} onClose={() => setActiveItem(null)} />

      <TweaksPanel title="Tweaks" defaultOpen={false}>
        <TweakSection title="Theme">
          <TweakRadio
            label="Palette"
            value={tweaks.theme}
            options={[
              { value: 'midnight',  label: 'midnight'  },
              { value: 'daylight',  label: 'daylight'  },
              { value: 'acid',      label: 'acid'      },
              { value: 'bubblegum', label: 'bubblegum' },
            ]}
            onChange={v => setTweak('theme', v)}
          />
        </TweakSection>
        <TweakSection title="Voice">
          <TweakRadio
            label="Tone"
            value={tweaks.voice}
            options={[
              { value: 'punchy',  label: 'punchy'  },
              { value: 'chill',   label: 'chill'   },
              { value: 'serious', label: 'serious' },
            ]}
            onChange={v => setTweak('voice', v)}
          />
        </TweakSection>
        <TweakSection title="Jump to">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {PAGE_KEYS.map(p => (
              <button key={p} type="button" className="chip" onClick={() => navigate(p)}>{p}</button>
            ))}
          </div>
        </TweakSection>
      </TweaksPanel>
    </>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
