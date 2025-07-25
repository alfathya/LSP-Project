// TummyMate Application - Clean Version
class TummyMate {
  constructor() {
    this.data = {
      mealPlans: JSON.parse(localStorage.getItem("mealPlans")) || [],
      shopping: JSON.parse(localStorage.getItem("shopping")) || [],
      jajan: JSON.parse(localStorage.getItem("jajan")) || [],
    };
    this.currentDate = new Date();
    this.shoppingItems = [];
    this.init();
  }

  init() {
    this.hideLoadingScreen();
    this.setupEventListeners();
    this.updateDashboard();
    this.setCurrentDate();
  }

  hideLoadingScreen() {
    setTimeout(() => {
      const loadingScreen = document.getElementById("loadingScreen");
      if (loadingScreen) {
        loadingScreen.classList.add("hidden");
      }
    }, 2000);
  }

  setupEventListeners() {
    // Navigation
    document.querySelectorAll(".nav-link").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const section = link.getAttribute("data-section");
        this.showSection(section);
      });
    });

    // Mobile menu toggle
    const navToggle = document.getElementById("navToggle");
    const navMenu = document.getElementById("navMenu");

    if (navToggle && navMenu) {
      navToggle.addEventListener("click", () => {
        navToggle.classList.toggle("active");
        navMenu.classList.toggle("active");
      });
    }

    // Form submissions - with null checks
    const mealPlanForm = document.getElementById("mealPlanForm");
    if (mealPlanForm) {
      mealPlanForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.saveMealPlan();
      });
    }

    const jajanForm = document.getElementById("jajanForm");
    if (jajanForm) {
      jajanForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.saveJajan();
      });
    }
  }

  showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll(".section").forEach((section) => {
      section.classList.remove("active");
    });

    // Show target section
    const targetSection = document.getElementById(sectionName);
    if (targetSection) {
      targetSection.classList.add("active");
    }

    // Update navigation
    document.querySelectorAll(".nav-link").forEach((link) => {
      link.classList.remove("active");
      if (link.getAttribute("data-section") === sectionName) {
        link.classList.add("active");
      }
    });

    // Render section-specific content
    switch (sectionName) {
      case "dashboard":
        this.updateDashboard();
        break;
      case "meal-plan":
        this.renderMealPlanCalendar();
        this.renderMealPlanList();
        break;
      case "shopping":
        this.renderShoppingHistory();
        this.updateShoppingSummary();
        break;
      case "jajan":
        this.renderJajanList();
        this.updateJajanSummary();
        break;
      case "profile":
        this.updateProfile();
        break;
    }
  }

  setCurrentDate() {
    const dateElements = document.querySelectorAll(".current-date");
    const today = new Date().toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    dateElements.forEach((element) => {
      element.textContent = today;
    });
  }

  updateDashboard() {
    this.renderTodayMeals();
    this.renderRecentShopping();
    this.calculateTotalExpense();
  }

  renderTodayMeals() {
    const container = document.getElementById("todayMeals");
    if (!container) return;

    const today = new Date().toISOString().split("T")[0];
    const todayMeals = this.data.mealPlans.filter(
      (meal) => meal.tanggal === today
    );

    if (todayMeals.length === 0) {
      container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-utensils"></i>
                    <p>Belum ada rencana makan hari ini</p>
                    <button class="btn-primary" onclick="app.showSection('meal-plan')">Buat Rencana</button>
                </div>
            `;
      return;
    }

    container.innerHTML = todayMeals
      .map(
        (meal) => `
            <div class="meal-item">
                <div class="meal-time">${meal.waktu_makan}</div>
                <div class="meal-menu">${meal.menu}</div>
            </div>
        `
      )
      .join("");
  }

  renderRecentShopping() {
    const container = document.getElementById("recentShopping");
    if (!container) return;

    const recentShopping = this.data.shopping
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5);

    if (recentShopping.length === 0) {
      container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-shopping-cart"></i>
                    <p>Belum ada data belanja</p>
                    <button class="btn-primary" onclick="app.showSection('shopping')">Mulai Belanja</button>
                </div>
            `;
      return;
    }

    container.innerHTML = recentShopping
      .map(
        (item) => `
            <div class="shopping-item">
                <div class="item-info">
                    <div class="item-name">${item.item}</div>
                    <div class="item-date">${this.formatDate(
                      item.tanggal
                    )}</div>
                </div>
                <div class="item-price">${this.formatCurrency(
                  item.total_harga
                )}</div>
            </div>
        `
      )
      .join("");
  }

  calculateTotalExpense() {
    const totalShopping = this.data.shopping.reduce(
      (sum, item) => sum + parseFloat(item.total_harga || 0),
      0
    );
    const totalJajan = this.data.jajan.reduce(
      (sum, item) => sum + parseFloat(item.harga || 0),
      0
    );
    const totalExpense = totalShopping + totalJajan;

    const expenseElement = document.getElementById("totalExpense");
    if (expenseElement) {
      expenseElement.textContent = this.formatCurrency(totalExpense);
    }
  }

  renderShoppingHistory() {
    const tableBody = document.getElementById("shoppingHistoryTableBody");
    const emptyState = document.getElementById("shoppingHistoryEmpty");

    if (!tableBody || !emptyState) return;

    if (!this.data.shopping || this.data.shopping.length === 0) {
      tableBody.innerHTML = "";
      emptyState.style.display = "block";
      return;
    }

    emptyState.style.display = "none";

    // Group shopping data by date and create shopping list entries
    const shoppingLists = this.createShoppingListsFromData();

    tableBody.innerHTML = shoppingLists
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .map((list, index) => {
        const shoppingId = `#SH${String(index + 1).padStart(4, "0")}`;
        const statusClass = list.completed ? "completed" : "planned";
        const statusText = list.completed ? "Selesai" : "Direncanakan";

        return `
                    <tr onclick="viewShoppingDetail('${
                      list.date
                    }')" data-shopping-id="${shoppingId}">
                        <td>
                            <span class="shopping-id">${shoppingId}</span>
                        </td>
                        <td>
                            <span class="shopping-date">${this.formatDateIndonesian(
                              list.date
                            )}</span>
                        </td>
                        <td class="text-right">
                            <span class="shopping-amount">${this.formatCurrency(
                              list.totalAmount
                            )}</span>
                        </td>
                        <td class="text-center">
                            <span class="shopping-items-count">${
                              list.itemsCount
                            }</span>
                        </td>
                        <td class="text-center">
                            <span class="shopping-status ${statusClass}">${statusText}</span>
                        </td>
                    </tr>
                `;
      })
      .join("");
  }

  createShoppingListsFromData() {
    // Group shopping items by date
    const groupedByDate = this.groupShoppingByDate();

    return Object.keys(groupedByDate).map((date) => {
      const items = groupedByDate[date];
      const totalAmount = items.reduce(
        (sum, item) => sum + parseFloat(item.total_harga || 0),
        0
      );
      const itemsCount = items.length;

      // Determine if shopping is completed based on whether all items have receipt or are marked as done
      const completed = items.every((item) => item.selesai || item.struk_url);

      return {
        date: date,
        items: items,
        totalAmount: totalAmount,
        itemsCount: itemsCount,
        completed: completed,
      };
    });
  }

  formatDateIndonesian(dateString) {
    const date = new Date(dateString);
    const options = {
      day: "numeric",
      month: "long",
      year: "numeric",
    };
    return date.toLocaleDateString("id-ID", options);
  }

  groupShoppingByDate() {
    const grouped = {};
    this.data.shopping.forEach((item) => {
      const date = item.tanggal;
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(item);
    });
    return grouped;
  }

  updateShoppingSummary() {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const monthlyData = this.data.shopping.filter((item) => {
      const itemDate = new Date(item.tanggal);
      return (
        itemDate.getMonth() === currentMonth &&
        itemDate.getFullYear() === currentYear
      );
    });

    const totalMonthly = monthlyData.reduce(
      (sum, item) => sum + parseFloat(item.total_harga || 0),
      0
    );
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const averageDaily = totalMonthly / daysInMonth;

    const totalElement = document.getElementById("totalBelanjaBulanIni");
    const averageElement = document.getElementById("rataRataPerHari");

    if (totalElement) {
      totalElement.textContent = this.formatCurrency(totalMonthly);
    }

    if (averageElement) {
      averageElement.textContent = this.formatCurrency(averageDaily);
    }
  }

  renderJajanList() {
    const container = document.getElementById("jajanList");
    if (!container) return;

    if (this.data.jajan.length === 0) {
      container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-cookie-bite"></i>
                    <p>Belum ada data jajan</p>
                    <button class="btn-primary" onclick="app.openJajanModal()">Tambah Jajan</button>
                </div>
            `;
      return;
    }

    container.innerHTML = this.data.jajan
      .map(
        (item) => `
            <div class="list-item">
                <div class="item-header">
                    <div class="item-title">${item.nama}</div>
                    <div class="item-date">${this.formatDate(
                      item.tanggal
                    )}</div>
                </div>
                <div class="item-details">${item.tempat}</div>
                <div class="item-price">${this.formatCurrency(item.harga)}</div>
            </div>
        `
      )
      .join("");
  }

  updateJajanSummary() {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const monthlyData = this.data.jajan.filter((item) => {
      const itemDate = new Date(item.tanggal);
      return (
        itemDate.getMonth() === currentMonth &&
        itemDate.getFullYear() === currentYear
      );
    });

    const totalMonthly = monthlyData.reduce(
      (sum, item) => sum + parseFloat(item.harga || 0),
      0
    );
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const averageDaily = totalMonthly / daysInMonth;

    const totalElement = document.getElementById("totalJajanBulanIni");
    const averageElement = document.getElementById("rataRataJajanPerHari");

    if (totalElement) {
      totalElement.textContent = this.formatCurrency(totalMonthly);
    }

    if (averageElement) {
      averageElement.textContent = this.formatCurrency(averageDaily);
    }
  }

  renderMealPlanCalendar() {
    // Basic calendar rendering - can be expanded later
    const container = document.getElementById("mealPlanCalendar");
    if (container) {
      container.innerHTML = "<p>Calendar will be implemented here</p>";
    }
  }

  renderMealPlanList() {
    const container = document.getElementById("mealPlanList");
    if (!container) return;

    if (this.data.mealPlans.length === 0) {
      container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-calendar-alt"></i>
                    <p>Belum ada rencana makan</p>
                    <button class="btn-primary" onclick="app.openMealPlanModal()">Buat Rencana</button>
                </div>
            `;
      return;
    }

    container.innerHTML = this.data.mealPlans
      .map(
        (meal) => `
            <div class="list-item">
                <div class="item-header">
                    <div class="item-title">${meal.menu}</div>
                    <div class="item-date">${this.formatDate(meal.tanggal)} - ${
          meal.waktu_makan
        }</div>
                </div>
                <div class="item-details">${meal.catatan || ""}</div>
            </div>
        `
      )
      .join("");
  }

  updateProfile() {
    // Basic profile update
    const profileName = document.getElementById("profileName");
    if (profileName) {
      profileName.textContent = "Pengguna TummyMate";
    }
  }

  // Modal functions
  openMealPlanModal() {
    const modal = document.getElementById("mealPlanModal");
    if (modal) {
      modal.classList.add("active");
      document.body.style.overflow = "hidden";
    }
  }

  closeMealPlanModal() {
    const modal = document.getElementById("mealPlanModal");
    if (modal) {
      modal.classList.remove("active");
      document.body.style.overflow = "";
    }
  }

  openJajanModal() {
    const modal = document.getElementById("jajanModal");
    if (modal) {
      modal.classList.add("active");
      document.body.style.overflow = "hidden";
    }
  }

  closeJajanModal() {
    const modal = document.getElementById("jajanModal");
    if (modal) {
      modal.classList.remove("active");
      document.body.style.overflow = "";
    }
  }

  // Save functions
  saveMealPlan() {
    const form = document.getElementById("mealPlanForm");
    if (!form) return;

    const formData = new FormData(form);
    const mealPlan = {
      id: Date.now(),
      tanggal: formData.get("tanggal"),
      waktu_makan: formData.get("waktu_makan"),
      menu: formData.get("menu"),
      catatan: formData.get("catatan") || "",
      created_at: new Date().toISOString(),
    };

    this.data.mealPlans.push(mealPlan);
    localStorage.setItem("mealPlans", JSON.stringify(this.data.mealPlans));

    this.closeMealPlanModal();
    this.renderMealPlanList();
    this.updateDashboard();

    form.reset();
    this.showToast("success", "Rencana makan berhasil disimpan!");
  }

  saveJajan() {
    const form = document.getElementById("jajanForm");
    if (!form) return;

    const formData = new FormData(form);
    const jajan = {
      id: Date.now(),
      tanggal: formData.get("tanggal"),
      nama: formData.get("nama"),
      tempat: formData.get("tempat"),
      harga: parseFloat(formData.get("harga")),
      created_at: new Date().toISOString(),
    };

    this.data.jajan.push(jajan);
    localStorage.setItem("jajan", JSON.stringify(this.data.jajan));

    this.closeJajanModal();
    this.renderJajanList();
    this.updateDashboard();

    form.reset();
    this.showToast("success", "Data jajan berhasil disimpan!");
  }

  // Utility functions
  formatCurrency(amount) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  getDayName(date) {
    const days = [
      "Minggu",
      "Senin",
      "Selasa",
      "Rabu",
      "Kamis",
      "Jumat",
      "Sabtu",
    ];
    return days[date.getDay()];
  }

  showToast(type, message) {
    const toast = document.createElement("div");
    toast.className = `toast ${type} show`;

    const iconMap = {
      success: "fa-check-circle",
      error: "fa-exclamation-circle",
      warning: "fa-exclamation-triangle",
    };

    toast.innerHTML = `
            <div class="toast-content">
                <i class="toast-icon fas ${iconMap[type]}"></i>
                <span>${message}</span>
            </div>
        `;

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
      }, 300);
    }, 3000);
  }
}

// Initialize the application
let app;
document.addEventListener("DOMContentLoaded", () => {
  app = new TummyMate();
});

// Global functions for shopping system
let currentShoppingList = null;
let currentShoppingItems = [];

function openCreateShoppingListModal() {
  const modal = document.getElementById("createShoppingListModal");
  if (modal) {
    modal.classList.add("active");
    document.body.style.overflow = "hidden";

    // Set default date to today
    const today = new Date().toISOString().split("T")[0];
    const dateInput = document.getElementById("shoppingListDate");
    if (dateInput) {
      dateInput.value = today;
    }

    // Set default day based on current date
    const dayNames = [
      "minggu",
      "senin",
      "selasa",
      "rabu",
      "kamis",
      "jumat",
      "sabtu",
    ];
    const currentDay = dayNames[new Date().getDay()];
    const daySelect = document.getElementById("shoppingListDay");
    if (daySelect) {
      daySelect.value = currentDay;
    }
  }
}

function closeCreateShoppingListModal() {
  const modal = document.getElementById("createShoppingListModal");
  if (modal) {
    modal.classList.remove("active");
    document.body.style.overflow = "";
    const form = document.getElementById("createShoppingListForm");
    if (form) {
      form.reset();
    }
  }
}

function viewShoppingDetail(date) {
  // Set current shopping detail date
  window.currentShoppingDate = date;

  // Load shopping items for this date
  const groupedShopping = app.groupShoppingByDate();
  window.currentShoppingItems = groupedShopping[date] || [];

  // Update shopping detail header
  const header = document.querySelector(
    "#shopping-detail .shopping-date-info h2"
  );
  const dateInfo = document.querySelector(
    "#shopping-detail .shopping-date-info p"
  );

  if (header && dateInfo) {
    const dayName = app.getDayName(new Date(date));
    header.textContent = `Belanja ${dayName}`;
    dateInfo.textContent = app.formatDateIndonesian(date);
  }

  // Navigate to shopping detail section
  app.showSection("shopping-detail");

  // Render checklist and update summary
  renderShoppingChecklist();
  updateShoppingSummary();
}

function backToShopping() {
  app.showSection("shopping");
}

function renderShoppingChecklist() {
  const checklistContainer = document.getElementById("shoppingChecklist");
  if (!checklistContainer) return;

  if (!currentShoppingItems || currentShoppingItems.length === 0) {
    checklistContainer.innerHTML = `
            <div class="empty-checklist">
                <i class="fas fa-shopping-basket"></i>
                <p>Belum ada item belanja</p>
                <small>Klik tombol "Tambah Item" untuk menambahkan item</small>
            </div>
        `;
    return;
  }

  const checklistHTML = currentShoppingItems
    .map(
      (item) => `
        <div class="checklist-item ${
          item.completed ? "completed" : ""
        }" data-id="${item.id}">
            <input 
                type="checkbox" 
                class="checklist-checkbox" 
                ${item.completed ? "checked" : ""}
                onchange="toggleItemCompletion(${item.id})"
            >
            <div class="checklist-content">
                <div class="item-name">${item.item}</div>
                <div class="item-quantity">${item.jumlah}</div>
                <div class="item-unit">${item.satuan}</div>
                <div class="item-price">Rp ${item.harga_satuan.toLocaleString(
                  "id-ID"
                )}</div>
                <div class="item-total">Rp ${item.total_harga.toLocaleString(
                  "id-ID"
                )}</div>
            </div>
        </div>
    `
    )
    .join("");

  checklistContainer.innerHTML = checklistHTML;
}

function updateShoppingSummary() {
  if (!currentShoppingItems) return;

  const totalItems = currentShoppingItems.length;
  const totalPrice = currentShoppingItems.reduce(
    (sum, item) => sum + item.total_harga,
    0
  );

  const totalItemsElement = document.getElementById("totalItemsCount");
  const totalPriceElement = document.getElementById("totalShoppingPrice");

  if (totalItemsElement) {
    totalItemsElement.textContent = totalItems;
  }

  if (totalPriceElement) {
    totalPriceElement.textContent = `Rp ${totalPrice.toLocaleString("id-ID")}`;
  }
}

function toggleItemCompletion(itemId) {
  const item = currentShoppingItems.find((item) => item.id === itemId);
  if (item) {
    item.completed = !item.completed;
    renderShoppingChecklist();
    updateShoppingSummary();
  }
}

// Close modals when clicking outside
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("modal")) {
    const activeModal = document.querySelector(".modal.active");
    if (activeModal) {
      activeModal.classList.remove("active");
      document.body.style.overflow = "";
    }
  }
});

// Handle escape key to close modals
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    const activeModal = document.querySelector(".modal.active");
    if (activeModal) {
      activeModal.classList.remove("active");
      document.body.style.overflow = "";
    }
  }
});
