import React from 'react';
import { SnackbarProvider } from 'notistack';
import ErrorBoundary from '../components/ErrorBoundary';
import { AppProvider, TransactionProvider } from '../contexts';

interface AppProvidersProps {
  children: React.ReactNode;
}

const AppProviders: React.FC<AppProvidersProps> = ({ children }) => (
  <SnackbarProvider
    maxSnack={3}
    anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
    autoHideDuration={5000}
  >
    <ErrorBoundary>
      <AppProvider>
        <TransactionProvider>{children}</TransactionProvider>
      </AppProvider>
    </ErrorBoundary>
  </SnackbarProvider>
);

export default AppProviders;
