import { InsertProductListing } from "@shared/schema";
import { storage } from "./storage";

interface ScrapedProduct {
  name: string;
  price: number; // in cents
  imageUrl?: string;
  productUrl: string;
  store: string;
  isAvailable: boolean;
}

// Mock stores that we'll "scrape" from
const STORES = [
  "Amazon", 
  "Best Buy", 
  "Walmart", 
  "Target", 
  "GameStop", 
  "Microsoft Store",
  "Newegg",
  "B&H Photo",
  "Costco",
  "Sam's Club",
  "eBay",
  "Apple Store"
];

// Popular product templates to enhance search results
const PRODUCT_TEMPLATES = [
  {
    keywords: ["ps5", "playstation 5", "playstation5"],
    name: "PlayStation 5 Console",
    basePrice: 49999,
    variants: [
      { suffix: "Digital Edition", priceAdjust: -10000 },
      { suffix: "Disc Edition", priceAdjust: 0 },
      { suffix: "Slim", priceAdjust: -5000 },
      { suffix: "with Extra Controller", priceAdjust: 5000 },
      { suffix: "Bundle with 2 Games", priceAdjust: 10000 },
    ],
    imageUrl: "https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=800&auto=format&fit=crop&q=60"
  },
  {
    keywords: ["xbox", "series x", "xbox series"],
    name: "Xbox Series X Console",
    basePrice: 49999,
    variants: [
      { suffix: "Digital Edition", priceAdjust: -10000 },
      { suffix: "Standard Edition", priceAdjust: 0 },
      { suffix: "with Extra Controller", priceAdjust: 5000 },
      { suffix: "Game Pass Bundle", priceAdjust: 10000 },
      { suffix: "Halo Infinite Bundle", priceAdjust: 15000 },
    ],
    imageUrl: "https://images.unsplash.com/photo-1621259182288-4443f2367f00?w=800&auto=format&fit=crop&q=60"
  },
  {
    keywords: ["nintendo", "switch", "switch oled"],
    name: "Nintendo Switch",
    basePrice: 29999,
    variants: [
      { suffix: "Lite", priceAdjust: -10000 },
      { suffix: "OLED Model", priceAdjust: 5000 },
      { suffix: "Animal Crossing Edition", priceAdjust: 5000 },
      { suffix: "with Mario Kart 8", priceAdjust: 6000 },
      { suffix: "Sports Bundle", priceAdjust: 7000 },
    ],
    imageUrl: "https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=800&auto=format&fit=crop&q=60"
  },
  {
    keywords: ["ipad", "apple ipad", "tablet"],
    name: "Apple iPad",
    basePrice: 32999,
    variants: [
      { suffix: "Mini", priceAdjust: -5000 },
      { suffix: "Air", priceAdjust: 10000 },
      { suffix: "Pro 11-inch", priceAdjust: 30000 },
      { suffix: "Pro 12.9-inch", priceAdjust: 50000 },
      { suffix: "with Apple Pencil", priceAdjust: 12900 },
    ],
    imageUrl: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format&fit=crop&q=60"
  },
  {
    keywords: ["macbook", "mac", "laptop"],
    name: "Apple MacBook",
    basePrice: 99999,
    variants: [
      { suffix: "Air M1", priceAdjust: 0 },
      { suffix: "Air M2", priceAdjust: 20000 },
      { suffix: "Pro 13-inch", priceAdjust: 30000 },
      { suffix: "Pro 14-inch", priceAdjust: 50000 },
      { suffix: "Pro 16-inch", priceAdjust: 100000 },
    ],
    imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=60"
  },
  {
    keywords: ["airpods", "headphones", "earbuds"],
    name: "Apple AirPods",
    basePrice: 12999,
    variants: [
      { suffix: "2nd Generation", priceAdjust: 0 },
      { suffix: "3rd Generation", priceAdjust: 5000 },
      { suffix: "Pro", priceAdjust: 10000 },
      { suffix: "Pro 2nd Generation", priceAdjust: 15000 },
      { suffix: "Max", priceAdjust: 40000 },
    ],
    imageUrl: "https://images.unsplash.com/photo-1606741965574-a493eb7a7831?w=800&auto=format&fit=crop&q=60"
  }
];

// In a real application, this would actually perform web scraping
// or connect to an API to get real price data from various stores
export async function scrapeProductListings(
  searchQuery: string,
  itemId: number
): Promise<ScrapedProduct[]> {
  console.log(`Searching for product: ${searchQuery} (Item ID: ${itemId})`);
  
  // For demo purposes, we'll simulate finding results at different stores
  const results: ScrapedProduct[] = [];
  const normalizedQuery = searchQuery.toLowerCase().trim();
  
  // Check if we have a template that matches the search query
  let matchedTemplate = null;
  let matchedVariants: any[] = [];
  
  // Look for product templates that match the search query
  for (const template of PRODUCT_TEMPLATES) {
    if (template.keywords.some(keyword => normalizedQuery.includes(keyword))) {
      matchedTemplate = template;
      
      // Create variants based on the template
      matchedVariants = template.variants.map(variant => {
        return {
          name: `${template.name} ${variant.suffix}`,
          basePrice: template.basePrice + variant.priceAdjust,
          imageUrl: template.imageUrl
        };
      });
      
      // If we match an exact product (like "PlayStation 5"), add the base product too
      if (matchedVariants.length > 0) {
        matchedVariants.unshift({
          name: template.name,
          basePrice: template.basePrice,
          imageUrl: template.imageUrl
        });
      }
      
      break;
    }
  }
  
  // If we have matched templates, use them; otherwise fall back to generic search
  if (matchedTemplate && matchedVariants.length > 0) {
    // Generate results for each matched variant across stores
    for (const variant of matchedVariants) {
      // Not all stores carry all variants (simulate real-world availability)
      const storesCarryingVariant = STORES.filter(() => Math.random() > 0.3);
      
      storesCarryingVariant.forEach((store, index) => {
        // Create price variation between stores
        const priceVariation = (Math.floor(Math.random() * 10) - 5) * 500; // -2500 to +2000 cents variation
        const price = Math.max(1, variant.basePrice + priceVariation);
        
        // Simulate some products being out of stock
        const isAvailable = Math.random() > 0.2;
        
        results.push({
          name: variant.name,
          price,
          imageUrl: variant.imageUrl,
          productUrl: `https://example.com/${store.toLowerCase().replace(/\s+/g, '-')}/${encodeURIComponent(variant.name)}`,
          store,
          isAvailable
        });
      });
    }
  } else {
    // Generic search - fallback if no template matches
    // Generate a consistent but random-looking price range for the product
    const basePrice = getBasePrice(searchQuery);
    
    // Create a listing for each store with slight price variations
    STORES.forEach((store, index) => {
      // Simulate some stores being out of stock
      const isAvailable = Math.random() > 0.2;
      
      // Create price variation between stores
      const priceVariation = (index - 5) * 1000; // -5000 to +4000 cents variation
      const price = Math.max(1, basePrice + priceVariation);
      
      results.push({
        name: searchQuery,
        price,
        imageUrl: getImageUrl(searchQuery, store),
        productUrl: `https://example.com/${store.toLowerCase().replace(/\s+/g, '-')}/${encodeURIComponent(searchQuery)}`,
        store,
        isAvailable
      });
    });
  }
  
  // Sort by price (lowest first)
  results.sort((a, b) => a.price - b.price);
  
  return results;
}

// Save scraped products to the database
export async function savePriceHistory(
  scrapedProducts: ScrapedProduct[],
  itemId: number
): Promise<void> {
  // Get current date
  const now = new Date();
  
  // Filter for available products only
  const availableProducts = scrapedProducts.filter(product => product.isAvailable);
  
  // Save each product listing
  for (const product of availableProducts) {
    try {
      // Save as product listing
      await storage.createProductListing({
        itemId,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        productUrl: product.productUrl,
        store: product.store,
        isAvailable: product.isAvailable
      });
      
      // Also add to price history for the item (using lowest price)
      if (product === availableProducts[0]) {
        await storage.addPriceHistory({
          itemId,
          price: product.price,
          date: now
        });
        
        // Update the item's current price to match the lowest available price
        await storage.updateWishListItem(itemId, {
          currentPrice: product.price,
          store: product.store,
          productUrl: product.productUrl,
          imageUrl: product.imageUrl
        });
      }
    } catch (error) {
      console.error(`Error saving product listing for ${product.name} at ${product.store}:`, error);
    }
  }
}

// Helper function to get a base price based on the product name
function getBasePrice(productName: string): number {
  const normalized = productName.toLowerCase();
  
  // These are just approximations for the demo
  if (normalized.includes('xbox series x')) return 49999; // $499.99
  if (normalized.includes('xbox series s')) return 29999; // $299.99
  if (normalized.includes('playstation 5') || normalized.includes('ps5')) return 49999; // $499.99
  if (normalized.includes('nintendo switch')) return 29999; // $299.99
  if (normalized.includes('ipad')) return 32999; // $329.99
  if (normalized.includes('macbook')) return 99999; // $999.99
  if (normalized.includes('airpods')) return 12999; // $129.99
  
  // Default random price between $50 and $200
  return Math.floor(Math.random() * 15000) + 5000;
}

// Helper function to get an image URL based on the product name
function getImageUrl(productName: string, store: string): string {
  const normalized = productName.toLowerCase();
  
  // Use placeholder images based on category
  if (normalized.includes('xbox')) {
    return 'https://images.unsplash.com/photo-1621259182288-4443f2367f00?w=800&auto=format&fit=crop&q=60';
  }
  
  if (normalized.includes('playstation') || normalized.includes('ps5')) {
    return 'https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=800&auto=format&fit=crop&q=60';
  }
  
  if (normalized.includes('nintendo') || normalized.includes('switch')) {
    return 'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=800&auto=format&fit=crop&q=60';
  }
  
  if (normalized.includes('ipad')) {
    return 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format&fit=crop&q=60';
  }
  
  // Generic electronics image
  return 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=800&auto=format&fit=crop&q=60';
}