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
import MyOrders from './pages/MyOrders';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ProtectedRoute from './components/ProtectedRoute';
import PageTransition from './components/PageTransition';
import { api } from './lib/api';


// ── Google Fonts loader ─────────────────────────────────
const FONT_OPTIONS = [
  // Heading / serif / display
  'Playfair Display',
  'Cormorant Garamond',
  'Lora',
  'DM Serif Display',
  'Fraunces',
  'Bodoni Moda',
  'Cormorant Upright',
  'Marcellus',
  // Body / sans-serif
  'Inter',
  'DM Sans',
  'Poppins',
  'Montserrat',
  'Manrope',
  'Sora',
  'Outfit',
  'Work Sans',
  'Karla',
  'Nunito Sans',
];

function loadGoogleFonts(fonts) {
  const unique = [...new Set(fonts.filter(Boolean))];
  if (!unique.length) return;
  const param = unique.map(f => `family=${f.replace(/ /g, '+')}:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500`).join('&');
  let link = document.getElementById('gfonts-theme');
  if (!link) {
    link = document.createElement('link');
    link.id = 'gfonts-theme';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }
  link.href = `https://fonts.googleapis.com/css2?${param}&display=swap`;
}

// ── Theme & Favicon applier ─────────────────────────────
function ThemeApplier() {
  useEffect(() => {
    api.getSettings()
      .then(s => {
        const root = document.documentElement;

        // Favicon
        if (s.favicon_url) {
          let link = document.querySelector("link[rel~='icon']");
          if (!link) { link = document.createElement('link'); link.rel = 'icon'; document.head.appendChild(link); }
          link.href = s.favicon_url;
        }

        // Colours → CSS custom properties
        const colorMap = {
          theme_bg:          ['--bg', '--cream', '--warm-white'],
          theme_card:        ['--card'],
          theme_primary:     ['--primary', '--ink'],
          theme_secondary:   ['--secondary', '--ink-soft'],
          theme_accent:      ['--accent', '--gold', '--soft-gold'],
          theme_accent_dark: ['--accent-dark'],
          theme_border:      ['--border'],
          theme_muted:       ['--ink-muted'],
          theme_success:     ['--success'],
          theme_warning:     ['--warning'],
          theme_error:       ['--error'],
          theme_accent_pale: ['--accent-pale'],
        };
        for (const [key, vars] of Object.entries(colorMap)) {
          if (s[key]) vars.forEach(v => root.style.setProperty(v, s[key]));
        }

        // Motion timing
        const motionStyle = s.theme_motion_style || 'normal';
        const timings = {
          subtle:  { fast: '0.08s', base: '0.14s', slow: '0.22s' },
          normal:  { fast: '0.15s', base: '0.22s', slow: '0.38s' },
          playful: { fast: '0.22s', base: '0.38s', slow: '0.60s' },
        };
        const t = timings[motionStyle] || timings.normal;
        root.style.setProperty('--t-fast', t.fast);
        root.style.setProperty('--t-base', t.base);
        root.style.setProperty('--t-slow', t.slow);

        // Page transitions toggle
        if (s.theme_page_transitions === 'false') root.setAttribute('data-no-page-transition', '');
        else root.removeAttribute('data-no-page-transition');

        // Hover card animations toggle
        if (s.theme_hover_cards === 'false') root.setAttribute('data-no-hover-cards', '');
        else root.removeAttribute('data-no-hover-cards');

        // Reduced motion toggle
        if (s.theme_reduced_motion === 'true') root.setAttribute('data-reduced-motion', '');
        else root.removeAttribute('data-reduced-motion');

        // Border radius
        const radiusMap = {
          sharp:   { r: '4px',  sm: '3px'  },
          soft:    { r: '16px', sm: '10px' },
          rounded: { r: '24px', sm: '16px' },
        };
        const rad = radiusMap[s.theme_radius] || radiusMap.soft;
        root.style.setProperty('--radius',    rad.r);
        root.style.setProperty('--radius-sm', rad.sm);

        // Shadow intensity
        const shadowMap = {
          flat:     { base: '0 1px 4px rgba(0,0,0,0.04)',    sm: '0 1px 3px rgba(0,0,0,0.03)',    lg: '0 4px 16px rgba(0,0,0,0.06)'   },
          soft:     { base: '0 8px 32px rgba(0,0,0,0.08)',   sm: '0 2px 12px rgba(0,0,0,0.05)',   lg: '0 24px 64px rgba(0,0,0,0.12)'  },
          elevated: { base: '0 12px 40px rgba(0,0,0,0.14)',  sm: '0 4px 16px rgba(0,0,0,0.08)',   lg: '0 32px 80px rgba(0,0,0,0.18)'  },
        };
        const sh = shadowMap[s.theme_shadow] || shadowMap.soft;
        root.style.setProperty('--shadow',    sh.base);
        root.style.setProperty('--shadow-sm', sh.sm);
        root.style.setProperty('--shadow-lg', sh.lg);

        // Density / spacing
        const densityMap = {
          compact:     '0.75rem',
          comfortable: '1rem',
          spacious:    '1.375rem',
        };
        root.style.setProperty('--space-unit', densityMap[s.theme_density] || densityMap.comfortable);

        // Fonts
        const headingFont = s.theme_heading_font || 'Playfair Display';
        const bodyFont    = s.theme_body_font    || 'Inter';
        loadGoogleFonts([headingFont, bodyFont]);
        root.style.setProperty('--heading-font', `'${headingFont}', serif`);
        root.style.setProperty('--body-font',    `'${bodyFont}', sans-serif`);

        // Inject a style block to propagate heading font to component-level selectors
        let styleEl = document.getElementById('theme-font-override');
        if (!styleEl) {
          styleEl = document.createElement('style');
          styleEl.id = 'theme-font-override';
          document.head.appendChild(styleEl);
        }
        styleEl.textContent = `
          h1, h2, h3, h4, .display,
          .card-name, .card-price, .hero-title,
          .testi-quote { font-family: var(--heading-font) !important; }
          body, button, input, select, textarea { font-family: var(--body-font) !important; }
        `;
      })
      .catch(() => {});
  }, []);

  return null;
}



export default function App() {

  return (

    <AuthProvider>

      <CartProvider>

        <BrowserRouter>

          <ThemeApplier />

          <PageTransition>

            <Routes>

              <Route path="/" element={<Home />} />

              <Route path="/login" element={<Login />} />

              <Route path="/signup" element={<Signup />} />

              <Route path="/checkout" element={<Checkout />} />

              <Route path="/contact" element={<Contact />} />
              <Route path="/my-orders" element={<MyOrders />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              <Route 
                path="/product/:id" 
                element={<ProductDetails />} 
              />


              <Route 
                path="/admin/login" 
                element={<AdminLogin />} 
              />


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
