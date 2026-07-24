import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import HamsterPage from './pages/HamsterPage';

export default function App() {
  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/hamster" element={<HamsterPage />} />
        </Routes>
      </main>
    </div>
  );
}
