import { Routes, Route, useLocation } from 'react-router-dom';
import { AuthGuard } from './components/AuthGuard';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Home } from './pages/Home';
import { Navbar } from './components/Navbar';
import { PokemonManagement } from './pages/PokemonManagement';
import { TeamPage } from './pages/TeamPage';
import { MapPage } from './pages/MapPage';

function App() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {!isAuthPage && <Navbar />}
      <main className="flex-1 flex flex-col">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route 
            path="/" 
            element={
              <AuthGuard>
                <Home />
              </AuthGuard>
            } 
          />
          <Route 
            path="/team" 
            element={
              <AuthGuard>
                <TeamPage />
              </AuthGuard>
            } 
          />
          <Route 
            path="/box" 
            element={
              <AuthGuard>
                <PokemonManagement />
              </AuthGuard>
            } 
          />
          <Route 
            path="/map" 
            element={
              <AuthGuard>
                <MapPage />
              </AuthGuard>
            } 
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;
