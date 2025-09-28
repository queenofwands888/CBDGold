import React, { ReactNode } from 'react';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <main className="container mx-auto pt-4 pb-8 px-4">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
