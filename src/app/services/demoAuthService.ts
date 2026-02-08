/**
 * Demo Authentication Service
 * Replaces Supabase auth with simple localStorage-based demo authentication
 * For demonstration purposes only - NOT for production use
 */

export interface DemoUser {
  id: string;
  email: string;
  name: string;
  accountType: 'customer' | 'shop' | 'insurer';
  phone?: string;
  profileImageUrl?: string;
}

export interface DemoAuthResponse {
  user: DemoUser | null;
  error: string | null;
}

const STORAGE_KEY = 'bidondent_demo_user';
const USERS_KEY = 'bidondent_demo_users';

// Initialize with some demo users
const initializeDemoUsers = () => {
  const existingUsers = localStorage.getItem(USERS_KEY);
  if (!existingUsers) {
    const demoUsers: DemoUser[] = [
      {
        id: 'demo-customer-1',
        email: 'customer@demo.com',
        name: 'Demo Customer',
        accountType: 'customer',
        phone: '(555) 123-4567'
      },
      {
        id: 'demo-shop-1',
        email: 'shop@demo.com',
        name: 'Demo Auto Shop',
        accountType: 'shop',
        phone: '(555) 987-6543'
      },
      {
        id: 'demo-insurer-1',
        email: 'insurer@demo.com',
        name: 'Demo Insurance Co.',
        accountType: 'insurer',
        phone: '(555) 456-7890'
      },
      // Admin user
      {
        id: 'demo-admin-1',
        email: 'molalign5@gmail.com',
        name: 'Admin User',
        accountType: 'customer',
        phone: '(555) 000-0000'
      }
    ];
    localStorage.setItem(USERS_KEY, JSON.stringify(demoUsers));
  }
};

class DemoAuthService {
  constructor() {
    initializeDemoUsers();
  }

  // Sign up a new user
  async signUp(email: string, password: string, name: string, accountType: 'customer' | 'shop' | 'insurer'): Promise<DemoAuthResponse> {
    try {
      // Check if user already exists
      const users = this.getAllUsers();
      const existingUser = users.find(u => u.email === email);
      
      if (existingUser) {
        return { user: null, error: 'User with this email already exists' };
      }

      // Create new user
      const newUser: DemoUser = {
        id: `demo-${accountType}-${Date.now()}`,
        email,
        name,
        accountType,
        phone: ''
      };

      // Save to users list
      users.push(newUser);
      localStorage.setItem(USERS_KEY, JSON.stringify(users));

      // Auto-login
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));

      return { user: newUser, error: null };
    } catch (error) {
      return { user: null, error: 'Failed to create account' };
    }
  }

  // Sign in
  async signIn(email: string, password: string): Promise<DemoAuthResponse> {
    try {
      const users = this.getAllUsers();
      const user = users.find(u => u.email === email);

      if (!user) {
        return { user: null, error: 'Invalid email or password' };
      }

      // Save current user
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));

      return { user, error: null };
    } catch (error) {
      return { user: null, error: 'Failed to sign in' };
    }
  }

  // Sign out
  async signOut(): Promise<{ error: string | null }> {
    try {
      localStorage.removeItem(STORAGE_KEY);
      return { error: null };
    } catch (error) {
      return { error: 'Failed to sign out' };
    }
  }

  // Get current user
  getCurrentUser(): DemoUser | null {
    try {
      const userJson = localStorage.getItem(STORAGE_KEY);
      if (!userJson) return null;
      return JSON.parse(userJson);
    } catch (error) {
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
      const usersJson = localStorage.getItem(USERS_KEY);
      if (!usersJson) return [];
      return JSON.parse(usersJson);
    } catch (error) {
      return [];
    }
  }

  // Update user profile
  async updateProfile(updates: Partial<DemoUser>): Promise<DemoAuthResponse> {
    try {
      const currentUser = this.getCurrentUser();
      if (!currentUser) {
        return { user: null, error: 'Not authenticated' };
      }

      // Update user
      const updatedUser = { ...currentUser, ...updates };
      
      // Update in users list
      const users = this.getAllUsers();
      const index = users.findIndex(u => u.id === currentUser.id);
      if (index !== -1) {
        users[index] = updatedUser;
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
      }

      // Update current user
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));

      return { user: updatedUser, error: null };
    } catch (error) {
      return { user: null, error: 'Failed to update profile' };
    }
  }

  // OAuth sign in (mock - just creates/logs in user)
  async signInWithOAuth(provider: 'google' | 'apple'): Promise<DemoAuthResponse> {
    // For demo, just show a message
    return { 
      user: null, 
      error: `${provider} sign-in is not available in demo mode. Please use email/password sign-in.` 
    };
  }
}

// Export singleton instance
export const demoAuthService = new DemoAuthService();
