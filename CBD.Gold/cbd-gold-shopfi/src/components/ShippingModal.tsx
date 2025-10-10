import React from 'react';
import Modal from './common/Modal';
import ClaimPrize from './ClaimPrize';

interface ShippingModalProps {
  open: boolean;
  onClose: () => void;
  userAddress: string;
  productName: string;
  onClaimed?: () => void;
}

const ShippingModal: React.FC<ShippingModalProps> = ({ open, onClose, userAddress, productName, onClaimed }) => {
  // For now, reuse ClaimPrize for shipping address and QR code UX
  // In production, you may want a dedicated endpoint for product shipping
  return (
    <Modal open={open} onClose={onClose} title={`Shipping for ${productName}`}>
      <ClaimPrize userAddress={userAddress} prizeId={productName} onClaimed={onClaimed} />
    </Modal>
  );
};

export default ShippingModal;
