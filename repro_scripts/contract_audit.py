# contract_audit.py
# Python script to check deployed Algorand contracts for basic security and config
# Usage: python3 contract_audit.py

import os
from algosdk.v2client import algod
from algosdk import mnemonic

ALGOD_ADDRESS = os.getenv('ALGOD_ADDRESS', 'https://testnet-api.algonode.cloud')
ALGOD_TOKEN = os.getenv('ALGOD_TOKEN', '')
APP_IDS = os.getenv('APP_IDS', '').split(',')  # comma-separated list

algod_client = algod.AlgodClient(ALGOD_TOKEN, ALGOD_ADDRESS)

def log_result(msg):
    print(msg)
    with open('../test_results.log', 'a') as f:
        f.write(msg + '\n')

def check_app(app_id):
    try:
        app = algod_client.application_info(int(app_id))
        log_result(f"[OK] App {app_id} found. Creator: {app['params']['creator']}")
    except Exception as e:
        log_result(f"[FAIL] App {app_id}: {e}")

if __name__ == '__main__':
    for app_id in APP_IDS:
        if app_id:
            check_app(app_id)
