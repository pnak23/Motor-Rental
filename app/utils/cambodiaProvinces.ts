/**
 * The province/city name printed at the top of a Cambodian license plate.
 * 25 provincial-level divisions (1 capital + 24 provinces) plus the
 * national "កម្ពុជា" (Cambodia) plate used for government/diplomatic and
 * other nationwide-registered vehicles.
 */
export interface CambodiaPlateRegion {
  km: string
  en: string
}

export const CAMBODIA_PLATE_REGIONS: CambodiaPlateRegion[] = [
  { km: 'ភ្នំពេញ', en: 'Phnom Penh' },
  { km: 'បន្ទាយមានជ័យ', en: 'Banteay Meanchey' },
  { km: 'បាត់ដំបង', en: 'Battambang' },
  { km: 'កំពង់ចាម', en: 'Kampong Cham' },
  { km: 'កំពង់ឆ្នាំង', en: 'Kampong Chhnang' },
  { km: 'កំពង់ស្ពឺ', en: 'Kampong Speu' },
  { km: 'កំពង់ធំ', en: 'Kampong Thom' },
  { km: 'កំពត', en: 'Kampot' },
  { km: 'កណ្ដាល', en: 'Kandal' },
  { km: 'កែប', en: 'Kep' },
  { km: 'កោះកុង', en: 'Koh Kong' },
  { km: 'ក្រចេះ', en: 'Kratié' },
  { km: 'មណ្ឌលគិរី', en: 'Mondulkiri' },
  { km: 'ឧត្តរមានជ័យ', en: 'Oddar Meanchey' },
  { km: 'ប៉ៃលិន', en: 'Pailin' },
  { km: 'ព្រះសីហនុ', en: 'Preah Sihanouk' },
  { km: 'ព្រះវិហារ', en: 'Preah Vihear' },
  { km: 'ព្រៃវែង', en: 'Prey Veng' },
  { km: 'ពោធិ៍សាត់', en: 'Pursat' },
  { km: 'រតនគិរី', en: 'Ratanakiri' },
  { km: 'សៀមរាប', en: 'Siem Reap' },
  { km: 'ស្ទឹងត្រែង', en: 'Stung Treng' },
  { km: 'ស្វាយរៀង', en: 'Svay Rieng' },
  { km: 'តាកែវ', en: 'Takéo' },
  { km: 'ត្បូងឃ្មុំ', en: 'Tbong Khmum' }
]

/** National plate (government, diplomatic corps, and other vehicles
 *  registered under the country rather than a specific province). */
export const CAMBODIA_NATIONAL_PLATE_REGION: CambodiaPlateRegion = { km: 'កម្ពុជា', en: 'Cambodia (national)' }

export const ALL_PLATE_REGIONS: CambodiaPlateRegion[] = [...CAMBODIA_PLATE_REGIONS, CAMBODIA_NATIONAL_PLATE_REGION]

/** Combines the plate's province/region with its code for display,
 *  e.g. formatPlate('ភ្នំពេញ', '1AC-2345') -> "ភ្នំពេញ 1AC-2345". */
export function formatPlate(province: string | null | undefined, code: string | null | undefined): string {
  return [province, code].filter(Boolean).join(' ')
}
