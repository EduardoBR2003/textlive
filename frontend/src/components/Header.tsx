import React, { useState } from 'react';

interface HeaderProps {
  isOwner?: boolean;
  deviceCount: number;
  isSynced?: boolean;
  isSaving?: boolean;
}

export function Header({
  isOwner = false,
  deviceCount,
  isSynced = false,
  isSaving = false,
}: HeaderProps) {
  const [darkMode, setDarkMode] = useState(
    () => document.documentElement.classList.contains('dark'),
  );

  const toggleDarkMode = () => {
    const html = document.documentElement;
    if (html.classList.contains('dark')) {
      html.classList.remove('dark');
      setDarkMode(false);
    } else {
      html.classList.add('dark');
      setDarkMode(true);
    }
  };

  return (
    <header className="bg-surface dark:bg-on-surface flex-shrink-0 border-b border-outline-variant dark:border-outline z-50">
      <div className="flex justify-between items-center w-full px-gutter h-16 max-w-container-max mx-auto">
        <div className="flex items-center gap-md">
          <div className="font-headline-md text-headline-md font-bold text-primary dark:text-primary-fixed-dim">
            TextLive
          </div>
          <div className="hidden md:flex items-center gap-2 bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full font-label-sm text-label-sm">
            <span
              className={`w-2 h-2 rounded-full ${isSaving ? 'bg-tertiary animate-pulse' : isSynced ? 'bg-green-500' : 'bg-primary animate-pulse'}`}
            />
            {isSaving ? 'Salvando...' : isSynced ? 'Sincronizado' : 'Sessão ativa'}
          </div>
        </div>
        <div className="flex items-center gap-md">
          {deviceCount > 0 && (
            <div className="hidden sm:flex items-center gap-2 text-on-surface-variant font-label-md text-label-md">
              <span className="material-symbols-outlined text-[20px]">devices</span>
              {deviceCount} {deviceCount === 1 ? 'dispositivo' : 'dispositivos'}
            </div>
          )}
          <div className="flex items-center gap-sm ml-sm">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full text-on-surface-variant dark:text-surface-variant hover:bg-surface-container dark:hover:bg-inverse-surface transition-colors"
              title={darkMode ? 'Modo claro' : 'Modo escuro'}
            >
              <span className="material-symbols-outlined">
                {darkMode ? 'light_mode' : 'dark_mode'}
              </span>
            </button>
            {isOwner && (
              <button
                className="p-2 rounded-full text-primary dark:text-primary-fixed-dim hover:bg-surface-container dark:hover:bg-inverse-surface transition-colors flex items-center gap-1"
                title="Sincronizado"
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  cloud_done
                </span>
                <span className="hidden md:inline font-label-sm text-label-sm">
                  Sincronizado
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
