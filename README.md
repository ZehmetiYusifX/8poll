# Eloabf · Frontend (8pollfront)

> **Dəqiq zərbə. Ölçülmüş qələbə.**

**Bilyard** oyunçuları üçün reytinq və rəqabət platformasının frontend hissəsi.
Oyunçular bir-birinə **dəvət** göndərir, oynayır, nəticəni daxil edir və rəqib təsdiqlədikdən sonra **Elo reytinqi** yenilənir.

- **Stack:** React 18 + Vite 6 + TypeScript + Tailwind CSS v4
- **Backend:** [`eloabf`](../../../Desktop/oyun/8poll) — Java / Spring Boot 4 (REST + JWT)
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

PostgreSQL `localhost:5432` üzərində `poll` bazası ilə lazımdır (bax: `application.yaml`).
İlk işə salınmada demo oyunçular yaradılır — giriş üçün: **aslan / parol123**.

## Konfiqurasiya

`.env` faylı (nümunə: `.env.example`):

```
# Boşdursa, dev-proxy istifadə olunur.
VITE_API_URL=https://api.tabletennis.az/api
```

## Dizayn sistemi

Bütün tokenlər `src/index.css` içindəki `@theme` blokundadır — Eloabf brendbukuna
əsaslanır. İnterfeys **tünddür**: brendbukun foto istiqaməti "aşağı işıq, tünd
kənarlar, masaya düşən fokus" tələb edir.

| Token | Dəyər | İstifadə |
|-------|-------|----------|
| `paper` | `#101010` | Səhifə fonu (Deep Black) |
| `card` / `cream` | `#1a1a1a` / `#151515` | Kart və çökək səth (input) |
| `rail` / `rail-strong` | `#2a2a2a` / `#3e3e3e` | Haşiyələr (Graphite) |
| `ink-950 … ink-300` | `#fff0f0` → `#585858` | Mətn **vurğu** şkalası (950 = ən güclü) |
| `felt-700` | `#276b40` | Federation Green — əsas əməliyyat rəngi |
| `gold-400` | `#d7b56d` | Winner Gold — nəticə, medal, vurğu |

İki məqamı qarışdırmayın:

- `ink-*` **açıqlıq deyil, vurğu** şkalasıdır. Tünd fonda `ink-950` ən parlaq mətndir.
  Ona görə `bg-ink-950` yazmayın — örtük lazımdırsa `bg-black/70` işlədin.
- `felt` / `gold` / `clay` / `honey` / `steel` adi şkalalardır (50 açıq → 950 tünd).
  Tünd səthdə **fon** üçün şəffaflıqlı orta pillə (`bg-felt-500/12`), **mətn** üçün
  açıq pillə (`text-felt-300`) götürün.

Köməkçi siniflər: `felt-weave` (mahud toxuması), `edge-light` (üst işıq xətti),
`rule-gold` (qızıl ayırıcı), `surface-gold` (qalib kartı).

Brend nişanı `EloabfMark` (`src/components/icons.tsx`), loqo və slogan isə
`src/components/Brand.tsx` faylındadır. Brend şəkilləri: `public/brand/`.

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
