
(function () {

  const TMDB_KEY = "f8ecb75282e8dcea2d4845598cc7d030";
  const TMDB_BASE = "https://api.themoviedb.org/3";
  const TMDB_IMG = "https://image.tmdb.org/t/p/w342";
  const WATCH_REGION = "IT";

  const PAGES_PER_BATCH = 3;

  const WATCHED_KEY = "watchedMovies";
  const SETTINGS_KEY = "mf_settings_v3";

  const BASIC_LAST_SEARCH_KEY = "mf_basic_last_search_ts";
  const BASIC_COOLDOWN_MS = 24 * 60 * 60 * 1000;

  let providersByName = null;

  let lastQuery = null;
  let lastWeights = null;
  let batchIndex = 0;

  let watchedSet = new Set();

  let basicLockTimer = null;

  function $(id){ return document.getElementById(id); }

  function isPremium(){
    return localStorage.getItem("isPremium") === "1";
  }

  function isBasic(){
    return !isPremium();
  }

  function getTakeLimit(){
    return isPremium() ? 10 : 3;
  }

  function basicInfo(){
    const last = Number(localStorage.getItem(BASIC_LAST_SEARCH_KEY) || "0");
    if (!last) return { locked:false, remainingMs:0 };
    const remaining = BASIC_COOLDOWN_MS - (Date.now() - last);
    return { locked: remaining > 0, remainingMs: Math.max(0, remaining) };
  }

  function markBasicSearchDone(){
    localStorage.setItem(BASIC_LAST_SEARCH_KEY, String(Date.now()));
  }

  function fmtRemaining(ms){
    const totalMin = Math.ceil(ms / 60000);
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    if (h <= 0) return m + " min";
    return h + " h " + m + " min";
  }

  function setModePill(){
    const pill = $("modePill");
    const t1 = $("filtersTitle");
    const t2 = $("resultsTitle");
    if (pill) pill.textContent = isPremium() ? "Modalità Premium" : "Modalità Basic";
    if (t1) t1.textContent = isPremium() ? "Cosa vuoi guardare" : "Cosa vuoi guardare";
    if (t2) t2.textContent = isPremium() ? "Risultati" : "Risultati";
  }

  function setMoreButtonVisible(visible){
    const btnMore = $("btnMore");
    if (!btnMore) return;
    if (!visible){
      btnMore.disabled = true;
      btnMore.style.display = "none";
      return;
    }
    btnMore.disabled = false;
    btnMore.style.display = "";
  }

  function ensureBasicLockBox(){
    let box = $("mfBasicLockBox");
    if (box) return box;

    const host = $("basicView");
    if (!host) return null;

    box = document.createElement("div");
    box.id = "mfBasicLockBox";
    box.style.marginTop = "10px";
    box.style.padding = "12px";
    box.style.borderRadius = "10px";
    box.style.background = "#1b120d";
    box.style.border = "1px solid #333";
    box.style.fontSize = "14px";
    box.style.lineHeight = "1.35";
    box.classList.add("hidden");

    host.appendChild(box);
    return box;
  }

  function updateBasicLockUI(){
    if (isPremium()){
      const box = $("mfBasicLockBox");
      if (box) box.classList.add("hidden");

      const btn = window.__btnSearchRef;
      if (btn) btn.disabled = false;
      return;
    }

    const info = basicInfo();

    const btnSearch = window.__btnSearchRef;
    if (btnSearch) btnSearch.disabled = info.locked;

    const box = ensureBasicLockBox();
    if (!box) return;

    if (!info.locked){
      box.classList.add("hidden");
      return;
    }

    box.classList.remove("hidden");
    box.textContent =
      "Hai già effettuato una ricerca nelle ultime 24 ore. " +
      "Riprova tra " + fmtRemaining(info.remainingMs) + ". " +
      "Oppure sblocca Funzioni Premium.";
  }

  function startBasicLockTicker(){
    if (basicLockTimer) clearInterval(basicLockTimer);
    basicLockTimer = setInterval(updateBasicLockUI, 60000);
  }

  function loadWatched(){
    try{
      const raw = localStorage.getItem(WATCHED_KEY);
      if (!raw) { watchedSet = new Set(); return; }
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) watchedSet = new Set(arr.map(String));
      else watchedSet = new Set();
    }catch(e){
      watchedSet = new Set();
    }
  }

  function saveWatched(){
    try{
      localStorage.setItem(WATCHED_KEY, JSON.stringify(Array.from(watchedSet)));
    }catch(e){}
  }

  function isWatched(id){
    return watchedSet.has(String(id));
  }

  function markWatchedForever(id){
    const k = String(id || "");
    if (!k) return;
    if (watchedSet.has(k)) return;
    watchedSet.add(k);
    saveWatched();
  }

  function isHideWatchedEnabled(){
    const el = $("hideWatched");
    if (!el) return true;
    return !!el.checked;
  }

  function isAnimationEnabled(){
    const el = $("flagAnimazione");
    if (!el) return true;
    return !!el.checked;
  }

  function isAnimation(movie){
    const ids = movie && Array.isArray(movie.genre_ids) ? movie.genre_ids : [];
    return ids.includes(16);
  }

  function applyModeUI(){
    const premWrap = $("premiumGenresWrap");
    if (premWrap){
      if (isPremium()) premWrap.classList.remove("hidden");
      else premWrap.classList.add("hidden");
    }

    setModePill();
    setMoreButtonVisible(isPremium());
    applyPremiumLocks();
    updateBasicLockUI();
  }

  function applyPremiumLocks(){
    const premium = isPremium();

    const chk = $("hideWatched");
    const chip = $("hideWatchedChip");

    if (!chk || !chip) return;

    if (premium){
      chk.disabled = false;
      chip.classList.remove("disabled");
      return;
    }

    chk.checked = true;
    chk.disabled = true;
    chip.classList.add("disabled");

    if (chip.dataset.mfPremiumLockBound !== "1"){
      chip.dataset.mfPremiumLockBound = "1";
      chip.addEventListener("click", (e)=>{
        if (isPremium()) return;
        e.preventDefault();
        e.stopPropagation();
        alert("Sblocca Funzioni Premium per usare questa opzione");
      });
    }
  }

  function saveSettings(){
    try{
      const onlyOnline = $("onlyOnline") ? !!$("onlyOnline").checked : true;

      const plats = {};
      document.querySelectorAll("#basicPlatforms .plat").forEach(c=>{
        const name = c.getAttribute("data-provider") || "";
        if (name) plats[name] = !!c.checked;
      });

      const v = (id) => {
        const el = $(id);
        const n = el ? Number(el.value) : 0;
        return isNaN(n) ? 0 : n;
      };

      const payload = {
        onlyOnline,
        plats,
        sliders: {
          az: v("slAzione"),
          dr: v("slDrammatico"),
          sf: v("slSciFi"),
          co: v("slCommedia"),
          ho: v("slHorror"),
          th: v("slThriller"),
          ro: v("slRomantico"),
          fa: v("slFantasy"),
          av: v("slAvventura")
        },
        animazione: $("flagAnimazione") ? !!$("flagAnimazione").checked : true
      };

      if (isPremium()){
        payload.hideWatched = $("hideWatched") ? !!$("hideWatched").checked : true;
      } else {
        payload.hideWatched = true;
      }

      localStorage.setItem(SETTINGS_KEY, JSON.stringify(payload));
    }catch(e){}
  }

  function loadSettings(){
    try{
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (!raw) return;

      const data = JSON.parse(raw);
      if (!data || typeof data !== "object") return;

      if ($("onlyOnline") && typeof data.onlyOnline === "boolean"){
        $("onlyOnline").checked = data.onlyOnline;
      }

      if (isPremium() && $("hideWatched") && typeof data.hideWatched === "boolean"){
        $("hideWatched").checked = data.hideWatched;
      } else if ($("hideWatched")) {
        $("hideWatched").checked = true;
      }

      if ($("flagAnimazione") && typeof data.animazione === "boolean"){
        $("flagAnimazione").checked = data.animazione;
      } else if ($("flagAnimazione")) {
        $("flagAnimazione").checked = true;
      }

      if (data.plats && typeof data.plats === "object"){
        document.querySelectorAll("#basicPlatforms .plat").forEach(c=>{
          const name = c.getAttribute("data-provider") || "";
          if (!name) return;
          if (typeof data.plats[name] === "boolean") c.checked = data.plats[name];
        });
      }

      const setSlider = (id, val) => {
        const el = $(id);
        if (!el) return;
        if (typeof val !== "number" || isNaN(val)) return;
        el.value = String(val);
      };

      if (data.sliders && typeof data.sliders === "object"){
        setSlider("slAzione", Number(data.sliders.az || 0));
        setSlider("slDrammatico", Number(data.sliders.dr || 0));
        setSlider("slSciFi", Number(data.sliders.sf || 0));
        setSlider("slCommedia", Number(data.sliders.co || 0));
        setSlider("slHorror", Number(data.sliders.ho || 0));
        setSlider("slThriller", Number(data.sliders.th || 0));
        setSlider("slRomantico", Number(data.sliders.ro || 0));
        setSlider("slFantasy", Number(data.sliders.fa || 0));
        setSlider("slAvventura", Number(data.sliders.av || 0));
      }
    }catch(e){}
  }

  function hideExitOverlay(){
    const o = $("exitOverlay");
    if (!o) return;
    o.classList.remove("show");
    o.style.display = "none";
  }

  function hideAllViews(){
    $("loginView").classList.add("hidden");
    $("basicView").classList.add("hidden");
    $("resultsView").classList.add("hidden");
  }

  function showLogin(){
    hideAllViews();
    hideExitOverlay();
    $("loginView").classList.remove("hidden");
    setMoreButtonVisible(false);
  }

  function showBasic(){
    hideAllViews();
    hideExitOverlay();
    $("basicView").classList.remove("hidden");
    applyModeUI();
  }

  function showResults(){
    hideAllViews();
    hideExitOverlay();
    $("resultsView").classList.remove("hidden");
    updateBasicLockUI();
    setMoreButtonVisible(isPremium());
  }

  window.login = function(){
    localStorage.setItem("mf_logged","1");
    showBasic();
  };

  window.backToSearch = function(){
    showBasic();
  };

  function wireSliders(){
    const ids = [
      "slAzione","slDrammatico","slSciFi",
      "slCommedia","slHorror","slThriller","slRomantico","slFantasy","slAvventura"
    ];
    ids.forEach(id=>{
      const sl = $(id);
      if (!sl) return;
      sl.addEventListener("input", ()=>{
        sl.classList.remove("flash");
        void sl.offsetWidth;
        sl.classList.add("flash");
        saveSettings();
      }, {passive:true});
    });
  }

  function wireSettingsControls(){
    const only = $("onlyOnline");
    if (only) only.addEventListener("change", saveSettings, {passive:true});

    const hideW = $("hideWatched");
    if (hideW) hideW.addEventListener("change", saveSettings, {passive:true});

    const anim = $("flagAnimazione");
    if (anim) anim.addEventListener("change", saveSettings, {passive:true});

    document.querySelectorAll("#basicPlatforms .plat").forEach(c=>{
      c.addEventListener("change", saveSettings, {passive:true});
    });

    const btnSearch = document.querySelector("button[onclick='searchMovies()']");
    if (btnSearch) window.__btnSearchRef = btnSearch;
  }

  window.resetBasic = function(){
    if ($("onlyOnline")) $("onlyOnline").checked = true;
    if ($("hideWatched")) $("hideWatched").checked = true;
    if ($("flagAnimazione")) $("flagAnimazione").checked = true;

    document.querySelectorAll("#basicPlatforms .plat").forEach(c=>{
      c.checked = true;
    });

    const set0 = (id) => { if ($(id)) $(id).value = 0; };
    set0("slAzione");
    set0("slDrammatico");
    set0("slSciFi");
    set0("slCommedia");
    set0("slHorror");
    set0("slThriller");
    set0("slRomantico");
    set0("slFantasy");
    set0("slAvventura");

    saveSettings();
    applyModeUI();
  };

  function getWeights(){
    const v = (id) => {
      const el = $(id);
      const n = el ? Number(el.value) : 0;
      return isNaN(n) ? 0 : n;
    };

    const weights = {};
    weights[28] = v("slAzione");
    weights[18] = v("slDrammatico");
    weights[878] = v("slSciFi");

    if (isPremium()){
      weights[35] = v("slCommedia");
      weights[27] = v("slHorror");
      weights[53] = v("slThriller");
      weights[10749] = v("slRomantico");
      weights[14] = v("slFantasy");
      weights[12] = v("slAvventura");
    } else {
      weights[35] = 0;
      weights[27] = 0;
      weights[53] = 0;
      weights[10749] = 0;
      weights[14] = 0;
      weights[12] = 0;
    }

    return weights;
  }

  function selectedGenreIds(weights){
    return Object.keys(weights).map(Number).filter(id => (weights[id] || 0) > 0);
  }

  function isOnlyOnlineEnabled(){
    const el = $("onlyOnline");
    return !!(el && el.checked);
  }

  function selectedPlatformNames(){
    const checks = Array.from(document.querySelectorAll("#basicPlatforms .plat"));
    return checks.filter(c=>c.checked).map(c=>c.getAttribute("data-provider"));
  }

  function renderError(msg){
    const grid = $("resultsGrid");
    grid.innerHTML = "";
    const box = document.createElement("div");
    box.style.padding = "14px";
    box.style.background = "#1b120d";
    box.style.borderRadius = "8px";
    box.textContent = msg;
    grid.appendChild(box);
  }

  function escapeHtml(s){
    return String(s)
      .replaceAll("&","&amp;")
      .replaceAll("<","&lt;")
      .replaceAll(">","&gt;")
      .replaceAll('"',"&quot;")
      .replaceAll("'","&#039;");
  }

  async function shareText(text){
    try{
      if (navigator.share){
        await navigator.share({ text });
        return;
      }
    }catch(e){}

    try{
      if (navigator.clipboard && navigator.clipboard.writeText){
        await navigator.clipboard.writeText(text);
        alert("Copiato negli appunti");
        return;
      }
    }catch(e){}

    alert(text);
  }

  async function fetchProvidersIT(){
    const url =
      TMDB_BASE + "/watch/providers/movie" +
      "?api_key=" + encodeURIComponent(TMDB_KEY) +
      "&watch_region=" + encodeURIComponent(WATCH_REGION);

    const res = await fetch(url);
    if (!res.ok) throw new Error("HTTP " + res.status);

    const data = await res.json();
    const list = data.results || [];

    const map = {};
    list.forEach(p=>{
      if (p && p.provider_name && p.provider_id){
        map[p.provider_name] = p.provider_id;
      }
    });

    return map;
  }

  function getSelectedProviderIds(){
    if (!providersByName) return [];
    const names = selectedPlatformNames();
    const ids = [];
    names.forEach(n=>{
      const id = providersByName[n];
      if (id) ids.push(id);
    });
    return ids;
  }

  function scoreMovie(m, weights){
    const ids = m && Array.isArray(m.genre_ids) ? m.genre_ids : [];

    let genreScore = 0;
    let totalWeight = 0;

    for (const gidStr in weights){
      const gid = Number(gidStr);
      const w = weights[gid] || 0;
      if (w <= 0) continue;
      totalWeight += w;
      if (ids.includes(gid)) genreScore += w;
    }

    const matchRatio = totalWeight > 0 ? (genreScore / totalWeight) : 0;

    const vote = (m && typeof m.vote_average === "number") ? m.vote_average : 0;
    const pop = (m && typeof m.popularity === "number") ? m.popularity : 0;
    const votesCount = (m && typeof m.vote_count === "number") ? m.vote_count : 0;

    const base =
      (vote * 0.10) +
      (Math.log10(votesCount + 1) * 0.08) +
      (pop * 0.0004);

    return (genreScore * 60) + (matchRatio * 40) + base;
  }

  async function fetchDiscoverPage(urlBase, page){
    const res = await fetch(urlBase + "&page=" + page);
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();
    return (data && data.results) ? data.results : [];
  }

  function buildDiscoverUrl(weights){
    const onlyOnline = isOnlyOnlineEnabled();
    const providerIds = onlyOnline ? getSelectedProviderIds() : [];

    const genreIds = isAnimationEnabled() ? [16] : selectedGenreIds(weights);

    let url =
      TMDB_BASE + "/discover/movie" +
      "?api_key=" + encodeURIComponent(TMDB_KEY) +
      "&language=it-IT" +
      "&include_adult=false" +
      "&sort_by=popularity.desc";

    if (genreIds.length){
      url += "&with_genres=" + encodeURIComponent(genreIds.join("|"));
    }

    if (onlyOnline){
      url += "&watch_region=" + encodeURIComponent(WATCH_REGION);
      url += "&with_watch_monetization_types=flatrate";
      if (providerIds.length){
        url += "&with_watch_providers=" + encodeURIComponent(providerIds.join("|"));
      }
    }

    return url;
  }

  function renderCards(list){
    const grid = $("resultsGrid");
    grid.innerHTML = "";

    list.forEach(f=>{
      const id = (f && f.id) ? String(f.id) : "";
      const title = f && f.title ? f.title : "Senza titolo";
      const year = f && f.release_date ? String(f.release_date).slice(0,4) : "—";
      const vote = (f && typeof f.vote_average === "number") ? f.vote_average.toFixed(1) : "—";
      const poster = (f && f.poster_path) ? (TMDB_IMG + f.poster_path) : "";
      const sharePayload = title + " (" + year + ")";

      const card = document.createElement("div");
      card.className = "card";

      const watchedOn = id && isWatched(id);

      card.innerHTML = `
        ${id ? `<div class="watchedTag ${watchedOn ? "on" : ""}">Guardato</div>` : ""}
        <div class="posterBox">
          ${poster ? `<img src="${poster}" alt="">` : `<div style="opacity:0.7;font-size:12px">NO POSTER</div>`}
        </div>
        <div class="card-title">${escapeHtml(title)}</div>
        <div class="card-meta">${year} • ⭐ ${vote}</div>
        <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
          <button type="button" data-act="share">Condividi</button>
          <button type="button" data-act="watch" class="secondary">Guarda</button>
        </div>
      `;

      const btnShare = card.querySelector('[data-act="share"]');
      const btnWatch = card.querySelector('[data-act="watch"]');

      if (btnShare){
        btnShare.addEventListener("click", async ()=>{
          await shareText(sharePayload);
        });
      }

      if (btnWatch){
        btnWatch.addEventListener("click", ()=>{
          if (id) markWatchedForever(id);
          playAndExit();
        });
      }

      grid.appendChild(card);
    });
  }

  async function runSearch(useNextBatch){
    if (isBasic()){
      const info = basicInfo();
      if (info.locked){
        showBasic();
        updateBasicLockUI();
        return;
      }
      if (useNextBatch){
        return;
      }
    }

    showResults();

    if (!TMDB_KEY || TMDB_KEY.indexOf("INCOLLA_") >= 0){
      renderError("Manca la TMDB API key");
      return;
    }

    saveSettings();

    if (!useNextBatch){
      batchIndex = 0;
      lastWeights = getWeights();
      lastQuery = buildDiscoverUrl(lastWeights);
    } else {
      if (!lastQuery || !lastWeights){
        batchIndex = 0;
        lastWeights = getWeights();
        lastQuery = buildDiscoverUrl(lastWeights);
      } else {
        batchIndex += 1;
      }
    }

    const startPage = 1 + (batchIndex * PAGES_PER_BATCH);
    const endPage = startPage + PAGES_PER_BATCH - 1;

    try{
      const pool = [];
      for (let p = startPage; p <= endPage; p++){
        const list = await fetchDiscoverPage(lastQuery, p);
        list.forEach(x => pool.push(x));
      }

      if (!pool.length){
        renderError(isPremium() ? "Nessun risultato in questo blocco. Premi Altri 10." : "Nessun risultato. Cambia filtri e riprova.");
        return;
      }

      let filtered = pool;

      if (isAnimationEnabled()){
        filtered = filtered.filter(m => isAnimation(m));
      } else {
        filtered = filtered.filter(m => !isAnimation(m));
      }

      if (isPremium() && isHideWatchedEnabled()){
        filtered = filtered.filter(m=>{
          const id = m && m.id ? String(m.id) : "";
          return id ? !isWatched(id) : true;
        });
      }

      if (!filtered.length){
        renderError(isPremium() ? "Nessun risultato in questo blocco. Premi Altri 10." : "Nessun risultato. Cambia filtri e riprova.");
        return;
      }

      const take = getTakeLimit();

      const ranked = filtered
        .map(m => ({ m, s: scoreMovie(m, lastWeights) }))
        .sort((a,b) => b.s - a.s)
        .slice(0, take)
        .map(x => x.m);

      renderCards(ranked);

      if (isBasic() && !useNextBatch){
        markBasicSearchDone();
        updateBasicLockUI();
      }

    } catch (e){
      renderError("Errore rete o permessi");
    }
  }

  window.searchMovies = async function(){ await runSearch(false); };
  window.moreResults = async function(){
    if (isBasic()) return;
    await runSearch(true);
  };

  function playAndExit(){
    const o = $("exitOverlay");
    if (!o) return hardExit();

    o.style.display = "flex";
    o.classList.add("show");

    setTimeout(hardExit, 3800);
  }

  function hardExit(){
    try {
      if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App) {
        window.Capacitor.Plugins.App.exitApp();
        return;
      }
    } catch (e) {}

    try {
      if (navigator.app && navigator.app.exitApp) {
        navigator.app.exitApp();
        return;
      }
    } catch (e) {}

    try { window.close(); } catch (e) {}
    try { location.href = "about:blank"; } catch (e) {}
  }

  async function init(){
    loadWatched();
    hideExitOverlay();

    loadSettings();
    wireSliders();
    wireSettingsControls();

    if (TMDB_KEY && TMDB_KEY.indexOf("INCOLLA_") < 0){
      try{
        providersByName = await fetchProvidersIT();
      }catch(e){
        providersByName = null;
      }
    }

    if (localStorage.getItem("mf_logged")==="1") showBasic();
    else showLogin();

    applyModeUI();
    startBasicLockTicker();
  }

  document.readyState==="loading"
    ? document.addEventListener("DOMContentLoaded", init)
    : init();

})();
