
(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const cart = new Map();

  let currentUser = null;
  let selectedPayment = "Cash On Delivery";
  let latestOrder = null;

  async function api(url, options = {}) {
    const response = await fetch(url, {
      ...options,
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {})
      }
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        payload.message || "Request failed. Please try again."
      );
    }

    return payload;
  }

  function message(id, text, success = false) {
    const el = $(id);
    if (!el) return;

    el.textContent = text || "";
    el.classList.toggle("success", Boolean(success));
  }

  function showOnly(pageId) {
    ["registrationPage", "loginPage", "website"].forEach(id => {
      const el = $(id);

      if (el) {
        el.style.display =
          id === pageId
            ? (id === "website" ? "block" : "flex")
            : "none";
      }
    });
  }

  function hidePaymentPopups() {
    if ($("qrBox")) $("qrBox").style.display = "none";
    if ($("checkoutBox")) $("checkoutBox").style.display = "none";
    if ($("billBox")) $("billBox").style.display = "none";
  }

  // Registration and login navigation
  window.showLoginPage = () => {
    message("registerMessage", "");
    showOnly("loginPage");
  };

  window.showRegistrationPage = () => {
    message("loginMessage", "");
    showOnly("registrationPage");
  };

  // Register a new account
  window.registerUser = async () => {
    const name = $("regName")?.value.trim();
    const mobile = $("regNumber")?.value.trim();
    const email = $("regEmail")?.value.trim();
    const password = $("regPassword")?.value || "";
    const button = $("registerBtn");

    message("registerMessage", "");

    if (!name || !mobile || !email || !password) {
      return message(
        "registerMessage",
        "Please complete all fields."
      );
    }

    if (password.length < 8) {
      return message(
        "registerMessage",
        "Password must contain at least 8 characters."
      );
    }

    try {
      if (button) {
        button.disabled = true;
        button.textContent = "Creating account...";
      }

      const result = await api("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name,
          mobile,
          email,
          password
        })
      });

      message("registerMessage", result.message, true);

      if ($("fullName")) $("fullName").value = name;
      if ($("email")) $("email").value = email;
      if ($("loginPassword")) $("loginPassword").value = "";

      setTimeout(() => {
        showOnly("loginPage");
        message("loginMessage", result.message, true);
      }, 900);

    } catch (error) {
      message("registerMessage", error.message);
    } finally {
      if (button) {
        button.disabled = false;
        button.textContent = "Register";
      }
    }
  };

  // Login
  window.verifyEmail = async () => {
    const email = $("email")?.value.trim();
    const password = $("loginPassword")?.value || "";

    message("loginMessage", "");

    if (!email || !password) {
      return message(
        "loginMessage",
        "Enter your email and password."
      );
    }

    const button = document.querySelector(
      "#loginPage .login-box > button"
    );

    try {
      if (button) {
        button.disabled = true;
        button.textContent = "Logging in...";
      }

      const result = await api("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
      });

      currentUser = result.user;

      if ($("verifiedName")) {
        $("verifiedName").textContent = currentUser.name;
      }

      if ($("verifiedEmail")) {
        $("verifiedEmail").textContent = currentUser.email;
      }

      if ($("successMessage")) {
        $("successMessage").style.display = "block";
      }

      if ($("startBtn")) {
        $("startBtn").style.display = "none";
      }

      message("loginMessage", result.message, true);

    } catch (error) {
      message("loginMessage", error.message);
    } finally {
      if (button) {
        button.disabled = false;
        button.textContent = "Login";
      }
    }
  };

  window.showStartOrdering = () => {
    if ($("successMessage")) {
      $("successMessage").style.display = "none";
    }

    if ($("startBtn")) {
      $("startBtn").style.display = "block";
    }
  };

  window.startWebsite = () => {
    if (!currentUser) {
      return showOnly("loginPage");
    }

    showOnly("website");

    if ($("welcomeUser")) {
      $("welcomeUser").textContent =
        `Hi, ${currentUser.name}`;
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  // Restore an existing login session
  async function restoreSession() {
    try {
      const result = await api("/api/auth/me");

      currentUser = result.user;

      showOnly("website");

      if ($("welcomeUser")) {
        $("welcomeUser").textContent =
          `Hi, ${currentUser.name}`;
      }
    } catch {
      showOnly("registrationPage");
    }
  }

  // Logout
  window.logoutUser = async () => {
    try {
      await api("/api/auth/logout", {
        method: "POST",
        body: "{}"
      });
    } catch (error) {
      console.error(error);
    }

    currentUser = null;
    cart.clear();
    renderCart();
    hidePaymentPopups();

    if ($("logoutBox")) {
      $("logoutBox").style.display = "flex";
    } else {
      showOnly("loginPage");
    }
  };

  window.closeLogoutBox = () => {
    if ($("logoutBox")) {
      $("logoutBox").style.display = "none";
    }

    showOnly("loginPage");
  };

  // User profile
  window.showProfile = async () => {
    if (!currentUser) {
      return showOnly("loginPage");
    }

    try {
      const result = await api("/api/orders/my");
      const totalOrders = result.orders.length;

      alert(
        `FoodExpress Profile\n` +
        `Name: ${currentUser.name}\n` +
        `Email: ${currentUser.email}\n` +
        `Mobile: ${currentUser.mobile}\n` +
        `Orders placed: ${totalOrders}`
      );
    } catch {
      alert(
        `FoodExpress Profile\n` +
        `Name: ${currentUser.name}\n` +
        `Email: ${currentUser.email}\n` +
        `Mobile: ${currentUser.mobile}`
      );
    }
  };

  // Cart quantity management
  window.changeQuantity = (name, price, delta) => {
    const current = cart.get(name)?.quantity || 0;
    const quantity = Math.max(
      0,
      Math.min(50, current + delta)
    );

    if (quantity === 0) {
      cart.delete(name);
    } else {
      cart.set(name, {
        name,
        price: Number(price),
        quantity
      });
    }

    const card = [
      ...document.querySelectorAll(".food-card")
    ].find(el =>
      el.querySelector("h3")?.textContent.trim() === name
    );

    const count = card?.querySelector(
      ".quantity-box span"
    );

    if (count) {
      count.textContent = String(quantity);
      count.classList.add("quantity");
    }

    renderCart();
  };

  function renderCart() {
    const count = [...cart.values()].reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    if ($("cartCount")) {
      $("cartCount").textContent = String(count);
    }

    const button = document.querySelector(
      ".cart-total button"
    );

    if (button) {
      button.setAttribute(
        "aria-label",
        `Open cart, ${count} items`
      );
    }
  }

  // Open checkout
  window.checkout = () => {
    if (!currentUser) {
      alert("Please log in before checkout.");
      return showOnly("loginPage");
    }

    if (cart.size === 0) {
      return alert(
        "Your cart is empty. Add some food first."
      );
    }

    if ($("qrBox")) $("qrBox").style.display = "none";
    if ($("billBox")) $("billBox").style.display = "none";

    if ($("checkoutBox")) {
      $("checkoutBox").style.display = "block";
    }

    if ($("customerName")) {
      $("customerName").value = currentUser.name;
    }

    if ($("mobile")) {
      $("mobile").value = currentUser.mobile;
    }
  };

  // Payment selection
  // QR is displayed only when an online payment method is selected.
  window.selectPayment = async (payment) => {
    selectedPayment = payment;

    if (cart.size === 0) {
      alert("Your cart is empty. Add some food first.");
      return;
    }

    const checkoutBox = $("checkoutBox");
    const qrBox = $("qrBox");
    const qrImage = $("qrImage");

    // Cash on delivery does not need a QR popup.
    if (payment === "Cash On Delivery") {
      if (qrBox) qrBox.style.display = "none";
      if (checkoutBox) checkoutBox.style.display = "none";

      await placeOrder();
      return;
    }

    // Check delivery details before showing the QR popup.
    const customerName = $("customerName")?.value.trim();
    const mobile = $("mobile")?.value.trim();
    const address = $("address")?.value.trim();

    if (!customerName || !mobile || !address) {
      alert(
        "Please enter your name, mobile number and delivery address."
      );

      if (qrBox) qrBox.style.display = "none";
      if (checkoutBox) checkoutBox.style.display = "block";

      return;
    }

    if (!qrBox) {
      alert(
        "Payment popup not found. Check the qrBox element in views/index.ejs."
      );
      return;
    }

    // Hide checkout while the payment popup is open.
    if (checkoutBox) {
      checkoutBox.style.display = "none";
    }

    if ($("billBox")) {
      $("billBox").style.display = "none";
    }

    // Set payment information.
    if ($("paymentTitle")) {
      $("paymentTitle").textContent =
        `${payment} selected. Payment is not automatically verified; this demo order will remain pending.`;
    }

    // Load and show the QR image INSIDE qrBox.
    if (qrImage) {
      qrImage.src = "/image/qrcode.jpeg";
      qrImage.alt = "FoodExpress UPI QR Code";
      qrImage.style.display = "block";
      qrImage.style.visibility = "visible";
      qrImage.style.width = "220px";
      qrImage.style.height = "220px";
      qrImage.style.objectFit = "contain";
      qrImage.style.margin = "15px auto";
    }

    // Remove an old warning before adding a new one.
    qrBox.querySelectorAll(".payment-warning")
      .forEach(element => element.remove());

    const warning = document.createElement("p");
    warning.className = "payment-warning";
    warning.textContent =
      "This demo does not verify payment. Place Order saves the order as pending.";

    const scanText = [
      ...qrBox.querySelectorAll("p")
    ].find(element =>
      element.id !== "paymentTitle" &&
      !element.classList.contains("payment-warning")
    );

    if (scanText) {
      scanText.insertAdjacentElement("afterend", warning);
    } else {
      qrBox.appendChild(warning);
    }

    const buttons = qrBox.querySelectorAll("button");

    if (buttons[0]) {
      buttons[0].textContent = "Place Order (Pending Payment)";
    }

    if (buttons[1]) {
      buttons[1].textContent = "❌ Cancel";
    }

    // Show the popup only after selecting an online payment option.
    qrBox.style.display = "block";
  };

  // Save the order. This does not verify payment.
  window.paymentDone = () => placeOrder();

  // Cancel payment and return to checkout.
  window.closeQR = () => {
    if ($("qrBox")) {
      $("qrBox").style.display = "none";
    }

    if ($("checkoutBox")) {
      $("checkoutBox").style.display = "block";
    }
  };

  // Place order and display the bill
  async function placeOrder() {
    const customerName = $("customerName")?.value.trim();
    const mobile = $("mobile")?.value.trim();
    const address = $("address")?.value.trim();

    if (!customerName || !mobile || !address) {
      alert(
        "Please enter your name, mobile number and delivery address."
      );

      if ($("qrBox")) $("qrBox").style.display = "none";
      if ($("checkoutBox")) $("checkoutBox").style.display = "block";

      return;
    }

    try {
      const result = await api("/api/orders", {
        method: "POST",
        body: JSON.stringify({
          customerName,
          mobile,
          address,
          items: [...cart.values()],
          paymentMethod: selectedPayment
        })
      });

      latestOrder = result.order;

      if ($("customerDetails")) {
        $("customerDetails").textContent =
          `${latestOrder.customerName} · ${latestOrder.mobile} · ${latestOrder.address}`;
      }

      if ($("billItems")) {
        $("billItems").replaceChildren();

        latestOrder.items.forEach(item => {
          const tr = document.createElement("tr");

          [
            item.name,
            String(item.quantity),
            `₹${item.price * item.quantity}`
          ].forEach(value => {
            const td = document.createElement("td");
            td.textContent = value;
            tr.appendChild(td);
          });

          $("billItems").appendChild(tr);
        });
      }

      if ($("billTotal")) {
        $("billTotal").textContent =
          String(latestOrder.total);
      }

      if ($("billPayment")) {
        $("billPayment").textContent =
          `${latestOrder.paymentMethod} — ${latestOrder.paymentStatus}`;
      }

      if ($("checkoutBox")) {
        $("checkoutBox").style.display = "none";
      }

      if ($("qrBox")) {
        $("qrBox").style.display = "none";
      }

      if ($("billBox")) {
        $("billBox").style.display = "block";
      }

      cart.clear();

      document.querySelectorAll(".quantity-box span")
        .forEach(span => {
          span.textContent = "0";
        });

      renderCart();

    } catch (error) {
      alert(error.message);
    }
  }

  window.closeBill = () => {
    if ($("billBox")) {
      $("billBox").style.display = "none";
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  window.printBill = () => window.print();

  // Food category filtering
  window.filterFood = (category, button) => {
    document.querySelectorAll(".food-filter button")
      .forEach(btn => {
        btn.classList.toggle("active", btn === button);
      });

    document.querySelectorAll(".food-card")
      .forEach(card => {
        const cardCategory =
          (card.dataset.category || "other").toLowerCase();

        const matchesCategory =
          category === "all" ||
          cardCategory === category ||
          (
            category === "cake" &&
            (
              cardCategory.includes("cake") ||
              cardCategory.includes("dessert")
            )
          );

        card.style.display = matchesCategory ? "" : "none";
      });
  };

  window.showAllMenu = () => {
    document.querySelectorAll(".food-card")
      .forEach(card => {
        card.style.display = "";
      });
  };

  // Food search
  window.searchFood = () => {
    const query =
      document.querySelector(".search-box input")
        ?.value.trim().toLowerCase() || "";

    let matches = 0;

    document.querySelectorAll(".food-card")
      .forEach(card => {
        const isMatch =
          !query ||
          card.textContent.toLowerCase().includes(query);

        card.style.display = isMatch ? "" : "none";

        if (isMatch) matches++;
      });

    const menu = $("menu");

    if (menu) {
      menu.scrollIntoView({ behavior: "smooth" });
    }

    if (query && matches === 0) {
      alert("No food items found. Try another search.");
    }
  };

  window.orderAllOffers = () => {
    window.showAllMenu();

    const menu = $("menu");

    if (menu) {
      menu.scrollIntoView({ behavior: "smooth" });
    }
  };

  window.appStore = () => {
    alert("The mobile app is not available yet.");
  };

  window.googlePlay = () => {
    alert("The mobile app is not available yet.");
  };

  // Initialise the page.
  document.addEventListener("DOMContentLoaded", () => {
    // All popups must start hidden.
    // The QR image must not cause the popup to open.
    if ($("qrBox")) {
      $("qrBox").style.display = "none";
    }

    if ($("checkoutBox")) {
      $("checkoutBox").style.display = "none";
    }

    if ($("billBox")) {
      $("billBox").style.display = "none";
    }

    // Keep the correct image URL ready, but keep its popup hidden.
    if ($("qrImage")) {
      $("qrImage").src = "/image/qrcode.jpeg";
      $("qrImage").style.display = "block";
    }

    const searchInput =
      document.querySelector(".search-box input");

    if (searchInput) {
      searchInput.addEventListener("keydown", event => {
        if (event.key === "Enter") {
          window.searchFood();
        }
      });
    }

    ["regName", "regNumber", "regEmail", "regPassword"]
      .forEach(id => {
        $(id)?.addEventListener("keydown", event => {
          if (event.key === "Enter") {
            window.registerUser();
          }
        });
      });

    ["email", "loginPassword"].forEach(id => {
      $(id)?.addEventListener("keydown", event => {
        if (event.key === "Enter") {
          window.verifyEmail();
        }
      });
    });

    restoreSession();
  });
})();
