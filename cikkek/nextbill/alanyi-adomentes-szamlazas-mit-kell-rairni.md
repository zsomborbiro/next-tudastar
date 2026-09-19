---
termek: nextbill
slug: alanyi-adomentes-szamlazas-mit-kell-rairni
cim: "Alanyi adómentes számlázás: mit kell ráírni a számlára, és mit nem?"
metaCim: "Alanyi adómentes számla — kötelező elemek, gyakori hibák"
bevezeto: "Az alanyi adómentes vállalkozó számlája egyszerűbb, mint az áfás — nincs rajta adó —, mégis pont ezen a számlán szokott hiányozni valami. A mentesség nem azt jelenti, hogy kevesebb a szabály, csak azt, hogy mások."
leiras: "Mit kell feltüntetni egy alanyi adómentes számlán, mi a mentességre utaló záradék, mi történik az értékhatárnál, és mire figyelj a NAV-adatszolgáltatásnál."
tema: jogszabaly
megjelent: 2026-09-19
forrasok:
  - { cim: "NAV Online Számla rendszer — hivatalos portál", url: "https://onlineszamla.nav.gov.hu/" }
  - { cim: "NAV — nyilvános adatbázisok (adózók lekérdezése, áfa-alanyiság)", url: "https://nav.gov.hu/adatbazisok" }
ellenorizve: 2026-09-19
kapcsolodo:
  - nextbill/kotelezo-e-a-nav-online-szamla
  - nextbill/szamla-helyesbitese-es-sztorno-mikor-melyik
  - nextceg/ceginformacio-mit-jelentenek-a-mezok
---

## Mit jelent az alanyi adómentesség a számlán?

Az alanyi adómentes vállalkozó nem számít fel áfát, és nem is vonhatja le. A számláján ezért nincs adóalap és adóösszeg bontás, egyetlen összeg szerepel — de a számla attól még számla: minden más kötelező elemnek rajta kell lennie, és a hatóság felé ugyanúgy adatot kell szolgáltatni róla.

Amit sokan összekevernek: az alanyi adómentesség a vállalkozó státusza, nem az ügyleté. Egy alanyi adómentes vállalkozó minden belföldi számlája ilyen, függetlenül attól, mit ad el és kinek.

## A kötelező elemek — ugyanazok, mint bárhol

A számla sorszáma, a kiállítás és a teljesítés dátuma, a kibocsátó neve, címe és adószáma, a vevő neve és címe (adóalany vevőnél az adószáma is), a termék vagy szolgáltatás megnevezése, mennyisége, egységára és összege. Ezek nélkül a számla hiányos, és a vevő nem tudja elszámolni.

Az adószám itt is kötelező — az alanyi adómentes vállalkozónak is van adószáma, és annak az áfakódja jelzi a mentességet. Ez az a mező, amiről a vevő könyvelője egy ránézésre látja, miért nincs áfa a számlán.

## A záradék: az egyetlen, ami tényleg más

Az alanyi adómentes számlán jelezni kell, hogy miért nem tartalmaz áfát. Ez a mentességre utaló záradék — egy rövid megjegyzés, amely kimondja, hogy a kibocsátó alanyi adómentes. Ha ez hiányzik, a vevő azt hiheti, hogy az összeg bruttó, és áfát keres benne; a könyvelő pedig hibás bizonylatnak tekintheti.

:::callout Amit ne írj rá
„Áfa: 0". Ez nem ugyanaz. A nulla adókulcs egy külön kategória, amely áfaalanyokra vonatkozik bizonyos ügyleteknél. Az alanyi adómentes számlán nincs adókulcs — a mentességre utaló megjegyzés a helyes jelölés, nem a nulla.
:::

## A számlázóprogram beállítása

A legtöbb hibát az okozza, hogy a program áfás módban maradt: a tételekhez adókulcs kerül, az összeg bontva jelenik meg, és a záradék hiányzik. Egy jó számlázóban a vállalkozás adózási státuszát egyszer állítod be, és onnantól minden számla ehhez igazodik: nincs adókulcs-választás a tételeknél, a záradék magától rákerül, és az adatszolgáltatás is a mentességet jelöli. Ha a programodban minden számlánál külön kell erre figyelned, előbb-utóbb elrontod.

## Az értékhatár: mikor válik ez sürgőssé?

Az alanyi adómentesség egy bevételi értékhatárhoz kötött. Ha a vállalkozás bevétele év közben eléri ezt a határt, a mentesség megszűnik — mégpedig attól a számlától, amellyel átléped. Ez a gyakorlatban azt jelenti, hogy az értékhatár közelében minden számla előtt tudnod kell, hol tartasz: az átlépő számlát már áfásan kell kiállítani, és a státuszváltást a hatóság felé is jelenteni kell.

Az aktuális értékhatárt nem írjuk ide, mert változik — a NAV oldalán mindig az érvényes szerepel. A lényeg: a számlázórendszered mutassa az éves göngyölített bevételt, hogy ne a könyvelőd szóljon utólag.

## Az adatszolgáltatás

Az alanyi adómentes vállalkozó számlájáról ugyanúgy megy adat a NAV Online Számla rendszerébe. Az adatszolgáltatásban a mentesség külön jelöléssel szerepel — a program ezt intézi, ha a státusz helyesen van beállítva. Ha a program áfás módban küldi be egy mentes vállalkozó számláját, az adatszolgáltatás és a valóság eltér, és ezt a hatóság látja.

A NextBillben a vállalkozás adózási státusza a cég beállításai között áll; alanyi adómentes státusznál a tételeknél nincs adókulcs, a záradék minden számlára rákerül, és az adatszolgáltatás a mentességet jelöli.

## Röviden

Az alanyi adómentes számla ugyanazokat a kötelező elemeket tartalmazza, csak áfa nélkül — a mentességre utaló záradékkal, nem „nulla áfával". Az adószám kötelező. A programban egyszer állítsd be a státuszt, ne számlánként. Az értékhatárt figyeld, mert az átlépő számla már áfás. Az adatszolgáltatás itt is kötelező.
