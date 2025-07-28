// Shopping Log API Integration
class ShoppingLogManager {
  constructor() {
    this.apiService = window.apiService;
    this.shoppingLogs = [];
    this.currentEditId = null;
    this.currentEditingDetailId = null;
    this.eventListenersSetup = false;
    this.isSubmitting = false;
    this.isInitialized = false;
    // Always assign to window for global access
    window.shoppingLogManager = this;
  }

  // Cleanup method to refresh event listeners
  refreshManager() {
    console.log("Refreshing ShoppingLogManager...");

    // Reset all flags to force complete refresh
    this.eventListenersSetup = false;
    this.isSubmitting = false;

    // Re-setup event listeners
    this.setupEventListeners();

    // Force reload and render data to ensure list is up to date
    this.loadShoppingLogs()
      .then(() => {
        this.renderShoppingLogs();
        this.updateShoppingSummary();
        console.log("ShoppingLogManager data refreshed");
      })
      .catch((error) => {
        console.error("Error refreshing shopping log data:", error);
      });

    console.log("ShoppingLogManager refreshed");
  }

  // Initialize shopping log functionality
  async init() {
    // Prevent multiple initialization
    if (this.isInitialized) {
      console.log("ShoppingLogManager already initialized, skipping");
      return;
    }

    try {
      console.log("Initializing ShoppingLogManager...");
      this.isInitialized = true;

      // Don't clear localStorage shopping data to allow fallback
      // localStorage.removeItem("shopping");
      // localStorage.removeItem("shoppingLogs");

      await this.loadShoppingLogs();
      
      // If no shopping logs loaded, try to load from localStorage
      if (!this.shoppingLogs || this.shoppingLogs.length === 0) {
        console.log("🔄 No shopping logs from API, checking localStorage...");
        this.loadFromLocalStorage();
      }
      
      this.setupEventListeners();
      this.renderShoppingLogs();
      this.updateShoppingSummary();

      // Check if we need to load a shopping detail page
      const storedShoppingDetail = localStorage.getItem(
        "currentShoppingDetail"
      );
      if (storedShoppingDetail && window.location.hash === "#shopping-detail") {
        try {
          const shoppingDetail = JSON.parse(storedShoppingDetail);
          window.currentShoppingDetail = shoppingDetail;
          console.log("Loading stored shopping detail:", shoppingDetail);

          // Load the shopping detail page
          await this.loadShoppingDetailPage(shoppingDetail.id);
        } catch (error) {
          console.error("Error loading stored shopping detail:", error);
          localStorage.removeItem("currentShoppingDetail");
        }
      }

      console.log("ShoppingLogManager initialization complete");
    } catch (error) {
      console.error("Error initializing Shopping Log Manager:", error);
      this.isInitialized = false; // Reset flag on error
      this.showError("Gagal memuat data shopping log");
    }
  }

  // Setup event listeners
  setupEventListeners() {
    console.log("Setting up Shopping Log event listeners (force refresh)");

    // Add shopping buttons - use more specific selectors
    const addShoppingBtns = document.querySelectorAll(
      'button[onclick*="openCreateShoppingListModal"], button[onclick*="openShoppingModal"], .btn-add-shopping'
    );
    console.log(
      "Found add shopping buttons:",
      addShoppingBtns.length,
      addShoppingBtns
    );

    addShoppingBtns.forEach((btn, index) => {
      console.log(`Setting up shopping button ${index}:`, btn);
      console.log(`Button onclick:`, btn.getAttribute("onclick"));
      console.log(`Button classes:`, btn.className);

      // Remove existing onclick attribute to avoid conflict
      btn.removeAttribute("onclick");

      // Remove any existing event listeners by cloning the button
      const newBtn = btn.cloneNode(true);
      btn.parentNode.replaceChild(newBtn, btn);

      // Use addEventListener only
      newBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log("Add shopping button clicked via addEventListener");
        this.openShoppingModal();
      });

      console.log(`Button ${index} setup complete`);
    });

    // Save shopping form - but be more specific to avoid interfering with other forms
    const shoppingForm = document.getElementById("createShoppingListForm");
    if (shoppingForm) {
      console.log("Setting up form submit listener...");

      // Remove existing listeners by removing and re-adding event listener
      const newHandler = (e) => {
        console.log("Shopping form submit intercepted");
        this.handleSaveShopping(e);
      };

      // Remove any existing submit listeners
      shoppingForm.removeEventListener("submit", newHandler);

      // Add the new submit listener
      shoppingForm.addEventListener("submit", newHandler);

      // Also setup the cancel button
      const cancelBtn = shoppingForm.querySelector('button[type="button"]');
      if (cancelBtn) {
        cancelBtn.addEventListener("click", (e) => {
          e.preventDefault();
          console.log("Cancel button clicked");
          this.closeShoppingModal();
        });
      }

      console.log("Form submit listener setup complete");
    }

    // DO NOT setup global form interceptors that might interfere with add item buttons
    console.log(
      "Avoiding global form interceptors to prevent button interference"
    );

    // Mark event listeners as set up
    this.eventListenersSetup = true;
    console.log("Shopping event listeners setup complete");
  }

  // Load shopping logs from API
  async loadShoppingLogs() {
    try {
      console.log("Loading shopping logs from API...");
      const response = await this.apiService.getShoppingLogs();
      console.log("API response:", response);

      if (response.success) {
        this.shoppingLogs = response.data;

        // Fix any logs with null dates
        await this.fixNullDates();

        console.log("Shopping logs loaded:", this.shoppingLogs);
        console.log("Shopping logs count:", this.shoppingLogs.length);

        // Debug: Log each shopping log
        this.shoppingLogs.forEach((log, index) => {
          console.log(`Shopping log ${index}:`, {
            id: log.id_shoppinglog,
            topik: log.topik_belanja,
            toko: log.nama_toko,
            tanggal: log.tanggal_belanja,
            status: log.status,
            total: log.total_belanja,
          });
        });
      } else {
        console.error("Failed to load shopping logs:", response.message);
        throw new Error(response.message);
      }
    } catch (error) {
      console.error("Error loading shopping logs:", error);
      console.log("🔄 Falling back to localStorage data...");
      
      // Fallback to localStorage data
      this.loadFromLocalStorage();
    }
  }

  // Load shopping logs from localStorage
  loadFromLocalStorage() {
    console.log("📦 Loading shopping logs from localStorage...");
    
    const shoppingLogsData = localStorage.getItem("shoppingLogs");
    
    if (shoppingLogsData) {
      try {
        const rawData = JSON.parse(shoppingLogsData);
        console.log("📋 Raw shopping logs data:", rawData);
        
        // Convert localStorage format to API format if needed
        this.shoppingLogs = this.convertToAPIFormat(rawData);
        
        console.log("✅ Shopping logs loaded from localStorage:", this.shoppingLogs.length);
        console.log("📊 Shopping logs data:", this.shoppingLogs);
      } catch (error) {
        console.error("❌ Error parsing shopping logs from localStorage:", error);
        this.shoppingLogs = [];
      }
    } else {
      console.log("📭 No shopping logs found in localStorage");
      
      // If no data in localStorage, try to load demo data
      if (typeof loadDemoData === 'function') {
        console.log("🎯 Loading demo data...");
        loadDemoData();
        
        // Try again after demo data is loaded
        setTimeout(() => {
          this.loadFromLocalStorage();
        }, 100);
        return;
      }
      
      this.shoppingLogs = [];
    }
  }

  // Convert localStorage format to API format
  convertToAPIFormat(rawData) {
    if (!Array.isArray(rawData)) {
      console.log("📝 Converting object format to array format");
      return [];
    }
    
    // Data is already in correct format
    return rawData.map(log => ({
      id_shoppinglog: log.id_shoppinglog,
      topik_belanja: log.topik_belanja,
      nama_toko: log.nama_toko,
      tanggal_belanja: log.tanggal_belanja,
      status: log.status,
      struk: log.struk,
      total_belanja: log.total_belanja
    }));
  }

  // Fix shopping logs with null dates by setting them to today
  async fixNullDates() {
    const today = new Date().toISOString().split("T")[0];

    for (const log of this.shoppingLogs) {
      if (!log.tanggal_belanja) {
        console.log(
          `Fixing null date for shopping log ID: ${log.id_shoppinglog}`
        );

        try {
          const updateResponse = await this.apiService.updateShoppingLog(
            log.id_shoppinglog,
            {
              tanggal_belanja: today,
            }
          );

          if (updateResponse.success) {
            log.tanggal_belanja = today;
            console.log(
              `Successfully updated date for shopping log ID: ${log.id_shoppinglog}`
            );
          } else {
            console.error(
              `Failed to update date for shopping log ID: ${log.id_shoppinglog}`,
              updateResponse.message
            );
          }
        } catch (error) {
          console.error(
            `Error updating date for shopping log ID: ${log.id_shoppinglog}`,
            error
          );
        }
      }
    }
  }

  // Create new shopping log
  async createShoppingLog(shoppingData) {
    try {
      const response = await this.apiService.createShoppingLog(shoppingData);
      if (response.success) {
        console.log("Shopping log created successfully:", response.data);

        // FORCE reload data and refresh display
        await this.loadShoppingLogs();
        this.renderShoppingLogs();
        this.updateShoppingSummary();

        // Update dashboard
        if (window.app) {
          window.app.updateDashboard();
          window.app.updateShoppingSummary();
        }

        this.showSuccess("Shopping log berhasil ditambahkan!");

        // FORCE refresh the event listeners before redirect
        console.log("Refreshing event listeners before redirect...");
        this.eventListenersSetup = false;
        this.setupEventListeners();

        // Redirect to shopping items page after successful creation
        console.log(
          "Checking for shoppingItemsManager:",
          window.shoppingItemsManager
        );
        console.log("Response data:", response.data);

        const shoppingLogId = response.data.id_shoppinglog || response.data.id;
        console.log("Shopping log ID to use:", shoppingLogId);

        // Redirect to shopping items page instead of modal
        if (window.app) {
          // Store shopping log data for the items page (in memory only)
          const shoppingLogData = {
            id: shoppingLogId,
            topik_belanja: shoppingData.topik_belanja,
            nama_toko: shoppingData.nama_toko,
            tanggal_belanja: shoppingData.tanggal_belanja,
          };

          window.currentShoppingLogData = shoppingLogData;
          console.log("Shopping log data stored in memory:", shoppingLogData);

          // Also set URL hash to remember the page
          window.location.hash = "shopping-items";

          // Switch to shopping items section
          setTimeout(() => {
            window.app.showSection("shopping-items");
          }, 500);
        }

        return response.data;
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error("Error creating shopping log:", error);
      this.showError("Gagal menambahkan shopping log: " + error.message);
      throw error;
    }
  }

  // Update shopping log
  async updateShoppingLog(id, shoppingData) {
    try {
      const response = await this.apiService.updateShoppingLog(
        id,
        shoppingData
      );
      if (response.success) {
        await this.loadShoppingLogs(); // Reload data
        this.renderShoppingLogs();
        this.updateShoppingSummary();

        // Update dashboard
        if (window.app) {
          window.app.updateDashboard();
          window.app.updateShoppingSummary();
        }

        this.showSuccess("Shopping log berhasil diperbarui!");
        return response.data;
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error("Error updating shopping log:", error);
      this.showError("Gagal memperbarui shopping log: " + error.message);
      throw error;
    }
  }

  // Open shopping modal for create/edit
  openShoppingModal(shoppingData = null) {
    console.log("openShoppingModal called with data:", shoppingData);

    // Always show the modal, regardless of which section is active
    const modal = document.getElementById("createShoppingListModal");
    console.log("Modal found:", !!modal);

    if (modal) {
      console.log("Opening modal...");
      modal.style.display = "flex";
      modal.classList.add("active");

      // Force visibility and opacity
      modal.style.opacity = "1";
      modal.style.visibility = "visible";
      modal.style.zIndex = "2000";

      document.body.style.overflow = "hidden"; // Prevent background scroll
      console.log("Modal should now be visible");
      console.log("Modal display:", modal.style.display);
      console.log("Modal classList:", modal.classList.toString());
    } else {
      console.error("createShoppingListModal not found in DOM!");
      // If no modal, something is wrong with the HTML
      this.showError("Form modal tidak ditemukan. Silakan refresh halaman.");
      return;
    }

    if (shoppingData) {
      // Edit mode
      console.log("Edit mode");
      this.currentEditId = shoppingData.id_shoppinglog;
      this.populateShoppingForm(shoppingData);
    } else {
      // Create mode
      console.log("Create mode");
      this.currentEditId = null;

      // Reset form first
      this.resetShoppingForm();

      // Focus on first input after modal is visible
      setTimeout(() => {
        const firstInput = modal.querySelector("input");
        if (firstInput) {
          firstInput.focus();
          console.log("Focused on first input");
        }

        // Ensure buttons are clickable
        const buttons = modal.querySelectorAll("button");
        buttons.forEach((btn) => {
          btn.disabled = false;
          console.log("Enabled button:", btn.textContent);
        });
      }, 200);
    }
  }

  // Close shopping modal
  closeShoppingModal() {
    console.log("Closing shopping modal...");
    const modal = document.getElementById("createShoppingListModal");
    if (modal) {
      modal.classList.remove("active");
      modal.style.display = "none";
      modal.style.opacity = "";
      modal.style.visibility = "";
      modal.style.zIndex = "";
      document.body.style.overflow = "auto"; // Restore scroll

      // Reset form and buttons
      const form = document.getElementById("createShoppingListForm");
      if (form) {
        form.reset();

        // Reset button states
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
          submitBtn.textContent = "Buat";
          submitBtn.disabled = false;
        }

        const cancelBtn = form.querySelector('button[type="button"]');
        if (cancelBtn) {
          cancelBtn.disabled = false;
        }
      }

      this.currentEditId = null;
      console.log("Shopping modal closed successfully");
    } else {
      console.error("Modal not found when trying to close");
    }
  }

  // Populate form with shopping data for editing
  populateShoppingForm(shoppingData) {
    console.log("Populating shopping form with:", shoppingData);

    const form = document.getElementById("createShoppingListForm");
    if (!form) {
      console.error("Form not found");
      return;
    }

    // Update modal title for edit mode
    const modalHeader = document.querySelector(
      "#createShoppingListModal .modal-header h2"
    );
    if (modalHeader) {
      modalHeader.textContent = "Edit Daftar Belanja";
    }

    // Populate form fields
    const topicInput = form.querySelector("#shoppingListTopic");
    if (topicInput) {
      topicInput.value = shoppingData.topik_belanja || "";
    }

    const storeInput = form.querySelector("#shoppingListStore");
    if (storeInput) {
      storeInput.value = shoppingData.nama_toko || "";
    }

    const dateInput = form.querySelector("#shoppingListDate");
    if (dateInput && shoppingData.tanggal_belanja) {
      // Convert date to YYYY-MM-DD format for date input
      const date = new Date(shoppingData.tanggal_belanja);
      if (!isNaN(date.getTime())) {
        dateInput.value = date.toISOString().split("T")[0];
      }
    }

    // Update submit button text
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.textContent = "Update";
    }

    console.log("Form populated successfully");
  }

  // Reset shopping form
  resetShoppingForm() {
    const form = document.getElementById("createShoppingListForm");
    if (form) {
      form.reset();

      // Reset modal title for create mode
      const modalHeader = document.querySelector(
        "#createShoppingListModal .modal-header h2"
      );
      if (modalHeader) {
        modalHeader.textContent = "Buat Daftar Belanja";
      }

      // Set default date to today
      const today = new Date().toISOString().split("T")[0];
      const dateInput = form.querySelector('input[type="date"]');
      if (dateInput) {
        dateInput.value = today;
        console.log("Set default date to:", today);
      }

      // Reset any button states
      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.textContent = "Buat";
        submitBtn.disabled = false;
        console.log("Reset submit button state");
      }

      // Reset any other buttons
      const cancelBtn = form.querySelector('button[type="button"]');
      if (cancelBtn) {
        cancelBtn.disabled = false;
      }
    }
  }

  // Handle save shopping (create or update)
  async handleSaveShopping(e) {
    e.preventDefault();

    // Prevent double submission
    if (this.isSubmitting) {
      console.log("Already submitting, ignoring duplicate call");
      return;
    }

    this.isSubmitting = true;
    console.log("handleSaveShopping called");

    const formData = this.getShoppingFormData();
    console.log("Form data:", formData);

    if (!this.validateShoppingForm(formData)) {
      console.log("Form validation failed");
      this.isSubmitting = false;
      return;
    }

    const saveBtn = e.target.querySelector('button[type="submit"]');
    const originalText = saveBtn?.textContent || "Simpan";
    if (saveBtn) {
      saveBtn.textContent = "Menyimpan...";
      saveBtn.disabled = true;
    }

    try {
      if (this.currentEditId) {
        console.log("Updating shopping log with ID:", this.currentEditId);
        await this.updateShoppingLog(this.currentEditId, formData);
      } else {
        console.log("Creating new shopping log");
        await this.createShoppingLog(formData);
      }

      this.resetShoppingForm();
      this.closeShoppingModal();

      // FORCE close any modals and reset form state
      setTimeout(() => {
        // Ensure modal is closed
        const modal = document.getElementById("createShoppingListModal");
        if (modal) {
          modal.style.display = "none";
          modal.classList.remove("active");
        }

        // Ensure form is reset
        const form = document.getElementById("createShoppingListForm");
        if (form) {
          form.reset();
        }

        console.log("Modal and form forcefully reset");
      }, 100);
    } catch (error) {
      console.error("Error saving shopping log:", error);
    } finally {
      if (saveBtn) {
        saveBtn.textContent = originalText;
        saveBtn.disabled = false;
      }
      this.isSubmitting = false;
    }
  }

  // Get form data
  getShoppingFormData() {
    const form = document.getElementById("createShoppingListForm");
    if (!form) return {};

    // Get date value and ensure it's in correct format
    const dateInput = form.querySelector('input[name="tanggal_belanja"]');
    let tanggalBelanja = dateInput?.value || "";

    // Ensure date is in YYYY-MM-DD format
    if (tanggalBelanja) {
      const date = new Date(tanggalBelanja);
      if (!isNaN(date.getTime())) {
        tanggalBelanja = date.toISOString().split("T")[0];
      }
    }

    const formData = {
      topik_belanja:
        form.querySelector('input[name="topik_belanja"]')?.value || "",
      nama_toko: form.querySelector('input[name="nama_toko"]')?.value || "",
      tanggal_belanja: tanggalBelanja,
      status: "Direncanakan", // Default status
      total_belanja: 0, // Will be calculated based on items
      struk: null, // Receipt URL if any
      items: [], // Shopping items will be handled separately
    };

    console.log("getShoppingFormData result:", formData);
    console.log("Date input value:", dateInput?.value);
    console.log("Processed date:", tanggalBelanja);
    return formData;
  }

  // Validate form data
  validateShoppingForm(formData) {
    if (!formData.topik_belanja) {
      this.showError("Topik belanja harus diisi");
      return false;
    }

    if (!formData.nama_toko) {
      this.showError("Nama toko harus diisi");
      return false;
    }

    if (!formData.tanggal_belanja) {
      this.showError("Tanggal belanja harus diisi");
      return false;
    }

    return true;
  }

  // Render shopping logs in the table
  renderShoppingLogs() {
    console.log("=== RENDER SHOPPING LOGS ===");
    console.log("Shopping logs to render:", this.shoppingLogs.length);

    const tableBody = document.getElementById("shoppingHistoryTableBody");
    const emptyState = document.getElementById("shoppingHistoryEmpty");

    console.log("Table body found:", !!tableBody);
    console.log("Empty state found:", !!emptyState);

    if (!tableBody) {
      console.error("Shopping table body not found!");
      return;
    }

    if (this.shoppingLogs.length === 0) {
      console.log("No shopping logs, showing empty state");
      tableBody.innerHTML = "";
      if (emptyState) {
        emptyState.style.display = "block";
      }
      return;
    }

    if (emptyState) {
      emptyState.style.display = "none";
    }

    console.log("Rendering shopping logs...");
    const sortedLogs = this.shoppingLogs.sort((a, b) => {
      // Handle null dates - put null dates at the end
      const dateA = a.tanggal_belanja
        ? new Date(a.tanggal_belanja)
        : new Date("1970-01-01");
      const dateB = b.tanggal_belanja
        ? new Date(b.tanggal_belanja)
        : new Date("1970-01-01");

      // If both dates are null, maintain original order
      if (!a.tanggal_belanja && !b.tanggal_belanja) {
        return 0;
      }

      // If only one date is null, put it at the end
      if (!a.tanggal_belanja) return 1;
      if (!b.tanggal_belanja) return -1;

      // Normal date comparison (newest first)
      return dateB - dateA;
    });
    console.log("Sorted logs:", sortedLogs);

    const renderedHtml = sortedLogs
      .map((shopping, index) => this.renderShoppingRow(shopping, index + 1))
      .join("");

    console.log("Setting table innerHTML...");
    tableBody.innerHTML = renderedHtml;

    // Setup event listeners for shopping rows
    this.setupShoppingRowEventListeners();

    console.log("=== RENDER COMPLETE ===");
  }

  // Setup event listeners for shopping rows
  setupShoppingRowEventListeners() {
    console.log("🔧 Setting up shopping row event listeners");
    
    const shoppingRows = document.querySelectorAll('.shopping-row');
    console.log("🔧 Found shopping rows:", shoppingRows.length);
    
    shoppingRows.forEach((row, index) => {
      const shoppingIdAttr = row.getAttribute('data-shopping-id');
      const shoppingId = parseInt(shoppingIdAttr);
      
      console.log(`🔧 Setting up listener for row ${index + 1}`);
      console.log(`🔧 Raw attribute value: "${shoppingIdAttr}"`);
      console.log(`🔧 Parsed ID: ${shoppingId}`);
      console.log(`🔧 Is valid number: ${!isNaN(shoppingId)}`);
      
      // Validate that we have a valid ID
      if (isNaN(shoppingId) || shoppingId <= 0) {
        console.error(`❌ Invalid shopping ID for row ${index + 1}: ${shoppingIdAttr}`);
        return;
      }
      
      // Remove any existing listeners
      row.removeEventListener('click', this.handleShoppingRowClick);
      
      // Add new listener
      row.addEventListener('click', (event) => {
        console.log("🔍 DEBUG: Shopping row clicked, ID:", shoppingId);
        console.log("🔍 DEBUG: Calling showShoppingDetail with ID:", shoppingId);
        this.showShoppingDetail(shoppingId, event);
      });
    });
    
    console.log("🔧 Shopping row event listeners setup complete");
  }

  // Render individual shopping row
  renderShoppingRow(shopping, index) {
    // Use topik_belanja instead of shopping ID
    const shoppingTopic = shopping.topik_belanja || `Belanja ${index}`;
    const statusClass = shopping.status === "Selesai" ? "completed" : "planned";
    const statusText = shopping.status || "Direncanakan";

    return `
      <tr class="shopping-row" data-id="${
        shopping.id_shoppinglog
      }" data-shopping-id="${shopping.id_shoppinglog}" style="cursor: pointer;">
        <td>
          <span class="shopping-topic">${shoppingTopic}</span>
        </td>
        <td>
          <span class="shopping-date">${this.formatDate(
            shopping.tanggal_belanja
          )}</span>
        </td>
        <td class="text-right">
          <span class="shopping-amount">${this.formatCurrency(
            shopping.total_belanja || 0
          )}</span>
        </td>
        <td class="text-center">
          <span class="shopping-items-count">${
            shopping.shoppingDetails?.length || 0
          }</span>
        </td>
        <td class="text-center">
          <span class="shopping-status ${statusClass}">${statusText}</span>
        </td>
        <td class="text-center">
          <div class="shopping-actions" onclick="event.stopPropagation();">
            <button class="btn-edit-small" onclick="shoppingLogManager.editShopping(${
              shopping.id_shoppinglog
            })" title="Edit">
              ✏️
            </button>
          </div>
        </td>
      </tr>
    `;
  }

  // Edit shopping log
  editShopping(id) {
    const shopping = this.shoppingLogs.find((s) => s.id_shoppinglog === id);
    if (shopping) {
      console.log("Found shopping log for edit:", shopping);
      this.openShoppingModal(shopping);
    } else {
      console.error("Shopping log not found with ID:", id);
      this.showError("Data belanja tidak ditemukan");
    }
  }

  // Show shopping detail page
  async showShoppingDetail(id, event) {
    // Prevent any event bubbling that might interfere
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    console.log("🔍 DEBUG: showShoppingDetail called with ID:", id);
    console.log("🔍 DEBUG: ID type:", typeof id);
    console.log("🔍 DEBUG: ID is valid number:", !isNaN(id) && id > 0);
    
    // Validate ID
    if (isNaN(id) || id <= 0) {
      console.error("❌ Invalid shopping ID received:", id);
      this.showError("ID shopping tidak valid");
      return;
    }
    
    const shopping = this.shoppingLogs.find((s) => s.id_shoppinglog === id);
    if (!shopping) {
      console.error("❌ Shopping not found with ID:", id);
      console.log("🔍 DEBUG: Available shopping logs:", this.shoppingLogs.map(s => ({
        id: s.id_shoppinglog,
        topik: s.topik_belanja
      })));
      this.showError("Data shopping tidak ditemukan");
      return;
    }

    console.log("🔍 DEBUG: Found shopping data:", shopping);
    console.log("🔍 DEBUG: Opening shopping detail page for:", shopping);

    try {
      // Store current shopping data for the detail page (in memory only)
      window.currentShoppingDetail = {
        ...shopping,
        id: shopping.id_shoppinglog,
      };

      console.log("🔍 DEBUG: Stored shopping detail data in memory");
      console.log("🔍 DEBUG: Calling app.showSection('shopping-detail')");

      // Switch to shopping detail page
      if (window.app) {
        window.app.showSection("shopping-detail");
        console.log("🔍 DEBUG: showSection called successfully");

        // Load and display the shopping details
        console.log("🔍 DEBUG: Loading shopping detail page with ID:", shopping.id_shoppinglog);
        await this.loadShoppingDetailPage(shopping.id_shoppinglog);
        console.log("🔍 DEBUG: Shopping detail page loaded successfully");
      } else {
        console.error("❌ window.app not found!");
      }
    } catch (error) {
      console.error("❌ Error showing shopping detail:", error);
      this.showError("Gagal memuat detail shopping: " + error.message);
    }
  }

  // Load shopping detail page
  async loadShoppingDetailPage(shoppingLogId) {
    try {
      console.log("Loading shopping detail page for ID:", shoppingLogId);

      const shopping = window.currentShoppingDetail;
      if (!shopping) {
        throw new Error("Shopping data not found");
      }

      // Update page header
      const dateInfoElement = document.getElementById("shoppingDetailDate");
      const dayInfoElement = document.getElementById("shoppingDetailDay");
      const subtitleElement = document.getElementById("shoppingItemsSubtitle");

      if (dateInfoElement) {
        dateInfoElement.textContent = `Belanja - ${shopping.topik_belanja}`;
      }

      if (dayInfoElement) {
        dayInfoElement.textContent = `${shopping.nama_toko} - ${this.formatDate(
          shopping.tanggal_belanja
        )}`;
      }

      // Update shopping items subtitle with correct data
      if (subtitleElement) {
        subtitleElement.textContent = `${shopping.topik_belanja} - ${shopping.nama_toko}`;
        console.log("✅ Updated shopping items subtitle:", subtitleElement.textContent);
      }

      // Load shopping details/items from API first
      const response = await this.apiService.getShoppingDetails(shoppingLogId);

      if (response.success) {
        const shoppingDetails = response.data || [];
        console.log("Shopping details loaded:", shoppingDetails);

        // IMPORTANT: Update the shopping details in memory to keep data consistent
        if (window.currentShoppingDetail) {
          window.currentShoppingDetail.shoppingDetails = shoppingDetails;
          console.log("✅ Shopping details updated in memory:", shoppingDetails.length, "items");
        }

        // Render shopping details/items
        this.renderShoppingDetailItems(shoppingDetails);

        // Update totals
        this.updateShoppingDetailTotals(shoppingDetails);
      } else {
        console.warn("No shopping details found, showing empty list");
        
        // IMPORTANT: Also update memory when no data found
        if (window.currentShoppingDetail) {
          window.currentShoppingDetail.shoppingDetails = [];
          console.log("✅ Shopping details cleared in memory (no data found)");
        }
        
        this.renderShoppingDetailItems([]);
        this.updateShoppingDetailTotals([]);
      }

      // Setup form handler AFTER DOM is ready - use setTimeout to ensure DOM is fully rendered
      setTimeout(() => {
        console.log("Setting up form handlers after DOM render...");
        this.setupShoppingDetailForm(shoppingLogId);
      }, 100);
    } catch (error) {
      console.error("Error loading shopping detail page:", error);
      this.showError("Gagal memuat detail shopping: " + error.message);
    }
  }

  // Setup form handler for shopping detail page
  setupShoppingDetailForm(shoppingLogId) {
    console.log(
      "Setting up shopping detail form for shopping log ID:",
      shoppingLogId
    );

    const form = document.getElementById("addShoppingDetailItemForm");
    if (!form) {
      console.error("Shopping detail form not found - checking DOM...");
      // Debug: Check if form exists with different ID
      const allForms = document.querySelectorAll("form");
      console.log("All forms found:", allForms);
      allForms.forEach((f, i) => {
        console.log(`Form ${i}:`, f.id, f.className);
      });
      return;
    }

    console.log("Form found:", form);

    // Add debug event listener for dropdown satuan
    const unitSelect = form.querySelector('#itemUnit');
    if (unitSelect) {
      console.log("✅ Unit dropdown found:", unitSelect);
      
      // Debug computed styles
      const computedStyles = window.getComputedStyle(unitSelect);
      console.log("🎨 Computed styles:", {
        color: computedStyles.color,
        backgroundColor: computedStyles.backgroundColor,
        fontSize: computedStyles.fontSize,
        visibility: computedStyles.visibility,
        opacity: computedStyles.opacity,
        textIndent: computedStyles.textIndent,
        lineHeight: computedStyles.lineHeight,
        height: computedStyles.height
      });
      
      // Force visual refresh function
      const forceRefresh = () => {
        unitSelect.style.color = '#333';
        unitSelect.style.backgroundColor = '#fff';
        unitSelect.style.fontSize = '14px';
        unitSelect.style.visibility = 'visible';
        unitSelect.style.opacity = '1';
        console.log("🔄 Forced visual refresh applied");
      };
      
      // Apply initial refresh
      forceRefresh();
      
      // Add change event listener
      unitSelect.addEventListener('change', function(e) {
        console.log('🔍 DEBUG: Dropdown satuan changed to:', e.target.value);
        console.log('🔍 DEBUG: Selected option text:', e.target.options[e.target.selectedIndex]?.text);
        console.log('🔍 DEBUG: Selected index:', e.target.selectedIndex);
        
        // Force refresh after change
        setTimeout(forceRefresh, 10);
        
        // Debug all options
        console.log('🔍 DEBUG: All options:', Array.from(e.target.options).map((opt, idx) => ({
          index: idx,
          value: opt.value,
          text: opt.text,
          selected: opt.selected
        })));
      });
      
      // Add focus event listener
      unitSelect.addEventListener('focus', function(e) {
        console.log('🔍 DEBUG: Dropdown satuan focused, current value:', e.target.value);
        forceRefresh();
      });
      
      // Add blur event listener
      unitSelect.addEventListener('blur', function(e) {
        console.log('🔍 DEBUG: Dropdown satuan blurred, final value:', e.target.value);
        forceRefresh();
      });
      
      // Monitor for any style changes
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
            console.log('🔍 DEBUG: Style changed on dropdown');
            forceRefresh();
          }
        });
      });
      
      observer.observe(unitSelect, { attributes: true, attributeFilter: ['style'] });
      
    } else {
      console.error("❌ Unit dropdown not found in form");
    }

    // FORCE remove existing event listeners - do NOT clone, just remove listeners
    form.removeEventListener("submit", this.formSubmitHandler);

    // Create bound handler function
    this.formSubmitHandler = async (e) => {
      console.log("🔥 FORM SUBMIT TRIGGERED - Shopping detail form");
      e.preventDefault();
      e.stopPropagation();
      console.log("Event prevented, calling handleAddDetailItem...");
      await this.handleAddDetailItem(e, shoppingLogId);
    };

    // Add new listener
    form.addEventListener("submit", this.formSubmitHandler);

    // FORCE setup submit button click handler as backup
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
      console.log("Setting up submit button click handler");

      // Remove existing click listeners
      submitBtn.removeEventListener("click", this.buttonClickHandler);

      // Create bound click handler
      this.buttonClickHandler = async (e) => {
        console.log("🔥 SUBMIT BUTTON CLICKED - Shopping detail form");
        e.preventDefault();
        e.stopPropagation();

        // Get form data directly and call handler
        console.log("Calling handleAddDetailItem directly from button...");
        await this.handleAddDetailItem(e, shoppingLogId);
      };

      submitBtn.addEventListener("click", this.buttonClickHandler);
    }

    console.log("✅ Shopping detail form handler setup complete");
  }

  // Handle adding item from detail page
  async handleAddDetailItem(e, shoppingLogId) {
    e.preventDefault();
    e.stopPropagation();

    console.log("🔥🔥🔥 HANDLE ADD DETAIL ITEM CALLED 🔥🔥🔥");
    console.log("Shopping Log ID:", shoppingLogId);
    console.log("API Service available:", !!this.apiService);
    console.log(
      "createShoppingDetail method:",
      !!this.apiService?.createShoppingDetail
    );

    // Get form directly by ID, not from event target
    const form = document.getElementById("addShoppingDetailItemForm");
    if (!form) {
      console.error("❌ Form not found by ID!");
      this.showError("Form tidak ditemukan");
      return;
    }

    console.log("✅ Form found:", form);

    // Get form data directly from form elements
    const namaItem = form
      .querySelector('input[name="nama_item"]')
      ?.value?.trim();
    const jumlahItem = parseFloat(
      form.querySelector('input[name="jumlah_item"]')?.value
    );
    const satuan = form.querySelector('select[name="satuan"]')?.value;
    const harga =
      parseFloat(form.querySelector('input[name="harga"]')?.value) || 0;

    const itemData = {
      nama_item: namaItem,
      jumlah_item: jumlahItem,
      satuan: satuan,
      harga: harga,
      catatan: null,
      is_checked: false,
    };

    console.log("📋 Form data extracted:", itemData);
    console.log("📋 Form validation:", {
      nama_item: !!itemData.nama_item,
      jumlah_item: !isNaN(itemData.jumlah_item) && itemData.jumlah_item > 0,
      satuan: !!itemData.satuan,
      harga: !isNaN(itemData.harga),
    });

    // Validate form data
    if (!itemData.nama_item) {
      this.showError("Nama item harus diisi");
      return;
    }

    if (
      !itemData.jumlah_item ||
      isNaN(itemData.jumlah_item) ||
      itemData.jumlah_item <= 0
    ) {
      this.showError("Jumlah item harus lebih dari 0");
      return;
    }

    if (!itemData.satuan) {
      this.showError("Satuan harus dipilih");
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn?.textContent || "Tambah Item";

    try {
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Menambahkan...";
      }

      console.log("🚀 Calling API createShoppingDetail...");
      console.log(
        "🚀 URL will be:",
        `${this.apiService.baseURL}/shopping/${shoppingLogId}/details`
      );

      // Wrap item data in items array as expected by API
      const apiPayload = {
        items: [itemData],
      };

      console.log("🚀 Payload:", JSON.stringify(apiPayload, null, 2));

      // Call API to create shopping detail
      const response = await this.apiService.createShoppingDetail(
        shoppingLogId,
        apiPayload
      );

      console.log("📡 API Response:", response);

      if (response.success) {
        console.log("✅ Item added successfully:", response.data);

        // Reset form
        form.reset();

        // Reload shopping details
        await this.loadShoppingDetailPage(shoppingLogId);

        this.showSuccess("Item berhasil ditambahkan!");
      } else {
        throw new Error(response.message || "Gagal menambahkan item");
      }
    } catch (error) {
      console.error("❌ Error adding item:", error);
      console.error("❌ Error stack:", error.stack);
      this.showError("Gagal menambahkan item: " + error.message);
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    }
  }

  // Render shopping detail items
  renderShoppingDetailItems(items) {
    const checklistContainer = document.getElementById("shoppingChecklist");
    if (!checklistContainer) {
      console.error("Shopping checklist container not found");
      return;
    }

    console.log("🔍 DEBUG: Rendering items:", items);
    items.forEach((item, index) => {
      console.log(`🔍 Item ${index}:`, {
        nama_item: item.nama_item,
        jumlah_item: item.jumlah_item,
        satuan: item.satuan,
        harga: item.harga,
        full_item: item
      });
    });

    if (items.length === 0) {
      checklistContainer.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-shopping-cart"></i>
          <p>Belum ada item shopping</p>
          <small>Gunakan form di atas untuk menambahkan item pertama</small>
        </div>
      `;
      return;
    }

    const editingId = this.currentEditingDetailId;
    const itemsHtml = items
      .map((item) => {
        const isChecked = item.is_checked === true || item.is_checked === 1;
        const checkedClass = isChecked ? "checked" : "";
        if (editingId === item.id_shoppingDetail) {
          // Render inline edit form
          return `
        <form class="checklist-item edit-mode ${checkedClass}" data-id="${
            item.id_shoppingDetail
          }" onsubmit="shoppingLogManager.submitEditItem(event, ${
            item.id_shoppingDetail
          })">
          <div class="item-checkbox">
            <input type="checkbox" id="item-${item.id_shoppingDetail}" ${
            isChecked ? "checked" : ""
          } disabled>
            <label for="item-${item.id_shoppingDetail}"></label>
          </div>
          <div class="item-info">
            <input type="text" name="nama_item" value="${
              item.nama_item
            }" required class="edit-input" placeholder="Nama item">
            <div class="item-details">
              <input type="number" name="jumlah_item" value="${
                item.jumlah_item
              }" min="1" required class="edit-input" style="width:60px;"> 
              <select name="satuan" class="edit-input">
                ${[
                  "Kilogram",
                  "Gram",
                  "Liter",
                  "Mililiter",
                  "Pieces",
                  "Pack",
                  "Botol",
                  "Kaleng",
                  "Dus",
                ]
                  .map(
                    (s) =>
                      `<option value="${s}" ${
                        item.satuan === s ? "selected" : ""
                      }>${s}</option>`
                  )
                  .join("")}
              </select>
              <input type="number" name="harga" value="${
                item.harga || 0
              }" min="0" required class="edit-input" style="width:90px;"> 
            </div>
            ${
              item.catatan ? `<div class="item-note">${item.catatan}</div>` : ""
            }
          </div>
          <div class="item-actions">
            <button type="submit" class="btn-save-item" title="Simpan"><i class="fas fa-check"></i></button>
            <button type="button" class="btn-cancel-item" onclick="shoppingLogManager.cancelEditItem()" title="Batal"><i class="fas fa-times"></i></button>
          </div>
        </form>
        `;
        } else {
          // Normal display
          const itemHtml = `
        <div class="checklist-item ${checkedClass}" data-id="${
            item.id_shoppingDetail
          }">
          <div class="item-checkbox">
            <input type="checkbox" id="item-${item.id_shoppingDetail}" 
                   ${isChecked ? "checked" : ""} 
                   onchange="shoppingLogManager.toggleItemCheck(${
                     item.id_shoppingDetail
                   }, this.checked)">
            <label for="item-${item.id_shoppingDetail}"></label>
          </div>
          <div class="item-info">
            <div class="item-name">${item.nama_item}</div>
            <div class="item-details">
              <span class="item-quantity">${item.jumlah_item} ${
            item.satuan
          }</span>
              <span class="item-price">${this.formatCurrency(
                item.harga || 0
              )}</span>
            </div>
            ${
              item.catatan ? `<div class="item-note">${item.catatan}</div>` : ""
            }
          </div>
          <div class="item-actions">
            <button class="btn-edit-item" onclick="shoppingLogManager.editItem(${
              item.id_shoppingDetail
            })" title="Edit Item">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn-delete-item" onclick="shoppingLogManager.deleteItem(${
              item.id_shoppingDetail
            })" title="Hapus Item">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
        `;
          console.log(`🔍 Generated HTML for ${item.nama_item}:`, itemHtml);
          return itemHtml;
        }
      })
      .join("");
    checklistContainer.innerHTML = itemsHtml;
    console.log("Shopping detail items rendered:", items.length);
  }

  // Update shopping detail totals
  updateShoppingDetailTotals(items) {
    const totalItems = items.length;
    const totalPrice = items.reduce((sum, item) => sum + (item.harga || 0), 0);

    const totalItemsElement = document.getElementById("totalItemsCount");
    const totalPriceElement = document.getElementById("totalShoppingPrice");

    if (totalItemsElement) {
      totalItemsElement.textContent = totalItems;
    }

    if (totalPriceElement) {
      totalPriceElement.textContent = this.formatCurrency(totalPrice);
    }
  }

  // Toggle item check status
  async toggleItemCheck(itemId, isChecked) {
    try {
      console.log("Toggling item check:", itemId, isChecked);

      const response = await this.apiService.updateShoppingDetail(itemId, {
        is_checked: isChecked,
      });

      if (response.success) {
        console.log("Item check status updated successfully");

        // Update the visual state
        const itemElement = document.querySelector(`[data-id="${itemId}"]`);
        if (itemElement) {
          if (isChecked) {
            itemElement.classList.add("checked");
          } else {
            itemElement.classList.remove("checked");
          }
        }
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error("Error updating item check status:", error);
      this.showError("Gagal mengupdate status item: " + error.message);

      // Revert checkbox state
      const checkbox = document.getElementById(`item-${itemId}`);
      if (checkbox) {
        checkbox.checked = !isChecked;
      }
    }
  }

  // Edit item
  editItem(itemId) {
    console.log("🔧 editItem called for itemId:", itemId);
    this.currentEditingDetailId = itemId;
    // Rerender to show inline form
    const currentShopping = window.currentShoppingDetail;
    if (currentShopping) {
      console.log("🔧 editItem - currentShopping.shoppingDetails length:", currentShopping.shoppingDetails?.length || 0);
      this.renderShoppingDetailItems(currentShopping.shoppingDetails || []);
    } else {
      console.error("🔧 editItem - currentShopping not found!");
    }
  }

  // Cancel edit
  cancelEditItem() {
    console.log("🔧 cancelEditItem called");
    this.currentEditingDetailId = null;
    const currentShopping = window.currentShoppingDetail;
    if (currentShopping) {
      console.log("🔧 cancelEditItem - currentShopping.shoppingDetails length:", currentShopping.shoppingDetails?.length || 0);
      this.renderShoppingDetailItems(currentShopping.shoppingDetails || []);
    } else {
      console.error("🔧 cancelEditItem - currentShopping not found!");
    }
  }

  // Submit edit form
  async submitEditItem(event, itemId) {
    event.preventDefault();
    console.log("[submitEditItem] called for itemId:", itemId, "this:", this);
    const form = event.target;
    const data = {
      nama_item: form.nama_item.value,
      jumlah_item: Number(form.jumlah_item.value),
      satuan: form.satuan.value,
      harga: Number(form.harga.value),
    };
    await this.updateItem(itemId, data);
    this.currentEditingDetailId = null;
  }

  // Update item
  async updateItem(itemId, itemData) {
    try {
      console.log("Updating item:", itemId, itemData);

      const response = await this.apiService.updateShoppingDetail(
        itemId,
        itemData
      );

      if (response.success) {
        console.log("Item updated successfully");
        this.showSuccess("Item berhasil diupdate!");
        // Reset editing state and reload list
        this.currentEditingDetailId = null;
        const currentShopping = window.currentShoppingDetail;
        if (currentShopping) {
          await this.loadShoppingDetailPage(currentShopping.id);
        }
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error("Error updating item:", error);
      this.showError("Gagal mengupdate item: " + error.message);
    }
  }

  // Delete item
  async deleteItem(itemId) {
    if (!confirm("Apakah Anda yakin ingin menghapus item ini?")) {
      return;
    }

    try {
      console.log("Deleting item with ID:", itemId);

      const response = await this.apiService.deleteShoppingDetail(itemId);
      console.log("Delete API response:", response);

      // Check if the response indicates success
      if (
        response &&
        (response.success ||
          response.message === "Shopping detail berhasil dihapus")
      ) {
        console.log("Item deleted successfully");
        this.showSuccess("Item berhasil dihapus!");

        // Reload the shopping detail page
        const currentShopping = window.currentShoppingDetail;
        if (currentShopping) {
          await this.loadShoppingDetailPage(currentShopping.id);
        }
      } else {
        throw new Error(response?.message || "Gagal menghapus item");
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      this.showError("Gagal menghapus item: " + error.message);
    }
  }

  // Open add item modal
  openAddItemModal() {
    console.log("Opening add item modal");

    try {
      // Check if we have shopping detail data
      const currentShopping = window.currentShoppingDetail;
      if (!currentShopping) {
        this.showError(
          "Data shopping tidak ditemukan. Silakan kembali ke daftar belanja."
        );
        return;
      }

      console.log("Current shopping data:", currentShopping);

      // For now, using enhanced prompts with better validation
      let itemName;
      while (!itemName || itemName.trim() === "") {
        itemName = prompt("Nama item:");
        if (itemName === null) {
          console.log("User cancelled add item");
          return; // User cancelled
        }
        if (!itemName.trim()) {
          alert("Nama item tidak boleh kosong!");
        }
      }

      let quantity;
      while (!quantity || isNaN(quantity) || quantity <= 0) {
        const qtyInput = prompt("Jumlah:");
        if (qtyInput === null) {
          console.log("User cancelled add item");
          return; // User cancelled
        }
        quantity = parseInt(qtyInput);
        if (isNaN(quantity) || quantity <= 0) {
          alert("Jumlah harus berupa angka positif!");
        }
      }

      let unit;
      while (!unit || unit.trim() === "") {
        unit = prompt("Satuan (pcs, kg, liter, dll):");
        if (unit === null) {
          console.log("User cancelled add item");
          return; // User cancelled
        }
        if (!unit.trim()) {
          alert("Satuan tidak boleh kosong!");
        }
      }

      const priceInput = prompt(
        "Harga per satuan (opsional, kosongkan jika belum tahu):"
      );
      let price = 0;
      if (priceInput && priceInput.trim() !== "") {
        price = parseFloat(priceInput);
        if (isNaN(price)) {
          price = 0;
        }
      }

      const note = prompt("Catatan (opsional):");

      const itemData = {
        nama_item: itemName.trim(),
        jumlah_item: quantity,
        satuan: unit.trim(),
        harga: price,
        is_checked: false,
        catatan: note && note.trim() !== "" ? note.trim() : null,
      };

      console.log("Adding item with data:", itemData);

      // Show loading message
      this.showSuccess("Menambahkan item...");

      // Add the item
      this.addItem(itemData);
    } catch (error) {
      console.error("Error in openAddItemModal:", error);
      this.showError("Gagal membuka form tambah item: " + error.message);
    }
  }

  // Add new item
  async addItem(itemData) {
    try {
      const currentShopping = window.currentShoppingDetail;
      if (!currentShopping) {
        throw new Error("Shopping data not found");
      }

      console.log("=== ADD ITEM DEBUG ===");
      console.log("Adding item to shopping ID:", currentShopping.id);
      console.log("Item data:", itemData);
      console.log("API Service available:", !!this.apiService);
      console.log(
        "createShoppingDetail method available:",
        !!this.apiService?.createShoppingDetail
      );

      // Validate item data
      if (!itemData.nama_item || !itemData.jumlah_item || !itemData.satuan) {
        throw new Error("Data item tidak lengkap");
      }

      console.log("About to call API...");
      console.log("URL will be: /shopping/" + currentShopping.id + "/details");
      console.log("Payload:", JSON.stringify(itemData, null, 2));

      const response = await this.apiService.createShoppingDetail(
        currentShopping.id,
        itemData
      );
      console.log("=== API RESPONSE ===");
      console.log("Create shopping detail response:", response);

      if (response.success) {
        console.log("Item added successfully:", response.data);
        this.showSuccess("Item berhasil ditambahkan!");

        // Reload the shopping detail page to show the new item
        console.log("Reloading shopping detail page...");
        await this.loadShoppingDetailPage(currentShopping.id);
      } else {
        console.error("Failed to add item:", response.message);
        throw new Error(response.message || "Gagal menambahkan item");
      }
    } catch (error) {
      console.error("=== ADD ITEM ERROR ===");
      console.error("Error adding item:", error);
      console.error("Error stack:", error.stack);
      this.showError("Gagal menambahkan item: " + error.message);
    }
  }

  // Save shopping list (update status to completed)
  async saveShoppingList() {
    try {
      const currentShopping = window.currentShoppingDetail;
      if (!currentShopping) {
        throw new Error("Shopping data not found");
      }

      console.log("Saving shopping list:", currentShopping.id);

      // Get current receipt if uploaded
      const receiptInput = document.getElementById("receiptUpload");
      let struk = null;

      if (receiptInput && receiptInput.files.length > 0) {
        // For now, just get the file name, you can implement actual file upload later
        struk = receiptInput.files[0].name;
        console.log("Receipt file:", struk);
      }

      // Calculate total from items
      const response = await this.apiService.getShoppingDetails(
        currentShopping.id
      );
      let totalBelanja = 0;

      if (response.success && response.data) {
        totalBelanja = response.data.reduce(
          (sum, item) => sum + (item.harga || 0),
          0
        );
      }

      // Update shopping log status to "Selesai"
      const updateData = {
        status: "Selesai",
        total_belanja: totalBelanja,
        struk: struk,
      };

      const updateResponse = await this.apiService.updateShoppingLog(
        currentShopping.id,
        updateData
      );

      if (updateResponse.success) {
        this.showSuccess(
          "Shopping list berhasil disimpan dan status diubah menjadi Selesai!"
        );

        // Update the stored shopping detail
        window.currentShoppingDetail.status = "Selesai";
        window.currentShoppingDetail.total_belanja = totalBelanja;
        localStorage.setItem(
          "currentShoppingDetail",
          JSON.stringify(window.currentShoppingDetail)
        );

        // Refresh the main shopping list
        await this.loadShoppingLogs();

        // Update dashboard if available
        if (window.app) {
          window.app.updateDashboard();
          window.app.updateShoppingSummary();
        }
      } else {
        throw new Error(updateResponse.message);
      }
    } catch (error) {
      console.error("Error saving shopping list:", error);
      this.showError("Gagal menyimpan shopping list: " + error.message);
    }
  }

  // Save draft shopping (keep status as "Direncanakan")
  async saveDraftShopping() {
    try {
      const currentShopping = window.currentShoppingDetail;
      if (!currentShopping) {
        throw new Error("Shopping data not found");
      }

      console.log("Saving shopping draft:", currentShopping.id);

      // Get current receipt if uploaded
      const receiptInput = document.getElementById("receiptUpload");
      let struk = null;

      if (receiptInput && receiptInput.files.length > 0) {
        struk = receiptInput.files[0].name;
        console.log("Receipt file:", struk);
      }

      // Calculate total from items
      const response = await this.apiService.getShoppingDetails(
        currentShopping.id
      );
      let totalBelanja = 0;

      if (response.success && response.data) {
        totalBelanja = response.data.reduce(
          (sum, item) => sum + (item.harga || 0),
          0
        );
      }

      // Update shopping log but keep status as "Direncanakan"
      const updateData = {
        status: "Direncanakan",
        total_belanja: totalBelanja,
        struk: struk,
      };

      const updateResponse = await this.apiService.updateShoppingLog(
        currentShopping.id,
        updateData
      );

      if (updateResponse.success) {
        this.showSuccess("Draft shopping berhasil disimpan!");

        // Update the stored shopping detail
        window.currentShoppingDetail.status = "Direncanakan";
        window.currentShoppingDetail.total_belanja = totalBelanja;
        localStorage.setItem(
          "currentShoppingDetail",
          JSON.stringify(window.currentShoppingDetail)
        );

        // Go back to shopping list
        window.backToShopping();

        // Refresh the main shopping list
        await this.loadShoppingLogs();

        // Update dashboard if available
        if (window.app) {
          window.app.updateDashboard();
          window.app.updateShoppingSummary();
        }
      } else {
        throw new Error(updateResponse.message);
      }
    } catch (error) {
      console.error("Error saving shopping draft:", error);
      this.showError("Gagal menyimpan draft shopping: " + error.message);
    }
  }

  // Finish shopping (update status to completed)
  async finishShopping() {
    try {
      const currentShopping = window.currentShoppingDetail;
      if (!currentShopping) {
        throw new Error("Shopping data not found");
      }

      console.log("Finishing shopping:", currentShopping.id);

      // Get current receipt if uploaded
      const receiptInput = document.getElementById("receiptUpload");
      let struk = null;

      if (receiptInput && receiptInput.files.length > 0) {
        struk = receiptInput.files[0].name;
        console.log("Receipt file:", struk);
      }

      // Calculate total from items
      const response = await this.apiService.getShoppingDetails(
        currentShopping.id
      );
      let totalBelanja = 0;

      if (response.success && response.data) {
        totalBelanja = response.data.reduce(
          (sum, item) => sum + (item.harga || 0),
          0
        );
      }

      // Update shopping log status to "Selesai"
      const updateData = {
        status: "Selesai",
        total_belanja: totalBelanja,
        struk: struk,
      };

      const updateResponse = await this.apiService.updateShoppingLog(
        currentShopping.id,
        updateData
      );

      if (updateResponse.success) {
        this.showSuccess("Belanja berhasil diselesaikan!");

        // Update the stored shopping detail
        window.currentShoppingDetail.status = "Selesai";
        window.currentShoppingDetail.total_belanja = totalBelanja;
        localStorage.setItem(
          "currentShoppingDetail",
          JSON.stringify(window.currentShoppingDetail)
        );

        // Go back to shopping list
        window.backToShopping();

        // Refresh the main shopping list
        await this.loadShoppingLogs();

        // Update dashboard if available
        if (window.app) {
          window.app.updateDashboard();
          window.app.updateShoppingSummary();
        }
      } else {
        throw new Error(updateResponse.message);
      }
    } catch (error) {
      console.error("Error finishing shopping:", error);
      this.showError("Gagal menyelesaikan belanja: " + error.message);
    }
  }

  // Update shopping summary
  updateShoppingSummary() {
    // Monthly summary
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const monthlyShopping = this.shoppingLogs.filter((shopping) => {
      // Skip entries with null or invalid dates
      if (!shopping.tanggal_belanja) {
        return false;
      }

      const shoppingDate = new Date(shopping.tanggal_belanja);

      // Check if date is valid
      if (isNaN(shoppingDate.getTime())) {
        return false;
      }

      return (
        shoppingDate.getMonth() === currentMonth &&
        shoppingDate.getFullYear() === currentYear
      );
    });

    const monthlyTotal = monthlyShopping.reduce(
      (sum, shopping) => sum + (shopping.total_belanja || 0),
      0
    );

    // Update summary display
    const totalElement = document.getElementById("monthlyTotal");
    if (totalElement) {
      totalElement.textContent = this.formatCurrency(monthlyTotal);
    }

    // Update daily average
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const averageDaily = monthlyTotal / daysInMonth;

    const averageElement = document.getElementById("dailyAverage");
    if (averageElement) {
      averageElement.textContent = this.formatCurrency(averageDaily);
    }
  }

  // Utility methods
  formatDate(dateString) {
    if (!dateString) {
      return "Tanggal tidak diatur"; // More user-friendly message
    }

    const date = new Date(dateString);

    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return "Tanggal tidak valid";
    }

    const options = {
      day: "numeric",
      month: "long",
      year: "numeric",
    };
    return date.toLocaleDateString("id-ID", options);
  }

  formatDateTime(dateString) {
    if (!dateString) return "-";

    const date = new Date(dateString);
    const options = {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Jakarta",
    };

    return date.toLocaleDateString("id-ID", options);
  }

  formatCurrency(amount) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  // Show success message
  showSuccess(message) {
    this.showToast(message, "success");
  }

  // Show error message
  showError(message) {
    this.showToast(message, "error");
  }

  // Show toast notification
  showToast(message, type = "info") {
    // Create toast element
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <div class="toast-content">
        <span class="toast-message">${message}</span>
      </div>
    `;

    // Add to page
    document.body.appendChild(toast);

    // Show toast
    setTimeout(() => toast.classList.add("show"), 100);

    // Remove toast after 3 seconds
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

//=== GLOBAL FUNCTIONS FOR SHOPPING DETAIL PAGE ===

// Global function to save shopping list
window.saveShoppingList = function () {
  console.log("saveShoppingList called");

  if (window.shoppingLogManager) {
    window.shoppingLogManager.saveShoppingList();
  } else {
    console.warn("ShoppingLogManager not yet initialized");
  }
};

// Global function to save shopping draft
window.saveDraftShopping = function () {
  console.log("saveDraftShopping called");

  if (window.shoppingLogManager) {
    window.shoppingLogManager.saveDraftShopping();
  } else {
    console.warn("ShoppingLogManager not yet initialized");
  }
};

// Global function to finish shopping
window.finishShopping = function () {
  console.log("finishShopping called");

  if (window.shoppingLogManager) {
    window.shoppingLogManager.finishShopping();
  } else {
    console.warn("ShoppingLogManager not yet initialized");
  }
};

// Global debug function to test add item form
window.debugAddItemForm = function () {
  console.log("=== DEBUG ADD ITEM FORM ===");
  const form = document.getElementById("addShoppingDetailItemForm");
  console.log("Form found:", !!form);

  if (form) {
    console.log("Form ID:", form.id);
    console.log("Form elements:", form.elements.length);

    // List all form elements
    Array.from(form.elements).forEach((element, index) => {
      console.log(`Element ${index}:`, {
        name: element.name,
        type: element.type,
        value: element.value,
      });
    });

    // Check submit button
    const submitBtn = form.querySelector('button[type="submit"]');
    console.log("Submit button found:", !!submitBtn);
    if (submitBtn) {
      console.log("Submit button text:", submitBtn.textContent);
    }
  }

  // Check shopping detail data
  console.log("Current shopping detail:", window.currentShoppingDetail);

  // Check shopping log manager
  console.log("Shopping log manager:", !!window.shoppingLogManager);
  if (window.shoppingLogManager) {
    console.log("API Service:", !!window.shoppingLogManager.apiService);
  }
};

// FORCE trigger add item form (for testing)
window.forceAddItem = function () {
  console.log("🔥 FORCE ADD ITEM TRIGGERED");

  const form = document.getElementById("addShoppingDetailItemForm");
  if (!form) {
    console.error("Form not found!");
    return;
  }

  // Fill form with test data
  const nameInput = form.querySelector('input[name="nama_item"]');
  const quantityInput = form.querySelector('input[name="jumlah_item"]');
  const unitSelect = form.querySelector('select[name="satuan"]');
  const priceInput = form.querySelector('input[name="harga"]');

  if (nameInput) nameInput.value = "Test Item";
  if (quantityInput) quantityInput.value = "1";
  if (unitSelect) unitSelect.value = "Pieces";
  if (priceInput) priceInput.value = "1000";

  console.log("Test data filled, triggering submit...");

  // Get shopping log ID
  const shoppingDetail = window.currentShoppingDetail;
  if (!shoppingDetail) {
    console.error("No current shopping detail!");
    return;
  }

  // Call handler directly
  if (window.shoppingLogManager) {
    const fakeEvent = {
      preventDefault: () => {},
      stopPropagation: () => {},
    };

    console.log(
      "🚀 Calling handleAddDetailItem with correct payload format..."
    );
    window.shoppingLogManager.handleAddDetailItem(fakeEvent, shoppingDetail.id);
  }
};

// Global function to handle receipt upload
window.handleReceiptUpload = function (event) {
  console.log("handleReceiptUpload called", event);

  const file = event.target.files[0];
  if (file) {
    console.log("Receipt file selected:", file.name);

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("File harus berupa gambar!");
      event.target.value = "";
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran file maksimal 5MB!");
      event.target.value = "";
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = function (e) {
      const preview = document.getElementById("receiptPreview");
      if (preview) {
        preview.innerHTML = `
          <div class="receipt-image">
            <img src="${
              e.target.result
            }" alt="Receipt Preview" style="max-width: 200px; max-height: 200px;">
            <button class="btn-remove-receipt" onclick="removeReceiptPreview()" title="Hapus">×</button>
            <div class="receipt-info">
              <small>${file.name} (${(file.size / 1024).toFixed(1)} KB)</small>
            </div>
          </div>
        `;
      }
    };
    reader.readAsDataURL(file);

    if (window.shoppingLogManager) {
      window.shoppingLogManager.showSuccess(
        "Struk berhasil diupload! Klik 'Simpan' untuk menyimpan ke shopping log."
      );
    }
  }
};

// Global function to remove receipt preview
window.removeReceiptPreview = function () {
  const preview = document.getElementById("receiptPreview");
  const input = document.getElementById("receiptUpload");

  if (preview) {
    preview.innerHTML = "";
  }

  if (input) {
    input.value = "";
  }

  console.log("Receipt preview removed");
};

//=== END GLOBAL FUNCTIONS ===

// Global function overrides
window.openShoppingModal = function () {
  console.log("openShoppingModal called - using API version");

  if (window.shoppingLogManager) {
    console.log("Opening modal via existing ShoppingLogManager");
    window.shoppingLogManager.openShoppingModal();
  } else {
    console.warn("ShoppingLogManager not yet initialized, please wait");
    setTimeout(() => {
      if (window.shoppingLogManager) {
        window.shoppingLogManager.openShoppingModal();
      }
    }, 100);
  }
};

// Global function to close shopping modal
window.closeCreateShoppingListModal = function () {
  console.log("closeCreateShoppingListModal called - using API version");

  if (window.shoppingLogManager) {
    console.log("Closing modal via existing ShoppingLogManager");
    window.shoppingLogManager.closeShoppingModal();
  } else {
    // Fallback: close modal directly
    const modal = document.getElementById("createShoppingListModal");
    if (modal) {
      modal.classList.remove("active");
      modal.style.display = "none";
    }
  }
};

// Global function to open shopping modal
window.openCreateShoppingListModal = function () {
  console.log("openCreateShoppingListModal called - using API version");

  if (window.shoppingLogManager) {
    console.log("Opening modal via existing ShoppingLogManager");
    window.shoppingLogManager.openShoppingModal();
  } else {
    console.warn("ShoppingLogManager not yet initialized, please wait");
    setTimeout(() => {
      if (window.shoppingLogManager) {
        window.shoppingLogManager.openShoppingModal();
      }
    }, 100);
  }
};

// Initialize Shopping Log Manager when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM loaded, initializing ShoppingLogManager");

  // Wait for API service to be ready
  const initializeShoppingLogManager = () => {
    if (window.apiService && !window.shoppingLogManager) {
      console.log("Creating single ShoppingLogManager instance");
      window.shoppingLogManager = new ShoppingLogManager();
      console.log("Shopping Log Manager instance created");

      // Always setup event listeners
      window.shoppingLogManager.setupEventListeners();

      console.log("Shopping event listeners setup complete");
    } else if (window.shoppingLogManager) {
      console.log("ShoppingLogManager already exists, skipping creation");
    } else {
      // Retry after a short delay if API service is not ready
      setTimeout(initializeShoppingLogManager, 100);
    }
  };

  initializeShoppingLogManager();
});

// Global debug function
window.debugShoppingLogs = function () {
  console.log("=== SHOPPING LOGS DEBUG ===");
  console.log("Manager exists:", !!window.shoppingLogManager);
  console.log("API Service exists:", !!window.apiService);
  console.log("Manager initialized:", window.shoppingLogManager?.isInitialized);
  console.log(
    "Event listeners setup:",
    window.shoppingLogManager?.eventListenersSetup
  );
  console.log(
    "Shopping logs count:",
    window.shoppingLogManager?.shoppingLogs?.length
  );
  console.log("Shopping logs data:", window.shoppingLogManager?.shoppingLogs);
  console.log("Current shopping detail:", window.currentShoppingDetail);

  const tableBody = document.getElementById("shoppingHistoryTableBody");
  console.log("Table body exists:", !!tableBody);
  console.log(
    "Table body content:",
    tableBody?.innerHTML?.length || 0,
    "characters"
  );

  const addButton = document.querySelector(
    'button[onclick*="openCreateShoppingListModal"]'
  );
  console.log("Add button exists:", !!addButton);
  console.log("Add button onclick:", addButton?.getAttribute("onclick"));

  const addItemButton = document.querySelector(
    'button[onclick*="openAddItemModal"]'
  );
  console.log("Add item button exists:", !!addItemButton);
  console.log(
    "Add item button onclick:",
    addItemButton?.getAttribute("onclick")
  );

  const checklistContainer = document.getElementById("shoppingChecklist");
  console.log("Checklist container exists:", !!checklistContainer);
  console.log(
    "Checklist container innerHTML length:",
    checklistContainer?.innerHTML?.length || 0
  );

  console.log("=== END DEBUG ===");
};
