/* Reusable SearchForm widget — paints into a host div with ultra-modern 2-tier architecture */
(function(){
  function svgMap(){ 
    return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="text-primary"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`; 
  }
  function svgSwap(){ 
    return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" class="text-primary"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>`; 
  }
  function svgCal(){ 
    return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="text-primary"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`; 
  }
  function svgSearch(){ 
    return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`; 
  }
  function svgArrow(){
    return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`;
  }

  window.renderSearchForm = function(host, opts){
    if (!host) return;
    opts = opts || {};
    const init = opts.initial || opts || {};
    const cls = opts.className || '';
    const initialFrom = init.from || '';
    const initialTo = init.to || '';
    const initialDate = init.date || BE.fmtISO(new Date());

    host.innerHTML = `
      <form class="search-card-pro shadow-2xl ${cls}" id="be-search-form" style="backdrop-filter: blur(16px);">
        <!-- TIER 1: ORIGIN & DESTINATION WITH FLOATING INTERACTIVE SWAP -->
        <div class="row g-2 g-md-3 align-items-center mb-3">
          <div class="col-12 col-md">
            <div class="search-field-segment" id="bsf-from-box">
              <div class="seg-label">
                ${svgMap()} <span>FROM (ORIGIN)</span>
              </div>
              <input class="seg-input" id="bsf-from" autocomplete="off" placeholder="Enter departure city (e.g. Mumbai)" value="${initialFrom}">
              <div class="text-xs text-muted d-flex align-items-center justify-content-between mt-1" style="font-size:0.72rem;">
                <span>Boarding point</span>
                <span class="text-primary font-mono" style="font-size:0.68rem;">Verified pickup</span>
              </div>
            </div>
          </div>

          <div class="col-auto mx-auto d-flex justify-content-center my-n2 my-md-0">
            <button type="button" class="search-swap-circle shadow-md" id="bsf-swap" title="Swap origin & destination" aria-label="Swap cities">
              ${svgSwap()}
            </button>
          </div>

          <div class="col-12 col-md">
            <div class="search-field-segment" id="bsf-to-box">
              <div class="seg-label">
                ${svgMap()} <span>TO (DESTINATION)</span>
              </div>
              <input class="seg-input" id="bsf-to" autocomplete="off" placeholder="Enter destination city (e.g. Pune)" value="${initialTo}">
              <div class="text-xs text-muted d-flex align-items-center justify-content-between mt-1" style="font-size:0.72rem;">
                <span>Dropping point</span>
                <span class="text-primary font-mono" style="font-size:0.68rem;">Direct drop</span>
              </div>
            </div>
          </div>
        </div>

        <!-- TIER 2: DATE PICKER WITH QUICK PILLS & POWERFUL SEARCH CTA -->
        <div class="row g-3 align-items-stretch">
          <div class="col-12 col-md-7">
            <div class="search-field-segment h-100 d-flex flex-column justify-content-between" id="bsf-date-box">
              <div class="d-flex align-items-center justify-content-between mb-1">
                <div class="seg-label m-0">
                  ${svgCal()} <span>DATE OF JOURNEY</span>
                </div>
                <div class="d-flex align-items-center gap-1">
                  <span class="quick-date-pill" id="bsf-pill-today">Today</span>
                  <span class="quick-date-pill" id="bsf-pill-tomorrow">Tomorrow</span>
                </div>
              </div>
              
              <button type="button" class="search-date-btn mt-1" id="bsf-date">
                <span class="font-mono" id="bsf-date-label">${initialDate ? BE.fmtDate(new Date(initialDate)) : 'Pick journey date'}</span>
                <span class="text-xs text-primary font-mono fw-bold d-flex align-items-center gap-1">
                  Change 📅
                </span>
              </button>
              <input type="hidden" id="bsf-date-value" value="${initialDate}">
              <div class="text-xs text-muted mt-1" style="font-size:0.7rem;">Free cancellation on select operators</div>
            </div>
          </div>

          <div class="col-12 col-md-5">
            <button type="submit" class="btn-be btn-primary-grad w-100 h-100 search-submit-btn d-flex align-items-center justify-content-center gap-2 py-3" style="border-radius:1.1rem; min-height:72px;">
              <span>${svgSearch()}</span>
              <span class="fw-bold">Search Buses</span>
              <span class="search-btn-icon">${svgArrow()}</span>
            </button>
          </div>
        </div>
      </form>
    `;

    const fromEl = host.querySelector('#bsf-from');
    const toEl = host.querySelector('#bsf-to');
    const fromBox = host.querySelector('#bsf-from-box');
    const toBox = host.querySelector('#bsf-to-box');
    const swapBtn = host.querySelector('#bsf-swap');
    const dateBtn = host.querySelector('#bsf-date');
    const dateLabel = host.querySelector('#bsf-date-label');
    const dateValue = host.querySelector('#bsf-date-value');
    const pillToday = host.querySelector('#bsf-pill-today');
    const pillTomorrow = host.querySelector('#bsf-pill-tomorrow');

    attachCitySuggest(fromEl);
    attachCitySuggest(toEl);

    // Interactive swap button with 360 degree smooth rotation and field pulse feedback
    let currentRot = 0;
    if (swapBtn) {
      swapBtn.addEventListener('click', ()=>{
        currentRot += 180;
        swapBtn.style.transform = `rotate(${currentRot}deg) scale(1.15)`;
        setTimeout(() => {
          if (swapBtn) swapBtn.style.transform = `rotate(${currentRot}deg) scale(1)`;
        }, 250);

        const a = fromEl.value;
        fromEl.value = toEl.value;
        toEl.value = a;

        if (fromBox && toBox) {
          fromBox.classList.add('animate-pulse-glow');
          toBox.classList.add('animate-pulse-glow');
          setTimeout(()=>{
            fromBox.classList.remove('animate-pulse-glow');
            toBox.classList.remove('animate-pulse-glow');
          }, 450);
        }
      });
    }

    // Function to check and update active pills
    function syncPills(isoStr){
      const todayIso = BE.fmtISO(new Date());
      const tomDate = new Date();
      tomDate.setDate(tomDate.getDate() + 1);
      const tomIso = BE.fmtISO(tomDate);

      if (pillToday) pillToday.classList.toggle('active', isoStr === todayIso);
      if (pillTomorrow) pillTomorrow.classList.toggle('active', isoStr === tomIso);
    }

    // Initialize Flatpickr
    let fpInstance = null;
    if (dateBtn) {
      fpInstance = flatpickr(dateBtn, {
        dateFormat: 'Y-m-d',
        defaultDate: dateValue.value,
        minDate: 'today',
        animate: true,
        onChange: function(sel, str){
          if (sel && sel.length > 0) {
            dateValue.value = str;
            dateLabel.textContent = BE.fmtDate(sel[0]);
            syncPills(str);
          }
        },
        positionElement: dateBtn
      });
    }

    syncPills(dateValue.value);

    // Quick Date Pills handlers
    if (pillToday) {
      pillToday.addEventListener('click', (e)=>{
        e.stopPropagation();
        const d = new Date();
        const iso = BE.fmtISO(d);
        dateValue.value = iso;
        dateLabel.textContent = BE.fmtDate(d);
        if (fpInstance) fpInstance.setDate(d);
        syncPills(iso);
      });
    }

    if (pillTomorrow) {
      pillTomorrow.addEventListener('click', (e)=>{
        e.stopPropagation();
        const d = new Date();
        d.setDate(d.getDate() + 1);
        const iso = BE.fmtISO(d);
        dateValue.value = iso;
        dateLabel.textContent = BE.fmtDate(d);
        if (fpInstance) fpInstance.setDate(d);
        syncPills(iso);
      });
    }

    // Form submit handler with validation and loading feedback
    host.querySelector('#be-search-form').addEventListener('submit', e=>{
      e.preventDefault();
      const from = fromEl.value.trim();
      const to = toEl.value.trim();
      const date = dateValue.value;
      if (!from || !to || !date) return toast.error('Please enter departure city, destination city, and travel date');
      if (from.toLowerCase() === to.toLowerCase()) return toast.error('Origin and Destination cannot be the same city');
      
      const submitBtn = host.querySelector('.search-submit-btn');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2" role="status"></span> Searching buses...`;
      }
      location.href = `/search/?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${encodeURIComponent(date)}`;
    });
  };
})();
