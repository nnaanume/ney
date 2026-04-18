/* ============================================================
   NEY FRESH CHILLS — main.js
   ============================================================ */

const PHONE = '233245354165';

/* ─────────────────────────────────────────────
   SESSION / LOGIN
───────────────────────────────────────────── */

function getCurrentUser() {
  try {
    const u = sessionStorage.getItem('neyUser');
    return u ? JSON.parse(u) : null;
  } catch { return null; }
}

function setCurrentUser(user) {
  sessionStorage.setItem('neyUser', JSON.stringify(user));
}

function logout() {
  sessionStorage.removeItem('neyUser');
  location.reload();
}

/* ─────────────────────────────────────────────
   CART STATE — per-user via sessionStorage
───────────────────────────────────────────── */

function getCartKey() {
  const user = getCurrentUser();
  return user ? 'neyCart_' + user.email : 'neyCart_guest';
}

function loadCart() {
  try {
    const stored = sessionStorage.getItem(getCartKey());
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
}

function saveCart(cart) {
  sessionStorage.setItem(getCartKey(), JSON.stringify(cart));
}

/* ─────────────────────────────────────────────
   CART FUNCTIONS
───────────────────────────────────────────── */

function addFromModal() {
  const sel   = document.getElementById('modalProduct');
  const name  = sel.options[sel.selectedIndex].value;
  const price = parseInt(sel.options[sel.selectedIndex].dataset.price);
  const qty   = parseInt(document.getElementById('modalQty').value) || 1;

  const cart = loadCart();
  const existing = cart.find(i => i.name === name);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ name, price, qty });
  }

  saveCart(cart);
  updateCart();
  closeModal('orderModal');
}

function removeFromCart(index) {
  const cart = loadCart();
  cart.splice(index, 1);
  saveCart(cart);
  updateCart();
}

function decreaseQty(index) {
  const cart = loadCart();
  if (!cart[index]) return;
  cart[index].qty -= 1;
  if (cart[index].qty <= 0) cart.splice(index, 1);
  saveCart(cart);
  updateCart();
}

function increaseQty(index) {
  const cart = loadCart();
  if (!cart[index]) return;
  cart[index].qty += 1;
  saveCart(cart);
  updateCart();
}

function updateCart() {
  const cart  = loadCart();
  const count = cart.reduce((a, i) => a + i.qty, 0);
  const total = cart.reduce((a, i) => a + i.price * i.qty, 0);

  document.getElementById('cartCount').textContent  = count;
  document.getElementById('navCartBtn').textContent  = '🛒 Cart (' + count + ')';
  document.getElementById('cartTotal').textContent   = total;

  const pill = document.getElementById('cartPill');
  if (count > 0) pill.classList.add('visible');
  else           pill.classList.remove('visible');

  const itemsEl = document.getElementById('cartItems');
  if (cart.length === 0) {
    itemsEl.innerHTML = '<p style="color:var(--muted); font-size:0.9rem;">Your cart is empty.</p>';
    return;
  }

  itemsEl.innerHTML = cart.map(function(i, idx) {
    return '<div style="display:flex; align-items:center; gap:10px; padding:10px 0; border-bottom:1px solid var(--border);">' +
      '<span style="flex:1; font-size:0.9rem;">' + i.name + '</span>' +
      '<div style="display:flex; align-items:center; gap:6px;">' +
        '<button onclick="decreaseQty(' + idx + ')" style="width:28px;height:28px;border-radius:50%;border:1px solid var(--border);background:#fff;cursor:pointer;font-size:1rem;line-height:1;">−</button>' +
        '<span style="min-width:18px;text-align:center;font-weight:700;">' + i.qty + '</span>' +
        '<button onclick="increaseQty(' + idx + ')" style="width:28px;height:28px;border-radius:50%;border:1px solid var(--border);background:#fff;cursor:pointer;font-size:1rem;line-height:1;">+</button>' +
      '</div>' +
      '<span style="font-weight:700; min-width:52px; text-align:right;">₵' + (i.price * i.qty) + '</span>' +
      '<button onclick="removeFromCart(' + idx + ')" title="Remove" style="background:none;border:none;cursor:pointer;color:#e53;font-size:1.1rem;padding:0 4px;">🗑</button>' +
    '</div>';
  }).join('');
}

function clearCart() {
  saveCart([]);
  updateCart();
  closeModal('cartModal');
}

/* ─────────────────────────────────────────────
   ORDER MODAL — open full (any size) or locked (specific size)
───────────────────────────────────────────── */

function openOrderModalFull() {
  const sel = document.getElementById('modalProduct');
  for (var i = 0; i < sel.options.length; i++) sel.options[i].hidden = false;
  sel.disabled = false;
  document.getElementById('modalSizeLabel').style.display = '';
  document.getElementById('modalSizeLocked').style.display = 'none';
  document.getElementById('modalQty').value = 1;
  openModal('orderModal');
}

function openOrderModalLocked(name, price) {
  const sel = document.getElementById('modalProduct');
  for (var i = 0; i < sel.options.length; i++) {
    if (sel.options[i].value === name) {
      sel.selectedIndex = i;
      sel.options[i].hidden = false;
    } else {
      sel.options[i].hidden = true;
    }
  }
  sel.disabled = true;
  document.getElementById('modalSizeLabel').style.display = 'none';
  var lockedEl = document.getElementById('modalSizeLocked');
  lockedEl.style.display = '';
  lockedEl.textContent = 'Selected: ' + name.replace('Fresh Coconut Water — ', '') + ' — ₵' + price;
  document.getElementById('modalQty').value = 1;
  openModal('orderModal');
}

/* ─────────────────────────────────────────────
   WHATSAPP SENDERS
───────────────────────────────────────────── */

function sendOrderWA() {
  const cart = loadCart();
  if (cart.length === 0) { alert('Your cart is empty!'); return; }

  const user  = getCurrentUser();
  const name  = document.getElementById('orderName').value || (user ? user.name : '');
  const phone = document.getElementById('orderPhone').value;
  const area  = document.getElementById('orderArea').value;
  const note  = document.getElementById('orderNote').value;
  const total = cart.reduce(function(a, i) { return a + i.price * i.qty; }, 0);

  var msg = "Hello! I'd like to place an order:\n\n";
  cart.forEach(function(i) { msg += '• ' + i.name + ' × ' + i.qty + ' = ₵' + (i.price * i.qty) + '\n'; });
  msg += '\nTotal: ₵' + total;
  if (name)  msg += '\nName: ' + name;
  if (phone) msg += '\nPhone: ' + phone;
  if (area)  msg += '\nDelivery Area: ' + area;
  if (note)  msg += '\nDirections: ' + note;

  window.open('https://wa.me/' + PHONE + '?text=' + encodeURIComponent(msg), '_blank');
}

function sendContactWA() {
  const name  = document.getElementById('cName').value;
  const phone = document.getElementById('cPhone').value;
  const msg   = document.getElementById('cMsg').value;
  const text  = 'Hello!\nName: ' + name + '\nPhone: ' + phone + '\nMessage: ' + msg;
  window.open('https://wa.me/' + PHONE + '?text=' + encodeURIComponent(text), '_blank');
}

/* ─────────────────────────────────────────────
   LOGIN
───────────────────────────────────────────── */

function handleLogin(e) {
  e.preventDefault();
  var name  = document.getElementById('loginName').value.trim();
  var email = document.getElementById('loginEmail').value.trim();

  if (!name || !email) {
    document.getElementById('loginError').textContent = 'Please fill in both fields.';
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    document.getElementById('loginError').textContent = 'Please enter a valid email address.';
    return;
  }

  setCurrentUser({ name: name, email: email });
  document.getElementById('loginOverlay').style.display = 'none';
  document.getElementById('mainSite').style.display = '';
  updateUserUI();
  updateCart();
}

function updateUserUI() {
  var user = getCurrentUser();
  var greetEl   = document.getElementById('navGreeting');
  var logoutBtn = document.getElementById('navLogout');
  if (user) {
    greetEl.textContent = 'Hi, ' + user.name.split(' ')[0] + ' 👋';
    greetEl.style.display = '';
    logoutBtn.style.display = '';
    var orderNameEl = document.getElementById('orderName');
    if (orderNameEl && !orderNameEl.value) orderNameEl.value = user.name;
  } else {
    greetEl.style.display = 'none';
    logoutBtn.style.display = 'none';
  }
}

/* ─────────────────────────────────────────────
   FAQ ACCORDION
───────────────────────────────────────────── */

function toggleFaq(btn) {
  var item    = btn.closest('.faq-item');
  var wasOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item').forEach(function(i) { i.classList.remove('open'); });
  if (!wasOpen) item.classList.add('open');
}

/* ─────────────────────────────────────────────
   MODAL HELPERS
───────────────────────────────────────────── */

function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

document.querySelectorAll('.modal-overlay').forEach(function(overlay) {
  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) overlay.classList.remove('open');
  });
});

/* ─────────────────────────────────────────────
   HAMBURGER
───────────────────────────────────────────── */

document.getElementById('hamburger').addEventListener('click', function() {
  var links  = document.querySelector('.nav-links');
  var isOpen = links.style.display === 'flex';
  if (isOpen) {
    links.style.cssText = '';
  } else {
    links.style.cssText = 'display:flex;flex-direction:column;position:absolute;top:68px;left:0;right:0;background:#0d1f14;padding:24px 5%;gap:18px;z-index:999;';
  }
});

/* ─────────────────────────────────────────────
   INIT
───────────────────────────────────────────── */

(function init() {
  var user = getCurrentUser();
  if (user) {
    document.getElementById('loginOverlay').style.display = 'none';
    document.getElementById('mainSite').style.display = '';
    updateUserUI();
    updateCart();
  } else {
    document.getElementById('loginOverlay').style.display = 'flex';
    document.getElementById('mainSite').style.display = 'none';
  }
})();
