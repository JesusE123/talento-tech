const API_URL = "https://fakestoreapi.com";

/**
 * Extract the product ID from the URL parameters.
 */
function getProductIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id"); // Get the "id" parameter
}

/**
 * Fetch the product details using the ID and render them in the DOM.
 */
async function loadProductDetail() {
  const productId = getProductIdFromUrl();

  if (!productId) {
    document.getElementById("product-detail").innerHTML = `
      <div class="alert alert-danger">Product ID not specified in the URL!</div>
    `;
    return;
  }

  try {
   
    document.getElementById("loading-message").style.display = "block";
    const response = await fetch(`${API_URL}/products/${productId}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch product with ID: ${productId}`);
    }

    const product = await response.json();
    renderProductDetail(product);
  } catch (error) {
    document.getElementById("product-detail").innerHTML = `
      <div class="alert alert-danger">Error loading product: ${error.message}</div>
    `;
  } finally {
 
    document.getElementById("loading-message").style.display = "none";
  }
}

/**
 * Render the product details in the DOM.
 */
function renderProductDetail(product) {
  const productDetailContainer = document.getElementById("product-detail");

  
  productDetailContainer.innerHTML = `
    <div class="card">
      <div class="card-header">
        <h4>${product.title}</h4>
      </div>
      <div class="card-body">
        <div class="text-center mb-3">
          <img src="${product.image}" alt="${product.title}" class="img-fluid rounded" style="max-height: 300px; object-fit: contain;">
        </div>
        <p><strong>Price:</strong> $${product.price}</p>
        <p><strong>Description:</strong> ${product.description}</p>
        <p><strong>Category:</strong> ${product.category}</p>
        <p><strong>Rate:</strong> ${product.rating.rate}</p>
        <a href="index.html" class="btn btn-primary">Go Back</a>
      </div>
    </div>
  `;

  
  productDetailContainer.style.display = "block";
}

// Load product details when the page is ready
document.addEventListener("DOMContentLoaded", loadProductDetail);
