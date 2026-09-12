import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import AdminCommandCenter from './pages/AdminCommandCenter';
import Communicate from './pages/Communicate';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<AdminCommandCenter />} />
          <Route path="/communicate" element={<Communicate />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;

