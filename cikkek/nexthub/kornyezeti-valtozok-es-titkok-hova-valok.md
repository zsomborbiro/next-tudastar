---
termek: nexthub
slug: kornyezeti-valtozok-es-titkok-hova-valok
cim: "Környezeti változók és titkok: hová valók, és hová nem?"
metaCim: "Környezeti változók és titkok — hová tedd, hová ne"
bevezeto: "Az adatbázis jelszava, egy API-kulcs, a levélküldő tokenje — minden alkalmazásnak vannak titkai. A kérdés nem az, hogy titkosak-e, hanem az, hogy hol élnek: a kódban, egy fájlban, a hoszt beállításai között, vagy valahol, ahol nem kellene. Ez a cikk a rendet mutatja meg."
leiras: "Környezeti változó és titok: mi a különbség, hová kerüljenek fejlesztésben és élesben, mi a build-idejű változó, és miért szivárognak ki a kulcsok a leggyakrabban."
tema: gyakorlat
megjelent: 2026-09-19
kapcsolodo:
  - nexthub/hogyan-kerul-egy-github-repo-elesbe
  - nexthub/mentes-es-visszaallitas-mit-erdemes-kiprobalni
  - nextweblap/webshop-inditas-mi-kell-hozza-jogilag
---

## Mi a környezeti változó, és miért jó?

A környezeti változó egy név–érték pár, amit az alkalmazás indításkor a környezetétől kap, nem a kódjából. Ugyanaz a kód a gépeden a helyi adatbázishoz csatlakozik, élesben a valódihoz — mert a `DATABASE_URL` értéke más a két helyen, a kód pedig ugyanaz. Ez az egyetlen igazán fontos elv: a kód nem tudja, hol fut, a környezet mondja meg neki.

Ebből következik, hogy a környezeti változóknak két fajtája van: a konfiguráció (port, nyelv, funkciókapcsolók, nyilvános URL-ek) és a titkok (jelszavak, kulcsok, tokenek). Technikailag ugyanúgy néznek ki; a különbség az, mi történik, ha kikerülnek.

## Hová valók a titkok — és hová nem

**Nem a kódba.** Egy jelszó a forráskódban azt jelenti, hogy minden, aki a repót látja — kolléga, régi kolléga, egy nyilvánossá tett repó —, látja a jelszót is. A git-történet ráadásul nem felejt: ha egyszer beleírtad és később kivetted, a régi commitban még ott van. Egy kiszivárgott kulcs egyetlen kezelése a csere.

**Nem a `.env` fájlba a repóban.** A `.env` fájl a helyi fejlesztés eszköze: a gépeden élő értékek. A repóba egy `.env.example` való, amely csak a neveket sorolja értékek nélkül — és a `.gitignore`-ban ott áll a `.env`, hogy véletlenül se kerüljön be.

**A hoszt beállításai közé.** Éles üzemben a titkok a hosting-platform környezeti változói között élnek: ott adod meg, a platform titkosítva tárolja, és az alkalmazás indításkor megkapja. Ez az egy hely, ahol a titoknak lennie kell, és ez az a hely, amit egy csapatban jogosultsághoz lehet kötni.

:::callout A leggyakoribb szivárgás
Nem a hackertámadás, hanem a naplózás: az alkalmazás hiba esetén kiírja a teljes környezetét vagy a kapcsolati stringet, és a jelszó a logban landol. A naplóba a titok soha ne kerüljön — ha a keretrendszered a hibaüzenetbe teszi a kapcsolati stringet, azt a részt takard ki.
:::

## Build-idejű és futásidejű változók

Ez a különbség okozza a legtöbb „nálam működik, élesben üres" hibát. A futásidejű változót az alkalmazás akkor olvassa, amikor fut — a szerveroldali kód ezt kapja, és ez a titkok helye. A build-idejű változó viszont a fordításkor kerül be a kódba: a böngészőben futó rész (a kliens) csak azt látja, amit a build beleégetett. Ha egy nyilvános API-címet a kliensnek kell tudnia, azt a buildnek kell megkapnia — a futásidőben beállított érték a kliensbe már nem jut el.

Két gyakorlati következmény. Egy: build-idejű változót a hoszton build-argumentumként kell megadni, nem csak futásidejű változóként — a Dockerfile `ARG`-ként veszi át. Kettő: a kliensbe égetett érték nyilvános, tehát oda soha nem kerülhet titok. Ha egy kulcsnak a böngészőben kell lennie, az nem titok, hanem publikus azonosító — és a hozzá tartozó jogosultságot ennek megfelelően kell szűkíteni.

## A nevezéktan, ami sokat spórol

Használj egyértelmű, nagybetűs neveket, és tartsd az egy helyen dokumentált listát: mi kell az alkalmazásnak, melyik kötelező, melyiknek van alapértéke. Az `.env.example` pont erre való. A build-idejű változókat különböztesd meg névvel (a legtöbb keretrendszer előtagot használ a kliensbe kerülőkhöz) — így a csapat egy ránézésre tudja, mi nyilvános.

Az alkalmazás induláskor ellenőrizze, hogy a kötelező változók megvannak-e, és hiányuknál értelmes hibával álljon meg — ne az első kérésnél, egy homályos üzenettel. Ez a tíz sor a legjobban megtérülő kód a projektben.

## Titkok csere és forgatás

Egy titok akkor is cserélendő, ha nem szivárgott ki: kolléga távozásánál, szolgáltatóváltásnál, vagy egyszerűen időnként. A csere két lépés: az új érték beállítása a hoszton, és az alkalmazás újraindítása, hogy felvegye. Ha a titok több helyen él, a csere több lépés és több hibalehetőség — még egy ok, hogy egy helyen legyen.

A NextHubon a környezeti változók a szolgáltatás beállításai között élnek, titkosítva; a build-idejű értékek külön build-argumentumként adhatók meg, és a változtatás után a szolgáltatás egy gombbal újraindítható, hogy az új értéket felvegye.

## Röviden

A kód nem tudja, hol fut — a környezet mondja meg. Titok soha a kódba, soha a repóba, soha a naplóba, soha a kliensbe. Éles titkok a hoszt beállításai között. Build-idejű változót build-argumentumként adj meg. Induláskor ellenőrizd a kötelezőket, és időnként cseréld a kulcsokat.
