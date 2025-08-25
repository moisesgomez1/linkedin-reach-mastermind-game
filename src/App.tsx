import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';

import Home from './pages/Home';
import Mastermind from './pages/MasterMind';
import ModeSelect from './pages/ModeSelect';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Layout from './components/Layout';

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
                                <Layout>
                                    <Home />
                                </Layout>
                            </PrivateRoute>
                        }
                    />
                    {/* Mode selection page */}
                    <Route
                        path="/select-mode"
                        element={
                            <PrivateRoute>
                                <Layout>
                                    <ModeSelect />
                                </Layout>
                            </PrivateRoute>
                        }
                    />
                    {/* Game page */}
                    <Route
                        path="/mastermind"
                        element={
                            <PrivateRoute>
                                <Layout>
                                    <Mastermind />
                                </Layout>
                            </PrivateRoute>
                        }
                    />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}
