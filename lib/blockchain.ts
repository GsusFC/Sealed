import { createPublicClient, createWalletClient, custom, http, keccak256, toBytes } from 'viem';
import { base } from 'viem/chains';

// Sealed Diary Contract ABI (minimal for sealing functionality)
const SEALED_DIARY_ABI = [
  {
    inputs: [
      { name: 'fid', type: 'uint256' },
      { name: 'contentHash', type: 'bytes32' },
      { name: 'wordCount', type: 'uint16' },
      { name: 'mood', type: 'string' },
    ],
    name: 'seal',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'contentHash', type: 'bytes32' }],
    name: 'verifyEntry',
    outputs: [
      { name: 'exists', type: 'bool' },
      { name: 'timestamp', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'fid', type: 'uint256' }],
    name: 'getUserEntryCount',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export interface SealOptions {
  fid: number;
  content: string;
  wordCount: number;
  mood?: string;
}

export interface VerificationResult {
  exists: boolean;
  timestamp: bigint;
}

export class BlockchainClient {
  private contractAddress: `0x${string}`;
  private publicClient: any;
  private walletClient: any;

  constructor() {
    this.contractAddress = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`) ||
                          '0x0000000000000000000000000000000000000000';

    this.publicClient = createPublicClient({
      chain: base,
      transport: http(),
    });

    // Wallet client will be initialized when needed with user's wallet
    this.walletClient = null;
  }

  /**
   * Generate content hash for an entry
   */
  generateContentHash(content: string): `0x${string}` {
    const hash = keccak256(toBytes(content));
    return hash;
  }

  /**
   * Initialize wallet client with browser wallet
   */
  async initWallet() {
    if (typeof window === 'undefined' || !(window as any).ethereum) {
      throw new Error('No Ethereum wallet detected');
    }

    this.walletClient = createWalletClient({
      chain: base,
      transport: custom((window as any).ethereum),
    });

    // Request account access
    await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
  }

  /**
   * Seal an entry on the blockchain
   */
  async sealEntry(options: SealOptions): Promise<string> {
    if (!this.walletClient) {
      await this.initWallet();
    }

    if (!this.walletClient) {
      throw new Error('Wallet client not initialized');
    }

    const contentHash = this.generateContentHash(options.content);

    try {
      const [account] = await this.walletClient.getAddresses();

      const hash = await this.walletClient.writeContract({
        address: this.contractAddress,
        abi: SEALED_DIARY_ABI,
        functionName: 'seal',
        args: [
          BigInt(options.fid),
          contentHash,
          options.wordCount,
          options.mood || '',
        ],
        account,
      });

      // Wait for transaction confirmation
      const receipt = await this.publicClient.waitForTransactionReceipt({
        hash,
      });

      if (receipt.status === 'reverted') {
        throw new Error('Transaction reverted');
      }

      return hash;
    } catch (error) {
      console.error('Failed to seal entry:', error);
      throw error;
    }
  }

  /**
   * Verify if an entry exists on-chain
   */
  async verifyEntry(contentHash: `0x${string}`): Promise<VerificationResult> {
    try {
      const result = await this.publicClient.readContract({
        address: this.contractAddress,
        abi: SEALED_DIARY_ABI,
        functionName: 'verifyEntry',
        args: [contentHash],
      });

      return {
        exists: result[0],
        timestamp: result[1],
      };
    } catch (error) {
      console.error('Failed to verify entry:', error);
      throw error;
    }
  }

  /**
   * Get total sealed entries for a user
   */
  async getUserEntryCount(fid: number): Promise<number> {
    try {
      const count = await this.publicClient.readContract({
        address: this.contractAddress,
        abi: SEALED_DIARY_ABI,
        functionName: 'getUserEntryCount',
        args: [BigInt(fid)],
      });

      return Number(count);
    } catch (error) {
      console.error('Failed to get entry count:', error);
      return 0;
    }
  }
}

export const blockchain = new BlockchainClient();
