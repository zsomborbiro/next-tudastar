---
termek: nextweblap
slug: vasarloi-adatok-a-webshopban-mit-tarolj-meddig
cim: "Vásárlói adatok a webshopban: mit tárolj, meddig, és mit kérj el egyáltalán?"
metaCim: "Vásárlói adatok a webshopban — mit tárolj, meddig, jogalap"
bevezeto: "Egy webshop óhatatlanul adatot gyűjt: név, cím, e-mail, telefonszám, rendelések, néha sokkal több. A GDPR nem tiltja ezt — de minden adathoz okot, célt és lejáratot kér. A legtöbb bolt itt hibázik: nem azzal, amit tárol, hanem azzal, amit feleslegesen kér el és sosem töröl."
leiras: "Milyen vásárlói adatot gyűjthet egy webshop, milyen jogalapon, meddig, mit kell törölnie és mit megőriznie a számviteli szabályok miatt — és mit ne kérjen el."
tema: jogszabaly
megjelent: 2026-09-19
forrasok:
  - { cim: "Az Európai Parlament és a Tanács (EU) 2016/679 rendelete (GDPR) — EUR-Lex", url: "https://eur-lex.europa.eu/eli/reg/2016/679/oj" }
  - { cim: "Nemzeti Adatvédelmi és Információszabadság Hatóság (NAIH)", url: "https://naih.hu/" }
ellenorizve: 2026-09-19
kapcsolodo:
  - nextweblap/webshop-inditas-mi-kell-hozza-jogilag
  - nextweblap/kupon-es-akcio-a-webshopban-mikor-hasznal-mikor-art
  - nexthub/hol-vannak-az-ugyfeleid-adatai-gdpr-es-hosting
---

## Az alapelv: annyit, amennyi a célhoz kell

A GDPR adattakarékosságot vár: azt gyűjtsd, ami a célhoz szükséges, és ne többet. Egy rendeléshez kell a név, a szállítási cím, egy elérhetőség a futárnak és a visszaigazoláshoz — ennyi. A születési dátum, a nem, a „honnan hallott rólunk" nem kell a rendeléshez; ha kéred, ahhoz külön cél és jogalap kell, és a vevő elhagyhatja a kosarat miatta. Kevesebb mező: kevesebb jogi kockázat és több rendelés egyszerre.

## Jogalap: miért kezelheted?

Minden adatkezeléshez jogalap kell, és egy webshopban jellemzően három fordul elő.

- **Szerződés teljesítése.** A rendelés kezeléséhez, szállításhoz, számlázáshoz szükséges adatok — ehhez nem kell külön hozzájárulás, a vásárlás maga a jogalap.
- **Jogi kötelezettség.** A számla és a hozzá tartozó adatok megőrzése a számviteli szabályok szerint — ezt nem törölheted a vevő kérésére sem, amíg a megőrzési idő tart.
- **Hozzájárulás.** Hírlevél, marketing, olyan adat, ami a rendeléshez nem kell. Ezt a vevőnek külön, tevőlegesen kell megadnia — az előre bepipált négyzet nem hozzájárulás, és a rendelés sem az.

A jogalapot a tájékoztatóban meg kell nevezni adatkategóriánként. Ez nem jogászi luxus: ha tudod, mi miért van nálad, azt is tudod, mit kell törölnöd és mikor.

## Meddig?

Ez a leggyakrabban hiányzó rész. Az adatot csak addig szabad tárolni, amíg a cél indokolja — és a cél megszűnésekor törölni vagy anonimizálni kell. Egy webshopban ez rétegzett: a számlázási adatok a számviteli megőrzési idő végéig maradnak (ez évekre szól, és jogszabály írja elő); a vásárlói fiók addig, amíg a vevő használja vagy nem kéri a törlését; a hírlevél-feliratkozás a leiratkozásig; a kosáradat, ha nem lett rendelés, rövid idő után.

:::callout A számla és a törlési kérés
Ha egy vevő kéri az adatai törlését, a fiókját és a marketing-adatait törölnöd kell — a kiállított számlákat és a hozzájuk tartozó vevőadatot viszont nem, mert azok megőrzését jogszabály írja elő. A helyes válasz: „a fiókját töröltük, a számviteli bizonylatokat a törvényi határidőig őrizzük". Ezt a tájékoztatóban is érdemes előre leírni.
:::

## Kinek adod tovább?

A vevő adata több szolgáltatóhoz jut el: a futárhoz (név, cím, telefon), a fizetési szolgáltatóhoz (ha kártyás fizetés van, a kártyaadat oda megy, nem hozzád), a tárhelyszolgáltatóhoz (ahol az adatbázis fut), a levélküldőhöz. Ezek adatfeldolgozók, és a tájékoztatóban fel kell sorolni őket — a tényleges szolgáltatóidat, nem egy sablon idegen cégeit. Ha váltasz futárt vagy hosztot, a lista is változik.

A kártyaadatot a bolt ne is lássa: a fizetési szolgáltató kezeli, a te rendszeredben legfeljebb egy azonosító marad. Ez nem csak jogi, hanem biztonsági kérdés — amit nem tárolsz, azt nem lehet ellopni tőled.

## A vevő jogai, és mit kell tudnod teljesíteni

A vevő kérheti, hogy megnézhesse, milyen adatot tárolsz róla; hogy javítsd; hogy töröld (a fenti korlátokkal); és hogy megkapja az adatait hordozható formában. Egy kis boltnál ezek ritka kérések, de ha jön, válaszolni kell, határidőn belül. Tudd, hol vannak az adatok, és hogyan exportálhatók — ha a platform ezt tudja, egy kattintás; ha nem, egy nap munka.

## Mit ad a platform, és mi a te dolgod?

A webshop-platform a szerkezetet adja: a pénztár csak a szükséges mezőket kéri, a hírlevél külön hozzájárulással megy, a kártyaadat a fizetési szolgáltatónál marad, és a vevőadatok egy helyen, a bolt adminjában kezelhetők — a törlési és hozzáférési kérést az üzemeltető onnan teljesíti. A NextWeblapban ezek így működnek, az adatkezelési sablon pedig a bolt adataival készül. Amit a platform nem tud: a te megőrzési döntéseidet meghozni és a tájékoztatód végleges szövegét megírni — azt a saját folyamatodra kell szabni, és a saját helyzetedről adatvédelmi tanácsadó tud felelősséggel nyilatkozni.

## Röviden

Csak azt kérd, ami a rendeléshez kell. Három jogalap: szerződés, jogi kötelezettség, hozzájárulás — nevezd meg őket. Rétegzett megőrzés: számla a törvényi ideig, fiók a használatig, hírlevél a leiratkozásig. Soroljad a valódi adatfeldolgozóidat. Kártyaadatot ne tárolj. Tudd, hogyan exportálsz és törölsz.
