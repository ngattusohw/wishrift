/**
 * Service for managing API keys for affiliate networks and retailers
 */
export class ApiKeyService {
  private static instance: ApiKeyService;
  private apiKeys: Map<string, string> = new Map();

  /**
   * Gets the singleton instance of the ApiKeyService
   */
  public static getInstance(): ApiKeyService {
    if (!ApiKeyService.instance) {
      ApiKeyService.instance = new ApiKeyService();
    }
    return ApiKeyService.instance;
  }

  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor() {
    this.loadApiKeysFromEnvironment();
  }

  /**
   * Load API keys from environment variables
   */
  private loadApiKeysFromEnvironment(): void {
    // Load API keys from environment variables
    const apiKeys = {
      RAKUTEN_API_KEY: process.env.RAKUTEN_API_KEY,
      SKIMLINKS_API_KEY: process.env.SKIMLINKS_API_KEY,
      CJ_AFFILIATE_API_KEY: process.env.CJ_AFFILIATE_API_KEY,
      AMAZON_API_KEY: process.env.AMAZON_API_KEY,
      WALMART_API_KEY: process.env.WALMART_API_KEY,
      // Add more keys as needed
    };

    // Store keys in the map if they exist
    for (const [key, value] of Object.entries(apiKeys)) {
      if (value) {
        this.apiKeys.set(key, value);
      }
    }
  }

  /**
   * Get a specific API key
   * @param key Name of the API key
   * @returns API key value or null if not found
   */
  public getApiKey(key: string): string | null {
    return this.apiKeys.get(key) || null;
  }

  /**
   * Set a specific API key
   * @param key Name of the API key
   * @param value Value of the API key
   */
  public setApiKey(key: string, value: string): void {
    this.apiKeys.set(key, value);
  }

  /**
   * Get all API keys as an object
   * @returns Object containing all API keys
   */
  public getAllApiKeys(): Record<string, string> {
    const keys: Record<string, string> = {};
    this.apiKeys.forEach((value, key) => {
      keys[key] = value;
    });
    return keys;
  }

  /**
   * Check if an API key exists
   * @param key Name of the API key
   * @returns True if the key exists, false otherwise
   */
  public hasApiKey(key: string): boolean {
    return this.apiKeys.has(key);
  }

  /**
   * Check if any API keys are available for use
   * @returns True if at least one API key is available
   */
  public hasAnyApiKeys(): boolean {
    return this.apiKeys.size > 0;
  }
}