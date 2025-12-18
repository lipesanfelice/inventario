import React from 'react';
import { LayoutDashboard, History, FolderKanban, Menu } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const MobileNav: React.FC = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = React.useState(false);

  const isActive = (path: string) => {
    return location.pathname === path ? 'bg-brand-50 text-brand-600' : 'text-slate-600 hover:bg-slate-50';
  };

  return (
    <div className="md:hidden">
      {/* Top Bar */}
      <div className="bg-slate-900 text-white p-4 flex justify-between items-center sticky top-0 z-50 shadow-md">
        <h1 className="font-bold">Inventário Local</h1>
        <button onClick={() => setIsOpen(!isOpen)} className="p-2">
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="bg-white shadow-lg border-b border-gray-200 absolute w-full z-40">
          <nav className="flex flex-col p-2">
            <Link 
              to="/" 
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium ${isActive('/')}`}
            >
              <LayoutDashboard className="w-5 h-5" />
              Registro
            </Link>
            <Link 
              to="/history" 
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium ${isActive('/history')}`}
            >
              <History className="w-5 h-5" />
              Histórico
            </Link>
            <Link 
              to="/sectors" 
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium ${isActive('/sectors')}`}
            >
              <FolderKanban className="w-5 h-5" />
              Setores
            </Link>
          </nav>
        </div>
      )}
    </div>
  );
};

export default MobileNav;
