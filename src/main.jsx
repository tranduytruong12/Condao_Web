import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import LoginPage from './pages/Admin/login.jsx';
import RegisterPage from './pages/Admin/register.jsx';
import UserPage from './pages/Admin/user.jsx';
import ProductManagement from './pages/Admin/ProductManagement.jsx';
import OrderManagement from './pages/Admin/OrderManagement.jsx';
import './styles/global.css';
import ErrorPage from './pages/error.jsx';
import { AuthWrapper } from './components/context/auth.context.jsx';
import HomePage from './pages/home.jsx';
import ProductDetail from './pages/productDetail.jsx';
import CartPage from './pages/CartPage.jsx';
import PrivateRoute from './pages/private.rout.jsx';
import AdminRoute from './components/routes/AdminRoute.jsx';
import SearchResults from './pages/SearchResults.jsx';
import CheckoutPage from './pages/CheckoutPage.jsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <HomePage />
      },
      {
        path: "/admin/users",
        element:
          <AdminRoute>
            <UserPage />
          </AdminRoute>
      },
      {
        path: "/admin/products",
        element:
          <AdminRoute>
            <ProductManagement />
          </AdminRoute>
      },
      {
        path: "/admin/payments",
        element:
          <AdminRoute>
            <OrderManagement />
          </AdminRoute>
      },
      {
        path: "/product/:id",
        element: <ProductDetail />
      },
      {
        path: "/cart",
        element:
          <PrivateRoute>
            <CartPage />
          </PrivateRoute>
      },
      {
        path: "/search",
        element: <SearchResults />
      },
      {
        path: "/checkout",
        element:
          <PrivateRoute>
            <CheckoutPage />
          </PrivateRoute>
      }
    ]
  },
  {
    path: "/login",
    element: <LoginPage />
  },
  {
    path: "/register",
    element: <RegisterPage />
  }
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <AuthWrapper>
    <RouterProvider router={router} />
  </AuthWrapper>
)
