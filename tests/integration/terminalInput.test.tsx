import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TerminalInput } from '../../src/components/Terminal/TerminalInput';
import { registerAllCommands } from '../../src/components/Terminal/commands';
import { useTerminalStore } from '../../src/store/useTerminal';
import { useVFSStore } from '../../src/store/useVFS';
import { INITIAL_TREE } from '../../src/store/vfs-tree';

describe('TerminalInput', () => {
  beforeEach(() => {
    registerAllCommands();
    useVFSStore.setState({
      tree: INITIAL_TREE,
      currentPath: '/home/guest',
      history: [],
    });
    useTerminalStore.setState({
      history: [],
      currentInput: '',
      cursorPos: 0,
      commandHistory: [],
      historyIndex: -1,
    });
  });

  it('accepts keyboard input and executes commands', async () => {
    const user = userEvent.setup();
    render(<TerminalInput />);

    const textbox = screen.getByRole('textbox', { name: 'Terminal input' });
    textbox.focus();

    await user.keyboard('ls');
    expect(useTerminalStore.getState().currentInput).toBe('ls');

    await user.keyboard('{Enter}');
    expect(useTerminalStore.getState().currentInput).toBe('');
    expect(useTerminalStore.getState().history.some((entry) => entry.content.includes('Available commands:'))).toBe(true);
  });
});
