import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import Operations from './components/Operations';
import Journal from './components/Journal';
import OperationModal from './components/OperationModal';
import JournalModal from './components/JournalModal';
import Configuration from './components/Configuration';
import SociosBalance from './components/SociosBalance';
import SocioSelector from './components/SocioSelector';
import Documentos from './components/Documentos';
import DocumentosModal from './components/DocumentosModal';


function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [currentSocio, setCurrentSocio] = useState(() => {
    const saved = localStorage.getItem('currentSocio');
    return saved ? JSON.parse(saved) : null;
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Operaciones State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [operationToEdit, setOperationToEdit] = useState(null);

  // Journal State
  const [isJournalModalOpen, setIsJournalModalOpen] = useState(false);
  const [noteToEdit, setNoteToEdit] = useState(null);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [docToEdit, setDocToEdit] = useState(null);

  const [refreshKey, setRefreshKey] = useState(0);

  const handleSelectSocio = (socio) => {
    setCurrentSocio(socio);
    localStorage.setItem('currentSocio', JSON.stringify(socio));
  };

  const handleLogoutSocio = () => {
    setCurrentSocio(null);
    localStorage.removeItem('currentSocio');
  };

  const handleOpenModal = (operation = null) => {
    setOperationToEdit(operation);
    setIsModalOpen(true);
  };

  const handleOpenJournalModal = (note = null) => {
    setNoteToEdit(note);
    setIsJournalModalOpen(true);
  };

  const handleOpenDocModal = (doc = null) => {
    setDocToEdit(doc);
    setIsDocModalOpen(true);
  };

  const handleSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleNavClick = (view) => {
    setCurrentView(view);
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex min-h-screen">
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* SideNavBar */}
      <aside className={`fixed md:sticky top-0 left-0 h-screen w-64 flex flex-col bg-slate-50 dark:bg-slate-950 p-6 space-y-8 flex-shrink-0 z-50 transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 lacquered-gradient rounded-xl flex items-center justify-center text-white">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance</span>
          </div>
          <div>
            <h1 className="font-headline text-2xl font-black text-slate-900 dark:text-slate-50 leading-none">La Pampa Gringa</h1>
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold tracking-widest">Curador de Patrimonio</p>
          </div>
        </div>
        
        <button 
          onClick={() => handleOpenModal()}
          className="w-full bg-gradient-to-br from-primary to-primary-container text-on-primary py-3 rounded-xl flex items-center justify-center space-x-2 shadow-xl shadow-primary/10 active:scale-95 transition-all text-sm font-bold"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          <span>Nueva Operación</span>
        </button>

        <nav className="flex-1 space-y-1">
          {[
            { view: 'dashboard', icon: 'dashboard', label: 'Panel General' },
            { view: 'operations', icon: 'list_alt', label: 'Operaciones' },
            { view: 'socios', icon: 'group', label: 'Balance por Socio' },
            { view: 'journal', icon: 'menu_book', label: 'Diario' },
            { view: 'documentos', icon: 'folder_special', label: 'Documentos' },
            { view: 'config', icon: 'settings', label: 'Configuración' },
          ].map(({ view, icon, label }) => (
            <button
              key={view}
              onClick={() => handleNavClick(view)}
              className={`w-full flex items-center space-x-3 px-4 py-3 transition-all rounded-lg font-body text-sm font-medium ${currentView === view ? 'bg-slate-200/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-50 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'}`}
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: currentView === view ? "'FILL' 1" : "'FILL' 0" }}>{icon}</span>
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
          <div className="group relative">
            <div className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
              <img 
                className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/20" 
                src={currentSocio?.avatar_url || `https://ui-avatars.com/api/?name=${currentSocio?.nombre}&background=random`} 
                alt="profile" 
              />
              <div className="overflow-hidden flex-1">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{currentSocio?.nombre}</p>
                <p className="text-[10px] text-slate-500 truncate uppercase font-bold tracking-tighter">{currentSocio?.rol || 'Socio'}</p>
              </div>
              <button 
                onClick={handleLogoutSocio}
                className="opacity-0 group-hover:opacity-100 absolute inset-0 bg-primary/95 rounded-xl flex items-center justify-center text-white text-[10px] font-black uppercase tracking-widest transition-all"
              >
                Cambiar Socio
              </button>
            </div>
          </div>
        </div>
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
          <p className="text-[9px] text-slate-400 font-mono text-center tracking-tighter">
            build {new Date('2026-07-03T18:30:00').toLocaleString('es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 bg-surface flex flex-col h-screen overflow-hidden">
        {/* TopAppBar */}
        <header className="bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-xl flex justify-between items-center w-full px-4 md:px-8 py-4 sticky top-0 z-40 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <button
              className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
              onClick={() => setIsSidebarOpen(prev => !prev)}
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <h2 className="text-xl font-bold tracking-widest uppercase text-slate-900 dark:text-slate-50 font-headline">Libro Editorial</h2>
          </div>
          <div className="flex items-center space-x-6">
            <div className="relative hidden lg:block">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
              <input className="bg-slate-100/50 dark:bg-slate-900/50 border-none rounded-full pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary w-64 transition-all" placeholder="Buscar entradas..." type="text" />
            </div>
            <div className="flex items-center space-x-4">
              <span className="material-symbols-outlined text-slate-500 hover:text-slate-900 cursor-pointer">notifications</span>
              <span className="material-symbols-outlined text-slate-500 hover:text-slate-900 cursor-pointer">settings</span>
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="flex-1 overflow-y-auto">
          {currentView === 'dashboard' && (
            <Dashboard 
              key={`dash-${refreshKey}`} 
              onOpenModal={handleOpenModal} 
            />
          )}
          {currentView === 'operations' && (
            <Operations 
              key={`ops-${refreshKey}`} 
              onOpenModal={handleOpenModal} 
            />
          )}
          {currentView === 'journal' && (
            <Journal 
              key={`journal-${refreshKey}`} 
              onOpenModal={handleOpenJournalModal} 
            />
          )}
          {currentView === 'documentos' && (
            <Documentos 
              key={`docs-${refreshKey}`} 
              onOpenModal={handleOpenDocModal} 
            />
          )}
          {currentView === 'config' && (
            <Configuration />
          )}
          {currentView === 'socios' && (
            <SociosBalance key={`socios-${refreshKey}`} />
          )}
        </div>
      </main>

      {/* Socio Selection Overlay */}
      {!currentSocio && <SocioSelector onSelect={handleSelectSocio} />}

      {/* Modals */}
      <OperationModal 
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setOperationToEdit(null); }}
        onSuccess={handleSuccess}
        operationToEdit={operationToEdit}
        currentSocioId={currentSocio?.id}
      />
      <JournalModal 
        isOpen={isJournalModalOpen}
        onClose={() => { setIsJournalModalOpen(false); setNoteToEdit(null); }}
        onSuccess={handleSuccess}
        noteToEdit={noteToEdit}
        currentSocioId={currentSocio?.id}
      />
      <DocumentosModal 
        isOpen={isDocModalOpen}
        onClose={() => { setIsDocModalOpen(false); setDocToEdit(null); }}
        onSuccess={handleSuccess}
        documentoToEdit={docToEdit}
        currentSocioId={currentSocio?.id}
      />
    </div>
  );
}

export default App;
