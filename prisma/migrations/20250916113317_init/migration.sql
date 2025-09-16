-- CreateTable
CREATE TABLE `admin` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_name` VARCHAR(100) NOT NULL,
    `password` VARCHAR(100) NOT NULL,
    `email` VARCHAR(50) NOT NULL,
    `sync` TINYINT NOT NULL,
    `department` VARCHAR(50) NOT NULL,
    `privilege` VARCHAR(50) NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `user_name`(`user_name`),
    UNIQUE INDEX `email`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `session` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `session_token` VARCHAR(100) NOT NULL,
    `expires` DATETIME(0) NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `userId`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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

-- CreateTable
CREATE TABLE `logs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `related_table` VARCHAR(100) NOT NULL,
    `related_table_id` INTEGER NOT NULL,
    `severity` INTEGER NOT NULL,
    `message` VARCHAR(100) NOT NULL,
    `admin_id` INTEGER NULL,
    `action` VARCHAR(100) NOT NULL,
    `status_code` INTEGER NOT NULL,
    `additional_data` VARCHAR(100) NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `fk_adminID_admin`(`admin_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `session` ADD CONSTRAINT `fk_userId_admin_id` FOREIGN KEY (`userId`) REFERENCES `admin`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

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

-- AddForeignKey
ALTER TABLE `logs` ADD CONSTRAINT `fk_adminID_admin` FOREIGN KEY (`admin_id`) REFERENCES `admin`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
