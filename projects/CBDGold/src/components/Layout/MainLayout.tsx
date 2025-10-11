import React, { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex flex-col">
      <div className="container mx-auto px-4 pt-6">
        <Header />
      </div>
      <main className="container mx-auto flex-1 pt-2 pb-8 px-4">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
