# TummyMate Database Schema (Future Backend)

## Database Design

### Users Table

```sql
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nama VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Meal Plan Table

```sql
CREATE TABLE meal_plan (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    jenis_rencana ENUM('sarapan', 'makan_siang', 'makan_malam', 'snack') NOT NULL,
    tanggal DATE NOT NULL,
    minggu_ke INT NOT NULL,
    tahun INT NOT NULL,
    hari ENUM('senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu', 'minggu') NOT NULL,
    waktu_makan ENUM('pagi', 'siang', 'sore', 'malam') NOT NULL,
    menu VARCHAR(255) NOT NULL,
    catatan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Shopping Log Table

```sql
CREATE TABLE shopping_log (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    tanggal DATE NOT NULL,
    item VARCHAR(255) NOT NULL,
    jumlah INT NOT NULL,
    satuan ENUM('kg', 'gram', 'liter', 'ml', 'pcs', 'pack', 'botol', 'kaleng') NOT NULL,
    harga_satuan DECIMAL(10,2) NOT NULL,
    total_harga DECIMAL(10,2) NOT NULL,
    foto_struk VARCHAR(255),
    keterangan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Jajan Log Table

```sql
CREATE TABLE jajan_log (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    tanggal DATE NOT NULL,
    tempat VARCHAR(255) NOT NULL,
    makanan VARCHAR(255) NOT NULL,
    harga DECIMAL(10,2) NOT NULL,
    kategori ENUM('makanan_berat', 'snack', 'minuman', 'dessert', 'fast_food', 'tradisional', 'lainnya') NOT NULL,
    foto_tempat VARCHAR(255),
    catatan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## Additional Tables (Normalization & Enhancement)

### Categories Table (Optional)

```sql
CREATE TABLE categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    type ENUM('meal', 'food', 'shopping') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Ingredients Table (Future Enhancement)

```sql
CREATE TABLE ingredients (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    category VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Recipe Table (Future Enhancement)

```sql
CREATE TABLE recipes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    instructions TEXT,
    prep_time INT, -- in minutes
    cook_time INT, -- in minutes
    servings INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Recipe Ingredients Table (Future Enhancement)

```sql
CREATE TABLE recipe_ingredients (
    id INT PRIMARY KEY AUTO_INCREMENT,
    recipe_id INT NOT NULL,
    ingredient_id INT NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
    FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE CASCADE
);
```

### Budget Table (Future Enhancement)

```sql
CREATE TABLE budgets (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    month INT NOT NULL,
    year INT NOT NULL,
    shopping_budget DECIMAL(10,2) DEFAULT 0,
    jajan_budget DECIMAL(10,2) DEFAULT 0,
    total_budget DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_month_year (user_id, month, year)
);
```

## Database Indexes (Performance)

```sql
-- Indexes for better performance
CREATE INDEX idx_meal_plan_user_date ON meal_plan(user_id, tanggal);
CREATE INDEX idx_shopping_user_date ON shopping_log(user_id, tanggal);
CREATE INDEX idx_jajan_user_date ON jajan_log(user_id, tanggal);
CREATE INDEX idx_meal_plan_date ON meal_plan(tanggal);
CREATE INDEX idx_shopping_date ON shopping_log(tanggal);
CREATE INDEX idx_jajan_date ON jajan_log(tanggal);
```

## Sample Data

### Sample Users

```sql
INSERT INTO users (nama, email, password) VALUES
('John Doe', 'john@example.com', '$2b$10$hashed_password'),
('Jane Smith', 'jane@example.com', '$2b$10$hashed_password');
```

### Sample Meal Plans

```sql
INSERT INTO meal_plan (user_id, jenis_rencana, tanggal, minggu_ke, tahun, hari, waktu_makan, menu, catatan) VALUES
(1, 'sarapan', '2025-01-15', 3, 2025, 'senin', 'pagi', 'Nasi Goreng Telur', 'Tambah sayuran'),
(1, 'makan_siang', '2025-01-15', 3, 2025, 'senin', 'siang', 'Ayam Bakar + Nasi', 'Dengan sambal terasi');
```

### Sample Shopping

```sql
INSERT INTO shopping_log (user_id, tanggal, item, jumlah, satuan, harga_satuan, total_harga, keterangan) VALUES
(1, '2025-01-15', 'Beras', 5, 'kg', 12000, 60000, 'Beras premium'),
(1, '2025-01-15', 'Telur', 1, 'kg', 25000, 25000, 'Telur ayam negeri');
```

### Sample Jajan

```sql
INSERT INTO jajan_log (user_id, tanggal, tempat, makanan, harga, kategori, catatan) VALUES
(1, '2025-01-15', 'Warung Mak Ijah', 'Nasi Gudeg', 15000, 'makanan_berat', 'Enak banget'),
(1, '2025-01-15', 'Starbucks', 'Latte', 45000, 'minuman', 'Meeting client');
```

## Views (Database Views for Easy Queries)

### Monthly Expense Summary

```sql
CREATE VIEW monthly_expense_summary AS
SELECT
    u.id as user_id,
    u.nama,
    YEAR(s.tanggal) as year,
    MONTH(s.tanggal) as month,
    SUM(s.total_harga) as shopping_total,
    SUM(j.harga) as jajan_total,
    (SUM(s.total_harga) + SUM(j.harga)) as total_expense
FROM users u
LEFT JOIN shopping_log s ON u.id = s.user_id
LEFT JOIN jajan_log j ON u.id = j.user_id
GROUP BY u.id, YEAR(s.tanggal), MONTH(s.tanggal);
```

### Weekly Meal Plan

```sql
CREATE VIEW weekly_meal_plan AS
SELECT
    u.id as user_id,
    u.nama,
    m.minggu_ke,
    m.tahun,
    m.hari,
    GROUP_CONCAT(CONCAT(m.jenis_rencana, ': ', m.menu) SEPARATOR '; ') as daily_menu
FROM users u
JOIN meal_plan m ON u.id = m.user_id
GROUP BY u.id, m.minggu_ke, m.tahun, m.hari
ORDER BY u.id, m.tahun, m.minggu_ke,
    FIELD(m.hari, 'senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu', 'minggu');
```

## Stored Procedures (Optional)

### Get User Statistics

```sql
DELIMITER //
CREATE PROCEDURE GetUserStatistics(IN p_user_id INT)
BEGIN
    SELECT
        (SELECT COUNT(*) FROM meal_plan WHERE user_id = p_user_id) as total_meals,
        (SELECT COUNT(*) FROM shopping_log WHERE user_id = p_user_id) as total_shopping,
        (SELECT COUNT(*) FROM jajan_log WHERE user_id = p_user_id) as total_jajan,
        (SELECT SUM(total_harga) FROM shopping_log WHERE user_id = p_user_id) as total_shopping_expense,
        (SELECT SUM(harga) FROM jajan_log WHERE user_id = p_user_id) as total_jajan_expense;
END //
DELIMITER ;
```

## Database Connection (Node.js Example)

```javascript
// database.js
const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "tummymate",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = pool;
```

---

_Database schema designed for TummyMate application with normalization and future scalability in mind._
