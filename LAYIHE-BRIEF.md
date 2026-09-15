# Layihə Briefi — Bilyard Platforması

**Kim üçün:** marketinq komandası
**Məqsəd:** bu sənədi başdan-sona oxuyan adam layihəni tam başa düşsün və prezentasiyanı özü qura bilsin
**Status:** məhsul yazılıb və işləyir (canlı test serverində)
**Qeyd:** ad hələ yekunlaşmayıb — sənəddə sadəcə «platforma» deyilir

---

## 1. Bir cümlə ilə nədir?

**Bilyard oynayan insanların rəsmi reytinq qazandığı, klubların turnir keçirdiyi və
məşqçilərin dərs satdığı onlayn platforma.**

Daha sadə: **şahmatda Elo reytinqi var, futbolda liqa cədvəli var — bilyardda heç nə yoxdur.
Biz bunu qururuq.**

---

## 2. Problem — niyə bu lazımdır?

Azərbaycanda bilyard geniş yayılıb. Hər rayonda klub var, insanlar müntəzəm oynayır.
Amma bütün bu fəaliyyət **iz qoymur**:

**Oyunçu tərəfdən:**
- İki nəfər oynayır, biri udur, sonra hər şey unudulur. Nə qeyd, nə statistika.
- «Sən yaxşı oynayırsan» — amma nə qədər yaxşı? Kimə nisbətən? Cavab yoxdur.
- Öz səviyyəsinə uyğun rəqib tapmaq təsadüfə bağlıdır. Ya çox güclü, ya çox zəif rəqiblə oynayırsan.
- Rəqabət hissi yoxdur — irəliləyişi görmək mümkün deyil.

**Klub tərəfdən:**
- Turnirlər WhatsApp qrupunda, kağız üzərində təşkil olunur.
- Cədvəl əl ilə çəkilir, nəticələr itir, iştirakçı siyahısı qarışır.
- Klubun onlayn görünüşü yoxdur — yeni müştəri klubu təsadüfən tapır.

**Yeni başlayan tərəfdən:**
- Öyrənmək istəyir, amma məşqçi haradan tapacağını bilmir.
- Klubda təklikdə vurmaqla oynamağı öyrənmək çox uzun sürür.
- Nəticədə çoxu bir neçə dəfə gəlib tərk edir.

**Federasiya tərəfdən:**
- Həvəskar bazanın nə qədər olduğu, kimin nə səviyyədə olduğu bilinmir.
- İstedad seçimi tanışlıq və subyektiv qiymətləndirmə ilə aparılır.
- Rəqəmsal reyestr yoxdur.

> **Bir cümlə ilə problem:** oyun var, sistem yoxdur.

---

## 3. Həll — platforma nə edir?

Dörd şeyi bir yerə yığır:

| # | Modul | Nə edir |
|---|---|---|
| 1 | **Reytinq** | Hər təsdiqlənmiş oyun oyunçunun rəqəmsal reytinqini dəyişir |
| 2 | **Klublar** | Bilyard mərkəzləri profil açır, oyunçular onları tapır |
| 3 | **Turnirlər** | Klub onlayn turnir açır, cədvəl avtomatik qurulur |
| 4 | **Akademiya** ⭐ | Məşqçilər dərs paketi satır, oyunçular öyrənir *(növbəti mərhələ)* |

Bu dördü birlikdə **qapalı dövrə** yaradır:

```
        ÖYRƏN  →  OYNA  →  REYTİNQ QAZAN  →  TURNİRƏ ÇIX
          ↑                                        │
          └──────── daha yüksəyə qalxmaq üçün ─────┘
```

İstifadəçinin platformadan çıxmasına səbəb qalmır.

---

## 4. Kim üçündür? (5 tip istifadəçi)

### 4.1 Həvəskar oyunçu — **əsas kütlə**
20-40 yaş, həftədə 1-3 dəfə klubda oynayır, dostları ilə mübahisə edir «kim daha yaxşıdır».
**Nə alır:** rəqəm şəklində cavab. Reytinqi, sıralamada yeri, statistikası, oyun tarixçəsi.

### 4.2 Yeni başlayan — **ən böyük böyümə potensialı**
Bilyard oynamaq istəyir, amma utanır və ya necə başlayacağını bilmir.
**Nə alır:** məşqçi, dərs paketi, öz səviyyəsində rəqiblər, giriş baryerinin yox olması.

### 4.3 Klub sahibi
Bilyard mərkəzi işlədir, daimi müştəri və canlanma istəyir.
**Nə alır:** onlayn profil (şəkillərlə), pulsuz turnir idarəetmə aləti, yeni müştəri axını.

### 4.4 Məşqçi
Yaxşı oynayır, öyrətməyi bacarır, amma şagirdi ancaq tanışlıqla tapır.
**Nə alır:** profil, şagird axını, dərslərini paket şəklində satmaq imkanı — real gəlir kanalı.

### 4.5 Federasiya (ABF)
**Nə alır:** milli rəqəmsal reytinq bazası, həvəskar bazaya çıxış, obyektiv istedad seçimi,
sertifikatlı məşqçi reyestri.

---

## 5. Necə işləyir? — İstifadəçinin yolu

### Addım-addım: adi bir oyunçu

**1. Qeydiyyat.** Ad, istifadəçi adı, e-poçt, şifrə. Hamı **1200 reytinqlə** başlayır.

**2. Rəqib tapmaq.** «Oyunçular» bölməsində axtarış edir, reytinqlərə baxır, uyğun rəqib seçir.

**3. Dəvət göndərmək.** Rəqibə dəvət göndərir, istəsə mesaj da yazır («Şənbə axşam Nizami klubunda?»).

**4. Rəqib cavab verir.** Qəbul edir və ya imtina edir.

**5. Real həyatda oynayırlar.** Platforma oyunu oynatmır — **real masada, real klubda** oynanılır.

**6. Nəticə daxil edilir.** Oyunçulardan biri hesabı yazır: 5-3, 7-4 və s.

**7. Rəqib təsdiqləyir.** ⚠️ **Ən vacib məqam:** nəticə yalnız **hər iki tərəf razılaşdıqda** qeydə düşür.
Rəqib razı deyilsə, rədd edir və reytinq dəyişmir.

**8. Reytinq yenilənir.** Qalibin reytinqi qalxır, məğlubunki düşür. Hər ikisinin statistikası yenilənir.

**9. Sıralamada yer dəyişir.** Reytinq cədvəlində oyunçu yuxarı və ya aşağı sürüşür.

> **Marketinq üçün əsas mesaj:** platforma oyunu əvəz etmir — **oyunu qeydə alır və mənalandırır**.
> İnsanlar yenə də klubda, canlı görüşür. Sadəcə indi oyunun nəticəsi bir yerdə toplanır.

---

## 6. Reytinq sistemi — sadə dildə izah

Sistem **Elo** adlanır. Şahmatda, tennisdə, onlayn oyunlarda onilliklərdir istifadə olunan
beynəlxalq standartdır. Biz onu icad etməmişik — **sınanmış sistemi bilyarda gətiririk.**

**Necə işləyir:**

- Hər kəs **1200 xalla** başlayır.
- Udanda xal qazanırsan, uduzanda itirirsən.
- **Ən vacib nüans:** nə qədər qazandığın rəqibin gücündən asılıdır.
  - Səndən **güclü** rəqibi udsan → **çox xal** qazanırsan
  - Səndən **zəif** rəqibi udsan → **az xal** qazanırsan
  - Güclü rəqibə uduzsan → **az xal** itirirsən
  - Zəif rəqibə uduzsan → **çox xal** itirirsən

**Nəyə yarayır:** zəif rəqiblərlə oynayıb süni yüksəlmək mümkün deyil. Reytinq həqiqəti göstərir.

**Saxtakarlıq mümkündürmü?** Yox — çünki nəticəni **rəqib təsdiqləməlidir**. Bir nəfər özbaşına
«mən udmuşam» yaza bilməz.

**Prezentasiyada işlətmək üçün nümunə:**
> «1200 reytinqli oyunçu 1500 reytinqli rəqibi udursa, xeyli xal qazanır — çünki gözlənilməz
> nəticədir. Amma 1500-lük 1200-lüyü udursa, demək olar heç nə qazanmır — bu onsuz da gözlənilirdi.»

---

## 7. Ekran-ekran məhsul turu

Prezentasiyada ekran şəkilləri üçün istifadə edin.

### 7.1 Ana səhifə (Dashboard)
Oyunçu daxil olan kimi görür:
- **Böyük reytinq rəqəmi** və sıralamada yeri («12. yer / 340»)
- **Reytinq qrafiki** — son oyunlarda reytinqin necə dəyişdiyi
- **Forma zolağı** — son 5 oyunun nəticəsi rəngli xətlərlə (yaşıl=qələbə, qırmızı=məğlubiyyət)
- **Statistika:** oyun sayı, qələbə, məğlubiyyət, qazanma faizi
- **«Sizdən gözlənilir»** bölməsi — təsdiq gözləyən nəticələr və gələn dəvətlər
- **Son maçlar** siyahısı

### 7.2 Reytinq cədvəli (Leaderboard)
Ölkə üzrə sıralama. «Təsdiqlənmiş maçlar əsasında hesablanan sıralama.»

### 7.3 Oyunçular
Bütün oyunçuların siyahısı, ad və ya istifadəçi adı ilə axtarış. Buradan dəvət göndərilir.

### 7.4 Oyunçu profili
Açıq profil: avatar, bio, reytinq, statistika, tam maç tarixçəsi, reytinq qrafiki.
Filtr ilə maçları süzmək olur.

### 7.5 Dəvətlər
Gələn və göndərilən dəvətlər ayrı-ayrı. Qəbul et / İmtina / Ləğv et.

### 7.6 Maçlar
Bütün maçların tarixçəsi — təsdiqlənmiş, gözləyən, rədd edilmiş.

### 7.7 Məkanlar (Klublar)
«Bilyard klubları və turnir məkanları.» Ad və ya ünvan ilə axtarış.
Hər klubun kartı: ad, ünvan, şəkil.

### 7.8 Klub profili
Ad, ünvan, telefon, təsvir («masaların sayı, iş saatları, xidmətlər»), **foto qalereya**,
klubda keçirilən turnirlər.
Klub sahibi öz profilini redaktə edir, şəkil yükləyir/silir.

### 7.9 Turnirlər
Açıq turnirlər siyahısı. Vəziyyət göstəricisi: **Qeydiyyat açıq / Davam edir / Bitdi**.

### 7.10 Turnir səhifəsi
- Turnir adı, klub, tarix, iştirakçı limiti
- **İştirakçılar siyahısı** — oyunçular özləri qoşulur
- **Turnir cədvəli (bracket)** — avtomatik qurulur, «qalib növbəti mərhələyə keçəcək»
- Qalib müəyyənləşəndə turnir bağlanır

---

## 8. Klublar üçün nə var?

Klub sahibi ayrıca hesab növü ilə qeydiyyatdan keçir və:

- **Klub profili açır** — ad, ünvan, telefon, təsvir, şəkillər
- **Turnir yaradır** — ad, təsvir («format, mükafat fondu, qaydalar»), başlama tarixi, iştirakçı limiti
- **Qeydiyyatı açır** — oyunçular özləri qoşulur, siyahı əl ilə yazılmır
- **Cədvəl avtomatik qurulur** — kağıza ehtiyac yoxdur
- **Nəticələri daxil edir** — qalib avtomatik növbəti mərhələyə keçir

**Klub üçün satış arqumenti:** «Turnirinizi bir saat əvəzinə beş dəqiqəyə təşkil edin, üstəlik
klubunuz platformada minlərlə oyunçuya görünsün.»

---

## 9. ⭐ Yeni modul: Dərs paketləri (Akademiya)

**Bu, layihənin növbəti böyük addımı və əsas gəlir mənbəyidir.**

### Nə olacaq

**Məşqçi tərəfi:**
1. Məşqçi profil açır: təcrübəsi, sertifikatları, hansı klubda dərs verdiyi, video nümunə, qiymət
2. **Dərs paketləri** yaradır, məsələn:
   - *Sıfırdan başlanğıc* — 4 dərs / 1 ay
   - *Texnika paketi* — 8 dərs (zərbə, bucaq hesablama, effe)
   - *Turnirə hazırlıq* — 12 dərs + turnir müşayiəti
   - *Qrup dərsi* — 6 nəfərlik qrup, klubda, daha ucuz
3. Şagird qazanır, rəy və reytinq toplayır

**Oyunçu tərəfi:**
1. Məşqçiləri gəzir — qiymətə, rəyə, məkana, səviyyəyə görə süzür
2. Paket alır
3. Dərsləri cədvəllə bron edir
4. Dərs keçdikdən sonra hər iki tərəf təsdiqləyir *(maç təsdiqi ilə eyni məntiq)*
5. Dərsdən sonra öyrəndiyini real oyunda sınayır — reytinqinin qalxmasını görür

### Niyə bu qədər güclüdür

- **Dövrə qapanır.** Öyrənən adam oynayır, oynayan reytinq qazanır, reytinq qazanan turnirə çıxır,
  turnirə çıxan daha çox dərs alır.
- **Ölçülə bilən nəticə.** Dünyada heç bir kurs platforması «dərsdən sonra nə qədər irəlilədin»
  sualına rəqəmlə cavab verə bilmir. Biz verə bilirik — **reytinq qrafiki**.
  Bu, layihənin ən güclü marketinq mesajıdır.
- **Yeni başlayanlar üçün qapı açılır** — bazarın ən böyük və toxunulmamış seqmenti.
- **Məşqçilər üçün ilk rəsmi gəlir kanalı.**
- **Federasiya üçün** sertifikatlı məşqçi reyestri və vahid tədris standartı.

### Sonrakı genişlənmə
- Video dərs kitabxanası (abunə ilə onlayn kurs)
- Sertifikatlı «lisenziyalı məşqçi» nişanı
- Uşaq və gənclər proqramı, məktəb/regional klub əməkdaşlıqları

---

## 10. Federasiya (ABF) əməkdaşlığı

ABF layihəni dəstəkləmək istədiyini bildirib. Bu, layihəni **tətbiqdən infrastruktura** çevirir.

| ABF nə verir | Platforma nə verir |
|---|---|
| Rəsmi status və etibar | Milli rəqəmsal reytinq bazası |
| Klub şəbəkəsinə çıxış | Klublara pulsuz rəqəmsal alət |
| Rəsmi turnir təqvimi | Onlayn qeydiyyat, avtomatik cədvəl, nəticə arxivi |
| Məşqçi sertifikasiyası | Sertifikatlı məşqçilər üçün gəlir platforması |
| Milli komanda seçimi | Real statistikaya əsaslanan obyektiv istedad axtarışı |

**Əsas mesaj:** «Federasiyanın reytinqi kağızdan rəqəmsala keçir. Həvəskar baza ilk dəfə
ölçülə bilən olur.»

---

## 11. Nə hazırdır, nə hazırlanır? *(dürüst status)*

### ✅ Hazır və işləyir
- Qeydiyyat, giriş, oyunçu profilləri, profil redaktəsi
- Elo reytinq sistemi (1200 başlanğıc), ikitərəfli təsdiq mexanizmi
- Dəvət göndərmə / qəbul / imtina
- Nəticə daxiletmə, təsdiq, rədd
- Reytinq cədvəli, oyunçu axtarışı
- Reytinq qrafiki, forma zolağı, detallı statistika
- Klub profilləri, foto qalereya, klub sahibi paneli
- Turnirlər: yaradılma, qeydiyyat, avtomatik cədvəl, qalib
- Tam Azərbaycan dilində interfeys
- Telefon və kompüterdə işləyir

### 🔄 Növbəti mərhələ
- **Akademiya / dərs paketləri** modulu
- Ödəniş inteqrasiyası
- Bildirişlər (dəvət gəldi, təsdiq gözlənilir)
- Mobil tətbiq

> **Prezentasiyada mütləq deyin:** «Bu prototip və ya ideya deyil. Sistem yazılıb, işləyir, canlıdır.
> Göstərəcəyimiz ekranlar maketdir yox, **real məhsuldur**.»

---

## 12. Texniki tərəf — marketinq dilində

Detala girməyə ehtiyac yoxdur, amma soruşsalar:

- Müasir və sənaye standartı texnologiyalarla yazılıb (React, Spring Boot, PostgreSQL)
- Şifrələr şifrələnmiş saxlanılır, giriş təhlükəsizlik standartlarına uyğundur
- Sistem **modul əsaslıdır** — yeni bölmə (Akademiya) əlavə etmək üçün hər şeyi yenidən
  yazmağa ehtiyac yoxdur
- Minlərlə istifadəçini daşıya bilir, böyüməyə hazırdır

---

## 13. Biznes modeli — pul haradan gəlir?

1. **Dərs paketi komissiyası** — əsas gəlir mənbəyi
2. **Klub abunəsi** — genişləndirilmiş turnir idarəetməsi, statistika, tanıtım
3. **Turnir iştirak haqqından faiz**
4. **Sponsorluq və reklam** — inventar markaları, klub kampaniyaları
5. **Oyunçu üçün premium** — dərin analitika, müqayisə, hədəf izləmə

**Vacib prinsip:** reytinq, profil və cədvəl **həmişə pulsuz qalır**. Kütləvi baza olmadan
qalan modulların dəyəri yoxdur.

---

## 14. Tez-tez veriləcək suallar

**«Bilyard onlayn oynanılacaq?»**
Xeyr. Oyun real klubda, real masada oynanılır. Platforma nəticəni qeyd edir və reytinqə çevirir.

**«Kimsə yalan nəticə yaza bilər?»**
Xeyr. Nəticəni rəqib təsdiqləməlidir. Təsdiqlənməyən nəticə reytinqə təsir etmir.

**«Bunu insanlar niyə istifadə etsin?»**
Çünki ilk dəfə «mən nə səviyyədəyəm» sualının rəqəmlə cavabı olur. Rəqabət, sıralama və
irəliləyişi görmək güclü motivasiyadır — bunu bütün oyun və idman tətbiqləri sübut edib.

**«Klublar niyə qoşulsun?»**
Pulsuz turnir aləti + yeni müştəri axını. İtirəcəkləri heç nə yoxdur.

**«Bu artıq varmı?»**
Azərbaycanda bilyard üçün belə vahid sistem yoxdur. Klublar ayrı-ayrı, əlaqəsiz işləyir.

**«Nə vaxt hazır olacaq?»**
Əsas hissə **artıq hazırdır**. Dərs paketləri modulu növbəti mərhələdir.

---

## 15. Mesaj bankı — hazır cümlələr

Prezentasiyada birbaşa işlədilə bilər:

- «Azərbaycanda minlərlə insan bilyard oynayır — amma heç kim kimin nə səviyyədə olduğunu bilmir.»
- «Şahmatın Elo reytinqi var, futbolun liqası var. Bilyardın heç nəyi yoxdur. Biz bunu düzəldirik.»
- «Oyun var, sistem yoxdur.»
- «Biz oyunu dəyişmirik — oyunu yadda saxlayırıq.»
- «Hər zərbə sayılır, hər oyun iz qoyur.»
- «Bu prototip deyil. Sistem yazılıb, işləyir, canlıdır.»
- «Dərs alan adam nə qədər irəlilədiyini rəqəmlə görür — bunu heç bir kurs platforması edə bilmir.»
- «Öyrən, oyna, reytinq qazan, turnirə çıx — dövrə qapanır.»
- «Federasiyanın dəstəyi ilə bu, bir tətbiq deyil, milli infrastruktur olur.»

### Nə deməyək
- ❌ «Onlayn bilyard oyunu» — səhv təsəvvür yaradır, bu oyun deyil
- ❌ «Sosial şəbəkə» — məqsəd rəqabət və inkişafdır
- ❌ «İdeyamız var» — məhsul artıq mövcuddur, bunu vurğulayın

---

## 16. Prezentasiya üçün təklif olunan quruluş

| # | Slayd | Mesaj |
|---|---|---|
| 1 | Başlıq + şüar | Marka |
| 2 | Problem | «Oyun var, sistem yoxdur» |
| 3 | Həll | Bir platformada dörd modul |
| 4 | Necə işləyir | Dəvət → oyun → nəticə → təsdiq → reytinq |
| 5 | Reytinq sistemi | Elo sadə dildə |
| 6 | Ekran: ana səhifə | Real məhsul göstərişi |
| 7 | Ekran: reytinq cədvəli | Rəqabət |
| 8 | Ekran: klublar və turnirlər | Bracket |
| 9 | ⭐ Akademiya | Dərs paketləri — yeni modul |
| 10 | Auditoriya | 5 seqment |
| 11 | ABF əməkdaşlığı | İki tərəfli dəyər |
| 12 | Biznes modeli | Gəlir mənbələri |
| 13 | Status və yol xəritəsi | «Hazırdır, işləyir» |
| 14 | Çağırış | Növbəti addım |

---

## 17. Marketinqdən nə lazımdır?

- Ad və loqo *(sizin üzərinizdə)*
- Şüar
- Rəng və şrift qərarı — hazırda interfeys yaşıl mahud + taxta rəng qammasındadır (klassik bilyard estetikası)
- Ekran şəkillərinin çəkilməsi üçün bizə xəbər verin — demo hesabla canlı sistemdən götürəcəyik

**Sual olarsa:** texniki komandaya yazın, istənilən ekranı canlı göstərə bilərik.
