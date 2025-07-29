# LSP

```mermaid
flowchart TD
    A[Mulai] --> B{Login atau Register}
    
    B --> |Login| C[Masukkan Email & Password]
    C --> D{Email & Password Terdaftar?}
    D --> |Ya| E[Masuk ke Dashboard]
    D --> |Tidak| F[Masuk ke Register]

    F --> G[Masukkan Email, Password, Nama, Jenis Kelamin, Tahun Lahir]
    G --> H[Akun Terbuat]
    H --> C

    E --> I[Dashboard]
    I --> J1[Jumlah Menu Direncanakan]
    I --> J2[Jumlah Item Belanja]
    I --> J3[Jajan Tercatat]
    I --> J4[Total Pengeluaran]
    I --> J5[List Menu Hari Ini]
    I --> J6[Belanja Terbaru]

    %% FITUR
    I --> K{Pilih Fitur}
    K --> L1[Belanja]
    K --> L2[Jajan Log]
    K --> L3[Meal Plan]
    K --> L4[Profile]
    K --> L5[Logout]

    %% FITUR BELANJA
    L1 --> M1[Isi List Belanja (Nama Belanja, Tanggal, Toko)]
    M1 --> M2[Isi Item Belanja (Nama Item, Jumlah, Satuan, Harga)]
    M2 --> M3[Edit Item Belanja]
    M2 --> M4[Hapus Item Belanja]

    %% FITUR JAJAN LOG
    L2 --> N1[Tambah Jajan Log (Nama, Tanggal & Jam, Harga, Kategori, Toko)]
    N1 --> N2[Edit Jajan Log]

    %% FITUR MEAL PLAN
    L3 --> O1[Buat Meal Plan Berdasarkan Session]
    O1 --> O2{Pilih Session}
    O2 --> |Sarapan| O3
    O2 --> |Makan Siang| O4
    O2 --> |Makan Malam| O5
    O2 --> |Cemilan| O6

    %% FITUR PROFILE
    L4 --> P1[Tampilkan Data User Login]

    %% LOGOUT
    L5 --> Q[Keluar Sistem]
    Q --> R[End]

```
