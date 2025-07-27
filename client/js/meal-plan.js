// Meal Plan Management
class MealPlanManager {
  constructor() {
    this.currentMealPlans = [];
    this.menuCounter = 0;
    this.init();
  }

  init() {
    this.bindEvents();
    this.loadMealPlans();
  }

  bindEvents() {
    // Form submission
    const form = document.getElementById("mealPlanForm");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        this.saveMealPlan();
      });
    }

    // Date change auto-fill day
    const dateInput = document.getElementById("mealDate");
    const daySelect = document.getElementById("mealDay");

    if (dateInput && daySelect) {
      dateInput.addEventListener("change", (e) => {
        const date = new Date(e.target.value);
        const days = [
          "Minggu",
          "Senin",
          "Selasa",
          "Rabu",
          "Kamis",
          "Jumat",
          "Sabtu",
        ];
        daySelect.value = days[date.getDay()];
      });
    }
  }

  // Add menu to specific session
  addMenuToSession(sessionType) {
    const container = document.getElementById(`menusContainer_${sessionType}`);
    if (!container) return;

    this.menuCounter++;
    const menuId = `menu_${sessionType}_${this.menuCounter}`;

    const menuItem = document.createElement("div");
    menuItem.className = "menu-item";
    menuItem.setAttribute("data-menu-id", menuId);

    menuItem.innerHTML = `
      <div class="form-group">
        <label for="${menuId}_nama">Nama Menu</label>
        <input 
          type="text" 
          id="${menuId}_nama"
          name="nama_menu"
          placeholder="Contoh: Nasi Goreng, Jus Alpukat"
          required
        />
      </div>
      <div class="form-group">
        <label for="${menuId}_catatan">Catatan (Opsional)</label>
        <textarea 
          id="${menuId}_catatan"
          name="catatan_menu"
          rows="2"
          placeholder="Catatan tambahan, cara masak, dll"
        ></textarea>
      </div>
      <button type="button" class="btn-remove-menu" onclick="mealPlanManager.removeMenuFromSession('${menuId}')">
        <i class="fas fa-times"></i>
      </button>
    `;

    container.appendChild(menuItem);
  }

  // Remove menu from session
  removeMenuFromSession(menuId) {
    const menuItem = document.querySelector(`[data-menu-id="${menuId}"]`);
    if (menuItem) {
      menuItem.remove();
    }
  }

  // Collect form data
  collectFormData() {
    const form = document.getElementById("mealPlanForm");
    const formData = new FormData(form);

    const mealPlanData = {
      tanggal: formData.get("tanggal"),
      hari: formData.get("hari"),
      sessions: [],
    };

    // Collect sessions and menus
    const sessionTypes = ["Sarapan", "Makan_siang", "Makan_malam", "Cemilan"];

    sessionTypes.forEach((sessionType) => {
      const sessionGroup = document.querySelector(
        `[data-session="${sessionType}"]`
      );
      const container = document.getElementById(
        `menusContainer_${sessionType}`
      );

      // Only process visible sessions (in case of single session modal)
      if (sessionGroup && sessionGroup.style.display !== "none" && container) {
        const menuItems = container.querySelectorAll(".menu-item");

        if (menuItems.length > 0) {
          // Map sessionType to proper waktu_makan format (must match database enum)
          const waktuMakanMapping = {
            Sarapan: "Sarapan",
            Makan_siang: "Makan_siang",
            Makan_malam: "Makan_malam",
            Cemilan: "Cemilan",
          };

          const session = {
            waktu_makan: waktuMakanMapping[sessionType] || sessionType,
            menus: [],
          };

          menuItems.forEach((menuItem) => {
            const namaMenu = menuItem
              .querySelector('input[name="nama_menu"]')
              .value.trim();
            const catatanMenu = menuItem
              .querySelector('textarea[name="catatan_menu"]')
              .value.trim();

            if (namaMenu) {
              session.menus.push({
                nama_menu: namaMenu,
                catatan_menu: catatanMenu || null,
              });
            }
          });

          if (session.menus.length > 0) {
            mealPlanData.sessions.push(session);
          }
        }
      }
    });

    return mealPlanData;
  }

  // Save meal plan using API
  async saveMealPlan() {
    try {
      const mealPlanData = this.collectFormData();

      // Validation
      if (!mealPlanData.tanggal || !mealPlanData.hari) {
        this.showToast("Tanggal dan hari harus diisi!", "error");
        return;
      }

      if (mealPlanData.sessions.length === 0) {
        this.showToast("Minimal tambahkan satu menu!", "error");
        return;
      }

      // Show loading
      const submitBtn = document.querySelector(
        '#mealPlanForm button[type="submit"]'
      );
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML =
        '<i class="fas fa-spinner fa-spin"></i> Menyimpan...';
      submitBtn.disabled = true;

      // Call API
      const response = await window.apiService.createMealPlan(mealPlanData);

      if (response.success) {
        this.showToast("Meal plan berhasil disimpan!", "success");
        this.closeMealPlanModal();
        this.resetForm();
        this.loadMealPlans();

        // Update dashboard if app exists
        if (window.app) {
          window.app.updateDashboard();
        }

        // Update daily view if it's currently active
        if (typeof updateDailyView === "function") {
          updateDailyView();
        }
      } else {
        throw new Error(response.message || "Gagal menyimpan meal plan");
      }
    } catch (error) {
      console.error("Error saving meal plan:", error);
      this.showToast(
        error.message || "Terjadi kesalahan saat menyimpan meal plan",
        "error"
      );
    } finally {
      // Reset button
      const submitBtn = document.querySelector(
        '#mealPlanForm button[type="submit"]'
      );
      submitBtn.innerHTML = '<i class="fas fa-save"></i> Simpan Meal Plan';
      submitBtn.disabled = false;
    }
  }

  // Load meal plans from API
  async loadMealPlans() {
    try {
      const response = await window.apiService.getMealPlans();

      if (response.success) {
        this.currentMealPlans = response.data || [];
        this.renderMealPlanGrid();
        this.updateDashboardStats();
      } else {
        console.error("Failed to load meal plans:", response.message);
      }
    } catch (error) {
      console.error("Error loading meal plans:", error);
    }
  }

  // Render meal plan grid
  renderMealPlanGrid() {
    const grid = document.getElementById("mealPlanGrid");
    if (!grid) return;

    // Clear existing content
    grid.innerHTML = "";

    // Get current work week dates (Monday to Friday)
    const currentWeek = this.getCurrentWorkWeekDates();
    const days = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];
    const mealTypes = ["Sarapan", "Makan_siang", "Makan_malam", "Cemilan"];

    days.forEach((day, dayIndex) => {
      const dayDate = currentWeek[dayIndex];
      const dayPlans = this.getMealPlansForDate(dayDate);

      const dayColumn = document.createElement("div");
      dayColumn.className = "meal-plan-day";

      dayColumn.innerHTML = `
        <div class="day-header">
          <h3>${day}</h3>
          <span class="date">${this.formatDate(dayDate)}</span>
        </div>
      `;

      mealTypes.forEach((mealType) => {
        const mealSection = document.createElement("div");
        mealSection.className = "meal-section";

        const sessionPlans = this.getSessionPlans(dayPlans, mealType);

        if (sessionPlans.length > 0) {
          mealSection.innerHTML = `
            <div class="meal-type">${this.getMealTypeLabel(mealType)}</div>
            <div class="meal-content">
              ${sessionPlans
                .map(
                  (menu) => `
                <div class="meal-item" onclick="mealPlanManager.showMealDetail(${
                  menu.id_mealplan
                }, '${mealType}')">
                  <span class="meal-name">${menu.nama_menu}</span>
                  ${
                    menu.catatan_menu
                      ? `<span class="meal-note">${menu.catatan_menu}</span>`
                      : ""
                  }
                </div>
              `
                )
                .join("")}
            </div>
          `;
        } else {
          mealSection.innerHTML = `
            <div class="meal-type">${this.getMealTypeLabel(mealType)}</div>
            <div class="empty-meal" onclick="mealPlanManager.openMealPlanModalFor('${day}', '${mealType}')">
              <i class="fas fa-plus"></i>
              <span>Tambah Menu</span>
            </div>
          `;
        }

        dayColumn.appendChild(mealSection);
      });

      grid.appendChild(dayColumn);
    });
  }

  // Get current work week dates (Monday to Friday only)
  getCurrentWorkWeekDates() {
    // Always use global currentWeekStart if available
    let startDate;
    if (window.currentWeekStart) {
      startDate = new Date(window.currentWeekStart);
    } else {
      // Fallback: calculate Monday of current week
      const today = new Date();
      const currentDay = today.getDay();
      startDate = new Date(today);
      startDate.setDate(
        today.getDate() - (currentDay === 0 ? 6 : currentDay - 1)
      );
    }

    const week = [];
    for (let i = 0; i < 5; i++) {
      // Only 5 days (Monday to Friday)
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      week.push(date);
    }
    return week;
  }

  // Get meal plans for specific date
  getMealPlansForDate(date) {
    const dateString = date.toISOString().split("T")[0];
    return this.currentMealPlans.filter((plan) => {
      const planDate = new Date(plan.tanggal).toISOString().split("T")[0];
      return planDate === dateString;
    });
  }

  // Get session plans for specific meal type
  getSessionPlans(dayPlans, mealType) {
    const menus = [];
    dayPlans.forEach((plan) => {
      const session = plan.sessions?.find((s) => s.waktu_makan === mealType);
      if (session && session.menus) {
        session.menus.forEach((menu) => {
          menus.push({
            ...menu,
            id_mealplan: plan.id_mealplan,
          });
        });
      }
    });
    return menus;
  }

  // Get meal type label
  getMealTypeLabel(mealType) {
    const labels = {
      Sarapan: "Sarapan",
      Makan_siang: "Makan Siang",
      Makan_malam: "Makan Malam",
      Cemilan: "Cemilan",
    };
    return labels[mealType] || mealType;
  }

  // Open meal plan modal for specific day/meal type
  openMealPlanModalFor(day, mealType) {
    // Map waktu_makan from day section to session types
    const mealTypeMapping = {
      Sarapan: "Sarapan",
      "Makan siang": "Makan_siang",
      "Makan malam": "Makan_malam",
      Cemilan: "Cemilan",
    };

    const sessionType = mealTypeMapping[mealType] || mealType;

    this.openMealPlanModal(sessionType);

    // Handle 'today' parameter for daily view
    let targetDate;
    let dayName;

    if (day === "today") {
      // Use the current date from the day view (window.currentDate)
      targetDate = window.currentDate || new Date();
      const days = [
        "Minggu",
        "Senin",
        "Selasa",
        "Rabu",
        "Kamis",
        "Jumat",
        "Sabtu",
      ];
      dayName = days[targetDate.getDay()];
    } else {
      // Set date based on day name
      const today = new Date();
      const currentDay = today.getDay();
      const days = [
        "Minggu",
        "Senin",
        "Selasa",
        "Rabu",
        "Kamis",
        "Jumat",
        "Sabtu",
      ];
      const targetDayIndex = days.indexOf(day);

      if (targetDayIndex !== -1) {
        targetDate = new Date(today);
        const daysToAdd = (targetDayIndex - currentDay + 7) % 7;
        targetDate.setDate(today.getDate() + daysToAdd);
        dayName = day;
      } else {
        // Fallback to today
        targetDate = today;
        dayName = days[today.getDay()];
      }
    }

    // Set form values and make day field readonly
    const mealDateInput = document.getElementById("mealDate");
    const mealDayInput = document.getElementById("mealDay");

    if (mealDateInput) {
      mealDateInput.value = targetDate.toISOString().split("T")[0];
      // Trigger change event to update day field
      mealDateInput.dispatchEvent(new Event("change"));
    }

    if (mealDayInput) {
      mealDayInput.value = dayName;
      // Make day field readonly to prevent manual editing
      mealDayInput.setAttribute("readonly", "readonly");
      mealDayInput.style.backgroundColor = "#f5f5f5";
      mealDayInput.style.cursor = "not-allowed";
    }

    // Add a menu to the specified meal type
    setTimeout(() => {
      this.addMenuToSession(sessionType);
    }, 100);
  }

  // Open meal plan modal
  openMealPlanModal(specificSession = null) {
    const modal = document.getElementById("mealPlanModal");
    if (modal) {
      // Show/hide sessions based on specificSession parameter
      this.configureModalSessions(specificSession);

      modal.style.display = "flex";
      setTimeout(() => {
        modal.classList.add("active");
      }, 10);
      document.body.style.overflow = "hidden";
    }
  }

  // Configure which sessions to show in modal
  configureModalSessions(specificSession) {
    const allSessions = ["Sarapan", "Makan_siang", "Makan_malam", "Cemilan"];
    const sessionsContainer = document.getElementById("sessionsContainer");

    if (!sessionsContainer) return;

    // Update modal title based on session
    const modalTitle = document.querySelector(
      "#mealPlanModal .modal-header h2"
    );
    if (specificSession && modalTitle) {
      const sessionLabels = {
        Sarapan: "Tambah Menu Sarapan",
        Makan_siang: "Tambah Menu Makan Siang",
        Makan_malam: "Tambah Menu Makan Malam",
        Cemilan: "Tambah Menu Cemilan",
      };
      modalTitle.textContent =
        sessionLabels[specificSession] || "Buat Meal Plan";
    } else if (modalTitle) {
      modalTitle.textContent = "Buat Meal Plan";
    }

    allSessions.forEach((sessionType) => {
      const sessionGroup = document.querySelector(
        `[data-session="${sessionType}"]`
      );
      if (sessionGroup) {
        const isVisible = specificSession
          ? sessionType === specificSession
          : true;

        if (isVisible) {
          // Show session
          sessionGroup.style.display = "block";
          // Enable required validation for visible sessions
          const requiredInputs = sessionGroup.querySelectorAll(
            'input[name="nama_menu"]'
          );
          requiredInputs.forEach((input) => {
            input.setAttribute("required", "");
          });
        } else {
          // Hide session
          sessionGroup.style.display = "none";
          // Disable required validation for hidden sessions to prevent "not focusable" errors
          const requiredInputs = sessionGroup.querySelectorAll(
            'input[name="nama_menu"]'
          );
          requiredInputs.forEach((input) => {
            input.removeAttribute("required");
          });
        }
      }
    });
  }

  // Close meal plan modal
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

  // Reset form
  resetForm() {
    const form = document.getElementById("mealPlanForm");
    if (form) {
      form.reset();

      // Clear all menu containers
      const sessionTypes = ["Sarapan", "Makan_siang", "Makan_malam", "Cemilan"];
      sessionTypes.forEach((sessionType) => {
        const container = document.getElementById(
          `menusContainer_${sessionType}`
        );
        if (container) {
          container.innerHTML = "";
        }
      });

      this.menuCounter = 0;

      // Reset modal to show all sessions
      this.configureModalSessions(null);
    }
  }

  // Update dashboard stats
  updateDashboardStats() {
    const mealPlanCount = document.getElementById("mealPlanCount");
    if (mealPlanCount) {
      mealPlanCount.textContent = this.currentMealPlans.length;
    }
  }

  // Format date
  formatDate(date) {
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
    });
  }

  // Show toast notification
  showToast(message, type = "info") {
    if (window.app && typeof window.app.showToast === "function") {
      window.app.showToast(message, type);
    } else {
      // Fallback alert
      alert(message);
    }
  }

  // Show meal detail (placeholder for future implementation)
  showMealDetail(mealPlanId, mealType) {
    console.log("Show meal detail:", mealPlanId, mealType);
    // TODO: Implement meal detail modal
  }
}

// Global functions for HTML onclick events
function addMenuToSession(sessionType) {
  if (window.mealPlanManager) {
    window.mealPlanManager.addMenuToSession(sessionType);
  }
}

function openMealPlanModal(specificSession = null) {
  if (window.mealPlanManager) {
    window.mealPlanManager.openMealPlanModal(specificSession);
  }
}

function closeMealPlanModal() {
  if (window.mealPlanManager) {
    window.mealPlanManager.closeMealPlanModal();
  }
}

function openMealPlanModalFor(day, mealType) {
  if (window.mealPlanManager) {
    window.mealPlanManager.openMealPlanModalFor(day, mealType);
  }
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.mealPlanManager = new MealPlanManager();
});
