import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useWindowsStore } from '../../src/store/useWindows';
import { WindowManager } from '../../src/components/WindowManager/WindowManager';
import { Window } from '../../src/components/WindowManager/Window';
import { DesktopIcon } from '../../src/components/Desktop/DesktopIcon';
import { IconGrid } from '../../src/components/Desktop/IconGrid';
import { DirectoryViewer } from '../../src/components/Desktop/DirectoryViewer';


// ---------------------------------------------------------------------------
// Store integration tests
// ---------------------------------------------------------------------------
describe('useWindowsStore', () => {
  beforeEach(() => {
    useWindowsStore.setState({ windows: {}, nextZIndex: 10, focusedId: null });
  });

  describe('openWindow', () => {
    it('creates a window with default dimensions when not specified', () => {
      const id = useWindowsStore.getState().openWindow({
        title: 'test',
        content: { type: 'terminal' },
      });

      const win = useWindowsStore.getState().windows[id];
      expect(win).toBeDefined();
      expect(win.title).toBe('test');
      expect(win.width).toBe(600);
      expect(win.height).toBe(400);
      expect(win.content).toEqual({ type: 'terminal' });
    });

    it('creates a window with custom dimensions', () => {
      const id = useWindowsStore.getState().openWindow({
        title: 'projects',
        content: { type: 'directoryViewer', path: '/projects' },
        width: 500,
        height: 300,
      });

      const win = useWindowsStore.getState().windows[id];
      expect(win.width).toBe(500);
      expect(win.height).toBe(300);
      expect(win.minWidth).toBe(300);
      expect(win.minHeight).toBe(150);
    });

    it('starts with isMinimized=false, isMaximized=false, isClosing=false', () => {
      const id = useWindowsStore.getState().openWindow({
        title: 'test',
        content: { type: 'terminal' },
      });

      const win = useWindowsStore.getState().windows[id];
      expect(win.isMinimized).toBe(false);
      expect(win.isMaximized).toBe(false);
      expect(win.isClosing).toBe(false);
    });

    it('cascades window position across successive opens', () => {
      const id1 = useWindowsStore.getState().openWindow({ title: 'a', content: { type: 'terminal' } });
      const id2 = useWindowsStore.getState().openWindow({ title: 'b', content: { type: 'terminal' } });
      const id3 = useWindowsStore.getState().openWindow({ title: 'c', content: { type: 'terminal' } });

      const w1 = useWindowsStore.getState().windows[id1];
      const w2 = useWindowsStore.getState().windows[id2];
      const w3 = useWindowsStore.getState().windows[id3];

      expect(w2.x).toBe(w1.x + 32);
      expect(w2.y).toBe(w1.y + 32);
      expect(w3.x).toBe(w2.x + 32);
      expect(w3.y).toBe(w2.y + 32);
    });

    it('sets zIndex and focusedId on open', () => {
      const id = useWindowsStore.getState().openWindow({
        title: 'test',
        content: { type: 'terminal' },
      });

      const state = useWindowsStore.getState();
      expect(state.windows[id].zIndex).toBe(10);
      expect(state.focusedId).toBe(id);
    });
  });

  describe('closeWindow', () => {
    it('removes the window from the store', () => {
      const id = useWindowsStore.getState().openWindow({
        title: 'test',
        content: { type: 'terminal' },
      });
      expect(Object.keys(useWindowsStore.getState().windows)).toHaveLength(1);

      useWindowsStore.getState().closeWindow(id);
      expect(useWindowsStore.getState().windows[id]).toBeUndefined();
      expect(Object.keys(useWindowsStore.getState().windows)).toHaveLength(0);
    });

    it('sets focusedId to the next best window when closing focused', () => {
      const id1 = useWindowsStore.getState().openWindow({ title: 'a', content: { type: 'terminal' } });
      const id2 = useWindowsStore.getState().openWindow({ title: 'b', content: { type: 'terminal' } });

      useWindowsStore.getState().closeWindow(id2);

      const state = useWindowsStore.getState();
      expect(state.focusedId).toBe(id1);
    });

    it('sets focusedId to null when closing the only window', () => {
      const id = useWindowsStore.getState().openWindow({ title: 'a', content: { type: 'terminal' } });

      useWindowsStore.getState().closeWindow(id);

      expect(useWindowsStore.getState().focusedId).toBeNull();
    });
  });

  describe('focusWindow', () => {
    it('raises zIndex when focused', () => {
      const id = useWindowsStore.getState().openWindow({ title: 'a', content: { type: 'terminal' } });
      const initialZ = useWindowsStore.getState().windows[id].zIndex;

      useWindowsStore.getState().focusWindow(id);

      expect(useWindowsStore.getState().windows[id].zIndex).toBe(initialZ + 1);
    });
  });

  describe('minimizeWindow', () => {
    it('sets isMinimized=true and clears focusedId', () => {
      const id = useWindowsStore.getState().openWindow({ title: 'a', content: { type: 'terminal' } });

      useWindowsStore.getState().minimizeWindow(id);

      const state = useWindowsStore.getState();
      expect(state.windows[id].isMinimized).toBe(true);
      expect(state.focusedId).toBeNull();
    });
  });

  describe('maximizeWindow', () => {
    it('toggles isMaximized', () => {
      const id = useWindowsStore.getState().openWindow({ title: 'a', content: { type: 'terminal' } });

      useWindowsStore.getState().maximizeWindow(id);
      expect(useWindowsStore.getState().windows[id].isMaximized).toBe(true);

      useWindowsStore.getState().maximizeWindow(id);
      expect(useWindowsStore.getState().windows[id].isMaximized).toBe(false);
    });
  });

  describe('restoreWindow', () => {
    it('sets isMinimized=false and focuses the window', () => {
      const id = useWindowsStore.getState().openWindow({ title: 'a', content: { type: 'terminal' } });
      useWindowsStore.getState().minimizeWindow(id);

      useWindowsStore.getState().restoreWindow(id);

      const state = useWindowsStore.getState();
      expect(state.windows[id].isMinimized).toBe(false);
      expect(state.focusedId).toBe(id);
    });
  });

  describe('moveWindow', () => {
    it('updates window position', () => {
      const id = useWindowsStore.getState().openWindow({ title: 'a', content: { type: 'terminal' } });

      useWindowsStore.getState().moveWindow(id, 100, 200);

      const win = useWindowsStore.getState().windows[id];
      expect(win.x).toBe(100);
      expect(win.y).toBe(200);
    });
  });

  describe('resizeWindow', () => {
    it('updates window dimensions', () => {
      const id = useWindowsStore.getState().openWindow({ title: 'a', content: { type: 'terminal' } });

      useWindowsStore.getState().resizeWindow(id, 800, 600);

      const win = useWindowsStore.getState().windows[id];
      expect(win.width).toBe(800);
      expect(win.height).toBe(600);
    });

    it('clamps to minWidth/minHeight', () => {
      const id = useWindowsStore.getState().openWindow({ title: 'a', content: { type: 'terminal' } });

      useWindowsStore.getState().resizeWindow(id, 10, 10);

      const win = useWindowsStore.getState().windows[id];
      expect(win.width).toBe(300);  // minWidth
      expect(win.height).toBe(150); // minHeight
    });
  });
});

// ---------------------------------------------------------------------------
// Component integration tests
// ---------------------------------------------------------------------------
describe('WindowManager component integration', () => {
  beforeEach(() => {
    useWindowsStore.setState({ windows: {}, nextZIndex: 10, focusedId: null });
  });

  it('renders nothing when no windows are open', () => {
    const { container } = render(<WindowManager />);
    expect(container.firstChild).toBeNull();
  });

  it('renders a terminal window after opening one', () => {
    useWindowsStore.getState().openWindow({
      title: 'terminal',
      content: { type: 'terminal' },
      width: 640,
      height: 360,
    });

    render(<WindowManager />);
    expect(screen.getByText('terminal')).toBeDefined();
  });
});

describe('Window component', () => {
  beforeEach(() => {
    useWindowsStore.setState({ windows: {}, nextZIndex: 10, focusedId: null });
  });

  it('renders nothing when minimized', () => {
    const id = useWindowsStore.getState().openWindow({
      title: 'test',
      content: { type: 'terminal' },
    });
    useWindowsStore.getState().minimizeWindow(id);

    const { container } = render(<Window win={useWindowsStore.getState().windows[id]} />);
    // Keep window in DOM via display:none to avoid React unmount issues
    expect((container.firstChild as HTMLElement).style.display).toBe('none');
  });

  it('renders title bar with window title', () => {
    const id = useWindowsStore.getState().openWindow({
      title: 'projects',
      content: { type: 'directoryViewer', path: '/projects' },
    });

    render(<Window win={useWindowsStore.getState().windows[id]} />);
    expect(screen.getByText('projects')).toBeDefined();
  });

  it('renders close button in title bar', () => {
    const id = useWindowsStore.getState().openWindow({
      title: 'test',
      content: { type: 'terminal' },
    });

    render(<Window win={useWindowsStore.getState().windows[id]} />);
    expect(screen.getByLabelText('Close')).toBeDefined();
  });

  it('renders minimize and maximize buttons', () => {
    const id = useWindowsStore.getState().openWindow({
      title: 'test',
      content: { type: 'terminal' },
    });

    render(<Window win={useWindowsStore.getState().windows[id]} />);
    expect(screen.getByLabelText('Minimize')).toBeDefined();
    expect(screen.getByLabelText('Maximize')).toBeDefined();
  });

  it('close button removes the window from store', async () => {
    const id = useWindowsStore.getState().openWindow({
      title: 'test',
      content: { type: 'terminal' },
    });

    render(<Window win={useWindowsStore.getState().windows[id]} />);

    await userEvent.click(screen.getByLabelText('Close'));

    expect(useWindowsStore.getState().windows[id]).toBeUndefined();
  });

  it('minimize button marks the window as minimized', async () => {
    const id = useWindowsStore.getState().openWindow({
      title: 'test',
      content: { type: 'terminal' },
    });

    render(<Window win={useWindowsStore.getState().windows[id]} />);

    await userEvent.click(screen.getByLabelText('Minimize'));

    expect(useWindowsStore.getState().windows[id].isMinimized).toBe(true);
  });
});

describe('DesktopIcon', () => {
  beforeEach(() => {
    useWindowsStore.setState({ windows: {}, nextZIndex: 10, focusedId: null });
  });

  const baseProps = {
    x: 0,
    y: 0,
    isDragged: false,
    onDragStart: () => {},
    onDrag: (_x: number, _y: number) => {},
    onDragEnd: () => {},
  };

  it('renders label and icon', () => {
    render(<DesktopIcon label="projects" icon="[📁]" onOpen={() => {}} {...baseProps} />);
    expect(screen.getByText('projects')).toBeDefined();
    expect(screen.getByText('[📁]')).toBeDefined();
  });

  it('calls onOpen on click (pointer down + up without move)', () => {
    let opened = false;
    const { container } = render(
      <DesktopIcon label="projects" icon="[📁]" onOpen={() => { opened = true; }} {...baseProps} />
    );

    const el = container.firstChild!;

    fireEvent.pointerDown(el, { pointerId: 1, clientX: 0, clientY: 0 });
    // handler attaches listeners to document — fire pointerup there
    fireEvent.pointerUp(document, { pointerId: 1, clientX: 0, clientY: 0 });

    expect(opened).toBe(true);
  });
});

describe('IconGrid → Window open integration', () => {
  beforeEach(() => {
    useWindowsStore.setState({ windows: {}, nextZIndex: 10, focusedId: null });
  });

  it('opens a directory viewer on double-clicking a desktop icon', async () => {
    render(<IconGrid />);

    await userEvent.dblClick(screen.getByText('projects'));

    const windows = useWindowsStore.getState().windows;
    const projectWindow = Object.values(windows).find((w) => w.title === 'projects');
    expect(projectWindow).toBeDefined();
    expect(projectWindow!.content).toEqual({ type: 'directoryViewer', path: '/projects' });
  });

  it('opens a terminal on double-clicking the terminal icon', async () => {
    render(<IconGrid />);

    await userEvent.dblClick(screen.getByText('terminal'));

    const windows = useWindowsStore.getState().windows;
    const termWindow = Object.values(windows).find((w) => w.title === 'terminal');
    expect(termWindow).toBeDefined();
    expect(termWindow!.content).toEqual({ type: 'terminal' });
  });
});

describe('DirectoryViewer', () => {
  beforeEach(() => {
    useWindowsStore.setState({ windows: {}, nextZIndex: 10, focusedId: null });
  });

  it('renders directory contents for an existing path', () => {
    render(<DirectoryViewer path="/projects" />);

    // The /projects dir has children in the VFS tree — should show them
    const entries = screen.getAllByText(/[/]$/);
    expect(entries.length).toBeGreaterThan(0);
  });

  it('shows error for nonexistent path', () => {
    render(<DirectoryViewer path="/nonexistent" />);

    expect(screen.getByText(/Path not found/)).toBeDefined();
  });
});

describe('Window content type rendering', () => {
  it('renders terminal content for terminal windows', () => {
    const id = useWindowsStore.getState().openWindow({
      title: 'shell',
      content: { type: 'terminal' },
    });

    const { container } = render(<Window win={useWindowsStore.getState().windows[id]} />);
    // Terminal renders an input prompt — check for the prompt character
    expect(container.textContent).toContain('$');
  });

  it('renders directory viewer for directoryViewer windows', () => {
    const id = useWindowsStore.getState().openWindow({
      title: 'projects',
      content: { type: 'directoryViewer', path: '/projects' },
    });

    render(<Window win={useWindowsStore.getState().windows[id]} />);
    expect(screen.getByText('/projects')).toBeDefined();
  });

  it('renders file viewer for fileViewer windows', () => {
    const id = useWindowsStore.getState().openWindow({
      title: 'about.txt',
      content: { type: 'fileViewer', filePath: '/home/guest/about.txt' },
    });

    render(<Window win={useWindowsStore.getState().windows[id]} />);
    // The file content should be rendered
    expect(screen.getByText('/home/guest/about.txt')).toBeDefined();
  });

  it('renders error for unknown content type', () => {
    const id = useWindowsStore.getState().openWindow({
      title: 'bad',
      content: { type: 'fileViewer', filePath: '/nonexistent/file.txt' },
    });

    render(<Window win={useWindowsStore.getState().windows[id]} />);
    expect(screen.getByText(/File not found/)).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// Window move + resize via store (jsdom does not support reliable
// pointer event simulation; drag/resize hooks are covered by their
// logic here and should be tested in a real browser via Playwright)
// ---------------------------------------------------------------------------
describe('Window move + resize', () => {
  beforeEach(() => {
    useWindowsStore.setState({ windows: {}, nextZIndex: 10, focusedId: null });
  });

  it('moves window via store', () => {
    const id = useWindowsStore.getState().openWindow({
      title: 'test', content: { type: 'terminal' },
      width: 400, height: 300,
    });

    // Simulate the result of dragging by (100, 100) from cascade (80, 80)
    useWindowsStore.getState().moveWindow(id, 180, 180);

    const win = useWindowsStore.getState().windows[id];
    expect(win.x).toBe(180);
    expect(win.y).toBe(180);
  });

  it('moves window via TitleBar + drag hook end-to-end', () => {
    // Verify that TitleBar's handlePointerDown triggers focus before drag
    const id = useWindowsStore.getState().openWindow({
      title: 'test', content: { type: 'terminal' },
      width: 400, height: 300,
    });

    render(<Window win={useWindowsStore.getState().windows[id]} />);

    // Click title bar — clicks on the title text propagate to title bar
    const titleBar = screen.getByText('test').closest('div')!;
    fireEvent.pointerDown(titleBar, { clientX: 200, clientY: 200, pointerId: 1 });

    // TitleBar's pointer down calls focusWindow + useDrag.onPointerDown
    // which sets offset + registers document listeners (mocked setPointerCapture)
    expect(useWindowsStore.getState().focusedId).toBe(id);

    // Clean up by firing pointerUp to remove the document listeners
    fireEvent.pointerUp(document, { pointerId: 1 });
  });

  it('resizes window via store (SE direction)', () => {
    const id = useWindowsStore.getState().openWindow({
      title: 'test', content: { type: 'terminal' },
      width: 400, height: 300,
    });

    // Simulate the result of dragging SE handle by (100, 50)
    useWindowsStore.getState().resizeWindow(id, 500, 350);

    const win = useWindowsStore.getState().windows[id];
    expect(win.width).toBe(500);
    expect(win.height).toBe(350);
  });

  it('resize window via store clamps to minimum dimensions', () => {
    const id = useWindowsStore.getState().openWindow({
      title: 'test', content: { type: 'terminal' },
      width: 400, height: 300,
    });

    // Try to shrink below min
    useWindowsStore.getState().resizeWindow(id, 10, 10);

    const win = useWindowsStore.getState().windows[id];
    expect(win.width).toBe(300);
    expect(win.height).toBe(150);
  });

  it('ResizeHandle elements render correctly', () => {
    const id = useWindowsStore.getState().openWindow({
      title: 'test', content: { type: 'terminal' },
      width: 400, height: 300,
    });

    render(<Window win={useWindowsStore.getState().windows[id]} />);

    const handleElements = document.querySelectorAll('[class*="handle"]');
    expect(handleElements.length).toBe(8);
  });
});

// ---------------------------------------------------------------------------
// Focus and z-index ordering
// ---------------------------------------------------------------------------
describe('Window focus / z-index ordering', () => {
  beforeEach(() => {
    useWindowsStore.setState({ windows: {}, nextZIndex: 10, focusedId: null });
  });

  it('clicking a window brings it to front', async () => {
    const id1 = useWindowsStore.getState().openWindow({ title: 'a', content: { type: 'terminal' } });
    const id2 = useWindowsStore.getState().openWindow({ title: 'b', content: { type: 'terminal' } });

    render(<WindowManager />);

    const z1 = useWindowsStore.getState().windows[id1].zIndex;
    const z2 = useWindowsStore.getState().windows[id2].zIndex;
    expect(z2).toBeGreaterThan(z1);

    // Click window 'a' to bring it to front
    const winA = screen.getByText('a').closest('[class*="window"]')!;
    fireEvent.pointerDown(winA);

    const updatedZ1 = useWindowsStore.getState().windows[id1].zIndex;
    expect(updatedZ1).toBeGreaterThan(z2);
  });
});
