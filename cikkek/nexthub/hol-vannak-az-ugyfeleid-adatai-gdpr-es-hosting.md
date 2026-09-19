---
termek: nexthub
slug: hol-vannak-az-ugyfeleid-adatai-gdpr-es-hosting
cim: "Hol vannak az ügyfeleid adatai? A GDPR és a hosting-szolgáltató felelőssége"
metaCim: "GDPR és hosting — hol vannak az adatok, ki felel értük"
bevezeto: "Ha az alkalmazásod ügyféladatot tárol — nevet, e-mailt, rendelést —, a GDPR téged tekint adatkezelőnek, a hosting-szolgáltatót pedig adatfeldolgozónak. Ez nem jogászi finomság: meghatározza, mit kell tudnod a szolgáltatódról, és mit kell leírnod az adatkezelési tájékoztatódban."
leiras: "Adatkezelő és adatfeldolgozó a GDPR szerint, ha az alkalmazásod hosting-platformon fut: hol az adat, mit írj a tájékoztatóba, mit kérj a szolgáltatótól."
tema: jogszabaly
megjelent: 2026-09-19
forrasok:
  - { cim: "Az Európai Parlament és a Tanács (EU) 2016/679 rendelete (GDPR) — EUR-Lex", url: "https://eur-lex.europa.eu/eli/reg/2016/679/oj" }
ellenorizve: 2026-09-19
kapcsolodo:
  - nexthub/shared-hosting-vagy-alkalmazas-hosting
  - nexthub/sajat-domain-bekotese-dns-lepesrol-lepesre
  - nextsoft/kamerarendszer-a-boltban-mit-szabad-es-mit-kell-kiirni
  - nextraktar/e-nyugta-nyugtaadat-szolgaltatas
---

## Két szerep, két felelősség

A GDPR két szereplőt különböztet meg. Az **adatkezelő** az, aki eldönti, milyen adatot miért gyűjt — ha a te alkalmazásod regisztrációt kér és rendeléseket tárol, ez te vagy. Az **adatfeldolgozó** az, aki az adatkezelő megbízásából tárolja vagy kezeli az adatot, de nem ő dönt róla — ez a hosting-szolgáltatód, amelynek szerverén az adatbázisod fut.

A felelősség nem száll át. Attól, hogy az adat egy szolgáltató szerverén van, az ügyfeleid felé te maradsz a felelős: neked kell tájékoztatnod őket, neked kell teljesítened a törlési vagy hozzáférési kérésüket, és te felelsz azért, hogy megfelelő szolgáltatót választottál. A szolgáltató felelőssége az, hogy a rá bízott adatot a megállapodás szerint és biztonságosan kezelje.

## Mit kell tudnod a szolgáltatódról?

Három dolgot, és ezeket a szolgáltató dokumentációjából vagy szerződéséből kell tudnod kiolvasni.

- **Hol tárolja az adatot.** Az EU-n belüli tárolás egyszerűbb helyzet: nincs szükség külön jogalapra a továbbításhoz. Ha a szolgáltató EU-n kívüli szervereket vagy alvállalkozókat használ, az adattovábbítás külön feltételekhez kötött, és ezt neked is le kell írnod. Ha a szolgáltató nem mondja meg egyértelműen, hol vannak a szerverei, az önmagában válasz.
- **Van-e adatfeldolgozási megállapodása.** A GDPR előírja, hogy az adatkezelő és az adatfeldolgozó között írásbeli megállapodás legyen, amely rögzíti, mit tehet a feldolgozó az adattal. Komoly szolgáltatónál ez az ÁSZF része vagy külön dokumentum, és elérhető anélkül, hogy kérned kellene.
- **Milyen alvállalkozókat használ.** A hosting-szolgáltató maga is használhat további szolgáltatókat — például a hálózati védelemhez vagy a levélküldéshez. Ezeket a megállapodásban fel kell sorolnia, mert az adat rajtuk is átmegy.

## Mit kell leírnod a saját tájékoztatódban?

Az ügyfeleid felé szóló adatkezelési tájékoztatóban szerepelnie kell, hogy az adataik tárolásához adatfeldolgozót veszel igénybe, és annak, hogy ki az. Nem kell a szerver típusát vagy a technikai részleteket leírni; az kell, hogy az érintett lássa: ki fér hozzá az adatához és hol. Ha a szolgáltató EU-n belül tárol, ezt érdemes kimondani — ez az ügyfél számára egyszerű, megnyugtató információ.

Ugyanez érvényes minden más szolgáltatásra, amely az adatokat érinti: levélküldő, fizetési szolgáltató, analitika. A hosting az egyik a listán, gyakran az első.

:::callout A leggyakoribb mulasztás
A tájékoztató egy sablonból készül, amelyben az adatfeldolgozók helyén egy másik cég szolgáltatói szerepelnek — vagy senki. Egy tájékoztató, amely nem a te tényleges szolgáltatóidat sorolja, nem tájékoztat. Ha váltasz hosztot, ezt a listát is frissíteni kell.
:::

## Mi a te dolgod a biztonságban?

A GDPR megfelelő technikai és szervezési intézkedéseket vár el, és ezt a felelősséget is megosztja. A szolgáltató felel a szerverért, a hálózatért, a fizikai hozzáférésért és a saját rendszereiért. Te felelsz az alkalmazásodért: hogy a jelszavakat ne nyílt szövegben tárold, hogy az adminisztrációs felület ne legyen bárki számára nyitva, hogy a titkos kulcsok ne a kódban legyenek. A legjobb hoszt sem véd meg egy nyitva hagyott admin-oldaltól.

Ide tartozik a mentés is. Az adat elvesztése ugyanúgy adatvédelmi incidens lehet, mint a kiszivárgása. Tudd, milyen gyakran készül mentés, és próbáld ki egyszer a visszaállítást — nem incidens közben.

## Mi történik egy incidensnél?

Ha az adat illetéktelen kézbe kerül vagy elvész, az adatkezelőnek — neked — meghatározott időn belül jelentenie kell a felügyeleti hatóságnak, és bizonyos esetekben az érintetteket is értesítenie. A szolgáltató kötelessége, hogy a saját rendszereiben észlelt incidensről haladéktalanul tájékoztasson téged, mert nélküle nem tudsz határidőre jelenteni. Ez is a megállapodás része kell legyen.

## Röviden

Te vagy az adatkezelő, a hoszt az adatfeldolgozó — a felelősség a tiéd marad. Tudd, hol tárol, van-e megállapodása, kiket használ. Írd le a tájékoztatódban. A biztonság megosztott: a szerver az övé, az alkalmazás a tiéd. A NextHub szerverei Magyarországon, az EU-n belül működnek, az adatfeldolgozási feltételek a szolgáltatás nyilvános dokumentumainak részei — de a saját tájékoztatódat ettől még neked kell megírnod, és a saját helyzetedről az adatvédelmi tanácsadód vagy jogászod tud felelősséggel nyilatkozni.
