---
termek: nextraktar
slug: napi-zaras-a-boltban
cim: "Napi zárás: mit nézz meg, mielőtt lekapcsolod a villanyt"
metaCim: "Napi zárás a boltban — mit ellenőrizz?"
bevezeto: "A napi zárás a legtöbb boltban a kassza megszámolását jelenti. Pedig ez az a néhány perc, amikor a legolcsóbban derül ki, ha valami elcsúszott — másnap ugyanez már nyomozás."
leiras: "A napi zárás nem csak a kassza megszámolása. Mit érdemes átnézni, mire utal az eltérés, és hogyan lesz belőle öt perc a fél óra helyett."
tema: gyakorlat
megjelent: 2026-08-28
frissitve: 2026-09-11
kapcsolodo:
  - nextraktar/torzsadat-boltnyitaskor
  - nextraktar/szallitoi-rendeles-osszeallitasa
---

A zárás célja nem az, hogy a szám stimmeljen. Az a célja, hogy ha nem stimmel, még aznap kiderüljön, miért. Egy eltérés frissen jellemzően visszakereshető: valaki emlékszik a vevőre, a sztornóra, a váltópénzre. Egy hét múlva ugyanez az eltérés már csak egy szám, ami nem jön ki.

## Öt dolog, ami a kassza megszámolásán túl van

- A bevétel fizetési módonként. Ha a készpénz stimmel, de a kártyás összeg nem, az más hiba, mint ha fordítva volna.
- A sztornók és a kosár-kedvezmények. Nem azért, mert gyanúsak — hanem mert ezek a leggyakoribb magyarázatok egy eltérésre.
- A visszaváltási díj két iránya. Mennyi folyt be a palackokkal, és mennyi ment vissza.
- A minimum alá csúszott termékek. Ez a lista adja a holnapi rendelést, nem az emlékezet.
- A függő, még fel nem szinkronizált tételek, ha volt aznap hálózat-kiesés.

Ez az öt együtt már nem „kasszaszámolás”, hanem napi kép. És ha a program összeszedi, nem tart tovább öt percnél.

![Mai bevétel, mai eladások, alacsony készlet és készletérték a Kezdőlapon.](https://nextraktar.hu/home/nextraktar-kezdolap-1918.webp "1918x1002")

## Mire utal az eltérés

A kassza-eltérésnek néhány tipikus oka van, és mindegyiknek más a kezelése. Érdemes előre tudni, mit keress:

- Váltópénz-hiba: a nyitó összeg nem az volt, amit a rendszer feltételez. Ez a leggyakoribb, és a legártalmatlanabb.
- Elmaradt tétel: valamit kiadtak a pultból bizonylat nélkül. Ilyenkor a készlet is többet mutat a valóságosnál.
- Rosszul visszaadott betétdíj: apró tételek, amik naponta ismétlődnek.
- Sztornó a bizonylat után, de a pénz visszaadása nélkül — vagy fordítva.

Ha a rendszer naplózza a műveleteket időbélyeggel és felhasználóval, akkor ezek mindegyike visszakereshető. A nextraktárban a bejelentkezés, az értékesítés, a kosár-kedvezmény, a pénztárnyitás és -zárás, a vevőfelvétel és a kiállított számla is bekerül a naplóba, és kereshető.

![A napló megmondja, mi történt és mikor — nem kell senkit kérdezgetni.](https://nextraktar.hu/home/nextraktar-naplo-2000.webp "2000x1069")

## Ki zárjon, és mikor

A zárást az végezze, aki aznap a pult mögött állt — nem azért, mert ő a felelős, hanem mert ő emlékszik. Ha másnap reggel a tulajdonos ül le a számokhoz, akkor az eltérés magyarázata már senkinek nem jut eszébe.

A heti kép viszont a tulajdonosé. A napi zárás azt mondja meg, hogy az adott nap rendben volt-e; a hét azt, hogy merre megy a bolt. Ez a kettő nem helyettesíti egymást: hét egyenként rendben lévő napból is összeáll egy rossz hét, ha a forgalom csúszik.

## Ne legyen bizalmi kérdés

A napló nem a kolléga ellen van. Épp fordítva: nélküle minden eltérés bizalmi kérdéssé válik, mert nincs mihez nyúlni, és a gyanú ott marad a levegőben. Egy visszakereshető művelet-lista pont ezt szedi ki a helyzetből.

Ez különösen ott számít, ahol nem te állsz a pult mögött. Aki bízik a kollégájában, annak is szüksége van arra, hogy a hibát meg lehessen találni — mert a hiba nem szándék kérdése.

:::callout Egy szokás, ami sokat ér
Ne a zárás legyen az első alkalom, amikor aznap ránézel a számokra. Ha napközben egyszer megnézed, akkor a zárásnál már csak egy különbséget kell magyaráznod, nem az egész napot.
:::

A zárás akkor jó, ha unalmas. Ha minden este nyomozás, az nem a zárással van baj — hanem azzal, ami napközben történik vele. Az eltérés önmagában nem probléma: a boltban mindig lesz néhány forintnyi csúszás, és azt üldözni értelmetlen. A probléma az, ha az eltérés nem magyarázható, vagy ha ugyanabba az irányba tér el minden nap — az utóbbi ugyanis már nem véletlen, hanem rendszer.
