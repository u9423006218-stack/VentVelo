import { 
  CurrencyRate, 
  Currency, 
  VanPickupZone, 
  ServicePackage, 
  CustomRepairItem, 
  BikeProduct, 
  AccessoryProduct, 
  MaintenanceJob, 
  UserBike, 
  OrderRecord, 
  EmailNotification 
} from '../types';

export const CURRENCY_RATES: Record<Currency, CurrencyRate> = {
  EUR: { symbol: '€', rate: 1.0, label: 'EUR (€)' },
  USD: { symbol: '$', rate: 1.08, label: 'USD ($)' },
  GBP: { symbol: '£', rate: 0.85, label: 'GBP (£)' },
  PLN: { symbol: 'zł', rate: 4.30, label: 'PLN (zł)' },
  SEK: { symbol: 'kr', rate: 11.40, label: 'SEK (kr)' },
};

export const WORKSHOP_BRANCHES = [
  {
    id: 'rindas44',
    name: 'VentVelo velodarbnīca un veikals – Rindas iela 44',
    address: 'Rindas iela 44, Ventspils, LV-3602 (Pārventa)',
    phone: '+371 27583888',
    hours: 'Pirmd. – Piektd.: 10:00 – 18:00 (Sestd.: 10:00 – 15:00)',
    email: 'ventvelo@ventvelo.lv',
    isMain: true,
  },
];

export const VAN_PICKUP_ZONES: VanPickupZone[] = [
  {
    region: 'Ventspils',
    displayName: 'Ventspils pilsēta un tuvējā apkārtne',
    distanceKm: '0 – 12 km',
    estimatedLeadTime: 'Izbraukums tajā pašā vai nākamajā rītā',
    feeEur: 8,
    freeThresholdEur: 50,
    coverageNote: 'Visa pilsēta: Centrs, Pārventa, Gāliņciems, Staldzene, kā arī Ventspils brīvostas un rūpnieciskā zona.',
    pickupDays: ['Pirmdiena', 'Otrdiena', 'Trešdiena', 'Ceturtdiena', 'Piektdiena'],
  },
  {
    region: 'Usma',
    displayName: 'Usmas ezera piekraste un pagasts',
    distanceKm: '35 – 45 km',
    estimatedLeadTime: 'Regulārie reisi (Pirmd., Trešd., Piektd.)',
    feeEur: 18,
    freeThresholdEur: 120,
    coverageNote: 'Usmas ciems, ezera kempingi, viesu nami, privātmājas un Spāres krustojums.',
    pickupDays: ['Pirmdiena', 'Trešdiena', 'Piektdiena'],
  },
  {
    region: 'Talsi',
    displayName: 'Talsu novads un maršruta koridors',
    distanceKm: '55 – 65 km',
    estimatedLeadTime: 'Iknedēļas Kurzemes maršruts (Otrd. un Ceturtd.)',
    feeEur: 22,
    freeThresholdEur: 150,
    coverageNote: 'Talsu pilsētas centrs, Stende, Pastende, Mundigciems un Sabiles virziens.',
    pickupDays: ['Otrdiena', 'Ceturtdiena'],
  },
];

export const SERVICE_PACKAGES: ServicePackage[] = [
  {
    id: 'safety_tuneup',
    name: 'Sezonas drošības apkope',
    nameLv: 'Drošības un sezonas profilakse',
    priceEur: 29,
    durationHours: 3,
    guaranteeMonths: 2,
    description: 'Rūpīga 18 punktu mezglu un drošības pārbaude, bremžu kluču pievilkšana, ātrumu pārslēdzēju regulēšana, pareizs spiediens riepās un ķēdes eļļošana.',
    idealFor: 'Pavasara sezonas atklāšanai, ikdienas pilsētas braucējiem un bērnu velosipēdiem.',
    checklist: [
      '18 punktu mehāniskā pārbaude un skrūvju pievilkšana ar dinamometrisko atslēgu',
      'Priekšējo un aizmugurējo bremžu regulēšana un trošu nospriegošana',
      'Ātrumu pārslēdzēju (derailleur) regulācija un robežskrūvju iestatīšana',
      'Ķēdes nodiluma mērīšana ar kalibru un apstrāde ar vaska vai keramikas eļļu',
      'Riepu spiediena korekcija un protektora pārbaude pret plaisām no jūras sāls',
      'Stūres bļodiņu un iznesuma taisnošana atbilstoši rūpnīcas standartam',
    ],
  },
  {
    id: 'standard_overhaul',
    name: 'Standarta pilnā apkope',
    nameLv: 'Pilnā darbnīcas apkope',
    priceEur: 59,
    durationHours: 6,
    guaranteeMonths: 6,
    popular: true,
    description: 'Dziļā mezglu revīzija: piedziņas tīrīšana ultraskaņas vannā, ratu taisnošana un spieķošana, monobloka gultņu pārbaude, bremžu kluču attaukošana.',
    idealFor: 'Velosipēdiem ar nobraukumu virs 1000 km sezonā, grants ceļu un šosejas braucējiem.',
    checklist: [
      'Ietver visas Sezonas drošības apkopes pozīcijas',
      'Ķēdes, kasetes un klaņu zvaigžņu dziļā tīrīšana ultraskaņas ķīmiskajā vannā',
      'Precīza ratu taisnošana un spieķu nospriegošana uz Park Tool statīva',
      'Monobloka (bottom bracket) un klaņu asu pārbaude, attīrīšana un jauna smēre',
      'Stūres bļodiņu gultņu izjaukšana, pārlasīšana un ūdensizturīgā smērviela',
      'Bremžu disku taisnošana, kluču attaukošana un pieslīpēšana',
      'Meistara testa brauciens un mezglu pārbaude reālos slodzes apstākļos',
    ],
  },
  {
    id: 'kapitalais_remonts',
    name: 'Kapitālais remonts un rekonstrukcija',
    nameLv: '100% Pilnā rāmja pārlasīšana',
    priceEur: 119,
    durationHours: 14,
    guaranteeMonths: 12,
    description: 'Ričuks tiek pilnībā izjaukts līdz plikam rāmim. Visi gultņi, troses, apvalki un šķidrumi tiek atjaunoti. Komplektā oficiāls 12 mēnešu meistara garantijas sertifikāts.',
    idealFor: 'Intensīvi lietotiem sporta velosipēdiem, retro modeļu restaurācijai un sacensību tehnikai.',
    checklist: [
      'Pilnīga velosipēda demontāža līdz kailam rāmim un rāmja ģeometrijas pārbaude',
      'Priekšējās un aizmugurējās rumbas (hub) gultņu un konusu pilnīga pārlasīšana',
      'Pilna hidraulisko bremžu sistēmas skalošana un atgaisošana ar jaunu eļļu',
      'Visu trošu un apvalku (Jagwire nerūsējošais tērauds) pilnīga nomaiņa',
      'Monobloka un klaņu mezgla kapitālā restaurācija vai jaunu gultņu presēšana',
      'Amortizācijas dakšas kāju un blīvslēgu pārbaude, stūres caurules inspekcija',
      'Rāmja apstrāde ar aizsargājošu keramisko vasku un pilns ceļa drošības tests',
      'Drukāts 24 punktu diagnostikas protokols un 1 gada darbnīcas garantijas sertifikāts',
    ],
  },
  {
    id: 'escooter_diagnostic',
    name: 'E-skrejriteņu un elektrovelo diagnostika',
    nameLv: 'Elektropiedziņas un bateriju pārbaude',
    priceEur: 49,
    durationHours: 4,
    guaranteeMonths: 3,
    description: 'Datorizēta elektronikas un baterijas šūnu pārbaude, vadības bloka tests, motora hidroizolācijas atjaunošana un rekuperatīvo bremžu kalibrēšana.',
    idealFor: 'Xiaomi, Segway/Ninebot, Kugoo, kā arī Bosch, Shimano STEPS un Bafang sistēmām.',
    checklist: [
      'Baterijas sprieguma, kapacitātes un atsevišķu šūnu līdzsvara datorizēts tests',
      'Akseleratora roktura, displeja un vadības bloka (kontrollera) slodzes tests',
      'Ritenī iebūvētā elektromotora gultņu pārbaude un silikona mitruma aizsardzība',
      'Elektronisko bremžu sensoru un mehānisko disku sinhronizācija',
      'Nolocīšanas mehānisma lūkas un bukses pārbaude pret bīstamu brīvkustību',
      'Programmatūras atjauninājums un drošības testa brauciens darbnīcas pagalmā',
    ],
  },
];

export const CUSTOM_REPAIR_ITEMS: CustomRepairItem[] = [
  { id: 'rep_wheel_true', name: 'Rata centrēšana un taisnošana (Rata centrēšana)', priceEur: 15, category: 'wheels', estimatedTime: '45 min' },
  { id: 'rep_wheel_spoke', name: 'Spieķa nomaiņa ar nospriegošanu un balansu', priceEur: 18, category: 'wheels', estimatedTime: '1 stunda' },
  { id: 'rep_brake_bleed', name: 'Hidraulisko bremžu atgaisošana (minerāleļļa vai DOT)', priceEur: 20, category: 'brakes', estimatedTime: '45 min' },
  { id: 'rep_tubeless', name: 'Bezkameru sistēmas (Tubeless) uzstādīšana un hermētiķis', priceEur: 22, category: 'wheels', estimatedTime: '45 min' },
  { id: 'rep_chain_cassette', name: 'Ķēdes un kasetes maiņas darbs', priceEur: 16, category: 'drivetrain', estimatedTime: '30 min' },
  { id: 'rep_fork_service', name: 'Amortizācijas dakšas blīvslēgu maiņa un eļļošana', priceEur: 45, category: 'suspension', estimatedTime: '2 stundas' },
];

export const BIKES_FOR_SALE: BikeProduct[] = [
  {
    id: 'bike_gravel_adv',
    name: 'VentVelo Baltic Gravel Adv 1.0',
    category: 'Gravel & Road',
    priceEur: 1249,
    originalPriceEur: 1399,
    image: '/src/assets/images/store_curated_gravel_bike_1794340032744.jpg',
    frameMaterial: 'Viegls hidroformēts alumīnijs un pilna oglekļa (Carbon) priekšējā dakša',
    groupset: 'Shimano GRX 1x11 Shadow Plus ar sajūgu (40T x 11-42T)',
    brakes: 'Shimano GRX hidrauliskās disku bremzes, 160mm IceTech rotori',
    sizesAvailable: ['S (51cm)', 'M (54cm)', 'L (57cm)', 'XL (60cm)'],
    inStockCount: 4,
    guaranteeMonths: 24,
    condition: 'Brand New',
    specs: {
      weightKg: 9.4,
      wheelSize: '28" / 700c DT Swiss G1800 rati',
      gears: 11,
      color: 'Matēti olīvzaļš un obsidiāna melns',
    },
    features: [
      '2 gadu pilna VentVelo darbnīcas garantija un bezmaksas 1. apkope pēc 300 km',
      'Plaša riepu caurlaidība līdz pat 700x48c grants un meža ceļiem',
      'Iekšējā trošu vilkšana, stiprinājumi dubļusargiem un bagāžniekiem',
      'Gatavs bezkameru braukšanai ar WTB Riddler 700x40c riepām',
    ],
    inspectionPassed: true,
  },
  {
    id: 'bike_city_cruiser',
    name: 'VentVelo Baltic Cruiser Deluxe',
    category: 'City & Commuter',
    priceEur: 580,
    image: '/src/assets/images/hero_bicycle_workshop_1794340029993.jpg',
    frameMaterial: 'Pazemināts 6061 alumīnija komforta rāmis ar iebūvētu bagāžnieku',
    groupset: 'Shimano Nexus 7 ātrumu rumbā iebūvētie zobrati (slēgts mehānisms)',
    brakes: 'Aizmugurē pedāļu bremze (kāja) un priekšā uzticama V-veida rokas bremze',
    sizesAvailable: ['M (48cm)', 'L (53cm)'],
    inStockCount: 6,
    guaranteeMonths: 18,
    condition: 'Brand New',
    specs: {
      weightKg: 14.8,
      wheelSize: '28" pastiprinātie dubultie aploki',
      gears: 7,
      color: 'Baltijas dziļjūras tumši zilais glancēts',
    },
    features: [
      'Zobrati hermētiski slēgti rumbā – pasargāti no Ventspils lietus un smiltīm',
      'Priekšējā rumbā iebūvēts Shimano ģenerators, kas baro LED lukturus',
      'Pilna garuma SKS Germany alumīnija dubļusargi un pilns ķēdes aizsargs',
      'Īpaši ērts Selle Royal želejas sēdeklis un plata holandiešu stila stūre',
    ],
    inspectionPassed: true,
  },
  {
    id: 'bike_urban_belt',
    name: 'VentVelo Urban Belt Commuter CDX',
    category: 'City & Commuter',
    priceEur: 890,
    originalPriceEur: 990,
    image: '/src/assets/images/service_van_mobile_repair_1794340031954.jpg',
    frameMaterial: 'Trīskārtīgi batēts 6061 alumīnijs ar pulētām TIG šuvēm',
    groupset: 'Gates Carbon Drive CDX zobsiksna (nav jātīra, nav jāeļļo, nerūsē)',
    brakes: 'Shimano MT200 hidrauliskās disku bremzes',
    sizesAvailable: ['M (54cm)', 'L (58cm)'],
    inStockCount: 3,
    guaranteeMonths: 24,
    condition: 'Brand New',
    specs: {
      weightKg: 11.2,
      wheelSize: '28" ar Continental Contact Urban pretcaurduršanas riepām',
      gears: 8,
      color: 'Matēts ieroču tērauda pelēks',
    },
    features: [
      'Gates CDX oglekļa šķiedras zobsiksna kalpo līdz 30 000 km bez eļļas un rūsas',
      'Shimano Alfine 8 ātrumu iekšējā transmisija ātrai braukšanai pilsētā',
      'Izturīgas Continental riepas, kas piemērotas Ventspils bruģim un veloceliņiem',
      'Minimālistisks dizains un praktiski nulle uzturēšanas izmaksu',
    ],
    inspectionPassed: true,
  },
  {
    id: 'bike_e_trekker',
    name: 'VentVelo E-Trekker All-Terrain CX',
    category: 'E-Bikes',
    priceEur: 2390,
    image: '/src/assets/images/store_curated_gravel_bike_1794340032744.jpg',
    frameMaterial: 'Pastiprināts alumīnija e-rāmis ar integrētu Bosch PowerTube akumulatoru',
    groupset: 'Shimano Deore M5100 10 ātrumu un Bosch Performance Line 85Nm motors',
    brakes: 'Tektro HD 4 virzuļu jaudīgās hidrauliskās disku bremzes (180mm rotori)',
    sizesAvailable: ['M (48cm)', 'L (52cm)', 'XL (56cm)'],
    inStockCount: 2,
    guaranteeMonths: 24,
    condition: 'Brand New',
    specs: {
      weightKg: 22.8,
      wheelSize: '29" Schwalbe Super Moto-X 2.4" platās riepas',
      gears: 10,
      color: 'Titāna grafīts un dinamiski oranžs',
    },
    features: [
      'Spēcīgs 85Nm Bosch motors viegli pieveic Kurzemes paugurus un piejūras pretvēju',
      'Lielas ietilpības 625Wh baterija nodrošina līdz pat 130 km nobraukumu ar vienu uzlādi',
      'Suntour amortizācijas dakša ar bloķēšanas funkciju gludam asfaltam',
      'VentVelo 2 gadu oficiālā garantija elektronikai, motoram un baterijai',
    ],
    inspectionPassed: true,
  },
  {
    id: 'bike_preowned_specialized',
    name: 'Specialized Sirrus X 3.0 (Darbnīcā pārbaudīts un pārlasīts)',
    category: 'Pre-Owned Certified',
    priceEur: 460,
    originalPriceEur: 780,
    image: '/src/assets/images/hero_bicycle_workshop_1794340029993.jpg',
    frameMaterial: 'Specialized A1 Premium alumīnijs, iekšējās troses',
    groupset: 'MicroSHIFT Advent 1x9 ar sajūgu (uzlikta pilnīgi jauna ķēde un kasete)',
    brakes: 'Tektro HD-R280 hidrauliskās disku bremzes',
    sizesAvailable: ['L (56cm) – pieejams 1 eksemplārs'],
    inStockCount: 1,
    guaranteeMonths: 12,
    condition: 'Certified Refurbished',
    specs: {
      weightKg: 10.6,
      wheelSize: '700x42c Pathfinder Sport riepas',
      gears: 9,
      color: 'Kaujas pelēks (Battleship Grey)',
    },
    features: [
      'VentVelo darbnīcā veikts 100% kapitālais remonts un pilnīga pārjaukšana',
      'Jauns monobloks, svaigi atgaisota bremžu eļļa, jaunas troses un apvalki',
      'Ietver oficiālu 12 mēnešu VentVelo lietotā velosipēda garantiju',
      'Uzreiz gatavs braukšanai vai piegādei ar mūsu servisa busiņu Kurzemē',
    ],
    inspectionPassed: true,
  },
];

export const ACCESSORY_INVENTORY: AccessoryProduct[] = [
  {
    id: 'acc_mucoff_kit',
    name: 'Muc-Off Drivetrain Degreaser un C3 Ceramic Dry Lube 120ml komplekts',
    category: 'Maintenance & Lubes',
    priceEur: 24.50,
    image: '/src/assets/images/accessories_gear_collection_1794340031799.jpg',
    sku: 'MUC-C3-DRY-120',
    stockCount: 16,
    lowStockThreshold: 5,
    brand: 'Muc-Off (Lielbritānija)',
    description: 'Profesionāls ķēdes tīrītājs un keramiskā sausā eļļa. Neatgrūž putekļus un smiltis, kas ir īpaši svarīgi Ventspils piejūras reģionā, pasargā no sāls korozijas.',
    compatibility: 'Piemērots visām 8, 9, 10, 11 un 12 ātrumu ķēdēm, kā arī e-velosipēdiem',
    rating: 4.9,
    reviewsCount: 42,
  },
  {
    id: 'acc_lezyne_pump',
    name: 'Lezyne CNC Pocket Drive augsta spiediena rokas pumpis',
    category: 'Pumps & Tools',
    priceEur: 32.00,
    image: '/src/assets/images/accessories_gear_collection_1794340031799.jpg',
    sku: 'LEZ-PKT-DRV-HP',
    stockCount: 9,
    lowStockThreshold: 4,
    brand: 'Lezyne',
    description: 'Kompakts CNC virpots alumīnija kabatas pumpis. Spēj sasniegt līdz 160 PSI / 11 BAR spiedienu. Elastīgā šļauciņa der gan Presta (sporta), gan auto ventiļiem.',
    compatibility: 'Piemērots Presta un Schrader (auto) ventiļiem',
    rating: 4.8,
    reviewsCount: 28,
  },
  {
    id: 'acc_cygolite_light',
    name: 'Cygolite Metro Pro 1100 lūmenu jaudīgs USB priekšējais lukturis',
    category: 'Lights & Electronics',
    priceEur: 69.00,
    image: '/src/assets/images/accessories_gear_collection_1794340031799.jpg',
    sku: 'CYG-MET-1100',
    stockCount: 4,
    lowStockThreshold: 5,
    brand: 'Cygolite',
    description: '1100 lūmenu spēcīgs gaismas stars, kas teicami izgaismo tumšos Kurzemes ceļus un meža takas. IP67 ūdensizturīgs ar dienas zibšņu režīmu maksimālai drošībai.',
    compatibility: 'Ātrās fiksācijas stiprinājums der stūrēm no 22mm līdz 35mm',
    rating: 4.9,
    reviewsCount: 19,
  },
  {
    id: 'acc_abus_lock',
    name: 'Abus Bordo 6000K/90 salokāmā augstas drošības slēdzene (Līmenis 10)',
    category: 'Locks & Security',
    priceEur: 98.00,
    image: '/src/assets/images/accessories_gear_collection_1794340031799.jpg',
    sku: 'ABUS-BRD-6000K',
    stockCount: 8,
    lowStockThreshold: 3,
    brand: 'Abus (Vācija)',
    description: '5mm biezs rūdītais tērauds ar speciālām kniedēm pret zāģēšanu. Abus XPlus precīzais cilindrs nodrošina aizsardzību pret atmūķēšanu.',
    compatibility: 'Kompakti stiprinās pie rāmja pudeles turētāja vietā',
    rating: 5.0,
    reviewsCount: 35,
  },
  {
    id: 'acc_velo_helmet',
    name: 'VentVelo Aero MIPS ceļa un pilsētas aizsargķivere',
    category: 'Helmets & Apparel',
    priceEur: 85.00,
    image: '/src/assets/images/accessories_gear_collection_1794340031799.jpg',
    sku: 'VELO-HLM-MIPS',
    stockCount: 3,
    lowStockThreshold: 4,
    brand: 'VentVelo Official',
    description: 'Aprīkota ar MIPS rotācijas trieciena slāpēšanas sistēmu. 18 vēdināšanas atveres, viegla konstrukcija un precīzs sprādzes regulēšanas ritenītis pakausī.',
    compatibility: 'Izmēri: S (51-55cm), M (55-59cm), L (59-63cm)',
    rating: 4.9,
    reviewsCount: 14,
  },
  {
    id: 'acc_conti_tire',
    name: 'Continental Terra Speed ProTection grants riepa 700x40c',
    category: 'Tires & Tubes',
    priceEur: 48.00,
    image: '/src/assets/images/accessories_gear_collection_1794340031799.jpg',
    sku: 'CONTI-TRRA-40C',
    stockCount: 14,
    lowStockThreshold: 4,
    brand: 'Continental (Vācija)',
    description: 'Izgatavota Vācijā no BlackChili gumijas maisījuma. Zems rites pretestības centrs un drošas sānu pumpas ātram braucienam pa Usmas un Talsu grants ceļiem.',
    compatibility: '700c / 28" aplokiem, Tubeless Ready (gatava bezkamerām)',
    rating: 4.8,
    reviewsCount: 52,
  },
  {
    id: 'acc_schwalbe_tube',
    name: 'Schwalbe Extra Light Presta velokamera 28" (700x28-42c)',
    category: 'Tires & Tubes',
    priceEur: 7.50,
    image: '/src/assets/images/accessories_gear_collection_1794340031799.jpg',
    sku: 'SCHW-TUBE-28',
    stockCount: 38,
    lowStockThreshold: 10,
    brand: 'Schwalbe',
    description: 'Augstas kvalitātes butila gumijas kamera. Rūpnīcā pārbaudīta 24 stundu spiediena testā. 40mm vītņots sporta (Presta) ventilis ar izskrūvējamu serdi.',
    compatibility: 'Riepu platumam no 28mm līdz 42mm',
    rating: 4.7,
    reviewsCount: 89,
  },
  {
    id: 'acc_multitool_titanium',
    name: 'VentVelo Workshop Pro titāna 18-in-1 salokāmais instruments',
    category: 'Pumps & Tools',
    priceEur: 38.00,
    image: '/src/assets/images/accessories_gear_collection_1794340031799.jpg',
    sku: 'VV-TOOL-18TI',
    stockCount: 11,
    lowStockThreshold: 4,
    brand: 'VentVelo Official',
    description: 'Kalta titāna un hroma-vanādija tērauda korpuss. Seškantes no 2 līdz 8mm, T25 torx, ķēdes spiede, spieķu atslēgas un bremžu kluču atspiedējs.',
    compatibility: 'Universāls palīgs ikvienā velobraucienā un treniņā',
    rating: 4.9,
    reviewsCount: 22,
  },
];

export const INITIAL_USER_GARAGE_BIKES: UserBike[] = [
  {
    id: 'bike_user_1',
    brand: 'Trek',
    model: 'FX 3 Disc',
    year: 2023,
    serialNumber: 'WTU28194481M',
    type: 'Pilsētas un tūrisma velosipēds',
    purchaseDate: '2023-05-14',
    lastServiceDate: '2026-04-12',
    activeGuaranteeMonths: 6,
    notes: 'Uzliktas Continental 4-Season riepas, apkope veikta Lielā prospekta darbnīcā.',
  },
  {
    id: 'bike_user_2',
    brand: 'Canyon',
    model: 'Grizl 7 1by',
    year: 2024,
    serialNumber: 'CYN-GZ-89104',
    type: 'Grants (Gravel) piedzīvojumu velosipēds',
    purchaseDate: '2024-03-20',
    lastServiceDate: '2026-09-02',
    activeGuaranteeMonths: 12,
    notes: 'Uzstādītas bezkameru riepas ar svaigu hermētiķi, pārbaudīta Shimano GRX transmisija.',
  },
];

export const INITIAL_MAINTENANCE_JOBS: MaintenanceJob[] = [
  {
    id: 'job_sample_1',
    trackingCode: 'VV-8492-LV',
    customerName: 'Līna Damberga',
    customerPhone: '+371 29112233',
    customerEmail: 'lina.damberga@vatp.lv',
    bikeModel: 'Trek FX 3 Disc (Dark Aquatic tonējums)',
    bikeSerial: 'WTU28194481M',
    servicePackage: SERVICE_PACKAGES[1],
    customRepairs: [CUSTOM_REPAIR_ITEMS[0]],
    deliveryType: 'van_pickup',
    pickupLocation: {
      region: 'Ventspils',
      address: 'Inženieru iela 101, Ventspils Augsto tehnoloģiju parks (VATP)',
      city: 'Ventspils',
      postalCode: 'LV-3601',
      preferredDate: '2026-11-12',
      preferredTimeSlot: '10:00 – 12:00',
      notes: 'Lūdzu piezvaniet pie galvenās ieejas barjeras. Busiņš pieteikts pieņemšanai.',
      feeEur: 8,
    },
    status: 'in_progress',
    statusHistory: [
      {
        status: 'booked',
        timestamp: '2026-11-10 09:15',
        note: 'Pieteikums saņemts VentVelo sistēmā. Servisa busiņa izbraukums ieplānots grafikā.',
      },
      {
        status: 'van_en_route',
        timestamp: '2026-11-10 10:30',
        note: 'VentVelo servisa busiņš savāca velosipēdu no VATP Ventspilī un droši nogādāja Rindas ielas 44 darbnīcā.',
      },
      {
        status: 'diagnostics',
        timestamp: '2026-11-10 11:15',
        note: 'Pabeigta 18 punktu diagnostika: aizmugurējā pārslēdzēja auss nedaudz šķība (+1.5mm), aizmugurējam ratam 2mm metiens. Plānota piedziņas mazgāšana.',
      },
      {
        status: 'in_progress',
        timestamp: '2026-11-10 11:45',
        note: 'Ķēde un kasete ievietota ultraskaņas ķīmiskajā vannā. Meistars veic ratu spieķošanu un taisnošanu uz Park Tool statīva.',
      },
    ],
    totalPriceEur: 59 + 15 + 8,
    paid: true,
    paymentMethod: 'Swedbank BankLink (256-bitu SSL šifrēts)',
    currencyUsed: 'EUR',
    guaranteeExpiresAt: '2027-05-10',
    mechanicName: 'Jānis Bērziņš (Galvenais meistars, VentVelo)',
    createdAt: '2026-11-10 09:15',
  },
];

export const INITIAL_ORDERS: OrderRecord[] = [
  {
    id: 'ord_1082',
    orderNumber: 'VV-ORD-1082',
    createdAt: '2026-11-05 14:20',
    items: [
      {
        id: 'ci_1',
        type: 'accessory',
        productId: 'acc_mucoff_kit',
        name: 'Muc-Off Drivetrain Degreaser un C3 Ceramic Dry Lube 120ml komplekts',
        priceEur: 24.50,
        quantity: 1,
      },
      {
        id: 'ci_2',
        type: 'accessory',
        productId: 'acc_lezyne_pump',
        name: 'Lezyne CNC Pocket Drive augsta spiediena rokas pumpis',
        priceEur: 32.00,
        quantity: 1,
      },
    ],
    subtotalEur: 56.50,
    shippingEur: 0,
    totalEur: 56.50,
    currency: 'EUR',
    customer: {
      name: 'Līna Damberga',
      email: 'lina.damberga@vatp.lv',
      phone: '+371 29112233',
      address: 'Inženieru iela 101',
      city: 'Ventspils',
      region: 'Ventspils',
    },
    deliveryMethod: 'van_delivery',
    paymentStatus: 'paid',
    paymentMethod: 'Bankas karte (Visa beidzas ar 4129)',
    trackingCode: 'VV-TRK-7712',
    guaranteeCertificates: [],
  },
];

export const INITIAL_NOTIFICATIONS: EmailNotification[] = [
  {
    id: 'em_1',
    recipientEmail: 'lina.damberga@vatp.lv',
    recipientName: 'Līna Damberga',
    subject: 'Serviss apstiprināts: Izbraukuma buss Ventspilī [VV-8492-LV]',
    previewText: 'Jūsu velosipēda apkope ir pieteikta. VentVelo servisa busiņš savāks velosipēdu norādītajā laikā.',
    category: 'service_booking',
    timestamp: '2026-11-10 09:16',
    referenceId: 'VV-8492-LV',
    read: false,
    htmlContent: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; color: #1c1917; line-height: 1.6;">
        <div style="background-color: #1c1917; padding: 24px; color: #ffffff; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0; font-size: 20px; font-weight: 700; letter-spacing: -0.5px;">VentVelo velosipēdu darbnīca un servisa buss</h2>
          <p style="margin: 4px 0 0; font-size: 13px; color: #a8a29e;">Rindas iela 44, Ventspils (Pārventa)</p>
        </div>
        <div style="padding: 24px; border: 1px solid #e7e5e4; border-top: none; border-radius: 0 0 8px 8px; background: #ffffff;">
          <h3 style="margin-top: 0; color: #0c0a09;">Labdien, Līna! Jūsu servisa pieteikums ir pieņemts.</h3>
          <p>Paldies, ka izvēlējāties VentVelo. Mūsu servisa busiņš ieradīsies pakaļ velosipēdam <strong>Trek FX 3 Disc</strong>, lai veiktu pilnvērtīgu tehnisko apkopi.</p>
          
          <div style="background: #fafaf9; border-radius: 6px; padding: 16px; margin: 20px 0; border: 1px solid #e7e5e4;">
            <p style="margin: 0 0 8px; font-size: 12px; font-weight: 700; color: #44403c; text-transform: uppercase;">PIETEIKUMA KOPSAVILKUMS</p>
            <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #292524;">
              <li><strong>Izsekošanas numurs:</strong> VV-8492-LV</li>
              <li><strong>Izvēlētā apkope:</strong> Standarta pilnā apkope (€59)</li>
              <li><strong>Papildu darbi:</strong> Rata centrēšana un taisnošana (€15)</li>
              <li><strong>Savākšanas vieta:</strong> Inženieru iela 101, Ventspils (VATP)</li>
              <li><strong>Busiņa laiks:</strong> 10:00 – 12:00</li>
              <li><strong>Garantija:</strong> 6 mēnešu oficiālā VentVelo darbnīcas garantija visiem darbiem</li>
            </ul>
          </div>
          <p style="font-size: 14px;">Jūs jebkurā brīdī varat sekot līdzi meistara darba gaitai savā tiešsaistes VentVelo Garāžas profilā ar kodu <strong>VV-8492-LV</strong>.</p>
          <p style="font-size: 13px; color: #78716c; margin-top: 24px;">Jautājumu gadījumā zvaniet meistaram tieši uz darbnīcu: +371 27583888 vai atbildiet uz šo e-pastu.</p>
        </div>
      </div>
    `,
  },
  {
    id: 'em_2',
    recipientEmail: 'lina.damberga@vatp.lv',
    recipientName: 'Līna Damberga',
    subject: 'Remonta statuss: Notiek darbi pie Trek FX 3 Disc [VV-8492-LV]',
    previewText: 'Diagnostika pabeigta. Meistars Jānis sācis piedziņas ultraskaņas mazgāšanu un ratu taisnošanu.',
    category: 'status_update',
    timestamp: '2026-11-10 11:45',
    referenceId: 'VV-8492-LV',
    read: false,
    htmlContent: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; color: #1c1917; line-height: 1.6;">
        <div style="background-color: #1c1917; padding: 24px; color: #ffffff; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0; font-size: 20px; font-weight: 700;">VentVelo darbnīcas progresa ziņojums</h2>
          <p style="margin: 4px 0 0; font-size: 13px; color: #a8a29e;">Pasūtījuma kods: VV-8492-LV</p>
        </div>
        <div style="padding: 24px; border: 1px solid #e7e5e4; border-top: none; border-radius: 0 0 8px 8px; background: #ffffff;">
          <h3 style="margin-top: 0; color: #0c0a09;">Pašreizējais statuss: Notiek remonta darbi darbnīcā</h3>
          <p>Sveiki, Līna! Meistars <strong>Jānis Bērziņš</strong> ir uzlicis velosipēdu uz darba statīva mūsu Rindas ielas 44 darbnīcā.</p>
          
          <div style="border-left: 3px solid #f59e0b; padding-left: 12px; margin: 16px 0; background: #fffbeb; padding: 12px;">
            <p style="margin: 0; font-size: 14px; color: #292524;">
              <strong>Meistara piezīme:</strong> Pārslēdzēja auss ar lāzera mērinstrumentu ir iztaisnota atpakaļ līdz 0.1mm precizitātei. Aizmugurējam aplokam izņemts 2mm metiens un noregulēts vienmērīgs spieķu nospriegojums. Piedziņa attīrīta no smiltīm ultraskaņas vannā.
            </p>
          </div>
          <p style="font-size: 14px;">Nākamais solis: Testa brauciens un gala drošības pārbaude pirms nodošanas atpakaļ servisa busiņam.</p>
        </div>
      </div>
    `,
  },
];
