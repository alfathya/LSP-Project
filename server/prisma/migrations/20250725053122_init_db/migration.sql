-- CreateTable
CREATE TABLE `User` (
    `id_user` INTEGER NOT NULL AUTO_INCREMENT,
    `nama_pengguna` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password_hash` VARCHAR(191) NOT NULL,
    `jenis_kelamin` ENUM('Pria', 'Wanita') NOT NULL,
    `tahun_lahir` INTEGER NOT NULL,
    `tanggal_registrasi` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id_user`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Shopping_log` (
    `id_shoppinglog` INTEGER NOT NULL AUTO_INCREMENT,
    `topik_belanja` VARCHAR(191) NOT NULL,
    `nama_toko` VARCHAR(191) NOT NULL,
    `tanggal_belanja` DATETIME(3) NULL,
    `status` ENUM('Direncanakan', 'Selesai') NOT NULL,
    `struk` VARCHAR(191) NULL,
    `total_belanja` INTEGER NULL,
    `id_user` INTEGER NOT NULL,

    PRIMARY KEY (`id_shoppinglog`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Shopping_details` (
    `id_shoppingDetail` INTEGER NOT NULL AUTO_INCREMENT,
    `nama_item` VARCHAR(191) NOT NULL,
    `jumlah_item` INTEGER NOT NULL,
    `satuan` ENUM('Kilogram', 'Gram', 'Liter', 'Mililiter', 'Pieces', 'Pack', 'Botol', 'Kaleng', 'Dus') NOT NULL,
    `harga` INTEGER NOT NULL,
    `id_shoppinglog` INTEGER NOT NULL,

    PRIMARY KEY (`id_shoppingDetail`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Jajan_log` (
    `id_jajan` INTEGER NOT NULL AUTO_INCREMENT,
    `id_user` INTEGER NOT NULL,
    `nama_jajan` VARCHAR(191) NOT NULL,
    `tanggal` DATETIME(3) NOT NULL,
    `kategori_jajan` ENUM('Makanan_Berat', 'Cemilan', 'Minuman') NOT NULL,
    `tempat_jajan` VARCHAR(191) NOT NULL,
    `foto` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id_jajan`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Meal_plan` (
    `id_mealplan` INTEGER NOT NULL AUTO_INCREMENT,
    `id_user` INTEGER NOT NULL,
    `tanggal` DATETIME(3) NOT NULL,
    `hari` ENUM('Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu') NOT NULL,

    PRIMARY KEY (`id_mealplan`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Meal_plan_session` (
    `id_session` INTEGER NOT NULL AUTO_INCREMENT,
    `id_mealplan` INTEGER NOT NULL,
    `waktu_makan` ENUM('Sarapan', 'Makan_siang', 'Makan_malam', 'Cemilan') NOT NULL,

    PRIMARY KEY (`id_session`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Meal_plan_menu` (
    `id_mealmenu` INTEGER NOT NULL AUTO_INCREMENT,
    `id_session` INTEGER NOT NULL,
    `nama_menu` VARCHAR(191) NOT NULL,
    `catatan_menu` VARCHAR(191) NULL,

    PRIMARY KEY (`id_mealmenu`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Shopping_log` ADD CONSTRAINT `Shopping_log_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `User`(`id_user`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Shopping_details` ADD CONSTRAINT `Shopping_details_id_shoppinglog_fkey` FOREIGN KEY (`id_shoppinglog`) REFERENCES `Shopping_log`(`id_shoppinglog`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Jajan_log` ADD CONSTRAINT `Jajan_log_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `User`(`id_user`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Meal_plan` ADD CONSTRAINT `Meal_plan_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `User`(`id_user`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Meal_plan_session` ADD CONSTRAINT `Meal_plan_session_id_mealplan_fkey` FOREIGN KEY (`id_mealplan`) REFERENCES `Meal_plan`(`id_mealplan`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Meal_plan_menu` ADD CONSTRAINT `Meal_plan_menu_id_session_fkey` FOREIGN KEY (`id_session`) REFERENCES `Meal_plan_session`(`id_session`) ON DELETE RESTRICT ON UPDATE CASCADE;
