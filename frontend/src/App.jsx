import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import './styles/App.css';

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <MainLayout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </MainLayout>
      </AppProvider>
    </BrowserRouter>
  );
}