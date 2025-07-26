# Shopping API Documentation

## Base URL

`/shopping`

## Authentication

Semua endpoint memerlukan authentication token di header:

```
Authorization: Bearer <token>
```

---

## Endpoints

### 1. GET /shopping

**Mendapatkan semua shopping log milik user**

**Response Success (200):**

```json
{
  "success": true,
  "message": "Shopping logs successfully retrieved",
  "data": [
    {
      "id_shoppinglog": 1,
      "topik_belanja": "Belanja Bulanan",
      "nama_toko": "Supermarket ABC",
      "tanggal_belanja": "2025-01-15T00:00:00.000Z",
      "status": "Selesai",
      "struk": "/uploads/struk123.jpg",
      "total_belanja": 250000,
      "id_user": 1,
      "user": {
        "nama_pengguna": "John Doe"
      },
      "shoppingDetails": [
        {
          "id_shoppingDetail": 1,
          "nama_item": "Beras",
          "jumlah_item": 5,
          "satuan": "Kilogram",
          "harga": 75000,
          "id_shoppinglog": 1
        }
      ]
    }
  ]
}
```

---

### 2. GET /shopping/:id

**Mendapatkan shopping log spesifik berdasarkan ID**

**Parameters:**

- `id` (number) - ID shopping log

**Response Success (200):**

```json
{
  "success": true,
  "message": "Shopping log successfully retrieved",
  "data": {
    "id_shoppinglog": 1,
    "topik_belanja": "Belanja Bulanan",
    "nama_toko": "Supermarket ABC",
    "tanggal_belanja": "2025-01-15T00:00:00.000Z",
    "status": "Selesai",
    "struk": "/uploads/struk123.jpg",
    "total_belanja": 250000,
    "id_user": 1,
    "user": {
      "nama_pengguna": "John Doe"
    },
    "shoppingDetails": [...]
  }
}
```

**Response Error (404):**

```json
{
  "success": false,
  "message": "Shopping log not found"
}
```

---

### 3. GET /shopping/status/:status

**Mendapatkan shopping log berdasarkan status**

**Parameters:**

- `status` (string) - "Direncanakan" atau "Selesai"

**Response Success (200):**

```json
{
  "success": true,
  "message": "Shopping logs with status Direncanakan successfully retrieved",
  "data": [...]
}
```

---

### 4. POST /shopping

**Membuat shopping log baru**

**Request Body:**

```json
{
  "topik_belanja": "Belanja Mingguan",
  "nama_toko": "Minimarket XYZ",
  "tanggal_belanja": "2025-01-20",
  "status": "Direncanakan",
  "struk": null,
  "total_belanja": null,
  "items": [
    {
      "nama_item": "Susu",
      "jumlah_item": 2,
      "satuan": "Liter",
      "harga": 25000
    },
    {
      "nama_item": "Roti",
      "jumlah_item": 1,
      "satuan": "Pack",
      "harga": 15000
    }
  ]
}
```

**Response Success (201):**

```json
{
  "success": true,
  "message": "Shopping log successfully created",
  "data": {
    "id_shoppinglog": 2,
    "topik_belanja": "Belanja Mingguan",
    "nama_toko": "Minimarket XYZ",
    "tanggal_belanja": "2025-01-20T00:00:00.000Z",
    "status": "Direncanakan",
    "struk": null,
    "total_belanja": null,
    "id_user": 1,
    "user": {
      "nama_pengguna": "John Doe"
    },
    "shoppingDetails": [...]
  }
}
```

---

### 5. PUT /shopping/:id

**Update shopping log**

**Parameters:**

- `id` (number) - ID shopping log

**Request Body:**

```json
{
  "topik_belanja": "Belanja Mingguan Updated",
  "nama_toko": "Minimarket XYZ",
  "tanggal_belanja": "2025-01-20",
  "status": "Selesai",
  "struk": "/uploads/struk456.jpg",
  "total_belanja": 45000,
  "items": [
    {
      "nama_item": "Susu",
      "jumlah_item": 3,
      "satuan": "Liter",
      "harga": 30000
    }
  ]
}
```

**Response Success (200):**

```json
{
  "success": true,
  "message": "Shopping log successfully updated",
  "data": {...}
}
```

---

### 6. DELETE /shopping/:id

**Hapus shopping log**

**Parameters:**

- `id` (number) - ID shopping log

**Response Success (200):**

```json
{
  "success": true,
  "message": "Shopping log successfully deleted"
}
```

---

## Error Responses

### 400 Bad Request

```json
{
  "success": false,
  "message": "Error message here"
}
```

### 401 Unauthorized

```json
{
  "success": false,
  "message": "Unauthorized: You do not own this record"
}
```

### 404 Not Found

```json
{
  "success": false,
  "message": "Shopping log not found"
}
```

---

## Field Validations

### Required Fields (POST):

- `topik_belanja` (string)
- `nama_toko` (string)

### Optional Fields:

- `tanggal_belanja` (ISO date string)
- `status` (enum: "Direncanakan" | "Selesai")
- `struk` (string - path to receipt image)
- `total_belanja` (number)
- `items` (array of shopping detail objects)

### Shopping Detail Item Fields:

- `nama_item` (string, required)
- `jumlah_item` (number, required)
- `satuan` (enum: "Kilogram", "Gram", "Liter", "Mililiter", "Pieces", "Pack", "Botol", "Kaleng", "Dus")
- `harga` (number, default: 0)

---

## Usage Examples

### Creating a simple shopping log without items:

```bash
curl -X POST http://localhost:3000/shopping \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "topik_belanja": "Belanja Darurat",
    "nama_toko": "Warung Pak RT"
  }'
```

### Getting all shopping logs:

```bash
curl -X GET http://localhost:3000/shopping \
  -H "Authorization: Bearer <token>"
```

### Getting planned shopping only:

```bash
curl -X GET http://localhost:3000/shopping/status/Direncanakan \
  -H "Authorization: Bearer <token>"
```
