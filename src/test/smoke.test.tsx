import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Welcome } from '../routes/Welcome';
import { Home } from '../routes/Home';
import { useGameStore } from '../store/gameStore';

// Motion props to strip from rendered elements
const MOTION_PROPS = ['initial', 'animate', 'exit', 'transition', 'whileHover', 'whileTap', 'drag', 'dragConstraints', 'onDragStart', 'onDragEnd', 'variants', 'layout', 'layoutId'];

function createMotionComponent(tag: string) {
  return ({ children, ...props }: Record<string, unknown>) => {
    const filteredProps: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(props)) {
      if (!MOTION_PROPS.includes(key)) filteredProps[key] = val;
    }
    const Tag = tag as keyof JSX.IntrinsicElements;
    // @ts-expect-error dynamic tag
    return <Tag {...filteredProps}>{children as React.ReactNode}</Tag>;
  };
}

// Mock framer-motion to avoid animation issues in tests — uses Proxy so motion.X works for any tag
vi.mock('framer-motion', () => ({
  motion: new Proxy({}, {
    get: (_target, prop: string) => createMotionComponent(prop),
  }),
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock canvas-confetti
vi.mock('canvas-confetti', () => ({
  default: vi.fn(),
}));

// Mock MascotImage - used in Welcome and Home
vi.mock('../components/ui/MascotImage', () => ({
  MascotImage: ({ state }: { state: string }) => <div data-testid="mascot" data-state={state}>🦊</div>,
}));

// Mock AICoachStrip - used in Home and game modules
vi.mock('../components/ui/AICoachStrip', () => ({
  AICoachStrip: () => <div data-testid="ai-coach-strip">Coach</div>,
}));

describe('Welcome Screen', () => {
  it('should render the welcome screen', () => {
    render(
      <MemoryRouter>
        <Welcome />
      </MemoryRouter>
    );

    expect(screen.getByText(/מסע הקסם באנגלית/)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/איך קוראים לך/)).toBeInTheDocument();
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

  it('should show AI coach strip', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    expect(screen.getByTestId('ai-coach-strip')).toBeInTheDocument();
  });

  it('should show mascot', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    expect(screen.getAllByTestId('mascot').length).toBeGreaterThanOrEqual(1);
  });
});
