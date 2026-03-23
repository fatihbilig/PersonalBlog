# Canlıya alma rehberi (PersonalBlog)

Bu proje **iki parçadan** oluşur: **Next.js istemci** (`client/`) ve **Express API** (`server/`). Kendi domaininde yayınlamak için ikisini de yapılandırman gerekir.

---

## 1. Görsel yükleme ve veritabanı — nasıl çalışıyor?

1. Admin panelden görsel seçilir → `POST /api/upload/image` (JWT gerekli) dosyayı **sunucu diskine** yazar.
2. API cevap olarak `{ url: "https://SENIN_API/uploads/abc123.jpg" }` döner.
3. Yazı/proje kaydedilirken bu `url`, `Post.imageUrl` / `Project.imageUrl` alanına **metin olarak** Prisma ile **veritabanına** yazılır.
4. Dosyanın kendisi **veritabanında değil**, **diskte** durur; DB’de sadece adres vardır.

**Canlıda çalışması için:**

- `SERVER_URL` gerçek public API adresin olmalı (HTTPS önerilir), yoksa URL’ler `http://localhost:4000/...` gibi kalır ve sitede görsel açılmaz.
- Sunucuda `public/uploads` (veya `UPLOADS_DIR`) **kalıcı disk** olmalı. Birçok PaaS (ör. varsayılan Heroku dyno) dosyayı yeniden başlatınca siler — **volume** veya **object storage (S3, R2)** gerekir.

---

## 2. Sunucu (API) ortam değişkenleri

`server/.env.example` dosyasını kopyalayıp `.env` yap ve doldur.

| Değişken | Zorunlu | Açıklama |
|----------|---------|----------|
| `DATABASE_URL` | Evet | MySQL/MariaDB |
| `JWT_SECRET` | Evet | Güçlü gizli anahtar |
| `SERVER_URL` | Canlıda evet | Örn. `https://api.domain.com` (path yok, sonda `/` yok) |
| `CORS_ORIGINS` | Canlıda evet | Örn. `https://domain.com,https://www.domain.com` |
| `UPLOADS_DIR` | İsteğe bağlı | Kalıcı klasör (Docker: volume mount) |
| `TRUST_PROXY` | İsteğe bağlı | `1` — reverse proxy arkasında doğru IP |
| `CONTACT_TO_EMAIL`, `SMTP_*` | İsteğe bağlı | İletişim formu için |

---

## 3. İstemci (Next.js) ortam değişkenleri

`client/.env.production.local` veya barındırıcı panelinde:

```env
NEXT_PUBLIC_API_BASE=https://api.domain.com/api
```

**Önemli:** Değer mutlaka `/api` ile bitsin (kod `API_BASE`’e `/posts` vb. ekliyor).

Build zamanında gömülür; değiştirince **yeniden build** gerekir.

---

## 4. Veritabanı ve Prisma

Canlı DB’de şema güncellemek için (sunucuda):

```bash
cd server
npx prisma migrate deploy
```

Migration klasörün yoksa ve geliştirmede `db push` kullandıysan:

```bash
npx prisma db push
```

(İlk kurulumda tabloların oluşması için.)

---

## 5. Yayın sonrası kontrol listesi

- [ ] `GET https://api.domain.com/health` → `{ "ok": true }`
- [ ] `CORS`: Tarayıcıdan sadece kendi frontend domaininden API çağrısı engellenmiyor
- [ ] Giriş → admin → görsel yükle → yazı kaydet → blogda görsel açılıyor
- [ ] `SERVER_URL` HTTPS ise sitede “karışık içerik” uyarısı yok
- [ ] Sunucu yeniden başlatıldıktan sonra **eski yüklemeler** hâlâ açılıyor (kalıcı disk)

---

## 6. Bilinen sınırlamalar (isteğe bağlı iyileştirme)

- **Tek sunucu + disk**: Ölçekte birden fazla API instance kullanırsan upload’lar diğer makinede olmaz — ortak storage (S3, NFS) gerekir.
- **Rate limit / WAF**: Üretimde DDoS ve brute-force için CDN veya API gateway düşünülebilir.
- **Yedek**: DB + `UPLOADS_DIR` klasörü düzenli yedeklenmeli.

Bu repoda yapılan kod tarafı düzeltmeler: `CORS_ORIGINS`, `SERVER_URL` ile doğru görsel URL’si, `UPLOADS_DIR` ile taşınabilir upload klasörü, `TRUST_PROXY` seçeneği.
