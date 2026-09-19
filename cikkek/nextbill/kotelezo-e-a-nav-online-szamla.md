---
termek: nextbill
slug: kotelezo-e-a-nav-online-szamla
cim: "Kötelező-e a NAV Online Számla, és mit jelent a gyakorlatban?"
metaCim: "Kötelező-e a NAV Online Számla? Kit érint, mit kell tenni"
bevezeto: "A kérdést a legtöbb vállalkozó akkor teszi fel, amikor az első számláját kiállítja — vagy amikor a könyvelője rákérdez, megy-e az adatszolgáltatás. A válasz rövid: igen, de nem úgy, ahogy sokan gondolják. Nem neked kell semmit beküldened kézzel."
leiras: "Kit érint a NAV Online Számla adatszolgáltatás, mit jelent a gyakorlatban, és mi a különbség a számla és az adatszolgáltatás között. Érthetően, forrásokkal."
tema: jogszabaly
megjelent: 2026-09-19
forrasok:
  - { cim: "NAV Online Számla rendszer — hivatalos portál", url: "https://onlineszamla.nav.gov.hu/" }
  - { cim: "NAV Online Számla — dokumentációk és technikai leírások", url: "https://onlineszamla.nav.gov.hu/dokumentaciok" }
ellenorizve: 2026-09-19
kapcsolodo:
  - nextbill/szamla-vagy-nyugta-mikor-melyik
  - nextbill/ismetlodo-szamla-mit-lehet-automatizalni
  - nextraktar/e-nyugta-nyugtaadat-szolgaltatas
---

## Mi az, amit a NAV valójában kér?

A félreértés a szóhasználatból jön. Az „Online Számla" nem egy számlázóprogram, és nem is egy oldal, ahová fel kell töltened a számláidat. Egy adatszolgáltatási rendszer: amikor egy belföldi adóalany számlát állít ki, a számla adatainak géppel olvasható formában el kell jutniuk a hatósághoz. A számla maga továbbra is az, amit a vevőd kap — papíron vagy elektronikusan —, az adatszolgáltatás pedig egy ettől külön csatorna a NAV felé.

Ez a különbség azért fontos, mert a két dolog két külön kötelezettség. Számlát akkor is ki kell állítanod, ha az adatszolgáltatás valamiért akadozik, és az adatszolgáltatást akkor is teljesíteni kell, ha a vevő egyáltalán nem kérte a számlát papíron. A gyakorlatban a kettőt egy jó rendszer egyszerre intézi, de jogilag nem egy és ugyanaz.

## Kit érint?

Röviden: minden belföldi adóalanyt, aki egy másik belföldi adóalanynak vagy magánszemélynek számlát állít ki magyar szabályok szerint. Az alanyi adómentes vállalkozó ugyanúgy érintett, mint az áfakörös cég; a katás egyéni vállalkozó ugyanúgy, mint a kft. Az adatszolgáltatás nem az áfa fizetésétől függ, hanem a számlakiállítástól.

Van néhány határeset — például a külföldi vevőnek kiállított, nem belföldi teljesítési helyű ügyletek —, ahol a szabályok eltérnek. Ezekre a hivatalos dokumentáció ad választ, és ha a saját helyzetedről van szó, a könyvelőd tud felelősséggel nyilatkozni. Ez a cikk a tipikus esetről szól: magyar vállalkozás, magyar vevő, magyar számla.

## Mit jelent ez a gyakorlatban?

A jó hír, hogy a kötelezettség teljesítése nem rajtad múlik, hanem a számlázórendszereden. Három út létezik.

- **Számlázóprogram, amely automatikusan beküld.** A számla kiállításának pillanatában a program összeállítja az adatszolgáltatást, és a NAV rendszerének átadja. Te ebből annyit látsz, hogy a számla mellett megjelenik egy állapot: elfogadva. Ez a szokásos, és ez az, amit érdemes elvárni.
- **Kézi számlatömb.** Nyomdai számlatömbből kiállított számlánál az adatokat neked kell rögzítened a NAV Online Számla felületén, meghatározott határidőn belül. Ez működik, de minden egyes számlánál külön munka, és könnyű elfelejteni.
- **Saját fejlesztésű rendszer.** Ha egy cég maga írja a számlázását, a NAV nyilvános interfészéhez kell csatlakoznia. Ez fejlesztői feladat, kisvállalkozásnak ritkán éri meg.

A legtöbb vállalkozás számára az első út a kézenfekvő. Amire figyelni érdemes: nem elég, hogy a program „tud" NAV-ot — az is számít, mi történik, amikor a NAV oldala lassú vagy nem válaszol. Egy jó rendszer ilyenkor újrapróbálkozik, és jelzi, ha valami tartósan elakadt. Egy rossz rendszer némán hagyja ott a számlát „függőben".

## Mi történik, ha nem megy át?

Az adatszolgáltatás elmulasztása mulasztási bírsággal járhat, és ez az a pont, ahol a vállalkozók félni kezdenek. Érdemes viszont pontosan látni, mi számít mulasztásnak. Ha a számlázóprogramod beküldte az adatokat, és a NAV rendszere befogadta, teljesítetted a kötelezettséget. Ha a NAV oldala átmenetileg nem elérhető, és a program később sikeresen beküldi, szintén rendben vagy — a rendszer erre fel van készítve.

A gond akkor van, ha a beküldés tartósan elmarad, és senki nem veszi észre. Ezért érdemes időnként ránézni a számlák adatszolgáltatási állapotára: nem naponta, de havonta egyszer igen. Ha a program külön listát ad a sikertelen beküldésekről, ez pár perc.

:::callout Amit a legtöbben elrontanak
A számla módosítása és érvénytelenítése is adatszolgáltatás-köteles. Ha egy számlát sztornózol vagy helyesbítesz, arról is megy adat a NAV-nak — nem elég a papírt kidobni és újat írni. Egy jó program ezt magától intézi, de ha kézi tömbből dolgozol, ezt is rögzítened kell.
:::

## Hogyan nézd meg, rendben van-e nálad?

A legegyszerűbb ellenőrzés: nyisd meg a számlázóprogramod utolsó tíz számláját, és nézd meg, mindegyik mellett ott áll-e az elfogadott állapot. Ha a program nem mutat ilyet, az önmagában intő jel. A másik ellenőrzés a NAV Online Számla felületén történik, ahová a saját technikai felhasználóddal be tudsz lépni, és látod a beérkezett adatszolgáltatásaidat — ez az, amit a hatóság is lát.

A NextBillben a beküldés a számla kiállításával egy mozdulat, és ha a NAV átmenetileg nem válaszol, a rendszer újrapróbálja, amíg át nem megy. A sikertelen beküldések külön listán jelennek meg, így nem kell számlánként keresgélni.

## Röviden

Az adatszolgáltatás kötelező, de nem neked kell kézzel csinálnod. Válassz olyan számlázót, amely magától beküld, kezeli a NAV kimaradásait, és megmutatja, ha valami elakadt. A kézi számlatömb működik, de minden számla külön munka. A módosítások és sztornók ugyanúgy adatszolgáltatás-kötelesek. Havonta egyszer nézz rá az állapotokra — ennyi elég ahhoz, hogy ez a kérdés többé ne legyen kérdés.
