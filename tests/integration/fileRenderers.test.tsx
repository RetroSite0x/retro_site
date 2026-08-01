import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useWindowsStore } from '../../src/store/useWindows';
import { useVFSStore } from '../../src/store/useVFS';
import { INITIAL_TREE } from '../../src/store/vfs-tree';
import { Window } from '../../src/components/WindowManager/Window';
import { FileViewer } from '../../src/components/FileRenderers/FileViewer';
import { MarkdownViewer } from '../../src/components/FileRenderers/MarkdownViewer';
import { ConfigViewer } from '../../src/components/FileRenderers/ConfigViewer';
import { TextViewer } from '../../src/components/FileRenderers/TextViewer';
import { ImageViewer } from '../../src/components/FileRenderers/ImageViewer';
import { BrowserViewer } from '../../src/components/WebBrowser/BrowserViewer';

// ---------------------------------------------------------------------------
// FileViewer dispatcher integration tests
// ---------------------------------------------------------------------------
describe('FileViewer dispatcher', () => {
  beforeEach(() => {
    useVFSStore.setState({ tree: INITIAL_TREE, currentPath: '/home/guest', history: [] });
    useWindowsStore.setState({ windows: {}, nextZIndex: 10, focusedId: null });
  });

  it('renders .txt file with file path in header and content', () => {
    render(<FileViewer filePath="/home/guest/about.txt" />);

    // File path renders in the header
    expect(screen.getByText(/\/home\/guest\/about\.txt/)).toBeDefined();
    // Actual text content renders
    expect(screen.getByText(/Ann Naser Nabil/)).toBeDefined();
    expect(screen.getByText(/Bangla NLP/)).toBeDefined();
  });

  it('renders .conf file with key-value pairs visible', () => {
    render(<FileViewer filePath="/home/guest/skills.conf" />);

    // ConfigViewer should render the key-value structure
    expect(screen.getByText(/Languages/)).toBeDefined();
    expect(screen.getByText(/Python/)).toBeDefined();
    expect(screen.getAllByText(/NLP/).length).toBeGreaterThan(0);
    // Comment line renders
    expect(screen.getByText(/# Skills & Technologies/)).toBeDefined();
  });

  it('renders .md file with markdown heading content', () => {
    render(<FileViewer filePath="/projects/tidyflow/README.md" />);

    // Markdown heading renders
    expect(screen.getByText('TidyFlow')).toBeDefined();
    // Sub-heading also renders
    expect(screen.getByText(/Features/)).toBeDefined();
    expect(screen.getByText(/Installation/)).toBeDefined();
  });

  it('shows error for nonexistent file', () => {
    render(<FileViewer filePath="/nonexistent/file.txt" />);

    expect(screen.getByText(/File not found/)).toBeDefined();
    expect(screen.getByText(/nonexistent/)).toBeDefined();
  });

  it('dispatches .png extension to ImageViewer', () => {
    render(<FileViewer filePath="/projects/tidyflow/screenshots/note.png" />);

    // FileViewer routes .png to ImageViewer; file does not exist in VFS
    // so ImageViewer shows the error with the file path
    expect(screen.getByText(/File not found/)).toBeDefined();
    expect(screen.getByText(/note\.png/)).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// MarkdownViewer direct component tests
// ---------------------------------------------------------------------------
describe('MarkdownViewer', () => {
  beforeEach(() => {
    useVFSStore.setState({ tree: INITIAL_TREE, currentPath: '/home/guest', history: [] });
  });

  it('renders h1 heading from README.md', () => {
    render(<MarkdownViewer filePath="/projects/tidyflow/README.md" />);

    // h1 heading (from '# TidyFlow')
    expect(screen.getByText('TidyFlow')).toBeDefined();
    // h2 headings
    expect(screen.getByText(/Features/)).toBeDefined();
    expect(screen.getByText(/Installation/)).toBeDefined();
  });

  it('renders code blocks with pip install content', () => {
    render(<MarkdownViewer filePath="/projects/tidyflow/README.md" />);

    // Code block content (inside ``` ... ```)
    expect(screen.getByText(/pip install/)).toBeDefined();
  });

  it('shows error for nonexistent file', () => {
    render(<MarkdownViewer filePath="/nonexistent/readme.md" />);

    expect(screen.getByText(/File not found/)).toBeDefined();
  });

  it('renders different heading levels correctly', () => {
    render(<MarkdownViewer filePath="/projects/automlbench/README.md" />);

    // h1: '# AutoMLBench'
    expect(screen.getByText('AutoMLBench')).toBeDefined();
    // h2: '## Features'
    expect(screen.getByText(/Features/)).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// ConfigViewer direct component tests
// ---------------------------------------------------------------------------
describe('ConfigViewer', () => {
  beforeEach(() => {
    useVFSStore.setState({ tree: INITIAL_TREE, currentPath: '/home/guest', history: [] });
  });

  it('renders key-value pairs from skills.conf', () => {
    render(<ConfigViewer filePath="/home/guest/skills.conf" />);

    // Keys appear in the config table
    expect(screen.getByText('Languages')).toBeDefined();
    expect(screen.getByText('ML/AI')).toBeDefined();
    expect(screen.getByText('Tools')).toBeDefined();
    // Values appear
    expect(screen.getByText(/Python, SQL, Bash, JavaScript/)).toBeDefined();
    expect(screen.getByText(/Git, Docker, FastAPI, Flask, Streamlit/)).toBeDefined();
  });

  it('renders comments from skills.conf', () => {
    render(<ConfigViewer filePath="/home/guest/skills.conf" />);

    // Comment line renders
    expect(screen.getByText(/# Skills & Technologies/)).toBeDefined();
  });

  it('renders key-value pairs from contact.md', () => {
    render(<ConfigViewer filePath="/home/guest/contact.md" />);

    expect(screen.getByText(/ann\.n\.nabil@gmail\.com/)).toBeDefined();
    expect(screen.getByText(/github\.com\/AnnNaserNabil/)).toBeDefined();
  });

  it('shows error for nonexistent file', () => {
    render(<ConfigViewer filePath="/nonexistent/config.conf" />);

    expect(screen.getByText(/File not found/)).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// TextViewer direct component tests
// ---------------------------------------------------------------------------
describe('TextViewer', () => {
  beforeEach(() => {
    useVFSStore.setState({ tree: INITIAL_TREE, currentPath: '/home/guest', history: [] });
  });

  it('renders plain text content from about.txt', () => {
    render(<TextViewer filePath="/home/guest/about.txt" />);

    expect(screen.getByText(/Ann Naser Nabil/)).toBeDefined();
    expect(screen.getByText(/Dhaka, Bangladesh/)).toBeDefined();
    expect(screen.getByText(/Computational Social Science/)).toBeDefined();
  });

  it('renders file path in header', () => {
    render(<TextViewer filePath="/home/guest/resume.txt" />);

    expect(screen.getByText(/\/home\/guest\/resume\.txt/)).toBeDefined();
    // Content from resume renders
    expect(screen.getByText(/Khub Soja/)).toBeDefined();
  });

  it('shows error for missing file', () => {
    render(<TextViewer filePath="/missing/file.txt" />);

    expect(screen.getByText(/File not found/)).toBeDefined();
    expect(screen.getByText(/missing\/file\.txt/)).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// ImageViewer direct component tests
// ---------------------------------------------------------------------------
describe('ImageViewer', () => {
  beforeEach(() => {
    useVFSStore.setState({ tree: INITIAL_TREE, currentPath: '/home/guest', history: [] });
  });

  it('renders file path for .png extension', () => {
    render(<ImageViewer filePath="/projects/tidyflow/screenshots/note.png" />);

    // Since no actual .png file exists in VFS, ImageViewer shows the error
    // with the file path, proving the component renders
    expect(screen.getByText(/File not found/)).toBeDefined();
    expect(screen.getByText(/note\.png/)).toBeDefined();
  });

  it('shows error for missing image path', () => {
    render(<ImageViewer filePath="/nonexistent/image.png" />);

    expect(screen.getByText(/File not found/)).toBeDefined();
    expect(screen.getByText(/image\.png/)).toBeDefined();
  });

  it('shows error for .jpg extension missing file', () => {
    render(<ImageViewer filePath="/projects/tidyflow/screenshots/overview.jpg" />);

    expect(screen.getByText(/File not found/)).toBeDefined();
    expect(screen.getByText(/overview\.jpg/)).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// BrowserViewer direct component tests
// ---------------------------------------------------------------------------
describe('BrowserViewer', () => {
  it('includes the resume bookmark and opens the local pdf path', async () => {
    render(<BrowserViewer />);

    await userEvent.click(screen.getByText('Resume'));

    expect(screen.getByText(/Opened in new tab:/)).toBeDefined();
    expect(screen.getByText(/resume-nlp-ml-engineer\.pdf/, { selector: '.launchedUrl' })).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// Window content type rendering for renderers
// ---------------------------------------------------------------------------
describe('Window content type rendering for renderers', () => {
  beforeEach(() => {
    useVFSStore.setState({ tree: INITIAL_TREE, currentPath: '/home/guest', history: [] });
    useWindowsStore.setState({ windows: {}, nextZIndex: 10, focusedId: null });
  });

  it('renders ImageViewer when content type is imageViewer', () => {
    const id = useWindowsStore.getState().openWindow({
      title: 'screenshot',
      content: { type: 'imageViewer', filePath: '/projects/tidyflow/screenshots/note.png' },
    });

    render(<Window win={useWindowsStore.getState().windows[id]} />);

    // ImageViewer renders and shows the file path in error message
    expect(screen.getByText(/note\.png/)).toBeDefined();
  });

  it('renders markdown content when fileViewer opens .md path', () => {
    const id = useWindowsStore.getState().openWindow({
      title: 'README.md',
      content: { type: 'fileViewer', filePath: '/projects/tidyflow/README.md' },
    });

    render(<Window win={useWindowsStore.getState().windows[id]} />);

    // FileViewer dispatches to MarkdownViewer which renders heading
    expect(screen.getByText('TidyFlow')).toBeDefined();
    // Renders code block content through full pipeline
    expect(screen.getByText(/pip install/)).toBeDefined();
  });

  it('renders config content when fileViewer opens .conf path', () => {
    const id = useWindowsStore.getState().openWindow({
      title: 'skills.conf',
      content: { type: 'fileViewer', filePath: '/home/guest/skills.conf' },
    });

    render(<Window win={useWindowsStore.getState().windows[id]} />);

    // FileViewer dispatches to ConfigViewer which renders key-value pairs
    expect(screen.getByText('Languages')).toBeDefined();
    expect(screen.getByText(/Python, SQL, Bash, JavaScript/)).toBeDefined();
    // Comment line renders through full pipeline
    expect(screen.getByText(/# Skills & Technologies/)).toBeDefined();
  });

  it('renders text content when fileViewer opens .txt path', () => {
    const id = useWindowsStore.getState().openWindow({
      title: 'about.txt',
      content: { type: 'fileViewer', filePath: '/home/guest/about.txt' },
    });

    render(<Window win={useWindowsStore.getState().windows[id]} />);

    // FileViewer dispatches to TextViewer — content renders through full pipeline
    expect(screen.getByText(/Ann Naser Nabil/)).toBeDefined();
    expect(screen.getByText(/Online/)).toBeDefined();
  });

  it('shows error for nonexistent file in Window fileViewer', () => {
    const id = useWindowsStore.getState().openWindow({
      title: 'missing',
      content: { type: 'fileViewer', filePath: '/nonexistent/file.txt' },
    });

    render(<Window win={useWindowsStore.getState().windows[id]} />);

    expect(screen.getByText(/File not found/)).toBeDefined();
    expect(screen.getByText(/nonexistent/)).toBeDefined();
  });

  it('shows error for nonexistent image file in Window imageViewer', () => {
    const id = useWindowsStore.getState().openWindow({
      title: 'missing-img',
      content: { type: 'imageViewer', filePath: '/nonexistent/missing.png' },
    });

    render(<Window win={useWindowsStore.getState().windows[id]} />);

    expect(screen.getByText(/File not found/)).toBeDefined();
    expect(screen.getByText(/missing\.png/)).toBeDefined();
  });
});
