import { nanoid } from "nanoid";
import { eq, and } from "drizzle-orm";
import { db } from "./db";
import { 
  users, type User, type UpsertUser,
  wishLists, type WishList, type InsertWishList,
  wishListItems, type WishListItem, type InsertWishListItem,
  priceHistory, type PriceHistory, type InsertPriceHistory,
  priceAlerts, type PriceAlert, type InsertPriceAlert,
  sharedAccess, type SharedAccess, type InsertSharedAccess,
  productListings, type ProductListing, type InsertProductListing
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Wish Lists
  getWishLists(userId: string): Promise<WishList[]>;
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
  
  // Product Listings
  getProductListings(itemId: number): Promise<ProductListing[]>;
  createProductListing(listing: InsertProductListing): Promise<ProductListing>;
  
  // Shared Access
  getSharedWithMe(userId: string): Promise<WishList[]>;
  shareWishList(sharedAccess: InsertSharedAccess): Promise<SharedAccess>;
  removeSharedAccess(wishListId: number, userId: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }
  
  // Wish Lists
  async getWishLists(userId: string): Promise<WishList[]> {
    return await db.select().from(wishLists).where(eq(wishLists.userId, userId));
  }
  
  async getWishList(id: number): Promise<WishList | undefined> {
    const [wishlist] = await db.select().from(wishLists).where(eq(wishLists.id, id));
    return wishlist;
  }
  
  async getWishListByShareId(shareId: string): Promise<WishList | undefined> {
    const [wishlist] = await db.select().from(wishLists).where(eq(wishLists.shareId, shareId));
    return wishlist;
  }
  
  async createWishList(wishList: InsertWishList): Promise<WishList> {
    const [newWishList] = await db.insert(wishLists).values(wishList).returning();
    return newWishList;
  }
  
  async updateWishList(id: number, updates: Partial<InsertWishList>): Promise<WishList | undefined> {
    const [updatedWishList] = await db
      .update(wishLists)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(wishLists.id, id))
      .returning();
    return updatedWishList;
  }
  
  async deleteWishList(id: number): Promise<boolean> {
    const deleted = await db.delete(wishLists).where(eq(wishLists.id, id)).returning();
    return deleted.length > 0;
  }
  
  // Wish List Items
  async getWishListItems(wishListId: number): Promise<WishListItem[]> {
    return await db.select().from(wishListItems).where(eq(wishListItems.wishListId, wishListId));
  }
  
  async getWishListItem(id: number): Promise<WishListItem | undefined> {
    const [item] = await db.select().from(wishListItems).where(eq(wishListItems.id, id));
    return item;
  }
  
  async createWishListItem(item: InsertWishListItem): Promise<WishListItem> {
    const [newItem] = await db.insert(wishListItems).values(item).returning();
    return newItem;
  }
  
  async updateWishListItem(id: number, updates: Partial<InsertWishListItem>): Promise<WishListItem | undefined> {
    const [updatedItem] = await db
      .update(wishListItems)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(wishListItems.id, id))
      .returning();
    return updatedItem;
  }
  
  async deleteWishListItem(id: number): Promise<boolean> {
    const deleted = await db.delete(wishListItems).where(eq(wishListItems.id, id)).returning();
    return deleted.length > 0;
  }
  
  // Price History
  async getPriceHistory(itemId: number): Promise<PriceHistory[]> {
    const history = await db
      .select()
      .from(priceHistory)
      .where(eq(priceHistory.itemId, itemId))
      .orderBy(priceHistory.date);
    return history;
  }
  
  async addPriceHistory(historyEntry: InsertPriceHistory): Promise<PriceHistory> {
    const [newHistory] = await db.insert(priceHistory).values(historyEntry).returning();
    return newHistory;
  }
  
  // Price Alerts
  async getPriceAlerts(itemId: number): Promise<PriceAlert[]> {
    return await db.select().from(priceAlerts).where(eq(priceAlerts.itemId, itemId));
  }
  
  async getPriceAlert(id: number): Promise<PriceAlert | undefined> {
    const [alert] = await db.select().from(priceAlerts).where(eq(priceAlerts.id, id));
    return alert;
  }
  
  async createPriceAlert(alert: InsertPriceAlert): Promise<PriceAlert> {
    const [newAlert] = await db.insert(priceAlerts).values(alert).returning();
    return newAlert;
  }
  
  async updatePriceAlert(id: number, updates: Partial<InsertPriceAlert>): Promise<PriceAlert | undefined> {
    const [updatedAlert] = await db
      .update(priceAlerts)
      .set(updates)
      .where(eq(priceAlerts.id, id))
      .returning();
    return updatedAlert;
  }
  
  async deletePriceAlert(id: number): Promise<boolean> {
    const deleted = await db.delete(priceAlerts).where(eq(priceAlerts.id, id)).returning();
    return deleted.length > 0;
  }
  
  // Product Listings
  async getProductListings(itemId: number): Promise<ProductListing[]> {
    return await db.select().from(productListings).where(eq(productListings.itemId, itemId));
  }
  
  async createProductListing(listing: InsertProductListing): Promise<ProductListing> {
    const [newListing] = await db.insert(productListings).values(listing).returning();
    return newListing;
  }
  
  // Shared Access
  async getSharedWithMe(userId: string): Promise<WishList[]> {
    const access = await db
      .select()
      .from(sharedAccess)
      .where(eq(sharedAccess.userId, userId));
    
    const lists = await Promise.all(
      access.map(a => this.getWishList(a.wishListId))
    );
    
    return lists.filter(Boolean) as WishList[];
  }
  
  async shareWishList(sharedAccessData: InsertSharedAccess): Promise<SharedAccess> {
    const [access] = await db.insert(sharedAccess).values(sharedAccessData).returning();
    return access;
  }
  
  async removeSharedAccess(wishListId: number, userId: string): Promise<boolean> {
    const deleted = await db
      .delete(sharedAccess)
      .where(
        and(
          eq(sharedAccess.wishListId, wishListId),
          eq(sharedAccess.userId, userId)
        )
      )
      .returning();
    return deleted.length > 0;
  }
}

export const storage = new DatabaseStorage();