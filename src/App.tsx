import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider, App as AntApp } from 'antd';
import idID from 'antd/locale/id_ID';
import { router } from './routes';
import { AuthProvider } from './contexts/AuthContext';
import 'dayjs/locale/id';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const antTheme = {
  token: {
    colorPrimary: '#2563eb',
    borderRadius: 8,
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
  },
  components: {
    Button: { borderRadius: 8 },
    Card: { borderRadius: 16 },
    Input: { borderRadius: 8 },
    Select: { borderRadius: 8 },
  },
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider theme={antTheme} locale={idID}>
        <AntApp>
          <AuthProvider>
            <RouterProvider router={router} />
          </AuthProvider>
        </AntApp>
      </ConfigProvider>
    </QueryClientProvider>
  );
}
