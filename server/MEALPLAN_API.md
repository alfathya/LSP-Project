# Meal Plan API Documentation

## Base URL

`/mealplan`

## Authentication

Semua endpoint memerlukan authentication token di header:

```
Authorization: Bearer <token>
```

---

## Endpoints

### 1. GET /mealplan

**Mendapatkan semua meal plan milik user**

**Response Success (200):**

```json
{
  "success": true,
  "message": "Meal plans successfully retrieved",
  "data": [
    {
      "id_mealplan": 1,
      "id_user": 1,
      "tanggal": "2025-07-21T00:00:00.000Z",
      "hari": "Senin",
      "user": {
        "nama_pengguna": "John Doe"
      },
      "sessions": [
        {
          "id_session": 1,
          "id_mealplan": 1,
          "waktu_makan": "Sarapan",
          "menus": [
            {
              "id_mealmenu": 1,
              "id_session": 1,
              "nama_menu": "Nasi Goreng",
              "catatan_menu": "Pakai telur"
            },
            {
              "id_mealmenu": 2,
              "id_session": 1,
              "nama_menu": "Jus Alpukat",
              "catatan_menu": null
            }
          ]
        }
      ]
    }
  ]
}
```

---

### 2. POST /mealplan

**Membuat meal plan baru dengan sessions dan menus**

**Request Body:**

```json
{
  "tanggal": "2025-07-21",
  "hari": "Senin",
  "sessions": [
    {
      "waktu_makan": "Sarapan",
      "menus": [
        {
          "nama_menu": "Nasi Goreng",
          "catatan_menu": "Pakai telur dan sayuran"
        },
        {
          "nama_menu": "Telur Rebus",
          "catatan_menu": null
        },
        {
          "nama_menu": "Jus Alpukat",
          "catatan_menu": "Tanpa gula"
        }
      ]
    },
    {
      "waktu_makan": "Makan_siang",
      "menus": [
        {
          "nama_menu": "Nasi Padang",
          "catatan_menu": "Rendang dan sayur"
        },
        {
          "nama_menu": "Teh Tawar",
          "catatan_menu": null
        }
      ]
    },
    {
      "waktu_makan": "Makan_malam",
      "menus": [
        {
          "nama_menu": "Oat Meal",
          "catatan_menu": "Dengan buah"
        }
      ]
    },
    {
      "waktu_makan": "Cemilan",
      "menus": [
        {
          "nama_menu": "Kacang",
          "catatan_menu": "Kacang tanah panggang"
        }
      ]
    }
  ]
}
```

**Response Success (201):**

```json
{
  "success": true,
  "message": "Meal plan successfully created",
  "data": {
    "id_mealplan": 1,
    "id_user": 1,
    "tanggal": "2025-07-21T00:00:00.000Z",
    "hari": "Senin",
    "user": {
      "nama_pengguna": "John Doe"
    },
    "sessions": [...]
  }
}
```

---

### 3. GET /mealplan/:id

**Mendapatkan meal plan spesifik berdasarkan ID**

**Parameters:**

- `id` (number) - ID meal plan

**Response Success (200):**

```json
{
  "success": true,
  "message": "Meal plan successfully retrieved",
  "data": {
    "id_mealplan": 1,
    "id_user": 1,
    "tanggal": "2025-07-21T00:00:00.000Z",
    "hari": "Senin",
    "user": {
      "nama_pengguna": "John Doe"
    },
    "sessions": [...]
  }
}
```

---

### 4. PUT /mealplan/:id

**Update meal plan**

**Parameters:**

- `id` (number) - ID meal plan

**Request Body:**

```json
{
  "tanggal": "2025-07-21",
  "hari": "Senin",
  "sessions": [
    {
      "waktu_makan": "Sarapan",
      "menus": [
        {
          "nama_menu": "Roti Bakar",
          "catatan_menu": "Dengan selai kacang"
        }
      ]
    }
  ]
}
```

**Response Success (200):**

```json
{
  "success": true,
  "message": "Meal plan successfully updated",
  "data": {...}
}
```

---

### 5. DELETE /mealplan/:id

**Hapus meal plan**

**Parameters:**

- `id` (number) - ID meal plan

**Response Success (200):**

```json
{
  "success": true,
  "message": "Meal plan successfully deleted"
}
```

---

### 6. GET /mealplan/date/:date

**Mendapatkan meal plan untuk tanggal tertentu**

**Parameters:**

- `date` (string) - Tanggal dalam format YYYY-MM-DD

**Response Success (200):**

```json
{
  "success": true,
  "message": "Meal plan successfully retrieved",
  "data": {
    "id_mealplan": 1,
    "id_user": 1,
    "tanggal": "2025-07-21T00:00:00.000Z",
    "hari": "Senin",
    "sessions": [...]
  }
}
```

---

### 7. GET /mealplan/range

**Mendapatkan meal plan dalam rentang tanggal**

**Query Parameters:**

- `startDate` (string) - Tanggal mulai (YYYY-MM-DD)
- `endDate` (string) - Tanggal akhir (YYYY-MM-DD)

**Example:** `/mealplan/range?startDate=2025-07-21&endDate=2025-07-27`

**Response Success (200):**

```json
{
  "success": true,
  "message": "Meal plans successfully retrieved",
  "data": [...]
}
```

---

### 8. POST /mealplan/:mealPlanId/sessions

**Menambahkan session baru ke meal plan yang sudah ada**

**Parameters:**

- `mealPlanId` (number) - ID meal plan

**Request Body:**

```json
{
  "waktu_makan": "Cemilan",
  "menus": [
    {
      "nama_menu": "Biskuit",
      "catatan_menu": "Biskuit gandum"
    }
  ]
}
```

**Response Success (201):**

```json
{
  "success": true,
  "message": "Meal plan session successfully added",
  "data": {
    "id_session": 5,
    "id_mealplan": 1,
    "waktu_makan": "Cemilan",
    "menus": [...]
  }
}
```

---

### 9. POST /mealplan/sessions/:sessionId/menus

**Menambahkan menu baru ke session yang sudah ada**

**Parameters:**

- `sessionId` (number) - ID session

**Request Body:**

```json
{
  "nama_menu": "Es Teh",
  "catatan_menu": "Dingin, tanpa gula"
}
```

**Response Success (201):**

```json
{
  "success": true,
  "message": "Menu successfully added to session",
  "data": {
    "id_mealmenu": 10,
    "id_session": 1,
    "nama_menu": "Es Teh",
    "catatan_menu": "Dingin, tanpa gula"
  }
}
```

---

## Field Validations

### Required Fields (POST Meal Plan):

- `tanggal` (string) - Tanggal dalam format ISO (YYYY-MM-DD)
- `hari` (enum) - Hari dalam seminggu

### Optional Fields:

- `sessions` (array) - Array of session objects

### Session Object:

- `waktu_makan` (enum) - "Sarapan", "Makan_siang", "Makan_malam", "Cemilan"
- `menus` (array) - Array of menu objects

### Menu Object:

- `nama_menu` (string, required) - Nama menu makanan
- `catatan_menu` (string, optional) - Catatan tambahan

### Enum Values:

**Hari:**

- `Senin`, `Selasa`, `Rabu`, `Kamis`, `Jumat`, `Sabtu`, `Minggu`

**WaktuMakan:**

- `Sarapan`, `Makan_siang`, `Makan_malam`, `Cemilan`

---

## Usage Examples

### 1. Membuat meal plan lengkap untuk satu hari

```bash
curl -X POST http://localhost:3000/mealplan \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "tanggal": "2025-07-21",
    "hari": "Senin",
    "sessions": [
      {
        "waktu_makan": "Sarapan",
        "menus": [
          {
            "nama_menu": "Nasi Goreng",
            "catatan_menu": "Pakai telur"
          },
          {
            "nama_menu": "Jus Jeruk",
            "catatan_menu": null
          }
        ]
      },
      {
        "waktu_makan": "Makan_siang",
        "menus": [
          {
            "nama_menu": "Ayam Geprek",
            "catatan_menu": "Level 3"
          }
        ]
      }
    ]
  }'
```

### 2. Mendapatkan meal plan untuk tanggal tertentu

```bash
curl -X GET http://localhost:3000/mealplan/date/2025-07-21 \
  -H "Authorization: Bearer <token>"
```

### 3. Mendapatkan meal plan untuk seminggu

```bash
curl -X GET "http://localhost:3000/mealplan/range?startDate=2025-07-21&endDate=2025-07-27" \
  -H "Authorization: Bearer <token>"
```

### 4. Menambahkan session cemilan ke meal plan yang sudah ada

```bash
curl -X POST http://localhost:3000/mealplan/1/sessions \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "waktu_makan": "Cemilan",
    "menus": [
      {
        "nama_menu": "Keripik",
        "catatan_menu": "Keripik singkong"
      }
    ]
  }'
```

### 5. Menambahkan menu ke session yang sudah ada

```bash
curl -X POST http://localhost:3000/mealplan/sessions/1/menus \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "nama_menu": "Kopi",
    "catatan_menu": "Kopi hitam tanpa gula"
  }'
```

---

## Complete Meal Plan Flow Example

### Scenario: Membuat meal plan untuk Kamis, 21 Juli 2025

```bash
# 1. Buat meal plan dengan semua session dan menu
curl -X POST http://localhost:3000/mealplan \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "tanggal": "2025-07-21",
    "hari": "Kamis",
    "sessions": [
      {
        "waktu_makan": "Sarapan",
        "menus": [
          {
            "nama_menu": "Nasi Goreng",
            "catatan_menu": "Dengan telur dan sayuran"
          },
          {
            "nama_menu": "Telur Rebus",
            "catatan_menu": null
          },
          {
            "nama_menu": "Jus Alpukat",
            "catatan_menu": "Tanpa gula tambahan"
          }
        ]
      },
      {
        "waktu_makan": "Makan_siang",
        "menus": [
          {
            "nama_menu": "Nasi Padang",
            "catatan_menu": "Rendang dan sayur asem"
          },
          {
            "nama_menu": "Teh Tawar",
            "catatan_menu": "Hangat"
          }
        ]
      },
      {
        "waktu_makan": "Makan_malam",
        "menus": [
          {
            "nama_menu": "Oat Meal",
            "catatan_menu": "Dengan potongan buah"
          }
        ]
      },
      {
        "waktu_makan": "Cemilan",
        "menus": [
          {
            "nama_menu": "Kacang",
            "catatan_menu": "Kacang tanah panggang"
          }
        ]
      }
    ]
  }'

# 2. Lihat hasil meal plan yang dibuat
curl -X GET http://localhost:3000/mealplan/date/2025-07-21 \
  -H "Authorization: Bearer <token>"
```

---

## Benefits

✅ **Flexible Meal Planning** - Bisa buat meal plan dengan multiple sessions dan menus  
✅ **Hierarchical Structure** - Meal Plan → Sessions → Menus  
✅ **Date Range Queries** - Ambil meal plan untuk rentang tanggal tertentu  
✅ **Individual Management** - Tambah session/menu ke meal plan yang sudah ada  
✅ **User Authorization** - Setiap user hanya bisa akses meal plan miliknya  
✅ **Transaction Support** - Semua operasi menggunakan database transaction

_Meal Plan API untuk TummyMate v1.0_
