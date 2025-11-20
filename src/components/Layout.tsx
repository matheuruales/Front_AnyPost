import React from 'react';
import Navbar from './Navbar';

interface LayoutProps {
  children: React.ReactNode;
  hideNavbar?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, hideNavbar = false }) => {
  const mainPadding = hideNavbar ? '' : 'pt-16 sm:pt-20';

  return (
    <div className="min-h-screen bg-black grid-pattern">
      {!hideNavbar && <Navbar />}
      <main className={`fade-in ${mainPadding}`}>{children}</main>
      
      {/* Footer */}
      <footer className="border-t border-gray-800 mt-12 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded bg-gradient-to-r from-blue-600 to-purple-600"></div>
              <span className="text-gray-400">AnyPost © 2023</span>
            </div>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Terms
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Privacy
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
