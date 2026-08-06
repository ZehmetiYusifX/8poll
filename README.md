# 8poll · Frontend (8pollfront)

Həvəskar **bilyard** oyunçuları üçün reytinq və rəqabət platformasının frontend hissəsi.
Oyunçular bir-birinə **dəvət** göndərir, oynayır, nəticəni daxil edir və rəqib təsdiqlədikdən sonra **Elo reytinqi** yenilənir.

- **Stack:** React 18 + Vite 6 + TypeScript + Tailwind CSS v4
- **Backend:** [`8poll`](../../../Desktop/oyun/8poll) — Java / Spring Boot 4 (REST + JWT)
- **UI dili:** Azərbaycanca

## Xüsusiyyətlər

| Səhifə | Təsvir |
|--------|--------|
| Qeydiyyat / Giriş | JWT əsaslı autentifikasiya |
| Ana səhifə | Şəxsi statistika, təsdiq gözləyən nəticələr, gələn dəvətlər, son maçlar |
| Reytinq cədvəli | Elo reytinqinə görə oyunçular (medallar, öz sıranız vurğulanır) |
| Oyunçular | Axtarış + rəqib dəvət etmək |
| Profil | Statistika, maç tarixçəsi, profil redaktəsi (özün üçün) |
| Dəvətlər | Gələn / göndərilən dəvətlər, qəbul / imtina / ləğv |
| Maçlarım | Nəticə daxil etmə, təsdiq / rədd, reytinq dəyişiklikləri |

## İşə salmaq

```bash
npm install
npm run dev
```

Tətbiq `http://localhost:5173` ünvanında açılır.
`/api` sorğuları avtomatik olaraq Spring backend-ə (`http://localhost:8080`) yönləndirilir
(bax: `vite.config.ts` → `server.proxy`), ona görə də CORS problemi olmadan işləyir.

### Backend

Frontend real API tələb edir. Backend-i işə salmaq üçün:

```bash
cd ../../../Desktop/oyun/8poll
./mvnw spring-boot:run
```

PostgreSQL `localhost:5432` üzərində `8poll` bazası ilə lazımdır (bax: `application.yaml`).
İlk işə salınmada demo oyunçular yaradılır — giriş üçün: **aslan / parol123**.

## Konfiqurasiya

`.env` faylı (nümunə: `.env.example`):

```
# Boşdursa, dev-proxy istifadə olunur.
VITE_API_URL=https://api.tabletennis.az/api
```

## Layihə strukturu

```
src/
  api/          # axios client, tiplər və endpoint funksiyaları
  components/   # UI primitivlər, Layout, modallar, Avatar, MatchRow
  context/      # AuthContext (JWT sessiyası)
  pages/        # Login, Register, Dashboard, Leaderboard, Players, Profile, Challenges, Matches
  utils/        # formatlama köməkçiləri
```

## Build

```bash
npm run build    # tsc + vite build → dist/
npm run preview  # build-i lokal önizləmə
```
