// Initialize API Service
document.addEventListener("DOMContentLoaded", () => {
  if (typeof APIService !== "undefined") {
    window.apiService = new APIService();
    console.log("API Service initialized");
  } else {
    console.warn("APIService not found, check if api.js is loaded");
  }
});

// TummyMate Application - Updated sesuai ERD
class TummyMate {
  constructor() {
    this.data = {
      // Struktur data sesuai ERD
      mealPlans: [], // Will be loaded from API
      mealPlanDetails: [], // Legacy - not used with new API structure
      shoppingLogs: JSON.parse(localStorage.getItem("shoppingLogs")) || [],
      shoppingDetails:
        JSON.parse(localStorage.getItem("shoppingDetails")) || [],
      shopping: JSON.parse(localStorage.getItem("shopping")) || [], // Add shopping for backward compatibility
      jajan: JSON.parse(localStorage.getItem("jajan")) || [],
    };
    this.currentDate = new Date();
    this.shoppingItems = [];
    this.init();
  }

  init() {
    console.log("TummyMate init called");
    this.setupEventListeners();

    // Wait for API and managers to be ready before updating dashboard
    this.waitForManagers().then(() => {
      // Load meal plans from API
      this.loadMealPlansFromAPI();
      // Only update dashboard, don't force managers init
      this.updateDashboard();
    });

    this.setCurrentDate();
    this.updateWeekDates();

    // Initialize daily view
    setTimeout(() => {
      if (typeof updateDailyView === "function") {
        updateDailyView();
      }
    }, 100);
  }

  // Load meal plans from API
  async loadMealPlansFromAPI() {
    try {
      if (window.apiService) {
        const response = await window.apiService.getMealPlans();
        if (response.success) {
          this.data.mealPlans = response.data || [];
          console.log(
            "Meal plans loaded from API:",
            this.data.mealPlans.length
          );
          // Re-render meal plan grid with new data
          this.renderMealPlanGrid();
        } else {
          console.error("Failed to load meal plans:", response.message);
        }
      } else {
        console.warn("API Service not available, using localStorage fallback");
        this.data.mealPlans =
          JSON.parse(localStorage.getItem("mealPlans")) || [];
      }
    } catch (error) {
      console.error("Error loading meal plans from API:", error);
      // Fallback to localStorage
      this.data.mealPlans = JSON.parse(localStorage.getItem("mealPlans")) || [];
    }
  }

  // Wait for managers to be initialized
  async waitForManagers() {
    return new Promise((resolve) => {
      const checkManagers = () => {
        const jajanReady = window.jajanLogManager;
        const shoppingReady = window.shoppingLogManager;

        if (jajanReady && shoppingReady) {
          // Both managers exist, can proceed
          resolve();
        } else {
          setTimeout(checkManagers, 100);
        }
      };
      checkManagers();
    });
  }

  // Wait for JajanLogManager to be initialized and load data (legacy - kept for compatibility)
  async waitForJajanLogManager() {
    return new Promise((resolve) => {
      const checkJajanLogManager = () => {
        if (window.jajanLogManager) {
          // Just wait for instance to exist, not for data to be loaded
          resolve();
        } else {
          setTimeout(checkJajanLogManager, 100);
        }
      };
      checkJajanLogManager();
    });
  }

  // Save data sesuai struktur ERD
  saveData() {
    localStorage.setItem("mealPlans", JSON.stringify(this.data.mealPlans));
    localStorage.setItem(
      "mealPlanDetails",
      JSON.stringify(this.data.mealPlanDetails)
    );
    localStorage.setItem(
      "shoppingLogs",
      JSON.stringify(this.data.shoppingLogs)
    );
    localStorage.setItem(
      "shoppingDetails",
      JSON.stringify(this.data.shoppingDetails)
    );
    localStorage.setItem("shopping", JSON.stringify(this.data.shopping)); // Add shopping for backward compatibility
    localStorage.setItem("jajan", JSON.stringify(this.data.jajan));
  }

  // Load stored data
  loadStoredData() {
    // Clear old jajan data to force API load
    if (window.jajanLogManager && window.jajanLogManager.jajanLogs.length > 0) {
      this.data.jajan = []; // Clear localStorage jajan data to use API data
    } else {
      this.data.jajan = JSON.parse(localStorage.getItem("jajan")) || [];
    }

    this.data.mealPlans = JSON.parse(localStorage.getItem("mealPlans")) || [];
    this.data.mealPlanDetails =
      JSON.parse(localStorage.getItem("mealPlanDetails")) || [];
    this.data.shoppingLogs =
      JSON.parse(localStorage.getItem("shoppingLogs")) || [];
    this.data.shoppingDetails =
      JSON.parse(localStorage.getItem("shoppingDetails")) || [];
    this.data.shopping = JSON.parse(localStorage.getItem("shopping")) || []; // Add shopping for backward compatibility
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

    // New jajan form handler
    const jajanFormNew = document.getElementById("jajanFormNew");
    if (jajanFormNew) {
      jajanFormNew.addEventListener("submit", (e) => {
        e.preventDefault();
        this.saveJajan();
      });
    }

    // Shopping form handler
    const createShoppingListForm = document.getElementById(
      "createShoppingListForm"
    );
    if (createShoppingListForm) {
      createShoppingListForm.addEventListener("submit", (e) => {
        e.preventDefault();
        // Use ShoppingLogManager if available, otherwise use legacy handler
        if (
          window.shoppingLogManager &&
          window.shoppingLogManager.isInitialized
        ) {
          window.shoppingLogManager.handleSaveShopping(e);
        } else {
          this.handleCreateShoppingList(e);
        }
      });
    }
  }

  showSection(sectionName) {
    console.log("🔍 DEBUG: showSection called with:", sectionName);

    // Get current active section
    const currentSection = document.querySelector(".section.active");
    console.log("🔍 DEBUG: Current active section:", currentSection?.id);

    // Hide all sections with fade out animation
    document.querySelectorAll(".section").forEach((section) => {
      if (section.classList.contains("active")) {
        section.style.opacity = "0";
        section.style.transform = "translateX(-30px)";

        setTimeout(() => {
          section.classList.remove("active");
        }, 200);
      }
    });

    // Show target section with fade in animation
    const targetSection = document.getElementById(sectionName);
    console.log(
      "🔍 DEBUG: Target section found:",
      !!targetSection,
      targetSection?.id
    );

    if (targetSection) {
      setTimeout(
        () => {
          targetSection.classList.add("active");
          targetSection.style.opacity = "0";
          targetSection.style.transform = "translateX(30px)";

          console.log("🔍 DEBUG: Target section activated:", targetSection.id);

          // Animate in
          setTimeout(() => {
            targetSection.style.transition =
              "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)";
            targetSection.style.opacity = "1";
            targetSection.style.transform = "translateX(0)";

            console.log(
              "🔍 DEBUG: Animation applied, calling initializeSectionFeatures"
            );
            // Initialize section-specific functionality
            this.initializeSectionFeatures(sectionName);
          }, 50);
        },
        currentSection ? 200 : 0
      );
    } else {
      console.error("❌ Target section not found:", sectionName);
    }

    // Update navigation with enhanced animation
    document.querySelectorAll(".nav-link").forEach((link) => {
      const wasActive = link.classList.contains("active");
      link.classList.remove("active");

      if (link.getAttribute("data-section") === sectionName) {
        link.classList.add("active");

        // Add a subtle bounce effect to active nav
        if (!wasActive) {
          link.style.animation = "bounceIn 0.6s ease-out";
          setTimeout(() => {
            link.style.animation = "";
          }, 600);
        }
      }
    });

    // Render section-specific content with loading animation
    setTimeout(
      () => {
        switch (sectionName) {
          case "dashboard":
            this.updateDashboard();
            break;
          case "meal-plan":
            this.renderMealPlanGrid();
            this.updateWeekDisplay();
            break;
          case "shopping":
            this.renderShoppingHistory();
            this.updateShoppingSummary();
            break;
          case "shopping-detail":
            // Shopping detail page is handled by ShoppingLogManager
            console.log("Shopping detail section activated");
            break;
          case "jajan":
            this.renderJajanHistory();
            this.updateJajanSummary();
            break;
          case "profile":
            this.updateProfile();
            break;
        }
      },
      currentSection ? 300 : 100
    );
  }

  // Initialize section-specific features
  initializeSectionFeatures(sectionName) {
    console.log(
      "🔧 DEBUG: initializeSectionFeatures called with:",
      sectionName
    );

    switch (sectionName) {
      case "jajan-log":
        console.log("🔧 DEBUG: Initializing jajan-log features");
        // Initialize Jajan Log Manager when jajan-log section is activated
        if (window.jajanLogManager && window.apiService) {
          // Only call init if not already initialized
          if (!window.jajanLogManager.isInitialized) {
            console.log("Initializing JajanLogManager for jajan-log section");
            setTimeout(() => {
              window.jajanLogManager.init();
            }, 100); // Small delay to ensure section is fully active
          } else {
            console.log("JajanLogManager already initialized, just rendering");
            // Just refresh the display
            window.jajanLogManager.renderJajanLogs();
          }
        }
        break;
      case "jajan":
        console.log("🔧 DEBUG: Initializing jajan features");
        // Also initialize for the main jajan section
        if (window.jajanLogManager && window.apiService) {
          // Only call init if not already initialized
          if (!window.jajanLogManager.isInitialized) {
            console.log("Initializing JajanLogManager for jajan section");
            setTimeout(() => {
              window.jajanLogManager.init();
            }, 100);
          } else {
            console.log("JajanLogManager already initialized, just rendering");
            // Just refresh the display
            window.jajanLogManager.renderJajanLogs();
          }
        }
        break;
      case "shopping":
        console.log("🔧 DEBUG: Initializing shopping features");
        // Initialize Shopping Log Manager when shopping section is activated
        if (window.shoppingLogManager && window.apiService) {
          // Only call init if not already initialized
          if (!window.shoppingLogManager.isInitialized) {
            console.log("Initializing ShoppingLogManager for shopping section");
            setTimeout(() => {
              window.shoppingLogManager.init();
            }, 100);
          } else {
            console.log(
              "ShoppingLogManager already initialized, just rendering"
            );
            // Just refresh the display
            window.shoppingLogManager.renderShoppingLogs();
          }
        }
        break;
      case "shopping-detail":
        console.log("🔧 DEBUG: Initializing shopping-detail features");
        // Initialize Shopping Log Manager for shopping detail page
        if (window.shoppingLogManager && window.apiService) {
          console.log(
            "🔧 DEBUG: ShoppingLogManager found, checking initialization"
          );
          // Only call init if not already initialized
          if (!window.shoppingLogManager.isInitialized) {
            console.log(
              "Initializing ShoppingLogManager for shopping-detail section"
            );
            setTimeout(() => {
              window.shoppingLogManager.init();
            }, 100);
          } else {
            console.log(
              "ShoppingLogManager already initialized for shopping-detail"
            );
            console.log(
              "🔧 DEBUG: Checking if we have currentShoppingDetail data"
            );

            // Only load shopping detail page if we have valid shopping data in memory
            const currentShopping = window.currentShoppingDetail;
            if (currentShopping && currentShopping.id_shoppinglog) {
              console.log(
                "🔧 DEBUG: Found valid shopping data in memory, calling loadShoppingDetailPage with ID:",
                currentShopping.id_shoppinglog
              );
              window.shoppingLogManager.loadShoppingDetailPage(
                currentShopping.id_shoppinglog
              );
            } else {
              console.log(
                "🔧 DEBUG: No valid shopping data found in memory, redirecting to shopping list"
              );
              // Redirect back to shopping list if no valid shopping data
              setTimeout(() => {
                this.showSection("shopping");
              }, 100);
            }
          }
        } else {
          console.error("❌ ShoppingLogManager or apiService not found!");
        }
        break;
      case "shopping-items":
        console.log("🔧 DEBUG: Initializing shopping-items features");
        // Initialize Shopping Items Manager when shopping-items section is activated
        if (window.shoppingItemsManager) {
          console.log(
            "Initializing ShoppingItemsManager for shopping-items section"
          );
          setTimeout(() => {
            window.shoppingItemsManager.initShoppingItemsPage();
          }, 100);
        } else {
          console.error("❌ ShoppingItemsManager not found!");
        }
        break;
      // Add other section-specific initializations here as needed
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

    // Use shopping data from ShoppingLogManager if available, otherwise fallback to localStorage
    let shoppingData = [];
    if (window.shoppingLogManager && window.shoppingLogManager.shoppingLogs) {
      shoppingData = window.shoppingLogManager.shoppingLogs;
    } else {
      // Fallback to localStorage data
      shoppingData = this.data.shopping || this.data.shoppingLogs || [];
    }

    const recentShopping = shoppingData
      .sort(
        (a, b) =>
          new Date(b.created_at || b.tanggal) -
          new Date(a.created_at || a.tanggal)
      )
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
                    <div class="item-name">${
                      item.topik_belanja ||
                      item.item ||
                      item.nama_item ||
                      "Item belanja"
                    }</div>
                    <div class="item-date">${this.formatDate(
                      item.tanggal_belanja || item.tanggal
                    )}</div>
                </div>
                <div class="item-price">${this.formatCurrency(
                  item.total_belanja || item.total_harga || 0
                )}</div>
            </div>
        `
      )
      .join("");
  }

  calculateTotalExpense() {
    // Use shopping data from ShoppingLogManager if available, otherwise fallback to localStorage
    let totalShopping = 0;
    if (window.shoppingLogManager && window.shoppingLogManager.shoppingLogs) {
      totalShopping = window.shoppingLogManager.shoppingLogs.reduce(
        (sum, item) => sum + parseFloat(item.total_belanja || 0),
        0
      );
    } else {
      // Fallback to localStorage data
      const shoppingData = this.data.shopping || this.data.shoppingLogs || [];
      totalShopping = shoppingData.reduce(
        (sum, item) =>
          sum + parseFloat(item.total_harga || item.total_belanja || 0),
        0
      );
    }

    // Use jajan data from JajanLogManager if available, otherwise fallback to localStorage
    let totalJajan = 0;
    if (window.jajanLogManager && window.jajanLogManager.jajanLogs) {
      totalJajan = window.jajanLogManager.jajanLogs.reduce(
        (sum, item) => sum + parseFloat(item.harga_jajanan || item.harga || 0),
        0
      );
    } else {
      totalJajan = this.data.jajan.reduce(
        (sum, item) => sum + parseFloat(item.harga || 0),
        0
      );
    }

    const totalExpense = totalShopping + totalJajan;

    const expenseElement = document.getElementById("totalExpense");
    if (expenseElement) {
      expenseElement.textContent = this.formatCurrency(totalExpense);
    }
  }

  renderShoppingHistory() {
    // Check if ShoppingLogManager is available and initialized
    if (window.shoppingLogManager && window.shoppingLogManager.isInitialized) {
      console.log("Using ShoppingLogManager for rendering shopping history");
      window.shoppingLogManager.renderShoppingLogs();
      return;
    }

    const tableBody = document.getElementById("shoppingHistoryTableBody");
    const emptyState = document.getElementById("shoppingHistoryEmpty");

    if (!tableBody || !emptyState) return;

    // Fallback to localStorage data if API not available
    const shoppingData = this.data.shopping || this.data.shoppingLogs || [];

    if (shoppingData.length === 0) {
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
    // Ensure shopping data exists, fallback to empty array
    const shoppingData = this.data.shopping || this.data.shoppingLogs || [];

    shoppingData.forEach((item) => {
      const date = item.tanggal;
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(item);
    });
    return grouped;
  }

  updateShoppingSummary() {
    // Check if ShoppingLogManager is available and initialized
    if (window.shoppingLogManager && window.shoppingLogManager.isInitialized) {
      console.log("Using ShoppingLogManager for updating shopping summary");
      window.shoppingLogManager.updateShoppingSummary();
      return;
    }

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    // Fallback to localStorage data if API not available
    const shoppingData = this.data.shopping || this.data.shoppingLogs || [];

    const monthlyData = shoppingData.filter((item) => {
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

  renderJajanHistory() {
    const tableBody = document.getElementById("jajanHistoryTableBody");
    const emptyState = document.getElementById("jajanHistoryEmpty");
    const historyTable = document.querySelector(".jajan-history-table");

    if (!tableBody || !emptyState) return;

    // Use data from JajanLogManager if available, otherwise fallback to localStorage
    let jajanData = [];
    if (window.jajanLogManager && window.jajanLogManager.jajanLogs) {
      jajanData = window.jajanLogManager.jajanLogs;
    } else {
      jajanData = this.data.jajan;
    }

    if (jajanData.length === 0) {
      historyTable.style.display = "none";
      emptyState.style.display = "block";
      return;
    }

    historyTable.style.display = "table";
    emptyState.style.display = "none";

    // Sort jajan by date (newest first)
    const sortedJajan = [...jajanData].sort(
      (a, b) => new Date(b.tanggal) - new Date(a.tanggal)
    );

    // Clear existing content first
    tableBody.innerHTML = "";

    // Add items with staggered animation
    sortedJajan.forEach((item, index) => {
      const tipeMakan = this.formatTipeMakan(
        item.tipe_makan || item.kategori_jajan
      );
      const jenisJajan = this.formatJenisJajan(
        item.jenis_jajan || item.kategori_jajan
      );

      const row = document.createElement("tr");
      row.onclick = () => showJajanDetail(item.id_jajan || item.id);
      row.style.opacity = "0";
      row.style.transform = "translateY(20px)";
      row.style.transition = "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)";

      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${this.formatDate(item.tanggal)}</td>
        <td><span class="tipe-badge ${
          item.tipe_makan || item.kategori_jajan
        }">${tipeMakan}</span></td>
        <td>${jenisJajan}</td>
        <td>${item.tempat_jajan || item.tempat}</td>
        <td class="text-right price">${this.formatCurrency(
          item.harga_jajanan || item.harga
        )}</td>
      `;

      tableBody.appendChild(row);

      // Animate in with delay
      setTimeout(() => {
        row.style.opacity = "1";
        row.style.transform = "translateY(0)";
      }, index * 50);
    });
  }

  updateJajanSummary() {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    // Use data from JajanLogManager if available, otherwise fallback to localStorage
    let jajanData = [];
    if (window.jajanLogManager && window.jajanLogManager.jajanLogs) {
      jajanData = window.jajanLogManager.jajanLogs;
    } else {
      jajanData = this.data.jajan;
    }

    const monthlyData = jajanData.filter((item) => {
      const itemDate = new Date(item.tanggal);
      return (
        itemDate.getMonth() === currentMonth &&
        itemDate.getFullYear() === currentYear
      );
    });

    const totalMonthly = monthlyData.reduce(
      (sum, item) => sum + parseFloat(item.harga_jajanan || item.harga || 0),
      0
    );

    const totalElement = document.getElementById("totalJajanBulanIni");
    if (totalElement) {
      totalElement.textContent = this.formatCurrency(totalMonthly);
    }
  }

  formatTipeMakan(tipe) {
    const tipeMap = {
      Makanan_Berat: "Makanan Berat",
      Minuman: "Minuman",
      Cemilan: "Cemilan",
    };
    return tipeMap[tipe] || tipe;
  }

  formatJenisJajan(jenis) {
    const jenisMap = {
      makanan: "Makanan",
      minuman: "Minuman",
      makanan_minuman: "Makanan & Minuman",
    };
    return jenisMap[jenis] || jenis;
  }

  renderMealPlanGrid() {
    // Update date displays for current week
    this.updateWeekDates();

    // Clear existing meal items with fade out animation
    const days = [
      "senin",
      "selasa",
      "rabu",
      "kamis",
      "jumat",
      "sabtu",
      "minggu",
    ];
    const mealTypes = ["sarapan", "makan_siang", "makan_malam"];

    let animationDelay = 0;

    days.forEach((day, dayIndex) => {
      mealTypes.forEach((type, typeIndex) => {
        const element = document.getElementById(`${day}-${type}`);
        if (element) {
          // Add staggered fade-in effect
          element.style.opacity = "0";
          element.style.transform = "translateY(20px) scale(0.95)";
          element.style.transition = "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)";

          element.innerHTML = `
            <div class="empty-meal" onclick="openMealPlanModalFor('${day}', '${type}')">
              <i class="fas fa-plus-circle"></i>
              <span>Tambah menu</span>
            </div>
          `;

          // Animate in with staggered delay
          setTimeout(() => {
            element.style.opacity = "1";
            element.style.transform = "translateY(0) scale(1)";
          }, animationDelay);

          animationDelay += 50;
        }
      });
    });

    // Populate with existing meal plans using correct API structure
    // Get meal plans for current week
    const currentWeekPlans = this.getMealPlansForCurrentWeek();

    currentWeekPlans.forEach((mealPlan, index) => {
      // Validate mealPlan data
      if (!mealPlan || !mealPlan.id_mealplan || !mealPlan.hari) {
        console.warn("Invalid meal plan data:", mealPlan);
        return;
      }

      // Process sessions and menus from the correct API structure
      if (mealPlan.sessions && Array.isArray(mealPlan.sessions)) {
        mealPlan.sessions.forEach((session) => {
          // Validate session data
          if (!session || !session.waktu_makan || !session.menus) {
            console.warn("Invalid session data:", session);
            return;
          }

          // Process each menu in the session
          session.menus.forEach((menu) => {
            // Validate menu data
            if (!menu || !menu.nama_menu) {
              console.warn("Invalid menu data:", menu);
              return;
            }

            const mealType = this.mapWaktuMakanToType(session.waktu_makan);
            const element = document.getElementById(
              `${mealPlan.hari.toLowerCase()}-${mealType}`
            );

            if (element) {
              setTimeout(() => {
                // Check if there are already items in this slot
                const existingContent = element.innerHTML;

                if (existingContent.includes("empty-meal")) {
                  // Replace empty slot with first meal
                  element.innerHTML = `
                    <div class="meal-item" onclick="showMealPlanDetail('${
                      mealPlan.id_mealplan
                    }', '${session.waktu_makan}')">
                      <div class="meal-item-title">${menu.nama_menu}</div>
                      ${
                        menu.catatan_menu
                          ? `<div class="meal-item-notes">${menu.catatan_menu}</div>`
                          : ""
                      }
                    </div>
                    <div class="add-more-meal-grid" onclick="openMealPlanModalFor('${mealPlan.hari.toLowerCase()}', '${mealType}')">
                      <i class="fas fa-plus"></i>
                      <span>Tambah lagi</span>
                    </div>
                  `;
                } else {
                  // Add additional meal to existing slot (multiple meals per time slot)
                  const addButton = element.querySelector(
                    ".add-more-meal-grid"
                  );
                  const mealItemHtml = `
                    <div class="meal-item additional-meal" onclick="showMealPlanDetail('${
                      mealPlan.id_mealplan
                    }', '${session.waktu_makan}')">
                      <div class="meal-item-title">${menu.nama_menu}</div>
                      ${
                        menu.catatan_menu
                          ? `<div class="meal-item-notes">${menu.catatan_menu}</div>`
                          : ""
                      }
                    </div>
                  `;

                  if (addButton) {
                    addButton.insertAdjacentHTML("beforebegin", mealItemHtml);
                  } else {
                    element.insertAdjacentHTML("beforeend", mealItemHtml);
                  }
                }

                // Add a subtle pulse effect when meal item appears
                const mealItems = element.querySelectorAll(".meal-item");
                mealItems.forEach((item) => {
                  if (!item.style.animation) {
                    item.style.animation = "mealItemPulse 0.8s ease-out";
                  }
                });
              }, animationDelay + index * 100);
            }
          });
        });
      }
    });
  }

  // Helper function to get meal plans for current week
  getMealPlansForCurrentWeek() {
    // Get current week start (Monday)
    const today = new Date();
    const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const daysFromMonday = currentDay === 0 ? 6 : currentDay - 1; // Handle Sunday as day 7

    const monday = new Date(today);
    monday.setDate(today.getDate() - daysFromMonday);
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    return this.data.mealPlans.filter((plan) => {
      const planDate = new Date(plan.tanggal);
      return planDate >= monday && planDate <= sunday;
    });
  }

  // Helper function to get date for a specific day
  getDateForDay(dayName) {
    if (!dayName) return new Date().toISOString().split("T")[0];

    const today = new Date();
    const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.

    const dayMapping = {
      Minggu: 0,
      Senin: 1,
      Selasa: 2,
      Rabu: 3,
      Kamis: 4,
      Jumat: 5,
      Sabtu: 6,
    };

    const targetDay = dayMapping[dayName];
    if (targetDay === undefined) return new Date().toISOString().split("T")[0];

    const daysUntilTarget = (targetDay - currentDay + 7) % 7;
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + daysUntilTarget);

    return targetDate.toISOString().split("T")[0];
  }

  // Helper function to capitalize first letter
  capitalizeFirst(str) {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // Helper function to map waktu_makan to meal type used in UI
  mapWaktuMakanToType(waktuMakan) {
    // Handle null, undefined, or empty values
    if (!waktuMakan || typeof waktuMakan !== "string") {
      return "sarapan"; // Default fallback
    }

    // Map database enum values to UI types
    const mapping = {
      Sarapan: "sarapan",
      Makan_siang: "makan_siang",
      Makan_malam: "makan_malam",
      Cemilan: "cemilan",
      // Legacy mappings for backward compatibility
      "Makan siang": "makan_siang",
      "Makan malam": "makan_malam",
    };
    return mapping[waktuMakan] || waktuMakan.toLowerCase();
  }

  updateWeekDates() {
    // Get current week start (Monday)
    const today = new Date();
    const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const daysFromMonday = currentDay === 0 ? 6 : currentDay - 1; // Handle Sunday as day 7

    const monday = new Date(today);
    monday.setDate(today.getDate() - daysFromMonday);

    const dayElements = [
      "monday-date",
      "tuesday-date",
      "wednesday-date",
      "thursday-date",
      "friday-date",
      "saturday-date",
      "sunday-date",
    ];

    dayElements.forEach((elementId, index) => {
      const dayDate = new Date(monday);
      dayDate.setDate(monday.getDate() + index);

      const element = document.getElementById(elementId);
      if (element) {
        const day = dayDate.getDate();
        const month = this.getMonthName(dayDate.getMonth());
        element.textContent = `${day} ${month}`;
      }
    });
  }

  updateWeekDisplay() {
    const today = new Date();
    const weekDisplay = document.getElementById("currentWeekDisplay");
    if (weekDisplay) {
      const startWeek = new Date(today);
      startWeek.setDate(today.getDate() - today.getDay() + 1);
      const endWeek = new Date(startWeek);
      endWeek.setDate(startWeek.getDate() + 6);

      weekDisplay.textContent = `${startWeek.getDate()} - ${endWeek.getDate()} ${this.getMonthName(
        endWeek.getMonth()
      )} ${endWeek.getFullYear()}`;
    }
  }

  getMonthName(monthIndex) {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "Mei",
      "Jun",
      "Jul",
      "Agu",
      "Sep",
      "Okt",
      "Nov",
      "Des",
    ];
    return months[monthIndex];
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
      modal.style.display = "flex";
      setTimeout(() => {
        modal.classList.add("active");
      }, 10);
      document.body.style.overflow = "hidden";
    }
  }

  closeMealPlanModal() {
    const modal = document.getElementById("mealPlanModal");
    if (modal) {
      modal.classList.remove("active");
      document.body.style.overflow = "";
      setTimeout(() => {
        modal.style.display = "none";
      }, 300);
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

    // Create new meal plan entry (ERD structure)
    const newMealPlan = {
      id_mealplan: Date.now().toString(),
      tanggal:
        formData.get("tanggal") || this.getDateForDay(formData.get("hari")),
      hari: formData.get("hari"),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Create meal plan detail entry (ERD structure)
    const newMealPlanDetail = {
      id_detail: Date.now().toString() + "_detail",
      id_mealplan: newMealPlan.id_mealplan,
      waktu_makan: formData.get("waktu_makan"),
      nama_menu: formData.get("nama_menu"),
      bahan_utama: formData.get("bahan_utama") || "",
      catatan_menu: formData.get("catatan_menu") || "",
      estimasi_kalori: formData.get("estimasi_kalori")
        ? parseInt(formData.get("estimasi_kalori"))
        : null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Add to data arrays
    this.data.mealPlans.push(newMealPlan);
    this.data.mealPlanDetails.push(newMealPlanDetail);

    // Save to localStorage
    this.saveData();

    // Close modal and refresh display
    this.closeMealPlanModal();
    this.renderMealPlanGrid();
    this.updateDashboard();

    // Reset form and show success message
    form.reset();
    this.showToast("Menu berhasil ditambahkan!", "success");
  }

  saveJajan() {
    const form = document.getElementById("jajanFormNew");
    if (!form) return;

    const formData = new FormData(form);

    const jajan = {
      id: Date.now().toString(),
      nama: formData.get("nama"),
      tanggal: formData.get("tanggal"),
      tipe_makan: formData.get("tipe_makan"),
      jenis_jajan: formData.get("jenis_jajan"),
      tempat: formData.get("tempat"),
      harga: parseFloat(formData.get("harga")),
      foto: this.currentJajanPhoto || null,
      created_at: new Date().toISOString(),
    };

    this.data.jajan.push(jajan);
    localStorage.setItem("jajan", JSON.stringify(this.data.jajan));

    this.showSection("jajan");
    this.renderJajanHistory();
    this.updateJajanSummary();
    this.showToast("success", "Data jajan berhasil disimpan!");

    form.reset();
    if (this.currentJajanPhoto) {
      const preview = document.getElementById("jajanPhotoPreview");
      if (preview) {
        preview.innerHTML = "";
        preview.classList.remove("has-photo");
      }
      this.currentJajanPhoto = null;
    }
  }

  backToJajan() {
    this.showSection("jajan");
    this.renderJajanHistory();
    this.updateJajanSummary();
  }

  // Handle Create Shopping List
  handleCreateShoppingList(e) {
    console.log("handleCreateShoppingList called"); // Debug log

    const form = e.target;
    const formData = new FormData(form);

    const shoppingListData = {
      id: Date.now(),
      tanggal: formData.get("tanggal"),
      hari: formData.get("hari"),
      items: [],
      totalBelanja: 0,
      completed: false,
      created_at: new Date().toISOString(),
    };

    console.log("Shopping list data:", shoppingListData); // Debug log

    // Store current shopping list globally
    window.currentShoppingList = shoppingListData;
    window.currentShoppingItems = [];

    // Close modal
    closeCreateShoppingListModal();

    // Navigate to shopping detail
    this.showShoppingDetail(shoppingListData);

    // Show success message
    this.showToast("success", "Daftar belanja berhasil dibuat!");
  }

  // Show Shopping Detail Page
  showShoppingDetail(shoppingList) {
    console.log("showShoppingDetail called with:", shoppingList); // Debug log

    // Navigate to shopping detail section
    this.showSection("shopping-detail");

    // Update page info
    const dateOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    const formattedDate = new Date(shoppingList.tanggal).toLocaleDateString(
      "id-ID",
      dateOptions
    );

    const headerElement = document.getElementById("shoppingDetailDate");
    const dayElement = document.getElementById("shoppingDetailDay");

    console.log("Header element:", headerElement, "Day element:", dayElement); // Debug log

    if (headerElement) {
      headerElement.textContent = `Belanja - ${
        shoppingList.hari.charAt(0).toUpperCase() + shoppingList.hari.slice(1)
      }`;
    }

    if (dayElement) {
      dayElement.textContent = formattedDate;
    }

    // Render shopping checklist
    renderShoppingChecklist();
    updateShoppingSummary();
  }

  // Utility functions for formatters
  formatTipeMakan(tipe) {
    const tipeMapping = {
      sarapan: "Sarapan",
      makan_siang: "Makan Siang",
      makan_malam: "Makan Malam",
      snack: "Snack",
    };
    return tipeMapping[tipe] || tipe;
  }

  formatJenisJajan(jenis) {
    const jenisMapping = {
      makanan: "Makanan",
      minuman: "Minuman",
      dessert: "Dessert",
      snack: "Snack",
    };
    return jenisMapping[jenis] || jenis;
  }

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

// Global functions for jajan log
function openJajanFormModal() {
  if (app) {
    app.showSection("jajan-form");

    // Set current date
    const today = new Date().toISOString().split("T")[0];
    const dateField = document.getElementById("jajanTanggal");
    if (dateField) {
      dateField.value = today;
    }
  }
}

function backToJajan() {
  if (app) {
    app.showSection("jajan-log");
  }
}

function showJajanDetail(jajanId) {
  if (!app || !jajanId) return;

  const jajan = app.data.jajan.find((item) => item.id === jajanId);
  if (!jajan) return;

  // Show detail section
  app.showSection("jajan-detail");

  // Populate detail fields
  document.getElementById("jajanDetailTitle").textContent = jajan.nama;
  document.getElementById("jajanDetailDate").textContent = app.formatDate(
    jajan.tanggal
  );
  document.getElementById("jajanDetailNama").textContent = jajan.nama;
  document.getElementById("jajanDetailTipe").textContent = app.formatTipeMakan(
    jajan.tipe_makan
  );
  document.getElementById("jajanDetailJenis").textContent =
    app.formatJenisJajan(jajan.jenis_jajan);
  document.getElementById("jajanDetailTempat").textContent = jajan.tempat;
  document.getElementById("jajanDetailHarga").textContent = app.formatCurrency(
    jajan.harga
  );

  // Handle photo
  const photoContainer = document.getElementById("jajanDetailPhoto");
  if (jajan.foto) {
    photoContainer.innerHTML = `<img src="${jajan.foto}" alt="Foto jajan">`;
    photoContainer.classList.remove("no-photo");
  } else {
    photoContainer.innerHTML = '<i class="fas fa-image"></i>';
    photoContainer.classList.add("no-photo");
  }
}

function handleJajanPhotoUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const preview = document.getElementById("jajanPhotoPreview");
    if (preview) {
      preview.innerHTML = `<img src="${e.target.result}" alt="Preview foto">`;
      preview.classList.add("has-photo");

      // Store photo data
      if (app) {
        app.currentJajanPhoto = e.target.result;
      }
    }
  };
  reader.readAsDataURL(file);
}

// Initialize the application
let app;
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM loaded, initializing app...");
  app = new TummyMate();
  console.log("App initialized:", app);

  // Make app globally available for debugging
  window.app = app;
});

// Global functions for shopping system
let currentShoppingList = null;
let currentShoppingItems = [];

// Initialize global variables
window.currentShoppingList = null;
window.currentShoppingItems = [];

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

function finishShoppingFromPage() {
  if (window.shoppingItemsManager) {
    window.shoppingItemsManager.finishShoppingFromPage();
  } else {
    console.error("Shopping items manager not found");
  }
}

function renderShoppingChecklist() {
  const checklistContainer = document.getElementById("shoppingChecklist");
  if (!checklistContainer) return;

  // Use global currentShoppingItems or initialize as empty array
  if (!window.currentShoppingItems) {
    window.currentShoppingItems = [];
  }

  if (
    !window.currentShoppingItems ||
    window.currentShoppingItems.length === 0
  ) {
    checklistContainer.innerHTML = `
            <div class="empty-checklist">
                <i class="fas fa-shopping-basket"></i>
                <p>Belum ada item belanja</p>
                <small>Klik tombol "Tambah Item" untuk menambahkan item</small>
            </div>
        `;
    return;
  }

  const checklistHTML = window.currentShoppingItems
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
  // Use global currentShoppingItems or initialize as empty array
  if (!window.currentShoppingItems) {
    window.currentShoppingItems = [];
  }

  const totalItems = window.currentShoppingItems.length;
  const totalPrice = window.currentShoppingItems.reduce(
    (sum, item) => sum + (item.total_harga || 0),
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
  if (!window.currentShoppingItems) {
    window.currentShoppingItems = [];
    return;
  }

  const item = window.currentShoppingItems.find((item) => item.id === itemId);
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

// ======== JAJAN LOG FUNCTIONS ========

function openJajanFormModal() {
  app.showSection("jajan-form");

  // Set default date to today
  const today = new Date().toISOString().split("T")[0];
  const dateInput = document.getElementById("jajanTanggal");
  if (dateInput) {
    dateInput.value = today;
  }
}

function backToJajan() {
  app.showSection("jajan");
}

// Shopping Item Functions (Updated for inline form)
function addShoppingItem() {
  const itemName = document.getElementById("itemName").value;
  const itemQuantity = document.getElementById("itemQuantity").value;
  const itemUnit = document.getElementById("itemUnit").value;
  const itemPrice = document.getElementById("itemPrice").value;

  if (!itemName || !itemQuantity || !itemUnit || !itemPrice) {
    alert("Harap isi semua field");
    return;
  }

  // Add item to current shopping list
  if (window.currentShoppingItems) {
    const newItem = {
      id: Date.now().toString(),
      item: itemName,
      jumlah: parseInt(itemQuantity),
      satuan: itemUnit,
      harga: parseFloat(itemPrice),
      total: parseInt(itemQuantity) * parseFloat(itemPrice),
      checked: false,
    };

    window.currentShoppingItems.push(newItem);
    renderShoppingChecklist();

    // Clear form after adding item
    clearAddItemForm();

    // Show success toast
    showToast("Item berhasil ditambahkan!", "success");
  }
}

function clearAddItemForm() {
  document.getElementById("itemName").value = "";
  document.getElementById("itemQuantity").value = "";
  document.getElementById("itemUnit").value = "";
  document.getElementById("itemPrice").value = "";
}

// Modern Alert/Popup Function
function showModernAlert(message, type = "info") {
  // Remove existing alert if any
  const existingAlert = document.querySelector(".modern-alert");
  if (existingAlert) {
    existingAlert.remove();
  }

  // Create alert element
  const alert = document.createElement("div");
  alert.className = `modern-alert modern-alert-${type}`;

  const iconMap = {
    success: "fas fa-check-circle",
    error: "fas fa-exclamation-circle",
    warning: "fas fa-exclamation-triangle",
    info: "fas fa-info-circle",
  };

  alert.innerHTML = `
    <div class="modern-alert-content">
      <div class="modern-alert-icon">
        <i class="${iconMap[type] || iconMap.info}"></i>
      </div>
      <div class="modern-alert-message">${message}</div>
      <button class="modern-alert-close" onclick="this.parentElement.parentElement.remove()">
        <i class="fas fa-times"></i>
      </button>
    </div>
  `;

  // Add to body
  document.body.appendChild(alert);

  // Show with animation
  setTimeout(() => {
    alert.classList.add("show");
  }, 10);

  // Auto remove after 4 seconds
  setTimeout(() => {
    if (alert.parentElement) {
      alert.classList.remove("show");
      setTimeout(() => {
        if (alert.parentElement) {
          alert.remove();
        }
      }, 300);
    }
  }, 4000);
}

// Jajan Modal Functions
function openJajanFormModal() {
  const modal = document.getElementById("jajanFormModal");
  if (modal) {
    modal.classList.add("active");
    document.body.style.overflow = "hidden";

    // Set default date to today
    const today = new Date().toISOString().split("T")[0];
    const dateInput = document.getElementById("jajanTanggalModal");
    if (dateInput) {
      dateInput.value = today;
    }

    // Clear form
    const form = document.getElementById("jajanModalForm");
    if (form) {
      form.reset();
      dateInput.value = today; // Reset date after form reset
    }

    // Clear photo preview
    const preview = document.getElementById("jajanPhotoModalPreview");
    if (preview) {
      preview.innerHTML = "";
      preview.classList.remove("has-photo");
    }
  }
}

function closeJajanFormModal() {
  const modal = document.getElementById("jajanFormModal");
  if (modal) {
    modal.classList.remove("active");
    document.body.style.overflow = "auto";
  }
}

function handleJajanModalPhotoUpload(event) {
  const file = event.target.files[0];
  const preview = document.getElementById("jajanPhotoModalPreview");

  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
      preview.classList.add("has-photo");
    };
    reader.readAsDataURL(file);
  } else {
    preview.innerHTML = "";
    preview.classList.remove("has-photo");
  }
}

function saveJajanFromModal() {
  if (!app) return;

  const form = document.getElementById("jajanModalForm");
  const formData = new FormData(form);

  const jajanData = {
    id: Date.now().toString(),
    nama: formData.get("nama"),
    tanggal: formData.get("tanggal"),
    tipe_makan: formData.get("tipe_makan"),
    jenis_jajan: formData.get("jenis_jajan"),
    tempat: formData.get("tempat"),
    harga: parseFloat(formData.get("harga")),
    foto: null,
  };

  // Handle photo if uploaded
  const preview = document.getElementById("jajanPhotoModalPreview");
  if (preview && preview.classList.contains("has-photo")) {
    const img = preview.querySelector("img");
    if (img) {
      jajanData.foto = img.src;
    }
  }

  // Add to app data
  app.data.jajan.push(jajanData);
  app.saveData();

  // Refresh UI
  app.renderJajanHistory();
  app.updateJajanSummary();

  // Close modal and show success message
  closeJajanFormModal();
  showToast("Data jajan berhasil disimpan!", "success");
}

// Global Toast Function
function showToast(message, type = "success") {
  const toast = document.getElementById("toast");
  const toastIcon = toast.querySelector(".toast-icon");
  const toastMessage = toast.querySelector(".toast-message");

  // Set icon based on type
  const iconMap = {
    success: "fas fa-check-circle",
    error: "fas fa-exclamation-circle",
    warning: "fas fa-exclamation-triangle",
  };

  toastIcon.className = `toast-icon ${iconMap[type] || iconMap.success}`;
  toastMessage.textContent = message;

  // Add type class and show
  toast.className = `toast ${type} show`;

  // Auto hide after 3 seconds
  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

function showJajanDetail(jajanId) {
  const jajan = app.data.jajan.find((item) => item.id === jajanId);
  if (!jajan) return;

  // Update detail content
  document.getElementById("jajanDetailTitle").textContent = jajan.nama;
  document.getElementById("jajanDetailDate").textContent = app.formatDate(
    jajan.tanggal
  );
  document.getElementById("jajanDetailNama").textContent = jajan.nama;
  document.getElementById("jajanDetailTipe").textContent = app.formatTipeMakan(
    jajan.tipe_makan
  );
  document.getElementById("jajanDetailJenis").textContent =
    app.formatJenisJajan(jajan.jenis_jajan);
  document.getElementById("jajanDetailTempat").textContent = jajan.tempat;
  document.getElementById("jajanDetailHarga").textContent = app.formatCurrency(
    jajan.harga
  );

  // Handle photo
  const photoContainer = document.getElementById("jajanDetailPhoto");
  if (jajan.foto) {
    photoContainer.innerHTML = `<img src="${jajan.foto}" alt="${jajan.nama}">`;
    photoContainer.classList.remove("no-photo");
  } else {
    photoContainer.innerHTML = '<i class="fas fa-image"></i>';
    photoContainer.classList.add("no-photo");
  }

  app.showSection("jajan-detail");
}

// Global functions for meal plan

// ERD-compliant meal plan functions
function showMealPlanDetail(mealPlanId, waktuMakan) {
  if (!app) return;

  const mealPlan = app.data.mealPlans.find(
    (plan) => plan.id_mealplan === mealPlanId
  );
  const mealDetails = app.data.mealPlanDetails.filter(
    (detail) =>
      detail.id_mealplan === mealPlanId && detail.waktu_makan === waktuMakan
  );

  if (!mealPlan || mealDetails.length === 0) return;

  let detailsHtml = "";
  mealDetails.forEach((detail) => {
    detailsHtml += `
      <div class="meal-detail-item">
        <h4>${detail.nama_menu}</h4>
        ${
          detail.catatan_menu
            ? `<p><strong>Catatan:</strong> ${detail.catatan_menu}</p>`
            : ""
        }
        ${
          detail.bahan_utama
            ? `<p><strong>Bahan Utama:</strong> ${detail.bahan_utama}</p>`
            : ""
        }
        ${
          detail.estimasi_kalori
            ? `<p><strong>Estimasi Kalori:</strong> ${detail.estimasi_kalori} kkal</p>`
            : ""
        }
      </div>
    `;
  });

  // Create modal if it doesn't exist
  let modal = document.getElementById("mealPlanDetailModal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "mealPlanDetailModal";
    modal.className = "modal";
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h2>${waktuMakan} - ${app.formatDate(new Date(mealPlan.tanggal))}</h2>
        <span class="close" onclick="closeMealPlanDetailModal()">&times;</span>
      </div>
      <div class="modal-body">
        ${detailsHtml}
        <div class="meal-plan-actions">
          <button onclick="editMealPlan('${mealPlanId}', '${waktuMakan}')" class="btn-edit">
            <i class="fas fa-edit"></i> Edit
          </button>
          <button onclick="deleteMealPlan('${mealPlanId}', '${waktuMakan}')" class="btn-delete">
            <i class="fas fa-trash-alt"></i> Hapus
          </button>
        </div>
      </div>
    </div>
  `;
  modal.style.display = "block";
}

function closeMealPlanDetailModal() {
  const modal = document.getElementById("mealPlanDetailModal");
  if (modal) {
    modal.style.display = "none";
  }
}

// Global functions for meal plan modal
function openMealPlanModal() {
  console.log("openMealPlanModal called");
  if (app) {
    app.openMealPlanModal();
  } else {
    console.error("App not initialized in openMealPlanModal");
  }
}

function closeMealPlanModal() {
  console.log("closeMealPlanModal called");
  if (app) {
    app.closeMealPlanModal();
  } else {
    console.error("App not initialized in closeMealPlanModal");
  }
}
function openMealPlanModalFor(day, mealType) {
  console.log("openMealPlanModalFor called with:", day, mealType);

  // Try using mealPlanManager first (preferred method)
  if (window.mealPlanManager) {
    console.log("Using mealPlanManager");
    window.mealPlanManager.openMealPlanModalFor(day, mealType);
    return;
  }

  // Fallback to app if available
  if (!app) {
    console.log("App not initialized, waiting...");
    // Wait for app to be initialized
    const waitForApp = () => {
      if (app) {
        console.log("App now available, calling openMealPlanModalFor again");
        openMealPlanModalFor(day, mealType);
      } else {
        setTimeout(waitForApp, 100);
      }
    };
    waitForApp();
    return;
  }

  // Store selected day and meal type for form handling
  app.selectedDay = day;
  app.selectedMealType = mealType;

  const modal = document.getElementById("mealPlanModal");
  if (!modal) {
    console.error("Modal not found");
    return;
  }

  console.log("Opening modal...");

  // Reset and show the form
  const form = document.getElementById("mealPlanForm");
  if (form) {
    form.reset();

    // Handle "today" parameter for daily view
    let dayName = day;
    let targetDate = "";

    if (day === "today") {
      const currentDateToUse = window.currentDate || new Date();
      const dayNames = [
        "Minggu",
        "Senin",
        "Selasa",
        "Rabu",
        "Kamis",
        "Jumat",
        "Sabtu",
      ];
      dayName = dayNames[currentDateToUse.getDay()];
      targetDate = currentDateToUse.toISOString().split("T")[0];
    } else {
      targetDate = app.getDateForDay(app.capitalizeFirst(day));
    }

    // Pre-fill form values based on ERD structure
    const hariSelect = form.querySelector('select[name="hari"]');
    const waktuMakanSelect = form.querySelector('select[name="waktu_makan"]');
    const tanggalInput = form.querySelector('input[name="tanggal"]');

    if (hariSelect) {
      hariSelect.value = dayName;
    }

    if (waktuMakanSelect) {
      const mealTypeMapping = {
        sarapan: "Sarapan",
        makan_siang: "Makan siang",
        makan_malam: "Makan malam",
        snack: "Cemilan",
      };
      waktuMakanSelect.value = mealTypeMapping[mealType] || "Sarapan";
    }

    // Set date
    if (tanggalInput) {
      tanggalInput.value = targetDate;
    }
  }

  modal.style.display = "flex";
  setTimeout(() => {
    modal.classList.add("active");
  }, 10);
}

function showMealDetail(mealId) {
  if (!app || !mealId) return;

  const meal = app.data.mealPlans.find((item) => item.id == mealId);
  if (!meal) return;

  // For now, just show an alert with meal details
  // Later this can be expanded to a proper detail modal
  alert(
    `Menu: ${meal.menu}\nHari: ${meal.hari}\nWaktu: ${
      meal.jenis_rencana
    }\nCatatan: ${meal.catatan || "Tidak ada"}`
  );
}

function previousWeek() {
  previousPeriod();
}

function nextWeek() {
  nextPeriod();
}

// Meal Plan View Management
let currentMealPlanView = "day"; // 'day' or 'week'
let currentDate = new Date();
let currentWeekStart = new Date();
// Make currentWeekStart and currentDate available globally
window.currentWeekStart = currentWeekStart;
window.currentDate = currentDate;

function switchMealPlanView(viewType) {
  currentMealPlanView = viewType;

  // Update toggle buttons
  document.querySelectorAll(".toggle-btn").forEach((btn) => {
    btn.classList.remove("active");
    if (btn.dataset.view === viewType) {
      btn.classList.add("active");
    }
  });

  // Switch views with animation
  const dailyView = document.getElementById("dailyMealPlan");
  const weeklyView = document.getElementById("weeklyMealPlan");

  if (viewType === "day") {
    // Fade out weekly view
    weeklyView.classList.remove("active");

    setTimeout(() => {
      // Fade in daily view
      dailyView.classList.add("active");
      updateDailyView();
      updatePeriodDisplay();
    }, 300);
  } else {
    // Fade out daily view
    dailyView.classList.remove("active");

    setTimeout(() => {
      // Fade in weekly view
      weeklyView.classList.add("active");
      if (window.mealPlanManager) {
        window.mealPlanManager.renderMealPlanGrid();
      }
      updatePeriodDisplay();
    }, 300);
  }
}

function updateDailyView() {
  if (!window.mealPlanManager) return;

  const todayString = currentDate.toISOString().split("T")[0];

  // Get meal plans for today from the meal plan manager
  const todayMealPlans = window.mealPlanManager.currentMealPlans.filter(
    (plan) => {
      const planDate = new Date(plan.tanggal).toISOString().split("T")[0];
      return planDate === todayString;
    }
  );

  // Helper function to render meal items for a specific time
  function renderMealItems(waktuMakan, containerId, addAction) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Get all menus for this time of day from sessions
    const menusForTime = [];
    todayMealPlans.forEach((plan) => {
      if (plan.sessions) {
        plan.sessions.forEach((session) => {
          if (session.waktu_makan === waktuMakan && session.menus) {
            session.menus.forEach((menu) => {
              menusForTime.push({
                ...menu,
                id_mealplan: plan.id_mealplan,
                waktu_makan: session.waktu_makan,
              });
            });
          }
        });
      }
    });

    if (menusForTime.length > 0) {
      // Render multiple meals if available
      const mealItemsHtml = menusForTime
        .map(
          (menu) => `
        <div class="daily-meal-item" onclick="showMealPlanDetail('${
          menu.id_mealplan
        }', '${menu.waktu_makan}')">
          <div class="daily-meal-title">${menu.nama_menu}</div>
          ${
            menu.catatan_menu
              ? `<div class="daily-meal-serving">${menu.catatan_menu}</div>`
              : '<div class="daily-meal-serving">1 serving</div>'
          }
        </div>
      `
        )
        .join("");

      // Add "Add more" button after existing meals
      container.innerHTML =
        mealItemsHtml +
        `
        <div class="add-more-meal" onclick="openMealPlanModalFor('today', '${waktuMakan}')">
          <i class="fas fa-plus-circle"></i>
          <span>Tambah lagi</span>
        </div>
      `;
    } else {
      // Show empty state with add button
      const mealTypeLabels = {
        Sarapan: "breakfast",
        Makan_siang: "lunch",
        Makan_malam: "dinner",
        Cemilan: "snack",
      };

      container.innerHTML = `
        <div class="empty-meal-daily" onclick="openMealPlanModalFor('today', '${waktuMakan}')">
          <i class="fas fa-plus-circle"></i>
          <span>Add ${mealTypeLabels[waktuMakan] || "meal"}</span>
        </div>
      `;
    }
  }

  // Update each meal time using correct enum values
  renderMealItems("Sarapan", "breakfastItems", "sarapan");
  renderMealItems("Makan_siang", "lunchItems", "makan_siang");
  renderMealItems("Makan_malam", "dinnerItems", "makan_malam");
  renderMealItems("Cemilan", "snackItems", "snack");
}

function previousPeriod() {
  if (currentMealPlanView === "day") {
    currentDate.setDate(currentDate.getDate() - 1);
    window.currentDate = currentDate; // Update global reference
    updateDailyView();
  } else {
    currentWeekStart.setDate(currentWeekStart.getDate() - 7);
    window.currentWeekStart = currentWeekStart; // Update global reference
    if (window.mealPlanManager) {
      window.mealPlanManager.renderMealPlanGrid();
    }
  }
  updatePeriodDisplay();
}

function nextPeriod() {
  if (currentMealPlanView === "day") {
    currentDate.setDate(currentDate.getDate() + 1);
    window.currentDate = currentDate; // Update global reference
    updateDailyView();
  } else {
    currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    window.currentWeekStart = currentWeekStart; // Update global reference
    if (window.mealPlanManager) {
      window.mealPlanManager.renderMealPlanGrid();
    }
  }
  updatePeriodDisplay();
}

function updatePeriodDisplay() {
  const periodDisplay = document.getElementById("currentPeriodDisplay");

  if (currentMealPlanView === "day") {
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    const formattedDate = currentDate.toLocaleDateString("en-US", options);
    periodDisplay.textContent = formattedDate;
  } else {
    // For workweek view (Monday-Friday), add 4 days instead of 6
    const weekEnd = new Date(currentWeekStart);
    weekEnd.setDate(currentWeekStart.getDate() + 4);

    const startMonth = currentWeekStart.toLocaleDateString("en-US", {
      month: "short",
    });
    const endMonth = weekEnd.toLocaleDateString("en-US", { month: "short" });

    if (startMonth === endMonth) {
      periodDisplay.textContent = `${startMonth} ${currentWeekStart.getDate()}-${weekEnd.getDate()}, ${currentWeekStart.getFullYear()}`;
    } else {
      periodDisplay.textContent = `${startMonth} ${currentWeekStart.getDate()} - ${endMonth} ${weekEnd.getDate()}, ${currentWeekStart.getFullYear()}`;
    }
  }
}

function getTodayDayName() {
  const days = ["minggu", "senin", "selasa", "rabu", "kamis", "jumat", "sabtu"];
  return days[currentDate.getDay()];
}

function isToday(dateString) {
  if (!dateString) return true; // If no date specified, assume it's for today
  const mealDate = new Date(dateString);
  return mealDate.toDateString() === currentDate.toDateString();
}

function handleJajanPhotoUpload(event) {
  const file = event.target.files[0];
  const preview = document.getElementById("jajanPhotoPreview");

  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
      preview.classList.add("has-photo");
      app.currentJajanPhoto = e.target.result;
    };
    reader.readAsDataURL(file);
  } else {
    preview.innerHTML = "";
    preview.classList.remove("has-photo");
    app.currentJajanPhoto = null;
  }
}

// Add event listener for jajan form
document.addEventListener("DOMContentLoaded", function () {
  const jajanForm = document.getElementById("jajanFormNew");
  if (jajanForm) {
    jajanForm.addEventListener("submit", function (e) {
      e.preventDefault();
      app.saveJajan();
    });
  }

  // Add event listener for add item form (DISABLED - handled by shopping-log.js)
  // const addItemForm = document.getElementById("addItemForm");
  // if (addItemForm) {
  //   addItemForm.addEventListener("submit", function (e) {
  //     e.preventDefault();
  //     addShoppingDetailItem();
  //   });
  // }

  // Note: addShoppingDetailItemForm event listener is handled by shopping-log.js

  // Add event listener for jajan modal form
  const jajanModalForm = document.getElementById("jajanModalForm");
  if (jajanModalForm) {
    jajanModalForm.addEventListener("submit", function (e) {
      e.preventDefault();
      saveJajanFromModal();
    });
  }

  // Initialize meal plan view
  // Set current week start to Monday of current week
  const today = new Date();
  currentDate = new Date(today);
  currentWeekStart = new Date(today);
  currentWeekStart.setDate(today.getDate() - today.getDay() + 1);
  window.currentWeekStart = currentWeekStart; // Update global reference

  // Initialize with daily view after a short delay to ensure DOM is ready
  setTimeout(() => {
    switchMealPlanView("day");
  }, 100);

  // Note: addShoppingDetailItemForm event listener is handled by shopping-log.js
  // to avoid conflicts
});

// Shopping Detail Form Functions
async function addShoppingDetailItem() {
  const form = document.getElementById("addShoppingDetailItemForm");
  if (!form) {
    showModernAlert("Form tidak ditemukan!", "error");
    return;
  }

  // Get form elements
  const nameElement = form.querySelector("#itemName");
  const quantityElement = form.querySelector("#itemQuantity");
  const unitElement = form.querySelector("#itemUnit");
  const priceElement = form.querySelector("#itemPrice");

  // Debug: Log elements to check if they exist
  console.log("🔍 DEBUG: Form elements found:", {
    nameElement: !!nameElement,
    quantityElement: !!quantityElement,
    unitElement: !!unitElement,
    priceElement: !!priceElement,
  });

  // Debug: Log current dropdown value
  if (unitElement) {
    console.log("🔍 DEBUG: Current dropdown value:", unitElement.value);
    console.log(
      "🔍 DEBUG: Dropdown options:",
      Array.from(unitElement.options).map((opt) => ({
        value: opt.value,
        text: opt.text,
        selected: opt.selected,
      }))
    );
  }

  if (!nameElement || !quantityElement || !unitElement || !priceElement) {
    showModernAlert("Beberapa field form tidak ditemukan!", "error");
    return;
  }

  const itemData = {
    nama_item: nameElement.value.trim(),
    jumlah_item: parseFloat(quantityElement.value),
    satuan: unitElement.value.trim(),
    harga: parseInt(priceElement.value),
  };

  // Debug: Log form data
  console.log("Form data:", itemData);

  // Validate form data
  if (!itemData.nama_item) {
    showModernAlert("Nama item harus diisi!", "error");
    nameElement.style.borderColor = "#ef4444";
    nameElement.focus();
    return;
  }

  if (!itemData.jumlah_item || itemData.jumlah_item <= 0) {
    showModernAlert(
      "Jumlah item harus diisi dengan angka yang valid!",
      "error"
    );
    quantityElement.style.borderColor = "#ef4444";
    quantityElement.focus();
    return;
  }

  if (!itemData.satuan) {
    showModernAlert("Satuan harus dipilih!", "error");
    unitElement.style.borderColor = "#ef4444";
    unitElement.focus();
    return;
  }

  if (!itemData.harga || itemData.harga <= 0) {
    showModernAlert("Harga harus diisi dengan angka yang valid!", "error");
    priceElement.style.borderColor = "#ef4444";
    priceElement.focus();
    return;
  }

  // Reset border colors if validation passes
  nameElement.style.borderColor = "";
  quantityElement.style.borderColor = "";
  unitElement.style.borderColor = "";
  priceElement.style.borderColor = "";

  try {
    // Get current shopping detail
    const currentShopping = window.currentShoppingDetail;
    if (!currentShopping) {
      showModernAlert("Data shopping tidak ditemukan!", "error");
      return;
    }

    // Add additional fields required by API
    const completeItemData = {
      ...itemData,
      catatan: null,
      is_checked: false,
    };

    // Wrap item data in items array as expected by API
    const apiPayload = {
      items: [completeItemData],
    };

    console.log("Sending payload to API:", JSON.stringify(apiPayload, null, 2));

    // Call API to add item
    const response = await window.apiService.createShoppingDetail(
      currentShopping.id,
      apiPayload
    );

    if (response.success) {
      // Clear the form
      clearAddItemForm();

      // Reload shopping detail to show new item
      if (window.shoppingLogManager) {
        await window.shoppingLogManager.loadShoppingDetailPage(
          currentShopping.id
        );
      }

      // Show success message
      showModernAlert("Item berhasil ditambahkan!", "success");
    } else {
      throw new Error(response.message || "Gagal menambahkan item");
    }
  } catch (error) {
    console.error("Error adding item:", error);
    showModernAlert("Gagal menambahkan item: " + error.message, "error");
  }
}

function clearAddItemForm() {
  const form = document.getElementById("addShoppingDetailItemForm");
  if (form) {
    form.reset();

    // Focus on the first input
    const firstInput = form.querySelector("#itemName");
    if (firstInput) {
      firstInput.focus();
    }
  }
}

function quickAddItem(nama, jumlah, satuan, harga) {
  // Fill the form with quick add data
  const form = document.getElementById("addShoppingDetailItemForm");
  if (form) {
    form.querySelector("#itemName").value = nama;
    form.querySelector("#itemQuantity").value = jumlah;
    form.querySelector("#itemUnit").value = satuan;
    form.querySelector("#itemPrice").value = harga;

    // Auto submit the form
    addShoppingDetailItem();
  }
}

function showNotification(message, type = "info") {
  // Create notification element
  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <i class="fas ${
        type === "success"
          ? "fa-check-circle"
          : type === "error"
          ? "fa-exclamation-circle"
          : "fa-info-circle"
      }"></i>
      <span>${message}</span>
    </div>
  `;

  // Add to body
  document.body.appendChild(notification);

  // Show notification
  setTimeout(() => {
    notification.classList.add("show");
  }, 100);

  // Remove notification after 3 seconds
  setTimeout(() => {
    notification.classList.remove("show");
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

// Add Menu Modal Functions
function openAddMenuModal(sessionType) {
  const modal = document.getElementById("addMenuModal");
  const sessionNameSpan = document.getElementById("currentSessionName");
  const menuDateInput = document.getElementById("menuDate");
  const menuWaktuMakanInput = document.getElementById("menuWaktuMakan");
  const mealDateInput = document.getElementById("mealDate");

  // Set session name for display
  const sessionNames = {
    Sarapan: "Sarapan",
    Makan_siang: "Makan Siang",
    Makan_malam: "Makan Malam",
    Cemilan: "Cemilan",
  };

  sessionNameSpan.textContent = sessionNames[sessionType] || sessionType;

  // Set date from main modal
  menuDateInput.value = mealDateInput.value;

  // Set waktu makan (readonly)
  menuWaktuMakanInput.value = sessionNames[sessionType] || sessionType;

  // Store current session type
  modal.setAttribute("data-session-type", sessionType);

  // Clear form
  document.getElementById("addMenuForm").reset();
  menuDateInput.value = mealDateInput.value;
  menuWaktuMakanInput.value = sessionNames[sessionType] || sessionType;

  // Show modal
  modal.style.display = "block";
  setTimeout(() => modal.classList.add("show"), 10);
}

function closeAddMenuModal() {
  const modal = document.getElementById("addMenuModal");
  modal.classList.remove("show");
  setTimeout(() => {
    modal.style.display = "none";
    document.getElementById("addMenuForm").reset();
  }, 300);
}

function addMenuToSessionContainer(sessionType, menuData) {
  const container = document.getElementById(`menusContainer_${sessionType}`);
  if (!container) return;

  // Create menu item element
  const menuItem = document.createElement("div");
  menuItem.className = "menu-item";
  menuItem.innerHTML = `
    <div class="menu-item-content">
      <div class="menu-name">${menuData.nama_menu}</div>
      ${
        menuData.porsi
          ? `<div class="menu-porsi">Porsi: ${menuData.porsi}</div>`
          : ""
      }
      ${
        menuData.catatan_menu
          ? `<div class="menu-catatan">${menuData.catatan_menu}</div>`
          : ""
      }
    </div>
    <button type="button" class="btn-remove-menu" onclick="removeMenuFromSession(this)">
      <i class="fas fa-times"></i>
    </button>
  `;

  // Store menu data
  menuItem.setAttribute("data-menu-data", JSON.stringify(menuData));

  container.appendChild(menuItem);
}

function removeMenuFromSession(button) {
  const menuItem = button.closest(".menu-item");
  if (menuItem) {
    menuItem.remove();
  }
}

// Initialize add menu form handler
document.addEventListener("DOMContentLoaded", function () {
  const addMenuForm = document.getElementById("addMenuForm");
  if (addMenuForm) {
    addMenuForm.addEventListener("submit", function (event) {
      event.preventDefault();

      const modal = document.getElementById("addMenuModal");
      const sessionType = modal.getAttribute("data-session-type");
      const formData = new FormData(addMenuForm);

      const menuData = {
        nama_menu: formData.get("nama_menu"),
        porsi: formData.get("porsi"),
        catatan_menu: formData.get("catatan_menu"),
        waktu_makan: formData.get("waktu_makan"),
      };

      // Validate required fields
      if (!menuData.nama_menu.trim()) {
        alert("Nama menu harus diisi!");
        return;
      }

      // Add menu to session container
      addMenuToSessionContainer(sessionType, menuData);

      // Close modal
      closeAddMenuModal();
    });
  }
});
