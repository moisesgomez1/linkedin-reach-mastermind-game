import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Mastermind from './pages/MasterMind';

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Landing page */}
                <Route path="/" element={<Home />} />
                {/* Game page */}
                <Route path="/mastermind" element={<Mastermind />} />
            </Routes>
        </BrowserRouter>
    );
}
