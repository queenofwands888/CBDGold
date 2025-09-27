import algosdk from 'algosdk';

// Replace with your actual NFT/ASA prize asset ID(s)
const PRIZE_ASSET_IDS = [123456789];

/**
 * Checks if the user owns at least one unit of any prize NFT/ASA.
 * @param address Algorand address
 * @param algodClient Algodv2 client
 * @returns Promise<boolean>
 */
export async function hasPrizeToClaim(address: string, algodClient: algosdk.Algodv2): Promise<boolean> {
  if (!address) return false;
  try {
    const accountInfo = await algodClient.accountInformation(address).do();
    if (!accountInfo.assets) return false;
    for (const asset of accountInfo.assets) {
      if (PRIZE_ASSET_IDS.includes(Number(asset.assetId)) && asset.amount > 0) {
        return true;
      }
    }
    return false;
  } catch (e) {
    console.error('Error checking prize ownership:', e);
    return false;
  }
}
