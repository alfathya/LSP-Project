// TummyMate Application JavaScript
class TummyMate {
    constructor() {
        this.currentSection = 'dashboard';
        this.data = {
            mealPlans: JSON.parse(localStorage.getItem('mealPlans')) || [],
            shopping: JSON.parse(localStorage.getItem('shopping')) || [],
            jajan: JSON.parse(localStorage.getItem('jajan')) || [],
            user: JSON.parse(localStorage.getItem('user')) || {
                name: 'Pengguna TummyMate',
                email: 'user@tummymate.com',
                memberSince: new Date().toISOString().split('T')[0]
            }
        };
        this.currentDate = new Date();
        this.shoppingItems = []; // For managing multiple shopping items
        this.init();
    }

    init() {
        this.hideLoadingScreen();
        this.setupEventListeners();
        this.updateDashboard();
        this.updateProfile();
        this.setCurrentDate();
    }

    hideLoadingScreen() {
        setTimeout(() => {
            const loadingScreen = document.getElementById('loadingScreen');
            loadingScreen.classList.add('hidden');
        }, 2000);
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.getAttribute('data-section');
                this.showSection(section);
            });
        });

        // Mobile menu toggle
        const navToggle = document.getElementById('navToggle');
        const navMenu = document.getElementById('navMenu');
        
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });

        // Form submissions
        const mealPlanForm = document.getElementById('mealPlanForm');
        if (mealPlanForm) {
            mealPlanForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveMealPlan();
            });
        }

        const jajanForm = document.getElementById('jajanForm');
        if (jajanForm) {
            jajanForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveJajan();
            });
        }

        // File preview handlers
        document.getElementById('shoppingReceipt').addEventListener('change', (e) => {
            this.previewFile(e.target, 'shoppingReceiptPreview');
        });

        document.getElementById('jajanPhoto').addEventListener('change', (e) => {
            this.previewFile(e.target, 'jajanPhotoPreview');
        });

        // Auto set day when date changes in shopping modal
        document.getElementById('shoppingDate').addEventListener('change', (e) => {
            this.autoSetDay(e.target.value, 'shoppingDay');
        });
    }

    showSection(sectionName) {
        // Hide all sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });

        // Show target section
        const targetSection = document.getElementById(sectionName);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        const activeLink = document.querySelector(`[data-section="${sectionName}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }

        this.currentSection = sectionName;

        // Update section-specific content
        switch(sectionName) {
            case 'meal-plan':
                this.renderMealPlanCalendar();
                this.renderMealPlanList();
                break;
            case 'shopping':
                this.renderShoppingHistory();
                this.updateShoppingSummary();
                break;
            case 'jajan-log':
                this.renderJajanList();
                this.updateJajanSummary();
                break;
        }
    }

    setCurrentDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('mealDate').value = today;
        document.getElementById('shoppingDate').value = today;
        document.getElementById('jajanDate').value = today;
        document.getElementById('mealYear').value = new Date().getFullYear();
    }

    // Dashboard Methods
    updateDashboard() {
        // Update stats
        document.getElementById('mealPlanCount').textContent = this.data.mealPlans.length;
        document.getElementById('shoppingCount').textContent = this.data.shopping.length;
        document.getElementById('jajanCount').textContent = this.data.jajan.length;
        
        const totalExpense = this.calculateTotalExpense();
        document.getElementById('totalExpense').textContent = this.formatCurrency(totalExpense);

        // Update today's meals
        this.renderTodayMeals();
        
        // Update recent shopping
        this.renderRecentShopping();
    }

    renderTodayMeals() {
        const today = new Date().toISOString().split('T')[0];
        const todayMeals = this.data.mealPlans.filter(meal => meal.tanggal === today);
        const container = document.getElementById('todayMeals');

        if (todayMeals.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-calendar-times"></i>
                    <p>Belum ada menu untuk hari ini</p>
                    <button class="btn-primary" onclick="app.showMealPlan()">Tambah Menu</button>
                </div>
            `;
        } else {
            container.innerHTML = todayMeals.map(meal => `
                <div class="list-item">
                    <div class="item-header">
                        <span class="item-title">${meal.jenis_rencana}</span>
                        <span class="item-date">${meal.waktu_makan}</span>
                    </div>
                    <div class="item-details">${meal.menu}</div>
                </div>
            `).join('');
        }
    }

    renderRecentShopping() {
        const recentShopping = this.data.shopping.slice(-3);
        const container = document.getElementById('recentShopping');

        if (recentShopping.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-shopping-cart"></i>
                    <p>Belum ada data belanja</p>
                    <button class="btn-primary" onclick="app.showShopping()">Tambah Belanja</button>
                </div>
            `;
        } else {
            container.innerHTML = recentShopping.map(item => `
                <div class="list-item">
                    <div class="item-header">
                        <span class="item-title">${item.item}</span>
                        <span class="item-price">${this.formatCurrency(item.total_harga)}</span>
                    </div>
                    <div class="item-details">${item.jumlah} ${item.satuan} - ${this.formatDate(item.tanggal)}</div>
                </div>
            `).join('');
        }
    }

    calculateTotalExpense() {
        const shoppingTotal = this.data.shopping.reduce((sum, item) => sum + parseFloat(item.total_harga), 0);
        const jajanTotal = this.data.jajan.reduce((sum, item) => sum + parseFloat(item.harga), 0);
        return shoppingTotal + jajanTotal;
    }

    // Meal Plan Methods
    renderMealPlanCalendar() {
        const calendar = document.getElementById('mealPlanCalendar');
        const currentMonth = this.currentDate.getMonth();
        const currentYear = this.currentDate.getFullYear();
        
        calendar.innerHTML = `
            <div class="calendar-header">
                <h3>${this.getMonthName(currentMonth)} ${currentYear}</h3>
                <div class="calendar-nav">
                    <button onclick="app.previousMonth()"><i class="fas fa-chevron-left"></i></button>
                    <button onclick="app.nextMonth()"><i class="fas fa-chevron-right"></i></button>
                </div>
            </div>
            <div class="calendar-grid">
                ${this.generateCalendarDays()}
            </div>
        `;
    }

    generateCalendarDays() {
        const currentMonth = this.currentDate.getMonth();
        const currentYear = this.currentDate.getFullYear();
        const firstDay = new Date(currentYear, currentMonth, 1);
        const lastDay = new Date(currentYear, currentMonth + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        let html = '';
        const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
        
        // Day headers
        dayNames.forEach(day => {
            html += `<div class="calendar-day-header">${day}</div>`;
        });

        // Calendar days
        for (let i = 0; i < 42; i++) {
            const currentDay = new Date(startDate);
            currentDay.setDate(startDate.getDate() + i);
            
            const isCurrentMonth = currentDay.getMonth() === currentMonth;
            const isToday = this.isToday(currentDay);
            const dateString = currentDay.toISOString().split('T')[0];
            const mealsForDay = this.data.mealPlans.filter(meal => meal.tanggal === dateString);
            
            html += `
                <div class="calendar-day ${!isCurrentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''}" 
                     onclick="app.selectDate('${dateString}')">
                    <div class="day-number">${currentDay.getDate()}</div>
                    <div class="meal-indicators">
                        ${mealsForDay.map(() => '<span class="meal-indicator"></span>').join('')}
                    </div>
                </div>
            `;
        }

        return html;
    }

    renderMealPlanList() {
        const container = document.getElementById('mealPlanList');
        const sortedMeals = this.data.mealPlans.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));

        if (sortedMeals.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-calendar-times"></i>
                    <p>Belum ada menu yang direncanakan</p>
                    <button class="btn-primary" onclick="app.openMealPlanModal()">Tambah Menu Pertama</button>
                </div>
            `;
        } else {
            container.innerHTML = sortedMeals.map((meal, index) => `
                <div class="list-item">
                    <div class="item-header">
                        <span class="item-title">${meal.jenis_rencana} - ${meal.hari}</span>
                        <span class="item-date">${this.formatDate(meal.tanggal)}</span>
                    </div>
                    <div class="item-details">
                        <p><strong>Menu:</strong> ${meal.menu}</p>
                        <p><strong>Waktu:</strong> ${meal.waktu_makan}</p>
                        ${meal.catatan ? `<p><strong>Catatan:</strong> ${meal.catatan}</p>` : ''}
                    </div>
                    <div class="item-actions">
                        <button class="btn-edit" onclick="app.editMealPlan(${index})">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn-delete" onclick="app.deleteMealPlan(${index})">
                            <i class="fas fa-trash"></i> Hapus
                        </button>
                    </div>
                </div>
            `).join('');
        }
    }

    openMealPlanModal() {
        const modal = document.getElementById('mealPlanModal');
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeMealPlanModal() {
        const modal = document.getElementById('mealPlanModal');
        modal.classList.remove('active');
        document.body.style.overflow = '';
        document.getElementById('mealPlanForm').reset();
        this.setCurrentDate();
    }

    saveMealPlan() {
        const form = document.getElementById('mealPlanForm');
        const formData = new FormData(form);
        
        const mealPlan = {
            id: Date.now(),
            tanggal: formData.get('tanggal'),
            jenis_rencana: formData.get('jenis_rencana'),
            minggu_ke: parseInt(formData.get('minggu_ke')),
            tahun: parseInt(formData.get('tahun')),
            hari: formData.get('hari'),
            waktu_makan: formData.get('waktu_makan'),
            menu: formData.get('menu'),
            catatan: formData.get('catatan') || '',
            created_at: new Date().toISOString()
        };

        this.data.mealPlans.push(mealPlan);
        this.saveToLocalStorage('mealPlans');
        this.closeMealPlanModal();
        this.updateDashboard();
        this.renderMealPlanList();
        this.renderMealPlanCalendar();
        this.showToast('Menu berhasil ditambahkan!', 'success');
    }

    // Shopping Methods
    renderShoppingList() {
        this.renderShoppingHistory();
    }

    renderShoppingHistory() {
        const tableBody = document.getElementById('shoppingHistoryTableBody');
        const emptyState = document.getElementById('shoppingHistoryEmpty');
        
        if (!this.data.shopping || this.data.shopping.length === 0) {
            tableBody.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';
        
        // Group shopping data by date and create shopping list entries
        const shoppingLists = this.createShoppingListsFromData();
        
        tableBody.innerHTML = shoppingLists
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .map((list, index) => {
                const shoppingId = `#SH${String(index + 1).padStart(4, '0')}`;
                const statusClass = list.completed ? 'completed' : 'planned';
                const statusText = list.completed ? 'Selesai' : 'Direncanakan';
                
                return `
                    <tr onclick="viewShoppingDetail('${list.date}')" data-shopping-id="${shoppingId}">
                        <td>
                            <span class="shopping-id">${shoppingId}</span>
                        </td>
                        <td>
                            <span class="shopping-date">${this.formatDateIndonesian(list.date)}</span>
                        </td>
                        <td class="text-right">
                            <span class="shopping-amount">${this.formatCurrency(list.totalAmount)}</span>
                        </td>
                        <td class="text-center">
                            <span class="shopping-items-count">${list.itemsCount}</span>
                        </td>
                        <td class="text-center">
                            <span class="shopping-status ${statusClass}">${statusText}</span>
                        </td>
                    </tr>
                `;
            }).join('');

    }

    createShoppingListsFromData() {
        // Group shopping items by date
        const groupedByDate = this.groupShoppingByDate();
        
        return Object.keys(groupedByDate).map(date => {
            const items = groupedByDate[date];
            const totalAmount = items.reduce((sum, item) => sum + parseFloat(item.total_harga || 0), 0);
            const itemsCount = items.length;
            
            // Determine if shopping is completed based on whether all items have receipt or are marked as done
            const completed = items.every(item => item.selesai || item.struk_url);
            
            return {
                date: date,
                items: items,
                totalAmount: totalAmount,
                itemsCount: itemsCount,
                completed: completed
            };
        });
    }

    formatDateIndonesian(dateString) {
        const date = new Date(dateString);
        const options = { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
        };
        return date.toLocaleDateString('id-ID', options);
    }

    groupShoppingByDate() {
        const grouped = {};
        this.data.shopping.forEach(item => {
            const date = item.tanggal;
            if (!grouped[date]) {
                grouped[date] = [];
            }
            grouped[date].push(item);
        });
        return grouped;
    }

    toggleHistoryGroup(date) {
        const group = document.querySelector(`[data-date="${date}"]`);
        if (group) {
            group.classList.toggle('expanded');
        }
    }

    getShoppingIndex(id) {
        return this.data.shopping.findIndex(item => item.id === id);
    }

    getDayName(date) {
        const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        return days[date.getDay()];
    }

    viewImage(imageSrc) {
        // Create modal to view image
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 90%; max-height: 90%; padding: 0; background: transparent;">
                <div style="position: relative;">
                    <img src="${imageSrc}" alt="Preview" style="width: 100%; height: auto; border-radius: 12px;">
                    <button onclick="this.closest('.modal').remove()" 
                            style="position: absolute; top: 10px; right: 10px; 
                                   background: rgba(0,0,0,0.7); color: white; border: none; 
                                   border-radius: 50%; width: 40px; height: 40px; 
                                   cursor: pointer; font-size: 16px;">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Close on background click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    updateShoppingSummary() {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        const monthlyItems = this.data.shopping.filter(item => {
            const itemDate = new Date(item.tanggal);
            return itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear;
        });

        const monthlyTotal = monthlyItems.reduce((sum, item) => sum + parseFloat(item.total_harga), 0);
        const dailyAverage = monthlyTotal / new Date().getDate();

        document.getElementById('monthlyTotal').textContent = this.formatCurrency(monthlyTotal);
        document.getElementById('dailyAverage').textContent = this.formatCurrency(dailyAverage);
    }

    openShoppingModal() {
        const modal = document.getElementById('shoppingModal');
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Reset shopping items
        this.shoppingItems = [];
        this.renderShoppingItemsList();
        this.addShoppingItem(); // Add first item by default
    }

    closeShoppingModal() {
        const modal = document.getElementById('shoppingModal');
        modal.classList.remove('active');
        document.body.style.overflow = '';
        document.getElementById('shoppingForm').reset();
        document.getElementById('shoppingReceiptPreview').innerHTML = '';
        this.shoppingItems = [];
        this.setCurrentDate();
    }

    addShoppingItem() {
        const newItem = {
            id: Date.now() + Math.random(),
            item: '',
            jumlah: 1,
            satuan: '',
            harga_satuan: 0,
            total_harga: 0
        };
        
        this.shoppingItems.push(newItem);
        this.renderShoppingItemsList();
    }

    removeShoppingItem(itemId) {
        this.shoppingItems = this.shoppingItems.filter(item => item.id !== itemId);
        this.renderShoppingItemsList();
    }

    renderShoppingItemsList() {
        const container = document.getElementById('shoppingItemsList');
        
        if (this.shoppingItems.length === 0) {
            container.innerHTML = `
                <div class="empty-shopping-list">
                    <i class="fas fa-shopping-basket"></i>
                    <p>Belum ada item belanja</p>
                    <p>Klik tombol + untuk menambah item</p>
                </div>
            `;
            this.updateShoppingTotal();
            return;
        }

        container.innerHTML = this.shoppingItems.map((item, index) => `
            <div class="shopping-item-card" data-item-id="${item.id}">
                <div class="shopping-item-header">
                    <div class="shopping-item-number">${index + 1}</div>
                    <button type="button" class="shopping-item-remove" onclick="app.removeShoppingItem(${item.id})">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="shopping-item-fields">
                    <input type="text" placeholder="Nama item" value="${item.item}" 
                           onchange="app.updateShoppingItem(${item.id}, 'item', this.value)">
                    <input type="number" placeholder="Jumlah" min="1" value="${item.jumlah}" 
                           onchange="app.updateShoppingItem(${item.id}, 'jumlah', this.value)">
                    <select onchange="app.updateShoppingItem(${item.id}, 'satuan', this.value)">
                        <option value="">Satuan</option>
                        <option value="kg" ${item.satuan === 'kg' ? 'selected' : ''}>Kilogram</option>
                        <option value="gram" ${item.satuan === 'gram' ? 'selected' : ''}>Gram</option>
                        <option value="liter" ${item.satuan === 'liter' ? 'selected' : ''}>Liter</option>
                        <option value="ml" ${item.satuan === 'ml' ? 'selected' : ''}>Mililiter</option>
                        <option value="pcs" ${item.satuan === 'pcs' ? 'selected' : ''}>Pieces</option>
                        <option value="pack" ${item.satuan === 'pack' ? 'selected' : ''}>Pack</option>
                        <option value="botol" ${item.satuan === 'botol' ? 'selected' : ''}>Botol</option>
                        <option value="kaleng" ${item.satuan === 'kaleng' ? 'selected' : ''}>Kaleng</option>
                    </select>
                    <input type="number" placeholder="Harga/satuan" min="0" step="0.01" value="${item.harga_satuan}" 
                           onchange="app.updateShoppingItem(${item.id}, 'harga_satuan', this.value)">
                </div>
                <div class="shopping-item-total">
                    Total: ${this.formatCurrency(item.total_harga)}
                </div>
            </div>
        `).join('');

        this.updateShoppingTotal();
    }

    updateShoppingItem(itemId, field, value) {
        const item = this.shoppingItems.find(item => item.id === itemId);
        if (item) {
            item[field] = field === 'item' || field === 'satuan' ? value : parseFloat(value) || 0;
            
            // Recalculate total for this item
            if (field === 'jumlah' || field === 'harga_satuan') {
                item.total_harga = item.jumlah * item.harga_satuan;
            }
            
            this.renderShoppingItemsList();
        }
    }

    updateShoppingTotal() {
        const total = this.shoppingItems.reduce((sum, item) => sum + item.total_harga, 0);
        const totalDisplay = document.getElementById('shoppingTotalDisplay');
        if (totalDisplay) {
            totalDisplay.textContent = this.formatCurrency(total);
        }
    }

    saveShopping() {
        const form = document.getElementById('shoppingForm');
        const formData = new FormData(form);
        
        // Validate that we have at least one item
        if (this.shoppingItems.length === 0) {
            this.showToast('Harap tambahkan minimal satu item belanja!', 'warning');
            return;
        }

        // Validate that all items are filled
        const invalidItems = this.shoppingItems.filter(item => 
            !item.item.trim() || !item.satuan || item.jumlah <= 0 || item.harga_satuan <= 0
        );

        if (invalidItems.length > 0) {
            this.showToast('Harap lengkapi semua item belanja!', 'warning');
            return;
        }

        const tanggal = formData.get('tanggal');
        const hari = formData.get('hari');
        const keterangan = formData.get('keterangan') || '';

        // Create shopping entries for each item
        const shoppingEntries = this.shoppingItems.map(item => ({
            id: Date.now() + Math.random(),
            tanggal: tanggal,
            hari: hari,
            item: item.item,
            jumlah: item.jumlah,
            satuan: item.satuan,
            harga_satuan: item.harga_satuan,
            total_harga: item.total_harga,
            keterangan: keterangan,
            created_at: new Date().toISOString()
        }));

        // Handle file upload
        const fileInput = document.getElementById('shoppingReceipt');
        if (fileInput.files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => {
                // Add photo to all items (they're from the same shopping trip)
                shoppingEntries.forEach(entry => {
                    entry.foto_struk = e.target.result;
                });
                this.completeSaveShopping(shoppingEntries);
            };
            reader.readAsDataURL(fileInput.files[0]);
        } else {
            this.completeSaveShopping(shoppingEntries);
        }
    }

    completeSaveShopping(shoppingEntries) {
        // Add all items to the shopping data
        this.data.shopping.push(...shoppingEntries);
        this.saveToLocalStorage('shopping');
        this.closeShoppingModal();
        this.updateDashboard();
        this.renderShoppingHistory();
        this.updateShoppingSummary();
        this.showToast(`${shoppingEntries.length} item belanja berhasil ditambahkan!`, 'success');
    }

    autoSetDay(dateString, daySelectId) {
        if (dateString) {
            const date = new Date(dateString);
            const dayName = this.getDayName(date).toLowerCase();
            const daySelect = document.getElementById(daySelectId);
            
            // Map day names to form values
            const dayMap = {
                'minggu': 'minggu',
                'senin': 'senin', 
                'selasa': 'selasa',
                'rabu': 'rabu',
                'kamis': 'kamis',
                'jumat': 'jumat',
                'sabtu': 'sabtu'
            };
            
            if (daySelect && dayMap[dayName]) {
                daySelect.value = dayMap[dayName];
            }
        }
    }

    // Jajan Log Methods
    renderJajanList() {
        const container = document.getElementById('jajanList');
        const sortedJajan = this.data.jajan.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));

        if (sortedJajan.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-utensils"></i>
                    <p>Belum ada data jajan</p>
                    <button class="btn-primary" onclick="app.openJajanModal()">Tambah Jajan Pertama</button>
                </div>
            `;
        } else {
            container.innerHTML = sortedJajan.map((item, index) => `
                <div class="list-item">
                    <div class="item-header">
                        <span class="item-title">${item.makanan}</span>
                        <span class="item-price">${this.formatCurrency(item.harga)}</span>
                    </div>
                    <div class="item-details">
                        <p><strong>Tempat:</strong> ${item.tempat}</p>
                        <p><strong>Kategori:</strong> ${item.kategori}</p>
                        <p><strong>Tanggal:</strong> ${this.formatDate(item.tanggal)}</p>
                        ${item.catatan ? `<p><strong>Catatan:</strong> ${item.catatan}</p>` : ''}
                    </div>
                    ${item.foto_tempat ? `
                        <div class="item-image">
                            <img src="${item.foto_tempat}" alt="Foto tempat" style="max-width: 200px; margin-top: 10px; border-radius: 8px;">
                        </div>
                    ` : ''}
                    <div class="item-actions">
                        <button class="btn-edit" onclick="app.editJajan(${index})">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn-delete" onclick="app.deleteJajan(${index})">
                            <i class="fas fa-trash"></i> Hapus
                        </button>
                    </div>
                </div>
            `).join('');
        }
    }

    updateJajanSummary() {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        const monthlyItems = this.data.jajan.filter(item => {
            const itemDate = new Date(item.tanggal);
            return itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear;
        });

        const monthlyTotal = monthlyItems.reduce((sum, item) => sum + parseFloat(item.harga), 0);
        
        // Find favorite category
        const categoryCount = {};
        monthlyItems.forEach(item => {
            categoryCount[item.kategori] = (categoryCount[item.kategori] || 0) + 1;
        });
        
        const favoriteCategory = Object.keys(categoryCount).reduce((a, b) => 
            categoryCount[a] > categoryCount[b] ? a : b, '-'
        );

        document.getElementById('jajanMonthlyTotal').textContent = this.formatCurrency(monthlyTotal);
        document.getElementById('favoriteCategory').textContent = favoriteCategory;
    }

    openJajanModal() {
        const modal = document.getElementById('jajanModal');
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeJajanModal() {
        const modal = document.getElementById('jajanModal');
        modal.classList.remove('active');
        document.body.style.overflow = '';
        document.getElementById('jajanForm').reset();
        document.getElementById('jajanPhotoPreview').innerHTML = '';
        this.setCurrentDate();
    }

    saveJajan() {
        const form = document.getElementById('jajanForm');
        const formData = new FormData(form);
        
        const jajan = {
            id: Date.now(),
            tanggal: formData.get('tanggal'),
            tempat: formData.get('tempat'),
            makanan: formData.get('makanan'),
            harga: parseFloat(formData.get('harga')),
            kategori: formData.get('kategori'),
            catatan: formData.get('catatan') || '',
            created_at: new Date().toISOString()
        };

        // Handle file upload
        const fileInput = document.getElementById('jajanPhoto');
        if (fileInput.files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => {
                jajan.foto_tempat = e.target.result;
                this.completeSaveJajan(jajan);
            };
            reader.readAsDataURL(fileInput.files[0]);
        } else {
            this.completeSaveJajan(jajan);
        }
    }

    completeSaveJajan(jajan) {
        this.data.jajan.push(jajan);
        this.saveToLocalStorage('jajan');
        this.closeJajanModal();
        this.updateDashboard();
        this.renderJajanList();
        this.updateJajanSummary();
        this.showToast('Data jajan berhasil ditambahkan!', 'success');
    }

    // Profile Methods
    updateProfile() {
        document.getElementById('userName').textContent = this.data.user.name;
        document.getElementById('userEmail').textContent = this.data.user.email;
        document.getElementById('memberSince').textContent = this.formatDate(this.data.user.memberSince);
        document.getElementById('totalMeals').textContent = this.data.mealPlans.length;
        document.getElementById('totalShopping').textContent = this.data.shopping.length;
        document.getElementById('totalJajan').textContent = this.data.jajan.length;
    }

    // Utility Methods
    previewFile(input, previewId) {
        const preview = document.getElementById(previewId);
        const file = input.files[0];
        
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                preview.innerHTML = `<img src="${e.target.result}" alt="Preview" style="max-width: 200px; border-radius: 8px;">`;
            };
            reader.readAsDataURL(file);
        } else {
            preview.innerHTML = '';
        }
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    getMonthName(monthIndex) {
        const months = [
            'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
            'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
        ];
        return months[monthIndex];
    }

    isToday(date) {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    }

    previousMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        this.renderMealPlanCalendar();
    }

    nextMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        this.renderMealPlanCalendar();
    }

    selectDate(dateString) {
        document.getElementById('mealDate').value = dateString;
        this.openMealPlanModal();
    }

    showMealPlan() {
        this.showSection('meal-plan');
    }

    showShopping() {
        this.showSection('shopping');
    }

    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        const icon = toast.querySelector('.toast-icon');
        const messageEl = toast.querySelector('.toast-message');
        
        // Set content
        messageEl.textContent = message;
        
        // Set icon based on type
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle'
        };
        
        icon.className = `toast-icon ${icons[type] || icons.success}`;
        
        // Set toast type
        toast.className = `toast ${type}`;
        
        // Show toast
        toast.classList.add('show');
        
        // Hide after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    saveToLocalStorage(key) {
        localStorage.setItem(key, JSON.stringify(this.data[key]));
    }

    // Delete Methods
    deleteMealPlan(index) {
        if (confirm('Apakah Anda yakin ingin menghapus menu ini?')) {
            this.data.mealPlans.splice(index, 1);
            this.saveToLocalStorage('mealPlans');
            this.updateDashboard();
            this.renderMealPlanList();
            this.renderMealPlanCalendar();
            this.showToast('Menu berhasil dihapus!', 'success');
        }
    }

    deleteShopping(index) {
        if (confirm('Apakah Anda yakin ingin menghapus data belanja ini?')) {
            this.data.shopping.splice(index, 1);
            this.saveToLocalStorage('shopping');
            this.updateDashboard();
            this.renderShoppingHistory();
            this.updateShoppingSummary();
            this.showToast('Data belanja berhasil dihapus!', 'success');
        }
    }

    deleteJajan(index) {
        if (confirm('Apakah Anda yakin ingin menghapus data jajan ini?')) {
            this.data.jajan.splice(index, 1);
            this.saveToLocalStorage('jajan');
            this.updateDashboard();
            this.renderJajanList();
            this.updateJajanSummary();
            this.showToast('Data jajan berhasil dihapus!', 'success');
        }
    }

    editProfile() {
        const name = prompt('Masukkan nama baru:', this.data.user.name);
        if (name && name.trim()) {
            this.data.user.name = name.trim();
            this.saveToLocalStorage('user');
            this.updateProfile();
            this.showToast('Profile berhasil diupdate!', 'success');
        }
    }
}

// Global functions for onclick handlers
function openMealPlanModal() {
    app.openMealPlanModal();
}

function closeMealPlanModal() {
    app.closeMealPlanModal();
}

function openShoppingModal() {
    app.openShoppingModal();
}

function closeShoppingModal() {
    app.closeShoppingModal();
}

function openJajanModal() {
    app.openJajanModal();
}

function closeJajanModal() {
    app.closeJajanModal();
}

function showMealPlan() {
    app.showMealPlan();
}

function showShopping() {
    app.showShopping();
}

function editProfile() {
    app.editProfile();
}

function addShoppingItem() {
    app.addShoppingItem();
}

// Initialize the application
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new TummyMate();
});

// Close modals when clicking outside
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        const activeModal = document.querySelector('.modal.active');
        if (activeModal) {
            activeModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
});

// Handle escape key to close modals
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const activeModal = document.querySelector('.modal.active');
        if (activeModal) {
            activeModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
});

// New Shopping System Functions
let currentShoppingList = null;
let currentShoppingItems = [];

// Open Create Shopping List Modal
function openCreateShoppingListModal() {
    const modal = document.getElementById('createShoppingListModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('shoppingListDate').value = today;
    
    // Set default day based on current date
    const dayNames = ['minggu', 'senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu'];
    const currentDay = dayNames[new Date().getDay()];
    document.getElementById('shoppingListDay').value = currentDay;
}

// Close Create Shopping List Modal
function closeCreateShoppingListModal() {
    const modal = document.getElementById('createShoppingListModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
    document.getElementById('createShoppingListForm').reset();
}

// Handle Create Shopping List Form
document.getElementById('createShoppingListForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    const shoppingListData = {
        id: Date.now(),
        tanggal: formData.get('tanggal'),
        hari: formData.get('hari'),
        items: [],
        totalBelanja: 0,
        completed: false,
        created_at: new Date().toISOString()
    };
    
    // Store current shopping list
    currentShoppingList = shoppingListData;
    currentShoppingItems = [];
    
    // Close modal and navigate to shopping detail
    closeCreateShoppingListModal();
    showShoppingDetail(shoppingListData);
    
    // Show success message
    showToast('success', 'Daftar belanja berhasil dibuat!');
});

// Show Shopping Detail Page
function showShoppingDetail(shoppingList) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show shopping detail section
    const detailSection = document.getElementById('shopping-detail');
    detailSection.classList.add('active');
    
    // Update navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Update page info
    const dateOptions = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    const formattedDate = new Date(shoppingList.tanggal).toLocaleDateString('id-ID', dateOptions);
    
    document.getElementById('shoppingDetailDate').textContent = `Belanja - ${shoppingList.hari.charAt(0).toUpperCase() + shoppingList.hari.slice(1)}`;
    document.getElementById('shoppingDetailDay').textContent = formattedDate;
    
    // Render shopping checklist
    renderShoppingChecklist();
    updateShoppingSummary();
}

// Back to Shopping List
function backToShopping() {
    app.showSection('shopping');
}

// View Shopping Detail from History
function viewShoppingDetail(date) {
    // Set current shopping detail date
    window.currentShoppingDate = date;
    
    // Load shopping items for this date
    const groupedShopping = app.groupShoppingByDate();
    window.currentShoppingItems = groupedShopping[date] || [];
    
    // Update shopping detail header
    const header = document.querySelector('#shopping-detail .shopping-date-info h2');
    const dateInfo = document.querySelector('#shopping-detail .shopping-date-info p');
    
    if (header && dateInfo) {
        const dayName = app.getDayName(new Date(date));
        header.textContent = `Belanja ${dayName}`;
        dateInfo.textContent = app.formatDateIndonesian(date);
    }
    
    // Navigate to shopping detail section
    app.showSection('shopping-detail');
    
    // Render checklist and update summary
    renderShoppingChecklist();
    updateShoppingSummary();
}

// Open Add Item Modal
function openAddItemModal() {
    const modal = document.getElementById('addItemModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close Add Item Modal
function closeAddItemModal() {
    const modal = document.getElementById('addItemModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
    document.getElementById('addItemForm').reset();
}

// Handle Add Item Form
document.getElementById('addItemForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    const quantity = parseFloat(formData.get('jumlah'));
    const price = parseFloat(formData.get('harga_satuan'));
    const totalPrice = quantity * price;
    
    const itemData = {
        id: Date.now(),
        item: formData.get('item'),
        jumlah: quantity,
        satuan: formData.get('satuan'),
        harga_satuan: price,
        total_harga: totalPrice,
        keterangan: formData.get('keterangan') || '',
        completed: false
    };
    
    // Add to current shopping items
    currentShoppingItems.push(itemData);
    
    // Close modal and update display
    closeAddItemModal();
    renderShoppingChecklist();
    updateShoppingSummary();
    
    // Show success message
    showToast('success', 'Item berhasil ditambahkan!');
});

// Render Shopping Checklist
function renderShoppingChecklist() {
    const checklistContainer = document.getElementById('shoppingChecklist');
    
    if (currentShoppingItems.length === 0) {
        checklistContainer.innerHTML = `
            <div class="empty-checklist">
                <i class="fas fa-shopping-basket"></i>
                <p>Belum ada item belanja</p>
                <small>Klik tombol "Tambah Item" untuk menambahkan item</small>
            </div>
        `;
        return;
    }
    
    const checklistHTML = currentShoppingItems.map(item => `
        <div class="checklist-item ${item.completed ? 'completed' : ''}" data-id="${item.id}">
            <input 
                type="checkbox" 
                class="checklist-checkbox" 
                ${item.completed ? 'checked' : ''}
                onchange="toggleItemCompletion(${item.id})"
            >
            <div class="checklist-content">
                <div class="item-name">${item.item}</div>
                <div class="item-quantity">${item.jumlah}</div>
                <div class="item-unit">${item.satuan}</div>
                <div class="item-price">Rp ${item.harga_satuan.toLocaleString('id-ID')}</div>
                <div class="item-total">Rp ${item.total_harga.toLocaleString('id-ID')}</div>
            </div>
            <div class="checklist-actions">
                <button class="btn-edit-item" onclick="editShoppingItem(${item.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-delete-item" onclick="deleteShoppingItem(${item.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
    
    checklistContainer.innerHTML = checklistHTML;
}

// Toggle Item Completion
function toggleItemCompletion(itemId) {
    const item = currentShoppingItems.find(item => item.id === itemId);
    if (item) {
        item.completed = !item.completed;
        renderShoppingChecklist();
        updateShoppingSummary();
    }
}

// Delete Shopping Item
function deleteShoppingItem(itemId) {
    if (confirm('Apakah Anda yakin ingin menghapus item ini?')) {
        currentShoppingItems = currentShoppingItems.filter(item => item.id !== itemId);
        renderShoppingChecklist();
        updateShoppingSummary();
        showToast('success', 'Item berhasil dihapus!');
    }
}

// Edit Shopping Item
function editShoppingItem(itemId) {
    const item = currentShoppingItems.find(item => item.id === itemId);
    if (item) {
        // Fill form with current data
        document.getElementById('itemName').value = item.item;
        document.getElementById('itemQuantity').value = item.jumlah;
        document.getElementById('itemUnit').value = item.satuan;
        document.getElementById('itemPrice').value = item.harga_satuan;
        document.getElementById('itemNotes').value = item.keterangan;
        
        // Store item ID for update
        document.getElementById('addItemForm').dataset.editId = itemId;
        
        // Change modal title and button text
        document.querySelector('#addItemModal .modal-header h2').textContent = 'Edit Item Belanja';
        document.querySelector('#addItemForm button[type="submit"]').textContent = 'Update Item';
        
        openAddItemModal();
    }
}

// Save Shopping List
function saveShoppingList() {
    if (!currentShoppingList) {
        showToast('error', 'Tidak ada data daftar belanja untuk disimpan!');
        return;
    }
    
    if (currentShoppingItems.length === 0) {
        showToast('warning', 'Tambahkan minimal satu item sebelum menyimpan!');
        return;
    }
    
    // Get receipt data if uploaded
    let receiptData = null;
    const receiptPreview = document.getElementById('receiptPreview');
    if (receiptPreview.innerHTML.includes('img')) {
        const imgElement = receiptPreview.querySelector('img');
        if (imgElement) {
            receiptData = imgElement.src;
        }
    }
    
    // Get existing shopping data from localStorage
    let existingShoppingData = JSON.parse(localStorage.getItem('shopping')) || [];
    
    // Convert shopping list items to individual shopping records
    // This matches the existing data format that the app expects
    const shoppingRecords = currentShoppingItems.map(item => ({
        id: Date.now() + Math.random(), // Ensure unique ID
        tanggal: currentShoppingList.tanggal,
        hari: currentShoppingList.hari,
        item: item.item,
        jumlah: item.jumlah,
        satuan: item.satuan,
        harga_satuan: item.harga_satuan,
        total_harga: item.total_harga,
        keterangan: item.keterangan || `Belanja ${currentShoppingList.hari}, ${currentShoppingList.tanggal}`,
        foto_struk: receiptData,
        created_at: new Date().toISOString()
    }));
    
    // Add all shopping records to existing data
    existingShoppingData.push(...shoppingRecords);
    
    // Save to localStorage
    localStorage.setItem('shopping', JSON.stringify(existingShoppingData));
    
    // Update app data
    if (window.app) {
        app.data.shopping = existingShoppingData;
        app.updateDashboard();
    }
    
    // Show success message
    showToast('success', `Berhasil menyimpan ${currentShoppingItems.length} item belanja!`);
    
    // Redirect to shopping section after delay
    setTimeout(() => {
        app.showSection('shopping');
        // Refresh shopping history
        if (typeof app.renderShoppingHistory === 'function') {
            app.renderShoppingHistory();
        }
        // Reset current shopping list
        currentShoppingList = null;
        currentShoppingItems = [];
    }, 1500);
}

// Update Shopping Summary
function updateShoppingSummary() {
    const totalItems = currentShoppingItems.length;
    const totalPrice = currentShoppingItems.reduce((sum, item) => sum + item.total_harga, 0);
    
    document.getElementById('totalItemsCount').textContent = totalItems;
    document.getElementById('totalShoppingPrice').textContent = `Rp ${totalPrice.toLocaleString('id-ID')}`;
}

// Handle Receipt Upload
function handleReceiptUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const previewContainer = document.getElementById('receiptPreview');
            previewContainer.innerHTML = `
                <img src="${e.target.result}" alt="Struk Belanja" style="max-width: 200px; max-height: 150px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <button onclick="removeReceipt()" style="margin-left: 10px; padding: 5px 10px; background: #E17055; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    <i class="fas fa-trash"></i>
                </button>
            `;
        };
        reader.readAsDataURL(file);
    }
}

// Remove Receipt
function removeReceipt() {
    document.getElementById('receiptUpload').value = '';
    document.getElementById('receiptPreview').innerHTML = '';
}

// Show Toast Notification
function showToast(type, message) {
    const toast = document.createElement('div');
    toast.className = `toast ${type} show`;
    
    const iconMap = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle'
    };
    
    toast.innerHTML = `
        <div class="toast-content">
            <i class="toast-icon fas ${iconMap[type]}"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

// Update add item form handler to support editing
document.getElementById('addItemForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    const quantity = parseFloat(formData.get('jumlah'));
    const price = parseFloat(formData.get('harga_satuan'));
    const totalPrice = quantity * price;
    const editId = this.dataset.editId;
    
    const itemData = {
        id: editId ? parseInt(editId) : Date.now(),
        item: formData.get('item'),
        jumlah: quantity,
        satuan: formData.get('satuan'),
        harga_satuan: price,
        total_harga: totalPrice,
        keterangan: formData.get('keterangan') || '',
        completed: false
    };
    
    if (editId) {
        // Update existing item
        const index = currentShoppingItems.findIndex(item => item.id === parseInt(editId));
        if (index !== -1) {
            // Preserve completion status
            itemData.completed = currentShoppingItems[index].completed;
            currentShoppingItems[index] = itemData;
        }
        
        // Reset form state
        delete this.dataset.editId;
        document.querySelector('#addItemModal .modal-header h2').textContent = 'Tambah Item Belanja';
        document.querySelector('#addItemForm button[type="submit"]').textContent = 'Tambah Item';
        
        showToast('success', 'Item berhasil diperbarui!');
    } else {
        // Add new item
        currentShoppingItems.push(itemData);
        showToast('success', 'Item berhasil ditambahkan!');
    }
    
    // Close modal and update display
    closeAddItemModal();
    renderShoppingChecklist();
    updateShoppingSummary();
});
