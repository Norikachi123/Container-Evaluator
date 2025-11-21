import React from "react";
import { User, Language } from "../types";
import { LogOut, Box, Globe } from "lucide-react";
import { t } from "../i18n";
interface HeaderProps {
  user: User;
  onLogout: () => void;
  onNavigate: (page: string) => void;
  activePage: string;
  lang: Language;
  setLang: (l: Language) => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onLogout,
  onNavigate,
  activePage,
  lang,
  setLang,
}) => {
  const toggleLang = () => {
    setLang(lang === "en" ? "vi" : "en");
  };

  return (
    <header className="bg-slate-900 text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div
          className="flex items-center space-x-2 cursor-pointer"
          onClick={() => onNavigate("dashboard")}
        >
           <img src={"https://github.com/TPJamesH/Container-Evaluator/raw/refs/heads/main/logo.png"}  width="50" height="auto"/>
          <span className="font-bold text-xl tracking-tight">ContainerAI</span>
        </div>

        <nav className="hidden md:flex space-x-6">
          <button
            onClick={() => onNavigate("dashboard")}
            className={`hover:text-blue-300 ${
              activePage === "dashboard"
                ? "text-blue-400 font-semibold"
                : "text-gray-300"
            }`}
          >
            {t(lang, "dashboard")}
          </button>
          <button
            onClick={() => onNavigate("manifest")}
            className={`hover:text-blue-300 ${
              activePage === "manifest"
                ? "text-blue-400 font-semibold"
                : "text-gray-300"
            }`}
          >
            {t(lang, "queue")}
          </button>
          <button
            onClick={() => onNavigate("new-inspection")}
            className={`hover:text-blue-300 ${
              activePage === "new-inspection"
                ? "text-blue-400 font-semibold"
                : "text-gray-300"
            }`}
          >
            {t(lang, "inspect")}
          </button>
          <button
            onClick={() => onNavigate("history")}
            className={`hover:text-blue-300 ${
              activePage === "history"
                ? "text-blue-400 font-semibold"
                : "text-gray-300"
            }`}
          >
            {t(lang, "history")}
          </button>
        </nav>

        <div className="flex items-center space-x-4">
          <button
            onClick={toggleLang}
            className="flex items-center space-x-1 text-xs font-medium bg-slate-800 px-2 py-1 rounded hover:bg-slate-700 transition-colors"
          >
            <Globe className="w-3 h-3" />
            <span>{lang.toUpperCase()}</span>
          </button>

          <div className="text-right hidden sm:block">
            <div className="text-sm font-medium">{user.name}</div>
            <div className="text-xs text-gray-400 uppercase">{user.role}</div>
          </div>
          <button
            onClick={onLogout}
            className="p-2 hover:bg-slate-800 rounded-full transition-colors"
            title={t(lang, "logout")}
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
