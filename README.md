# 🖥️ PC Stock - Catálogo de Productos

Catálogo web de nivel empresarial para **PC Stock**, tienda de tecnología y computación en Encarnación, Paraguay.

## 🚀 Demo en Vivo

El sitio se despliega automáticamente en GitHub Pages una vez configurado.

## 📋 Características

- **3,720+ productos** cargados dinámicamente desde JSON
- **Búsqueda en tiempo real** con debounce de 250ms
- **Filtros por categoría** (32 categorías)
- **Ordenamiento** (A-Z, Z-A, mayor/menor stock)
- **Paginación** eficiente (24 productos por página)
- **Carrito de compras** con persistencia en localStorage
- **Checkout por WhatsApp** - genera mensaje automático con el pedido
- **Botón flotante de WhatsApp** con animación pulse
- **Modo oscuro** con toggle y persistencia
- **Diseño 100% responsive** (mobile-first)
- **Skeleton loading** durante la carga de productos
- **Micro-interacciones** y animaciones suaves
- **SEO básico** con meta tags
- **Accesibilidad** con roles ARIA y navegación por teclado

## 📁 Estructura del Proyecto

```
├── index.html          # Página principal (landing)
├── catalogo.html       # Catálogo con búsqueda y filtros
├── producto.html       # Detalle de producto
├── carrito.html        # Carrito de compras
├── README.md           # Este archivo
├── .gitignore
└── assets/
    ├── css/
    │   └── style.css   # Estilos completos con modo oscuro
    ├── js/
    │   ├── app.js      # Lógica principal (catálogo, búsqueda, filtros)
    │   └── cart.js     # Lógica del carrito + WhatsApp
    └── images/
        └── favicon.png
└── data/
    └── productos.json  # Base de datos de productos (3720 items)
```

## 🛠️ Tecnologías

- **HTML5** semántico
- **CSS3** puro (Custom Properties, Grid, Flexbox, Animaciones)
- **JavaScript** vanilla (ES6+, módulos, localStorage)
- **Google Fonts** (Inter)
- **GitHub Pages** para hosting

## 📦 Actualizar Productos

Los productos se cargan desde `data/productos.json`. Para actualizar:

1. Editar el archivo `data/productos.json`
2. Cada producto tiene el formato:
```json
{
  "id": 1,
  "nombre": "Nombre del Producto",
  "categoria": "Categoría",
  "descripcion": "Descripción del producto",
  "imagen": "url_de_la_imagen",
  "stock": 5
}
```

3. Hacer commit y push:
```bash
git add data/productos.json
git commit -m "Actualizar productos"
git push
```

## 🚀 Despliegue en GitHub Pages

### Configuración inicial

1. Crear un repositorio en GitHub
2. Subir los archivos del proyecto
3. Ir a **Settings > Pages**
4. En **Source**, seleccionar la rama `main` y carpeta `/ (root)`
5. Hacer clic en **Save**

El sitio estará disponible en:
```
https://[tu-usuario].github.io/[nombre-del-repo]/
```

### Comandos rápidos

```bash
# Clonar el repositorio
git clone https://github.com/caos1codex-hash/pcstock-catalogo.git

# Hacer cambios y subir
git add .
git commit -m "Actualización"
git push origin main
```

## 📱 WhatsApp Integration

El número de WhatsApp configurado es: **+595 981 103 689**

Al finalizar la compra, se genera un mensaje automático:
```
Hola, quiero realizar este pedido:

- RTX 4060 ASUS Dual x1
- Intel Core i7-13700K x2

Por favor confirmar disponibilidad.
```

## 🎨 Identidad Visual

- **Color primario**: `#E60000` (Rojo PC Stock)
- **Color secundario**: `#1a1a1a` (Negro)
- **Color WhatsApp**: `#25D366` (Verde)
- **Tipografía**: Inter (Google Fonts)
- **Estilo**: E-commerce moderno tipo MercadoLibre/Amazon

## 🌙 Modo Oscuro

El tema se alterna con el botón de sol/luna en el header. La preferencia se guarda en `localStorage` para persistir entre sesiones.

## 📊 Categorías Disponibles

| Categoría | Productos |
|-----------|-----------|
| Auriculares | 563 |
| Celulares | 330 |
| Coolers | 215 |
| Fuentes de Poder | 209 |
| Notebooks | 200 |
| Mouses | 172 |
| Monitores | 154 |
| Apple | 153 |
| Micrófonos | 150 |
| Teclados | 141 |
| Motherboards | 139 |
| Relojes | 136 |
| Gabinetes | 125 |
| Televisores | 120 |
| Tarjetas Gráficas | 109 |
| Memorias RAM | 102 |
| Parlantes | 87 |
| Almacenamiento SSD | 84 |
| Sillas Gamer | 70 |
| Aspiradoras | 67 |
| Impresoras | 65 |
| Proyectores | 53 |
| Cables | 49 |
| Procesadores | 44 |
| GPS | 33 |
| Consolas | 30 |
| Discos Duros | 26 |
| Soundbars | 25 |
| Drones | 23 |
| Media Converters | 14 |
| Estabilizadores | 7 |

---

## 📄 Licencia

Este proyecto es propiedad de **PC Stock - Informática**, Encarnación, Paraguay.

© 2024 PC Stock. Todos los derechos reservados.