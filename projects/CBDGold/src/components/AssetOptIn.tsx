import React from 'react';

interface AssetOptInProps {
  assetId: number;
  assetName: string;
  onOptIn: () => void;
  optedIn: boolean;
}

const AssetOptIn: React.FC<AssetOptInProps> = ({ assetId, assetName, onOptIn, optedIn }) => {
  return (
    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
      <p>
        You must opt-in to the <b>{assetName}</b> asset (ID: {assetId}) in your Algorand wallet to use all features.
      </p>
      {!optedIn && (
        <button
          className="mt-2 px-4 py-2 bg-yellow-500 text-white rounded"
          onClick={onOptIn}
        >
          Opt-In Now
        </button>
      )}
      {optedIn && <span className="ml-2 text-green-600 font-bold">Opted In</span>}
    </div>
  );
};

export default AssetOptIn;
