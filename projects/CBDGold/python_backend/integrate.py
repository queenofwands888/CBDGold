#!/usr/bin/env python3
"""
Integration script to connect Python backend with React frontend
This script helps synchronize data between backend and frontend services
"""

import json
import os
from pathlib import Path
from typing import Dict, Any, List

class CBDGoldIntegration:
    def __init__(self):
        self.backend_dir = Path(__file__).parent
        self.frontend_dir = self.backend_dir.parent / "src"
        self.contracts_dir = self.backend_dir.parent / "contracts"
        
    def sync_product_data(self):
        """Sync product data between backend and frontend"""
        print("🔄 Syncing product data...")
        
        # Read products from backend
        backend_products = self._get_backend_products()
        
        # Generate frontend-compatible data
        frontend_data = self._convert_to_frontend_format(backend_products)
        
        # Write to frontend constants file
        constants_file = self.frontend_dir / "data" / "constants.ts"
        if constants_file.parent.exists():
            self._write_frontend_constants(constants_file, frontend_data)
            print("✅ Product data synced to frontend")
        else:
            print("⚠️  Frontend constants directory not found")
    
    def _get_backend_products(self) -> List[Dict[str, Any]]:
        """Get products from backend service"""
        # This would normally call the backend API
        # For now, return the same products from backend service
        return [
            {
                "id": 1,
                "name": "Green Crack",
                "strain": "Sativa Dominant",
                "type": "Vape Cartridge",
                "flavor": "Sweet, Citrus, Earthy",
                "effects": "Energizing, Creative, Uplifting",
                "priceAlgo": 25.0,
                "priceUsdc": 5.50,
                "hempEarned": 2200,
                "potency": "85% CBD, 0.3% THC",
                "terpenes": ["Myrcene", "Limonene", "Caryophyllene"],
                "color": "from-green-400 to-green-600",
                "emoji": "💚"
            },
            {
                "id": 2,
                "name": "Purple Haze",
                "strain": "Indica Dominant",
                "type": "Vape Cartridge",
                "flavor": "Berry, Sweet, Floral",
                "effects": "Relaxing, Calming, Euphoric",
                "priceAlgo": 28.0,
                "priceUsdc": 6.25,
                "hempEarned": 2500,
                "potency": "90% CBD, 0.2% THC",
                "terpenes": ["Linalool", "Myrcene", "Pinene"],
                "color": "from-purple-400 to-purple-600",
                "emoji": "💜"
            },
            # Add more products as needed
        ]
    
    def _convert_to_frontend_format(self, products: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Convert backend product format to frontend format"""
        frontend_products = []
        
        for product in products:
            frontend_product = {
                "id": product["id"],
                "name": product["name"],
                "strain": product["strain"],
                "type": product["type"],
                "flavor": product["flavor"],
                "effects": product["effects"],
                "priceAlgo": product["priceAlgo"],
                "priceUsdc": product["priceUsdc"],
                "hempEarned": product["hempEarned"],
                "potency": product["potency"],
                "terpenes": product["terpenes"],
                "color": product["color"],
                "emoji": product["emoji"]
            }
            frontend_products.append(frontend_product)
        
        return {
            "products": frontend_products,
            "lastUpdated": "new Date().toISOString()",
            "source": "python_backend"
        }
    
    def _write_frontend_constants(self, file_path: Path, data: Dict[str, Any]):
        """Write data to frontend constants file"""
        try:
            # Read existing constants file if it exists
            existing_content = ""
            if file_path.exists():
                existing_content = file_path.read_text()
            
            # Generate new product constants
            products_ts = "export const CBD_VAPES = [\n"
            for product in data["products"]:
                products_ts += "  {\n"
                for key, value in product.items():
                    if isinstance(value, str):
                        products_ts += f'    {key}: "{value}",\n'
                    elif isinstance(value, list):
                        if all(isinstance(item, str) for item in value):
                            products_ts += f'    {key}: {json.dumps(value)},\n'
                        else:
                            products_ts += f'    {key}: {value},\n'
                    else:
                        products_ts += f'    {key}: {value},\n'
                products_ts += "  },\n"
            products_ts += "];\n\n"
            
            # Add metadata
            products_ts += f"// Generated from Python backend at {data['lastUpdated']}\n"
            products_ts += f"// Source: {data['source']}\n\n"
            
            # If file exists, try to preserve other constants
            if existing_content:
                # This is a simplified approach - in production you'd want more sophisticated merging
                if "CBD_VAPES" in existing_content:
                    # Replace CBD_VAPES section
                    lines = existing_content.split('\n')
                    new_lines = []
                    skip_until_bracket = False
                    
                    for line in lines:
                        if "export const CBD_VAPES" in line:
                            skip_until_bracket = True
                            continue
                        if skip_until_bracket:
                            if line.strip() == "];":
                                skip_until_bracket = False
                            continue
                        new_lines.append(line)
                    
                    # Write the new file
                    with open(file_path, 'w') as f:
                        f.write(products_ts)
                        f.write('\n'.join(new_lines))
                else:
                    # Append to existing file
                    with open(file_path, 'a') as f:
                        f.write("\n" + products_ts)
            else:
                # Create new file
                file_path.write_text(products_ts)
                
        except Exception as e:
            print(f"❌ Error writing frontend constants: {e}")
    
    def generate_api_client(self):
        """Generate TypeScript API client for frontend"""
        print("🔄 Generating TypeScript API client...")
        
        api_client_content = '''// Generated TypeScript API Client for CBD Gold ShopFi Backend
// This file is auto-generated - do not edit manually

export interface TokenPrice {
  symbol: string;
  price_usd: number;
  price_algo?: number;
  last_updated: string;
  source: string;
  change_24h?: number;
}

export interface Product {
  id: number;
  name: string;
  strain: string;
  type: string;
  flavor: string;
  effects: string;
  price_algo: number;
  price_usdc: number;
  price_hemp?: number;
  hemp_earned: number;
  potency: string;
  terpenes: string[];
  color: string;
  emoji: string;
  description?: string;
  image_url?: string;
  in_stock: boolean;
  category: string;
}

export interface StakingPool {
  id: number;
  name: string;
  min_stake: number;
  discount: number;
  apy: number;
  shipping: string;
  benefits: string[];
  color: string;
  total_staked?: number;
  total_stakers?: number;
  is_active: boolean;
}

export interface GovernanceProposal {
  id: number;
  title: string;
  description: string;
  status: string;
  time_left: string;
  weed_required: number;
  votes_yes: number;
  votes_no: number;
  votes_abstain: number;
  total_votes: number;
  created_at: string;
  ends_at: string;
  creator?: string;
}

export interface WalletInfo {
  address: string;
  algo_balance: number;
  hemp_balance: number;
  weed_balance: number;
  usdc_balance: number;
  staked_hemp: number;
  staking_tier: number;
  voting_power: number;
  last_updated: string;
  opted_in_assets: number[];
}

export class CBDGoldAPI {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:8000') {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }

  // Price endpoints
  async getTokenPrices(): Promise<Record<string, TokenPrice>> {
    return this.request('/api/prices');
  }

  async getOracleMetadata() {
    return this.request('/api/oracle-meta');
  }

  // Product endpoints
  async getProducts(): Promise<Product[]> {
    return this.request('/api/products');
  }

  async getProduct(id: number): Promise<Product> {
    return this.request(`/api/products/${id}`);
  }

  // Staking endpoints
  async getStakingPools(): Promise<StakingPool[]> {
    return this.request('/api/staking/pools');
  }

  async stakeTokens(walletAddress: string, amount: number, poolId: number) {
    return this.request('/api/staking/stake', {
      method: 'POST',
      body: JSON.stringify({
        wallet_address: walletAddress,
        amount,
        pool_id: poolId,
        action: 'stake'
      }),
    });
  }

  async unstakeTokens(walletAddress: string, amount: number, poolId: number) {
    return this.request('/api/staking/unstake', {
      method: 'POST',
      body: JSON.stringify({
        wallet_address: walletAddress,
        amount,
        pool_id: poolId,
        action: 'unstake'
      }),
    });
  }

  // Governance endpoints
  async getGovernanceProposals(): Promise<GovernanceProposal[]> {
    return this.request('/api/governance/proposals');
  }

  async voteOnProposal(walletAddress: string, proposalId: number, voteChoice: string, weedAmount: number) {
    return this.request('/api/governance/vote', {
      method: 'POST',
      body: JSON.stringify({
        wallet_address: walletAddress,
        proposal_id: proposalId,
        vote_choice: voteChoice,
        weed_amount: weedAmount
      }),
    });
  }

  // Wallet endpoints
  async getWalletInfo(address: string): Promise<WalletInfo> {
    return this.request(`/api/wallet/${address}`);
  }

  // Prize endpoints
  async spinForPrize(walletAddress: string) {
    return this.request('/api/prizes/spin', {
      method: 'POST',
      body: JSON.stringify({ wallet_address: walletAddress }),
    });
  }

  async getPrizeWinners() {
    return this.request('/api/prizes/winners');
  }
}

// Export default instance
export const cbdGoldAPI = new CBDGoldAPI(
  process.env.VITE_API_URL || 'http://localhost:8000'
);
'''
        
        # Write API client to frontend
        api_client_file = self.frontend_dir / "services" / "cbdGoldAPI.ts"
        if api_client_file.parent.exists():
            api_client_file.write_text(api_client_content)
            print("✅ TypeScript API client generated")
        else:
            print("⚠️  Frontend services directory not found")
    
    def run_integration(self):
        """Run full integration process"""
        print("🚀 Starting CBD Gold Integration Process...")
        print(f"📂 Backend dir: {self.backend_dir}")
        print(f"📂 Frontend dir: {self.frontend_dir}")
        
        # Create directories if they don't exist
        os.makedirs(self.frontend_dir / "data", exist_ok=True)
        os.makedirs(self.frontend_dir / "services", exist_ok=True)
        
        # Run integration steps
        self.sync_product_data()
        self.generate_api_client()
        
        print("\n✅ Integration completed successfully!")
        print("\n📋 Next steps:")
        print("1. Start the Python backend: python quickstart.py")
        print("2. Update your React frontend to use the new API client")
        print("3. Test the integration")

def main():
    integration = CBDGoldIntegration()
    integration.run_integration()

if __name__ == "__main__":
    main()