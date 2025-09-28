#!/usr/bin/env python3
"""
CBD Gold Deployment Diagnostic Script
"""

import os
import sys
from pathlib import Path
from algosdk.v2client import algod
from algosdk import account

# Add contracts directory to Python path
project_root = Path(__file__).parent.parent
contracts_path = project_root / "contracts"
sys.path.append(str(contracts_path))

print("🔍 CBD Gold Deployment Diagnostics")
print("=" * 40)
print(f"📁 Project Root: {project_root}")
print(f"📁 Contracts Path: {contracts_path}")
print(f"🐍 Python Path: {sys.path}")

# Test 1: Check contract files exist
print("\n1️⃣ Testing Contract Files...")
required_files = [
    "CBDGoldStaking/staking_contract.py",
    "CBDGoldGovernance/governance_contract.py", 
    "CBDGoldPrize/prize_contract.py"
]

for file in required_files:
    file_path = contracts_path / file
    if file_path.exists():
        print(f"✅ {file}")
    else:
        print(f"❌ {file} - NOT FOUND")

# Test 2: Test contract imports
print("\n2️⃣ Testing Contract Imports...")
try:
    from CBDGoldStaking.staking_contract import approval_program as staking_approval, clear_state_program as staking_clear
    print("✅ CBDGoldStaking import successful")
    
    # Test if functions are callable
    try:
        result = staking_approval()
        print("✅ CBDGoldStaking approval_program callable")
    except Exception as e:
        print(f"❌ CBDGoldStaking approval_program error: {e}")
        
except Exception as e:
    print(f"❌ CBDGoldStaking import failed: {e}")

try:
    from CBDGoldGovernance.governance_contract import approval_program as gov_approval, clear_state_program as gov_clear
    print("✅ CBDGoldGovernance import successful")
except Exception as e:
    print(f"❌ CBDGoldGovernance import failed: {e}")

try:
    from CBDGoldPrize.prize_contract import approval_program as prize_approval, clear_state_program as prize_clear
    print("✅ CBDGoldPrize import successful")
except Exception as e:
    print(f"❌ CBDGoldPrize import failed: {e}")

# Test 3: Test Algorand connection
print("\n3️⃣ Testing Algorand Connection...")
try:
    algod_client = algod.AlgodClient("", "https://testnet-api.algonode.cloud")
    status = algod_client.status()
    print(f"✅ Connected to Algorand TestNet")
    print(f"   Last Round: {status.get('last-round', 'Unknown')}")
except Exception as e:
    print(f"❌ Algorand connection failed: {e}")

# Test 4: Test account generation
print("\n4️⃣ Testing Account Generation...")
try:
    private_key, address = account.generate_account()
    print(f"✅ Account generation successful")
    print(f"   Address: {address}")
    print(f"   Address Length: {len(address)}")
except Exception as e:
    print(f"❌ Account generation failed: {e}")

print("\n" + "=" * 40)
print("📋 Diagnostic Complete")
