import ProductDetails from './pages/ProductDetails';
import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Checkout from './pages/Checkout';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import Contact from './pages/Contact';
import ProtectedRoute from './components/ProtectedRoute';
import PageTransition from './components/PageTransition';
import { api } from './lib/api';

function FaviconUpdater() {
  useEffect(() => {
    api.getSettings().then(s => {
      if (s.favicon_url) {
        let link = document.querySelector("link[rel~='icon']");
        if (!link) {
          link = document.createElement('link');
          link.rel = 'icon';
          document.head.appendChild(link);
        }
        link.href = s.favicon_url;
      }
    }).catch(() => {});
  }, []);
  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <FaviconUpdater />
          <PageTransition>
            <Routes>
<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/login" element={<Login />} />
  <Route path="/signup" element={<Signup />} />
  <Route path="/checkout" element={<Checkout />} />
  <Route path="/contact" element={<Contact />} />
  <Route path="/product/:id" element={<ProductDetails />} />
  <Route path="/admin/login" element={<AdminLogin />} />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </PageTransition>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}
