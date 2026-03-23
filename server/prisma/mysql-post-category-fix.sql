-- "Data truncated for column 'category'" genelde ENUM veya çok kısa VARCHAR kaynaklıdır.
-- Uygulama günlük kategorisini DB'de GUNLUK (ASCII) olarak saklar; yine de sütunu genişletmek güvenlidir.
-- MySQL'de çalıştırın (tablo adı farklıysa düzeltin):

ALTER TABLE `Post` MODIFY `category` VARCHAR(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL;

-- Eski ENUM kullanıyorsanız önce VARCHAR'a çevirmek gerekir; yukarıdaki satır ENUM'u da VARCHAR'a dönüştürür.
