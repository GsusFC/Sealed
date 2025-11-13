// Farcaster Mini App SDK integration with Quick Auth
import { sdk } from '@farcaster/miniapp-sdk';

export interface FarcasterUser {
  fid: number;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
}

export class FarcasterClient {
  private static instance: FarcasterClient;
  private user: FarcasterUser | null = null;
  private isReady = false;

  private constructor() {}

  static getInstance(): FarcasterClient {
    if (!FarcasterClient.instance) {
      FarcasterClient.instance = new FarcasterClient();
    }
    return FarcasterClient.instance;
  }

  async init(): Promise<void> {
    if (this.isReady) return;

    try {
      // Get Farcaster context from the SDK
      const context = await sdk.context;

      if (context?.user) {
        this.user = {
          fid: context.user.fid,
          username: context.user.username,
          displayName: context.user.displayName,
          pfpUrl: context.user.pfpUrl,
        };
        this.isReady = true;

        // Let Farcaster know the app is ready
        sdk.actions.ready();
      } else {
        throw new Error('No user context available');
      }
    } catch (error) {
      console.error('Failed to initialize Farcaster SDK:', error);
      console.warn('Running outside Farcaster environment. Using mock data.');

      // Fallback to mock data for development
      this.isReady = true;
      this.user = {
        fid: 12345, // Mock FID for development
        username: 'testuser',
        displayName: 'Test User',
      };
    }
  }

  getUser(): FarcasterUser | null {
    return this.user;
  }

  isInitialized(): boolean {
    return this.isReady;
  }

  async signIn(): Promise<{ message: string; signature: string }> {
    if (!this.isReady) {
      throw new Error('Farcaster SDK not initialized');
    }

    try {
      // Generate a random nonce (at least 8 alphanumeric characters)
      const nonce = Math.random().toString(36).substring(2, 15);

      const signInResult = await sdk.actions.signIn({
        nonce,
        acceptAuthAddress: true,
      });

      return signInResult;
    } catch (error) {
      console.error('Failed to sign in:', error);
      throw error;
    }
  }

  async openUrl(url: string): Promise<void> {
    if (!this.isReady) {
      throw new Error('Farcaster SDK not initialized');
    }

    try {
      await sdk.actions.openUrl(url);
    } catch (error) {
      console.error('Failed to open URL:', error);
      // Fallback to window.open
      if (typeof window !== 'undefined') {
        window.open(url, '_blank');
      }
    }
  }

  async shareContent(): Promise<void> {
    if (!this.isReady) {
      throw new Error('Farcaster SDK not initialized');
    }

    try {
      // Add the Mini App to the user's feed
      await sdk.actions.addMiniApp();
    } catch (error) {
      console.error('Failed to share Mini App:', error);
      throw error;
    }
  }

  // Close the mini app
  async close(): Promise<void> {
    try {
      await sdk.actions.close();
    } catch (error) {
      console.error('Failed to close mini app:', error);
    }
  }
}

export const farcaster = FarcasterClient.getInstance();
