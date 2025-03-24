import UserForm from "../../components/user/user.form";
import UserTable from "../../components/user/user.table";
import { useEffect, useState } from 'react';
import { fetchAllUserAPI } from '../../services/api.service';
import '../../styles/UserManagement.css';

const UserPage = () => {
    const [dataUsers, setDataUsers] = useState([]);

    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        const res = await fetchAllUserAPI();
        const usersWithRoles = res.data.user.map(user => ({
            ...user,
            role: user.Roles.map(role => role.name).join(', ')
        }));
        setDataUsers(usersWithRoles);
    }

    return (
        <div className="user-management">
            <div className="page-header">
                <h1>User Management</h1>
            </div>
            <div className="user-form">
                <UserForm loadUser={loadUser} />
            </div>
            <UserTable
                loadUser={loadUser}
                dataUsers={dataUsers} />
        </div>
    )
}

export default UserPage;