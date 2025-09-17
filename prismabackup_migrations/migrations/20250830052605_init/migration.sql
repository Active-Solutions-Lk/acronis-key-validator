-- CreateTable
CREATE TABLE `master` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `mspCreate` TINYINT NULL,
    `date` DATE NOT NULL,
    `reseller` VARCHAR(100) NOT NULL,
    `hoDate` DATE NOT NULL,
    `package` VARCHAR(100) NULL,
    `actDate` DATETIME(0) NULL,
    `endDate` DATETIME(0) NULL,
    `customer` VARCHAR(100) NULL,
    `address` VARCHAR(100) NULL,
    `name` VARCHAR(100) NULL,
    `email` VARCHAR(100) NULL,
    `tel` INTEGER NULL,
    `city` VARCHAR(100) NULL,
    `code` VARCHAR(100) NULL,
    `accMail` VARCHAR(100) NULL,
    `password` VARCHAR(100) NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `code`(`code`),
    UNIQUE INDEX `password_2`(`password`),
    INDEX `password`(`password`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `admin` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_name` VARCHAR(100) NOT NULL,
    `password` VARCHAR(100) NOT NULL,
    `email` VARCHAR(50) NOT NULL,
    `sync` TINYINT NOT NULL,
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

-- AddForeignKey
ALTER TABLE `session` ADD CONSTRAINT `fk_userId_admin_id` FOREIGN KEY (`userId`) REFERENCES `admin`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
