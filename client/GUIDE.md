# TummyMate Project Files

## File Structure

```
TummyMate/
├── index.html          # Main HTML file - Entry point aplikasi
├── css/
│   └── style.css       # Main stylesheet - Semua styling aplikasi
├── js/
│   └── app.js          # Main JavaScript - Logic dan interaktivitas
├── README.md           # Project documentation
└── .gitignore          # Git ignore file
```

## Quick Start Guide

### 1. Setup Project

1. Pastikan semua file berada dalam struktur folder yang benar
2. Buka `index.html` di browser modern (Chrome, Firefox, Safari, Edge)
3. Aplikasi akan otomatis load dengan loading screen

### 2. Navigation

- **Dashboard**: Halaman utama dengan ringkasan data
- **Meal Plan**: Perencanaan menu dengan kalender interaktif
- **Belanja**: Pencatatan belanja dengan foto struk
- **Jajan Log**: Pencatatan makan luar dengan foto tempat
- **Profile**: Informasi user dan statistik

### 3. Fitur Utama

#### Tambah Menu (Meal Plan)

1. Klik "Tambah Menu" di Dashboard atau Meal Plan
2. Isi form dengan data menu
3. Pilih tanggal, jenis makanan, dan waktu
4. Tambahkan catatan jika perlu
5. Klik "Simpan Menu"

#### Tambah Belanja

1. Klik "Tambah Belanja"
2. Isi item, jumlah, satuan, dan harga
3. Total harga akan otomatis terhitung
4. Upload foto struk (opsional)
5. Tambahkan keterangan jika perlu
6. Klik "Simpan Belanja"

#### Tambah Jajan

1. Klik "Tambah Jajan"
2. Isi tempat, makanan, harga, dan kategori
3. Upload foto tempat (opsional)
4. Tambahkan catatan jika perlu
5. Klik "Simpan Jajan"

### 4. Data Storage

- Semua data tersimpan di Local Storage browser
- Data persisten selama cache browser tidak dibersihkan
- Format data: JSON

### 5. Responsive Design

- Mobile-first approach
- Breakpoints:
  - Mobile: 320px - 767px
  - Tablet: 768px - 1199px
  - Desktop: 1200px+

## Technical Details

### HTML Structure

- Semantic HTML5 elements
- Accessible form controls
- Modal dialogs for data entry
- Progressive enhancement

### CSS Features

- CSS Custom Properties untuk theming
- CSS Grid & Flexbox untuk layout
- Smooth animations dengan CSS transitions
- Modern design dengan subtle shadows dan rounded corners
- Color-coded components untuk user experience

### JavaScript Architecture

- ES6+ Class-based structure
- Event-driven programming
- Modular functions
- Local Storage API untuk data persistence
- File reader API untuk image handling

### Browser Compatibility

- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+

## Development Notes

### CSS Organization

- Variabel CSS untuk konsistensi design
- Komponen-based styling
- Utility classes untuk spacing dan typography
- Responsive breakpoints dengan media queries

### JavaScript Patterns

- Constructor pattern untuk initialization
- Event delegation untuk dynamic content
- Promise-based file handling
- Template literals untuk HTML generation

### Performance Considerations

- Minimal external dependencies
- Optimized image handling
- Efficient DOM manipulation
- Lazy loading untuk large lists

## Future Backend Integration

Ketika backend sudah ready, struktur yang sudah ada dapat dengan mudah diintegrasikan:

### API Endpoints (Planning)

```
GET    /api/meal-plans
POST   /api/meal-plans
PUT    /api/meal-plans/:id
DELETE /api/meal-plans/:id

GET    /api/shopping
POST   /api/shopping
PUT    /api/shopping/:id
DELETE /api/shopping/:id

GET    /api/jajan
POST   /api/jajan
PUT    /api/jajan/:id
DELETE /api/jajan/:id

GET    /api/user/profile
PUT    /api/user/profile
```

### Database Schema (MySQL Planning)

Sesuai dengan ERD yang sudah ada:

- users table
- meal_plan table
- shopping_log table
- jajan_log table

## Troubleshooting

### Common Issues

1. **Data hilang**: Cek apakah Local Storage browser ter-clear
2. **Layout broken**: Pastikan CSS file ter-load dengan benar
3. **JavaScript error**: Buka Developer Tools untuk debug
4. **Image tidak muncul**: Cek format file dan size

### Debug Mode

Buka Developer Tools (F12) untuk:

- Melihat console errors
- Inspect Local Storage data
- Monitor network requests
- Test responsive design

---

Created with ❤️ for TummyMate Project
