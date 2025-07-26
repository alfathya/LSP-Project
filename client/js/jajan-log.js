// Jajan Log API Integration
class JajanLogManager {
  constructor() {
    this.apiService = window.apiService;
    this.jajanLogs = [];
    this.currentEditId = null;
    this.eventListenersSetup = false;
    this.isSubmitting = false;
    this.isInitialized = false;
  }

  // Initialize jajan log functionality
  async init() {
    // Prevent multiple initialization
    if (this.isInitialized) {
      console.log("JajanLogManager already initialized, skipping");
      return;
    }

    try {
      console.log("Initializing JajanLogManager...");
      this.isInitialized = true;

      // Clear localStorage jajan data to prevent conflicts with API data
      localStorage.removeItem("jajan");

      await this.loadJajanLogs();
      this.setupEventListeners();
      this.renderJajanLogs();
      this.updateJajanSummary();

      console.log("JajanLogManager initialization complete");
    } catch (error) {
      console.error("Error initializing Jajan Log Manager:", error);
      this.isInitialized = false; // Reset flag on error
      this.showError("Gagal memuat data jajan log");
    }
  }

  // Setup event listeners
  setupEventListeners() {
    // Prevent multiple setup
    if (this.eventListenersSetup) {
      console.log("Event listeners already set up, skipping");
      return;
    }

    console.log("Setting up Jajan Log event listeners");

    // Add jajan buttons - remove onclick attribute and add event listener
    const addJajanBtns = document.querySelectorAll(
      '.btn-add-jajan, button[onclick="openJajanFormModal()"]'
    );
    console.log("Found add jajan buttons:", addJajanBtns.length, addJajanBtns);

    addJajanBtns.forEach((btn, index) => {
      console.log(`Setting up button ${index}:`, btn);
      // Remove existing onclick attribute to avoid conflict
      btn.removeAttribute("onclick");

      // Remove any existing event listeners by cloning the button
      const newBtn = btn.cloneNode(true);
      btn.parentNode.replaceChild(newBtn, btn);

      // Use addEventListener only (remove onclick backup to prevent double execution)
      newBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log("Add jajan button clicked via addEventListener");
        this.openJajanModal();
      });
    });

    // Save jajan form
    const jajanForm = document.getElementById("jajanModalForm");
    if (jajanForm) {
      jajanForm.addEventListener("submit", (e) => this.handleSaveJajan(e));
    }

    // Close modal buttons
    const closeBtns = document.querySelectorAll("#jajanFormModal .modal-close");
    closeBtns.forEach((btn) => {
      btn.removeAttribute("onclick");
      btn.onclick = (e) => {
        e.preventDefault();
        this.closeJajanModal();
      };
    });

    // Cancel button
    const cancelBtns = document.querySelectorAll(
      "#jajanFormModal .btn-secondary"
    );
    cancelBtns.forEach((btn) => {
      btn.removeAttribute("onclick");
      btn.onclick = (e) => {
        e.preventDefault();
        this.closeJajanModal();
      };
    });

    // Modal background click
    const jajanModal = document.getElementById("jajanFormModal");
    if (jajanModal) {
      jajanModal.addEventListener("click", (e) => {
        if (e.target === jajanModal) {
          this.closeJajanModal();
        }
      });
    }

    // Jajan detail modal background click
    const jajanDetailModal = document.getElementById("jajanDetailModal");
    if (jajanDetailModal) {
      jajanDetailModal.addEventListener("click", (e) => {
        if (e.target === jajanDetailModal) {
          this.closeJajanDetailModal();
        }
      });
    }

    // Mark event listeners as set up
    this.eventListenersSetup = true;
    console.log("Event listeners setup complete");
  }

  // Load jajan logs from API
  async loadJajanLogs() {
    try {
      const response = await this.apiService.getJajanLogs();
      if (response.success) {
        this.jajanLogs = response.data;
        console.log("Jajan logs loaded:", this.jajanLogs);
        console.log("Jajan logs count:", this.jajanLogs.length);
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error("Error loading jajan logs:", error);
      // For now, use empty array if API fails
      this.jajanLogs = [];
    }
  }

  // Create new jajan log
  async createJajanLog(jajanData) {
    try {
      const response = await this.apiService.createJajanLog(jajanData);
      if (response.success) {
        await this.loadJajanLogs(); // Reload data
        this.renderJajanLogs();
        this.updateJajanSummary();

        // Update dashboard
        if (window.app) {
          window.app.updateDashboard();
          window.app.updateJajanSummary();
        }

        this.showSuccess("Jajan log berhasil ditambahkan!");
        return response.data;
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error("Error creating jajan log:", error);
      this.showError("Gagal menambahkan jajan log: " + error.message);
      throw error;
    }
  }

  // Update jajan log
  async updateJajanLog(id, jajanData) {
    try {
      const response = await this.apiService.updateJajanLog(id, jajanData);
      if (response.success) {
        await this.loadJajanLogs(); // Reload data
        this.renderJajanLogs();
        this.updateJajanSummary();

        // Update dashboard
        if (window.app) {
          window.app.updateDashboard();
          window.app.updateJajanSummary();
        }

        this.showSuccess("Jajan log berhasil diperbarui!");
        return response.data;
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error("Error updating jajan log:", error);
      this.showError("Gagal memperbarui jajan log: " + error.message);
      throw error;
    }
  }

  // Open jajan modal for create/edit
  openJajanModal(jajanData = null) {
    console.log("openJajanModal called with data:", jajanData);

    const modal = document.getElementById("jajanFormModal");
    const form = document.getElementById("jajanModalForm");
    const modalTitle = document.querySelector(
      "#jajanFormModal .modal-header h2"
    );

    console.log("Modal elements found:", {
      modal: !!modal,
      form: !!form,
      modalTitle: !!modalTitle,
    });

    if (!modal) {
      console.error("Modal element not found!");
      return;
    }

    if (jajanData) {
      // Edit mode
      console.log("Edit mode");
      this.currentEditId = jajanData.id_jajan;
      if (modalTitle) modalTitle.textContent = "Edit Jajan Log";
      this.populateJajanForm(jajanData);
    } else {
      // Create mode
      console.log("Create mode");
      this.currentEditId = null;
      if (modalTitle) modalTitle.textContent = "Tambah Data Jajan";
      if (form) form.reset();
      // Set default datetime to now
      const now = new Date();
      // Format to datetime-local input format (YYYY-MM-DDTHH:MM)
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const datetimeLocal = `${year}-${month}-${day}T${hours}:${minutes}`;

      const dateInput = document.getElementById("jajanTanggalModal");
      if (dateInput) {
        dateInput.value = datetimeLocal;
        console.log("Set default datetime:", datetimeLocal);
      }
    }

    console.log("Showing modal");
    // Use the correct CSS class to show modal
    modal.style.display = "flex";
    modal.classList.add("active");
    console.log("Modal classes after show:", modal.className);
  }

  // Close jajan modal
  closeJajanModal() {
    const modal = document.getElementById("jajanFormModal");
    if (modal) {
      modal.classList.remove("active");
      modal.style.display = "none";
      this.currentEditId = null;
      console.log("Modal closed and active class removed");
    }
  }

  // Populate form with jajan data for editing
  populateJajanForm(jajanData) {
    document.getElementById("jajanNamaModal").value =
      jajanData.nama_jajan || "";

    // Format datetime for datetime-local input
    const date = new Date(jajanData.tanggal);
    // Format to datetime-local input format (YYYY-MM-DDTHH:MM)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const datetimeLocal = `${year}-${month}-${day}T${hours}:${minutes}`;

    document.getElementById("jajanTanggalModal").value = datetimeLocal;

    // Set kategori directly since it matches the enum values
    document.getElementById("jajanKategoriModal").value =
      jajanData.kategori_jajan || "";

    document.getElementById("jajanTempatModal").value =
      jajanData.tempat_jajan || "";
    document.getElementById("jajanHargaModal").value =
      jajanData.harga_jajanan || "";

    // Handle foto if exists
    if (jajanData.foto) {
      const preview = document.getElementById("jajanPhotoModalPreview");
      preview.innerHTML = `<img src="${jajanData.foto}" alt="Foto jajan" style="max-width: 100px; max-height: 100px;">`;
    }
  }

  // Handle save jajan (create or update)
  async handleSaveJajan(e) {
    e.preventDefault();

    // Prevent double submission
    if (this.isSubmitting) {
      console.log("Already submitting, ignoring duplicate call");
      return;
    }

    this.isSubmitting = true;
    console.log("handleSaveJajan called");

    const formData = this.getJajanFormData();
    console.log("Form data:", formData);

    if (!this.validateJajanForm(formData)) {
      console.log("Form validation failed");
      this.isSubmitting = false;
      return;
    }

    const saveBtn = document.querySelector("#jajanModalForm .btn-primary");
    const originalText = saveBtn.textContent;
    saveBtn.textContent = "Menyimpan...";
    saveBtn.disabled = true;

    try {
      if (this.currentEditId) {
        console.log("Updating jajan log with ID:", this.currentEditId);
        // Update existing jajan log
        await this.updateJajanLog(this.currentEditId, formData);
      } else {
        console.log("Creating new jajan log");
        // Create new jajan log
        await this.createJajanLog(formData);
      }

      this.closeJajanModal();
    } catch (error) {
      console.error("Error saving jajan log:", error);
    } finally {
      saveBtn.textContent = originalText;
      saveBtn.disabled = false;
      this.isSubmitting = false;
    }
  }

  // Get form data
  getJajanFormData() {
    const formData = {
      nama_jajan: document.getElementById("jajanNamaModal").value.trim(),
      tanggal: document.getElementById("jajanTanggalModal").value,
      kategori_jajan: document.getElementById("jajanKategoriModal").value,
      tempat_jajan: document.getElementById("jajanTempatModal").value.trim(),
      harga_jajanan: document.getElementById("jajanHargaModal").value
        ? parseInt(document.getElementById("jajanHargaModal").value)
        : null,
      foto: document.getElementById("jajanPhotoModalUpload").files[0]
        ? URL.createObjectURL(
            document.getElementById("jajanPhotoModalUpload").files[0]
          )
        : null,
    };

    console.log("getJajanFormData result:", formData);
    return formData;
  }

  // Validate form data
  validateJajanForm(formData) {
    if (!formData.nama_jajan) {
      this.showError("Nama jajan harus diisi");
      return false;
    }

    if (!formData.tanggal) {
      this.showError("Tanggal harus diisi");
      return false;
    }

    if (!formData.kategori_jajan) {
      this.showError("Jenis jajan harus dipilih");
      return false;
    }

    if (!formData.tempat_jajan) {
      this.showError("Tempat jajan harus diisi");
      return false;
    }

    return true;
  }

  // Render jajan logs in the table
  renderJajanLogs() {
    const tableBody = document.getElementById("jajanHistoryTableBody");
    const emptyState = document.getElementById("jajanHistoryEmpty");

    if (!tableBody) return;

    if (this.jajanLogs.length === 0) {
      tableBody.innerHTML = "";
      if (emptyState) {
        emptyState.style.display = "block";
      }
      return;
    }

    if (emptyState) {
      emptyState.style.display = "none";
    }

    tableBody.innerHTML = this.jajanLogs
      .sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal))
      .map((jajan, index) => this.renderJajanRow(jajan, index + 1))
      .join("");
  }

  // Render individual jajan row
  renderJajanRow(jajan, index) {
    return `
            <tr class="jajan-row" data-id="${
              jajan.id_jajan
            }" onclick="jajanLogManager.showJajanDetail(${
      jajan.id_jajan
    })" style="cursor: pointer;">
                <td>${index}</td>
                <td>${this.formatDate(jajan.tanggal)}</td>
                <td>${jajan.nama_jajan}</td>
                <td>${this.formatKategori(jajan.kategori_jajan)}</td>
                <td>${jajan.tempat_jajan}</td>
                <td class="text-right">
                    <span class="jajan-price">Rp ${this.formatCurrency(
                      jajan.harga_jajanan || 0
                    )}</span>
                    <div class="jajan-actions" onclick="event.stopPropagation();">
                        <button class="btn-edit-small" onclick="jajanLogManager.editJajan(${
                          jajan.id_jajan
                        })" title="Edit">
                            ✏️
                        </button>
                    </div>
                </td>
            </tr>
        `;
  }

  // Edit jajan log
  editJajan(id) {
    const jajan = this.jajanLogs.find((j) => j.id_jajan === id);
    if (jajan) {
      this.openJajanModal(jajan);
    }
  }

  // Show jajan detail modal
  showJajanDetail(id) {
    const jajan = this.jajanLogs.find((j) => j.id_jajan === id);
    if (!jajan) {
      console.error("Jajan not found with ID:", id);
      return;
    }

    console.log("Showing detail for jajan:", jajan);

    // Populate detail modal
    document.getElementById("detailNamaJajan").textContent =
      jajan.nama_jajan || "-";
    document.getElementById("detailTanggalJajan").textContent = this.formatDate(
      jajan.tanggal
    );

    // Set kategori badge with data attribute for styling
    const kategoriElement = document.getElementById("detailKategoriJajan");
    kategoriElement.textContent = this.formatKategori(jajan.kategori_jajan);
    kategoriElement.setAttribute("data-kategori", jajan.kategori_jajan);
    kategoriElement.className = "kategori-badge";

    document.getElementById("detailTempatJajan").textContent =
      jajan.tempat_jajan || "-";
    document.getElementById(
      "detailHargaJajan"
    ).textContent = `Rp ${this.formatCurrency(jajan.harga_jajanan || 0)}`;

    // Handle photo
    const fotoElement = document.getElementById("detailFotoJajan");
    const fotoRow = document.getElementById("detailFotoRow");
    if (jajan.foto) {
      fotoElement.innerHTML = `<img src="${jajan.foto}" alt="Foto ${jajan.nama_jajan}">`;
      fotoRow.style.display = "flex";
    } else {
      fotoElement.innerHTML = '<span class="no-photo">Tidak ada foto</span>';
      fotoRow.style.display = "flex";
    }

    // Format created and updated dates
    document.getElementById("detailCreatedAt").textContent =
      this.formatDateTime(jajan.created_at);

    const updatedRow = document.getElementById("detailUpdatedRow");
    if (jajan.updated_at && jajan.updated_at !== jajan.created_at) {
      document.getElementById("detailUpdatedAt").textContent =
        this.formatDateTime(jajan.updated_at);
      updatedRow.style.display = "flex";
    } else {
      updatedRow.style.display = "none";
    }

    // Setup edit button
    const editBtn = document.getElementById("editJajanFromDetail");
    editBtn.onclick = () => {
      this.closeJajanDetailModal();
      setTimeout(() => {
        this.editJajan(id);
      }, 100);
    };

    // Show modal
    const modal = document.getElementById("jajanDetailModal");
    if (modal) {
      modal.style.display = "flex";
      modal.classList.add("active");
    }
  }

  // Close jajan detail modal
  closeJajanDetailModal() {
    const modal = document.getElementById("jajanDetailModal");
    if (modal) {
      modal.classList.remove("active");
      modal.style.display = "none";
    }
  }

  // Update jajan summary
  updateJajanSummary() {
    // Monthly summary
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const monthlyJajan = this.jajanLogs.filter((jajan) => {
      const jajanDate = new Date(jajan.tanggal);
      return (
        jajanDate.getMonth() === currentMonth &&
        jajanDate.getFullYear() === currentYear
      );
    });

    const monthlyTotal = monthlyJajan.reduce(
      (sum, jajan) => sum + (jajan.harga_jajanan || 0),
      0
    );

    // Update summary display
    const totalElement = document.getElementById("totalJajanBulanIni");
    if (totalElement) {
      totalElement.textContent = `Rp ${this.formatCurrency(monthlyTotal)}`;
    }
  }

  // Utility methods
  formatDate(dateString) {
    const date = new Date(dateString);
    const dateOptions = {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    };
    const timeOptions = {
      hour: "2-digit",
      minute: "2-digit",
    };

    const formattedDate = date.toLocaleDateString("id-ID", dateOptions);
    const formattedTime = date.toLocaleTimeString("id-ID", timeOptions);

    return `${formattedDate} ${formattedTime}`;
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

  formatTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  formatCurrency(amount) {
    return new Intl.NumberFormat("id-ID").format(amount);
  }

  formatKategori(kategori) {
    const kategoriMap = {
      Makanan_Berat: "Makanan Berat",
      Cemilan: "Cemilan",
      Minuman: "Minuman",
    };
    return kategoriMap[kategori] || kategori;
  }

  formatTipeMakan(kategori) {
    // For display purposes, we'll map kategori to tipe_makan
    const tipeMap = {
      Makanan_Berat: "Makan Berat",
      Cemilan: "Snack",
      Minuman: "Minuman",
    };
    return tipeMap[kategori] || kategori;
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

// Test function for debugging - can be called from browser console
window.testJajanModal = function () {
  console.log("Testing jajan modal");
  const modal = document.getElementById("jajanFormModal");
  console.log("Modal element:", modal);
  if (modal) {
    console.log("Modal current style.display:", modal.style.display);
    console.log("Modal current classes:", modal.className);
    modal.style.display = "flex";
    modal.classList.add("active");
    console.log("Modal style.display set to flex and active class added");
    console.log("Modal classes after:", modal.className);
  } else {
    console.error("Modal not found!");
  }
};

// Debug function to check buttons
window.debugJajanButtons = function () {
  const buttons = document.querySelectorAll(
    '.btn-add-jajan, button[onclick="openJajanFormModal()"]'
  );
  console.log("Found buttons:", buttons.length);
  buttons.forEach((btn, i) => {
    console.log(`Button ${i}:`, btn, "onclick:", btn.onclick);
  });
};

// Override existing jajan functions to use API
window.openJajanFormModal = function () {
  console.log("openJajanFormModal called - using API version");

  // Use existing instance or wait for it to be ready
  if (window.jajanLogManager) {
    console.log("Opening modal via existing JajanLogManager");
    window.jajanLogManager.openJajanModal();
  } else {
    console.warn("JajanLogManager not yet initialized, please wait");
    // Optionally, you could wait for it to be ready
    setTimeout(() => {
      if (window.jajanLogManager) {
        window.jajanLogManager.openJajanModal();
      }
    }, 100);
  }
};

window.closeJajanFormModal = function () {
  console.log("closeJajanFormModal called - using API version");
  if (window.jajanLogManager) {
    window.jajanLogManager.closeJajanModal();
  } else {
    // Fallback: hide modal directly
    const modal = document.getElementById("jajanFormModal");
    if (modal) {
      modal.classList.remove("active");
      modal.style.display = "none";
    }
  }
};

// Override app.js jajan functions
window.saveJajanFromModal = function () {
  console.log("saveJajanFromModal called - using API version");
  if (window.jajanLogManager) {
    const form = document.getElementById("jajanModalForm");
    if (form) {
      const event = new Event("submit");
      window.jajanLogManager.handleSaveJajan(event);
    }
  }
};

// Global function for closing jajan detail modal
window.closeJajanDetailModal = function () {
  console.log("closeJajanDetailModal called");
  if (window.jajanLogManager) {
    window.jajanLogManager.closeJajanDetailModal();
  } else {
    // Fallback: hide modal directly
    const modal = document.getElementById("jajanDetailModal");
    if (modal) {
      modal.classList.remove("active");
      modal.style.display = "none";
    }
  }
};

// Initialize Jajan Log Manager when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM loaded, checking for modal element");
  const modal = document.getElementById("jajanFormModal");
  console.log("Modal found on DOM load:", !!modal);

  // Wait for API service to be ready
  const initializeJajanLogManager = () => {
    if (window.apiService && !window.jajanLogManager) {
      console.log("Creating single JajanLogManager instance");
      window.jajanLogManager = new JajanLogManager();
      console.log("Jajan Log Manager instance created");

      // Always setup event listeners for buttons even if section is not active
      window.jajanLogManager.setupEventListeners();

      console.log("Event listeners setup complete");
    } else if (window.jajanLogManager) {
      console.log("JajanLogManager already exists, skipping creation");
    } else {
      // Retry after a short delay if API service is not ready
      setTimeout(initializeJajanLogManager, 100);
    }
  };

  initializeJajanLogManager();
});
