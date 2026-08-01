import { useRef, useCallback } from 'react';
import { useWindowsStore } from '../../store/useWindows';
import { TitleBar } from './TitleBar';
import { ResizeHandle } from './ResizeHandle';
import { Terminal } from '../Terminal/Terminal';
import { DirectoryViewer } from '../Desktop/DirectoryViewer';
import { FileViewer } from '../FileRenderers/FileViewer';
import { ImageViewer } from '../FileRenderers/ImageViewer';
import { BrowserViewer } from '../WebBrowser/BrowserViewer';
import { FileManager } from '../FileManager/FileManager';
import type { WindowState } from '../../types/window';
import styles from '../../styles/components/window.module.css';

interface WindowProps {
  win: WindowState;
}

export function Window({ win }: WindowProps) {
  const focusedId = useWindowsStore((s) => s.focusedId);
  const focusWindow = useWindowsStore((s) => s.focusWindow);
  const contentRef = useRef<HTMLDivElement>(null);

  const handlePointerDown = useCallback(() => {
    if (win.isMinimized) return;
    focusWindow(win.id);
    // Restore focus to the first focusable element inside the window
    // (terminal input, file viewer, etc.) so keystrokes land
    contentRef.current?.querySelector<HTMLElement>('input, textarea, [tabindex]:not([tabindex="-1"])')?.focus();
  }, [focusWindow, win.id, win.isMinimized]);

  const isFocused = focusedId === win.id;

  const renderContent = () => {
    switch (win.content.type) {
      case 'terminal':
        return <Terminal />;
      case 'directoryViewer':
        return <DirectoryViewer path={win.content.path} />;
      case 'fileViewer':
        return <FileViewer filePath={win.content.filePath} />;
      case 'imageViewer':
        return <ImageViewer filePath={win.content.filePath} />;
      case 'browser':
        return <BrowserViewer initialUrl={win.content.url} />;
      case 'fileManager':
        return <FileManager />;
      default:
        return (
          <div style={{ padding: 16, color: 'var(--phosphor)' }}>
            Unknown content type
          </div>
        );
    }
  };

  return (
    <div
      className={`${styles.window}${isFocused ? ` ${styles.windowFocused}` : ''}`}
      style={{
        left: win.x,
        top: win.y,
        width: win.width,
        height: win.height,
        zIndex: win.zIndex,
        display: win.isMinimized ? 'none' : undefined,
      }}
      onPointerDown={handlePointerDown}
      role="dialog"
      aria-label={win.title}
      aria-modal="false"
    >
      <TitleBar windowId={win.id} title={win.title} />
      <div ref={contentRef} className={styles.content}>
        {renderContent()}
      </div>
      {/* Resize handles on all edges and corners */}
      <ResizeHandle windowId={win.id} direction="n" />
      <ResizeHandle windowId={win.id} direction="s" />
      <ResizeHandle windowId={win.id} direction="e" />
      <ResizeHandle windowId={win.id} direction="w" />
      <ResizeHandle windowId={win.id} direction="ne" />
      <ResizeHandle windowId={win.id} direction="nw" />
      <ResizeHandle windowId={win.id} direction="se" />
      <ResizeHandle windowId={win.id} direction="sw" />
    </div>
  );
}
