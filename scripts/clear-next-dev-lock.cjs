/**
 * Eski "next dev" kapanmadan kilit kaldıysa: client/.next/dev/lock silinir.
 * Kullanım (proje kökü): node scripts/clear-next-dev-lock.cjs
 */
const fs = require("fs");
const path = require("path");

const lock = path.join(__dirname, "..", "client", ".next", "dev", "lock");
try {
  if (fs.existsSync(lock)) {
    fs.rmSync(lock, { force: true });
    console.log("[fix] Silindi:", lock);
  } else {
    console.log("[fix] Kilit dosyası yok (sorun değil):", lock);
  }
} catch (e) {
  console.error("[fix] Hata:", e.message);
  process.exit(1);
}
