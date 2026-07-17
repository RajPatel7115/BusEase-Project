/* Reusable SearchForm widget â€” paints into a host div */
(function(){
  function svgMap(){ return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`; }
  function svgSwap(){ return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>`; }
  function svgCal(){ return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`; }
  function svgSearch(){ return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`; }

  window.renderSearchForm = function(host, opts){
    opts = opts || {};
    const init = opts.initial || {};
    const cls = opts.className || '';
    const today = new Date(); today.setHours(0,0,0,0);
    host.innerHTML = `
      <form class="be-card shadow-soft p-4 ${cls}" id="be-search-form" style="border-radius:1.5rem;">
        <div class="row g-3 align-items-end">
          <div class="col-md">
            <label class="label-be tiny">FROM</label>
            <div class="input-icon-wrap mt-1">
              <span class="icon">${svgMap()}</span>
              <input class="input-be h-12" id="bsf-from" autocomplete="off" placeholder="City name" value="${init.from||''}">
            </div>
          </div>
          <div class="col-auto d-none d-md-block">
            <button type="button" class="btn-be btn-outline-be btn-icon-be" style="border-radius:999px;" id="bsf-swap">${svgSwap()}</button>
          </div>
          <div class="col-md">
            <label class="label-be tiny">TO</label>
            <div class="input-icon-wrap mt-1">
              <span class="icon">${svgMap()}</span>
              <input class="input-be h-12" id="bsf-to" autocomplete="off" placeholder="City name" value="${init.to||''}">
            </div>
          </div>
          <div class="col-md">
            <label class="label-be tiny">DATE</label>
            <button type="button" class="btn-be btn-outline-be h-12 w-100 mt-1" id="bsf-date" style="justify-content:flex-start; font-weight:500;">
              ${svgCal()}<span id="bsf-date-label" style="margin-left:.5rem;">${init.date ? BE.fmtDate(new Date(init.date)) : 'Pick date'}</span>
            </button>
            <input type="hidden" id="bsf-date-value" value="${init.date || BE.fmtISO(new Date())}">
          </div>
          <div class="col-md-auto">
            <button type="submit" class="btn-be btn-primary-grad h-12 w-100 shadow-elegant" style="font-weight:600;padding:0 2rem;">${svgSearch()}<span style="margin-left:.4rem;">Search</span></button>
          </div>
        </div>
      </form>
    `;

    const fromEl = host.querySelector('#bsf-from');
    const toEl = host.querySelector('#bsf-to');
    attachCitySuggest(fromEl);
    attachCitySuggest(toEl);

    host.querySelector('#bsf-swap').addEventListener('click', ()=>{
      const a = fromEl.value; fromEl.value = toEl.value; toEl.value = a;
    });

    // flatpickr
    const fp = flatpickr(host.querySelector('#bsf-date'), {
      dateFormat: 'Y-m-d',
      defaultDate: host.querySelector('#bsf-date-value').value,
      minDate: 'today',
      onChange: function(sel, str){
        host.querySelector('#bsf-date-value').value = str;
        host.querySelector('#bsf-date-label').textContent = BE.fmtDate(sel[0]);
      },
      positionElement: host.querySelector('#bsf-date')
    });

    host.querySelector('#be-search-form').addEventListener('submit', e=>{
      e.preventDefault();
      const from = fromEl.value.trim();
      const to = toEl.value.trim();
      const date = host.querySelector('#bsf-date-value').value;
      if (!from || !to || !date) return toast.error('Please fill all fields');
      if (from.toLowerCase() === to.toLowerCase()) return toast.error('From and To cannot be the same');
      location.href = `/search/?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${encodeURIComponent(date)}`;
    });
  };
})();

