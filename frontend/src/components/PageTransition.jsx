import { useLocation } from 'react-router-dom';

/**
 * Wraps every route in a fade-up animation.
 * Using `key={pathname}` makes React remount the div on navigation,
 * which re-triggers the CSS animation automatically.
 */
export default function PageTransition({ children }) {
  const { pathname } = useLocation();
  return (
    <div key={pathname} className="page-enter">
      {children}
    </div>
  );
}
