import { Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import About from './components/About';
import Contact from './components/Contact';
import GP from './components/GP';
import Robi from './components/Robi';
import Airtel from './components/Airtel';
import Banglalink from './components/Banglalink';
import Teletalk from './components/Teletalk';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/gp" element={<GP />} />
      <Route path="/robi" element={<Robi />} />
      <Route path="/airtel" element={<Airtel />} />
      <Route path="/banglalink" element={<Banglalink />} />
      <Route path="/teletalk" element={<Teletalk />} />
    </Routes>
  );
};

export default AppRoutes;