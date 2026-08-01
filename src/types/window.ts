export type WindowContent =
  | { type: 'fileViewer'; filePath: string }
  | { type: 'terminal' }
  | { type: 'directoryViewer'; path: string }
  | { type: 'imageViewer'; filePath: string }
  | { type: 'pdfViewer'; filePath: string }
  | { type: 'browser'; url?: string }
  | { type: 'fileManager' };

export interface WindowState {
  id: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  minWidth: number;
  minHeight: number;
  zIndex: number;
  isMinimized: boolean;
  isMaximized: boolean;
  isClosing: boolean;
  preMaximizeRect: { x: number; y: number; width: number; height: number } | null;
  content: WindowContent;
}

export type OpenWindowConfig = Omit<
  WindowState,
  'id' | 'zIndex' | 'isMinimized' | 'isMaximized' | 'isClosing' | 'preMaximizeRect'
>;

export type ResizeDirection = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';
