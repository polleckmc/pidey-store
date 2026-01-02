// Pidey Store - script.js (updated to new data model)
// Data storage keys
const STORAGE_KEY = 'pidey_games_v1';
const LEGACY_KEY = 'pidey_products_v1';
const ADMIN_USER = { username: 'admin', password: 'pidey123' }; // hardcoded
const WA_NUMBER = '6285334679379'; // WA number in international format (no +)

// number formatter
function numberFormat(n){
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

// Small SVG placeholder generator (returns data URL)
function svgPlaceholder(text, w=800, h=450, accent='#8b5cf6', fg='#9aa4b2'){
  const t = escapeHtml(String(text || '')).substring(0,36);
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}' viewBox='0 0 ${w} ${h}'><rect width='100%' height='100%' fill='#071226'/><g fill='none' stroke='${accent}' stroke-width='6'><rect x='20' y='20' width='${w-40}' height='${h-40}' rx='12' stroke-opacity='0.14' /></g><text x='50%' y='50%' fill='${fg}' font-family='Inter, Arial' font-size='28' text-anchor='middle' dominant-baseline='central'>${t}</text></svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

// Resolve thumbnail URL for product or game
function getThumbUrl(game, product){
  if(product && product.image) return product.image;
  if(game && game.image) return game.image;
  const label = (product && (product.nominal || product.name)) || (game && game.name) || 'Item';
  return svgPlaceholder(label);
}

// Load games (migrate legacy format if found)
function loadGames(){
  // Prefer new key
  const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_KEY);
  if(!raw){
    // use DEFAULT_GAMES from data.js if available
    if(typeof DEFAULT_GAMES !== 'undefined'){
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_GAMES));
      return JSON.parse(JSON.stringify(DEFAULT_GAMES));
    }
    return [];
  }
  try{
    const parsed = JSON.parse(raw);
    // Detect legacy format (array of games with nominals top-level)
    if(Array.isArray(parsed) && parsed.length && parsed[0].nominals !== undefined){
      // migrate to new schema
      const migrated = parsed.map(g => ({
        id: g.id || slugify(g.name || 'game'),
        name: g.name || g.id,
        active: g.active !== undefined ? g.active : true,
        server: g.server || '',
        description: g.description || '',
        products: (g.nominals || []).slice(0,10).map(n => ({ nominal: String(n), price: Number(n) || (g.price||0), stock: g.stock || 0 }))
      }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
      return migrated;
    }
    return parsed;
  }catch(e){
    console.error('Invalid game data, resetting to default');
    if(typeof DEFAULT_GAMES !== 'undefined'){
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_GAMES));
      return JSON.parse(JSON.stringify(DEFAULT_GAMES));
    }
    return [];
  }
}

function saveGames(games){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(games));
}

// --- USER PAGE ---
let SELECTED_GAME = null;

function renderGameList(filter){
  const q = (filter || '').toLowerCase();
  const games = loadGames().filter(g => {
    if(!q) return true;
    return (g.name + ' ' + (g.server||'') + ' ' + g.id).toLowerCase().includes(q);
  });
  const container = document.getElementById('gameList');
  if(!container) return;
  container.innerHTML = '';
  const tpl = document.getElementById('game-template');
  games.forEach(g => {
    const node = tpl.content.cloneNode(true);
    node.querySelector('.game-name').textContent = g.name;
    node.querySelector('.game-desc').textContent = g.description || '';
    node.querySelector('.game-meta').textContent = g.server ? `Server: ${g.server}` : '';
    const thumb = node.querySelector('.thumb');
    if(thumb) thumb.style.backgroundImage = `url('${getThumbUrl(g).replace(/'/g, "\\'")}')`;
    const btn = node.querySelector('.select-game');
    if(!g.active) btn.disabled = true;
    btn.addEventListener('click', ()=>{
      SELECTED_GAME = g.id;
      renderProductGrid(g.id);
      const titleEl = document.getElementById('chooseTitle');
      if(titleEl) titleEl.textContent = `Paket untuk ${g.name}`;
      try{ window.scrollTo({ top: 300, behavior: 'smooth' }); }catch(e){}
      // some environments (jsdom) may not implement scrollTo; ignore errors
    });
    container.appendChild(node);
  });

  // Auto-select first active game when none selected (improves UX)
  try{
    const productGrid = document.getElementById('productGrid');
    if(!SELECTED_GAME && productGrid && productGrid.children.length === 0 && games.length > 0){
      const firstActive = games.find(x => x.active) || games[0];
      if(firstActive){
        SELECTED_GAME = firstActive.id;
        renderProductGrid(firstActive.id);
        const titleEl = document.getElementById('chooseTitle');
        if(titleEl) titleEl.textContent = `Paket untuk ${firstActive.name}`;
      }
    }
  }catch(e){
    // fail silently in environments without full DOM
    console.warn('Auto-select skipped:', e && e.message);
  }
}

function renderProductGrid(gameId){
  const games = loadGames();
  const game = games.find(x => x.id === gameId);
  const container = document.getElementById('productGrid');
  if(!container) return;
  container.innerHTML = '';
  if(!game) return;
  const tpl = document.getElementById('item-template');
  if(!tpl){
    // fallback message if template missing
    container.innerHTML = '<div class="muted">Template paket tidak tersedia.</div>';
    return;
  }

  if(!game.products || !game.products.length){
    container.innerHTML = '<div class="muted">Tidak ada paket untuk game ini.</div>';
    return;
  }

  game.products.forEach((it, idx) => {
    const node = tpl.content.cloneNode(true);
    const card = node.querySelector('.product-card');
    const nominalEl = node.querySelector('.item-nominal');
    const priceBadge = node.querySelector('.price-badge');
    const stockEl = node.querySelector('.item-stock');
    const nameInput = node.querySelector('.buyer-name');
    const orderBtn = node.querySelector('.order-btn');
    const soldOverlay = node.querySelector('.soldout-overlay');
    const thumb = node.querySelector('.thumb');
    if(thumb) thumb.style.backgroundImage = `url('${getThumbUrl(game, it).replace(/'/g, "\\'")}')`;

    nominalEl.textContent = it.nominal;
    priceBadge.textContent = `Rp ${numberFormat(it.price)}`;
    stockEl.textContent = it.stock > 0 ? `Tersedia • Stok: ${it.stock}` : 'Habis';

    if(it.stock <= 0){
      orderBtn.disabled = true;
      card.classList.add('soldout');
      if(soldOverlay) soldOverlay.classList.remove('hidden');
    } else {
      card.classList.remove('soldout');
      if(soldOverlay) soldOverlay.classList.add('hidden');
    }

    orderBtn.addEventListener('click', ()=>{
      const buyer = nameInput.value.trim();
      if(!buyer && !confirm('Nama pembeli kosong. Lanjut sebagai "Pembeli"?')) return;
      const confirmMsg = `Konfirmasi: ${game.name} - ${it.nominal} - Rp ${numberFormat(it.price)}\nUntuk: ${buyer || 'Pembeli'}\nLanjutkan ke WhatsApp?`;
      if(!confirm(confirmMsg)) return;

      // Button micro animation
      orderBtn.classList.add('ordered');
      setTimeout(()=> orderBtn.classList.remove('ordered'), 400);

      // Decrement stock for this product
      const all = loadGames();
      const g = all.find(x => x.id === game.id);
      if(g && g.products && g.products[idx] && g.products[idx].stock > 0){
        g.products[idx].stock = Math.max(0, g.products[idx].stock - 1);
        saveGames(all);
        renderProductGrid(game.id);
        renderGameList();
      }

      const msg = `Halo, saya ingin order:\nGame: ${game.name}\nNominal: ${it.nominal}\nHarga: Rp ${numberFormat(it.price)}\nID Game: ${game.id}\nServer: ${game.server || '-'}\nNama: ${buyer || 'Pembeli'}`;
      const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
      window.open(url, '_blank');
    });

    container.appendChild(node);
  });
}

// --- ADMIN ---
function bindAdminUI(){
  const layout = document.getElementById('adminLayout');
  const tpl = document.getElementById('admin-layout-template');
  // only populate once
  if(tpl && layout && !layout.querySelector('.admin-layout-inner')){
    layout.innerHTML = '';
    layout.appendChild(tpl.content.cloneNode(true));
  }

  // Wire buttons inside admin layout
  const exp = document.getElementById('exportBtn');
  if(exp) exp.addEventListener('click', exportGames);
  const imp = document.getElementById('importFile');
  if(imp) imp.addEventListener('change', (e)=>{
    const f = e.target.files && e.target.files[0]; if(f) importGamesFile(f);
  });
  const rst = document.getElementById('resetBtn');
  if(rst) rst.addEventListener('click', resetDefaults);
  const addBtn = document.getElementById('addProductBtn');
  if(addBtn) addBtn.addEventListener('click', addNewGameFromForm);

  // Sidebar nav wiring (these links now exist)
  document.querySelectorAll('.s-link').forEach(a=>{
    a.addEventListener('click', (e)=>{
      e.preventDefault();
      const target = a.dataset.target;
      showPanel(target);
    });
  });
}

function initAdmin(){
  const loginBtn = document.getElementById('loginBtn');
  if(!loginBtn) return;
  const username = document.getElementById('username');
  if(username) username.focus();
  loginBtn.addEventListener('click', ()=>{
    const user = document.getElementById('username').value.trim();
    const pass = document.getElementById('password').value.trim();
    if(user === ADMIN_USER.username && pass === ADMIN_USER.password){
      document.getElementById('loginBox').classList.add('hidden');
      const layout = document.getElementById('adminLayout');
      if(layout){
        // reveal and populate admin UI
        layout.classList.remove('hidden');
        bindAdminUI();
        renderAdminGames();
        // show default panel
        showPanel('panelGames');
      }
    }else{
      alert('Login gagal');
    }
  });
}

function renderAdminGames(){
  const container = document.getElementById('adminProducts');
  if(!container) return;
  const games = loadGames();
  container.innerHTML = '';
  games.forEach((g, gi) => {
    const row = document.createElement('div');
    row.className = 'admin-row';

    const title = document.createElement('div');
    title.className = 'row';
    title.innerHTML = `<input class="control-input name-input" value="${g.name}" /> <span class="muted">(${g.id})</span>`;

    const top = document.createElement('div');
    top.className = 'row';
    top.innerHTML = `
      <label>Active: <input class="toggle active-checkbox" type="checkbox" ${g.active? 'checked': ''} /></label>
      <label>Server: <input class="control-input server-input" value="${g.server || ''}" /></label>
    `;

    const desc = document.createElement('div');
    desc.className = 'row';
    desc.innerHTML = `<textarea class="control-input desc-input">${g.description || ''}</textarea>`;

    const prodList = document.createElement('div');
    prodList.className = 'row';
    prodList.style.flexDirection = 'column';

    g.products.forEach((p, idx) => {
      const pRow = document.createElement('div');
      pRow.className = 'row';
      pRow.innerHTML = `
        <input class="control-input p-nominal" value="${escapeHtml(p.nominal)}" />
        <input class="control-input p-price" type="number" value="${p.price}" />
        <input class="control-input p-stock" type="number" value="${p.stock}" />        <input class="control-input p-image" placeholder="Image URL (opsional)" value="${escapeHtml(p.image || '')}" />        <button class="btn p-save">Simpan</button>
        <button class="btn p-del">Hapus</button>
      `;
      const saveBtn = pRow.querySelector('.p-save');
      const delBtn = pRow.querySelector('.p-del');
      saveBtn.addEventListener('click', ()=>{
        const all = loadGames();
        const gg = all.find(x=>x.id===g.id);
        if(!gg) return;
        gg.products[idx].nominal = pRow.querySelector('.p-nominal').value || gg.products[idx].nominal;
        gg.products[idx].price = Number(pRow.querySelector('.p-price').value) || 0;
        gg.products[idx].stock = Number(pRow.querySelector('.p-stock').value) || 0;
        gg.products[idx].image = pRow.querySelector('.p-image').value.trim() || gg.products[idx].image || '';
        saveGames(all);
        renderAdminGames();
        renderGameList();
        alert('Perubahan produk disimpan');
      });
      delBtn.addEventListener('click', ()=>{
        if(!confirm('Hapus paket ini?')) return;
        const all = loadGames();
        const gg = all.find(x=>x.id===g.id);
        if(!gg) return;
        gg.products.splice(idx,1);
        saveGames(all);
        renderAdminGames();
        renderGameList();
      });

      prodList.appendChild(pRow);
    });

    const addRow = document.createElement('div');
    addRow.className = 'row';
    addRow.innerHTML = `
      <input id="new_nom_${gi}" class="control-input" placeholder="Nominal" />
      <input id="new_price_${gi}" class="control-input" placeholder="Harga" type="number" />
      <input id="new_stock_${gi}" class="control-input" placeholder="Stok" type="number" />
      <input id="new_image_${gi}" class="control-input" placeholder="Image URL (opsional)" />
      <button class="btn add-pkg">Tambah Paket</button>
    `;
    addRow.querySelector('.add-pkg').addEventListener('click', ()=>{
      const nom = document.getElementById(`new_nom_${gi}`).value.trim();
      const price = Number(document.getElementById(`new_price_${gi}`).value) || 0;
      const stock = Number(document.getElementById(`new_stock_${gi}`).value) || 0;
      const image = document.getElementById(`new_image_${gi}`).value.trim() || '';
      if(!nom){ alert('Nominal diperlukan'); return; }
      const all = loadGames();
      const gg = all.find(x=>x.id===g.id);
      gg.products.push({ nominal: nom, price, stock, image });
      saveGames(all);
      renderAdminGames();
      renderGameList();
    });

    const btnRow = document.createElement('div');
    btnRow.className = 'row';

    const saveBtn = document.createElement('button');
    saveBtn.className = 'btn';
    saveBtn.textContent = 'Simpan Game';

    const delBtn = document.createElement('button');
    delBtn.className = 'btn';
    delBtn.textContent = 'Hapus Game';

    saveBtn.addEventListener('click', ()=>{
      const all = loadGames();
      const gg = all.find(x=>x.id===g.id);
      gg.name = title.querySelector('.name-input').value || gg.name;
      gg.server = top.querySelector('.server-input').value || '';
      gg.active = !!top.querySelector('.active-checkbox').checked;
      gg.description = desc.querySelector('.desc-input').value || '';
      saveGames(all);
      renderAdminGames();
      renderGameList();
      alert('Perubahan game disimpan');
    });

    delBtn.addEventListener('click', ()=>{
      if(!confirm('Hapus game ini?')) return;
      let all = loadGames();
      all = all.filter(x=>x.id !== g.id);
      saveGames(all);
      renderAdminGames();
      renderGameList();
    });

    btnRow.appendChild(saveBtn);
    btnRow.appendChild(delBtn);

    row.appendChild(title);
    row.appendChild(top);
    row.appendChild(desc);
    row.appendChild(prodList);
    row.appendChild(addRow);
    row.appendChild(btnRow);
    container.appendChild(row);
  });
}

// export/import/reset/add-game
function exportGames(){
  const data = JSON.stringify(loadGames(), null, 2);
  const blob = new Blob([data], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'pidey-games.json';
  a.click();
  URL.revokeObjectURL(url);
}

function importGamesFile(file){
  const reader = new FileReader();
  reader.onload = function(e){
    try{
      const json = JSON.parse(e.target.result);
      if(!Array.isArray(json)) throw new Error('Invalid format');
      saveGames(json);
      renderAdminGames();
      renderGameList();
      alert('Import berhasil');
    }catch(err){
      alert('Import gagal: ' + err.message);
    }
  };
  reader.readAsText(file);
}

function resetDefaults(){
  if(!confirm('Reset semua produk ke default?')) return;
  if(typeof DEFAULT_GAMES !== 'undefined'){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_GAMES));
    renderAdminGames();
    renderGameList();
    alert('Reset selesai');
  }else{
    alert('Tidak ada default games');
  }
}

function addNewGameFromForm(){
  const name = document.getElementById('new_name').value.trim();
  const id = document.getElementById('new_id').value.trim() || slugify(name);
  if(!name || !id){ alert('Nama dan ID diperlukan'); return; }
  const server = document.getElementById('new_server').value.trim();
  const image = document.getElementById('new_image') ? document.getElementById('new_image').value.trim() : '';
  const desc = document.getElementById('new_desc').value || '';
  const all = loadGames();
  if(all.find(x=>x.id === id)){ alert('ID sudah ada, gunakan ID unik'); return; }
  all.push({ id, name, active: true, server, image: image || '', description: desc, products: [] });
  saveGames(all);
  renderAdminGames();
  renderGameList();
  alert('Game ditambahkan');
}

function slugify(s){
  return s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
}

function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

// Small helper to show a specific admin panel
function animateElEnter(el){
  if(!el) return;
  el.classList.remove('hidden');
  el.classList.add('card-enter');
  requestAnimationFrame(()=>{
    el.classList.add('card-enter-active');
    el.classList.remove('card-enter');
    setTimeout(()=> el.classList.remove('card-enter-active'), 220);
  });
}

function showPanel(id){
  const panels = document.querySelectorAll('.panel');
  panels.forEach(p => p.classList.add('hidden'));
  const el = document.getElementById(id);
  if(el) animateElEnter(el);
  // update active link
  document.querySelectorAll('.s-link').forEach(a=>{
    a.classList.toggle('active', a.dataset.target === id);
  });
}

// Initialize based on page
window.addEventListener('DOMContentLoaded', ()=>{
  // wire search if present
  const search = document.getElementById('gameSearch');
  if(search) search.addEventListener('input', (e)=> renderGameList(e.target.value.trim()));
  renderGameList();
  initAdmin();

  // Admin UI is populated only after successful login; bindings occur in bindAdminUI().
});
