import React, { useState } from 'react';
import { Header } from './components/Header';
import { Dashboard } from './pages/Dashboard';
import { Capture } from './pages/Capture';
import { Review } from './pages/Review';
import { History } from './pages/History';
import { Manifest } from './pages/Manifest';
import { Pricing } from './pages/Pricing';
import { User, UserRole, Language } from './types';
import { MOCK_USERS } from './constants';
import { t } from './i18n';
import { updateManifestStatus } from './services/dbService';

export function App() {
  // Simple state-based routing for MVP
  const [currentPage, setCurrentPage] = useState('login');
  const [user, setUser] = useState<User | null>(null);
  const [currentInspectionId, setCurrentInspectionId] = useState<string | null>(null);
  const [prefilledContainer, setPrefilledContainer] = useState<string | undefined>(undefined);
  const [lang, setLang] = useState<Language>('en');

  const handleLogin = (role: UserRole) => {
    // Simulate login by finding first user with that role
    const found = MOCK_USERS.find(u => u.role === role) || MOCK_USERS[0];
    setUser(found);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage('login');
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    if (page === 'new-inspection') {
        setPrefilledContainer(undefined);
    }
  };

  const handleStartFromManifest = (containerNumber: string) => {
      setPrefilledContainer(containerNumber);
      setCurrentPage('new-inspection');
      // Mark as IN_PROGRESS when starting? Or waiting for completion?
      // Let's mark as IN_PROGRESS
      updateManifestStatus(containerNumber, 'IN_PROGRESS');
  };

  const handleInspectionComplete = (id: string, containerNumber: string) => {
      // Update manifest if it exists
      updateManifestStatus(containerNumber, 'COMPLETED');
      
      setCurrentInspectionId(id);
      setCurrentPage('review');
  };

  const handleViewInspection = (id: string) => {
      setCurrentInspectionId(id);
      setCurrentPage('review');
  };
  
  const handleNextInQueue = (containerNumber: string) => {
      setPrefilledContainer(containerNumber);
      updateManifestStatus(containerNumber, 'IN_PROGRESS');
      setCurrentPage('new-inspection');
  };

  if (currentPage === 'login' || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
        {/* Language toggle on login screen */}
        <div className="absolute top-4 right-4">
             <button 
                onClick={() => setLang(lang === 'en' ? 'vi' : 'en')}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 px-3 py-1 border border-slate-300 rounded bg-white"
             >
                 {lang.toUpperCase()}
             </button>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
              <img src={"./logo.png"} />
            <h1 className="text-2xl font-bold text-slate-800 mb-2">{t(lang, 'login_title')}</h1>
            <p className="text-slate-500 mb-8">{t(lang, 'login_subtitle')}</p>
            
            <div className="space-y-3">
                <button onClick={() => handleLogin(UserRole.INSPECTOR)} className="w-full bg-slate-800 text-white py-3 rounded-lg font-semibold hover:bg-slate-900 transition-colors">
                    {t(lang, 'login_inspector')}
                </button>
                <button onClick={() => handleLogin(UserRole.REVIEWER)} className="w-full bg-white border border-slate-300 text-slate-700 py-3 rounded-lg font-semibold hover:bg-slate-50 transition-colors">
                    {t(lang, 'login_reviewer')}
                </button>
                <button onClick={() => handleLogin(UserRole.ADMIN)} className="w-full bg-blue-50 border border-blue-200 text-blue-700 py-3 rounded-lg font-semibold hover:bg-blue-100 transition-colors">Login as Admin</button>
            </div>
            <div className="mt-6 text-xs text-slate-400">
                MVP Build v0.4 | Powered by Gemini 2.5
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Header 
        user={user} 
        onLogout={handleLogout} 
        onNavigate={handleNavigate} 
        activePage={currentPage}
        lang={lang}
        setLang={setLang}
      />
      
      <main>
        {currentPage === 'dashboard' && <Dashboard lang={lang} />}
        {currentPage === 'manifest' && <Manifest onStartInspection={handleStartFromManifest} lang={lang} />}
        {currentPage === 'pricing' && <Pricing lang={lang} />}
        {currentPage === 'new-inspection' && (
            <Capture 
                user={user} 
                onComplete={handleInspectionComplete} 
                lang={lang} 
                initialContainerNumber={prefilledContainer}
            />
        )}
        {currentPage === 'review' && currentInspectionId && (
            <Review 
                inspectionId={currentInspectionId} 
                user={user} 
                onBack={() => setCurrentPage('history')} 
                onNextContainer={handleNextInQueue}
                lang={lang}
            />
        )}
        {currentPage === 'history' && <History onView={handleViewInspection} lang={lang} />}
      </main>
    </div>
  );
}