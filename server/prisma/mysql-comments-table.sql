-- Yorumlar tablosu. Sunucu klasöründe: npx prisma db push  veya bu SQL'i çalıştır.
CREATE TABLE IF NOT EXISTS `Comment` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `authorName` VARCHAR(191) NOT NULL,
  `body` TEXT NOT NULL,
  `likes` INT NOT NULL DEFAULT 0,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `postId` INT NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `Comment_postId_idx` (`postId`),
  INDEX `Comment_createdAt_idx` (`createdAt`),
  CONSTRAINT `Comment_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `Post` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
