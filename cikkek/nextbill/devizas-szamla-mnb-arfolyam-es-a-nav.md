---
termek: nextbill
slug: devizas-szamla-mnb-arfolyam-es-a-nav
cim: "Devizás számla: melyik árfolyammal, és mi kerül a NAV-hoz?"
metaCim: "Devizás számla — MNB-árfolyam, forint-átváltás, NAV"
bevezeto: "Az első euróban kiállított számla után jön a kérdés: milyen árfolyamon, melyik napon, és mit kell forintban feltüntetni? A szabály tiszta, csak sokan rossz helyen keresik. Itt az a néhány dolog, ami tényleg számít."
leiras: "Devizás számla magyar vállalkozásként: melyik árfolyam, melyik nap, mit kell forintban feltüntetni, és mi kerül a NAV-hoz. Gyakorlati összefoglaló."
tema: penzugy
megjelent: 2026-09-19
kapcsolodo:
  - nextbill/kotelezo-e-a-nav-online-szamla
  - nextbill/ismetlodo-szamla-mit-lehet-automatizalni
  - nexthub/hol-vannak-az-ugyfeleid-adatai-gdpr-es-hosting
  - nextraktar/arres-es-beszerzesi-ar
---

## Miért nem elég egyszerűen euróban számlázni?

Egy magyar vállalkozás kiállíthat számlát idegen pénznemben — ez teljesen normális, ha a vevő külföldi, vagy ha a szerződés devizában szól. A magyar adószabályok azonban forintban gondolkodnak: az áfát forintban kell bevallani és megfizetni, a könyvelés forintban vezeti a bevételt. Ezért egy devizás számlán az adóval kapcsolatos összegeket forintban is fel kell tüntetni, és ehhez kell egy árfolyam.

A gyakorlati kérdés tehát nem az, hogy szabad-e euróban számlázni, hanem az, hogy melyik árfolyamot használod, és melyik napét. Ha ezt egyszer eldöntöd és a rendszered következetesen alkalmazza, a devizás számlázás ugyanolyan rutin lesz, mint a forintos.

## Melyik árfolyam?

A szabály választást enged: használható a Magyar Nemzeti Bank hivatalos árfolyama, vagy egy belföldi hitelintézet eladási árfolyama. A legtöbb kisvállalkozás az MNB-t választja, két okból. Egyrészt egyértelmű és nyilvános: bárki ellenőrizheti, nem függ attól, melyik banknál vezeted a számládat. Másrészt a számlázóprogramok ezt tudják automatikusan lekérni — a napi árfolyam megjelenik, nem kell kézzel beírni.

Amit fontos tudni: ha egyszer választottál, annál maradni kell. Nem lehet számlánként váltogatni aszerint, melyik kedvezőbb. Ha az MNB mellett döntesz, minden devizás számlád azzal készül.

## Melyik nap árfolyama?

Ez az a pont, ahol a legtöbb hiba történik. Nem a számla kiállításának napja számít alapesetben, hanem a teljesítés napja — vagyis az a nap, amikor a terméket átadtad vagy a szolgáltatást teljesítetted. Ha a teljesítés és a számlázás ugyanaznap történik, nincs különbség. Ha viszont hónap végén számlázol egy hónap elején elvégzett munkát, a hónap eleji árfolyam érvényes.

Előlegszámlánál más a helyzet: ott az előleg kézhezvételének napja számít. Ismétlődő, folyamatos szolgáltatásnál — például havidíjas munkánál — a teljesítés napja az elszámolási időszakhoz kötődik, és ezt a számlázórendszernek követnie kell.

:::callout A leggyakoribb hiba
A számlázás napjának árfolyamával számolni akkor is, ha a teljesítés korábban volt. Egy mozgalmas devizapiacon ez napok alatt is látható különbség a forintban kimutatott adóban. A rendszered akkor jó, ha a teljesítés dátumához keresi az árfolyamot, nem a mai naphoz.
:::

## Mit kell forintban feltüntetni?

Nem az egész számlát kell forintra váltani. Az áfa összegét kell forintban is feltüntetni, és ehhez a rendszer a nettó összeget és az adót az alkalmazott árfolyamon átszámolja. A vevő számára a számla euróban szól, a magyar adóhatóság számára az adó forintban látszik. Egy jó program a számlán külön sorban mutatja: a devizás összegeket, az alkalmazott árfolyamot és a napját, és a forintban kifejezett adót.

Ha a vevő is magyar adóalany, de a szerződés devizás, ugyanez a szabály — és a vevő a saját könyvelésében ugyanezzel a forintértékkel fog dolgozni, ezért nem mindegy, hogy a számla egyértelműen mutatja-e az árfolyamot.

## Mi kerül a NAV-hoz?

A devizás számláról ugyanúgy megy adatszolgáltatás a NAV Online Számla rendszerébe, mint a forintosról. Az adatszolgáltatásban szerepel a pénznem, az árfolyam és a forintban kifejezett adó. Ez azt jelenti, hogy ha a számlán rossz árfolyam van, az adatszolgáltatásban is rossz lesz — a hatóság pontosan azt látja, amit te kiállítottál. Az adatszolgáltatás nem javítja ki a hibát, csak továbbítja.

Ezért érdemes a devizás számlázást olyan rendszerre bízni, amely az árfolyamot magától kéri le a teljesítés napjára, és nem kézi beírásra hagyja. A NextBill a napi MNB-árfolyammal dolgozik, a teljesítés dátumához igazítva, és a számlán feltünteti az árfolyamot meg a forintban kifejezett adót — a NAV felé ugyanez az adat megy.

## Amit a könyvelőddel érdemes egyeztetni

Két dolgot: hogy az MNB-árfolyamot használjátok-e (ez a tipikus), és hogy a devizás bevételek árfolyam-különbözetét hogyan kezeli a könyvelés. Az utóbbi már nem a számla, hanem a pénzügyi teljesítés kérdése — ha a vevő később fizet, és időközben mozdult az árfolyam, a különbözet a könyvelésben jelenik meg, nem a számlán. Ez a könyvelő dolga; a te dolgod, hogy a számla helyes árfolyammal és forintban feltüntetett adóval készüljön.

## Röviden

Devizában számlázni lehet, de az adót forintban is fel kell tüntetni. Válaszd az MNB-árfolyamot, és maradj mellette. A teljesítés napjának árfolyamával számolj, ne a számlázás napjáéval. A NAV pontosan azt kapja, ami a számlán van — ezért a rendszered végezze az átváltást, ne te.
