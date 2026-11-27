import { BikeCategory, BikeProduct } from '../types';

const BASE = import.meta.env.BASE_URL;

const CATS = ["PILSĒTAS VELOSIPĒDI","BĒRNU VELOSIPĒDI","KALNU VELOSIPĒDI (MTB)","HIBRĪDA UN TŪRISMA VELOSIPĒDI","GRAVEL VELOSIPĒDI","SALIEKAMIE VELOSIPĒDI","E-Velosipēdi","BMX VELOSIPĒDI"] as const;
const FRAME_SHORTS = ["Tērauds (Hi-Ten / Cr-Mo)","Alumīnijs","Oglekļa šķiedra (Carbon)"] as const;
const SUSPS = ["Cietā dakša (Rigid)","Priekšējais amortizators (Hardtail)"] as const;
const BRAKE_TYPES = ["V-veida un kājas bremze","Mehāniskās disku","Hidrauliskās disku","Šosejas / BMX bremzes"] as const;
const AVAILS = ["Piegāde 2–3 d.d.","Noliktavā Rindas 44"] as const;
const RIDERS: (BikeProduct['riderType'])[] = [undefined, 'Vīriešu', 'Sieviešu', 'Unisex'];

const BRAND_DEFAULT_DESC: Record<string, string> = {
  "S'COOL": "S'COOL - We go to great lengths to produce lightweight bikes that grow with the child and will easily last for several generations. The widest range of children's and youth bikes in the German-speaking region: from balance bikes to e-bikes (pedelecs). Careful processing. High quality and very durable. Engineered in Bielefeld (Germany).",
  "PUKY": "PUKY - BUILT WITH SAFETY IN MIND",
  "Raymon": "Vairāk nekā 100 gadu velosipēdu DNS. Mūsu ģimene simbolizē drosmi, pieredzi un vīziju - īpašības, kas saglabājas katrā Raymon velosipēdā. Pateicoties šīm tradīcijām, mēs radām velosipēdus, kas piedāvā tieši to, ko jūs meklējat uz ceļa un ārpus tā.",
  "Ecobike": "Ecobike is one of the first e-bike manufacturers in Europe. This means company has a many years of experience in electric bikes manufacturing and it can offer an ideal price vs quality ratio. World-class components assembled carefully with love for bicycles in Poland. All these advantages gained trust across the entire European continent."
};

const DEFAULT_FEATURES = [
  'Pasūti kastē pašmontāžai (€0, bez garantijas) vai par +€35 saņem pilnībā meistara saliktu ar garantiju',
  'Pieejams ar vecā velosipēda nodošanu kā pirmo iemaksu un Incredit nomaksu',
];

export type CompactBikeTuple = [
  string, // 0: mainId
  string, // 1: name
  string, // 2: brand
  number, // 3: catIdx
  number, // 4: priceEur
  string, // 5: imgRef ('j' = static bikes/{id}.jpg, or 'vv:pack:s:e')
  string, // 6: frameMaterial
  number, // 7: frameShortIdx
  number, // 8: suspIdx
  number, // 9: brakeTypeIdx
  string, // 10: groupset
  string, // 11: brakes
  string[], // 12: sizesAvailable
  number, // 13: inStockCount
  number, // 14: availIdx
  BikeProduct['specs'], // 15: specs
  [string, string][], // 16: specsList pairs
  string | null | undefined, // 17: year
  number, // 18: riderIdx
  string | null | undefined, // 19: sku
  string | null | undefined, // 20: customDesc (null/undefined -> brand default, '' -> none)
  string[], // 21: extraFeatures
];

export function hydratePartnerBikes(rows: CompactBikeTuple[]): BikeProduct[] {
  return rows.map((r) => {
    const mainId = r[0];
    const brand = r[2];
    const imgRef = r[5] === 'j' ? `${BASE}bikes/${mainId}.jpg` : r[5];
    const desc = r[20] == null ? BRAND_DEFAULT_DESC[brand] : (r[20] || undefined);

    return {
      id: `bike_vv_${mainId}`,
      name: r[1],
      brand,
      category: CATS[r[3]] as BikeCategory,
      priceEur: r[4],
      image: imgRef,
      frameMaterial: r[6],
      frameMaterialShort: FRAME_SHORTS[r[7]],
      suspension: SUSPS[r[8]],
      brakeType: BRAKE_TYPES[r[9]],
      groupset: r[10],
      brakes: r[11],
      sizesAvailable: r[12],
      inStockCount: r[13],
      availabilityStatus: AVAILS[r[14]],
      guaranteeMonths: 24,
      condition: 'Brand New',
      specs: r[15],
      specsList: r[16].map(([label, value]) => ({ label, value })),
      ...(r[17] ? { year: r[17] } : {}),
      ...(RIDERS[r[18]] ? { riderType: RIDERS[r[18]] } : {}),
      ...(r[19] ? { sku: r[19] } : {}),
      ...(desc ? { descriptionText: desc } : {}),
      features: [...r[21], ...DEFAULT_FEATURES],
      inspectionPassed: true,
    };
  });
}
