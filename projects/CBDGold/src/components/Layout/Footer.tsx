import React from 'react';
import FeatherIcon from '../FeatherIcon';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white py-8 mt-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">ShopFi</h3>
            <p className="text-gray-400 text-sm">Hemp Innovation powered by CBD Gold & Algorand</p>
          </div>
          <div>
            <h4 className="font-bold mb-4">Products</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><a href="#" className="hover:text-green-400 transition">CBD Gold Vapes</a></li>
              <li><a href="#" className="hover:text-green-400 transition">ShopFi Staking</a></li>
              <li><a href="#" className="hover:text-green-400 transition">Governance</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Resources</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><a href="#" className="hover:text-green-400 transition">Whitepaper</a></li>
              <li><a href="#" className="hover:text-green-400 transition">Tokenomics</a></li>
              <li><a href="#" className="hover:text-green-400 transition">FAQ</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Connect</h4>
            <div className="flex space-x-4">
              {['twitter','instagram','discord','github'].map(icon => (
                <a key={icon} href="#" className="text-gray-400 hover:text-green-400 transition"><FeatherIcon icon={icon} /></a>
              ))}
            </div>
            <div className="mt-4 text-sm text-gray-400">
              <p>support@cbdgold.com</p>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-gray-500">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p>© 2025 CBD Gold ShopFi. All rights reserved.</p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a href="#" className="hover:text-green-400 transition">Terms</a>
              <a href="#" className="hover:text-green-400 transition">Privacy</a>
              <a href="#" className="hover:text-green-400 transition">Compliance</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
