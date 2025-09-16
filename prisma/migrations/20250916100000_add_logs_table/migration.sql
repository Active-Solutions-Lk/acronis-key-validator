-- CreateTable
CREATE TABLE `logs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `related_table` VARCHAR(100) NOT NULL,
    `related_table_id` INTEGER NOT NULL,
    `severity` INTEGER NOT NULL,
    `message` VARCHAR(100) NOT NULL,
    `admin_id` INTEGER NOT NULL,
    `action` VARCHAR(100) NOT NULL,
    `status_code` INTEGER NOT NULL,
    `additional_data` VARCHAR(100) NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `fk_adminID_admin`(`admin_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `logs` ADD CONSTRAINT `fk_adminID_admin` FOREIGN KEY (`admin_id`) REFERENCES `admin`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;