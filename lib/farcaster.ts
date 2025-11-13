import { miniapp } from '@farcaster/miniapp-sdk';

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
      // Initialize Farcaster Mini App SDK
      await miniapp.init();
      this.isReady = true;

      // Get user context
      const context = await miniapp.getContext();
      if (context?.user) {
        this.user = {
          fid: context.user.fid,
          username: context.user.username,
          displayName: context.user.displayName,
          pfpUrl: context.user.pfpUrl,
        };
      }
    } catch (error) {
      console.error('Failed to initialize Farcaster SDK:', error);
      throw error;
    }
  }

  getUser(): FarcasterUser | null {
    return this.user;
  }

  isInitialized(): boolean {
    return this.isReady;
  }

  async requestSignature(message: string): Promise<string> {
    if (!this.isReady) {
      throw new Error('Farcaster SDK not initialized');
    }

    try {
      const signature = await miniapp.requestSignature({
        message,
      });
      return signature;
    } catch (error) {
      console.error('Failed to request signature:', error);
      throw error;
    }
  }

  async openUrl(url: string): Promise<void> {
    if (!this.isReady) {
      throw new Error('Farcaster SDK not initialized');
    }

    try {
      await miniapp.openUrl(url);
    } catch (error) {
      console.error('Failed to open URL:', error);
      throw error;
    }
  }

  async shareContent(text: string): Promise<void> {
    if (!this.isReady) {
      throw new Error('Farcaster SDK not initialized');
    }

    try {
      await miniapp.share({ text });
    } catch (error) {
      console.error('Failed to share content:', error);
      throw error;
    }
  }
}

export const farcaster = FarcasterClient.getInstance();
