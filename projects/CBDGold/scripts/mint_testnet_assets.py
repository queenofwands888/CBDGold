#!/usr/bin/env python3
"""Minimal helper to mint HEMP and WEED ASAs on Algorand TestNet."""

from __future__ import annotations

import os
import sys
from dataclasses import dataclass
from typing import Iterable

from algosdk import account
from algosdk import mnemonic
from algosdk import transaction
from algosdk.v2client import algod

ALGOD_SERVER = os.getenv("ALGOD_SERVER", "https://testnet-api.algonode.cloud")
ALGOD_PORT = os.getenv("ALGOD_PORT", "")
ALGOD_TOKEN = os.getenv("ALGOD_TOKEN", "")
ASA_MANAGER_MNEMONIC = os.getenv("ASA_MANAGER_MNEMONIC")

if not ASA_MANAGER_MNEMONIC:
    sys.exit("Set ASA_MANAGER_MNEMONIC in your environment before running this script.")

MANAGER_PRIVATE_KEY = mnemonic.to_private_key(ASA_MANAGER_MNEMONIC)
MANAGER_ADDRESS = account.address_from_private_key(MANAGER_PRIVATE_KEY)

HEADERS = {"X-Algo-API-Token": ALGOD_TOKEN}
client = algod.AlgodClient(ALGOD_TOKEN, ALGOD_SERVER, headers=HEADERS)


@dataclass(frozen=True)
class AssetSpec:
    name: str
    unit: str
    total: int
    decimals: int
    url: str | None = None


ASSET_SPECS: Iterable[AssetSpec] = (
    AssetSpec("CBD Gold HEMP", "HEMP", 1_000_000_000, 0, "https://cbdgold.life/hemp"),
    AssetSpec("CBD Gold WEED", "WEED", 1_000_000_000_000, 6, "https://cbdgold.life/weed"),
)


def mint_asset(spec: AssetSpec) -> int:
    params = client.suggested_params()
    txn = transaction.AssetConfigTxn(
        sender=MANAGER_ADDRESS,
        sp=params,
        total=spec.total,
        decimals=spec.decimals,
        unit_name=spec.unit,
        asset_name=spec.name,
        manager=MANAGER_ADDRESS,
        reserve=MANAGER_ADDRESS,
        freeze=MANAGER_ADDRESS,
        clawback=MANAGER_ADDRESS,
        default_frozen=False,
        url=spec.url,
    )
    signed = txn.sign(MANAGER_PRIVATE_KEY)
    txid = client.send_transaction(signed)
    transaction.wait_for_confirmation(client, txid, 4)
    pending = client.pending_transaction_info(txid)
    asset_id = pending.get("asset-index")
    if not asset_id:
        raise RuntimeError(f"Mint failed for {spec.unit}; tx {txid}")
    return asset_id


def main() -> None:
    print(f"Minting ASAs with manager {MANAGER_ADDRESS} on {ALGOD_SERVER}")
    minted: dict[str, int] = {}
    for spec in ASSET_SPECS:
        asset_id = mint_asset(spec)
        minted[spec.unit] = asset_id
        print(f"Created {spec.unit} ({spec.name}) with id {asset_id}")
    print("\nUpdate .env and src/data/constants.ts with the new asset ids:")
    for unit, asset_id in minted.items():
        print(f"  VITE_{unit}_ASA_ID={asset_id}")


if __name__ == "__main__":
    main()
