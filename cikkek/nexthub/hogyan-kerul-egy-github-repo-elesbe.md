---
termek: nexthub
slug: hogyan-kerul-egy-github-repo-elesbe
cim: "Hogyan kerül egy GitHub-repó élesbe? A push-tól a futó alkalmazásig"
metaCim: "GitHub-repóból élő alkalmazás — a deploy lépései"
bevezeto: "A kód a gépeden fut, a repó fent van GitHubon, és most jön a rész, ami sok fejlesztőt megállít: hogyan lesz ebből egy cím, amit bárki megnyithat? Ez a cikk a folyamatot mutatja meg — mi történik egy push után, és mi az, amire neked figyelned kell."
leiras: "Mi történik egy git push után egy hosting-platformon: build, konténer, health check, forgalomátkapcsolás — és hol szoktak elakadni a deployok."
tema: gyakorlat
megjelent: 2026-09-19
kapcsolodo:
  - nexthub/sajat-domain-bekotese-dns-lepesrol-lepesre
  - nexthub/shared-hosting-vagy-alkalmazas-hosting
  - nextsoft/mennyibe-kerul-egy-weboldal
  - nextraktar/kassza-internet-nelkul
---

## A folyamat, ami a push után indul

Amikor a repódhoz egy hosting-platform van kötve, minden push a kiválasztott ágra egy eseményt küld a platformnak. Innen a platform dolgozik: lehúzza a kód aktuális állapotát, felépíti belőle a futtatható alkalmazást, elindítja, ellenőrzi, hogy válaszol-e, és ha igen, átkapcsolja rá a forgalmat. Az előző változat addig fut, amíg az új nem bizonyult működőnek — így a látogató nem lát kiesést egy sikeres deploy alatt.

Ez a lánc öt lépés, és mindegyiknél másért tud elakadni. Ha érted, melyik lépésnél vagy, a hibakeresés percekre rövidül.

## Első lépés: mit tud a platform a repódról?

A platformnak tudnia kell, hogyan kell a kódodból futó programot csinálni. Két út van. Vagy a repó gyökerében van egy Dockerfile — ez a legpontosabb, mert te írod le, milyen alapkép, milyen parancsok és milyen port kell —, vagy a platform felismeri a projekt típusát (Node, Python, statikus oldal) és a saját recepjét használja. A Dockerfile a megbízhatóbb: ami a gépeden Dockerrel fut, az a platformon is ugyanúgy fog.

Amire itt figyelj: a Dockerfile a build lépéseit is tartalmazza (függőségek telepítése, fordítás), és a végén egy indítóparancsot. Ha a projekt buildje környezeti változót vár — például egy API-címet, ami a kliens-kódba kerül —, azt a platformon build-argumentumként kell megadni, nem csak futásidejű változóként. Ez a leggyakoribb „nálam működik, élesben üres" hiba.

## Második lépés: a build

A platform egy tiszta környezetben futtatja a buildet: nincs benne semmi a gépedről, csak amit a repó és a Dockerfile leír. Ezért bukik el itt az, ami otthon megy: egy fájl, ami nincs a gitben; egy csomag, ami globálisan volt telepítve; egy verzió, ami a lockfile-ban más. A build-log ezeket pontosan megmondja — olvasd végig, ne csak az utolsó sort.

Két dolog, ami a buildet gyorsítja és stabilabbá teszi: a lockfile commitolása (így a platform pontosan azokat a verziókat telepíti, amiket te), és a `.dockerignore`, ami kihagyja a `node_modules`-t és a build-kimeneteket a feltöltésből.

:::callout A build-perc nem ingyen van
A hosting-platformok a build idejét mérik és keretezik. Egy rosszul rétegezett Dockerfile minden pushnál újratelepít mindent; egy jól rétegezett csak azt, ami változott. A függőség-telepítés kerüljön a kód másolása elé — így a csomagok rétege cache-ből jön, amíg a lockfile nem változik.
:::

## Harmadik lépés: indítás és health check

A felépített képből a platform elindít egy konténert, és vár, hogy az a megadott porton válaszoljon. Ha az alkalmazás más porton hallgat, mint amit a platformnak megadtál, a health check soha nem sikerül, és a deploy „indul… indul…" állapotban áll, majd bukik. Ugyanez történik, ha az alkalmazás csak a `localhost`-on hallgat: a konténeren kívülről nem érhető el. A biztos beállítás: hallgass a `0.0.0.0` címen, azon a porton, amit a `PORT` környezeti változó ad.

A másik tipikus indítási hiba a hiányzó környezeti változó. Ha az alkalmazás adatbázis-címet vagy titkos kulcsot vár és nem kapja meg, az első kérésnél összeomlik. A platform naplója ezt mutatja — de csak ha az alkalmazás ki is írja a hibát, nem nyeli le.

## Negyedik lépés: forgalomátkapcsolás

Ha az új konténer válaszol, a platform ráirányítja a forgalmat, és leállítja a régit. Ettől a pillanattól él az új verzió. Ha a health check nem sikerült, a régi marad, és a deploy sikertelenként zárul — ez a védelem, ami miatt egy rossz push nem viszi le az oldalt.

## Ötödik lépés: ami utána jön

Egy sikeres deploy után két dolgot érdemes megnézni. A futásidejű naplót az első percekben: ott derül ki, ha valami csak forgalom alatt hibázik. És a domaint: az első deploynál a platform saját aldomainjén él az alkalmazás, a saját domain bekötése külön lépés.

Ha a projektnek több ága van, a platformok többsége az ágakhoz külön előnézeti címeket tud adni — így egy funkció-ág élesben megnézhető, mielőtt a fő ágba kerülne. Ez nem luxus: a „merge előtt megnézem" a legolcsóbb tesztelés.

## Röviden

A repóban legyen Dockerfile, lockfile és `.dockerignore`. A build-idejű változókat build-argumentumként add meg. Az alkalmazás a `0.0.0.0`-n és a `PORT`-on hallgasson. Olvasd a build-logot elejétől. A NextHubon a push utáni build és deploy automatikus, minden ág külön előnézeti címet kaphat, és a sikertelen deploy nem érinti a futó verziót — a fenti öt lépés ott is ugyanez, csak nem neked kell léptetned.
