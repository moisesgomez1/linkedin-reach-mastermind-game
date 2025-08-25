import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';

import Home from './pages/Home';
import Mastermind from './pages/MasterMind';
import ModeSelect from './pages/ModeSelect';
import Login from './pages/Login';
import Signup from './pages/Signup';

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    {/* Landing page */}
                    <Route
                        path="/"
                        element={
                            <PrivateRoute>
                                <Home />
                            </PrivateRoute>
                        }
                    />
                    {/* Mode selection page */}
                    <Route
                        path="/select-mode"
                        element={
                            <PrivateRoute>
                                <ModeSelect />
                            </PrivateRoute>
                        }
                    />
                    {/* Game page */}
                    <Route
                        path="/mastermind"
                        element={
                            <PrivateRoute>
                                <Mastermind />
                            </PrivateRoute>
                        }
                    />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}
