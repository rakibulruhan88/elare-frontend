import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'; 
import LoginScreen from './screens/LoginScreen'; 
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './screens/AdminDashboard';
import AdminProductList from './screens/AdminProductList';
import AdminProductCreate from './screens/AdminProductCreate';
import AdminProductEdit from './screens/AdminProductEdit';
import AdminOrderList from './screens/AdminOrderList';
import AdminOrderDetails from './screens/AdminOrderDetails';
import AdminCustomerList from './screens/AdminCustomerList';
import AdminCustomerEdit from './screens/AdminCustomerEdit';
import AdminCustomerCreate from './screens/AdminCustomerCreate';
import StorefrontLayout from './components/StorefrontLayout';
import HomeScreen from './screens/HomeScreen';
import ProductDetailsScreen from './screens/ProductDetailsScreen';
import CartScreen from './screens/CartScreen';
import ShippingScreen from './screens/ShippingScreen';
import SearchScreen from './screens/SearchScreen';
import ProfileScreen from './screens/ProfileScreen';
import PaymentScreen from './screens/PaymentScreen';
import PlaceOrderScreen from './screens/PlaceOrderScreen';
import OrderScreen from './screens/OrderScreen';
import ShopScreen from './screens/ShopScreen';
import ContactScreen from './screens/ContactScreen';
import AdminContactScreen from './screens/AdminContactScreen';
import AdminMessageScreen from './screens/AdminMessageScreen';
import AdminCollections from './screens/AdminCollections';
import AdminCollectionDetails from './screens/AdminCollectionDetails';
import AdminAIDashboard from './screens/AdminAIDashboard';
import Chatbot from './components/Chatbot';
import AdminAILogsScreen from './screens/AdminAILogsScreen';
import axios from 'axios';

axios.defaults.baseURL = 'https://elare-api.onrender.com';


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, 
      cacheTime: 1000 * 60 * 10, 
      refetchOnWindowFocus: false, 
    },
  },
});

function App() {
  return (

    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<StorefrontLayout />}>
            <Route index element={<HomeScreen />} />
            <Route path="product/:id" element={<ProductDetailsScreen />} />
            <Route path="cart" element={<CartScreen />} />
            <Route path="shipping" element={<ShippingScreen />} />
            <Route path="search" element={<SearchScreen />} />
            <Route path="profile" element={<ProfileScreen />} />
            <Route path="payment" element={<PaymentScreen />} />
            <Route path="placeorder" element={<PlaceOrderScreen />} />
            <Route path="order/:id" element={<OrderScreen />} />
            <Route path="shop" element={<ShopScreen />} />
            <Route path="contact" element={<ContactScreen />} />
          </Route>
          
          <Route path="/login" element={<LoginScreen />} />

          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProductList />} />
            <Route path="products/create" element={<AdminProductCreate />} />
            <Route path="products/:id/edit" element={<AdminProductEdit />} />
            <Route path="collections" element={<AdminCollections />} />
            <Route path="collections/:id" element={<AdminCollectionDetails />} />
            <Route path="orders" element={<AdminOrderList />} />
            <Route path="orders/:id" element={<AdminOrderDetails />} />
            <Route path="customers" element={<AdminCustomerList />} />
            <Route path="customers/create" element={<AdminCustomerCreate />} />
            <Route path="customers/:id/edit" element={<AdminCustomerEdit />} />
            <Route path="messages" element={<AdminContactScreen />} />
            <Route path="messages/:id" element={<AdminMessageScreen />} />
            <Route path="/admin/ai-dashboard" element={<AdminAIDashboard />} />
            <Route path="/admin/ai-logs" element={<AdminAILogsScreen />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;