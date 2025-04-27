import { ScrapedProduct } from '../types/product';
import { ApiKeyService } from './apiKeyService';

/**
 * AffiliateService handles product search across multiple affiliate networks
 * and direct retailer APIs to provide comprehensive product listings.
 */
export class AffiliateService {
  private apiKeyService: ApiKeyService;
  private cacheExpiry = 3600000; // 1 hour in milliseconds
  private cache: Map<string, { data: ScrapedProduct[], timestamp: number }> = new Map();

  constructor() {
    // Get the API key service instance
    this.apiKeyService = ApiKeyService.getInstance();
  }

  /**
   * Search for products across multiple affiliate networks and retailers
   * @param query Search query
   * @returns Array of ScrapedProduct objects
   */
  async searchProducts(query: string): Promise<ScrapedProduct[]> {
    // Check cache first
    const cacheKey = `search:${query.toLowerCase()}`;
    const cachedResult = this.cache.get(cacheKey);
    
    if (cachedResult && Date.now() - cachedResult.timestamp < this.cacheExpiry) {
      console.log(`[AffiliateService] Cache hit for "${query}"`);
      return cachedResult.data;
    }
    
    console.log(`[AffiliateService] Searching for "${query}" across affiliate networks`);
    
    try {
      let allResults: ScrapedProduct[] = [];
      
      // In production, this would be a series of API calls to different networks
      // 1. First try affiliate networks (for commission)
      const rakutenResults = await this.searchRakutenProducts(query);
      if (rakutenResults.length > 0) {
        allResults = allResults.concat(rakutenResults);
      }
      
      // 2. Next try direct retailer APIs
      const amazonResults = await this.searchAmazonProducts(query);
      if (amazonResults.length > 0) {
        allResults = allResults.concat(amazonResults);
      }
      
      // 3. If we still don't have enough results, use the demo generator
      if (allResults.length < 5) {
        const demoResults = await this.searchDemoProducts(query);
        allResults = allResults.concat(demoResults);
      }
      
      // Remove duplicates (in a real implementation, we'd need a more sophisticated
      // deduplication strategy based on product identifiers)
      const uniqueStores = new Map<string, ScrapedProduct>();
      allResults.forEach(product => {
        const key = `${product.name}-${product.store}`;
        // Keep the lowest priced item if duplicates exist
        if (!uniqueStores.has(key) || product.price < uniqueStores.get(key)!.price) {
          uniqueStores.set(key, product);
        }
      });
      
      // Convert back to array and sort by price
      const results = Array.from(uniqueStores.values())
        .sort((a, b) => a.price - b.price);
      
      // Cache the results
      this.cache.set(cacheKey, {
        data: results,
        timestamp: Date.now()
      });
      
      return results;
    } catch (error) {
      console.error('[AffiliateService] Error searching products:', error);
      // Fall back to demo products in case of error
      return this.searchDemoProducts(query);
    }
  }

  /**
   * Search products from Rakuten/LinkShare API
   * This would be replaced with actual API implementation
   */
  private async searchRakutenProducts(query: string): Promise<ScrapedProduct[]> {
    // In production, this would make an API request to Rakuten
    const rakutenApiKey = this.apiKeyService.getApiKey('RAKUTEN_API_KEY');
    if (!rakutenApiKey) {
      return [];
    }
    
    try {
      // Implementation would look something like:
      /*
      const response = await axios.get('https://api.linksynergy.com/v1/products/search', {
        params: {
          keyword: query,
          apiKey: rakutenApiKey,
          max: 20,
        }
      });
      
      return response.data.products.map(product => ({
        name: product.productName,
        price: Math.round(parseFloat(product.price) * 100),
        imageUrl: product.imageUrl,
        productUrl: product.affiliateUrl,
        store: product.merchantName,
        isAvailable: product.inStock,
      }));
      */
      
      // For now, just return an empty array
      return [];
    } catch (error) {
      console.error('Error searching Rakuten products:', error);
      return [];
    }
  }

  /**
   * Search products from Amazon Product Advertising API
   * This would be replaced with actual API implementation
   */
  private async searchAmazonProducts(query: string): Promise<ScrapedProduct[]> {
    // In production, this would make an API request to Amazon
    const amazonApiKey = this.apiKeyService.getApiKey('AMAZON_API_KEY');
    if (!amazonApiKey) {
      return [];
    }
    
    try {
      // Implementation would look something like:
      /*
      const response = await axios.get('https://webservices.amazon.com/paapi5/searchitems', {
        params: {
          Keywords: query,
          PartnerTag: 'your-associate-tag',
          AccessKey: amazonApiKey,
          // Other required params...
        }
      });
      
      return response.data.Items.map(item => ({
        name: item.ItemInfo.Title.DisplayValue,
        price: Math.round(parseFloat(item.Offers.Listings[0].Price.Amount) * 100),
        imageUrl: item.Images.Primary.Large.URL,
        productUrl: item.DetailPageURL,
        store: 'Amazon',
        isAvailable: item.Offers.Listings[0].Availability === 'Available',
      }));
      */
      
      // For now, just return an empty array
      return [];
    } catch (error) {
      console.error('Error searching Amazon products:', error);
      return [];
    }
  }

  /**
   * Generate demo products for development purposes
   * This simulates what we would get from actual affiliate networks
   */
  private async searchDemoProducts(query: string): Promise<ScrapedProduct[]> {
    const normalizedQuery = query.toLowerCase().trim();
    const results: ScrapedProduct[] = [];
    
    // List of stores with their associated domains for URL generation
    const stores = [
      { name: 'Amazon', domain: 'amazon.com' },
      { name: 'Best Buy', domain: 'bestbuy.com' },
      { name: 'Walmart', domain: 'walmart.com' },
      { name: 'Target', domain: 'target.com' },
      { name: 'GameStop', domain: 'gamestop.com' },
      { name: 'Newegg', domain: 'newegg.com' },
      { name: 'B&H Photo', domain: 'bhphotovideo.com' },
      { name: 'Apple Store', domain: 'apple.com' },
      { name: 'Microsoft Store', domain: 'microsoft.com' },
      { name: 'eBay', domain: 'ebay.com' },
    ];
    
    // Determine product category and base price
    let basePrice = 0;
    let category = '';
    let productTitle = query;
    let imageUrl = '';
    
    // Set product data based on query
    if (normalizedQuery.includes('playstation') || normalizedQuery.includes('ps5')) {
      basePrice = 499.99;
      category = 'Gaming Consoles';
      productTitle = 'PlayStation 5 Console';
      imageUrl = 'https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=800&auto=format&fit=crop&q=60';
    } else if (normalizedQuery.includes('xbox')) {
      basePrice = 499.99;
      category = 'Gaming Consoles';
      productTitle = 'Xbox Series X Console';
      imageUrl = 'https://images.unsplash.com/photo-1621259182288-4443f2367f00?w=800&auto=format&fit=crop&q=60';
    } else if (normalizedQuery.includes('switch')) {
      basePrice = 299.99;
      category = 'Gaming Consoles';
      productTitle = 'Nintendo Switch';
      imageUrl = 'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=800&auto=format&fit=crop&q=60';
    } else if (normalizedQuery.includes('ipad')) {
      basePrice = 329.99;
      category = 'Tablets';
      productTitle = 'Apple iPad';
      imageUrl = 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format&fit=crop&q=60';
    } else if (normalizedQuery.includes('macbook')) {
      basePrice = 999.99;
      category = 'Laptops';
      productTitle = 'Apple MacBook Air';
      imageUrl = 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=60';
    } else if (normalizedQuery.includes('airpods')) {
      basePrice = 129.99;
      category = 'Headphones';
      productTitle = 'Apple AirPods';
      imageUrl = 'https://images.unsplash.com/photo-1606741965574-a493eb7a7831?w=800&auto=format&fit=crop&q=60';
    } else {
      // Generic product
      basePrice = Math.floor(Math.random() * 200) + 50; // Between $50 and $250
      category = 'Electronics';
      imageUrl = 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=800&auto=format&fit=crop&q=60';
    }
    
    // Generate results for each store
    for (const store of stores) {
      // Simulate price variation between stores (between -10% and +10%)
      const priceVariation = (Math.random() * 0.2) - 0.1;
      const price = Math.max(1, basePrice * (1 + priceVariation));
      const priceInCents = Math.round(price * 100);
      
      // Simulate some stores being out of stock (20% chance)
      const isAvailable = Math.random() > 0.2;
      
      // Create affiliate URL (in production, this would be a real affiliate link)
      const affiliateTag = 'wishrift-20'; // Example affiliate tag
      const productId = `${normalizedQuery.replace(/\s+/g, '-')}-${Math.floor(Math.random() * 1000)}`;
      const productUrl = `https://www.${store.domain}/dp/${productId}?tag=${affiliateTag}`;
      
      results.push({
        name: productTitle,
        price: priceInCents,
        imageUrl,
        productUrl,
        store: store.name,
        isAvailable
      });
    }
    
    // Sort by price (lowest first)
    return results.sort((a, b) => a.price - b.price);
  }
  
  /**
   * Set API keys for the service
   * @param keys Object containing API keys for different networks
   */
  setApiKeys(keys: Record<string, string>) {
    // Forward to the ApiKeyService
    for (const [key, value] of Object.entries(keys)) {
      this.apiKeyService.setApiKey(key, value);
    }
  }
  
  /**
   * Clear the search cache
   */
  clearCache() {
    this.cache.clear();
  }
}