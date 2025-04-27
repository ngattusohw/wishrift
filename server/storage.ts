import { nanoid } from "nanoid";
import { 
  users, type User, type InsertUser,
  wishLists, type WishList, type InsertWishList,
  wishListItems, type WishListItem, type InsertWishListItem,
  priceHistory, type PriceHistory, type InsertPriceHistory,
  priceAlerts, type PriceAlert, type InsertPriceAlert,
  sharedAccess, type SharedAccess, type InsertSharedAccess
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Wish Lists
  getWishLists(userId: number): Promise<WishList[]>;
  getWishList(id: number): Promise<WishList | undefined>;
  getWishListByShareId(shareId: string): Promise<WishList | undefined>;
  createWishList(wishList: InsertWishList): Promise<WishList>;
  updateWishList(id: number, updates: Partial<InsertWishList>): Promise<WishList | undefined>;
  deleteWishList(id: number): Promise<boolean>;
  
  // Wish List Items
  getWishListItems(wishListId: number): Promise<WishListItem[]>;
  getWishListItem(id: number): Promise<WishListItem | undefined>;
  createWishListItem(item: InsertWishListItem): Promise<WishListItem>;
  updateWishListItem(id: number, updates: Partial<InsertWishListItem>): Promise<WishListItem | undefined>;
  deleteWishListItem(id: number): Promise<boolean>;
  
  // Price History
  getPriceHistory(itemId: number): Promise<PriceHistory[]>;
  addPriceHistory(priceHistory: InsertPriceHistory): Promise<PriceHistory>;
  
  // Price Alerts
  getPriceAlerts(itemId: number): Promise<PriceAlert[]>;
  getPriceAlert(id: number): Promise<PriceAlert | undefined>;
  createPriceAlert(alert: InsertPriceAlert): Promise<PriceAlert>;
  updatePriceAlert(id: number, updates: Partial<InsertPriceAlert>): Promise<PriceAlert | undefined>;
  deletePriceAlert(id: number): Promise<boolean>;
  
  // Shared Access
  getSharedWithMe(userId: number): Promise<WishList[]>;
  shareWishList(sharedAccess: InsertSharedAccess): Promise<SharedAccess>;
  removeSharedAccess(wishListId: number, userId: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private wishLists: Map<number, WishList>;
  private wishListItems: Map<number, WishListItem>;
  private priceHistories: Map<number, PriceHistory>;
  private priceAlerts: Map<number, PriceAlert>;
  private sharedAccesses: Map<number, SharedAccess>;
  
  private userIdCounter: number;
  private wishListIdCounter: number;
  private wishListItemIdCounter: number;
  private priceHistoryIdCounter: number;
  private priceAlertIdCounter: number;
  private sharedAccessIdCounter: number;

  constructor() {
    this.users = new Map();
    this.wishLists = new Map();
    this.wishListItems = new Map();
    this.priceHistories = new Map();
    this.priceAlerts = new Map();
    this.sharedAccesses = new Map();
    
    this.userIdCounter = 1;
    this.wishListIdCounter = 1;
    this.wishListItemIdCounter = 1;
    this.priceHistoryIdCounter = 1;
    this.priceAlertIdCounter = 1;
    this.sharedAccessIdCounter = 1;
    
    // Add a default user
    this.createUser({
      username: "demo",
      password: "password"
    });
    
    // Create a default wish list
    this.createWishList({
      userId: 1,
      title: "My Wish List",
      description: "A collection of items I want to track",
      shareId: nanoid(10),
    });
    
    // Seed with some example items
    const items = [
      {
        wishListId: 1,
        name: "Sony PlayStation 5",
        description: "Next-gen gaming console",
        currentPrice: 44999, // $449.99
        originalPrice: 49999, // $499.99
        imageUrl: "https://images.unsplash.com/photo-1616416293048-5f2925af883b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        productUrl: "https://www.bestbuy.com/site/sony-playstation-5-console/6426149.p?skuId=6426149",
        store: "Best Buy",
        category: "Electronics",
        isFavorite: true
      },
      {
        wishListId: 1,
        name: "Xbox Series X",
        description: "Microsoft's flagship gaming console",
        currentPrice: 49999, // $499.99
        originalPrice: 49999, // $499.99
        imageUrl: "https://images.unsplash.com/photo-1662219708272-d1a9b70384c3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        productUrl: "https://www.amazon.com/Xbox-X/dp/B08H75RTZ8",
        store: "Amazon",
        category: "Gaming",
        isFavorite: true
      },
      {
        wishListId: 1,
        name: "iPad Pro 12.9\"",
        description: "Apple's premium tablet",
        currentPrice: 109900, // $1,099.00
        originalPrice: 106900, // $1,069.00
        imageUrl: "https://images.unsplash.com/photo-1588702547923-7093a6c3ba33?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        productUrl: "https://www.apple.com/shop/buy-ipad/ipad-pro",
        store: "Apple Store",
        category: "Electronics",
        isFavorite: true
      }
    ];
    
    items.forEach(item => {
      const newItem = this.createWishListItem(item);
      
      // Add price history for each item
      const dateNow = new Date();
      const history = [
        { itemId: newItem.id, price: item.currentPrice, date: new Date() },
        { itemId: newItem.id, price: item.originalPrice, date: new Date(dateNow.setDate(dateNow.getDate() - 7)) },
        { itemId: newItem.id, price: item.originalPrice, date: new Date(dateNow.setDate(dateNow.getDate() - 7)) },
        { itemId: newItem.id, price: item.originalPrice, date: new Date(dateNow.setDate(dateNow.getDate() - 7)) }
      ];
      
      history.forEach(h => this.addPriceHistory(h));
    });
    
    // Add a price alert for the iPad
    this.createPriceAlert({
      itemId: 3,
      targetPrice: 99900, // $999.00
      isActive: true
    });
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Wish Lists
  async getWishLists(userId: number): Promise<WishList[]> {
    return Array.from(this.wishLists.values()).filter(
      (wishList) => wishList.userId === userId
    );
  }
  
  async getWishList(id: number): Promise<WishList | undefined> {
    return this.wishLists.get(id);
  }
  
  async getWishListByShareId(shareId: string): Promise<WishList | undefined> {
    return Array.from(this.wishLists.values()).find(
      (wishList) => wishList.shareId === shareId
    );
  }
  
  async createWishList(insertWishList: InsertWishList): Promise<WishList> {
    const id = this.wishListIdCounter++;
    const now = new Date();
    const wishList: WishList = { 
      ...insertWishList,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.wishLists.set(id, wishList);
    return wishList;
  }
  
  async updateWishList(id: number, updates: Partial<InsertWishList>): Promise<WishList | undefined> {
    const wishList = this.wishLists.get(id);
    if (!wishList) return undefined;
    
    const updatedWishList: WishList = {
      ...wishList,
      ...updates,
      updatedAt: new Date()
    };
    
    this.wishLists.set(id, updatedWishList);
    return updatedWishList;
  }
  
  async deleteWishList(id: number): Promise<boolean> {
    return this.wishLists.delete(id);
  }
  
  // Wish List Items
  async getWishListItems(wishListId: number): Promise<WishListItem[]> {
    return Array.from(this.wishListItems.values()).filter(
      (item) => item.wishListId === wishListId
    );
  }
  
  async getWishListItem(id: number): Promise<WishListItem | undefined> {
    return this.wishListItems.get(id);
  }
  
  async createWishListItem(insertItem: InsertWishListItem): Promise<WishListItem> {
    const id = this.wishListItemIdCounter++;
    const now = new Date();
    const item: WishListItem = {
      ...insertItem,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.wishListItems.set(id, item);
    return item;
  }
  
  async updateWishListItem(id: number, updates: Partial<InsertWishListItem>): Promise<WishListItem | undefined> {
    const item = this.wishListItems.get(id);
    if (!item) return undefined;
    
    const updatedItem: WishListItem = {
      ...item,
      ...updates,
      updatedAt: new Date()
    };
    
    this.wishListItems.set(id, updatedItem);
    return updatedItem;
  }
  
  async deleteWishListItem(id: number): Promise<boolean> {
    return this.wishListItems.delete(id);
  }
  
  // Price History
  async getPriceHistory(itemId: number): Promise<PriceHistory[]> {
    return Array.from(this.priceHistories.values())
      .filter((history) => history.itemId === itemId)
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }
  
  async addPriceHistory(insertHistory: InsertPriceHistory): Promise<PriceHistory> {
    const id = this.priceHistoryIdCounter++;
    const history: PriceHistory = {
      ...insertHistory,
      id
    };
    this.priceHistories.set(id, history);
    return history;
  }
  
  // Price Alerts
  async getPriceAlerts(itemId: number): Promise<PriceAlert[]> {
    return Array.from(this.priceAlerts.values()).filter(
      (alert) => alert.itemId === itemId
    );
  }
  
  async getPriceAlert(id: number): Promise<PriceAlert | undefined> {
    return this.priceAlerts.get(id);
  }
  
  async createPriceAlert(insertAlert: InsertPriceAlert): Promise<PriceAlert> {
    const id = this.priceAlertIdCounter++;
    const alert: PriceAlert = {
      ...insertAlert,
      id,
      createdAt: new Date()
    };
    this.priceAlerts.set(id, alert);
    return alert;
  }
  
  async updatePriceAlert(id: number, updates: Partial<InsertPriceAlert>): Promise<PriceAlert | undefined> {
    const alert = this.priceAlerts.get(id);
    if (!alert) return undefined;
    
    const updatedAlert: PriceAlert = {
      ...alert,
      ...updates
    };
    
    this.priceAlerts.set(id, updatedAlert);
    return updatedAlert;
  }
  
  async deletePriceAlert(id: number): Promise<boolean> {
    return this.priceAlerts.delete(id);
  }
  
  // Shared Access
  async getSharedWithMe(userId: number): Promise<WishList[]> {
    const sharedAccessList = Array.from(this.sharedAccesses.values()).filter(
      (access) => access.userId === userId
    );
    
    return sharedAccessList.map(access => this.wishLists.get(access.wishListId)!).filter(Boolean);
  }
  
  async shareWishList(insertSharedAccess: InsertSharedAccess): Promise<SharedAccess> {
    const id = this.sharedAccessIdCounter++;
    const sharedAccess: SharedAccess = {
      ...insertSharedAccess,
      id,
      createdAt: new Date()
    };
    this.sharedAccesses.set(id, sharedAccess);
    return sharedAccess;
  }
  
  async removeSharedAccess(wishListId: number, userId: number): Promise<boolean> {
    const accessToRemove = Array.from(this.sharedAccesses.values()).find(
      (access) => access.wishListId === wishListId && access.userId === userId
    );
    
    if (!accessToRemove) return false;
    return this.sharedAccesses.delete(accessToRemove.id);
  }
}

export const storage = new MemStorage();
