import { Outlet } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    UsergroupAddOutlined,
    AuditOutlined,
    PayCircleOutlined,
    LogoutOutlined,
} from '@ant-design/icons';
import { useContext } from 'react';
import { AuthContext } from '../../context/auth.context';
import '../../../styles/AdminLayout.css';

const { Header, Sider, Content } = Layout;

const AdminLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, setUser } = useContext(AuthContext);

    const handleLogout = () => {
        setUser({
            id: "",
            email: "",
            username: "",
            roles: []
        });
        localStorage.removeItem("token");
        navigate('/');
    };

    const menuItems = [
        {
            key: 'users',
            icon: <UsergroupAddOutlined />,
            label: <Link to="/admin/users">Quản lý người dùng</Link>,
        },
        {
            key: 'products',
            icon: <AuditOutlined />,
            label: <Link to="/admin/products">Quản lý sản phẩm</Link>,
        },
        {
            key: 'payments',
            icon: <PayCircleOutlined />,
            label: <Link to="/admin/payments">Quản lý thanh toán</Link>,
        },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Đăng xuất',
            onClick: handleLogout,
        },
    ];

    const getSelectedKey = () => {
        const path = location.pathname;
        if (path.includes('/admin/users')) return 'users';
        if (path.includes('/admin/products')) return 'products';
        if (path.includes('/admin/payments')) return 'payments';
        return '';
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider width={200} theme="light">
                <div className="admin-logo">
                    <h2>Admin Panel</h2>
                </div>
                <Menu
                    mode="inline"
                    selectedKeys={[getSelectedKey()]}
                    style={{ height: '100%', borderRight: 0 }}
                    items={menuItems}
                />
            </Sider>
            <Layout>
                <Header style={{ padding: 0, background: '#fff' }}>
                    <div className="admin-header">
                        <h2>Xin chào, {user.username}</h2>
                    </div>
                </Header>
                <Content style={{ margin: '24px 16px', padding: 24, background: '#fff' }}>
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
};

export default AdminLayout; 