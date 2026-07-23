import { Routes, Route } from 'react-router-dom';

function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<div>Home</div>} />
        <Route path="/hamster" element={<div>Hamster</div>} />
      </Routes>
    </div>
  );
}

export default App;
