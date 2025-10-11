import React from 'react';
import FeatherIcon from '../FeatherIcon';

const socialLinks = [
  { icon: 'twitter', label: 'X (Twitter)', href: 'https://x.com/cbdgolduk?s=21' },
  { icon: 'instagram', label: 'Instagram', href: 'https://www.instagram.com/cbdgold' },
  { icon: 'youtube', label: 'YouTube', href: 'https://youtube.com/@cbdgold' },
  { icon: 'send', label: 'Telegram', href: 'https://t.me/CBDVault_bot' },
  { icon: 'github', label: 'GitHub', href: 'https://github.com/cbdgold' }
];

const partnerLinks = [
  { label: 'CBD Gold® eShop', href: 'https://cbdgold.life' },
  { label: 'CBD Gold Wallet (OptoPay)', href: 'https://www.optopay.me/cbdgold' },
  { label: 'CBDGold Web3', href: 'https://cbdgold.io' },
  { label: 'THC Life', href: 'https://www.thc.life/' }
];

const legalLinks = [
  { label: 'Terms of Service', href: 'https://www.optopay.me/cbdgold#card-x02m43fm0rfqu7x' },
  { label: 'Privacy Policy', href: 'https://app.nf.domains/terms' },
  { label: 'Certificates of Analysis', href: 'https://cbdgold.life/#coa' }
];

const complianceItems = [
  'Not for sale to persons under 18',
  'Contains < 0.2% THC, verified via COA',
  'Consult a healthcare professional before use',
  'Consume responsibly and keep out of reach of children'
];

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-950 text-white mt-12 border-t border-white/5">
      <div className="container mx-auto px-4 py-12 space-y-10">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3">
            <h3 className="text-lg font-bold tracking-wide">CBD Gold® ShopFi</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Hemp innovation powered by Algorand. Crafted in Brighton, UK with an 11% giveback pledge to local good.
              Pure cannabinoid vapes, dual-token ShopFi, and verified crypto settlement rails.
            </p>
            <div className="space-y-1 text-sm text-gray-400">
              <p>Email: <a className="hover:text-green-400 transition" href="mailto:info@cbdgold.life">info@cbdgold.life</a></p>
              <p>SMS / WhatsApp: <a className="hover:text-green-400 transition" href="sms:+447778420007">+44 7778 420 007</a></p>
              <p className="text-xs text-gray-500">Customer support available 7 days a week.</p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold uppercase tracking-wide text-sm mb-3 text-gray-300">Destinations</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              {partnerLinks.map(link => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="hover:text-green-400 transition flex items-center gap-2"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FeatherIcon icon="external-link" className="w-3 h-3" />
                    <span>{link.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold uppercase tracking-wide text-sm mb-3 text-gray-300">Legal & Compliance</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              {legalLinks.map(link => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="hover:text-green-400 transition"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
            <ul className="mt-4 space-y-1 text-xs text-gray-500">
              {complianceItems.map(item => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-1 inline-block w-1.5 h-1.5 rounded-full bg-green-400" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold uppercase tracking-wide text-sm mb-3 text-gray-300">Connect</h4>
            <div className="flex flex-wrap gap-3">
              {socialLinks.map(link => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-gray-400 hover:text-green-400 transition flex items-center gap-2 text-sm"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/10">
                    <FeatherIcon icon={link.icon} className="w-4 h-4" />
                  </span>
                  <span>{link.label}</span>
                </a>
              ))}
            </div>
            <div className="mt-5 text-xs text-gray-500 space-y-1">
              <p>Verified Algorand settlement address:</p>
              <p className="font-mono text-[11px] text-green-300 break-all">FDM4XDLMOV7CZ5AM3U6WVHMGDWO3M75HLIFCCMYPSP7YZW32SAIFSFHZPA</p>
              <p>Use order number as memo when sending USDC / ALGO / HEMP.</p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 text-sm text-gray-500 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <p>© {new Date().getFullYear()} CBD Gold®. All rights reserved. Made by the sea in Brighton, UK.</p>
          <p className="text-xs md:text-sm text-gray-500">11% of profits return to community health initiatives. Verified crypto settlement via OptoPay.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
