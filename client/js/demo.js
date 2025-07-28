// Demo data untuk testing TummyMate - Updated sesuai ERD
// Jalankan script ini di browser console untuk populate data demo

function loadDemoData() {
  const demoData = {
    // Meal Plans - sesuai ERD dengan struktur baru
    mealPlans: [
      {
        id_mealplan: 1,
        tanggal: "2025-07-24",
        hari: "Kamis"
      },
      {
        id_mealplan: 2,
        tanggal: "2025-07-25",
        hari: "Jumat"
      },
      {
        id_mealplan: 3,
        tanggal: "2025-07-26",
        hari: "Sabtu"
      }
    ],

    // Meal Plan Details - menu detail per meal plan
    mealPlanDetails: [
      {
        id_mealDetail: 1,
        id_mealplan: 1,
        waktu_makan: "Sarapan",
        nama_menu: "Nasi Goreng Telur dengan Sayuran",
        catatan_menu: "Tambah kerupuk dan acar"
      },
      {
        id_mealDetail: 2,
        id_mealplan: 1,
        waktu_makan: "Makan siang",
        nama_menu: "Ayam Bakar Kecap dengan Nasi dan Lalapan",
        catatan_menu: "Pakai sambal terasi"
      },
      {
        id_mealDetail: 3,
        id_mealplan: 1,
        waktu_makan: "Makan malam",
        nama_menu: "Sop Ayam dengan Nasi Putih",
        catatan_menu: "Tambah jeruk nipis"
      },
      {
        id_mealDetail: 4,
        id_mealplan: 2,
        waktu_makan: "Sarapan",
        nama_menu: "Bubur Ayam Homemade",
        catatan_menu: "Dengan kerupuk dan kacang tanah"
      },
      {
        id_mealDetail: 5,
        id_mealplan: 2,
        waktu_makan: "Makan siang",
        nama_menu: "Gado-gado dengan Lontong",
        catatan_menu: "Bumbu kacang extra pedas"
      },
      {
        id_mealDetail: 6,
        id_mealplan: 3,
        waktu_makan: "Cemilan",
        nama_menu: "Pisang Goreng dengan Teh Hangat",
        catatan_menu: "Pisang kepok matang"
      }
    ],

    // Shopping Logs - sesuai ERD
    shoppingLogs: [
      {
        id_shoppinglog: 1,
        topik_belanja: "Belanja Mingguan",
        nama_toko: "Supermarket ABC",
        tanggal_belanja: "2025-07-20",
        status: "Selesai",
        struk: null,
        total_belanja: 250000
      },
      {
        id_shoppinglog: 2,
        topik_belanja: "Belanja Harian",
        nama_toko: "Warung Pak Budi",
        tanggal_belanja: "2025-07-23",
        status: "Selesai",
        struk: null,
        total_belanja: 45000
      }
    ],

    // Shopping Details - detail item per shopping log
    shoppingDetails: [
      {
        id_shoppingDetail: 1,
        id_shoppinglog: 1,
        nama_item: "Beras Premium",
        jumlah_item: 5,
        satuan: "Kilogram",
        harga: 75000
      },
      {
        id_shoppingDetail: 2,
        id_shoppinglog: 1,
        nama_item: "Ayam Broiler",
        jumlah_item: 1,
        satuan: "Kilogram",
        harga: 35000
      },
      {
        id_shoppingDetail: 3,
        id_shoppinglog: 1,
        nama_item: "Telur Ayam",
        jumlah_item: 1,
        satuan: "Kilogram",
        harga: 28000
      },
      {
        id_shoppingDetail: 4,
        id_shoppinglog: 1,
        nama_item: "Minyak Goreng",
        jumlah_item: 2,
        satuan: "Liter",
        harga: 32000
      },
      {
        id_shoppingDetail: 5,
        id_shoppinglog: 1,
        nama_item: "Gula Pasir",
        jumlah_item: 1,
        satuan: "Kilogram",
        harga: 15000
      },
      {
        id_shoppingDetail: 6,
        id_shoppinglog: 2,
        nama_item: "Roti Tawar",
        jumlah_item: 2,
        satuan: "Pack",
        harga: 12000
      },
      {
        id_shoppingDetail: 7,
        id_shoppinglog: 2,
        nama_item: "Susu UHT",
        jumlah_item: 4,
        satuan: "Pack",
        harga: 20000
      },
      {
        id_shoppingDetail: 8,
        id_shoppinglog: 2,
        nama_item: "Pisang",
        jumlah_item: 1,
        satuan: "Kilogram",
        harga: 13000
      }
    ],

    // Jajan Logs - sesuai ERD (hilangkan harga, tambah kategori dan foto wajib)
    jajan: [
      {
        id_jajan: 1,
        nama_jajan: "Nasi Padang Komplit",
        tanggal: "2025-07-22 12:30:00",
        kategori_jajan: "Makanan Berat",
        tempat_jajan: "Rumah Makan Sederhana",
        harga_jajanan: 25000
      },
      {
        id_jajan: 2,
        nama_jajan: "Es Teh Manis + Gorengan",
        tanggal: "2025-07-23 15:45:00",
        kategori_jajan: "Cemilan",
        tempat_jajan: "Warung Teh Pinggir Jalan",
        harga_jajanan: 8000
      },
      {
        id_jajan: 3,
        nama_jajan: "Jus Alpukat Segar",
        tanggal: "2025-07-24 09:20:00",
        kategori_jajan: "Minuman",
        tempat_jajan: "Juice Bar Sehat",
        harga_jajanan: 15000
      },
      {
        id_jajan: 4,
        nama_jajan: "Ayam Geprek + Nasi",
        tanggal: "2025-07-24 18:30:00",
        kategori_jajan: "Makanan Berat",
        tempat_jajan: "Geprek Bensu",
        harga_jajanan: 18000
      }
    ]
  };

  // Store data sesuai struktur ERD baru
  localStorage.setItem("mealPlans", JSON.stringify(demoData.mealPlans));
  localStorage.setItem("mealPlanDetails", JSON.stringify(demoData.mealPlanDetails));
  localStorage.setItem("shoppingLogs", JSON.stringify(demoData.shoppingLogs));
  localStorage.setItem("shoppingDetails", JSON.stringify(demoData.shoppingDetails));
  localStorage.setItem("jajan", JSON.stringify(demoData.jajan));

  console.log("Demo data loaded successfully with ERD structure!");
  console.log("Data included:");
  console.log("- Meal Plans:", demoData.mealPlans.length);
  console.log("- Meal Plan Details:", demoData.mealPlanDetails.length);
  console.log("- Shopping Logs:", demoData.shoppingLogs.length);
  console.log("- Shopping Details:", demoData.shoppingDetails.length);
  console.log("- Jajan Logs:", demoData.jajan.length);

  // Reload meal plan manager if available
  if (window.mealPlanManager) {
    window.mealPlanManager.loadFromLocalStorage();
  }

  // Reload shopping log manager if available
  if (window.shoppingLogManager) {
    window.shoppingLogManager.loadFromLocalStorage();
  }

  return demoData;
}

function clearAllData() {
  localStorage.removeItem("mealPlans");
  localStorage.removeItem("mealPlanDetails");
  localStorage.removeItem("shoppingLogs");
  localStorage.removeItem("shoppingDetails");
  localStorage.removeItem("jajan");
  localStorage.removeItem("user");

  console.log("🗑️ Semua data berhasil dihapus!");
  console.log("🔄 Refresh halaman untuk melihat perubahan");
}

function showCurrentData() {
  const mealPlans = JSON.parse(localStorage.getItem("mealPlans")) || [];
  const mealPlanDetails = JSON.parse(localStorage.getItem("mealPlanDetails")) || [];
  const shoppingLogs = JSON.parse(localStorage.getItem("shoppingLogs")) || [];
  const shoppingDetails = JSON.parse(localStorage.getItem("shoppingDetails")) || [];
  const jajan = JSON.parse(localStorage.getItem("jajan")) || [];

  console.log("📋 Data saat ini:");
  console.log(`   - ${mealPlans.length} meal plans`);
  console.log(`   - ${mealPlanDetails.length} meal plan details`);
  console.log(`   - ${shoppingLogs.length} shopping logs`);
  console.log(`   - ${shoppingDetails.length} shopping details`);
  console.log(`   - ${jajan.length} jajan logs`);

  return { mealPlans, mealPlanDetails, shoppingLogs, shoppingDetails, jajan };
}

// Export functions untuk penggunaan di console
window.loadDemoData = loadDemoData;
window.clearAllData = clearAllData;
window.showCurrentData = showCurrentData;

console.log("🚀 TummyMate Demo Script Loaded!");
console.log("📝 Available commands:");
console.log("   - loadDemoData()    : Load sample data");
console.log("   - clearAllData()    : Clear all data");
console.log("   - showCurrentData() : Show current data");
console.log("");
console.log(
  "💡 Tip: Jalankan loadDemoData() untuk melihat aplikasi dengan data sample"
);

// Auto load demo data if no existing data
document.addEventListener("DOMContentLoaded", () => {
  const hasData =
    localStorage.getItem("mealPlans") ||
    localStorage.getItem("mealPlanDetails") ||
    localStorage.getItem("shoppingLogs") ||
    localStorage.getItem("jajan");

  if (!hasData) {
    console.log("🎯 Tidak ada data ditemukan, loading demo data...");
    setTimeout(() => {
      loadDemoData();
      // Refresh managers if available
      if (window.mealPlanManager) {
        window.mealPlanManager.loadFromLocalStorage();
      }
      if (window.shoppingLogManager) {
        window.shoppingLogManager.loadFromLocalStorage();
      }
    }, 2000); // After loading screen
  }
});
