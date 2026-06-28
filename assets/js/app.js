/**
 * PC Stock - App Module
 * Main application logic: catalog, search, filters, product detail
 */
const PCS = (() => {
  'use strict';

  const WHATSAPP_NUMBER = '595981103689';
  const PRODUCTS_PER_PAGE = 24;
  let allProducts = [];
  let filteredProducts = [];
  let currentPage = 1;
  let currentCategory = 'Todos';
  let currentSearch = '';
  let currentSort = 'default';

  // ===================== THEME =====================
  function initTheme() {
    const saved = localStorage.getItem('pcstock-theme') || 'light';
    setTheme(saved);
    document.querySelectorAll('#themeToggle').forEach(btn => {
      btn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        setTheme(current === 'dark' ? 'light' : 'dark');
      });
    });
  }

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('pcstock-theme', theme);
    document.querySelectorAll('.sun-icon').forEach(el => {
      el.style.display = theme === 'dark' ? 'none' : 'block';
    });
    document.querySelectorAll('.moon-icon').forEach(el => {
      el.style.display = theme === 'dark' ? 'block' : 'none';
    });
  }

  // ===================== MOBILE MENU =====================
  function initMobileMenu() {
    const btn = document.getElementById('mobileMenuBtn');
    const nav = document.getElementById('mobileNav');
    if (!btn || !nav) return;

    btn.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', isOpen);
    });

    // Close on link click
    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
      });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!nav.contains(e.target) && !btn.contains(e.target)) {
        nav.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // ===================== CART BADGE =====================
  function initCartBadge() {
    updateCartBadge();
    window.addEventListener('cartUpdated', updateCartBadge);
  }

  function updateCartBadge() {
    const cart = PCCart.getAll();
    const count = cart.reduce((sum, item) => sum + item.qty, 0);
    document.querySelectorAll('[id^="cartBadge"]').forEach(badge => {
      badge.textContent = count;
      if (count > 0) {
        badge.classList.add('show');
      } else {
        badge.classList.remove('show');
      }
    });
  }

  // ===================== TOAST =====================
  function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const iconSvg = type === 'success'
      ? '<svg class="toast-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>'
      : '<svg class="toast-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>';

    toast.innerHTML = `${iconSvg}<span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('removing');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // ===================== PRODUCT CARD HTML =====================
  function productCardHTML(product) {
    const stockClass = product.stock > 0 ? 'in-stock' : 'out-of-stock';
    const stockText = product.stock > 0 ? 'En stock' : 'Agotado';
    const inCart = PCCart.getQty(product.id);

    return `
      <article class="product-card" style="animation-delay: 0s">
        <a href="producto.html?id=${product.id}" class="product-card-image" aria-label="Ver ${product.nombre}">
          ${product.imagen
            ? `<img src="${product.imagen}" alt="${product.nombre}" loading="lazy">`
            : `<svg class="placeholder-icon" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><polyline points="16 21 12 17 8 21"/><line x1="2" y1="12" x2="22" y2="12"/></svg>`
          }
          <span class="product-card-stock ${stockClass}">${stockText}</span>
          <span class="product-card-category">${product.categoria}</span>
        </a>
        <div class="product-card-body">
          <a href="producto.html?id=${product.id}" class="product-card-name">${product.nombre}</a>
          <p class="product-card-desc">${product.categoria}</p>
          <div class="product-card-actions">
            <button class="btn btn-primary btn-sm" onclick="PCS.addToCart(${product.id})" ${product.stock <= 0 ? 'disabled' : ''}>
              ${inCart > 0 ? `En carrito (${inCart})` : 'Agregar'}
            </button>
            <a href="https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hola, quiero información sobre: ' + product.nombre)}" target="_blank" rel="noopener" class="btn btn-icon-only btn-ghost" aria-label="Consultar por WhatsApp" style="color: var(--color-whatsapp);">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            </a>
          </div>
        </div>
      </article>
    `;
  }

  // ===================== ADD TO CART =====================
  function addToCart(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;

    PCCart.add(product);
    showToast(`"${product.nombre.substring(0, 40)}..." agregado al carrito`);

    // Update button text in grid
    const cards = document.querySelectorAll('.product-card');
    cards.forEach(card => {
      const link = card.querySelector('a.product-card-image');
      if (link && link.href.includes(`id=${productId}`)) {
        const btn = card.querySelector('.btn-primary');
        if (btn) {
          const qty = PCCart.getQty(productId);
          btn.innerHTML = qty > 0 ? `En carrito (${qty})` : 'Agregar';
        }
      }
    });
  }

  // ===================== DATA LOADING =====================
  async function loadProducts() {
    try {
      const response = await fetch('data/productos.json');
      if (!response.ok) throw new Error('Error cargando productos');
      allProducts = await response.json();
      return allProducts;
    } catch (error) {
      console.error('Error loading products:', error);
      return [];
    }
  }

  // ===================== CATEGORIES =====================
  function getCategories(products) {
    const catMap = {};
    products.forEach(p => {
      catMap[p.categoria] = (catMap[p.categoria] || 0) + 1;
    });
    const cats = [{ name: 'Todos', count: products.length }];
    Object.entries(catMap)
      .sort((a, b) => b[1] - a[1])
      .forEach(([name, count]) => cats.push({ name, count }));
    return cats;
  }

  function renderCategories(cats) {
    const container = document.getElementById('categoriesScroll');
    if (!container) return;

    container.innerHTML = cats.map(cat => `
      <button class="category-chip ${cat.name === currentCategory ? 'active' : ''}" data-category="${cat.name}">
        ${cat.name} <span class="chip-count">(${cat.count})</span>
      </button>
    `).join('');

    container.querySelectorAll('.category-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        currentCategory = chip.dataset.category;
        currentPage = 1;
        applyFilters();
        renderCategories(cats);
        // Scroll chip into view
        chip.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      });
    });
  }

  // ===================== FILTERING & SORTING =====================
  function applyFilters() {
    let products = [...allProducts];

    // Category filter
    if (currentCategory !== 'Todos') {
      products = products.filter(p => p.categoria === currentCategory);
    }

    // Search filter
    if (currentSearch) {
      const searchLower = currentSearch.toLowerCase();
      products = products.filter(p =>
        p.nombre.toLowerCase().includes(searchLower) ||
        p.categoria.toLowerCase().includes(searchLower) ||
        p.descripcion.toLowerCase().includes(searchLower)
      );
    }

    // Sort
    switch (currentSort) {
      case 'az':
        products.sort((a, b) => a.nombre.localeCompare(b.nombre));
        break;
      case 'za':
        products.sort((a, b) => b.nombre.localeCompare(a.nombre));
        break;
      case 'stock-high':
        products.sort((a, b) => b.stock - a.stock);
        break;
      case 'stock-low':
        products.sort((a, b) => a.stock - b.stock);
        break;
    }

    filteredProducts = products;
    renderProducts();
    renderPagination();
  }

  // ===================== RENDERING =====================
  function renderProducts() {
    const grid = document.getElementById('productGrid');
    const emptyState = document.getElementById('emptyState');
    const results = document.getElementById('catalogResults');
    if (!grid) return;

    const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
    const start = (currentPage - 1) * PRODUCTS_PER_PAGE;
    const end = start + PRODUCTS_PER_PAGE;
    const pageProducts = filteredProducts.slice(start, end);

    if (results) {
      results.innerHTML = `Mostrando <strong>${pageProducts.length}</strong> de <strong>${filteredProducts.length}</strong> productos`;
    }

    if (pageProducts.length === 0) {
      grid.innerHTML = '';
      if (emptyState) emptyState.classList.remove('hidden');
      return;
    }

    if (emptyState) emptyState.classList.add('hidden');
    grid.innerHTML = pageProducts.map(p => productCardHTML(p)).join('');
  }

  function renderPagination() {
    const container = document.getElementById('pagination');
    if (!container) return;

    const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
    if (totalPages <= 1) {
      container.innerHTML = '';
      return;
    }

    let html = '';

    // Prev button
    html += `<button class="pagination-btn" ${currentPage === 1 ? 'disabled' : ''} data-page="${currentPage - 1}">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
    </button>`;

    // Page buttons (show max 5)
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    if (startPage > 1) {
      html += `<button class="pagination-btn" data-page="1">1</button>`;
      if (startPage > 2) html += `<span class="pagination-info">...</span>`;
    }

    for (let i = startPage; i <= endPage; i++) {
      html += `<button class="pagination-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) html += `<span class="pagination-info">...</span>`;
      html += `<button class="pagination-btn" data-page="${totalPages}">${totalPages}</button>`;
    }

    // Next button
    html += `<button class="pagination-btn" ${currentPage === totalPages ? 'disabled' : ''} data-page="${currentPage + 1}">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
    </button>`;

    container.innerHTML = html;

    // Bind events
    container.querySelectorAll('.pagination-btn[data-page]').forEach(btn => {
      btn.addEventListener('click', () => {
        const page = parseInt(btn.dataset.page);
        if (page >= 1 && page <= totalPages) {
          currentPage = page;
          applyFilters();
          window.scrollTo({ top: 200, behavior: 'smooth' });
        }
      });
    });
  }

  // ===================== CATALOG INIT =====================
  async function initCatalog() {
    const searchInput = document.getElementById('searchInput');
    const searchClear = document.getElementById('searchClear');
    const sortSelect = document.getElementById('sortSelect');
    const clearFilters = document.getElementById('clearFilters');
    const backToTop = document.getElementById('backToTop');

    // Check URL params for category
    const urlParams = new URLSearchParams(window.location.search);
    const catParam = urlParams.get('cat');
    if (catParam) {
      currentCategory = catParam;
    }

    await loadProducts();
    const categories = getCategories(allProducts);
    renderCategories(categories);
    applyFilters();

    // Search with debounce
    let searchTimeout;
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        currentSearch = searchInput.value.trim();
        searchClear?.classList.toggle('show', currentSearch.length > 0);
        searchTimeout = setTimeout(() => {
          currentPage = 1;
          applyFilters();
        }, 250);
      });

      // Focus search on '/' key
      document.addEventListener('keydown', (e) => {
        if (e.key === '/' && document.activeElement !== searchInput) {
          e.preventDefault();
          searchInput.focus();
        }
      });
    }

    if (searchClear) {
      searchClear.addEventListener('click', () => {
        searchInput.value = '';
        currentSearch = '';
        searchClear.classList.remove('show');
        currentPage = 1;
        applyFilters();
        searchInput.focus();
      });
    }

    if (sortSelect) {
      sortSelect.addEventListener('change', () => {
        currentSort = sortSelect.value;
        currentPage = 1;
        applyFilters();
      });
    }

    if (clearFilters) {
      clearFilters.addEventListener('click', () => {
        currentCategory = 'Todos';
        currentSearch = '';
        currentSort = 'default';
        currentPage = 1;
        if (searchInput) searchInput.value = '';
        if (searchClear) searchClear.classList.remove('show');
        if (sortSelect) sortSelect.value = 'default';
        const categories = getCategories(allProducts);
        renderCategories(categories);
        applyFilters();
      });
    }

    // Back to top
    if (backToTop) {
      window.addEventListener('scroll', () => {
        backToTop.classList.toggle('show', window.scrollY > 400);
      });
      backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }

  // ===================== PRODUCT DETAIL =====================
  async function initProductDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('id'));
    const loading = document.getElementById('productLoading');
    const content = document.getElementById('productContent');

    if (!productId) {
      if (loading) loading.innerHTML = '<p style="color:var(--text-secondary)">Producto no encontrado</p>';
      return;
    }

    await loadProducts();
    const product = allProducts.find(p => p.id === productId);

    if (!product) {
      if (loading) loading.innerHTML = '<p style="color:var(--text-secondary)">Producto no encontrado</p>';
      return;
    }

    // Update page title
    document.title = `${product.nombre} | PC Stock`;

    // Breadcrumb
    const breadcrumbCat = document.getElementById('breadcrumbCategory');
    const breadcrumbProd = document.getElementById('breadcrumbProduct');
    if (breadcrumbCat) {
      breadcrumbCat.textContent = product.categoria;
      breadcrumbCat.href = `catalogo.html?cat=${encodeURIComponent(product.categoria)}`;
    }
    if (breadcrumbProd) breadcrumbProd.textContent = product.nombre.substring(0, 50);

    // Product info
    const nameEl = document.getElementById('productName');
    const descEl = document.getElementById('productDesc');
    const catEl = document.getElementById('productCategory');
    const stockEl = document.getElementById('productStock');
    const imageEl = document.getElementById('productImage');
    const addBtn = document.getElementById('addToCartBtn');
    const waBtn = document.getElementById('whatsappProductBtn');

    if (nameEl) nameEl.textContent = product.nombre;
    if (descEl) descEl.textContent = product.descripcion || 'Consultanos por más detalles sobre este producto.';
    if (catEl) catEl.textContent = product.categoria;

    if (stockEl) {
      if (product.stock > 0) {
        stockEl.className = 'product-detail-stock in-stock';
        stockEl.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg><span>En stock</span>';
      } else {
        stockEl.className = 'product-detail-stock out-of-stock';
        stockEl.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg><span>Agotado</span>';
      }
    }

    if (imageEl) {
      if (product.imagen) {
        imageEl.innerHTML = `<img src="${product.imagen}" alt="${product.nombre}">`;
      }
    }

    if (addBtn) {
      if (product.stock <= 0) {
        addBtn.disabled = true;
        addBtn.innerHTML = 'Producto agotado';
      } else {
        addBtn.addEventListener('click', () => {
          PCCart.add(product);
          showToast('Producto agregado al carrito');
          const qty = PCCart.getQty(product.id);
          addBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> Agregado (${qty})`;
        });
      }
    }

    if (waBtn) {
      waBtn.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hola, quiero información sobre: ' + product.nombre)}`;
    }

    // Show content
    if (loading) loading.classList.add('hidden');
    if (content) content.classList.remove('hidden');

    // Related products
    const related = allProducts
      .filter(p => p.categoria === product.categoria && p.id !== product.id)
      .slice(0, 4);

    if (related.length > 0) {
      const section = document.getElementById('relatedSection');
      const grid = document.getElementById('relatedProducts');
      if (section && grid) {
        section.style.display = 'block';
        grid.innerHTML = related.map(p => productCardHTML(p)).join('');
      }
    }
  }

  // ===================== HOME PAGE =====================
  async function loadHomeCategories() {
    await loadProducts();
    const categories = getCategories(allProducts).filter(c => c.name !== 'Todos').slice(0, 8);
    const container = document.getElementById('homeCategories');
    if (!container) return;

    const icons = {
      'Auriculares': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>',
      'Celulares': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>',
      'Notebooks': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="2" y1="20" x2="22" y2="20"/></svg>',
      'Monitores': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',
      'Tarjetas Gráficas': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9 9h6v6H9z"/><path d="M9 1v3"/><path d="M15 1v3"/><path d="M9 20v3"/><path d="M15 20v3"/></svg>',
      'Teclados': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="14" rx="2"/><path d="M6 8h.01"/><path d="M10 8h.01"/><path d="M14 8h.01"/><path d="M18 8h.01"/><path d="M8 12h.01"/><path d="M12 12h.01"/><path d="M16 12h.01"/><path d="M7 16h10"/></svg>',
      'Mouses': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="2" width="12" height="20" rx="6"/><line x1="12" y1="6" x2="12" y2="10"/></svg>',
      'Procesadores': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 1v3"/><path d="M15 1v3"/><path d="M9 20v3"/><path d="M15 20v3"/><path d="M20 9h3"/><path d="M20 14h3"/><path d="M1 9h3"/><path d="M1 14h3"/></svg>'
    };

    container.innerHTML = categories.map(cat => `
      <a href="catalogo.html?cat=${encodeURIComponent(cat.name)}" class="feature-card">
        <div class="feature-icon">${icons[cat.name] || '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><polyline points="16 21 12 17 8 21"/></svg>'}</div>
        <h3>${cat.name}</h3>
        <p>${cat.count} productos</p>
      </a>
    `).join('');
  }

  async function loadFeaturedProducts() {
    if (allProducts.length === 0) await loadProducts();
    const featured = allProducts.slice(0, 8);
    const container = document.getElementById('featuredProducts');
    if (!container) return;
    container.innerHTML = featured.map(p => productCardHTML(p)).join('');
  }

  // Public API
  return {
    initTheme,
    initMobileMenu,
    initCartBadge,
    initCatalog,
    initProductDetail,
    loadHomeCategories,
    loadFeaturedProducts,
    addToCart,
    showToast
  };
})();