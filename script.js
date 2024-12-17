const API_URL = "https://fakestoreapi.com";

const productList = document.getElementById("products");
const categoriesList = document.getElementById("categories");
const resetProducts = document.getElementById("reset-products");
const productsCart = document.getElementById("cart");
const buttonCart = document.getElementById("cart-button");
const toastElement = document.getElementById("liveToast");
const toast = new bootstrap.Toast(toastElement);
const buttonConfirm = document.getElementById("confirm-sale");
let cart = JSON.parse(localStorage.getItem("cart")) || [];

console.log(cart);

let allProducts = [];

//when te page load, get the products and categories
document.addEventListener("DOMContentLoaded", () => {
  getProducts();
  getCategories();
  renderProductsCart();
  renderQuantityProductsCart();
});

/**
 * Fetches the products from the API, filtered by category if specified.
 * Stores the products in the global `allProducts` variable.
 * Calls `renderProducts` to render the products in the DOM.
 * If the fetch fails, logs the error to the console.
 * @param {string} [category] - The category of products to fetch.
 */
async function getProducts(category = null) {
  try {
    const url = category
      ? `${API_URL}/products/category/${category}`
      : `${API_URL}/products`;

    document.getElementById("loading-message").style.display = "block";

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const products = await response.json();
    allProducts = products;
    renderProducts(products);
  } catch (error) {
    console.error("Failed to fetch products:", error);
  } finally {
    document.getElementById("loading-message").style.display = "none";
  }
}

/**
 * Fetches the categories from the API.
 * Calls `renderCategories` to render the categories in the DOM.
 * If the fetch fails, logs the error to the console.
 */
async function getCategories() {
  try {
    const response = await fetch(`${API_URL}/products/categories`);

    if (!response.ok) {
      throw new Error("something went wrong");
    }

    const categories = await response.json();
    renderCategories(categories);
  } catch (err) {
    console.log("failed to fetch", error);
  }
}

function renderCategories(categories) {
  categoriesList.innerHTML = "";

  const ulElement = document.createElement("ul");
  ulElement.className =
    "list-inline d-flex flex-wrap justify-content-evenly p-3";

  categories.forEach((category) => {
    const categoryItem = document.createElement("li");
    categoryItem.className = "list-inline-item";

    const categoryLink = document.createElement("a");
    categoryLink.className = "btn btn-outline-primary w-100";
    categoryLink.textContent = category;

    categoryLink.addEventListener("click", function () {
      getProducts(category);
    });

    categoryItem.appendChild(categoryLink);

    ulElement.appendChild(categoryItem);
  });
  const buttonReset = document.createElement("button");
  buttonReset.className = "btn btn-outline-primary w-100 mt-3";
  buttonReset.textContent = "Todos";

  buttonReset.addEventListener("click", function () {
    getProducts();
  });

  categoriesList.appendChild(ulElement);
  resetProducts.appendChild(buttonReset);
}
/**
 * renders the products in the DOM"
 *
 * @param {object[]} products - list of products to render
 */

function renderProducts(products) {
  productList.innerHTML = "";

  products.forEach((product) => {
    const productItem = document.createElement("div");
    productItem.className = "col-sm-6 col-md-4 col-lg-3";

    productItem.innerHTML = `
      <div class="card h-100 shadow-sm p-3">
        <div class="ratio ratio-4x3">
          <img src="${product.image}" class="card-img-top img-fluid object-cover" alt="${product.title}">
        </div>
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">${product.title}</h5>
          <p class="card-text text-success fw-bold">$${product.price}</p>
          <p class="card-text text-muted text-truncate" style="max-width: 250px;">
            ${product.description}
          </p>
          <div class="mt-auto d-flex justify-content-between">
            <button type="button" class="btn btn-primary">
              Comprar
            </button>
            <a href="product-detail.html?id=${product.id}" class="btn btn-link">Ver detalle</a>
          </div>
        </div>
      </div>
    `;

    const buyButton = productItem.querySelector("button");

    buyButton.addEventListener("click", function () {
      captureProduct(product);
    });

    productList.appendChild(productItem);
  });
}

//filter products
document.getElementById("search").addEventListener("input", (event) => {
  const query = event.target.value.toLowerCase();

  const filteredProducts = allProducts.filter(
    (product) =>
      product.title.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query)
  );

  renderProducts(filteredProducts);
});

/**
 * Attaches click event listeners to product buttons to add products to the cart.
 *
 * @param {Array} products - An array of product objects to be added to the cart.
 */
function captureProduct(product) {
  const existingProduct = cart.find((item) => item.id === product.id);

  if (existingProduct) {
    existingProduct.quantity += 1;
    console.log(
      `Cantidad actualizada: ${existingProduct.title}, Cantidad: ${existingProduct.quantity}`
    );
  } else {
    cart.push({ ...product, quantity: 1 });
    const toastBody = toastElement.querySelector(".toast-body");
    toastBody.textContent = `El producto "${product.title}" ha sido agregado al carrito.`;

    // Mostrar el toast
    toast.show();
  }
  localStorage.setItem("cart", JSON.stringify(cart));

  renderProductsCart();
  renderQuantityProductsCart();
}

/**
 * Adds a product to the cart.
 *
 * @param {Object} product - The product to be added to the cart.
 */
function addToCart(product) {
  cart.push(product);
  renderProductsCart();
  calculateTotal();
}

/**
 * Renders the cart products in the DOM.
 *
 * @description
 * This function renders the products in the cart, including the product
 * title, price, and quantity. It also adds an event listener to each
 * product to remove it from the cart when the user clicks the close button.
 */

function renderProductsCart() {
  productsCart.innerHTML = "";
  const offcanvasTitle = document.getElementById("offcanvasExampleLabel");
  if (cart.length === 0) {
    offcanvasTitle.textContent = "Tu carrito se encuentra vacio.";
  } else {
    offcanvasTitle.textContent = "Estos son tus productos:";
  }

  if (cart.length >= 1) {
    buttonConfirm.className = "btn btn-outline-primary w-100 mt-3";
  } else {
    buttonConfirm.className = "disabled btn btn-outline-primary w-100 mt-3";
  }

  cart.forEach((product) => {
    const productItem = document.createElement("div");
    productItem.className = "col-12 w-100 mb-3";

    productItem.innerHTML = `
      <div class="list-group w-100">
        <div class="d-flex align-items-center justify-content-between">
          <h6 class="mb-0 flex-grow-1 text-truncate me-3">
            ${product.title}
          </h6>

          <p class="mb-0 opacity-75 text-end pe-3">
            $${product.price * product.quantity}
          </p>

          <button class="btn btn-danger d-flex align-items-center justify-content-center" onclick="deleteProduct(${cart.indexOf(
            product
          )})">
            <i class="material-icons">close</i>
          </button>
        </div>
        <strong class="font-bold">x ${product.quantity}</strong>

       
    <div class="d-flex gap-2 justify-content-end">
  <button class="btn btn-link" onclick="decreaseQuantity(${cart.indexOf(
    product
  )})">
    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" class="bi bi-dash-circle" viewBox="0 0 16 16">
      <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
      <path d="M4 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 4 8"/>
    </svg>
  </button>
  
  <button class="btn btn-link" onclick="increaseQuantity(${cart.indexOf(
    product
  )})">
    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" class="bi bi-plus-circle" viewBox="0 0 16 16">
      <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
      <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"/>
    </svg>
  </button>
</div>
    `;

    productsCart.appendChild(productItem);
    calculateTotal();
  });
}

/**
 * Updates the cart button badge with the total quantity of products in the cart.
 *
 * @description
 * This function selects the cart button from the DOM and updates its badge
 * with the current number of items in the cart, reflecting the total quantity
 * of products added.
 */
function renderQuantityProductsCart() {
  const buttonCart = document.getElementById("cart-button");

  const badge = buttonCart.querySelector(".badge-number");
  badge.textContent = cart.length;
}

/**
 * Deletes a product from the cart by index.
 *
 * @param {number} index - The index of the product in the cart to delete.
 */
function deleteProduct(index) {
  cart.splice(index, 1);

  localStorage.setItem("cart", JSON.stringify(cart));

  const toastBody = toastElement.querySelector(".toast-body");
  toastBody.textContent = `El producto ha sido eliminado del carrito correctamente.`;
  toast.show();

  renderProductsCart();
  renderQuantityProductsCart();
  calculateTotal();
}

function increaseQuantity(index) {
  cart[index].quantity += 1;
  localStorage.setItem("cart", JSON.stringify(cart));
  renderProductsCart();
  renderQuantityProductsCart();
}

function decreaseQuantity(index) {
  if (cart[index].quantity > 1) {
    cart[index].quantity -= 1;
    localStorage.setItem("cart", JSON.stringify(cart));
    renderProductsCart();
    renderQuantityProductsCart();
  } else {
    deleteProduct(index);
  }
}

function calculateTotal() {
  let total = 0;

  if (cart.length === 0) {
    document.getElementById("total").textContent = "Total de la compra: $0";
  }

  cart.forEach((product) => {
    if (product.price && product.quantity) {
      total += product.price * product.quantity;
    }
  });

  document.getElementById(
    "total"
  ).textContent = `Total de la compra: $${total}`;

  return total;
}

buttonConfirm.addEventListener("click", () => {
  cart = [];
  localStorage.setItem("cart", JSON.stringify(cart));
  renderProductsCart();
  renderQuantityProductsCart();
});
