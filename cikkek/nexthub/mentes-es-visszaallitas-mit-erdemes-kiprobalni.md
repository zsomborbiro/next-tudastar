---
termek: nexthub
slug: mentes-es-visszaallitas-mit-erdemes-kiprobalni
cim: "Mentés és visszaállítás: mit érdemes kipróbálni, mielőtt szükség lenne rá?"
metaCim: "Mentés és visszaállítás — amit ki kell próbálni, mielőtt baj van"
bevezeto: "Mindenkinek van mentése, amíg meg nem kell nézni. A mentés önmagában semmit nem ér — a visszaállítás az, ami számít, és arról a legtöbb vállalkozás semmit nem tud, amíg egy rossz napon ki nem derül. Ez a cikk arról szól, mit kérdezz, és mit próbálj ki előre."
leiras: "Miből áll egy alkalmazás mentése, milyen gyakran készüljön, meddig őrződjön, és hogyan próbáld ki a visszaállítást — a kérdések, amiket a hosztodnak fel kell tenned."
tema: penzugy
megjelent: 2026-09-19
kapcsolodo:
  - nexthub/kornyezeti-valtozok-es-titkok-hova-valok
  - nexthub/shared-hosting-vagy-alkalmazas-hosting
  - nextraktar/ev-vegi-leltar-a-boltban
---

## Miből áll az, amit menteni kell?

Egy futó alkalmazás három dologból áll, és mindháromnak más a mentése. Az **adatbázis** a legfontosabb: ez az, ami napról napra változik, és amit nem lehet újra legyártani — rendelések, ügyfelek, számlák. A **feltöltött fájlok**: képek, dokumentumok, minden, amit a felhasználók adtak hozzá. És a **konfiguráció**: a környezeti változók, a domain-beállítások, a szolgáltatás felépítése — ezek nélkül a visszaállított adat nem tud elindulni.

A kód nem tartozik ide: az a git-repóban él, azt bármikor újra lehet deployolni. Ha valaki „mentésként" a kódot menti, az nem mentés.

## A három kérdés, amit fel kell tenni

**Milyen gyakran?** Az adatbázisnál a kérdés valójában az: mennyi adatot vagy hajlandó elveszíteni? Egy napi mentés azt jelenti, hogy a legrosszabb esetben egy nap forgalma vész el. Egy webshopnak ez sok lehet; egy bemutatkozó oldalnak bőven elég. A gyakoriságot az üzlet mondja meg, nem a technika.

**Meddig?** Egy mentés, ami csak az utolsó napot őrzi, nem véd meg egy olyan hibától, ami tegnapelőtt kezdődött és csak ma vetted észre. A megőrzési idő — napi mentések egy hétre, hetiek egy hónapra — azt határozza meg, milyen messzire tudsz visszamenni. Ez is üzleti kérdés: mikor veszed észre, ha valami elromlott?

**Hol?** Ha a mentés ugyanazon a lemezen van, mint az adat, egy lemezhiba mindkettőt viszi. A mentés akkor ér valamit, ha máshol van — másik szerveren, másik helyen. Ezt a hosztnak kell tudnia mondani, és ha nem tudja, az a válasz.

:::callout A mentés, ami sosem készült el
A leggyakoribb mentési hiba nem a hibás mentés, hanem a hiányzó: egy ütemezett feladat, ami hónapokkal ezelőtt csendben leállt, és senki nem vette észre, mert senkinek nem szólt. Kérdezd meg a hosztodat, honnan tudod, hogy a mai mentés tényleg elkészült — ha a válasz „megnézheted", az nem elég; a rendszernek kell szólnia, ha nem készült el.
:::

## A visszaállítás: ezt kell kipróbálni

A mentés kipróbálása nem azt jelenti, hogy megnézed, létezik-e a fájl. Azt jelenti, hogy visszaállítod — egy próbakörnyezetbe, nem az élesbe —, és megnézed, elindul-e belőle az alkalmazás, és benne van-e a tegnapi rendelés. Ez az egyetlen módja annak, hogy megtudd, a mentés működik-e, és ez az, amit szinte senki nem csinál meg baj előtt.

Egy jó platform ezt egy gombbal engedi: válassz egy mentést, állítsd vissza egy új példányba, nézd meg. Ha a hosztodnál a visszaállítás egy támogatási jegy és órák, az a baj napján is az lesz.

Amit a próbán ellenőrizz: elindul az alkalmazás; a legfrissebb adat benne van; a feltöltött fájlok is ott vannak, nem csak az adatbázis; és tudod, mennyi ideig tartott — mert a baj napján ezt fogod várni.

## Mi a te dolgod, és mi a hoszté?

A hoszt dolga, hogy a mentés elkészüljön, máshol tárolódjon, és visszaállítható legyen. A te dolgod, hogy tudd, mi van benne — melyik szolgáltatásod adatbázisa, melyik kötete —, hogy egyszer kipróbáld, és hogy a konfigurációdat (környezeti változók, domain) is le tudd írni, ha újra kellene építeni. A titkokat ne a mentésbe tedd; azokat külön, biztonságos helyen tartsd.

Ide tartozik a kilépés kérdése is: ha egyszer másik hosztra vinnéd az alkalmazást, a mentés az, amivel elviszed. Kérdezd meg, milyen formátumban kapod meg — egy szabványos adatbázis-dump bárhol visszaállítható, egy zárt formátum nem.

## A kockázat mint költség

A mentés havi díjban alig látszik, a hiánya egyetlen napon mindent visz. Egy webshop, amely elveszíti a rendeléseit, nem a hosting-díjat bukja, hanem az ügyfeleit és a számláit. Ezért a mentés nem az a tétel, amin spórolni érdemes, és nem is az, amit „majd beállítunk" — ez az első, amit egy éles rendszernél rendbe kell tenni.

A NextHubon a szolgáltatások adatbázisairól és köteteiről ütemezett mentés készül, a mentések a felületen listázva látszanak, és egy kiválasztott mentés visszaállítható — a próba-visszaállítás így nem támogatási kérés, hanem egy kattintás. A megőrzési időt és a gyakoriságot a szolgáltatásnál állítod.

## Röviden

Menteni az adatbázist, a fájlokat és a konfigurációt kell — a kód a repóban van. Három kérdés: milyen gyakran, meddig, hol. A mentés akkor létezik, ha egyszer visszaállítottad próbában. A rendszer szóljon, ha a mentés nem készült el. És tudd, hogyan viszed el az adatot, ha egyszer menned kell.
