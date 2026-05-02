import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';

const NO_NAVBAR = ['/owner/dashboard'];

export default function MainLayout() {
  const { pathname } = useLocation();
  const hideNavbar = NO_NAVBAR.some((p) => pathname.startsWith(p));

  return (
    <>
      {!hideNavbar && <Navbar />}
      <Outlet />
    </>
  );
}
