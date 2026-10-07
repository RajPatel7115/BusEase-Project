/* BusEase data layer (vanilla port of busData.ts) */
(function (global) {
  const CITIES = ["Mumbai","Pune","Delhi","Bengaluru","Hyderabad","Chennai","Kolkata","Ahmedabad",
    "Jaipur","Surat","Lucknow","Kanpur","Nagpur","Indore","Thane","Bhopal","Visakhapatnam",
    "Patna","Vadodara","Ghaziabad","Ludhiana","Agra","Nashik","Faridabad","Meerut",
    "Rajkot","Kalyan","Vasai","Varanasi","Srinagar","Aurangabad","Dhanbad","Amritsar",
    "Allahabad","Ranchi","Gwalior","Jodhpur","Raipur","Kota","Chandigarh","Mysuru",
    "Coimbatore","Madurai","Kochi","Trivandrum","Goa","Mangalore","Vijayawada"];

  const OPERATORS = ["VRL Travels","SRS Travels","Orange Tours","Neeta Tours","Kallada","Patel Travels","Zingbus","Intrcity SmartBus","RedBus Express","Sharma Travels"];
  const TYPES = ["AC Sleeper","Non-AC Sleeper","AC Seater","Volvo Multi-Axle","AC Semi-Sleeper","Sleeper + Seater"];
  const AMENITIES = ["WiFi","Charging Point","Blanket","Water Bottle","Reading Light","Snacks","Live Tracking","Movies"];
  const seed = n => { const x = Math.sin(n)*10000; return x - Math.floor(x); };

  function generateBuses(from, to){
    const seedBase = (from+to).split("").reduce((a,c)=>a+c.charCodeAt(0),0);
    const buses = [];
    for(let i=0;i<8;i++){
      const r = n => seed(seedBase + i*13 + n);
      const dep = Math.floor(r(1)*22)+1;
      const dur = 4 + Math.floor(r(2)*10);
      const arr = (dep+dur)%24;
      const opIdx = Math.floor(r(3)*OPERATORS.length);
      const tIdx = Math.floor(r(4)*TYPES.length);
      const price = 400 + Math.floor(r(5)*1600);
      const rating = (3.8 + r(6)*1.2).toFixed(1);
      const amen = AMENITIES.filter((_,j)=> r(7+j) > .5).slice(0,4);
      buses.push({
        id: `${from}-${to}-${i}`,
        name: OPERATORS[opIdx],
        type: TYPES[tIdx],
        departure: `${String(dep).padStart(2,"0")}:${r(8)>.5?"30":"00"}`,
        arrival:   `${String(arr).padStart(2,"0")}:${r(9)>.5?"30":"00"}`,
        duration: `${dur}h ${Math.floor(r(10)*60)}m`,
        price, rating,
        seatsAvailable: 5 + Math.floor(r(11)*35),
        totalSeats: 40,
        amenities: amen.length ? amen : ["WiFi","Charging Point"],
        ecoFriendly: r(12) > .7,
      });
    }
    return buses;
  }

  /* ---- localStorage helpers ---- */
  const get = (k,d)=>{ try{ const v=localStorage.getItem(k); return v?JSON.parse(v):d; }catch(e){ return d; } };
  const set = (k,v)=> localStorage.setItem(k, JSON.stringify(v));

  let _currentUser = null;
  const Auth = {
    current(){ return _currentUser; },
    setCurrentUser(u){ _currentUser = u; },
    async login(email, pw){
      try {
        const res = await fetch('/api/auth/login/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password: pw })
        });
        const data = await res.json();
        if (data.success) {
          _currentUser = data.user;
          return true;
        }
      } catch(e) {
        console.error(e);
      }
      return false;
    },
    async signup(name, email, pw){
      try {
        const res = await fetch('/api/auth/signup/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password: pw })
        });
        const data = await res.json();
        if (data.success) {
          _currentUser = data.user;
          return true;
        }
      } catch(e) {
        console.error(e);
      }
      return false;
    },
    async logout(){
      try {
        await fetch('/api/auth/logout/', { method: 'POST' });
        _currentUser = null;
      } catch(e) {
        console.error(e);
      }
    }
  };


  const Bookings = {
    all(){ return get("busease_bookings", []); },
    add(b){
      const list = this.all();
      const booking = Object.assign({}, b, {
        id: "BE" + Date.now().toString().slice(-8),
        status: "confirmed",
        bookedAt: new Date().toISOString()
      });
      list.unshift(booking);
      set("busease_bookings", list);
      return booking;
    },
    cancel(id){
      set("busease_bookings", this.all().map(b => b.id===id ? Object.assign({}, b, {status:"cancelled"}) : b));
    },
    find(id){ return this.all().find(b => b.id===id); }
  };

  const POPULAR_ROUTES = [
    { from:"Mumbai", to:"Pune",     price:449, km:150 },
    { from:"Delhi", to:"Jaipur",    price:599, km:280 },
    { from:"Bengaluru", to:"Chennai",price:749, km:350 },
    { from:"Hyderabad", to:"Vijayawada", price:549, km:275 },
    { from:"Ahmedabad", to:"Surat", price:399, km:270 },
    { from:"Kolkata", to:"Patna",   price:699, km:580 },
  ];

  const DEFAULT_OFFERS = [
    { code:"FIRST50",   title:"Flat 50% OFF",     desc:"On your first booking. Up to ₹250 off.",    color:"grad-rose-orange",  icon:"🎁", percent:50, maxOff:250 },
    { code:"MONSOON25", title:"Monsoon Saver",    desc:"25% off on all AC Sleeper buses.",          color:"grad-sky-indigo",   icon:"☔", percent:25, maxOff:400 },
    { code:"WEEKEND15", title:"Weekend Wanderer", desc:"Extra 15% on Fri-Sun departures.",          color:"grad-violet-fuchsia",icon:"🌴", percent:15, maxOff:300 },
    { code:"EARLYBIRD", title:"Early Bird 30D",   desc:"30% off when booking 30+ days ahead.",      color:"grad-emerald-teal", icon:"🐦", percent:30, maxOff:600 },
    { code:"GROUP6",    title:"Group of 6",       desc:"Book 6 seats, get 1 free.",                 color:"grad-amber-rose",   icon:"👥", percent:16, maxOff:800 },
    { code:"WOMEN20",   title:"Women Travel",     desc:"Flat 20% off on Ladies seats.",             color:"grad-pink-rose",    icon:"💗", percent:20, maxOff:350 },
  ];
  const OffersStore = {
    all(){ const stored = get("busease_offers", null); return (stored && stored.length) ? stored : DEFAULT_OFFERS; },
    save(list){ set("busease_offers", list); },
    add(o){ const l = this.all(); l.unshift(o); this.save(l); },
    remove(code){ this.save(this.all().filter(o => o.code !== code)); },
    reset(){ localStorage.removeItem("busease_offers"); }
  };

  const BusStore = {
    all(){ return get("busease_custom_buses", []); },
    add(b){ const list = this.all(); list.unshift(Object.assign({}, b, { id: "CB"+Date.now() })); set("busease_custom_buses", list); },
    remove(id){ set("busease_custom_buses", this.all().filter(b => b.id !== id)); }
  };

  const Users = {
    all(){ return get("busease_users", []); },
    remove(email){ set("busease_users", this.all().filter(u => u.email !== email)); }
  };

  const BUS_FLEET = [
    { id:"mini",    name:"Mini Coach",         capacity:18, perKm:38, base:2500, features:["AC","Push-back seats","Music system"] },
    { id:"luxury",  name:"Luxury 35-Seater",   capacity:35, perKm:55, base:5000, features:["AC","Recliner seats","WiFi","Charging"] },
    { id:"volvo",   name:"Volvo Multi-Axle",   capacity:45, perKm:72, base:8000, features:["AC","Premium recliner","Pantry","WiFi","TV"] },
    { id:"sleeper", name:"Sleeper Special",    capacity:30, perKm:65, base:7000, features:["AC sleeper berths","Linen","Reading light"] },
  ];

  const toDate = (d)=>{
    if (!d) return new Date();
    if (d instanceof Date) return isNaN(d.getTime()) ? new Date() : d;
    const p = new Date(d);
    return isNaN(p.getTime()) ? new Date() : p;
  };
  const qs = (name, def="")=> new URLSearchParams(location.search).get(name) || def;
  const fmtDate = (d)=>{
    const dt = toDate(d);
    const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    return `${months[dt.getMonth()]} ${dt.getDate()}, ${dt.getFullYear()}`;
  };
  const fmtDateLong = (d)=>{
    const dt = toDate(d);
    const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return `${days[dt.getDay()]}, ${months[dt.getMonth()]} ${dt.getDate()}, ${dt.getFullYear()}`;
  };
  const fmtISO = (d)=>{
    if (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
    const dt = toDate(d);
    const y=dt.getFullYear(), m=String(dt.getMonth()+1).padStart(2,"0"), day=String(dt.getDate()).padStart(2,"0");
    return `${y}-${m}-${day}`;
  };
  const addDays = (d, n)=>{ const x=new Date(toDate(d)); x.setDate(x.getDate()+n); return x; };

  global.BE = {
    CITIES, generateBuses, Auth, Bookings,
    POPULAR_ROUTES, OffersStore, BusStore, Users, BUS_FLEET,
    qs, fmtDate, fmtDateLong, fmtISO, addDays
  };
})(window);
