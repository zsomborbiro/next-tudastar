---
termek: nexthub
slug: shared-hosting-vagy-alkalmazas-hosting
cim: "Shared hosting vagy alkalmazás-hosting: mikor melyik éri meg?"
metaCim: "Shared hosting vs alkalmazás-hosting — mi mennyibe kerül valójában"
bevezeto: "A tárhely olcsó, és a legtöbb weboldalnak tökéletes. Aztán a projekt egy nap alkalmazássá válik — saját szerverfolyamat, adatbázis, háttérmunkák —, és a tárhely hirtelen nem az, amire szükség van. Ez a cikk arról szól, hol van ez a határ, és mit fizetsz valójában a két oldalon."
leiras: "Tárhely vagy alkalmazás-hosting: mi a különbség, mikor melyik éri meg, és milyen rejtett költségekkel számolj — idő, üzemeltetés, kockázat."
tema: penzugy
megjelent: 2026-09-19
kapcsolodo:
  - nexthub/hogyan-kerul-egy-github-repo-elesbe
  - nexthub/hol-vannak-az-ugyfeleid-adatai-gdpr-es-hosting
  - nextsoft/weboldal-vagy-webshop-melyiket-mikor
  - nextraktar/mennyibe-kerul-egy-kasszarendszer
---

## Mit ad a tárhely, és mit nem?

A klasszikus shared hosting egy előre beállított környezet: feltöltöd a fájlokat, a szerver kiszolgálja őket, és ha PHP-t vagy egy tartalomkezelőt használsz, az is fut. A gondolkodás nélküli része az erőssége: nincs mit üzemeltetni, nincs mit frissíteni, a szolgáltató mindent egyformán ad mindenkinek. Egy bemutatkozó oldalnak, blognak, kisebb webshopnak ez évekig elég.

Amit nem ad: saját, folyamatosan futó szerverfolyamatot. Ha az alkalmazásod Node-, Python- vagy más futtatókörnyezetet vár, saját adatbázist, háttérben futó feladatokat, valós idejű kapcsolatot, vagy egyszerűen a saját konténerében akar futni, a tárhely modellje nem erre készült. Lehet trükközni, de a trükkök ára az, hogy törékeny.

## Mit ad az alkalmazás-hosting?

Egy alkalmazás-hosting platform a te programodat futtatja, a te környezetedben: a repódból épít, konténerben indít, ad neki adatbázist és tárhelyet, figyeli, hogy fut-e, és újraindítja, ha elesik. A HTTPS, a domain-kezelés, a naplók és a mentés a platform része. Vagyis megkapod azt, amit egy saját szerver adna, anélkül, hogy a szervert neked kellene karbantartanod.

A különbség a tárhelyhez képest nem a „több erő", hanem a **szabadság**: azt futtatod, amit írtál, nem azt, amit a szolgáltató előre beállított.

## A látható költség

A tárhely havi díja alacsonyabb, ez nem kérdés. Az alkalmazás-hosting ára a lefoglalt erőforrástól függ: mennyi memória, mekkora lemez, hány szolgáltatás. Egy kis alkalmazás a legkisebb csomagon fut, és ez az ár még mindig egy vacsora nagyságrendje havonta — nem a különbség nagysága az érdekes, hanem az, hogy mit kapsz érte.

Ha csak a havi díjat nézed, a tárhely nyer. A döntés viszont ritkán a havi díjon múlik.

## A láthatatlan költség: az idő

Ha az alkalmazásod nem fut jól tárhelyen, három lehetőséged van: átírod, hogy fusson (idő); bérelsz egy virtuális szervert, és magad üzemelteted (idő, folyamatosan); vagy alkalmazás-hostingra váltasz (pénz). A második út a leggyakoribb csapda: a VPS olcsó, de a rendszerfrissítés, a tűzfal, a tanúsítvány-megújítás, a mentés, a figyelés és az éjszakai újraindítás mind a tiéd. Ha ezt az időt beszorzod azzal, amit egy órád ér, a VPS drágább, mint bármelyik platform — csak a számla nem egy helyen érkezik.

:::callout Az egyetlen kérdés, amit fel kell tenned
Ha az oldal ma este leáll, ki indítja újra, és honnan tudja meg? Ha a válasz „én, és nem tudom meg", akkor a hosting-költséged valójában a kockázatod, nem a havi díjad.
:::

## A kockázat mint költség

Egy tárhelyen az adataid a szolgáltató mentési politikájától függenek — ezt sokan nem nézik meg, amíg baj nincs. Egy VPS-en a mentés a tiéd: ha nem állítottad be, nincs. Egy alkalmazás-hosting platformon a mentés a szolgáltatás része, és az a kérdés, milyen gyakran készül, és hogyan állítható vissza. Ez az a tétel, amit soha nem érzel a havi díjban, és mindent ér, amikor kell.

Hasonló a helyzet a leállással. Egy webshop számára egy órányi kiesés több, mint egy hónapnyi különbség két hosting-csomag között. Nem azért, mert a szolgáltatók rosszak, hanem mert a tárhelyen nincs ki figyeljen rád, a platformon van.

## Mikor maradj tárhelyen?

Ha az oldalad statikus vagy egy jól ismert tartalomkezelőn fut, nincs saját szerverkód, nincs adatbázis-igény a tartalomkezelőn túl, és a látogatottság egyenletes. Ilyenkor a tárhely nem kompromisszum, hanem a helyes választás. Ne fizess szabadságért, amit nem használsz.

## Mikor válts?

Amikor először írsz le olyat, hogy „ehhez kellene egy háttérfolyamat", „ehhez kellene saját adatbázis", vagy „ezt a repóból szeretném deployolni". Ezek a mondatok azt jelentik, hogy alkalmazásod van, nem weboldalad. Ettől a ponttól a tárhely nem olcsóbb, csak máshol fizeted.

A NextHub alkalmazás-hosting: a repódból épít, konténerben futtat, adatbázist és mentést ad, a legkisebb csomag ingyenes — ezért a váltás kipróbálása nem pénzkérdés, hanem egy délután.

## Röviden

Tárhely: olcsó, gondtalan, weboldalnak való. VPS: olcsó havidíj, drága idő. Alkalmazás-hosting: a havi díjban benne van az üzemeltetés, a mentés és a figyelés. Ne a havi díjat hasonlítsd, hanem azt, hogy ki üzemeltet, ki ment, és ki tudja meg, ha leállt.
