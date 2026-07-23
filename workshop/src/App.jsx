import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';

function App() {
  return (
    <div className="app">
      <Navbar />
      <Routes>
        <Route path="/" element={<div>Home</div>} />
        <Route path="/hamster" element={<div>Hamster</div>} />
      </Routes>
    </div>
  );
}

export default App;
