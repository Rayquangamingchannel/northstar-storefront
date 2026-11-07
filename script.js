const products = [
  { name: "MacBook Air 13″", price: 1099 },
  { name: "iPad Air", price: 599 },
  { name: "Refurbished MacBook Pro", price: 1499 },
  { name: "AirPods Pro", price: 249 },
];

const cart = new Map();
const cartDrawer = document.querySelector("#cart-drawer");
const cartBackdrop = document.querySelector("#cart-backdrop");
const cartItems = document.querySelector("#cart-items");
const cartCount = document.querySelector("#cart-count");
const drawerCount = document.querySelector("#drawer-count");
const cartSubtotal = document.querySelector("#cart-subtotal");
const checkoutButton = document.querySelector("#checkout-button");
const toast = document.querySelector("#toast");
let toastTimer;

function formatPrice(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function renderCart() {
  const quantity = [...cart.values()].reduce((total, item) => total + item.quantity, 0);
  const subtotal = [...cart.values()].reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );
  cartCount.textContent = quantity;
  drawerCount.textContent = `(${quantity})`;
  cartSubtotal.textContent = formatPrice(subtotal);
  checkoutButton.disabled = quantity === 0;

  if (quantity === 0) {
    cartItems.innerHTML = '<p class="empty-cart">Your bag is taking a little breather.</p>';
    return;
  }

  cartItems.replaceChildren(
    ...[...cart.values()].map((item) => {
      const line = document.createElement("div");
      line.className = "cart-line";

      const details = document.createElement("div");
      const name = document.createElement("strong");
      name.textContent = item.name;
      const price = document.createElement("span");
      price.className = "cart-line-price";
      price.textContent = formatPrice(item.price * item.quantity);
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "remove-item";
      remove.textContent = "Remove";
      remove.addEventListener("click", () => {
        cart.delete(item.name);
        renderCart();
      });
      details.append(name, price, remove);

      const controls = document.createElement("div");
      controls.className = "quantity-control";
      const decrement = document.createElement("button");
      decrement.type = "button";
      decrement.setAttribute("aria-label", `Remove one ${item.name}`);
      decrement.textContent = "−";
      decrement.addEventListener("click", () => changeQuantity(item.name, -1));
      const count = document.createElement("span");
      count.textContent = item.quantity;
      const increment = document.createElement("button");
      increment.type = "button";
      increment.setAttribute("aria-label", `Add one ${item.name}`);
      increment.textContent = "+";
      increment.addEventListener("click", () => changeQuantity(item.name, 1));
      controls.append(decrement, count, increment);
      line.append(details, controls);
      return line;
    }),
  );
}

function changeQuantity(name, amount) {
  const item = cart.get(name);
  if (!item) return;
  item.quantity += amount;
  if (item.quantity <= 0) cart.delete(name);
  renderCart();
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}

function openCart() {
  cartBackdrop.hidden = false;
  requestAnimationFrame(() => cartBackdrop.classList.add("visible"));
  cartDrawer.classList.add("open");
  cartDrawer.setAttribute("aria-hidden", "false");
  document.body.classList.add("cart-open");
  document.querySelector("#close-cart").focus();
}

function closeCart() {
  cartBackdrop.classList.remove("visible");
  cartDrawer.classList.remove("open");
  cartDrawer.setAttribute("aria-hidden", "true");
  document.body.classList.remove("cart-open");
  setTimeout(() => {
    if (!cartDrawer.classList.contains("open")) cartBackdrop.hidden = true;
  }, 250);
  document.querySelector("#open-cart").focus();
}

document.querySelectorAll(".quick-add").forEach((button) => {
  button.addEventListener("click", () => {
    const name = button.dataset.product;
    const price = Number(button.dataset.price);
    if (!products.some((product) => product.name === name && product.price === price)) {
      showToast("Sorry, this item is unavailable right now.");
      return;
    }
    const item = cart.get(name);
    if (item) item.quantity += 1;
    else cart.set(name, { name, price, quantity: 1 });
    renderCart();
    showToast(`${name} added to your bag.`);
  });
});

document.querySelectorAll(".category-pill").forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;
    document.querySelectorAll(".category-pill").forEach((pill) => {
      const active = pill === button;
      pill.classList.toggle("active", active);
      pill.setAttribute("aria-pressed", String(active));
    });
    document.querySelectorAll(".product-card").forEach((card) => {
      card.hidden = filter !== "all" && card.dataset.category !== filter;
    });
  });
});

document.querySelector("#open-cart").addEventListener("click", openCart);
document.querySelector("#close-cart").addEventListener("click", closeCart);
cartBackdrop.addEventListener("click", closeCart);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && cartDrawer.classList.contains("open")) closeCart();
});

document.querySelector("#checkout-button").addEventListener("click", () => {
  document.querySelector("#checkout-note").textContent =
    "Checkout is coming soon. Give us a call or stop by to place your order.";
});

document.querySelector("#newsletter-form").addEventListener("submit", (event) => {
  event.preventDefault();
  document.querySelector("#form-message").textContent =
    `Thanks! Newsletter signup is a demo until a mailing-list service is connected.`;
  event.currentTarget.reset();
});

document.querySelector("#year").textContent = new Date().getFullYear();
renderCart();
