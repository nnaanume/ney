/* ============================================================
   YOUR BRAND — Fresh Coconut Water | main.js
   ============================================================ */

// ── CONFIG — update your WhatsApp number here ──
const PHONE = '233245354165';

// ── CART STATE ──
let cart = [];

/* ─────────────────────────────────────────────
   CART FUNCTIONS
───────────────────────────────────────────── */

/**
 * Add a product directly (called from product card buttons)
 * Opens the order modal so the user can confirm qty
 */
function addToCart(name, price) {
  const existing = cart.find(i => i.name === name);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ name, price, qty: 1 });
  }
  updateCart();
  openModal('orderModal');
}

/**
 * Add from the order modal select + qty input
 */
function addFromModal() {
  const sel   = document.getElementById('modalProduct');
  const name  = sel.options[sel.selectedIndex].value;
  const price = parseInt(sel.options[sel.selectedIndex].dataset.price);
  const qty   = parseInt(document.getElementById('modalQty').value) || 1;

  const existing = cart.find(i => i.name === name);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ name, price, qty });
  }

  updateCart();
  closeModal('orderModal');
}

/**
 * Re-render all cart-related UI elements
 */
function updateCart() {
  const count = cart.reduce((a, i) => a + i.qty, 0);
  const total = cart.reduce((a, i) => a + i.price * i.qty, 0);

  // Nav & pill counters
  document.getElementById('cartCount').textContent = count;
  document.getElementById('navCartBtn').textContent = `🛒 Cart (${count})`;
  document.getElementById('cartTotal').textContent  = total;

  // Floating pill visibility
  const pill = document.getElementById('cartPill');
  if (count > 0) {
    pill.classList.add('visible');
  } else {
    pill.classList.remove('visible');
  }

  // Cart items list
  const itemsEl = document.getElementById('cartItems');
  if (cart.length === 0) {
    itemsEl.textContent = 'Your cart is empty.';
    return;
  }

  itemsEl.innerHTML = cart.map(i => `
    <div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid var(--border);">
      <span>${i.name} × ${i.qty}</span>
      <span style="font-weight:700;">₵${i.price * i.qty}</span>
    </div>
  `).join('');
}

/**
 * Clear the entire cart
 */
function clearCart() {
  cart = [];
  updateCart();
  closeModal('cartModal');
}

/* ─────────────────────────────────────────────
   WHATSAPP SENDERS
───────────────────────────────────────────── */

/**
 * Send the full cart order via WhatsApp
 */
function sendOrderWA() {
  if (cart.length === 0) {
    alert('Your cart is empty!');
    return;
  }

  const name  = document.getElementById('orderName').value;
  const phone = document.getElementById('orderPhone').value;
  const area  = document.getElementById('orderArea').value;
  const note  = document.getElementById('orderNote').value;
  const total = cart.reduce((a, i) => a + i.price * i.qty, 0);

  let msg = `Hello! I'd like to place an order:\n\n`;
  cart.forEach(i => {
    msg += `• ${i.name} × ${i.qty} = ₵${i.price * i.qty}\n`;
  });
  msg += `\nTotal: ₵${total}`;
  if (name)  msg += `\nName: ${name}`;
  if (phone) msg += `\nPhone: ${phone}`;
  if (area)  msg += `\nDelivery Area: ${area}`;
  if (note)  msg += `\nDirections: ${note}`;

  window.open(`https://wa.me/${PHONE}?text=${encodeURIComponent(msg)}`, '_blank');
}

/**
 * Send contact form message via WhatsApp
 */
function sendContactWA() {
  const name  = document.getElementById('cName').value;
  const phone = document.getElementById('cPhone').value;
  const msg   = document.getElementById('cMsg').value;

  const text = `Hello!\nName: ${name}\nPhone: ${phone}\nMessage: ${msg}`;
  window.open(`https://wa.me/${PHONE}?text=${encodeURIComponent(text)}`, '_blank');
}

/* ─────────────────────────────────────────────
   FAQ ACCORDION
───────────────────────────────────────────── */

function toggleFaq(btn) {
  const item    = btn.closest('.faq-item');
  const wasOpen = item.classList.contains('open');

  // Close all items first
  document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));

  // Re-open if it wasn't already open
  if (!wasOpen) item.classList.add('open');
}

/* ─────────────────────────────────────────────
   MODAL HELPERS
───────────────────────────────────────────── */

function openModal(id) {
  document.getElementById(id).classList.add('open');
}

function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}

// Close any modal when clicking the overlay background
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', e => {
    if (e.target === overlay) overlay.classList.remove('open');
  });
});

/* ─────────────────────────────────────────────
   HAMBURGER (MOBILE NAV)
───────────────────────────────────────────── */

document.getElementById('hamburger').addEventListener('click', () => {
  const links = document.querySelector('.nav-links');
  const isOpen = links.style.display === 'flex';

  if (isOpen) {
    links.style.cssText = '';
  } else {
    links.style.cssText = `
      display: flex;
      flex-direction: column;
      position: absolute;
      top: 68px; left: 0; right: 0;
      background: #0d1f14;
      padding: 24px 5%;
      gap: 18px;
      z-index: 999;
    `;
  }
});

/* ─────────────────────────────────────────────
   INIT
───────────────────────────────────────────── */
updateCart();
