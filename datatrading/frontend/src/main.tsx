import ReactDOM from 'react-dom/client';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import App from './App';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { installPasswordInputChineseGuard } from '@/shared/utils/passwordInputGuard';
import '@/shared/styles/index.css';

dayjs.locale('zh-cn');

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            gcTime: 1000 * 60 * 30,
            staleTime: 1000 * 60 * 5,
        },
    },
});

installPasswordInputChineseGuard();

ReactDOM.createRoot(document.getElementById('root')!).render(
    <QueryClientProvider client={queryClient}>
        <App />
    </QueryClientProvider>
);
