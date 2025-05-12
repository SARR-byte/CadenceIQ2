import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Grid, Calendar } from 'lucide-react';
import classNames from 'classnames';
import Logo from '../common/Logo';

const AppLayout = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-charcoal-50 flex flex-col">
      <header className="bg-white shadow-sm border-b border-charcoal-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <Logo size="small" />
          </div>
          <nav className="hidden md:flex space-x-6">
            <NavLink to="/app/contacts" active={location.pathname.includes('/app/contacts')}>
              <Grid className="w-5 h-5 mr-2" />
              Contact Grid
            </NavLink>
            <NavLink to="/app/calendar" active={location.pathname.includes('/app/calendar')}>
              <Calendar className="w-5 h-5 mr-2" />
              Follow-up Calendar
            </NavLink>
          </nav>
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md text-charcoal-700 hover:text-charcoal-900 focus:outline-none"
            >
              <svg 
                className="h-6 w-6" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
        {isOpen && (
          <div className="md:hidden border-b border-charcoal-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <MobileNavLink 
                to="/app/contacts" 
                active={location.pathname.includes('/app/contacts')}
                onClick={() => setIsOpen(false)}
              >
                <Grid className="w-5 h-5 mr-2" />
                Contact Grid
              </MobileNavLink>
              <MobileNavLink 
                to="/app/calendar" 
                active={location.pathname.includes('/app/calendar')}
                onClick={() => setIsOpen(false)}
              >
                <Calendar className="w-5 h-5 mr-2" />
                Follow-up Calendar
              </MobileNavLink>
            </div>
          </div>
        )}
      </header>
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Outlet />
        </div>
      </main>
      <footer className="bg-white border-t border-charcoal-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-charcoal-500 text-center">
            © {new Date().getFullYear()} CadenceIQ | A simple yet powerful contact management tool
          </p>
        </div>
      </footer>
    </div>
  );
};

interface NavLinkProps {
  to: string;
  active: boolean;
  children: React.ReactNode;
}

const NavLink = ({ to, active, children }: NavLinkProps) => {
  return (
    <Link
      to={to}
      className={classNames(
        'flex items-center px-3 py-2 rounded-md text-sm font-medium',
        {
          'bg-charcoal-100 text-charcoal-900': active,
          'text-charcoal-600 hover:text-charcoal-900 hover:bg-charcoal-50': !active,
        }
      )}
    >
      {children}
    </Link>
  );
};

interface MobileNavLinkProps extends NavLinkProps {
  onClick: () => void;
}

const MobileNavLink = ({ to, active, onClick, children }: MobileNavLinkProps) => {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={classNames(
        'flex items-center px-3 py-2 rounded-md text-base font-medium',
        {
          'bg-charcoal-100 text-charcoal-900': active,
          'text-charcoal-600 hover:text-charcoal-900 hover:bg-charcoal-50': !active,
        }
      )}
    >
      {children}
    </Link>
  );
};

export default AppLayout;