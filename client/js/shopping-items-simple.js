console.log("Shopping items simple script loaded");

class ShoppingItemsManager {
  constructor() {
    console.log("ShoppingItemsManager constructor called");
    this.currentShoppingLogId = null;
    this.addedItems = [];
    this.isSetup = false;
    window.shoppingItemsManager = this;
  }

  setupEventListeners() {
    // Delegated event listener for inline edit form submit (edit-mode)
    const listContainer = document.getElementById("shoppingItemsPageList");
    if (listContainer) {
      listContainer.addEventListener("submit", (e) => {
        const form = e.target;
        if (
          form.classList.contains("checklist-item") &&
          form.classList.contains("edit-mode")
        ) {
          e.preventDefault();
          e.stopPropagation();
          const itemId = form.getAttribute("data-id");
          window.shoppingItemsManager.submitEditItem(e, itemId);
        }
      });
    }
    console.log("Setting up event listeners");
    if (this.isSetup) return;

    this.isSetup = true;

    // Page form event listener
    const pageForm = document.getElementById("addShoppingItemPageForm");
    if (pageForm) {
      console.log("Found page form, setting up listener");
      pageForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleAddItemFromPage(e);
      });
    } else {
      console.error("Page form not found!");
    }
  }

  async initShoppingItemsPage() {
    console.log("=== INIT SHOPPING ITEMS PAGE ===");
    console.log("currentShoppingLogData:", window.currentShoppingLogData);

    if (!window.currentShoppingLogData) {
      console.error("No shopping log data available");
      if (window.app) {
        window.app.showSection("shopping");
      }
      return;
    }

    this.currentShoppingLogId = window.currentShoppingLogData.id;
    console.log("Set shopping log ID:", this.currentShoppingLogId);

    // Update page header
    const titleElement = document.getElementById("shoppingItemsTitle");
    const subtitleElement = document.getElementById("shoppingItemsSubtitle");

    if (titleElement) {
      titleElement.textContent = "Tambah Item Belanja";
    }
    if (subtitleElement) {
      subtitleElement.textContent = `${window.currentShoppingLogData.topik_belanja} - ${window.currentShoppingLogData.nama_toko}`;
    }

    // Setup event listeners
    this.setupEventListeners();

    // Load existing items
    await this.loadExistingItems();

    console.log("=== INIT COMPLETE ===");
  }

  async handleAddItemFromPage(e) {
    console.log("=== handleAddItemFromPage START ===");

    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    try {
      const formData = this.getItemFormDataFromPage();
      console.log("Form data:", formData);

      if (!this.validateItemForm(formData)) {
        console.log("Form validation failed");
        return false;
      }

      if (!this.currentShoppingLogId) {
        console.error("No shopping log ID available");
        this.showError("Tidak ada data shopping log yang tersedia");
        return false;
      }

      // Prepare data for API - the backend expects { items: [...] }
      const requestData = {
        items: [formData], // Backend expects an array of items
      };

      if (!window.apiService) {
        console.error("APIService not available!");
        this.showError("API Service tidak tersedia");
        return false;
      }

      // Call API with shopping log ID and request data
      const response = await window.apiService.post(
        `/shopping/${this.currentShoppingLogId}/details`,
        requestData
      );
      console.log("API response:", response);

      if (response.success) {
        // Add the new items to our local array
        if (Array.isArray(response.data)) {
          this.addedItems.push(...response.data);
        } else {
          this.addedItems.push(response.data);
        }

        this.resetPageForm();
        this.showSuccess("Item berhasil ditambahkan!");

        // Re-render the items list
        this.renderItemsList();

        console.log("Item added successfully");
      } else {
        throw new Error(response.message || "Failed to create item");
      }
    } catch (error) {
      console.error("Error adding shopping item:", error);
      this.showError("Gagal menambahkan item. Silakan coba lagi.");
    }

    console.log("=== handleAddItemFromPage END ===");
    return false;
  }

  getItemFormDataFromPage() {
    return {
      nama_item: document.getElementById("pageItemName").value.trim(),
      jumlah_item: parseFloat(
        document.getElementById("pageItemQuantity").value
      ),
      satuan: document.getElementById("pageItemUnit").value,
      harga: parseInt(document.getElementById("pageItemPrice").value),
    };
  }

  validateItemForm(data) {
    if (!data.nama_item || !data.jumlah_item || !data.satuan || !data.harga) {
      this.showError("Semua field harus diisi");
      return false;
    }
    return true;
  }

  resetPageForm() {
    const form = document.getElementById("addShoppingItemPageForm");
    if (form) {
      form.reset();
    }
  }

  showSuccess(message) {
    console.log("Success:", message);
    this.showNotification(message, "success");
  }

  showError(message) {
    console.log("Error:", message);
    this.showNotification(message, "error");
  }

  showNotification(message, type) {
    let notif = document.getElementById("shoppingItemsNotification");
    if (!notif) {
      notif = document.createElement("div");
      notif.id = "shoppingItemsNotification";
      notif.style.margin = "8px 0";
      notif.style.padding = "8px 16px";
      notif.style.borderRadius = "6px";
      notif.style.fontWeight = "bold";
      notif.style.fontSize = "15px";
      notif.style.maxWidth = "400px";
      notif.style.boxShadow = "0 2px 8px rgba(0,0,0,0.07)";
      const listContainer = document.getElementById("shoppingItemsPageList");
      if (listContainer && listContainer.parentNode) {
        listContainer.parentNode.insertBefore(notif, listContainer);
      } else {
        document.body.appendChild(notif);
      }
    }
    notif.textContent = message;
    notif.style.background = type === "success" ? "#e0ffe0" : "#ffe0e0";
    notif.style.color = type === "success" ? "#207520" : "#a00";
    notif.style.display = "block";
    setTimeout(() => {
      notif.style.display = "none";
    }, 2000);
  }

  async loadExistingItems() {
    console.log(
      "Loading existing items for shopping log:",
      this.currentShoppingLogId
    );

    try {
      if (!window.apiService) {
        console.error("APIService not available!");
        return;
      }

      const response = await window.apiService.get(
        `/shopping/${this.currentShoppingLogId}/details`
      );
      console.log("Loaded items response:", response);

      if (response.success && response.data) {
        this.addedItems = Array.isArray(response.data)
          ? response.data
          : [response.data];
        this.renderItemsList();
      } else {
        console.log("No existing items found or response failed");
        this.addedItems = [];
        this.renderItemsList();
      }
    } catch (error) {
      console.error("Error loading existing items:", error);
      this.addedItems = [];
      this.renderItemsList();
    }
  }

  renderItemsList() {
    console.log("=== RENDER ITEMS LIST ===");
    console.log("Items to render:", this.addedItems);
    console.log("Items count:", this.addedItems?.length);

    const listContainer = document.getElementById("shoppingItemsPageList");
    console.log("List container found:", !!listContainer);

    if (!listContainer) {
      console.error("Items list container not found");
      return;
    }

    // Update summary counters
    const totalItemsElement = document.getElementById("totalItemsInList");
    const totalAmountElement = document.getElementById("totalAmountInList");
    console.log(
      "Summary elements found:",
      !!totalItemsElement,
      !!totalAmountElement
    );

    if (!this.addedItems || this.addedItems.length === 0) {
      console.log("No items to display - showing empty message");
      listContainer.innerHTML = `
        <div class="empty-items-message">
          <i class="fas fa-shopping-cart"></i>
          <p>Belum ada item yang ditambahkan</p>
          <small>Mulai tambahkan item menggunakan form di atas</small>
        </div>
      `;

      if (totalItemsElement) totalItemsElement.textContent = "0 item";
      if (totalAmountElement) totalAmountElement.textContent = "Rp 0";
      return;
    }

    console.log("Generating HTML for items...");
    const itemsHtml = this.addedItems
      .map((item) => {
        const itemId = item.id_shoppingDetail || item.id;
        const isEditing = this.currentEditingItemId == itemId;
        if (isEditing) {
          // Use the exact structure and class names as requested by the user
          // Add a unique id to the form for debugging
          return `
        <form class="checklist-item edit-mode" data-id="${itemId}">
          <div class="item-checkbox">
            <input type="checkbox" id="item-${itemId}" checked disabled>
            <label for="item-${itemId}"></label>
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
            <button type="button" class="btn-cancel-item" onclick="window.shoppingItemsManager.cancelEditItem()" title="Batal"><i class="fas fa-times"></i></button>
          </div>
        </form>
        `;
        } else {
          return `
          <div class="item-row interactive" data-item-id="${itemId}">
            <div class="item-checkbox">
              <label class="custom-checkbox">
                <input type="checkbox" id="item-${itemId}" class="item-checkbox-input">
                <span class="checkmark"></span>
              </label>
            </div>
            <div class="item-info">
              <div class="item-name">${item.nama_item}</div>
              <div class="item-details">
                <span class="item-quantity">${item.jumlah_item} ${
            item.satuan
          }</span>
                <span class="item-price">Rp ${this.formatPrice(
                  item.harga
                )}</span>
              </div>
            </div>
            <div class="item-actions">
              <button class="btn-edit" onclick="window.shoppingItemsManager.editItem('${itemId}')" title="Edit">
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn-delete" onclick="window.shoppingItemsManager.deleteItem('${itemId}')" title="Hapus">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        `;
        }
      })
      .join("");

    console.log("Setting innerHTML...");
    listContainer.innerHTML = itemsHtml;

    // Update summary
    const totalItems = this.addedItems.length;
    const totalAmount = this.addedItems.reduce(
      (sum, item) => sum + item.harga * item.jumlah_item,
      0
    );

    console.log("Updating summary:", totalItems, "items, total:", totalAmount);

    if (totalItemsElement) totalItemsElement.textContent = `${totalItems} item`;
    if (totalAmountElement)
      totalAmountElement.textContent = `Rp ${this.formatPrice(totalAmount)}`;

    console.log("=== RENDER COMPLETE ===");
  }

  formatPrice(price) {
    return new Intl.NumberFormat("id-ID").format(price);
  }

  async editItem(itemId) {
    this.currentEditingItemId = itemId;
    this.renderItemsList();
  }
  cancelEditItem() {
    this.currentEditingItemId = null;
    this.renderItemsList();
  }
  async submitEditItem(event, itemId) {
    if (event) event.preventDefault();
    if (event && event.stopPropagation) event.stopPropagation();
    const self = window.shoppingItemsManager || this;
    const form = event.target;
    const updateData = {
      nama_item: form.nama_item.value.trim(),
      jumlah_item: parseFloat(form.jumlah_item.value),
      satuan: form.satuan.value.trim(),
      harga: parseInt(form.harga.value),
    };
    console.log("[submitEditItem] Called for itemId:", itemId);
    console.log("[submitEditItem] updateData:", updateData);
    if (
      !updateData.nama_item ||
      !updateData.jumlah_item ||
      !updateData.satuan ||
      !updateData.harga
    ) {
      self.showError("Semua field harus diisi dengan benar");
      return false;
    }
    try {
      console.log(
        "[submitEditItem] Sending PUT to /shopping/details/" + itemId
      );
      const response = await window.apiService.put(
        `/shopping/details/${itemId}`,
        updateData
      );
      console.log("[submitEditItem] API response:", response);
      if (response.success) {
        const itemIndex = self.addedItems.findIndex(
          (i) => (i.id_shoppingDetail || i.id) == itemId
        );
        if (itemIndex !== -1) {
          self.addedItems[itemIndex] = {
            ...self.addedItems[itemIndex],
            ...updateData,
          };
        }
        self.currentEditingItemId = null;
        self.renderItemsList();
        self.showSuccess("Item berhasil diupdate!");
      } else {
        throw new Error(response.message || "Failed to update item");
      }
    } catch (error) {
      console.error("Error updating item:", error);
      self.showError("Gagal mengupdate item. Silakan coba lagi.");
    }
    return false;
  }

  async deleteItem(itemId) {
    console.log("Delete item:", itemId);

    if (!confirm("Yakin ingin menghapus item ini?")) {
      return;
    }

    try {
      const response = await window.apiService.delete(
        `/shopping/details/${itemId}`
      );
      console.log("Delete response:", response);

      if (response.success) {
        // Remove from local array
        this.addedItems = this.addedItems.filter(
          (i) => (i.id_shoppingDetail || i.id) != itemId
        );
        this.renderItemsList();
        this.showSuccess("Item berhasil dihapus!");
      } else {
        throw new Error(response.message || "Failed to delete item");
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      this.showError("Gagal menghapus item. Silakan coba lagi.");
    }
  }

  async finishShoppingFromPage() {
    console.log("Finishing shopping from page...");

    try {
      if (this.addedItems.length === 0) {
        const confirmed = confirm(
          "Belum ada item yang ditambahkan. Yakin ingin menyelesaikan belanja?"
        );
        if (!confirmed) return;
      }

      // Calculate total
      const totalBelanja = this.addedItems.reduce(
        (sum, item) => sum + item.harga * item.jumlah_item,
        0
      );

      // Update shopping log with total and status
      const response = await window.apiService.put(
        `/shopping/${this.currentShoppingLogId}`,
        {
          total_belanja: totalBelanja,
          status: "Selesai",
        }
      );

      if (response.success) {
        console.log("Shopping finished successfully");
        this.showSuccess(
          "Belanja selesai! Total: Rp " + this.formatPrice(totalBelanja)
        );

        // Go back to shopping list
        setTimeout(() => {
          if (window.app) {
            window.app.showSection("shopping");
          }
        }, 1500);

        // Refresh shopping log list if available
        if (window.shoppingLogManager) {
          await window.shoppingLogManager.loadShoppingLogs();
          window.shoppingLogManager.renderShoppingLogs();
          window.shoppingLogManager.updateShoppingSummary();
        }
      } else {
        throw new Error(response.message || "Failed to finish shopping");
      }
    } catch (error) {
      console.error("Error finishing shopping:", error);
      this.showError("Gagal menyelesaikan belanja. Silakan coba lagi.");
    }
  }
}

// Initialize immediately
console.log("Creating ShoppingItemsManager instance...");
window.shoppingItemsManager = new ShoppingItemsManager();
console.log("ShoppingItemsManager created successfully");

// Make class globally available
window.ShoppingItemsManager = ShoppingItemsManager;

// Global functions for HTML onclick handlers
window.finishShoppingFromPage = function () {
  if (window.shoppingItemsManager) {
    window.shoppingItemsManager.finishShoppingFromPage();
  } else {
    console.error("ShoppingItemsManager not available");
  }
};

window.backToShopping = function () {
  if (window.app) {
    window.app.showSection("shopping");
  }
};

console.log("Shopping items simple script setup complete");
