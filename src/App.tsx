import './App.css';

import { useEffect } from 'react';

import { CssClass } from '@/common/constants/css';
import { ElementId } from '@/common/constants/dom';
import { SidebarPosition } from '@/common/enums';
import { useStore } from '@/store/store';
import { useBodyClasses } from '@/hooks/useBodyClasses';
import { useKeybindings } from '@/hooks/useKeybindings';
import { useDocumentInteractions } from '@/hooks/useDocumentInteractions';

import { Header } from './components/header/Header';
import { Sidebar } from './components/sidebar/Sidebar';
import { RunbookImportInput } from './components/sidebar/RunbookImportInput';
import { MainPanel } from './components/MainPanel';
import { KeybindingsModal } from './components/modals/KeybindingsModal';
import { ExportModal } from './components/modals/ExportModal';
import { ConfirmModal } from './components/modals/ConfirmModal';
import { AlertModal } from './components/modals/AlertModal';

export default function App() {
  const sidebarCollapsed = useStore((s) => s.sidebarCollapsed);
  const sidebarPosition = useStore((s) => s.sidebarPosition);
  const bootstrap = useStore((s) => s.bootstrap);
  const initialized = useStore((s) => s.initialized);

  useBodyClasses();
  useKeybindings();
  useDocumentInteractions();

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  useEffect(() => {
    if (initialized) {
      requestAnimationFrame(() => document.body.classList.add(CssClass.APP_READY));
    }
  }, [initialized]);

  const shellClass = [
    sidebarCollapsed && CssClass.SIDEBAR_COLLAPSED,
    sidebarPosition === SidebarPosition.RIGHT && CssClass.SIDEBAR_RIGHT,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <>
      <div id={ElementId.APP_SHELL} className={shellClass}>
        <Header />
        <Sidebar />
        <RunbookImportInput />
        <MainPanel />
      </div>

      <KeybindingsModal />
      <ExportModal />
      <ConfirmModal />
      <AlertModal />
    </>
  );
}
