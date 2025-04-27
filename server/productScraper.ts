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
  "Sam's Club"
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
  
  // Generate a consistent but random-looking price range for the product
  const basePrice = getBasePrice(searchQuery);
  
  // Create a listing for each store with slight price variations
  STORES.forEach((store, index) => {
    // Simulate some stores being out of stock
    const isAvailable = Math.random() > 0.2;
    
    // Create price variation between stores
    // Use index to ensure consistent results on refresh
    const priceVariation = (index - 5) * 1000; // -5000 to +4000 cents variation
    const price = Math.max(1, basePrice + priceVariation);
    
    results.push({
      name: searchQuery,
      price,
      imageUrl: getImageUrl(searchQuery, store),
      productUrl: `https://example.com/${store.toLowerCase().replace(' ', '-')}/${encodeURIComponent(searchQuery)}`,
      store,
      isAvailable
    });
  });
  
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