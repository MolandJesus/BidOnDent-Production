/**
 * Demo Authentication Service
 * Replaces Supabase auth with simple localStorage-based demo authentication
 * For demonstration purposes only - NOT for production use
 */

export interface DemoUser {
  id: string;
  email: string;
  name: string;
  accountType: "customer" | "shop" | "insurer";
  phone?: string;
  profileImageUrl?: string;
}

export interface DemoAuthResponse {
  user: DemoUser | null;
  error: string | null;
}

const STORAGE_KEY = "bidondent_demo_user";
const USERS_KEY = "bidondent_demo_users";
const DEFAULT_DEMO_USERS: DemoUser[] = [
  {
    id: "demo-customer-1",
    email: "customer@demo.com",
    name: "Demo Customer",
    accountType: "customer",
    phone: "(555) 123-4567",
  },
  {
    id: "demo-shop-1",
    email: "shop@demo.com",
    name: "Demo Auto Shop",
    accountType: "shop",
    phone: "(555) 987-6543",
  },
  {
    id: "demo-insurer-1",
    email: "insurer@demo.com",
    name: "Demo Insurance Co.",
    accountType: "insurer",
    phone: "(555) 456-7890",
  },
  {
    id: "demo-admin-1",
    email: "molalign5@gmail.com",
    name: "Admin User",
    accountType: "customer",
    phone: "(555) 000-0000",
  },
];

const readStorageItem = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    if (import.meta.env.DEV) console.error(`Could not read demo storage key "${key}":`, error);
    return null;
  }
};

const writeStorageItem = (key: string, value: string): boolean => {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    if (import.meta.env.DEV) console.error(`Could not write demo storage key "${key}":`, error);
    return false;
  }
};

const removeStorageItem = (key: string): boolean => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    if (import.meta.env.DEV) console.error(`Could not clear demo storage key "${key}":`, error);
    return false;
  }
};

const persistDemoUsers = (users: DemoUser[]) => writeStorageItem(USERS_KEY, JSON.stringify(users));
const persistCurrentUser = (user: DemoUser) => writeStorageItem(STORAGE_KEY, JSON.stringify(user));

const isDemoUser = (value: unknown): value is DemoUser => {
  if (typeof value !== "object" || value === null) return false;
  const user = value as Record<string, unknown>;
  return (
    typeof user.id === "string" &&
    typeof user.email === "string" &&
    typeof user.name === "string" &&
    (user.accountType === "customer" ||
      user.accountType === "shop" ||
      user.accountType === "insurer") &&
    (!("phone" in user) || user.phone === undefined || typeof user.phone === "string") &&
    (!("profileImageUrl" in user) ||
      user.profileImageUrl === undefined ||
      typeof user.profileImageUrl === "string")
  );
};

// Initialize with some demo users
const initializeDemoUsers = () => {
  const existingUsers = readStorageItem(USERS_KEY);
  if (!existingUsers) {
    persistDemoUsers(DEFAULT_DEMO_USERS);
  }
};

class DemoAuthService {
  constructor() {
    initializeDemoUsers();
  }

  // Sign up a new user
  async signUp(
    email: string,
    password: string,
    name: string,
    accountType: "customer" | "shop" | "insurer"
  ): Promise<DemoAuthResponse> {
    try {
      // Check if user already exists
      const users = this.getAllUsers();
      const existingUser = users.find((u) => u.email === email);

      if (existingUser) {
        return { user: null, error: "User with this email already exists" };
      }

      // Create new user
      const newUser: DemoUser = {
        id: `demo-${accountType}-${Date.now()}`,
        email,
        name,
        accountType,
        phone: "",
      };

      // Save to users list
      users.push(newUser);
      const didPersistUsers = persistDemoUsers(users);

      // Auto-login
      const didPersistCurrentUser = persistCurrentUser(newUser);

      if (!didPersistUsers || !didPersistCurrentUser) {
        return { user: null, error: "Demo storage unavailable. Account could not be persisted." };
      }

      return { user: newUser, error: null };
    } catch (error) {
      return { user: null, error: "Failed to create account" };
    }
  }

  // Sign in
  async signIn(email: string, password: string): Promise<DemoAuthResponse> {
    try {
      const users = this.getAllUsers();
      const user = users.find((u) => u.email === email);

      if (!user) {
        return { user: null, error: "Invalid email or password" };
      }

      // Save current user
      if (!persistCurrentUser(user)) {
        return { user: null, error: "Demo storage unavailable. Sign-in could not be persisted." };
      }

      return { user, error: null };
    } catch (error) {
      return { user: null, error: "Failed to sign in" };
    }
  }

  // Sign out
  async signOut(): Promise<{ error: string | null }> {
    try {
      return removeStorageItem(STORAGE_KEY)
        ? { error: null }
        : { error: "Demo storage unavailable. Sign-out could not be persisted." };
    } catch (error) {
      return { error: "Failed to sign out" };
    }
  }

  // Get current user
  getCurrentUser(): DemoUser | null {
    try {
      const userJson = readStorageItem(STORAGE_KEY);
      if (!userJson) return null;
      const parsed: unknown = JSON.parse(userJson);
      if (!isDemoUser(parsed)) {
        removeStorageItem(STORAGE_KEY);
        return null;
      }
      return parsed;
    } catch (error) {
      removeStorageItem(STORAGE_KEY);
      return null;
    }
  }

  // Check if user is logged in
  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  // Get all users (for demo purposes)
  getAllUsers(): DemoUser[] {
    try {
      const usersJson = readStorageItem(USERS_KEY);
      if (!usersJson) {
        initializeDemoUsers();
        return DEFAULT_DEMO_USERS;
      }
      const parsed: unknown = JSON.parse(usersJson);
      if (!Array.isArray(parsed) || !parsed.every(isDemoUser)) {
        removeStorageItem(USERS_KEY);
        initializeDemoUsers();
        return DEFAULT_DEMO_USERS;
      }
      return parsed;
    } catch (error) {
      removeStorageItem(USERS_KEY);
      initializeDemoUsers();
      return DEFAULT_DEMO_USERS;
    }
  }

  // Update user profile
  async updateProfile(updates: Partial<DemoUser>): Promise<DemoAuthResponse> {
    try {
      const currentUser = this.getCurrentUser();
      if (!currentUser) {
        return { user: null, error: "Not authenticated" };
      }

      // Update user
      const updatedUser = { ...currentUser, ...updates };
      if (!isDemoUser(updatedUser)) {
        return { user: null, error: "Invalid profile update" };
      }

      // Update in users list
      const users = this.getAllUsers();
      const index = users.findIndex((u) => u.id === currentUser.id);
      if (index !== -1) {
        users[index] = updatedUser;
        if (!persistDemoUsers(users)) {
          return { user: null, error: "Demo storage unavailable. Profile could not be saved." };
        }
      }

      // Update current user
      if (!persistCurrentUser(updatedUser)) {
        return { user: null, error: "Demo storage unavailable. Session could not be updated." };
      }

      return { user: updatedUser, error: null };
    } catch (error) {
      return { user: null, error: "Failed to update profile" };
    }
  }

  // OAuth sign in (mock - just creates/logs in user)
  async signInWithOAuth(provider: "google" | "apple"): Promise<DemoAuthResponse> {
    // For demo, just show a message
    return {
      user: null,
      error: `${provider} sign-in is not available in demo mode. Please use email/password sign-in.`,
    };
  }
}

// Export singleton instance
export const demoAuthService = new DemoAuthService();
