import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AdminLayout from './components/AdminLayout';
import Home from './components/Home';
import GP from './components/GP';
import Robi from './components/Robi';
import Airtel from './components/Airtel';
import Banglalink from './components/Banglalink';
import Teletalk from './components/Teletalk';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AdminLayout />}>
          <Route index element={<Home />} />
          <Route path="gp" element={<GP />} />
          <Route path="robi" element={<Robi />} />
          <Route path="airtel" element={<Airtel />} />
          <Route path="banglalink" element={<Banglalink />} />
          <Route path="teletalk" element={<Teletalk />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;