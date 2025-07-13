export const COMPONENTS = [
  { key: 'cpu',         label: 'CPU',          slug: 'processors'      },
  { key: 'cooler',      label: 'Cooling',   slug:  ['air-cooler', 'liquid-cooler'],},
  { key: 'fans', label: 'System Fans',  slug: 'case-fan'    },
  { key: 'motherboard', label: 'Motherboard',  slug: ['amd-motherboards', 'intel-motherboards'],tabNames: ['AMD', 'Intel'],    },
  { key: 'memory',      label: 'Memory',       slug: 'memory',attrType:  'memory-type',attrCap:   'memory-size',multi:     false,           },
  { key: 'storage',     label: 'Storage',      slug: ['ssd', 'desktop-hard-drives'],tabNames: ['SSD', 'HDD'],multi: true,     },
  { key: 'bootdrive',         label: 'Operating System Drive',   slug: 'ssd',multi: false  },
  { key: 'gpu',         label: 'Graphics Card',   slug: 'graphics-cards'  },
  { key: 'case',        label: 'Casing',         slug: 'computer-casings'           },
  { key: 'psu',         label: 'Power Supply', slug: 'power-supply'  },
];
