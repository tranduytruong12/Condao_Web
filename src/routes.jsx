import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import HomePage from './pages/HomePage';
import CartPage from './pages/CartPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProductDetailPage from './pages/ProductDetailPage';
import SearchPage from './pages/SearchPage';
import AdminLayout from './components/layout/admin/AdminLayout';
import UserManagement from './pages/Admin/UserManagement';
import ProductManagement from './pages/Admin/ProductManagement';
import CategoryManagement from './pages/Admin/CategoryManagement';
import RoleManagement from './pages/Admin/RoleManagement';
import PaymentManagement from './pages/Admin/PaymentManagement';

export const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
        children: [
            {
                index: true,
                element: <HomePage />
            },
            {
                path: 'cart',
                element: <CartPage />
            },
            {
                path: 'login',
                element: <LoginPage />
            },
            {
                path: 'register',
                element: <RegisterPage />
            },
            {
                path: 'product/:id',
                element: <ProductDetailPage />
            },
            {
                path: 'search',
                element: <SearchPage />
            }
        ]
    },
    {
        path: '/admin',
        element: <AdminLayout />,
        children: [
            {
                path: 'users',
                element: <UserManagement />
            },
            {
                path: 'products',
                element: <ProductManagement />
            },
            {
                path: 'categories',
                element: <CategoryManagement />
            },
            {
                path: 'roles',
                element: <RoleManagement />
            },
            {
                path: 'payments',
                element: <PaymentManagement />
            }
        ]
    }
]); 