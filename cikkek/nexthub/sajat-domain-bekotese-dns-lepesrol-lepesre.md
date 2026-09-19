---
termek: nexthub
slug: sajat-domain-bekotese-dns-lepesrol-lepesre
cim: "Saját domain bekötése: a DNS lépésről lépésre, hibák nélkül"
metaCim: "Saját domain bekötése — DNS lépésről lépésre"
bevezeto: "Megvan a domain, fut az alkalmazás, és a kettő között ott egy rekordszerkesztő, amiben A, CNAME, TTL és proxy szerepel. Ez a cikk végigvisz azon, mit kell beállítani, mit nem, és honnan tudod, hogy sikerült — anélkül, hogy a DNS működését fejből kellene tudnod."
leiras: "Saját domain bekötése hosztolt alkalmazáshoz: A vagy CNAME rekord, www-változat, TTL, terjedési idő, HTTPS-tanúsítvány — lépésről lépésre, a gyakori hibákkal."
tema: gyakorlat
megjelent: 2026-09-19
kapcsolodo:
  - nexthub/hogyan-kerul-egy-github-repo-elesbe
  - nexthub/shared-hosting-vagy-alkalmazas-hosting
  - nextraktar/masodik-bolt-nyitasa
---

## Mi történik, amikor valaki beírja a domainedet?

A böngésző nem tudja, hol fut az alkalmazásod. Először megkérdezi a domain névszervereit — ez a DNS —, hogy a `pelda.hu` mögött milyen cím áll. A válasz vagy egy IP-cím (A rekord), vagy egy másik név (CNAME rekord), amit aztán tovább kell feloldani. Amikor ez megvan, a böngésző odacsatlakozik, és a hoszt eldönti, melyik alkalmazás válaszoljon erre a domainre.

A „bekötés" tehát két dolgot jelent: a DNS-ben megmondod, hová menjen a forgalom, a hosztnál pedig megmondod, hogy ez a domain a te alkalmazásodhoz tartozik. Ha csak az egyiket csinálod meg, a látogató vagy nem jut el sehova, vagy egy idegen alapértelmezett oldalt lát.

## Első lépés: melyik rekordot kéri a hoszt?

Ezt nem neked kell kitalálnod. A hosting-szolgáltató a domain hozzáadásakor megmondja: vagy egy IP-címet ad, amit A rekordként kell felvenned, vagy egy célnevet, amit CNAME-ként. A kettő között a gyakorlati különbség az, hogy a CNAME akkor is működik marad, ha a hoszt mögött megváltozik az IP — ezért a legtöbb modern szolgáltató CNAME-et kér, ahol csak lehet.

Egy fontos kivétel: a domain „csupasz" változata (`pelda.hu`, `www` nélkül) sok DNS-szolgáltatónál nem lehet CNAME, csak A rekord. Ilyenkor a hoszt vagy IP-t ad a csupasz névhez, vagy a DNS-szolgáltatód kínál egy CNAME-szerű megoldást a gyökérre. Ha a felület nem engedi a CNAME-et a gyökérre, ez nem hiba, hanem szabvány — nézd meg, mit ajánl a hoszt erre az esetre.

## Második lépés: a rekord felvétele

A DNS-szolgáltatód felületén (ez gyakran ott van, ahol a domaint vetted, de lehet külön is) a domain zónájában új rekordot veszel fel.

- **Név:** `www`, ha a www-változatot kötöd; `@` vagy üres, ha a csupasz domaint.
- **Típus:** amit a hoszt kért — A vagy CNAME.
- **Érték:** az IP-cím vagy a célnév, pontosan úgy, ahogy a hoszt megadta. A záró pont a célnév végén egyes felületeken kötelező, másokon tilos — a felület jelzi, ha nem tetszik neki.
- **TTL:** hagyd az alapértelmezésen, vagy állítsd rövidre, amíg tesztelsz. A TTL azt mondja meg, meddig tárolhatják el a válaszodat a hálózat gyorsítótárai; egy rövid érték azt jelenti, hogy egy javítás gyorsabban ér el mindenhova.

:::callout A proxy kapcsoló
Ha a DNS-szolgáltatód kínál „proxied" vagy „felhő" kapcsolót a rekord mellett, az azt jelenti, hogy a forgalom előbb az ő hálózatán megy át. Ez hasznos lehet, de a hoszt tanúsítvány-kiállítását és domain-ellenőrzését meg is akaszthatja. Első bekötésnél kapcsold ki, és csak akkor kapcsold be, ha a hoszt dokumentációja szerint támogatott.
:::

## Harmadik lépés: a www és a csupasz domain

A látogatók egy része `www`-vel írja be a címet, más része anélkül. Mindkettőnek működnie kell, és az egyiknek át kell irányítania a másikra — különben a keresők két külön oldalnak látják ugyanazt. Döntsd el, melyik az elsődleges (a legtöbb modern oldal a csupasz domaint választja), a másikat pedig irányítsd át. A jó hosztok ezt maguktól megcsinálják, ha mindkét változatot felveszed náluk.

## Negyedik lépés: várakozás és ellenőrzés

A DNS-változás nem azonnali. A gyorsítótárak a régi választ a TTL lejártáig őrzik, tehát egy friss rekord percek vagy órák alatt ér el mindenhova. A hoszt általában maga is ellenőrzi, feloldódik-e már a domain a helyes címre, és csak utána állítja ki a HTTPS-tanúsítványt.

Ellenőrizni két helyen érdemes. A hoszt felületén a domain állapotát nézd: „várakozik", „ellenőrizve", „aktív". A saját gépeden pedig egy DNS-lekérdező eszközzel vagy egy nyilvános DNS-ellenőrző oldallal, ami több helyről kérdezi le a domaint — így látod, hogy már mindenhol az új érték van-e, vagy csak nálad.

## A HTTPS-tanúsítvány

Amikor a domain feloldódik és a hoszt látja a forgalmat, kiállít egy tanúsítványt, hogy a látogató biztonságos kapcsolatot kapjon. Ez automatikus, de csak akkor tud lefutni, ha a DNS helyes és a forgalom tényleg a hoszthoz ér. Ha a domain „aktív", de a böngésző tanúsítványhibát mutat, adj neki még pár percet, majd nézd meg, nincs-e proxy vagy régi rekord az útban.

A NextHubon a domain hozzáadásakor a felület megmondja a felveendő rekordot, ellenőrzi a feloldást, és a tanúsítványt magától kiállítja — a `www` és a csupasz változat egyszerre köthető, az egyik automatikusan a másikra irányít.

## A négy leggyakoribb hiba

Régi A rekord maradt a zónában az új CNAME mellett — a kettő ütközik, töröld a régit. Elgépelt célnév — másold, ne gépeld. Bekapcsolt proxy első bekötésnél — kapcsold ki az ellenőrzés idejére. Türelmetlenség — a TTL lejárta előtt a saját géped még a régit látja; ez nem hiba.

## Röviden

Kérdezd meg a hosztot, milyen rekord kell. Vedd fel pontosan. Kösd be a www és a csupasz változatot is, egyik irányítson a másikra. Várj a TTL-nek megfelelően, ellenőrizz több helyről. A tanúsítvány magától jön, ha a DNS helyes.
