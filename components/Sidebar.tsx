import React from 'react';
import { LayoutDashboard, History, FolderKanban, Package } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path ? 'bg-brand-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white';
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-slate-900 text-white shadow-xl hidden md:flex flex-col z-50">
      <div className="p-6 border-b border-slate-700 flex items-center gap-3">
        <Package className="w-8 h-8 text-brand-500" />
        <div>
          <h1 className="text-xl font-bold tracking-tight">Inventário</h1>
          <p className="text-xs text-slate-400">Sistema Local</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        <Link to="/" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium ${isActive('/')}`}>
          <LayoutDashboard className="w-5 h-5" />
          Registro (Início)
        </Link>

        <Link to="/history" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium ${isActive('/history')}`}>
          <History className="w-5 h-5" />
          Histórico
        </Link>

        <Link to="/sectors" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium ${isActive('/sectors')}`}>
          <FolderKanban className="w-5 h-5" />
          Setores
        </Link>
      </nav>

      <div className="p-4 border-t border-slate-700">
        <p className="text-xs text-center text-slate-500">v1.0.0 - Dados Locais</p>
      </div>
    </aside>
  );
};

export default Sidebar;
