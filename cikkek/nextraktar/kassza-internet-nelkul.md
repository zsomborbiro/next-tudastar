---
termek: nextraktar
slug: kassza-internet-nelkul
cim: "Mi történik a kasszával, ha elmegy az internet?"
metaCim: "Kassza internet nélkül — mi áll meg?"
bevezeto: "A kérdés nem az, hogy kiesik-e a net, hanem hogy mikor. Ami eldönti a napodat, az az, hogy a kassza ilyenkor megáll-e, vagy dolgozik tovább — és hogy utána kell-e bármit újra beütni."
leiras: "A boltban a net kiesése nem elméleti kockázat. Mit jelent az offline működés a gyakorlatban, mi az, ami akkor is megy, és mire érdemes felkészülni."
tema: gyakorlat
megjelent: 2026-08-28
frissitve: 2026-09-04
kapcsolodo:
  - nextraktar/napi-zaras-a-boltban
  - nextraktar/torzsadat-boltnyitaskor
---

Egy boltban a hálózat kiesése nem informatikai kérdés, hanem forgalmi. Ha a kassza megáll, akkor a sor is megáll, a vevő pedig nem vár: leteszi a kosarat és elmegy. Az elmaradt forgalmat senki nem téríti meg.

Az internet ráadásul nem csak akkor esik ki, amikor „elmegy”. Sokkal gyakoribb, hogy lassú lesz vagy szakadozik — és egy olyan kassza, ami minden művelethez szerverre vár, ilyenkor is használhatatlan, pedig papíron van kapcsolat.

## Kétféle felépítés, két különböző nap

A böngészőből futó kassza kényelmes: nem kell telepíteni, bárhonnan elérhető. Cserébe minden művelethez kapcsolat kell. Ha a vonal elmegy, a kassza abban a pillanatban használhatatlan, és nincs mit tenni azon kívül, hogy vársz.

A saját gépen futó kassza a másik út. Ott a program a bolt gépén dolgozik, saját adatbázissal — a kapcsolat a háttérben szinkronizál, nem a kiszolgálás közben. Ez telepítést kíván, viszont a hálózat állapota nem állítja meg az eladást.

A nextraktár így épül fel: a kassza a saját gépén dolgozik, a böngészős admin pedig attól függetlenül fut. Ha elmegy a net, az eladás megy tovább, a készlet levonódik, a bizonylat elkészül. Amikor visszajön a kapcsolat, a függő tételek maguktól felmennek — nem kell semmit újra beütni.

![A kassza a bolt gépén dolgozik — a hálózat a háttérben szinkronizál.](https://nextraktar.hu/home/nextraktar-penztar-1920.webp "2559x1365")

## Ami offline mégis megáll

Fontos tisztán látni, hogy az „offline működik” nem azt jelenti, hogy minden működik. Ami külső szolgáltatást igényel, az kapcsolat nélkül nem tud lefutni:

- A számla beküldése a hatóság felé kapcsolatot igényel — ez a vonal visszatérésekor történik meg.
- A webshop-szinkron áll: az online készlet addig a legutóbbi állapotot mutatja.
- A böngészős admin nem érhető el, tehát a kimutatásokat addig nem nézed meg.
- A több gép közötti egyeztetés csúszik: ha két kassza van, egymás forgalmát csak a kapcsolat visszatérése után látják.

A lényeg, hogy ezek egyike sem állítja meg a kiszolgálást. Utólag futnak le, és addig a bolt dolgozik.

## Meddig bírja, és mi lesz az adatokkal

A gyakori kérdés, hogy egy offline kassza meddig működhet kapcsolat nélkül. A válasz az, hogy az eladás szempontjából nincs kitüntetett határ: a program a saját adatbázisába dolgozik, és az nem attól telik meg, hogy nincs net. Ami közben halmozódik, az a szinkronizálásra váró tételek sora.

Ez viszont felvet egy másik kérdést, amit érdemes feltenni: ha a bolti gép elromlik, miközben van fel nem szinkronizált forgalom, mi lesz azokkal az adatokkal? Erre minden rendszernek van válasza, csak nem mindegyiknek ugyanaz — és ez pont az a részlet, ami akkor derül ki, amikor már baj van.

## Mire érdemes felkészülni

A technikai megoldás mellé kell néhány megállapodás is, különben a kiesés akkor is zavart okoz, ha a program bírja:

- Tudja-e a pénztáros, hogy kapcsolat nélkül is kiszolgálhat? Ha nem tudja, meg fog állni.
- Van-e tartalék kapcsolat — akár egy telefon megosztott internete —, amíg a fő vonal nem jön vissza?
- Ellenőrzi-e valaki a nap végén, hogy a függő tételek tényleg felmentek?
- Ha a kiesés napokig tart, kit hívsz, és mikor?

:::callout Az a kérdés, amit a bemutatón érdemes feltenni
Kérd meg, hogy húzzák ki a hálózati kábelt bemutatás közben, és utána szolgáljanak ki egy vevőt. Ez a legrövidebb út annak eldöntésére, hogy az offline működés valóban működik-e, vagy csak egy sor a funkciólistán.
:::

Ez a szempont abban a pillanatban válik fontossá, amikor először történik meg. Addig könnyű alábecsülni — utána viszont ez lesz az első kérdés, amit a következő rendszernél feltesz az ember.
