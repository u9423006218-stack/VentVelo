import { BikeProduct } from '../types';
import { hydratePartnerBikes } from './partnerHydrate';
import { PARTNER_PART_1 } from './partnerCatalog1';
import { PARTNER_PART_2 } from './partnerCatalog2';
import { PARTNER_PART_3 } from './partnerCatalog3';
import { PARTNER_PART_4 } from './partnerCatalog4';

export const PARTNER_BIKES: BikeProduct[] = hydratePartnerBikes([
  ...PARTNER_PART_1,
  ...PARTNER_PART_2,
  ...PARTNER_PART_3,
  ...PARTNER_PART_4,
]);
