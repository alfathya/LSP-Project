# Shopping Details API Documentation

## Base URL

`/shopping`

## Authentication

Semua endpoint memerlukan authentication token di header:

```
Authorization: Bearer <token>
```

---

## Shopping Details Endpoints

### 1. GET /shopping/:shoppingLogId/details

**Mendapatkan semua detail items dari shopping log tertentu**

**Parameters:**

- `shoppingLogId` (number) - ID shopping log

**Response Success (200):**

```json
{
  "success": true,
  "message": "Shopping details successfully retrieved",
  "data": [
    {
      "id_shoppingDetail": 1,
      "nama_item": "Beras",
      "jumlah_item": 5,
      "satuan": "Kilogram",
      "harga": 75000,
      "id_shoppinglog": 1
    },
    {
      "id_shoppingDetail": 2,
      "nama_item": "Minyak Goreng",
      "jumlah_item": 2,
      "satuan": "Liter",
      "harga": 30000,
      "id_shoppinglog": 1
    }
  ]
}
```

---

### 2. POST /shopping/:shoppingLogId/details

**Menambahkan item baru ke shopping log**

**Parameters:**

- `shoppingLogId` (number) - ID shopping log

**Request Body:**

```json
{
  "nama_item": "Gula Pasir",
  "jumlah_item": 1,
  "satuan": "Kilogram",
  "harga": 15000
}
```

**Response Success (201):**

```json
{
  "success": true,
  "message": "Shopping detail successfully created",
  "data": {
    "id_shoppingDetail": 3,
    "nama_item": "Gula Pasir",
    "jumlah_item": 1,
    "satuan": "Kilogram",
    "harga": 15000,
    "id_shoppinglog": 1
  }
}
```

---

### 3. PUT /shopping/details/:detailId

**Update item shopping detail**

**Parameters:**

- `detailId` (number) - ID shopping detail

**Request Body:**

```json
{
  "nama_item": "Gula Pasir Premium",
  "jumlah_item": 2,
  "satuan": "Kilogram",
  "harga": 32000
}
```

**Response Success (200):**

```json
{
  "success": true,
  "message": "Shopping detail successfully updated",
  "data": {
    "id_shoppingDetail": 3,
    "nama_item": "Gula Pasir Premium",
    "jumlah_item": 2,
    "satuan": "Kilogram",
    "harga": 32000,
    "id_shoppinglog": 1
  }
}
```

---

### 4. DELETE /shopping/details/:detailId

**Hapus item shopping detail**

**Parameters:**

- `detailId` (number) - ID shopping detail

**Response Success (200):**

```json
{
  "success": true,
  "message": "Shopping detail successfully deleted"
}
```

---

## Field Validations

### Required Fields (POST/PUT Shopping Detail):

- `nama_item` (string) - Nama item yang dibeli
- `jumlah_item` (number) - Jumlah item
- `satuan` (enum) - Satuan item
- `harga` (number) - Harga item (default: 0)

### Satuan Values:

- `Kilogram`
- `Gram`
- `Liter`
- `Mililiter`
- `Pieces`
- `Pack`
- `Botol`
- `Kaleng`
- `Dus`

---

## Error Responses

### 400 Bad Request

```json
{
  "success": false,
  "message": "Invalid shopping log ID"
}
```

### 401 Unauthorized

```json
{
  "success": false,
  "message": "Unauthorized: You do not own this shopping log"
}
```

### 404 Not Found

```json
{
  "success": false,
  "message": "Shopping detail not found"
}
```

---

## Usage Examples

### 1. Menambahkan item baru ke shopping log

```bash
curl -X POST http://localhost:3000/shopping/1/details \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "nama_item": "Telur Ayam",
    "jumlah_item": 1,
    "satuan": "Pack",
    "harga": 25000
  }'
```

### 2. Mendapatkan semua items dari shopping log

```bash
curl -X GET http://localhost:3000/shopping/1/details \
  -H "Authorization: Bearer <token>"
```

### 3. Update item shopping detail

```bash
curl -X PUT http://localhost:3000/shopping/details/3 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "nama_item": "Telur Ayam Kampung",
    "jumlah_item": 2,
    "satuan": "Pack",
    "harga": 45000
  }'
```

### 4. Hapus item shopping detail

```bash
curl -X DELETE http://localhost:3000/shopping/details/3 \
  -H "Authorization: Bearer <token>"
```

---

## Complete Shopping Flow Example

### 1. Buat shopping log kosong

```bash
curl -X POST http://localhost:3000/shopping \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "topik_belanja": "Belanja Harian",
    "nama_toko": "Warung Pak RT",
    "status": "Direncanakan"
  }'
```

### 2. Tambahkan items satu per satu

```bash
# Tambah item 1
curl -X POST http://localhost:3000/shopping/1/details \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "nama_item": "Beras",
    "jumlah_item": 5,
    "satuan": "Kilogram",
    "harga": 75000
  }'

# Tambah item 2
curl -X POST http://localhost:3000/shopping/1/details \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "nama_item": "Minyak Goreng",
    "jumlah_item": 2,
    "satuan": "Liter",
    "harga": 30000
  }'
```

### 3. Update status shopping log setelah selesai belanja

```bash
curl -X PUT http://localhost:3000/shopping/1 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "topik_belanja": "Belanja Harian",
    "nama_toko": "Warung Pak RT",
    "status": "Selesai",
    "total_belanja": 105000,
    "struk": "/uploads/struk123.jpg"
  }'
```

---

## Benefits

✅ **Flexible Item Management** - Tambah/edit/hapus item secara individual  
✅ **Real-time Updates** - Update items tanpa mengganggu shopping log  
✅ **User Authorization** - Setiap user hanya bisa akses items miliknya  
✅ **Data Integrity** - Foreign key constraints memastikan konsistensi data  
✅ **Scalable** - Bisa handle banyak items per shopping log

_Shopping Details API untuk TummyMate v1.0_
