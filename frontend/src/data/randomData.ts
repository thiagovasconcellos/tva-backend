export const CUSTOMER_NAMES = [
  'Alice Johnson',    'Bob Smith',        'Carol Williams',   'David Brown',
  'Emma Davis',       'Frank Miller',     'Grace Wilson',     'Henry Moore',
  'Isabella Taylor',  'Jack Anderson',    'Karen Thomas',     'Liam Jackson',
  'Mia White',        'Noah Harris',      'Olivia Martin',    'Paul Thompson',
  'Quinn Garcia',     'Rachel Martinez',  'Sam Robinson',     'Tina Clark',
  'Uma Lewis',        'Victor Lee',       'Wendy Walker',     'Xavier Hall',
  'Yara Allen',       'Zoe Young',        'Aaron King',       'Bella Wright',
  'Carlos Scott',     'Diana Green',      'Ethan Adams',      'Fiona Baker',
  'George Carter',    'Hannah Evans',     'Ivan Foster',      'Julia Hughes',
  'Kevin Price',      'Laura Reed',       'Marcus Turner',    'Nina Ward',
  'Oscar Phillips',   'Petra Collins',    'Quentin Bell',     'Rosa Cook',
  'Sebastian Morris', 'Tamara Rogers',    'Ulises Cox',       'Valentina Morgan',
  'William Perry',    'Xiomara Powell',   'Yasmine Long',     'Zachary Patterson',
]

export interface ProductTemplate {
  name: string
  minPrice: number
  maxPrice: number
}

export const PRODUCTS: ProductTemplate[] = [
  { name: 'Mechanical Keyboard',        minPrice: 79,  maxPrice: 299  },
  { name: 'Wireless Mouse',             minPrice: 25,  maxPrice: 120  },
  { name: 'USB-C Hub',                  minPrice: 35,  maxPrice: 89   },
  { name: '4K Monitor 27"',             minPrice: 399, maxPrice: 1200 },
  { name: 'Webcam HD 1080p',            minPrice: 49,  maxPrice: 199  },
  { name: 'Noise Cancelling Headphones',minPrice: 99,  maxPrice: 450  },
  { name: 'Laptop Stand',               minPrice: 29,  maxPrice: 89   },
  { name: 'External SSD 1TB',           minPrice: 89,  maxPrice: 199  },
  { name: 'Desk Lamp LED',              minPrice: 25,  maxPrice: 79   },
  { name: 'Cable Management Kit',       minPrice: 12,  maxPrice: 35   },
  { name: 'Wireless Charger Pad',       minPrice: 15,  maxPrice: 59   },
  { name: 'Smart Speaker',             minPrice: 49,  maxPrice: 199  },
  { name: 'Ergonomic Chair',            minPrice: 299, maxPrice: 1200 },
  { name: 'Standing Desk Converter',    minPrice: 99,  maxPrice: 399  },
  { name: 'Blue Light Glasses',         minPrice: 25,  maxPrice: 89   },
  { name: 'USB Microphone',             minPrice: 59,  maxPrice: 299  },
  { name: 'Drawing Tablet',             minPrice: 79,  maxPrice: 399  },
  { name: 'Raspberry Pi 5',             minPrice: 60,  maxPrice: 80   },
  { name: 'Arduino Starter Kit',        minPrice: 35,  maxPrice: 79   },
  { name: 'Wi-Fi 6 Router',             minPrice: 79,  maxPrice: 299  },
  { name: 'NVMe SSD 2TB',              minPrice: 149, maxPrice: 399  },
  { name: 'Gaming Headset',             minPrice: 49,  maxPrice: 199  },
  { name: 'HDMI 2.1 Cable',            minPrice: 12,  maxPrice: 35   },
  { name: 'Thunderbolt 4 Dock',         minPrice: 149, maxPrice: 399  },
  { name: 'Stream Deck Mini',           minPrice: 79,  maxPrice: 99   },
  { name: 'Capture Card 4K',           minPrice: 99,  maxPrice: 249  },
  { name: 'Desk Mat XL',               minPrice: 19,  maxPrice: 59   },
  { name: 'Monitor Light Bar',          minPrice: 35,  maxPrice: 89   },
  { name: 'Portable SSD 500GB',         minPrice: 59,  maxPrice: 129  },
  { name: 'USB-C Power Bank 20000mAh', minPrice: 39,  maxPrice: 99   },
]

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomPrice(min: number, max: number): number {
  const raw = min + Math.random() * (max - min)
  // snap to a price that ends in .00, .49, .90, .95, or .99
  const endings = [0, 0.49, 0.9, 0.95, 0.99]
  const base = Math.floor(raw)
  return parseFloat((base + pickRandom(endings)).toFixed(2))
}

export interface GeneratedOrderItem {
  productName: string
  quantity: number
  unitPrice: number
}

export interface GeneratedOrder {
  customerName: string
  items: GeneratedOrderItem[]
  estimatedTotal: number
}

export function generateRandomOrders(count: number): GeneratedOrder[] {
  const usedNames = new Set<string>()

  return Array.from({ length: count }, () => {
    // Avoid duplicate customer names in the same batch when possible
    let customerName = pickRandom(CUSTOMER_NAMES)
    let attempts = 0
    while (usedNames.has(customerName) && attempts < 10) {
      customerName = pickRandom(CUSTOMER_NAMES)
      attempts++
    }
    usedNames.add(customerName)

    const itemCount = randomInt(1, 5)
    const usedProducts = new Set<string>()

    const items: GeneratedOrderItem[] = Array.from({ length: itemCount }, () => {
      let product = pickRandom(PRODUCTS)
      let pAttempts = 0
      while (usedProducts.has(product.name) && pAttempts < 10) {
        product = pickRandom(PRODUCTS)
        pAttempts++
      }
      usedProducts.add(product.name)

      return {
        productName: product.name,
        quantity: randomInt(1, 5),
        unitPrice: randomPrice(product.minPrice, product.maxPrice),
      }
    })

    const estimatedTotal = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0)

    return { customerName, items, estimatedTotal }
  })
}
