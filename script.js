// Pidey Store - script.js
// Data storage keys
const STORAGE_KEY = 'pidey_products_v1';
const ADMIN_USER = { username: 'admin', password: 'pidey123' }; // hardcoded
const WA_NUMBER = '6285334679379'; // WA number in international format (no +)

// Default product data
const DEFAULT_PRODUCTS = [
  {
    id: 'mlbb',
    name: 'Mobile Legends',
    active: true,
    price: 10000,
    server: 'Global',
    nominals: [10000, 25000, 50000, 100000],
    stock: 10,
    description: 'Top up diamond Mobile Legends'
  },
  {
    id: 'ff',
    name: 'Free Fire',
    active: true,
    price: 8000,
    server: 'NA',
    nominals: [8000, 20000, 50000],
    stock: 5,
    description: 'Top up diamond Free Fire'
  },
  {
    id: 'pubg',
    name: 'PUBG Mobile',
    active: true,
    price: 12000,
    server: 'Asia',
    nominals: [12000, 30000, 70000],
    stock: 0,
    description: 'Top up UC PUBG'
  }
];

function loadProducts(){
  const raw = localStorage.getItem(STORAGE_KEY);
  if(!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PRODUCTS));
    return DEFAULT_PRODUCTS.slice();
  }
  try{
    return JSON.parse(raw);
  }catch(e){
    console.error('Invalid product data, resetting');
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PRODUCTS));
    return DEFAULT_PRODUCTS.slice();
  }
}

function saveProducts(products){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

// --- USER PAGE ---
function renderProducts(){
  const products = loadProducts();
  const container = document.getElementById('products');
  if(!container) return;
  container.innerHTML = '';
  const tpl = document.getElementById('product-template');
  products.forEach(prod => {
    if(!prod.active) return;
    const node = tpl.content.cloneNode(true);
    node.querySelector('.product-name').textContent = prod.name;
    const statusEl = node.querySelector('.product-status');
    statusEl.innerHTML = prod.stock > 0 ? `<span class="badge">Tersedia</span> • Stok: ${prod.stock}` : `<span class="badge soldout">Habis</span>`;
    node.querySelector('.product-details').textContent = `${prod.description} • Server: ${prod.server || '-'} `;

    const select = node.querySelector('.nominal-select');
    prod.nominals.forEach(n => {
      const opt = document.createElement('option');
      opt.value = n;
      opt.textContent = `Rp ${numberFormat(n)}`;
      select.appendChild(opt);
    });

    const priceDisplay = node.querySelector('.price-display');
    const updatePrice = ()=>{
      const val = Number(select.value || prod.nominals[0] || prod.price);
      priceDisplay.textContent = `Rp ${numberFormat(val)}`;
    };
    select.addEventListener('change', updatePrice);
    updatePrice();

    const buyBtn = node.querySelector('.order-btn');
    const nameInput = node.querySelector('.buyer-name');

    if(prod.stock <= 0) buyBtn.disabled = true;

    buyBtn.addEventListener('click',() => {
      const chosen = Number(select.value);
      const buyer = nameInput.value.trim();
      if(!buyer){
        if(!confirm('Nama pembeli kosong. Lanjut tambah sebagai "Pembeli"?')) return;
      }
      const confirmMsg = `Konfirmasi: Order ${prod.name} - Rp ${numberFormat(chosen)} untuk ${buyer || 'Pembeli'}.\nLanjutkan dan buka WhatsApp?`;
      if(!confirm(confirmMsg)) return;

      // Decrease stock
      const all = loadProducts();
      const p = all.find(x => x.id === prod.id);
      if(p && p.stock > 0){
        p.stock = Math.max(0, p.stock - 1);
        saveProducts(all);
        renderProducts();
      }
      // Build WhatsApp message
      const msg = `Halo, saya ingin top up ${prod.name} (${prod.server || '-'})\nNominal: Rp ${numberFormat(chosen)}\nNama: ${buyer || 'Pembeli'}\nID Game: ${prod.id}`;
      const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
      window.open(url, '_blank');
    });

    container.appendChild(node);
  });
}

function numberFormat(n){
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

// --- ADMIN PAGE ---
function initAdmin(){
  const loginBox = document.getElementById('loginBox');
  const adminPanel = document.getElementById('adminPanel');
  const loginBtn = document.getElementById('loginBtn');
  if(!loginBtn) return;

  loginBtn.addEventListener('click', ()=>{
    const user = document.getElementById('username').value.trim();
    const pass = document.getElementById('password').value.trim();
    if(user === ADMIN_USER.username && pass === ADMIN_USER.password){
      loginBox.classList.add('hidden');
      adminPanel.classList.remove('hidden');
      renderAdminProducts();
    }else{
      alert('Login gagal');
    }
  });
}

function renderAdminProducts(){
  const container = document.getElementById('adminProducts');
  if(!container) return;
  const products = loadProducts();
  container.innerHTML = '';
  products.forEach(prod => {
    const row = document.createElement('div');
    row.className = 'admin-row';

    const title = document.createElement('div');
    title.className = 'row';
    title.innerHTML = `<input class="control-input name-input" value="${prod.name}" /> <span class="muted">(${prod.id})</span>`;

    const rowStock = document.createElement('div');
    rowStock.className = 'row';
    rowStock.innerHTML = `
      <label>Stock: <input class="control-input stock-input" type="number" value="${prod.stock}" min="0" /></label>
      <label>Harga dasar: <input class="control-input price-input" type="number" value="${prod.price}" min="0" /></label>
      <label>Active: <input class="toggle active-checkbox" type="checkbox" ${prod.active? 'checked': ''} /></label>
    `;

    const rowServer = document.createElement('div');
    rowServer.className = 'row';
    rowServer.innerHTML = `Server: <input class="control-input server-input" value="${prod.server || ''}" />`;

    const rowDesc = document.createElement('div');
    rowDesc.className = 'row';
    rowDesc.innerHTML = `<textarea class="control-input desc-input">${prod.description || ''}</textarea>`;

    const rowNom = document.createElement('div');
    rowNom.className = 'row';
    const nomStr = prod.nominals.join(', ');
    rowNom.innerHTML = `Nominal: <input class="control-input nominals-input" value="${nomStr}" /> <small class="muted">pisahkan dengan koma</small>`;

    const btnRow = document.createElement('div');
    btnRow.className = 'row';

    const saveBtn = document.createElement('button');
    saveBtn.className = 'btn';
    saveBtn.textContent = 'Simpan Perubahan';

    const delBtn = document.createElement('button');
    delBtn.className = 'btn';
    delBtn.textContent = 'Hapus Produk';

    saveBtn.addEventListener('click', ()=>{
      const all = loadProducts();
      const p = all.find(x => x.id === prod.id);
      if(!p) return;
      p.name = title.querySelector('.name-input').value || p.name;
      p.server = rowServer.querySelector('.server-input').value || '';
      p.description = rowDesc.querySelector('.desc-input').value || '';
      p.stock = Number(rowStock.querySelector('.stock-input').value) || 0;
      p.price = Number(rowStock.querySelector('.price-input').value) || 0;
      p.active = !!rowStock.querySelector('.active-checkbox').checked;
      const nomStr2 = rowNom.querySelector('.nominals-input').value || '';
      p.nominals = nomStr2.split(',').map(s => Number(s.trim())).filter(Boolean);
      saveProducts(all);
      renderAdminProducts();
      renderProducts();
      alert('Perubahan disimpan');
    });

    delBtn.addEventListener('click', ()=>{
      if(!confirm('Hapus produk ini?')) return;
      let all = loadProducts();
      all = all.filter(x => x.id !== prod.id);
      saveProducts(all);
      renderAdminProducts();
      renderProducts();
      alert('Produk dihapus');
    });

    btnRow.appendChild(saveBtn);
    btnRow.appendChild(delBtn);

    row.appendChild(title);
    row.appendChild(rowStock);
    row.appendChild(rowServer);
    row.appendChild(rowDesc);
    row.appendChild(rowNom);
    row.appendChild(btnRow);
    container.appendChild(row);
  });
}

// --- Admin helpers: export/import/reset/add ---
function exportProducts(){
  const data = JSON.stringify(loadProducts(), null, 2);
  const blob = new Blob([data], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'pidey-products.json';
  a.click();
  URL.revokeObjectURL(url);
}

function importProductsFile(file){
  const reader = new FileReader();
  reader.onload = function(e){
    try{
      const json = JSON.parse(e.target.result);
      if(!Array.isArray(json)) throw new Error('Invalid format');
      saveProducts(json);
      renderAdminProducts();
      renderProducts();
      alert('Import berhasil');
    }catch(err){
      alert('Import gagal: ' + err.message);
    }
  };
  reader.readAsText(file);
}

function resetDefaults(){
  if(!confirm('Reset semua produk ke default?')) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PRODUCTS));
  renderAdminProducts();
  renderProducts();
  alert('Reset selesai');
}

function addNewProductFromForm(){
  const name = document.getElementById('new_name').value.trim();
  const id = document.getElementById('new_id').value.trim() || slugify(name);
  if(!name || !id){ alert('Nama dan ID diperlukan'); return; }
  const server = document.getElementById('new_server').value.trim();
  const price = Number(document.getElementById('new_price').value) || 0;
  const stock = Number(document.getElementById('new_stock').value) || 0;
  const nomStr = document.getElementById('new_nominals').value || '';
  const desc = document.getElementById('new_desc').value || '';
  const nominals = nomStr.split(',').map(s => Number(s.trim())).filter(Boolean);
  const all = loadProducts();
  if(all.find(x=>x.id === id)){ alert('ID sudah ada, gunakan ID unik'); return; }
  all.push({ id, name, active: true, price, server, nominals, stock, description: desc });
  saveProducts(all);
  renderAdminProducts();
  renderProducts();
  alert('Produk ditambahkan');
}

function slugify(s){
  return s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
}

// Initialize based on page
window.addEventListener('DOMContentLoaded', ()=>{
  renderProducts();
  initAdmin();

  // Wire admin controls (if present)
  const exp = document.getElementById('exportBtn');
  if(exp) exp.addEventListener('click', exportProducts);
  const imp = document.getElementById('importFile');
  if(imp) imp.addEventListener('change', (e)=>{
    const f = e.target.files && e.target.files[0];
    if(f) importProductsFile(f);
  });
  const rst = document.getElementById('resetBtn');
  if(rst) rst.addEventListener('click', resetDefaults);
  const addBtn = document.getElementById('addProductBtn');
  if(addBtn) addBtn.addEventListener('click', addNewProductFromForm);
});
