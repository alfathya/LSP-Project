const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // Clear existing data
  await prisma.mealPlanDetail.deleteMany();
  await prisma.mealPlan.deleteMany();
  await prisma.shoppingDetail.deleteMany();
  await prisma.shoppingLog.deleteMany();
  await prisma.jajanLog.deleteMany();

  // Seed Meal Plans
  console.log("📅 Seeding meal plans...");

  const mealPlan1 = await prisma.mealPlan.create({
    data: {
      tanggal: new Date("2025-07-25"),
      hari: "Jumat",
      details: {
        create: [
          {
            waktu_makan: "Sarapan",
            nama_menu: "Nasi Goreng Ayam",
            bahan_utama: "Nasi, Ayam, Telur, Sayuran",
            catatan_menu: "Pedas sedang, tambah kerupuk",
            estimasi_kalori: 450,
          },
          {
            waktu_makan: "Makan siang",
            nama_menu: "Soto Ayam",
            bahan_utama: "Ayam, Kuah kaldu, Mie, Telur",
            catatan_menu: "Dengan kerupuk dan sambal",
            estimasi_kalori: 380,
          },
        ],
      },
    },
  });

  const mealPlan2 = await prisma.mealPlan.create({
    data: {
      tanggal: new Date("2025-07-26"),
      hari: "Sabtu",
      details: {
        create: [
          {
            waktu_makan: "Sarapan",
            nama_menu: "Roti Bakar Coklat",
            bahan_utama: "Roti tawar, Coklat, Mentega",
            catatan_menu: "Dengan susu hangat",
            estimasi_kalori: 320,
          },
          {
            waktu_makan: "Makan malam",
            nama_menu: "Ayam Geprek",
            bahan_utama: "Ayam, Cabai, Nasi, Lalapan",
            catatan_menu: "Level 3, extra sambal",
            estimasi_kalori: 520,
          },
        ],
      },
    },
  });

  console.log("✅ Meal plans seeded successfully");

  // Seed Shopping Logs
  console.log("🛒 Seeding shopping logs...");

  const shopping1 = await prisma.shoppingLog.create({
    data: {
      tanggal_belanja: new Date("2025-07-24"),
      hari_belanja: "Kamis",
      topik_belanja: "Belanja Mingguan",
      nama_toko: "Supermarket ABC",
      total_belanja: 125000,
      status: "completed",
      details: {
        create: [
          {
            nama_item: "Beras Premium",
            jumlah: 5,
            satuan: "kg",
            harga_satuan: 15000,
            total_harga: 75000,
            keterangan: "Beras putih kualitas baik",
            is_checked: true,
          },
          {
            nama_item: "Ayam Broiler",
            jumlah: 1,
            satuan: "kg",
            harga_satuan: 30000,
            total_harga: 30000,
            keterangan: "Ayam segar",
            is_checked: true,
          },
          {
            nama_item: "Telur Ayam",
            jumlah: 1,
            satuan: "kg",
            harga_satuan: 20000,
            total_harga: 20000,
            keterangan: "1 kg sekitar 15-17 butir",
            is_checked: true,
          },
        ],
      },
    },
  });

  const shopping2 = await prisma.shoppingLog.create({
    data: {
      tanggal_belanja: new Date("2025-07-25"),
      hari_belanja: "Jumat",
      topik_belanja: "Belanja Sayuran",
      nama_toko: "Pasar Tradisional",
      total_belanja: 45000,
      status: "pending",
      details: {
        create: [
          {
            nama_item: "Bayam",
            jumlah: 2,
            satuan: "ikat",
            harga_satuan: 5000,
            total_harga: 10000,
            keterangan: "Bayam segar",
            is_checked: false,
          },
          {
            nama_item: "Wortel",
            jumlah: 0.5,
            satuan: "kg",
            harga_satuan: 12000,
            total_harga: 6000,
            keterangan: "Wortel muda",
            is_checked: false,
          },
          {
            nama_item: "Tomat",
            jumlah: 1,
            satuan: "kg",
            harga_satuan: 8000,
            total_harga: 8000,
            keterangan: "Tomat merah segar",
            is_checked: false,
          },
        ],
      },
    },
  });

  console.log("✅ Shopping logs seeded successfully");

  // Seed Jajan Logs
  console.log("🍕 Seeding jajan logs...");

  await prisma.jajanLog.createMany({
    data: [
      {
        nama: "Nasi Padang",
        tanggal: new Date("2025-07-24"),
        tipe_makan: "makan_siang",
        jenis_jajan: "makanan",
        tempat: "Rumah Makan Sederhana",
        harga: 25000,
      },
      {
        nama: "Es Teh Manis",
        tanggal: new Date("2025-07-24"),
        tipe_makan: "nyemil",
        jenis_jajan: "minuman",
        tempat: "Warung Bu Tuti",
        harga: 5000,
      },
      {
        nama: "Bakso Malang",
        tanggal: new Date("2025-07-23"),
        tipe_makan: "makan_malam",
        jenis_jajan: "makanan",
        tempat: "Bakso Pak Kumis",
        harga: 20000,
      },
      {
        nama: "Kopi Tubruk",
        tanggal: new Date("2025-07-25"),
        tipe_makan: "sarapan",
        jenis_jajan: "minuman",
        tempat: "Warung Kopi Mbah Joyo",
        harga: 8000,
      },
    ],
  });

  console.log("✅ Jajan logs seeded successfully");
  console.log("🎉 Database seeding completed!");
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
