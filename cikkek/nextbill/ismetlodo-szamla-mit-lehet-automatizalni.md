---
termek: nextbill
slug: ismetlodo-szamla-mit-lehet-automatizalni
cim: "Ismétlődő számla: mit érdemes automatizálni, és mit nem?"
metaCim: "Ismétlődő számlázás — mit automatizálj, mit ne"
bevezeto: "Ha havonta ugyanazoknak, ugyanazért számlázol, minden hónap elején ugyanazt a húsz percet töltöd el ugyanazzal a munkával — és néha elfelejtesz egyet. Az ismétlődő számlázás pont erre való, de nem mindent érdemes rábízni."
leiras: "Mikor éri meg az ismétlődő számlázás, mit lehet biztonságosan automatizálni, hol kell emberi kontroll, és hogyan kerüld el a gyakori hibákat."
tema: gyakorlat
megjelent: 2026-09-19
kapcsolodo:
  - nextbill/devizas-szamla-mnb-arfolyam-es-a-nav
  - nextbill/szamla-vagy-nyugta-mikor-melyik
  - nextsoft/crm-kisvallalkozasnak-mikor-eri-meg
  - nextraktar/szallitoi-rendeles-osszeallitasa
---

## Kinek való az ismétlődő számla?

Bárkinek, akinek a bevétele időszakonként ugyanúgy ismétlődik: havidíjas szolgáltatás, bérleti díj, karbantartási szerződés, előfizetés, könyvelési díj, weboldal-üzemeltetés. A közös bennük, hogy a vevő, a tétel és az összeg hónapról hónapra ugyanaz, csak a dátum változik. Ha a számláid nagy része ilyen, az ismétlődő számlázás nem kényelmi funkció, hanem a hibák megelőzésének eszköze.

Ahol nem való: ahol a tétel minden alkalommal más. Óradíjas munkánál, változó mennyiségű szállításnál, projektalapú megbízásnál a számla tartalma hónapról hónapra változik — ott a sablon segít, az automatikus kiállítás nem.

## Mit lehet biztonságosan automatizálni?

- **A kiállítás időzítését.** Hónap első napján, vagy a szerződés szerinti napon a számla magától elkészül. Ez az, ami a legtöbb időt spórolja, és ami a legkevesebb kockázattal jár: a tartalom fix, csak a dátum új.
- **A számlaszám és a sorszámozás.** Ezt amúgy sem kézzel csinálod; az automatikus kiállításnál is a rendszer adja, a saját tartományában.
- **A teljesítési időszak feltüntetését.** Havidíjas szolgáltatásnál a számlán szerepelnie kell, melyik időszakra vonatkozik. A rendszer ezt a ciklusból számolja — ez az, amit kézzel a legkönnyebb elrontani.
- **A NAV-adatszolgáltatást.** Az automatikusan kiállított számla ugyanúgy beküldésre kerül, mint a kézi. Nincs külön teendő.
- **A kiküldést.** Ha a számla elkészült, a vevő e-mailben megkapja. Ezt is lehet automatikusra állítani, de erről lent külön szó lesz.

## Mit ne automatizálj — vagy csak ellenőrzéssel?

Az első kockázat a „csendes hiba": egy automatikus számla akkor is elkészül, ha a szerződés közben megszűnt, az ár változott, vagy a vevő cége átalakult. A rendszer nem tudja, hogy a vevő felmondott — csak te tudod. Ezért az ismétlődő számlázásnál a legfontosabb nem a kiállítás, hanem a **karbantartás**: amikor egy szerződés változik, az ismétlődő tételt azonnal frissíteni kell.

A második kockázat az automatikus kiküldés. Ha a számla elkészül és azonnal elmegy a vevőnek, nincs pillanat, amikor ránézel. Ez rendben van egy stabil, régi ügyfélkörnél; új ügyfélnél, vagy ahol az összeg időnként változik, érdemes az „elkészül, de kiküldés előtt jóváhagyom" beállítás. Egy percbe kerül, és megspórolja a sztornót.

:::callout A sztornó drágább, mint az ellenőrzés
Egy rosszul kiállított automatikus számlát érvényteleníteni kell, újat kiállítani, és mindkettőről adatszolgáltatás megy a NAV felé. A vevő két dokumentumot kap, és kérdez. Egy ránézés a kiküldés előtt olcsóbb, mint ez a kör.
:::

## Hogyan állítsd be jól?

Először gyűjtsd össze, mely vevőknek jár ismétlődő számla, és mi az időszakuk: havi, negyedéves, éves. Ne csak a fejedből — nézd át az elmúlt hónapok számláit, mert biztosan találsz olyat, amit rendszeresen kézzel állítasz ki, és nem gondoltál rá ismétlődőként.

Ezután minden ismétlődő tételhez rögzítsd a kezdő dátumot, a ciklust, és ha van, a végdátumot. A végdátum sokszor kimarad, pedig ez véd meg attól, hogy egy határozott idejű szerződés után is menjen a számla. Ha nincs végdátum, legyen egy emlékeztetőd a szerződés évfordulójára.

Végül döntsd el vevőnként, hogy automatikus kiküldés vagy jóváhagyás. Az elején inkább jóváhagyás; ha két-három hónap után egyszer sem kellett belenyúlnod, kapcsold automatikusra.

## Mi történik az árváltozásnál?

Ez a leggyakoribb kérdés. Ha egy szolgáltatás díja változik, az ismétlődő tételt módosítani kell, mégpedig a következő ciklus előtt. A jó rendszer az ismétlődő tételt és a már kiállított számlákat külön kezeli: a múltbeli számlák nem változnak, a jövőbeli kiállítás az új díjjal megy. Rossz megoldás az, ha az árváltozás visszamenőleg is átírja a korábbi számlákat — ilyet ne is engedjen a program.

Devizás ismétlődő számlánál az árfolyam minden kiállításkor az aktuális teljesítési naphoz igazodik, tehát a devizában rögzített díj fix, a forintban kimutatott adó ciklusonként változhat. Ez normális, nem hiba.

## Röviden

Automatizáld a kiállítás időzítését, a sorszámot, az időszakot és a NAV-beküldést. Tartsd kézben a szerződésváltozásokat és — az elején — a kiküldést. Adj végdátumot mindennek, aminek van vége. A NextBillben az ismétlődő számlák a beállított ciklus szerint készülnek, a kiküldés kérhető jóváhagyással, és az árváltozás csak a jövőbeli számlákra hat — ez a három dolog az, amitől az automatizálás nem kockázat, hanem megkönnyebbülés.
