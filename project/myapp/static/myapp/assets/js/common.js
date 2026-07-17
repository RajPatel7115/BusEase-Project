/* BusEase common: navbar, footer, chatbot, auth modal, toast, theme */
(function () {
  'use strict';

  /* ---------- Toast (Sonner-like, top-center) ---------- */
  function ensureToastRoot(){
    let r = document.getElementById('be-toast-root');
    if (!r){ r = document.createElement('div'); r.id='be-toast-root'; document.body.appendChild(r); }
    return r;
  }
  window.toast = {
    success(msg){ this._show(msg, 'success'); },
    error(msg){ this._show(msg, 'error'); },
    info(msg){ this._show(msg, ''); },
    _show(msg, kind){
      const el = document.createElement('div');
      el.className = 'be-toast ' + (kind||'');
      el.textContent = msg;
      ensureToastRoot().appendChild(el);
      setTimeout(()=>{ el.style.transition='opacity .25s, transform .25s'; el.style.opacity='0'; el.style.transform='translateY(-10px)'; }, 2400);
      setTimeout(()=> el.remove(), 2750);
    }
  };

  /* ---------- Theme ---------- */
  const dark = localStorage.getItem('be_dark')==='1';
  if (dark) document.documentElement.classList.add('dark');
  window.toggleTheme = function(){
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('be_dark', isDark ? '1':'0');
    renderNavbar();
  };

  /* ---------- Navbar ---------- */
  const links = [
    { to:'/', label:'Home', match:['/',''] },
    { to:'/offers/', label:'Offers' },
    { to:'/advance/', label:'Plan Ahead' },
    { to:'/charter/', label:'Charter Bus' },
    { to:'/my-trips/', label:'My Trips' },
    { to:'/support/', label:'Support' },
  ];
  function currentPage(){
    return location.pathname;
  }
  function isActive(l){
    const cur = currentPage();
    if (l.match) return l.match.includes(cur);
    return cur === l.to;
  }
  function busSvg(size){
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6v6"/><path d="M15 6v6"/><path d="M2 12h19.6"/><path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3"/><circle cx="7" cy="18" r="2"/><path d="M9 18h5"/><circle cx="16" cy="18" r="2"/></svg>`;
  }
  function renderNavbar(){
    const host = document.getElementById('be-navbar');
    if (!host) return;
    const u = BE.Auth.current();
    const isDark = document.documentElement.classList.contains('dark');
    const themeIcon = isDark
      ? `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="M4.93 4.93l1.41 1.41"/><path d="M17.66 17.66l1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="M6.34 17.66l-1.41 1.41"/><path d="M19.07 4.93l-1.41 1.41"/></svg>`
      : `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
    host.innerHTML = `
      <nav class="be-nav glass">
        <div class="container d-flex align-items-center justify-content-between py-3">
          <a href="/" class="d-flex align-items-center gap-2 font-display font-extrabold text-decoration-none" style="font-size:1.25rem; color:hsl(var(--foreground));">
            <span class="be-logo-icon" style="color:hsl(var(--primary-foreground));">${busSvg(20)}</span>
            <span>Bus<span class="text-gradient">Ease</span></span>
          </a>
          <div class="d-none d-lg-flex align-items-center gap-1">
            ${links.map(l=>`<a href="${l.to}" class="be-nav-link ${isActive(l)?'active':''}">${l.label}</a>`).join('')}
          </div>
          <div class="d-flex align-items-center gap-2">
            <button class="btn-be btn-ghost-be btn-icon-be" onclick="toggleTheme()" aria-label="theme">${themeIcon}</button>
            ${u ? `
              <div class="be-dropdown" id="be-user-dropdown">
                <button class="btn-be btn-outline-be" onclick="document.getElementById('be-user-menu').classList.toggle('show')">
                  <span class="d-inline-grid place-items-center" style="width:1.5rem;height:1.5rem;border-radius:999px;background:var(--gradient-primary);color:hsl(var(--primary-foreground));font-weight:700;font-size:.75rem;">${u.name[0].toUpperCase()}</span>
                  <span class="d-none d-sm-inline">${u.name.split(' ')[0]}</span>
                </button>
                <div class="be-dropdown-menu" id="be-user-menu">
                  <button class="be-dropdown-item" onclick="location.href='/my-trips/'">My Trips</button>
                  <div class="be-dropdown-sep"></div>
                  <button class="be-dropdown-item" onclick="BE.Auth.logout().then(() => { renderNavbar(); if(location.pathname === '/my-trips/') { location.href = '/'; } })">Logout</button>
                </div>
              </div>
            ` : `
              <button class="btn-be btn-ghost-be d-none d-sm-inline-flex" onclick="openAuth('login')">Login</button>
              <button class="btn-be btn-primary-grad" onclick="openAuth('signup')">Sign up</button>
            `}
            <button class="btn-be btn-ghost-be btn-icon-be d-lg-none" onclick="document.getElementById('be-mobile-sheet').classList.add('show'); document.getElementById('be-mobile-backdrop').classList.add('show');" aria-label="menu">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
          </div>
        </div>
      </nav>
      <div id="be-mobile-backdrop" class="be-sheet-backdrop" onclick="closeMobileSheet()"></div>
      <aside id="be-mobile-sheet" class="be-sheet">
        <button class="btn-be btn-ghost-be btn-icon-be close" onclick="closeMobileSheet()" aria-label="close">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        <div class="d-flex flex-column gap-1 mt-4">
          ${links.map(l=>`<a href="${l.to}" class="be-nav-link ${isActive(l)?'active':''}" style="padding:.75rem 1rem;">${l.label}</a>`).join('')}
        </div>
      </aside>
    `;
  }
  window.renderNavbar = renderNavbar;
  window.closeMobileSheet = function(){
    document.getElementById('be-mobile-sheet')?.classList.remove('show');
    document.getElementById('be-mobile-backdrop')?.classList.remove('show');
  };
  // close dropdown on outside click
  document.addEventListener('click', e=>{
    const dd = document.getElementById('be-user-menu');
    if (dd && dd.classList.contains('show')){
      const wrap = document.getElementById('be-user-dropdown');
      if (wrap && !wrap.contains(e.target)) dd.classList.remove('show');
    }
  });

  /* ---------- Footer ---------- */
  function renderFooter(){
    const host = document.getElementById('be-footer');
    if (!host) return;
    const yr = new Date().getFullYear();
    const ic = (path)=>`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`;
    const fb = ic(`<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>`);
    const tw = ic(`<path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/>`);
    const ig = ic(`<rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>`);
    const ml = ic(`<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>`);
    host.innerHTML = `
    <footer style="margin-top:6rem;border-top:1px solid hsl(var(--border));background:linear-gradient(180deg, hsl(var(--background)) 0%, hsl(var(--muted) / .4) 100%);">
      <div class="container py-5">
        <div class="row g-5">
          <div class="col-md-6">
            <a href="/" class="d-flex align-items-center gap-2 font-display font-extrabold text-decoration-none mb-3" style="font-size:1.25rem;color:hsl(var(--foreground));">
              <span class="be-logo-icon" style="color:hsl(var(--primary-foreground));">${busSvg(20)}</span>
              <span>Bus<span class="text-gradient">Ease</span></span>
            </a>
            <p class="text-muted" style="max-width:28rem;">India's most loved bus booking experience. From a single seat to chartering the whole bus â€” we've engineered every kilometre.</p>
            <div class="d-flex gap-3 mt-4">
              <a href="#" class="footer-social">${fb}</a>
              <a href="#" class="footer-social">${tw}</a>
              <a href="#" class="footer-social">${ig}</a>
              <a href="#" class="footer-social">${ml}</a>
            </div>
          </div>
          <div class="col-md-3">
            <h6 class="font-bold mb-3">Explore</h6>
            <ul class="list-unstyled text-sm" style="color:hsl(var(--muted-foreground));">
              <li class="mb-2"><a href="/offers/" class="footer-link">Offers</a></li>
              <li class="mb-2"><a href="/advance/" class="footer-link">Plan a month ahead</a></li>
              <li class="mb-2"><a href="/charter/" class="footer-link">Charter a bus</a></li>
              <li class="mb-2"><a href="/track/" class="footer-link">Live tracking</a></li>
            </ul>
          </div>
          <div class="col-md-3">
            <h6 class="font-bold mb-3">Stay updated</h6>
            <form class="d-flex gap-2" onsubmit="event.preventDefault(); toast.success('Subscribed!'); this.reset();">
              <input class="input-be" placeholder="Your email" type="email" required>
              <button class="btn-be btn-primary-grad">Join</button>
            </form>
            <p class="text-xs text-muted mt-2">Get exclusive offer codes monthly.</p>
          </div>
        </div>
        <div class="text-center text-sm text-muted pt-4 mt-4" style="border-top:1px solid hsl(var(--border));">
          Â© ${yr} BusEase Â· Crafted with passion across 100+ Indian cities
        </div>
      </div>
    </footer>
    <style>.footer-link{color:inherit;}.footer-link:hover{color:hsl(var(--primary));}</style>
    `;
  }
  window.renderFooter = renderFooter;

  /* ---------- Auth dialog ---------- */
  function renderAuthModal(){
    if (document.getElementById('be-auth-modal')) return;
    const wrap = document.createElement('div');
    wrap.id = 'be-auth-modal';
    wrap.className = 'be-modal-backdrop';
    wrap.innerHTML = `
      <div class="be-modal" onclick="event.stopPropagation()">
        <div class="text-center">
          <div class="size-12 rounded-2xl mx-auto mb-2 grid-place shadow-elegant" style="background:var(--gradient-primary);color:hsl(var(--primary-foreground));">${busSvg(24)}</div>
          <h2 class="text-2xl font-extrabold mb-1">Welcome to BusEase</h2>
        </div>
        <div class="be-tabs-list full cols-2 mt-3" style="height:2.5rem;">
          <button class="be-tab-trigger" data-auth-tab="login">Login</button>
          <button class="be-tab-trigger" data-auth-tab="signup">Sign up</button>
        </div>
        <div class="be-tab-content" data-auth-pane="login">
          <form class="d-flex flex-column gap-3 pt-3" id="be-login-form">
            <div><label class="label-be">Email</label><input class="input-be mt-1" type="email" name="email" required></div>
            <div><label class="label-be">Password</label><input class="input-be mt-1" type="password" name="password" minlength="4" required></div>
            <button class="btn-be btn-primary-grad w-100">Login</button>
          </form>
        </div>
        <div class="be-tab-content" data-auth-pane="signup">
          <form class="d-flex flex-column gap-3 pt-3" id="be-signup-form">
            <div><label class="label-be">Name</label><input class="input-be mt-1" name="name" required></div>
            <div><label class="label-be">Email</label><input class="input-be mt-1" type="email" name="email" required></div>
            <div><label class="label-be">Password</label><input class="input-be mt-1" type="password" name="password" minlength="4" required></div>
            <button class="btn-be btn-primary-grad w-100">Create account</button>
          </form>
        </div>
      </div>
    `;
    document.body.appendChild(wrap);
    wrap.addEventListener('click', ()=> closeAuth());

    wrap.querySelectorAll('[data-auth-tab]').forEach(b=>{
      b.addEventListener('click', ()=> setAuthMode(b.dataset.authTab));
    });
    wrap.querySelector('#be-login-form').addEventListener('submit', async e=>{
      e.preventDefault();
      const fd = new FormData(e.target);
      const success = await BE.Auth.login(fd.get('email'), fd.get('password'));
      if (success){ toast.success('Welcome back!'); closeAuth(); renderNavbar(); }
      else toast.error('Invalid credentials');
    });
    wrap.querySelector('#be-signup-form').addEventListener('submit', async e=>{
      e.preventDefault();
      const fd = new FormData(e.target);
      const name = (fd.get('name')||'').toString().trim();
      if (!name) return toast.error('Enter your name');
      const success = await BE.Auth.signup(name, fd.get('email'), fd.get('password'));
      if (success){ toast.success('Account created!'); closeAuth(); renderNavbar(); }
      else toast.error('Email already exists');
    });
  }
  function setAuthMode(m){
    document.querySelectorAll('[data-auth-tab]').forEach(b=> b.classList.toggle('active', b.dataset.authTab===m));
    document.querySelectorAll('[data-auth-pane]').forEach(p=> p.classList.toggle('active', p.dataset.authPane===m));
  }
  window.openAuth = function(mode){
    renderAuthModal();
    setAuthMode(mode||'login');
    document.getElementById('be-auth-modal').classList.add('show');
  };
  window.closeAuth = function(){
    document.getElementById('be-auth-modal')?.classList.remove('show');
  };

  /* ---------- Chatbot ---------- */
  function botReply(t){
    t = (t||'').toLowerCase();
    if (t.includes('offer')||t.includes('coupon')) return "Check our Offers page â€” try FIRST50 for 50% off your first ride!";
    if (t.includes('charter')||t.includes('whole')) return "You can charter an entire bus from our Charter page â€” priced per km with multiple fleet options.";
    if (t.includes('cancel')) return "Cancel anytime from My Trips. Refunds usually arrive in 5-7 business days.";
    if (t.includes('book')) return "Search a route on the home page â†’ pick a bus â†’ choose seats â†’ pay. Done in 60 seconds!";
    if (t.includes('hi')||t.includes('hello')) return "Hey there! ðŸ‘‹ How can I help you travel smarter today?";
    return "I'll connect you with our team. Meanwhile, try asking about offers, charter, or cancellations!";
  }
  function renderChatbot(){
    if (document.getElementById('be-chat-btn')) return;
    const btn = document.createElement('button');
    btn.id='be-chat-btn'; btn.className='be-chat-btn animate-pulse-glow';
    btn.setAttribute('aria-label','chat');
    btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`;
    document.body.appendChild(btn);

    const panel = document.createElement('div');
    panel.id='be-chat-panel'; panel.className='be-chat-panel';
    panel.innerHTML = `
      <div style="background:var(--gradient-primary);color:hsl(var(--primary-foreground));padding:1rem;display:flex;align-items:center;gap:.5rem;">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        <div><div class="font-bold">BusEase AI</div><div class="text-xs" style="opacity:.9;">Always here, always free</div></div>
      </div>
      <div id="be-chat-msgs" style="flex:1;overflow-y:auto;padding:1rem;"></div>
      <form id="be-chat-form" style="padding:.75rem;border-top:1px solid hsl(var(--border));display:flex;gap:.5rem;">
        <input id="be-chat-input" class="input-be" placeholder="Type a message...">
        <button class="btn-be btn-primary-grad btn-icon-be">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </form>`;
    document.body.appendChild(panel);

    const msgs = panel.querySelector('#be-chat-msgs');
    const state = [{from:'bot', text:"Hi! I'm BusEase AI. Ask me anything about bookings, offers or charters."}];
    function paint(){
      msgs.innerHTML = state.map(m =>
        `<div class="be-chat-msg ${m.from}">${m.text.replace(/</g,'&lt;')}</div>`
      ).join('');
      msgs.scrollTop = msgs.scrollHeight;
    }
    paint();

    btn.addEventListener('click', ()=>{
      const open = panel.classList.toggle('show');
      btn.innerHTML = open
        ? `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`
        : `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`;
    });
    panel.querySelector('#be-chat-form').addEventListener('submit', e=>{
      e.preventDefault();
      const input = panel.querySelector('#be-chat-input');
      const v = input.value.trim();
      if (!v) return;
      state.push({from:'user',text:v}); input.value=''; paint();
      setTimeout(()=>{ state.push({from:'bot',text:botReply(v)}); paint(); }, 500);
    });
  }
  window.renderChatbot = renderChatbot;

  /* ---------- City autosuggest helper ---------- */
  window.attachCitySuggest = function(input, onPick){
    const wrap = input.closest('.input-icon-wrap') || input.parentElement;
    wrap.style.position = wrap.style.position || 'relative';
    let menu = wrap.querySelector('.be-suggest');
    if (!menu){ menu = document.createElement('div'); menu.className='be-suggest'; wrap.appendChild(menu); }
    function paint(q){
      const matches = q ? BE.CITIES.filter(c => c.toLowerCase().includes(q.toLowerCase())).slice(0,6) : [];
      if (!matches.length){ menu.classList.remove('show'); menu.innerHTML=''; return; }
      menu.innerHTML = matches.map(c =>
        `<button type="button" data-city="${c}"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:hsl(var(--primary));"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>${c}</button>`
      ).join('');
      menu.classList.add('show');
      menu.querySelectorAll('button').forEach(b=>{
        b.addEventListener('mousedown', e=>{
          e.preventDefault();
          input.value = b.dataset.city;
          onPick && onPick(b.dataset.city);
          menu.classList.remove('show');
        });
      });
    }
    input.addEventListener('input', ()=> paint(input.value));
    input.addEventListener('focus', ()=> input.value && paint(input.value));
    input.addEventListener('blur', ()=> setTimeout(()=> menu.classList.remove('show'), 150));
  };

  /* ---------- Tabs (data-attr based) ---------- */
  window.initTabs = function(root){
    root = root || document;
    root.querySelectorAll('[data-tabs]').forEach(group=>{
      const triggers = group.querySelectorAll('[data-tab]');
      const panes = group.querySelectorAll('[data-pane]');
      function setActive(name){
        triggers.forEach(t => t.classList.toggle('active', t.dataset.tab===name));
        panes.forEach(p => p.classList.toggle('active', p.dataset.pane===name));
      }
      triggers.forEach(t => t.addEventListener('click', ()=> setActive(t.dataset.tab)));
      const def = group.dataset.default || (triggers[0] && triggers[0].dataset.tab);
      setActive(def);
    });
  };

  /* ---------- Boot ---------- */
  document.addEventListener('DOMContentLoaded', async ()=>{
    try {
      const res = await fetch('/api/auth/current/');
      const data = await res.json();
      if (data.logged_in) {
        BE.Auth.setCurrentUser(data.user);
      } else {
        BE.Auth.setCurrentUser(null);
      }
    } catch(e) {
      console.error("Failed to fetch auth status from Django backend", e);
    }
    renderNavbar();
    renderFooter();
    renderChatbot();
    initTabs();
  });
})();

