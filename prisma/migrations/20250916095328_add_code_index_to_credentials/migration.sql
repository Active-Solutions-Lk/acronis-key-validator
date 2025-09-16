/*
  Warnings:

  - You are about to drop the `logs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `master` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `department` to the `admin` table without a default value. This is not possible if the table is not empty.
  - Added the required column `privilege` to the `admin` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `logs` DROP FOREIGN KEY `fk_adminID_admin`;

-- AlterTable
ALTER TABLE `admin` ADD COLUMN `department` VARCHAR(50) NOT NULL,
    ADD COLUMN `privilege` VARCHAR(50) NOT NULL;

-- DropTable
DROP TABLE `logs`;

-- DropTable
DROP TABLE `master`;

-- CreateTable
CREATE TABLE `credentials` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `pkg_id` INTEGER NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `password` VARCHAR(100) NOT NULL,
    `quota` INTEGER NULL,
    `code` VARCHAR(100) NULL,
    `user_id` INTEGER NULL,
    `actDate` DATETIME(0) NULL,
    `endDate` DATETIME(0) NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `fk_pkg_id_with_pkg_id`(`pkg_id`),
    INDEX `user_id`(`user_id`),
    INDEX `code_index`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pkg` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NULL,
    `duration` VARCHAR(100) NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reseller` (
    `customer_id` INTEGER NOT NULL AUTO_INCREMENT,
    `company_name` VARCHAR(100) NOT NULL,
    `address` VARCHAR(250) NULL,
    `type` VARCHAR(100) NOT NULL,
    `credit_limit` VARCHAR(100) NULL,
    `payment_terms` VARCHAR(100) NULL,
    `note` VARCHAR(250) NULL,
    `vat` VARCHAR(11) NULL,
    `city` INTEGER NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `company_name`(`company_name`),
    INDEX `city`(`city`),
    PRIMARY KEY (`customer_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sales` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `reseller_id` INTEGER NOT NULL,
    `credentials_id` INTEGER NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `fk_master_id_with_master_id`(`credentials_id`),
    INDEX `fk_reseller_id_with_reseller_id`(`reseller_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` TEXT NOT NULL,
    `email` TEXT NOT NULL,
    `company` TEXT NULL,
    `tel` INTEGER NOT NULL,
    `address` TEXT NULL,
    `city` INTEGER NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `city`(`city`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sri_lanka_districts_cities` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `district` VARCHAR(100) NOT NULL,
    `city` VARCHAR(100) NOT NULL,

    UNIQUE INDEX `unique_district_city`(`district`, `city`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `settings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `site_name` VARCHAR(255) NOT NULL DEFAULT 'Acronis Key Validator',
    `site_description` VARCHAR(500) NOT NULL DEFAULT 'License key validation system for Acronis products',
    `maintenance_mode` BOOLEAN NOT NULL DEFAULT false,
    `smtp_host` VARCHAR(255) NULL,
    `smtp_port` VARCHAR(10) NULL,
    `smtp_user` VARCHAR(255) NULL,
    `smtp_password` VARCHAR(255) NULL,
    `from_email` VARCHAR(255) NULL,
    `email_notifications` BOOLEAN NOT NULL DEFAULT true,
    `sync_notifications` BOOLEAN NOT NULL DEFAULT true,
    `expiry_notifications` BOOLEAN NOT NULL DEFAULT true,
    `two_factor_auth` BOOLEAN NOT NULL DEFAULT false,
    `session_timeout` VARCHAR(10) NOT NULL DEFAULT '30',
    `password_min_length` VARCHAR(10) NOT NULL DEFAULT '8',
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `credentials` ADD CONSTRAINT `credentials_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `credentials` ADD CONSTRAINT `fk_pkg_id_with_pkg_id` FOREIGN KEY (`pkg_id`) REFERENCES `pkg`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reseller` ADD CONSTRAINT `fk_city_with_sldc_id` FOREIGN KEY (`city`) REFERENCES `sri_lanka_districts_cities`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sales` ADD CONSTRAINT `fk_master_id_with_master_id` FOREIGN KEY (`credentials_id`) REFERENCES `credentials`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sales` ADD CONSTRAINT `fk_reseller_id_with_reseller_id` FOREIGN KEY (`reseller_id`) REFERENCES `reseller`(`customer_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user` ADD CONSTRAINT `user_ibfk_1` FOREIGN KEY (`city`) REFERENCES `sri_lanka_districts_cities`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
