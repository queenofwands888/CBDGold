import React, { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen text-white flex flex-col">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4">
        <Header />
      </div>
      <main className="container mx-auto flex-1 px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
