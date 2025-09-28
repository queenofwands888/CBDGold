#!/usr/bin/env python3
"""
CBD Gold Smart Contract Deployment Script
Deploys CBDGoldStaking, CBDGoldGovernance, and CBDGoldPrize contracts to Algorand TestNet
"""

import os
import sys
import json
import time
from pathlib import Path
from typing import Dict, Any, Optional
from algosdk.v2client import algod
from algosdk import account, mnemonic, transaction
import pyteal as pt

# Add contracts directory to Python path
project_root = Path(__file__).parent.parent
contracts_path = project_root / "contracts"
sys.path.append(str(contracts_path))

class ContractDeployer:
    def __init__(self):
        # Algorand TestNet configuration
        self.algod_address = "https://testnet-api.algonode.cloud"
        self.algod_token = ""
        self.algod_client = algod.AlgodClient(self.algod_token, self.algod_address)
        
        # Deployment account (will be generated)
        self.deployer_private_key: Optional[str] = None
        self.deployer_address: Optional[str] = None
        
    def setup_deployer_account(self):
        """Generate or load deployer account"""
        print("🔐 Setting up deployer account...")
        
        # Generate new account
        private_key, address = account.generate_account()
        self.deployer_private_key = private_key
        self.deployer_address = address
        
        print(f"📍 Deployer Address: {address}")
        print(f"💰 Fund this address with TestNet ALGOs: https://testnet.algoexplorer.io/dispenser")
        print(f"   You need at least 0.5 ALGO for contract deployments")
        
        # Wait for user to fund the account
        input("\n⏸️  Press Enter after funding the account...")
        
        # Check balance
        try:
            account_info = self.algod_client.account_information(address)
            balance = account_info['amount'] / 1_000_000  # Convert microAlgos to Algos
            
            print(f"💰 Current balance: {balance:.6f} ALGO")
            
            if balance < 0.5:
                print("❌ Insufficient balance! Please fund the account and try again.")
                sys.exit(1)
                
            print("✅ Account funded successfully")
        except Exception as e:
            print(f"❌ Error checking account balance: {e}")
            print("Continuing anyway...")
        
    def compile_contract(self, name: str, approval_program, clear_program) -> Dict[str, Any]:
        """Compile PyTeal contract to TEAL bytecode"""
        print(f"🔧 Compiling {name} contract...")
        
        try:
            # Compile approval program
            approval_teal = pt.compileTeal(approval_program(), pt.Mode.Application, version=8)
            approval_result = self.algod_client.compile(approval_teal)
            
            # Compile clear state program
            clear_teal = pt.compileTeal(clear_program(), pt.Mode.Application, version=8)
            clear_result = self.algod_client.compile(clear_teal)
            
            contract_info = {
                'name': name,
                'approval_program': approval_result['result'],
                'clear_program': clear_result['result'],
                'approval_teal': approval_teal,
                'clear_teal': clear_teal
            }
            
            print(f"✅ {name} compiled successfully")
            return contract_info
            
        except Exception as e:
            print(f"❌ Error compiling {name}: {e}")
            raise
    
    def deploy_contract(self, contract_info: Dict[str, Any]) -> int:
        """Deploy compiled contract to Algorand TestNet"""
        name = contract_info['name']
        print(f"🚀 Deploying {name} to TestNet...")
        
        try:
            # Get suggested parameters
            sp = self.algod_client.suggested_params()
            
            # Create application transaction
            txn = transaction.ApplicationCreateTxn(
                sender=self.deployer_address,
                sp=sp,
                on_complete=transaction.OnComplete.NoOpOC,
                approval_program=bytes.fromhex(contract_info['approval_program']),
                clear_program=bytes.fromhex(contract_info['clear_program']),
                global_schema=transaction.StateSchema(num_uints=64, num_byte_slices=16),
                local_schema=transaction.StateSchema(num_uints=16, num_byte_slices=16),
            )
            
            # Sign transaction
            signed_txn = txn.sign(self.deployer_private_key)
            
            # Submit transaction
            tx_id = self.algod_client.send_transaction(signed_txn)
            print(f"📤 Transaction submitted: {tx_id}")
            
            # Wait for confirmation
            confirmed_txn = transaction.wait_for_confirmation(self.algod_client, tx_id, 4)
            app_id = confirmed_txn['application-index']
            
            print(f"✅ {name} deployed successfully!")
            print(f"   App ID: {app_id}")
            print(f"   Transaction ID: {tx_id}")
            
            return app_id
            
        except Exception as e:
            print(f"❌ Error deploying {name}: {e}")
            raise
    
    def save_deployment_config(self, deployment_data: Dict[str, Any]):
        """Save deployment configuration to JSON file"""
        config_path = project_root / "deployment.json"
        
        print(f"📄 Saving deployment configuration to {config_path}")
        
        with open(config_path, 'w') as f:
            json.dump(deployment_data, f, indent=2)
            
        print("✅ Deployment configuration saved")
    
    def deploy_all_contracts(self):
        """Deploy all CBD Gold smart contracts"""
        print("\n🌟 Starting CBD Gold contract deployment")
        print("=" * 50)
        
        # Setup deployer account
        self.setup_deployer_account()
        
        deployed_contracts = {}
        
        try:
            # Import and compile CBDGoldStaking
            print("\n📦 Processing CBDGoldStaking...")
            from CBDGoldStaking.staking_contract import approval_program as staking_approval, clear_state_program as staking_clear
            staking_info = self.compile_contract("CBDGoldStaking", staking_approval, staking_clear)
            staking_app_id = self.deploy_contract(staking_info)
            deployed_contracts['CBDGoldStaking'] = {
                'app_id': staking_app_id,
                'name': 'CBDGoldStaking',
                'description': 'HEMP token staking with reward tiers'
            }
            
            # Import and compile CBDGoldGovernance  
            print("\n📦 Processing CBDGoldGovernance...")
            from CBDGoldGovernance.governance_contract import approval_program as gov_approval, clear_state_program as gov_clear
            governance_info = self.compile_contract("CBDGoldGovernance", gov_approval, gov_clear)
            governance_app_id = self.deploy_contract(governance_info)
            deployed_contracts['CBDGoldGovernance'] = {
                'app_id': governance_app_id,
                'name': 'CBDGoldGovernance', 
                'description': 'WEED token governance and voting'
            }
            
            # Import and compile CBDGoldPrize
            print("\n📦 Processing CBDGoldPrize...")
            from CBDGoldPrize.prize_contract import approval_program as prize_approval, clear_state_program as prize_clear
            prize_info = self.compile_contract("CBDGoldPrize", prize_approval, prize_clear)
            prize_app_id = self.deploy_contract(prize_info)
            deployed_contracts['CBDGoldPrize'] = {
                'app_id': prize_app_id,
                'name': 'CBDGoldPrize',
                'description': 'Prize distribution and NFT rewards'
            }
            
            # Create deployment summary
            deployment_data = {
                'deployment_timestamp': int(time.time()),
                'deployer_address': self.deployer_address,
                'network': 'testnet',
                'contracts': deployed_contracts,
                'asset_ids': {
                    'HEMP': 2675148574,
                    'WEED': 2676316280,
                    'USDC': 31566704
                },
                'network_config': {
                    'algod_server': self.algod_address,
                    'explorer': 'https://testnet.algoexplorer.io'
                }
            }
            
            # Save deployment configuration
            self.save_deployment_config(deployment_data)
            
            # Print deployment summary
            print("\n" + "=" * 60)
            print("🎉 ALL CONTRACTS DEPLOYED SUCCESSFULLY!")
            print("=" * 60)
            print(f"🌐 Network: Algorand TestNet")
            print(f"👤 Deployer: {self.deployer_address}")
            print(f"📅 Timestamp: {time.ctime()}")
            print("\n📋 Contract Summary:")
            print("-" * 40)
            
            for name, info in deployed_contracts.items():
                print(f"  {name}:")
                print(f"    App ID: {info['app_id']}")
                print(f"    Description: {info['description']}")
                print(f"    Explorer: https://testnet.algoexplorer.io/application/{info['app_id']}")
                print()
            
            print("🔗 Next Steps:")
            print("1. Update your frontend configuration with these App IDs")
            print("2. Test contract interactions on TestNet")
            print("3. Verify contracts on AlgoExplorer")
            
            return deployment_data
            
        except ImportError as e:
            print(f"❌ Contract import error: {e}")
            print("Make sure all contract modules are in the contracts/ directory")
            sys.exit(1)
        except Exception as e:
            print(f"❌ Deployment failed: {e}")
            sys.exit(1)

def main():
    """Main deployment function"""
    print("🌿 CBD Gold Smart Contract Deployer")
    print("=" * 40)
    print("📡 Target Network: Algorand TestNet")
    print("📁 Project Root:", project_root)
    
    # Verify contract files exist
    required_contracts = [
        "CBDGoldStaking/staking_contract.py",
        "CBDGoldGovernance/governance_contract.py", 
        "CBDGoldPrize/prize_contract.py"
    ]
    
    print("\n🔍 Checking contract files...")
    missing_files = []
    for contract_file in required_contracts:
        contract_path = contracts_path / contract_file
        if contract_path.exists():
            print(f"✅ {contract_file}")
        else:
            print(f"❌ {contract_file}")
            missing_files.append(contract_file)
    
    if missing_files:
        print(f"\n❌ Missing contract files: {missing_files}")
        print("Please ensure all contract files exist before deployment.")
        sys.exit(1)
    
    # Start deployment
    deployer = ContractDeployer()
    deployment_result = deployer.deploy_all_contracts()
    
    print(f"\n✨ Deployment completed successfully!")
    print(f"📄 Configuration saved to: {project_root}/deployment.json")

if __name__ == "__main__":
    main()
