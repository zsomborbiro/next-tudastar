---
termek: nextraktar
slug: tobb-felhasznalo-a-kasszan-jogosultsagok
cim: "Több felhasználó a kasszán: jogosultságok, ki mit tehet, és miért nem mindegy?"
metaCim: "Jogosultságok a kasszán: ki mit tehet"
bevezeto: "Egy kis boltban mindenki mindent csinál, és a kassza egy jelszóval megy. Amíg ketten vagytok, működik. A harmadik embernél kezdődik az, hogy nem tudni, ki adott kedvezményt, ki sztornózott, ki nyúlt a készlethez — és amikor baj van, a válasz az, hogy „valaki”. A jogosultság nem bizalmatlanság, hanem áttekinthetőség."
leiras: "Miért kell külön felhasználó minden pénztárosnak, milyen jogosultsági szintek vannak, mit engedj a pénztárosnak és mit tarts a vezetőnél, és mit ad a napló."
tema: gyakorlat
megjelent: 2026-09-19
kapcsolodo:
  - nextraktar/penztarhiany-es-tobblet-a-zarasnal
  - nextraktar/visszaru-es-csere-a-boltban
  - nextraktar/munkaido-beosztas-es-nyilvantartas-a-boltban
  - nexthub/hol-vannak-az-ugyfeleid-adatai-gdpr-es-hosting
---

## Egy közös jelszó: mit veszítesz vele?

Nem a biztonságot elsősorban, hanem a választ. Ha mindenki ugyanazzal lép be, a rendszer minden műveletet ugyanannak a „felhasználónak" tulajdonít: a sztornót, a kedvezményt, a kivétet, a készletmódosítást. Amikor a zárásnál hiány van, vagy a leltárnál eltűnt egy termék, a napló azt mondja: valaki. Ez nem segít megtalálni a hibát, és nem véd meg senkit sem — a becsületes pénztárost sem, aki nem tudja bizonyítani, hogy nem ő volt.

A külön felhasználó a legolcsóbb rend a boltban: nem kerül semmibe, és minden művelethez nevet ad.

## A jogosultság: mit engedj, mit ne?

A legtöbb kasszarendszer néhány szintet ismer, és a kérdés az, mi kerüljön melyikbe. Egy bevált felosztás:

- **Pénztáros.** Eladás, nyugta, a saját műszakja zárása, egyszerű visszáru bizonylat alapján. Ez a napi munka, ehhez nem kell engedély.
- **Műszakvezető vagy megbízott.** Sztornó, kedvezmény bizonyos mérték fölött, bizonylat nélküli visszáru, kivét a kasszából. Ezek a műveletek pénzt mozgatnak a rendszer logikáján kívül — legyen valaki, aki jóváhagyja, még ha az egy második jelszó is a pénztáros mellett.
- **Vezető vagy tulajdonos.** Árak és törzsadat módosítása, készlet-korrekció, felhasználók kezelése, riportok, a teljes zárás. Ezek a bolt adatát változtatják, nem a napi forgalmat.

Nem az a cél, hogy a pénztáros ne tudjon dolgozni, hanem az, hogy a ritka és kockázatos műveletek ne a pult mögött, hanem egy jóváhagyással történjenek.

:::callout A kedvezmény és a sztornó
Ez a két művelet az, ahol a legtöbb visszaélés és a legtöbb ártatlan hiba is történik. Egy „mínusz" gomb, amit bárki nyomhat, nem gomb, hanem lyuk. Legyen korlát: a pénztáros adhasson kis kedvezményt, a nagyobbhoz kelljen egy második személy; a sztornó pedig mindig nevet és okot kapjon.
:::

## A napló: ez az, amiért az egész van

A jogosultság önmagában csak korlát. Amitől értelme lesz, az a napló: ki, mikor, mit csinált. Egy jó rendszer minden sztornót, kedvezményt, kivétet, készletmódosítást rögzít felhasználóval és időponttal — és ez a napló az, amit a zárásnál, a leltárnál vagy egy vitánál megnézel. A legtöbb boltban a napló hónapokig senkit nem érdekel, aztán egy nap az egyetlen dolog, ami számít.

A naplót nem ellenőrzésre használd naponta — arra való, hogy amikor kérdés van, legyen válasz. Ha a pénztárosok tudják, hogy van napló, a kérdések ritkábbak.

## A gyakorlati beállítás

Minden dolgozónak saját belépés, saját jelszóval vagy kóddal — a gyors műszakváltáshoz egy rövid PIN elég, ha a rendszer tudja. Távozó dolgozó belépését azonnal töröld vagy tiltsd le; a legtöbb „idegen" hozzáférés valójában egy volt kolléga még élő fiókja. A vezetői jelszót ne írd a monitorra, és ne add oda „csak ma"-ra: ha a pénztárosnak jóváhagyás kell, menj oda, vagy adj neki műszakvezetői szintet, ha megérdemli.

Ha a boltnak webshopja is van, ugyanez érvényes az admin felületre: aki a rendeléseket kezeli, ne tudja az árakat átírni, ha nem az a dolga.

## Amikor a jogosultság a vezetőt is védi

Egy jól beállított rendszerben a tulajdonos sem nyúl anonim módon a kasszához — a kivétet ő is rögzíti a saját nevén. Ez nem önbizalmatlanság, hanem következetesség: ha a szabály mindenkire érvényes, senki nem érzi, hogy csak őt figyelik. És egy vitánál — akár egy dolgozóval, akár a könyvelővel — a tulajdonos naplózott műveletei ugyanúgy védik őt, mint a pénztárosé a pénztárost.

A nextraktárban minden felhasználó saját belépéssel dolgozik, a szerepkörök a fenti szinteket követik, a sztornó és a kedvezmény jóváhagyáshoz köthető, és a napló felhasználónként mutatja a műveleteket — a napi zárás és a leltár is ebből tud műszakhoz kötni egy eltérést.

## Röviden

Közös jelszó: nincs válasz, ha baj van. Külön belépés mindenkinek, PIN-nel is jó. Három szint: pénztáros, műszakvezető, vezető — a sztornó, a nagy kedvezmény és a kivét jóváhagyással. A napló a lényeg: ki, mikor, mit. Távozó dolgozó fiókját azonnal zárd. A szabály a tulajdonosra is érvényes.
