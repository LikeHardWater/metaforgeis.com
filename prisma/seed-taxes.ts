import { config } from 'dotenv'
config({ path: '.env.local' })

import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

// taxesServices: true = installation/repair services are taxable in this state
// Based on how states treat separately-stated installation charges for industrial equipment
const STATE_TAXES = [
  { stateCode: 'AL', stateName: 'Alabama',          taxRate: 4.0000, taxesServices: true  },
  { stateCode: 'AK', stateName: 'Alaska',           taxRate: 0.0000, taxesServices: false }, // no state sales tax
  { stateCode: 'AZ', stateName: 'Arizona',          taxRate: 5.6000, taxesServices: false }, // installation exempt when separately stated
  { stateCode: 'AR', stateName: 'Arkansas',         taxRate: 6.5000, taxesServices: true  },
  { stateCode: 'CA', stateName: 'California',       taxRate: 7.2500, taxesServices: false }, // installation labor exempt when separately stated
  { stateCode: 'CO', stateName: 'Colorado',         taxRate: 2.9000, taxesServices: false }, // installation exempt when separately stated
  { stateCode: 'CT', stateName: 'Connecticut',      taxRate: 6.3500, taxesServices: true  },
  { stateCode: 'DE', stateName: 'Delaware',         taxRate: 0.0000, taxesServices: false }, // no sales tax
  { stateCode: 'FL', stateName: 'Florida',          taxRate: 6.0000, taxesServices: true  },
  { stateCode: 'GA', stateName: 'Georgia',          taxRate: 4.0000, taxesServices: false }, // installation exempt when separately stated
  { stateCode: 'HI', stateName: 'Hawaii',           taxRate: 4.0000, taxesServices: true  }, // GET taxes virtually all services
  { stateCode: 'ID', stateName: 'Idaho',            taxRate: 6.0000, taxesServices: true  },
  { stateCode: 'IL', stateName: 'Illinois',         taxRate: 6.2500, taxesServices: false }, // installation exempt when separately stated
  { stateCode: 'IN', stateName: 'Indiana',          taxRate: 7.0000, taxesServices: false }, // installation exempt when separately stated
  { stateCode: 'IA', stateName: 'Iowa',             taxRate: 6.0000, taxesServices: true  },
  { stateCode: 'KS', stateName: 'Kansas',           taxRate: 6.5000, taxesServices: true  },
  { stateCode: 'KY', stateName: 'Kentucky',         taxRate: 6.0000, taxesServices: true  },
  { stateCode: 'LA', stateName: 'Louisiana',        taxRate: 4.4500, taxesServices: true  },
  { stateCode: 'ME', stateName: 'Maine',            taxRate: 5.5000, taxesServices: true  },
  { stateCode: 'MD', stateName: 'Maryland',         taxRate: 6.0000, taxesServices: true  },
  { stateCode: 'MA', stateName: 'Massachusetts',    taxRate: 6.2500, taxesServices: false }, // installation generally exempt
  { stateCode: 'MI', stateName: 'Michigan',         taxRate: 6.0000, taxesServices: false }, // installation generally exempt
  { stateCode: 'MN', stateName: 'Minnesota',        taxRate: 6.8750, taxesServices: true  },
  { stateCode: 'MS', stateName: 'Mississippi',      taxRate: 7.0000, taxesServices: true  }, // broad service tax
  { stateCode: 'MO', stateName: 'Missouri',         taxRate: 4.2250, taxesServices: true  },
  { stateCode: 'MT', stateName: 'Montana',          taxRate: 0.0000, taxesServices: false }, // no sales tax
  { stateCode: 'NE', stateName: 'Nebraska',         taxRate: 5.5000, taxesServices: true  },
  { stateCode: 'NV', stateName: 'Nevada',           taxRate: 6.8500, taxesServices: false }, // installation generally exempt
  { stateCode: 'NH', stateName: 'New Hampshire',    taxRate: 0.0000, taxesServices: false }, // no sales tax
  { stateCode: 'NJ', stateName: 'New Jersey',       taxRate: 6.6250, taxesServices: false }, // installation exempt when separately stated
  { stateCode: 'NM', stateName: 'New Mexico',       taxRate: 5.1250, taxesServices: true  }, // GRT taxes virtually all services
  { stateCode: 'NY', stateName: 'New York',         taxRate: 4.0000, taxesServices: true  },
  { stateCode: 'NC', stateName: 'North Carolina',   taxRate: 4.7500, taxesServices: true  },
  { stateCode: 'ND', stateName: 'North Dakota',     taxRate: 5.0000, taxesServices: true  },
  { stateCode: 'OH', stateName: 'Ohio',             taxRate: 5.7500, taxesServices: true  },
  { stateCode: 'OK', stateName: 'Oklahoma',         taxRate: 4.5000, taxesServices: true  },
  { stateCode: 'OR', stateName: 'Oregon',           taxRate: 0.0000, taxesServices: false }, // no sales tax
  { stateCode: 'PA', stateName: 'Pennsylvania',     taxRate: 6.0000, taxesServices: true  },
  { stateCode: 'RI', stateName: 'Rhode Island',     taxRate: 7.0000, taxesServices: true  },
  { stateCode: 'SC', stateName: 'South Carolina',   taxRate: 6.0000, taxesServices: true  },
  { stateCode: 'SD', stateName: 'South Dakota',     taxRate: 4.2000, taxesServices: true  }, // broad service tax
  { stateCode: 'TN', stateName: 'Tennessee',        taxRate: 7.0000, taxesServices: true  },
  { stateCode: 'TX', stateName: 'Texas',            taxRate: 6.2500, taxesServices: true  },
  { stateCode: 'UT', stateName: 'Utah',             taxRate: 4.8500, taxesServices: true  },
  { stateCode: 'VT', stateName: 'Vermont',          taxRate: 6.0000, taxesServices: true  },
  { stateCode: 'VA', stateName: 'Virginia',         taxRate: 5.3000, taxesServices: false }, // installation exempt when separately stated
  { stateCode: 'WA', stateName: 'Washington',       taxRate: 6.5000, taxesServices: true  }, // broad service tax
  { stateCode: 'WV', stateName: 'West Virginia',    taxRate: 6.0000, taxesServices: true  }, // broad service tax
  { stateCode: 'WI', stateName: 'Wisconsin',        taxRate: 5.0000, taxesServices: true  },
  { stateCode: 'WY', stateName: 'Wyoming',          taxRate: 4.0000, taxesServices: true  },
  { stateCode: 'DC', stateName: 'Washington D.C.',  taxRate: 6.0000, taxesServices: true  },
]

async function main() {
  console.log('Seeding state tax rates...')
  for (const rate of STATE_TAXES) {
    await prisma.stateTaxRate.upsert({
      where: { stateCode: rate.stateCode },
      update: { taxRate: rate.taxRate, taxesServices: rate.taxesServices },
      create: rate,
    })
  }
  console.log(`Seeded ${STATE_TAXES.length} state tax rates.`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
