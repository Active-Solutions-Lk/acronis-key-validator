-- AlterTable
ALTER TABLE `logs` MODIFY `admin_id` INTEGER NULL;

-- UpdateForeignKey
ALTER TABLE `logs` DROP FOREIGN KEY `fk_adminID_admin`;
ALTER TABLE `logs` ADD CONSTRAINT `fk_adminID_admin` FOREIGN KEY (`admin_id`) REFERENCES `admin`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;