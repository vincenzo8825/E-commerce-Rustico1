import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AccessibilityProvider, useA11yAnnouncements, SkipNavigation } from '../AccessibilityEnhancements';

// Test per AccessibilityProvider
describe('AccessibilityProvider', () => {
  test('fornisce il contesto di accessibilità', () => {
    const TestComponent = () => {
      const { announce } = useA11yAnnouncements();
      return (
        <button onClick={() => announce('Test message')}>
          Test Button
        </button>
      );
    };

    render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>
    );

    expect(screen.getByText('Test Button')).toBeInTheDocument();
  });

  test('gestisce gli annunci screen reader', async () => {
    const TestComponent = () => {
      const { announce } = useA11yAnnouncements();
      return (
        <button onClick={() => announce('Test announcement', 'polite')}>
          Announce
        </button>
      );
    };

    render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>
    );

    const button = screen.getByText('Announce');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Test announcement')).toBeInTheDocument();
    });
  });

  test('rimuove gli annunci dopo il timeout', async () => {
    jest.useFakeTimers();
    
    const TestComponent = () => {
      const { announce } = useA11yAnnouncements();
      return (
        <button onClick={() => announce('Temporary message')}>
          Temporary
        </button>
      );
    };

    render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>
    );

    const button = screen.getByText('Temporary');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Temporary message')).toBeInTheDocument();
    });

    // Avanza il timer di 5 secondi
    jest.advanceTimersByTime(5000);

    await waitFor(() => {
      expect(screen.queryByText('Temporary message')).not.toBeInTheDocument();
    });

    jest.useRealTimers();
  });
});

// Test per SkipNavigation
describe('SkipNavigation', () => {
  test('rende i link di navigazione rapida', () => {
    render(<SkipNavigation />);

    expect(screen.getByText('Salta al contenuto principale')).toBeInTheDocument();
    expect(screen.getByText('Salta alla navigazione principale')).toBeInTheDocument();
    expect(screen.getByText('Salta alla ricerca')).toBeInTheDocument();
    expect(screen.getByText('Salta al footer')).toBeInTheDocument();
  });

  test('i link hanno gli href corretti', () => {
    render(<SkipNavigation />);

    const mainContentLink = screen.getByText('Salta al contenuto principale');
    const navigationLink = screen.getByText('Salta alla navigazione principale');
    const searchLink = screen.getByText('Salta alla ricerca');
    const footerLink = screen.getByText('Salta al footer');

    expect(mainContentLink).toHaveAttribute('href', '#main-content');
    expect(navigationLink).toHaveAttribute('href', '#main-navigation');
    expect(searchLink).toHaveAttribute('href', '#search');
    expect(footerLink).toHaveAttribute('href', '#footer');
  });

  test('ha attributi aria corretti', () => {
    render(<SkipNavigation />);

    const nav = screen.getByRole('navigation', { name: 'Link di navigazione rapida' });
    expect(nav).toBeInTheDocument();
  });
});

// Test per rilevamento preferenze utente
describe('Accessibility Preferences', () => {
  test('rileva prefers-reduced-motion', () => {
    // Mock del matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });

    const TestComponent = () => {
      const { reducedMotion } = useA11yAnnouncements();
      return <div>{reducedMotion ? 'Reduced motion' : 'Normal motion'}</div>;
    };

    render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>
    );

    expect(screen.getByText('Reduced motion')).toBeInTheDocument();
  });

  test('rileva prefers-contrast: high', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: query === '(prefers-contrast: high)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });

    const TestComponent = () => {
      const { isHighContrast } = useA11yAnnouncements();
      return <div>{isHighContrast ? 'High contrast' : 'Normal contrast'}</div>;
    };

    render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>
    );

    expect(screen.getByText('High contrast')).toBeInTheDocument();
  });
}); 