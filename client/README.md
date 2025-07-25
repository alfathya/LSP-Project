# TummyMate - Asisten Dapur Pribadi

TummyMate adalah aplikasi web yang berfungsi sebagai asisten pribadi untuk membantu pengguna dalam manajemen dapur. Aplikasi ini menyediakan fitur pencatatan belanja, perencanaan menu masakan, dan pelacakan pengeluaran makan di luar.

## 🎯 Tujuan Aplikasi

Aplikasi ini berfungsi sebagai asisten pribadi untuk membantu pengguna dalam:

- Manajemen dapur untuk pencatatan belanja
- Merencanakan menu masakan
- Melacak pengeluaran makan di luar

## 👥 Target Pengguna

- Individu
- Pasangan muda
- Keluarga kecil

## 🚀 Fitur Utama

### 1. 📅 Meal Plan

- Perencanaan menu masak harian/mingguan
- Kalender interaktif untuk melihat menu
- Kategorisasi berdasarkan jenis makanan (sarapan, makan siang, makan malam, snack)
- Catatan tambahan untuk setiap menu

### 2. 🛒 Daftar Belanja

- Pencatatan belanja dengan detail lengkap
- Upload foto struk belanja
- Perhitungan otomatis total harga
- Statistik pengeluaran bulanan
- Berbagai satuan (kg, gram, liter, pieces, dll.)

### 3. 🍕 Jajan Log

- Pencatatan makan di luar rumah
- Detail tempat dan makanan
- Upload foto tempat
- Kategorisasi makanan
- Analisis kategori favorit dan pengeluaran

### 4. 📊 Dashboard

- Ringkasan statistik keseluruhan
- Menu hari ini
- Belanja terbaru
- Total pengeluaran

### 5. 👤 Profile

- Informasi pengguna
- Statistik aktivitas
- Edit profile

## 🛠️ Teknologi yang Digunakan

### Client Side

- **HTML5** - Struktur aplikasi
- **CSS3** - Styling dengan design modern dan responsif
- **JavaScript (Vanilla)** - Interaktivitas dan logika aplikasi
- **Font Awesome** - Icons
- **Google Fonts (Inter)** - Typography

### Fitur CSS Modern

- CSS Grid & Flexbox untuk layout responsif
- CSS Custom Properties (CSS Variables)
- Smooth animations dan transitions
- Mobile-first responsive design
- Modern color palette dengan gradient

### Fitur JavaScript

- Modern ES6+ syntax
- Class-based architecture
- Local Storage untuk persistensi data
- Event-driven programming
- Modular code structure

## 📱 Responsivitas

Aplikasi didesain dengan pendekatan mobile-first dan fully responsive:

- ✅ Desktop (1200px+)
- ✅ Tablet (768px - 1199px)
- ✅ Mobile (320px - 767px)

## 🎨 Design System

### Color Palette

- **Primary**: #FF6B6B (Coral Red)
- **Secondary**: #4ECDC4 (Turquoise)
- **Accent**: #FFE66D (Sunny Yellow)
- **Background**: #F8F9FA (Light Gray)
- **Surface**: #FFFFFF (White)

### Typography

- **Font Family**: Inter (Google Fonts)
- **Font Sizes**: 12px - 32px (responsive scale)
- **Font Weights**: 300, 400, 500, 600, 700

## 📁 Struktur Project

```
TummyMate/
├── index.html          # Main HTML file
├── css/
│   └── style.css       # Main stylesheet
├── js/
│   └── app.js          # Main JavaScript application
└── README.md           # Project documentation
```

## 🚀 Cara Menjalankan

1. **Clone atau download project**

   ```bash
   git clone <repository-url>
   cd TummyMate
   ```

2. **Buka di browser**

   - Buka file `index.html` di browser
   - Atau gunakan live server untuk development

3. **Untuk development dengan live server**

   ```bash
   # Jika menggunakan VS Code dengan Live Server extension
   # Klik kanan pada index.html -> Open with Live Server

   # Atau menggunakan Python
   python -m http.server 8000

   # Atau menggunakan Node.js
   npx http-server
   ```

## 💾 Data Storage

Aplikasi menggunakan **Local Storage** browser untuk menyimpan data:

- `mealPlans` - Data rencana menu
- `shopping` - Data belanja
- `jajan` - Data jajan/makan luar
- `user` - Data profil pengguna

## 🎯 Roadmap & Future Enhancements

### Phase 1 - Backend Integration (Future)

- [ ] Node.js API server
- [ ] MySQL database integration
- [ ] User authentication
- [ ] Data synchronization

### Phase 2 - Advanced Features

- [ ] Export data ke PDF/Excel
- [ ] Backup & restore data
- [ ] Multiple user support
- [ ] Recipe suggestions
- [ ] Budget planning & alerts

### Phase 3 - Mobile App

- [ ] Progressive Web App (PWA)
- [ ] Mobile app version
- [ ] Push notifications
- [ ] Offline support

## 🐛 Known Issues

- Data tersimpan di Local Storage (akan hilang jika cache browser dibersihkan)
- Foto disimpan sebagai base64 (dapat membuat storage besar)
- Belum ada validasi file size untuk upload foto

## 🤝 Kontribusi

Kontribusi sangat diterima! Silakan:

1. Fork repository
2. Buat feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buka Pull Request

## 📄 License

Project ini dibuat untuk keperluan pembelajaran dan pengembangan portfolio.

## 📞 Kontak

Jika ada pertanyaan atau saran, silakan hubungi melalui:

- Email: [your-email@example.com]
- GitHub: [your-github-username]

---

**TummyMate** - Your Personal Kitchen Assistant 🍳✨
