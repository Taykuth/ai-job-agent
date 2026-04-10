# AI Job Agent — TODO

## Database & Backend
- [x] Veritabanı şeması: users (plan/stripe alanları), cvs, applications tabloları
- [x] CV yükleme endpoint'i (S3 + metadata DB)
- [x] CV parse procedure (LLM ile PDF/DOCX — file_url content type)
- [x] Application CRUD procedures (list, create, update status, delete)
- [x] Tailored CV üretme procedure (LLM)
- [x] Cover letter üretme procedure (LLM)
- [x] Freemium limit kontrolü (5 ücretsiz başvuru)
- [x] User plan durumu (free/premium) DB ve API
- [x] Stripe checkout session procedure (keys olmadan graceful error)
- [x] Stripe webhook handler (checkout.session.completed → premium, subscription.deleted → free)
- [x] getUserByStripeCustomerId DB helper

## Frontend — Landing Page
- [x] Zarif hero section (headline, CTA, feature highlights)
- [x] Features bölümü
- [x] Pricing bölümü (Free vs Premium)
- [x] Login/signup yönlendirmesi

## Frontend — Dashboard
- [x] Dashboard layout (sidebar navigation — JobAgent AI branded)
- [x] Dashboard ana sayfası (stats, recent apps, quick actions)
- [x] CV yükleme sayfası (drag-drop, PDF/DOCX)
- [x] CV parse sonucu görüntüleme (dialog)
- [x] Yeni başvuru oluşturma sayfası (job link/text input, CV seçimi)
- [x] Tailored CV üretme & önizleme ekranı (Streamdown markdown render)
- [x] Cover letter üretme & önizleme ekranı
- [x] İndirme (MD) ve kopyalama butonları
- [x] Başvuru takip panosu (kart listesi + stats)
- [x] Başvuru durum güncelleme (applied/interview/rejected/offer)
- [x] Premium yükseltme sayfası (Stripe checkout entegrasyonu)
- [x] Freemium limit uyarısı UI
- [x] Manage Billing (Stripe Customer Portal)

## Tests
- [x] auth.logout testi
- [x] auth.me testi (authenticated + unauthenticated)
- [x] application.getUsage testi (free/premium)
- [x] cv.list testi
- [x] application.list testi

## Pending (Stripe keys required)
- [ ] Stripe API anahtarları Settings → Payment'tan girilmeli
- [ ] Stripe webhook endpoint'i Stripe Dashboard'dan kayıt edilmeli
