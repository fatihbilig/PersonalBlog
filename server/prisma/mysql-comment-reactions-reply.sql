-- Mevcut `likes` sütunundan reaksiyon + yazar yanıtı geçişi (manuel çalıştır, sonra prisma db push ile senkron)
ALTER TABLE `Comment`
  ADD COLUMN `reactionThumb` INT NOT NULL DEFAULT 0 AFTER `body`,
  ADD COLUMN `reactionBulb` INT NOT NULL DEFAULT 0 AFTER `reactionThumb`,
  ADD COLUMN `reactionHeart` INT NOT NULL DEFAULT 0 AFTER `reactionBulb`,
  ADD COLUMN `authorReply` TEXT NULL AFTER `reactionHeart`,
  ADD COLUMN `authorRepliedAt` DATETIME(3) NULL AFTER `authorReply`;

UPDATE `Comment` SET `reactionThumb` = COALESCE(`likes`, 0) WHERE 1=1;

ALTER TABLE `Comment` DROP COLUMN `likes`;
