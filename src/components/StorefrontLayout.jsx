import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import CartDrawer from './CartDrawer';
import Chatbot from './Chatbot';

const StorefrontLayout = () => {
  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden">
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      
      <Footer />
      <CartDrawer />
      <Chatbot />
    </div>
  );
};

export default StorefrontLayout;