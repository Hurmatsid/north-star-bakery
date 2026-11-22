/* ==========================================================
   North Star Bakery - Interactivity
   Touchstone 4: Interactivity and Client-Side Data

   1. Pre-Order List: customers add products to a list on the
      Products page. The list updates on the page right away.
   2. Browser storage (localStorage):
      - The pre-order list is saved and restored on every page.
      - The Contact form is pre-filled with the saved list.
      - The customer's name and email are remembered.
   3. Form validation on the Contact page with error messages
      shown under each field.
   ========================================================== */

/* ---------- DATA ---------- */

// Array of product objects. Each id matches a data-id in products.html.
const products = [
  { id: "country-sourdough", name: "Country Sourdough", category: "Breads", price: "$7-$9" },
  { id: "whole-wheat", name: "Whole Wheat Sandwich Loaf", category: "Breads", price: "$6-$8" },
  { id: "seeded-rye", name: "Seeded Rye", category: "Breads", price: "$8-$10" },
  { id: "butter-croissants", name: "Butter Croissants", category: "Pastries", price: "$3-$4" },
  { id: "fruit-danish", name: "Seasonal Fruit Danish", category: "Pastries", price: "$4-$5" },
  { id: "morning-buns", name: "Cinnamon Morning Buns", category: "Pastries", price: "$4-$5" },
  { id: "celebration-cake", name: "Celebration Cake", category: "Cakes", price: "$30-$65" },
  { id: "sheet-cake", name: "Sheet Cake for Events", category: "Cakes", price: "$55-$110" },
  { id: "cupcakes", name: "Cupcakes by the Dozen", category: "Cakes", price: "$28-$36" }
];

// Object holding the localStorage key names in one place.
const STORAGE_KEYS = {
  preorderList: "nsb-preorder-list",
  customer: "nsb-customer-details"
};

// Object holding every validation error message.
const errorMessages = {
  nameRequired: "Please enter your name.",
  nameShort: "Your name must be at least 2 characters.",
  emailRequired: "Please enter your email address.",
  emailFormat: "Please enter a valid email, like name@example.com.",
  typeRequired: "Please choose a request type.",
  dateRequired: "Please choose a pickup date for your pre-order.",
  datePast: "Pickup date cannot be in the past.",
  cakeNotice: "Custom cakes need at least 3 days' notice. Please choose a later date.",
  detailsRequired: "Please tell us what you would like to order.",
  detailsShort: "Please add a little more detail (at least 10 characters)."
};

/* ---------- STORAGE HELPERS ---------- */

// Reads the saved pre-order list (an array of product ids).
function loadPreorderList() {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.preorderList);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    return [];
  }
}

// Saves the pre-order list array.
function savePreorderList(list) {
  try {
    localStorage.setItem(STORAGE_KEYS.preorderList, JSON.stringify(list));
  } catch (error) {
    // Storage may be blocked (private mode). The page still works.
  }
}

// Reads the saved customer object { name, email }.
function loadCustomer() {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.customer);
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    return null;
  }
}

// Saves the customer object.
function saveCustomer(customer) {
  try {
    localStorage.setItem(STORAGE_KEYS.customer, JSON.stringify(customer));
  } catch (error) {
    // Ignore storage errors.
  }
}

// Finds a product object by its id.
function findProduct(id) {
  return products.find(function (product) {
    return product.id === id;
  });
}

/* ---------- PRE-ORDER LIST FEATURE (all pages) ---------- */

// Shows the number of saved items next to "Contact & Pre-Order" in the nav.
function updateNavBadge() {
  const link = document.querySelector('nav a[href="contact.html"]');
  if (!link) return;

  let badge = link.querySelector(".badge");
  const count = loadPreorderList().length;

  if (count === 0) {
    if (badge) badge.remove();
    return;
  }
  if (!badge) {
    badge = document.createElement("span");
    badge.className = "badge";
    link.appendChild(badge);
  }
  badge.textContent = count;
  badge.setAttribute("aria-label", count + " items in your pre-order list");
}

// Adds an item if it is not in the list, or removes it if it is.
function togglePreorderItem(id) {
  let list = loadPreorderList();

  if (list.includes(id)) {
    list = list.filter(function (itemId) {
      return itemId !== id;
    });
  } else {
    list.push(id);
  }

  savePreorderList(list);
  refreshPreorderDisplay();
}

// Adds an "Add to my list" button to every product on the Products page.
function addProductButtons() {
  const items = document.querySelectorAll("[data-id]");

  items.forEach(function (item) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "btn-small add-btn";
    button.dataset.id = item.dataset.id;
    button.addEventListener("click", function () {
      togglePreorderItem(item.dataset.id);
    });
    item.appendChild(button);
  });
}

// Updates every "Add" button to match the saved list.
function updateProductButtons(list) {
  document.querySelectorAll(".add-btn").forEach(function (button) {
    const product = findProduct(button.dataset.id);
    const inList = list.includes(button.dataset.id);

    button.textContent = inList ? "\u2713 In my list" : "+ Add to my list";
    button.classList.toggle("added", inList);
    button.setAttribute("aria-pressed", inList ? "true" : "false");
    button.setAttribute("aria-label", (inList ? "Remove " : "Add ") + product.name + (inList ? " from" : " to") + " my pre-order list");
  });
}

// Builds the "My Pre-Order List" panel from the saved list.
function renderPreorderPanel(list) {
  const listElement = document.getElementById("preorder-items");
  if (!listElement) return;

  const emptyMessage = document.getElementById("preorder-empty");
  const actions = document.getElementById("preorder-actions");
  const count = document.getElementById("preorder-count");

  listElement.innerHTML = "";

  list.forEach(function (id) {
    const product = findProduct(id);
    if (!product) return;

    const li = document.createElement("li");
    li.className = "preorder-item";

    const text = document.createElement("span");
    text.textContent = product.name + " (" + product.category + ", " + product.price + ")";

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "btn-small btn-remove";
    removeButton.textContent = "Remove";
    removeButton.setAttribute("aria-label", "Remove " + product.name);
    removeButton.addEventListener("click", function () {
      togglePreorderItem(id);
    });

    li.appendChild(text);
    li.appendChild(removeButton);
    listElement.appendChild(li);
  });

  count.textContent = list.length === 1 ? "1 item" : list.length + " items";
  emptyMessage.hidden = list.length > 0;
  actions.hidden = list.length === 0;
}

// Empties the whole list.
function clearPreorderList() {
  savePreorderList([]);
  refreshPreorderDisplay();
}

// Redraws everything that depends on the saved list.
function refreshPreorderDisplay() {
  const list = loadPreorderList();
  renderPreorderPanel(list);
  updateProductButtons(list);
  updateNavBadge();
}

// Sets up the feature on the Products page.
function initProductsPage() {
  if (!document.getElementById("preorder-panel")) return;

  addProductButtons();
  document.getElementById("clear-list").addEventListener("click", clearPreorderList);
}

/* ---------- CONTACT FORM: PRE-FILL ---------- */

// Turns the saved list into text for the Item details box.
function buildItemDetailsText(list) {
  return list
    .map(function (id) {
      const product = findProduct(id);
      return product ? "1 x " + product.name : "";
    })
    .filter(Boolean)
    .join("\n");
}

// Fills the form with saved data when the Contact page opens.
function prefillForm(form) {
  const customer = loadCustomer();
  const list = loadPreorderList();
  const note = document.getElementById("prefill-note");
  const restored = [];

  if (customer) {
    form.elements["name"].value = customer.name || "";
    form.elements["email"].value = customer.email || "";
    form.elements["remember"].checked = true;
    restored.push("your name and email");
  }

  if (list.length > 0 && form.elements["item-details"].value.trim() === "") {
    form.elements["item-details"].value = buildItemDetailsText(list);
    form.elements["request-type"].value = "pre-order";
    restored.push("the " + list.length + " item(s) from your pre-order list");
  }

  if (restored.length > 0 && note) {
    note.textContent = "Welcome back! We filled in " + restored.join(" and ") + ". You can edit anything before sending.";
    note.hidden = false;
  }
}

/* ---------- CONTACT FORM: VALIDATION ---------- */

// Returns today's date as YYYY-MM-DD in the visitor's time zone.
function todayString(daysAhead) {
  const date = new Date();
  date.setDate(date.getDate() + (daysAhead || 0));
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return date.getFullYear() + "-" + month + "-" + day;
}

// Checks one field and returns an error message, or "" if it is valid.
function getFieldError(field, form) {
  const value = field.value.trim();
  const requestType = form.elements["request-type"].value;

  switch (field.id) {
    case "name":
      if (value === "") return errorMessages.nameRequired;
      if (value.length < 2) return errorMessages.nameShort;
      return "";

    case "email":
      if (value === "") return errorMessages.emailRequired;
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) return errorMessages.emailFormat;
      return "";

    case "request-type":
      return value === "" ? errorMessages.typeRequired : "";

    case "pickup-date":
      if (requestType === "pre-order" || requestType === "custom-cake") {
        if (value === "") return errorMessages.dateRequired;
      }
      if (value !== "" && value < todayString(0)) return errorMessages.datePast;
      if (requestType === "custom-cake" && value !== "" && value < todayString(3)) {
        return errorMessages.cakeNotice;
      }
      return "";

    case "item-details":
      if (value === "") return errorMessages.detailsRequired;
      if (value.length < 10) return errorMessages.detailsShort;
      return "";

    default:
      return "";
  }
}

// Shows or clears the error message under a field.
function showFieldError(field, message) {
  const errorElement = document.getElementById(field.id + "-error");
  if (!errorElement) return;

  errorElement.textContent = message;
  field.classList.toggle("invalid", message !== "");
  field.setAttribute("aria-invalid", message !== "" ? "true" : "false");
}

// Checks every field. Returns true if the whole form is valid.
function validateForm(form) {
  const fieldIds = ["name", "email", "request-type", "pickup-date", "item-details"];
  let firstInvalid = null;

  fieldIds.forEach(function (id) {
    const field = form.elements[id];
    const message = getFieldError(field, form);
    showFieldError(field, message);
    if (message && !firstInvalid) firstInvalid = field;
  });

  if (firstInvalid) firstInvalid.focus();
  return firstInvalid === null;
}

// Runs when the form is submitted.
function handleFormSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const status = document.getElementById("form-status");

  if (!validateForm(form)) {
    status.textContent = "Please fix the highlighted fields above. Everything else you typed is still there.";
    status.className = "form-status status-error";
    return;
  }

  if (form.elements["remember"].checked) {
    saveCustomer({ name: form.elements["name"].value.trim(), email: form.elements["email"].value.trim() });
  } else {
    try { localStorage.removeItem(STORAGE_KEYS.customer); } catch (error) { /* ignore */ }
  }

  status.textContent = "Thank you, " + form.elements["name"].value.trim() + "! Your request was received. We will reply within one business day.";
  status.className = "form-status status-success";
  savePreorderList([]);
  updateNavBadge();
}

// Sets up the Contact form.
function initContactForm() {
  const form = document.getElementById("preorder-form");
  if (!form) return;

  // Pickup date can't be before today.
  form.elements["pickup-date"].min = todayString(0);

  prefillForm(form);

  // Re-check a field as soon as the user leaves it or fixes it.
  ["name", "email", "request-type", "pickup-date", "item-details"].forEach(function (id) {
    const field = form.elements[id];
    field.addEventListener("blur", function () {
      showFieldError(field, getFieldError(field, form));
    });
    field.addEventListener("input", function () {
      if (field.classList.contains("invalid")) {
        showFieldError(field, getFieldError(field, form));
      }
    });
  });

  // Changing the request type can change whether a date is needed.
  form.elements["request-type"].addEventListener("change", function () {
    const dateField = form.elements["pickup-date"];
    if (dateField.classList.contains("invalid") || dateField.value !== "") {
      showFieldError(dateField, getFieldError(dateField, form));
    }
  });

  form.addEventListener("submit", handleFormSubmit);
}

/* ---------- START ---------- */
document.addEventListener("DOMContentLoaded", function () {
  initProductsPage();
  initContactForm();
  refreshPreorderDisplay();
});
