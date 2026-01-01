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
    const btn = node.querySelector('.select-game');
    if(!g.active) btn.disabled = true;
    btn.addEventListener('click', ()=>{
      SELECTED_GAME = g.id;
      renderProductGrid(g.id);
      document.getElementById('chooseTitle').textContent = `Paket untuk ${g.name}`;
      window.scrollTo({ top: 300, behavior: 'smooth' });
    });
    container.appendChild(node);
  });
}

function renderProductGrid(gameId){
  const games = loadGames();
  const game = games.find(x => x.id === gameId);
  const container = document.getElementById('productGrid');
  if(!container) return;
  container.innerHTML = '';
  if(!game) return;
  const tpl = document.getElementById('item-template');
  game.products.forEach((it, idx) => {
    const node = tpl.content.cloneNode(true);
    const card = node.querySelector('.product-card');
    const nominalEl = node.querySelector('.item-nominal');
    const priceEl = node.querySelector('.item-price');
    const stockEl = node.querySelector('.item-stock');
    const nameInput = node.querySelector('.buyer-name');
    const orderBtn = node.querySelector('.order-btn');

    nominalEl.textContent = it.nominal;
    priceEl.textContent = `Rp ${numberFormat(it.price)}`;
    stockEl.textContent = it.stock > 0 ? `Tersedia • Stok: ${it.stock}` : 'Habis';

    if(it.stock <= 0){
      orderBtn.disabled = true;
      card.style.opacity = '0.5';
    }

    orderBtn.addEventListener('click', ()=>{
      const buyer = nameInput.value.trim();
      if(!buyer && !confirm('Nama pembeli kosong. Lanjut sebagai "Pembeli"?')) return;
      const confirmMsg = `Konfirmasi: ${game.name} - ${it.nominal} - Rp ${numberFormat(it.price)}\nUntuk: ${buyer || 'Pembeli'}\nLanjutkan ke WhatsApp?`;
      if(!confirm(confirmMsg)) return;

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
function initAdmin(){
  const loginBtn = document.getElementById('loginBtn');
  if(!loginBtn) return;
  loginBtn.addEventListener('click', ()=>{
    const user = document.getElementById('username').value.trim();
    const pass = document.getElementById('password').value.trim();
    if(user === ADMIN_USER.username && pass === ADMIN_USER.password){
      document.getElementById('loginBox').classList.add('hidden');
      const layout = document.getElementById('adminLayout');
      if(layout) layout.classList.remove('hidden');
      renderAdminGames();
      // show default panel
      showPanel('panelGames');
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
        <input class="control-input p-stock" type="number" value="${p.stock}" />
        <button class="btn p-save">Simpan</button>
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
      <button class="btn add-pkg">Tambah Paket</button>
    `;
    addRow.querySelector('.add-pkg').addEventListener('click', ()=>{
      const nom = document.getElementById(`new_nom_${gi}`).value.trim();
      const price = Number(document.getElementById(`new_price_${gi}`).value) || 0;
      const stock = Number(document.getElementById(`new_stock_${gi}`).value) || 0;
      if(!nom){ alert('Nominal diperlukan'); return; }
      const all = loadGames();
      const gg = all.find(x=>x.id===g.id);
      gg.products.push({ nominal: nom, price, stock });
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
  const desc = document.getElementById('new_desc').value || '';
  const all = loadGames();
  if(all.find(x=>x.id === id)){ alert('ID sudah ada, gunakan ID unik'); return; }
  all.push({ id, name, active: true, server, description: desc, products: [] });
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
function showPanel(id){
  const panels = document.querySelectorAll('.panel');
  panels.forEach(p => p.classList.add('hidden'));
  const el = document.getElementById(id);
  if(el) el.classList.remove('hidden');
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

  // Wire admin controls (if present)
  const exp = document.getElementById('exportBtn');
  if(exp) exp.addEventListener('click', exportGames);
  const imp = document.getElementById('importFile');
  if(imp) imp.addEventListener('change', (e)=>{
    const f = e.target.files && e.target.files[0];
    if(f) importGamesFile(f);
  });
  const rst = document.getElementById('resetBtn');
  if(rst) rst.addEventListener('click', resetDefaults);
  const addBtn = document.getElementById('addProductBtn');
  if(addBtn) addBtn.addEventListener('click', addNewGameFromForm);

  // Sidebar nav wiring
  document.querySelectorAll('.s-link').forEach(a=>{
    a.addEventListener('click', (e)=>{
      e.preventDefault();
      const target = a.dataset.target;
      // require login
      const lb = document.getElementById('loginBox');
      if(lb && !lb.classList.contains('hidden')){ alert('Silakan login terlebih dahulu'); return; }
      showPanel(target);
    });
  });
});
