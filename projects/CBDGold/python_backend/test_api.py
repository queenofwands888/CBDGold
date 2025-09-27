#!/usr/bin/env python3
"""Simple API test script for CBD Gold ShopFi Backend"""

import asyncio
import aiohttp
import json
from typing import Dict, Any

API_BASE_URL = "http://localhost:8000"

class APITester:
    def __init__(self, base_url: str = API_BASE_URL):
        self.base_url = base_url
        self.session = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def test_health(self) -> Dict[str, Any]:
        """Test health endpoint"""
        async with self.session.get(f"{self.base_url}/health") as response:
            return {
                "status": response.status,
                "data": await response.json() if response.status == 200 else await response.text()
            }
    
    async def test_prices(self) -> Dict[str, Any]:
        """Test prices endpoint"""
        async with self.session.get(f"{self.base_url}/api/prices") as response:
            return {
                "status": response.status,
                "data": await response.json() if response.status == 200 else await response.text()
            }
    
    async def test_products(self) -> Dict[str, Any]:
        """Test products endpoint"""
        async with self.session.get(f"{self.base_url}/api/products") as response:
            return {
                "status": response.status,
                "data": await response.json() if response.status == 200 else await response.text()
            }
    
    async def test_staking_pools(self) -> Dict[str, Any]:
        """Test staking pools endpoint"""
        async with self.session.get(f"{self.base_url}/api/staking/pools") as response:
            return {
                "status": response.status,
                "data": await response.json() if response.status == 200 else await response.text()
            }
    
    async def test_governance_proposals(self) -> Dict[str, Any]:
        """Test governance proposals endpoint"""
        async with self.session.get(f"{self.base_url}/api/governance/proposals") as response:
            return {
                "status": response.status,
                "data": await response.json() if response.status == 200 else await response.text()
            }
    
    async def test_wallet_info(self, address: str = "TESTADDRESS123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ234567890") -> Dict[str, Any]:
        """Test wallet info endpoint"""
        async with self.session.get(f"{self.base_url}/api/wallet/{address}") as response:
            return {
                "status": response.status,
                "data": await response.json() if response.status == 200 else await response.text()
            }
    
    async def run_all_tests(self):
        """Run all API tests"""
        tests = [
            ("Health Check", self.test_health),
            ("Token Prices", self.test_prices),
            ("Products", self.test_products),
            ("Staking Pools", self.test_staking_pools),
            ("Governance Proposals", self.test_governance_proposals),
            ("Wallet Info", self.test_wallet_info),
        ]
        
        print(f"Testing API at {self.base_url}")
        print("=" * 50)
        
        for test_name, test_func in tests:
            try:
                result = await test_func()
                status = "✅ PASS" if result["status"] == 200 else "❌ FAIL"
                print(f"{test_name}: {status} (Status: {result['status']})")
                
                if result["status"] != 200:
                    print(f"  Error: {result['data']}")
                elif isinstance(result["data"], dict) and "status" in result["data"]:
                    print(f"  Response: {result['data']['status']}")
                    
            except Exception as e:
                print(f"{test_name}: ❌ ERROR - {str(e)}")
            
            print()

async def main():
    """Main test function"""
    try:
        async with APITester() as tester:
            await tester.run_all_tests()
    except Exception as e:
        print(f"Test runner error: {e}")
        print("Make sure the API server is running on http://localhost:8000")

if __name__ == "__main__":
    asyncio.run(main())