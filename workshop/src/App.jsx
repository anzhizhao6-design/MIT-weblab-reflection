import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import HamsterPage from './pages/HamsterPage.jsx';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/hamster" element={<HamsterPage />} />
    </Routes>
  );
};

export default App;
