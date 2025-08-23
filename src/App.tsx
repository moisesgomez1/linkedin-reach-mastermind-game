import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Mastermind from './pages/MasterMind';
import ModeSelect from './pages/ModeSelect';

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Landing page */}
                <Route path="/" element={<Home />} />
                {/* Mode selection page */}
                <Route path="/select-mode" element={<ModeSelect />} />
                {/* Game page */}
                <Route path="/mastermind" element={<Mastermind />} />
            </Routes>
        </BrowserRouter>
    );
}
