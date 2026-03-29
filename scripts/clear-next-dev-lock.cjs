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
    console.log("[fix:next-lock] Eski Next.js kilit dosyası kaldırıldı.");
  }
} catch (e) {
  // OneDrive / antivirüs kilidi vb. tüm `npm run dev`i düşürmemeli
  console.warn("[fix:next-lock] Kilit kaldırılamadı:", e.message);
  console.warn(
    "[fix:next-lock] Gerekirse kapatın: çalışan `next dev`, sonra client/.next/dev/lock dosyasını silin.",
  );
}
