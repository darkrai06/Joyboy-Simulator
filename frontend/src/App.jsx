import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AdminLayout from './components/AdminLayout';
import Home from './components/Home';
import GP from './components/GP';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AdminLayout />}>
          <Route index element={<Home />} />
          <Route path="gp" element={<GP />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;