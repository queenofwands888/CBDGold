#!/usr/bin/env python3
"""
Quick start script for CBD Gold ShopFi Python Backend
This script helps you quickly test and start the backend services
"""

import sys
import subprocess
import os
from pathlib import Path

def print_header(text):
    print("\n" + "="*60)
    print(f"  {text}")
    print("="*60)

def print_step(step, text):
    print(f"\n{step}. {text}")

def run_command(cmd, cwd=None):
    """Run a command and return success status"""
    try:
        result = subprocess.run(cmd, shell=True, cwd=cwd, capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ Success: {cmd}")
            return True
        else:
            print(f"❌ Failed: {cmd}")
            print(f"Error: {result.stderr}")
            return False
    except Exception as e:
        print(f"❌ Exception running {cmd}: {e}")
        return False

def main():
    print_header("CBD Gold ShopFi Python Backend - Quick Start")

    # Check if we're in the right directory
    backend_dir = Path(__file__).parent
    os.chdir(backend_dir)

    print(f"📂 Working directory: {backend_dir}")
    print(f"🐍 Python executable: {sys.executable}")

    print_step(1, "Testing Python Environment")

    # Test imports
    packages_to_test = [
        ("fastapi", "FastAPI"),
        ("uvicorn", "Uvicorn"),
        ("algosdk", "Algorand SDK"),
        ("pyteal", "PyTeal"),
        ("pydantic", "Pydantic"),
        ("aiohttp", "aiohttp"),
        ("gradio", "Gradio")
    ]

    all_imports_ok = True
    for package, name in packages_to_test:
        try:
            __import__(package)
            print(f"✅ {name} is available")
        except ImportError:
            print(f"❌ {name} is NOT available")
            all_imports_ok = False

    if not all_imports_ok:
        print("\n⚠️  Some packages are missing. Installing...")
        if run_command(f"{sys.executable} -m pip install -r requirements.txt"):
            print("✅ Packages installed successfully")
        else:
            print("❌ Failed to install packages")
            return

    print_step(2, "Setting up environment")

    # Check for .env file
    if not Path(".env").exists():
        if Path(".env.example").exists():
            print("📋 Copying .env.example to .env")
            run_command("cp .env.example .env")
        else:
            print("⚠️  No .env file found. Creating basic configuration...")
            with open(".env", "w") as f:
                f.write("""# CBD Gold ShopFi Configuration
HOST=0.0.0.0
PORT=8000
DEBUG=true
ENVIRONMENT=development
LOG_LEVEL=INFO

# Algorand TestNet
ALGORAND_NETWORK=testnet
ALGOD_SERVER=https://testnet-api.algonode.cloud
INDEXER_SERVER=https://testnet-idx.algonode.cloud

# Asset IDs (TestNet)
HEMP_ASSET_ID=2675148574
WEED_ASSET_ID=2676316280
USDC_ASSET_ID=31566704
""")
    else:
        print("✅ .env file already exists")

    print_step(3, "Testing API Server")

    print("🚀 Starting FastAPI server in test mode...")
    print("📍 Server will be available at: http://localhost:8000")
    print("📚 API docs will be at: http://localhost:8000/api/docs")
    print("🏥 Health check: http://localhost:8000/health")

    print("\n" + "-"*60)
    print("Choose an option:")
    print("1. Start the server (development mode with auto-reload)")
    print("2. Run API tests only")
    print("3. Quick health check")
    print("4. Exit")
    print("-"*60)

    choice = input("Enter your choice (1-4): ").strip()

    if choice == "1":
        print("\n🚀 Starting development server...")
        print("💡 Press Ctrl+C to stop the server")
        try:
            # Use uvicorn directly for development
            cmd = f"{sys.executable} -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload"
            subprocess.run(cmd, shell=True)
        except KeyboardInterrupt:
            print("\n👋 Server stopped by user")

    elif choice == "2":
        print("\n🧪 Running API tests...")
        if run_command(f"{sys.executable} test_api.py"):
            print("✅ All tests completed")
        else:
            print("⚠️  Some tests may have failed")

    elif choice == "3":
        print("\n🏥 Performing quick health check...")
        try:
            import aiohttp
            import asyncio

            async def health_check():
                try:
                    async with aiohttp.ClientSession() as session:
                        async with session.get("http://localhost:8000/health", timeout=5) as response:
                            if response.status == 200:
                                data = await response.json()
                                print("✅ Server is healthy!")
                                print(f"   Status: {data.get('status')}")
                                print(f"   Version: {data.get('version')}")
                                return True
                            else:
                                print(f"❌ Server returned status {response.status}")
                                return False
                except aiohttp.ClientConnectorError:
                    print("❌ Cannot connect to server. Is it running?")
                    return False
                except Exception as e:
                    print(f"❌ Health check failed: {e}")
                    return False

            # Try health check
            if not asyncio.run(health_check()):
                print("\n💡 To start the server, run:")
                print(f"   {sys.executable} start.py")

        except ImportError:
            print("❌ Cannot perform health check (aiohttp not available)")

    elif choice == "4":
        print("\n👋 Goodbye!")
        return

    else:
        print("❌ Invalid choice. Please run the script again.")

    print("\n" + "="*60)
    print("📚 Useful commands:")
    print(f"   Start server: {sys.executable} start.py")
    print(f"   Run tests: {sys.executable} test_api.py")
    print("   View docs: http://localhost:8000/api/docs")
    print("   Health check: http://localhost:8000/health")
    print("="*60)

if __name__ == "__main__":
    main()
