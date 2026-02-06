import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Welcome } from '../routes/Welcome';
import { Home } from '../routes/Home';
import { useGameStore } from '../store/gameStore';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: Record<string, unknown>) => {
      const { initial: _i, animate: _a, exit: _e, transition: _t, whileHover: _wh, whileTap: _wt, drag: _d, dragConstraints: _dc, onDragStart: _ds, onDragEnd: _de, ...rest } = props;
      return <div {...rest}>{children as React.ReactNode}</div>;
    },
    button: ({ children, ...props }: Record<string, unknown>) => {
      const { initial: _i, animate: _a, exit: _e, transition: _t, whileHover: _wh, whileTap: _wt, ...rest } = props;
      return <button {...rest}>{children as React.ReactNode}</button>;
    },
    span: ({ children, ...props }: Record<string, unknown>) => {
      const { initial: _i, animate: _a, exit: _e, transition: _t, ...rest } = props;
      return <span {...rest}>{children as React.ReactNode}</span>;
    },
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock canvas-confetti
vi.mock('canvas-confetti', () => ({
  default: vi.fn(),
}));

describe('Welcome Screen', () => {
  it('should render the welcome screen', () => {
    render(
      <MemoryRouter>
        <Welcome />
      </MemoryRouter>
    );

    expect(screen.getByText(/בואו נלמד אנגלית/)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/הכנס את השם שלך/)).toBeInTheDocument();
  });

  it('should have a disabled start button when no name entered', () => {
    render(
      <MemoryRouter>
        <Welcome />
      </MemoryRouter>
    );

    const button = screen.getByText(/יאללה/);
    expect(button).toBeDisabled();
  });
});

describe('Home Screen', () => {
  beforeEach(() => {
    useGameStore.setState({ playerName: 'תום' });
  });

  it('should render the home screen with player name', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    expect(screen.getByText(/היי תום/)).toBeInTheDocument();
  });

  it('should show all 4 game modules', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    expect(screen.getAllByText('מעבדת Magic E').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('בונה משפטים').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('תג מחיר').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('אוצר מילים').length).toBeGreaterThanOrEqual(1);
  });

  it('should show mock test section', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    expect(screen.getByText('מבחן דמה')).toBeInTheDocument();
  });

  it('should show boss levels section', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    expect(screen.getByText(/שלבי בוס/)).toBeInTheDocument();
  });
});
