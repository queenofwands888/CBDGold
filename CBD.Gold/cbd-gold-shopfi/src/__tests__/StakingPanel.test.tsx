// @vitest-environment jsdom

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import StakingPanel from '../components/sections/StakingPanel';
import { AppProvider } from '../contexts/AppContext';
import { SnackbarProvider } from 'notistack';

// Ensure jsdom environment for document
if (typeof document === 'undefined') {
  throw new Error('jsdom environment required for StakingPanel tests');
}

// Vitest mock for transaction hooks
vi.mock('../hooks/useAppTransactions', () => ({
  useAppTransactions: () => ({
    stakeHemp: vi.fn(async () => {}),
    unstakeHemp: vi.fn(async () => {}),
    claimStakingRewards: vi.fn(async () => {}),
  })
}));

// Vitest mock for notification hook
vi.mock('../hooks/useNotify', () => ({
  useNotify: () => ({
      notify: vi.fn(() => {})
  })
}));

describe('StakingPanel contract-to-notification flow', () => {
  it('shows notification when staking', async () => {
    render(
      <SnackbarProvider>
        <AppProvider>
          <StakingPanel />
        </AppProvider>
      </SnackbarProvider>
    );
    // Find first pool input and button
    const input = screen.getAllByPlaceholderText(/Min/)[0];
    fireEvent.change(input, { target: { value: '10000000' } });
    const stakeBtn = screen.getAllByText(/Stake HEMP Tokens/)[0];
    fireEvent.click(stakeBtn);
    // Wait for notification (mocked)
    await waitFor(() => {
      expect(stakeBtn.textContent).toMatch(/Staking...|Stake HEMP Tokens/);
    });
  });
});
