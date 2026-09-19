---
termek: nexthub
slug: adatvedelmi-incidens-mit-kell-tenned-ha-kiszivargott
cim: "Adatvédelmi incidens: mit kell tenned, ha ügyféladat szivárgott ki?"
metaCim: "Adatvédelmi incidens — teendők, határidő, ki kit értesít"
bevezeto: "Egy rossz beállítás, egy elveszett laptop, egy kiszivárgott jelszó — és az ügyfeleid adatai olyan kézbe kerültek, ahová nem kellett volna. A GDPR erre az esetre pontos eljárást ír elő, és a legtöbb hibát ilyenkor nem a támadás okozza, hanem az, hogy senki nem tudja, mi a következő lépés."
leiras: "Mi számít adatvédelmi incidensnek, mit tegyél az első órákban, kit és mikor kell értesíteni, mit dokumentálj, és mi a hosting-szolgáltató szerepe."
tema: jogszabaly
megjelent: 2026-09-19
forrasok:
  - { cim: "Az Európai Parlament és a Tanács (EU) 2016/679 rendelete (GDPR) — EUR-Lex", url: "https://eur-lex.europa.eu/eli/reg/2016/679/oj" }
  - { cim: "Nemzeti Adatvédelmi és Információszabadság Hatóság (NAIH)", url: "https://naih.hu/" }
ellenorizve: 2026-09-19
kapcsolodo:
  - nexthub/hol-vannak-az-ugyfeleid-adatai-gdpr-es-hosting
  - nexthub/kornyezeti-valtozok-es-titkok-hova-valok
  - nextsoft/kamerarendszer-a-boltban-mit-szabad-es-mit-kell-kiirni
---

## Mi számít incidensnek?

Adatvédelmi incidens minden olyan esemény, amelynek következtében személyes adat jogosulatlan kézbe kerül, elvész, megsemmisül vagy megváltozik. Nem csak a hackertámadás: egy rossz címzettnek elküldött ügyféllista, egy nyilvánosan elérhetővé vált adatbázis-mentés, egy elveszett, titkosítatlan laptop, egy törölt tábla, amiről nincs mentés — mind incidens. A közös bennük, hogy az adat feletti kontroll megszakadt.

Ami nem incidens: egy sikertelen támadási kísérlet, ami nem jutott adathoz; egy titkosított eszköz elvesztése, ahol a kulcs biztonságban van. A határvonal az, hogy az adat ténylegesen hozzáférhetővé vált-e valakinek, akinek nem lett volna szabad.

## Az első órák: észlelés és megállítás

Amikor kiderül, hogy valami történt, két dolog sürgős, és mindkettő megelőzi a bejelentést. Az első: megállítani, ami folyik — a nyitva hagyott hozzáférés lezárása, a kiszivárgott kulcs cseréje, a rossz beállítás visszaállítása. A második: rögzíteni, mi történt — mikor vetted észre, mi látszik, mit tettél. Ez a jegyzet később a bejelentés és a dokumentáció alapja lesz, és az emlékezet órák alatt torzul.

Ne törölj naplókat, ne indíts újra mindent reflexből — a nyomok kellenek ahhoz, hogy megértsd, mi történt és kit érint.

## Kit érint, és mekkora a kockázat?

A bejelentési kötelezettség attól függ, mekkora kockázatot jelent az incidens az érintettekre. Ezért a második lépés a felmérés: milyen adat került ki (név és e-mail más, mint jelszó vagy bankkártyaadat), hány embert érint, és mi történhet velük emiatt. Egy nyilvános e-mail-cím kiszivárgása alacsony kockázat; egy jelszó vagy egy egészségügyi adat magas.

Ezt a mérlegelést le kell írni — akkor is, ha a végén az jön ki, hogy nem kell bejelenteni. A dokumentáció maga is kötelezettség.

:::callout A jelszavak esete
Ha jelszavak szivárogtak ki — még hash-elve is —, a felhasználók érintettek, mert sokan ugyanazt a jelszót használják máshol. Ilyenkor az érintettek értesítése és a jelszócsere kikényszerítése nem opció, hanem a kár csökkentésének első lépése.
:::

## Ki kit értesít, és mikor?

Az adatkezelő — vagyis a vállalkozás, amelynek az ügyfelei az érintettek — köteles az incidenst bejelenteni a felügyeleti hatóságnak, kivéve, ha az valószínűleg nem jár kockázattal az érintettekre. A bejelentésre a GDPR szoros határidőt ad az incidens tudomásra jutásától számítva; ha a határidőn belül nem tudsz mindent, a bejelentés részletekben is tehető. Az aktuális eljárást és űrlapot a hatóság oldala adja.

Ha az incidens valószínűleg magas kockázattal jár az érintettekre, őket is értesíteni kell — érthetően, arról, mi történt, mi a következménye, és mit tehetnek. Ez nem marketinglevél és nem jogi nyilatkozat: rövid, világos, és tartalmazza, kihez fordulhatnak.

Ha az adat egy szolgáltatónál — például a hosztnál — került veszélybe, a szolgáltató köteles téged haladéktalanul értesíteni, mert a hatóság felé te felelsz, és a te határidőd az ő értesítésétől számít. Ez a viszony az adatfeldolgozási megállapodás része kell legyen.

## A dokumentáció: minden incidensről

Minden incidenst nyilván kell tartani — a bejelentetteket és a nem bejelentetteket is: mi történt, milyen adat, kit érintett, mit tettél, mi lett a következménye. Ez a nyilvántartás az, amit egy ellenőrzésnél kérnek, és ez az, ami megmutatja, hogy a vállalkozás komolyan kezeli az adatokat akkor is, ha egy adott eset nem volt bejelentés-köteles.

## A megelőzés, ami az incidens után jön

Egy incidens után a kérdés nem csak az, hogy mi történt, hanem az, hogy mi hiányzott. Nem volt kétlépcsős belépés? A kulcsok a kódban voltak? A mentés nyilvános tárhelyen? A hozzáférések nem lettek visszavonva egy távozó kollégánál? Az incidens-nyilvántartás vége mindig egy teendőlista.

A NextHubon a szolgáltatások környezeti változói titkosítva tárolódnak, a hozzáférés jogosultsághoz kötött, és a naplók a felületen elérhetők — ezek az eszközök segítenek a felmérésben és a lezárásban, de az eljárás a tiéd: a hatóság felé te jelentesz, és a saját helyzetedről adatvédelmi tanácsadó vagy jogász tud felelősséggel nyilatkozni.

## Röviden

Incidens = az adat feletti kontroll megszakadt, nem csak támadás. Először állítsd meg és jegyezd fel. Mérd fel a kockázatot, és írd le. Bejelentés a hatóságnak szoros határidőn belül, kivéve ha nincs kockázat; magas kockázatnál az érintetteknek is. Minden incidenst dokumentálj. A hoszt téged értesít, te a hatóságot. És a végén: mi hiányzott?
