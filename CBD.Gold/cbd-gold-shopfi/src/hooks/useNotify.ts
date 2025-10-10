import { useSnackbar } from 'notistack';

export type NotifyVariant = 'default' | 'success' | 'error' | 'warning' | 'info';

export const useNotify = () => {
  const { enqueueSnackbar } = useSnackbar();
  const notify = (message: string, variant: NotifyVariant = 'default') => enqueueSnackbar(message, { variant });
  return { notify };
};
