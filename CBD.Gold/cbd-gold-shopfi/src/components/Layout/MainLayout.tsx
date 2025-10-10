
import React from 'react';
import type { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => (
  <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
    <Header />
    <main className="container mx-auto pt-4 pb-8 px-4">
      {children}
    </main>
    <Footer />
  </div>
);

export default MainLayout;
