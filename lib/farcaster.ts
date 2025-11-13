// Farcaster Mini App SDK integration
// Note: The actual SDK may differ - this is a reference implementation

export interface FarcasterUser {
  fid: number;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
}

interface MiniAppContext {
  user?: {
    fid: number;
    username?: string;
    displayName?: string;
    pfpUrl?: string;
  };
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
      // Check if running in Farcaster environment
      if (typeof window !== 'undefined' && (window as any).farcaster) {
        const miniapp = (window as any).farcaster;
        
        // Initialize Farcaster Mini App SDK
        if (miniapp.init) {
          await miniapp.init();
        }
        this.isReady = true;

        // Get user context
        if (miniapp.getContext) {
          const context: MiniAppContext = await miniapp.getContext();
          if (context?.user) {
            this.user = {
              fid: context.user.fid,
              username: context.user.username,
              displayName: context.user.displayName,
              pfpUrl: context.user.pfpUrl,
            };
          }
        }
      } else {
        // For development/testing outside Farcaster
        console.warn('Running outside Farcaster environment. Using mock data.');
        this.isReady = true;
        this.user = {
          fid: 12345, // Mock FID for development
          username: 'testuser',
          displayName: 'Test User',
        };
      }
    } catch (error) {
      console.error('Failed to initialize Farcaster SDK:', error);
      // Don't throw - allow app to work in degraded mode
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

  async requestSignature(message: string): Promise<string> {
    if (!this.isReady) {
      throw new Error('Farcaster SDK not initialized');
    }

    try {
      if (typeof window !== 'undefined' && (window as any).farcaster?.requestSignature) {
        const signature = await (window as any).farcaster.requestSignature({
          message,
        });
        return signature;
      }
      
      // Mock signature for development
      return '0x' + 'mock_signature';
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
      if (typeof window !== 'undefined' && (window as any).farcaster?.openUrl) {
        await (window as any).farcaster.openUrl(url);
      } else {
        window.open(url, '_blank');
      }
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
      if (typeof window !== 'undefined' && (window as any).farcaster?.share) {
        await (window as any).farcaster.share({ text });
      } else {
        // Fallback: copy to clipboard
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(text);
          console.log('Content copied to clipboard');
        }
      }
    } catch (error) {
      console.error('Failed to share content:', error);
      throw error;
    }
  }
}

export const farcaster = FarcasterClient.getInstance();
