import { Routes, Route } from 'react-router-dom';
import { AuthGuard } from './components/AuthGuard';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Home } from './pages/Home';

function App() {
  return (
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
    </Routes>
  );
}

export default App;
