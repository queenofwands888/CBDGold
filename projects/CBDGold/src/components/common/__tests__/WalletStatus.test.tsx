import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import WalletStatus from '../WalletStatus';
import { AppProviders } from '../../../providers';

const renderWithProviders = (ui: React.ReactElement) =>
  render(<AppProviders>{ui}</AppProviders>);

describe('WalletStatus', () => {
  let mathRandomSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.useFakeTimers();
    mathRandomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.5);
  });

  afterEach(() => {
    vi.useRealTimers();
    mathRandomSpy.mockRestore();
  });

  it('connects and displays wallet details', async () => {
    renderWithProviders(<WalletStatus />);

    const connectButton = screen.getByRole('button', { name: 'Connect' });
    fireEvent.click(connectButton);

    expect(screen.getByRole('button', { name: 'Connecting...' })).toBeDisabled();

    await act(async () => {
      vi.advanceTimersByTime(600);
      await Promise.resolve();
    });

    expect(screen.getByRole('button', { name: 'Disconnect' })).toBeInTheDocument();
    expect(screen.getByText(/FAKE/i)).toBeInTheDocument();
    expect(screen.getByText('Refresh Assets')).toBeInTheDocument();
    expect(screen.getByText('5.5')).toBeInTheDocument(); // ALGO balance derived from mocked random value
    expect(screen.getByText('25000')).toBeInTheDocument(); // HEMP balance derived from mocked random value
  });

  it('disconnects and resets wallet state', async () => {
    renderWithProviders(<WalletStatus />);

    fireEvent.click(screen.getByRole('button', { name: 'Connect' }));
    await act(async () => {
      vi.advanceTimersByTime(600);
      await Promise.resolve();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Disconnect' }));

    expect(screen.getByRole('button', { name: 'Connect' })).toBeInTheDocument();
    expect(screen.getByText('Not connected')).toBeInTheDocument();
  });
});
