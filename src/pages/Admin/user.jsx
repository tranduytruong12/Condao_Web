import UserForm from "../../components/user/user.form";
import UserTable from "../../components/user/user.table";
import { useEffect, useState } from 'react';
import { fetchAllUserAPI } from '../../services/api.service';
import { message } from 'antd';
import '../../styles/UserManagement.css';

const UserPage = () => {
    const [dataUsers, setDataUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        try {
            setLoading(true);
            const res = await fetchAllUserAPI();
            if (res && res.data && res.data.user) {
                const usersWithRoles = res.data.user.map(user => ({
                    ...user,
                    role: user.Roles ? user.Roles.map(role => role.name).join(', ') : ''
                }));
                setDataUsers(usersWithRoles);
            } else {
                message.error('Không thể tải danh sách người dùng');
                setDataUsers([]);
            }
        } catch (error) {
            console.error('Error loading users:', error);
            message.error('Có lỗi xảy ra khi tải danh sách người dùng');
            setDataUsers([]);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="user-management">
            <div className="page-header">
                <h1>Quản lý người dùng</h1>
            </div>
            <div className="user-form">
                <UserForm loadUser={loadUser} />
            </div>
            <UserTable
                loadUser={loadUser}
                dataUsers={dataUsers}
                loading={loading}
            />
        </div>
    )
}

export default UserPage;