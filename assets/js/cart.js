/**
 * PC Stock - Cart Module
 * Handles shopping cart with localStorage persistence
 */
const PCCart = (() => {
  'use strict';

  const STORAGE_KEY = 'pcstock-cart';
  const WHATSAPP_NUMBER = '595981103689';

  // ===================== STORAGE =====================
  function getCart() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  function saveCart(cart) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    window.dispatchEvent(new CustomEvent('cartUpdated'));
  }

  // ===================== CRUD =====================
  function add(product) {
    const cart = getCart();
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({
        id: product.id,
        nombre: product.nombre,
        categoria: product.categoria,
        imagen: product.imagen || '',
        qty: 1
      });
    }
    saveCart(cart);
  }

  function remove(productId) {
    const cart = getCart().filter(item => item.id !== productId);
    saveCart(cart);
  }

  function updateQty(productId, newQty) {
    const cart = getCart();
    const item = cart.find(i => i.id === productId);
    if (item) {
      if (newQty <= 0) {
        return remove(productId);
      }
      item.qty = newQty;
      saveCart(cart);
    }
  }

  function clear() {
    saveCart([]);
  }

  function getAll() {
    return getCart();
  }

  function getQty(productId) {
    const item = getCart().find(i => i.id === productId);
    return item ? item.qty : 0;
  }

  function getTotalItems() {
    return getCart().reduce((sum, item) => sum + item.qty, 0);
  }

  function getTotalProducts() {
    return getCart().length;
  }

  // ===================== WHATSAPP MESSAGE =====================
  function generateWhatsAppMessage() {
    const cart = getCart();
    if (cart.length === 0) return '';

    let message = 'Hola, quiero realizar este pedido:\n\n';
    cart.forEach(item => {
      message += `- ${item.nombre} x${item.qty}\n`;
    });
    message += '\nPor favor confirmar disponibilidad.';

    return encodeURIComponent(message);
  }

  function getWhatsAppURL() {
    const message = generateWhatsAppMessage();
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
  }

  // ===================== CART PAGE RENDERING =====================
  function initCartPage() {
    renderCart();

    // Clear cart button
    const clearBtn = document.getElementById('clearCartBtn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (confirm('¿Estás seguro de vaciar el carrito?')) {
          clear();
          renderCart();
          PCS.showToast('Carrito vaciado');
        }
      });
    }

    // Listen for updates
    window.addEventListener('cartUpdated', renderCart);
  }

  function renderCart() {
    const cart = getCart();
    const emptyEl = document.getElementById('cartEmpty');
    const contentEl = document.getElementById('cartContent');
    const itemsEl = document.getElementById('cartItems');
    const summaryProducts = document.getElementById('summaryProducts');
    const summaryUnits = document.getElementById('summaryUnits');
    const summaryTotal = document.getElementById('summaryTotal');
    const whatsappBtn = document.getElementById('whatsappCheckout');

    if (cart.length === 0) {
      if (emptyEl) emptyEl.classList.remove('hidden');
      if (contentEl) contentEl.classList.add('hidden');
      return;
    }

    if (emptyEl) emptyEl.classList.add('hidden');
    if (contentEl) contentEl.classList.remove('hidden');

    // Render items
    if (itemsEl) {
      itemsEl.innerHTML = cart.map(item => `
        <div class="cart-item" data-id="${item.id}">
          <div class="cart-item-image">
            ${item.imagen
              ? `<img src="${item.imagen}" alt="${item.nombre}" loading="lazy">`
              : `<svg class="placeholder-icon" xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><rect x="2" y="7" width="20" height="14" rx="2"/><polyline points="16 21 12 17 8 21"/></svg>`
            }
          </div>
          <div class="cart-item-info">
            <a href="producto.html?id=${item.id}" class="cart-item-name">${item.nombre}</a>
            <span class="cart-item-category">${item.categoria}</span>
            <div class="cart-item-controls">
              <button class="cart-qty-btn" onclick="PCCart.changeQty(${item.id}, -1)" aria-label="Reducir cantidad">−</button>
              <span class="cart-qty-display">${item.qty}</span>
              <button class="cart-qty-btn" onclick="PCCart.changeQty(${item.id}, 1)" aria-label="Aumentar cantidad">+</button>
            </div>
          </div>
          <button class="cart-item-remove" onclick="PCCart.removeItem(${item.id})" aria-label="Eliminar producto">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      `).join('');
    }

    // Summary
    const totalUnits = cart.reduce((sum, item) => sum + item.qty, 0);
    if (summaryProducts) summaryProducts.textContent = cart.length;
    if (summaryUnits) summaryUnits.textContent = totalUnits;
    if (summaryTotal) summaryTotal.textContent = totalUnits;

    // WhatsApp button
    if (whatsappBtn) {
      whatsappBtn.href = getWhatsAppURL();
    }
  }

  // ===================== PUBLIC HELPERS =====================
  function removeItem(productId) {
    remove(productId);
    PCS.showToast('Producto eliminado del carrito');
  }

  function changeQty(productId, delta) {
    const currentQty = getQty(productId);
    const newQty = currentQty + delta;
    if (newQty <= 0) {
      removeItem(productId);
    } else {
      updateQty(productId, newQty);
    }
  }

  // Public API
  return {
    add,
    remove,
    removeItem,
    updateQty,
    changeQty,
    clear,
    getAll,
    getQty,
    getTotalItems,
    getTotalProducts,
    generateWhatsAppMessage,
    getWhatsAppURL,
    initCartPage
  };
})();