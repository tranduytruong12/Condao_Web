import { Table, Popconfirm, notification } from 'antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import UpdateUserModal from './update.user.modal';
import { useState } from 'react';
import ViewUserDetail from './view.user.Detail';
import { deleteUserAPI } from '../../services/api.service';

const UserTable = (props) => {
    const { dataUsers, loadUser, loading } = props;

    const [isModalUpdateOpen, setIsModalUpdateOpen] = useState(false);
    const [dataUpdate, setDataUpdate] = useState(null);

    const [dataDetail, setDataDetail] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    const handleDeleteUser = async (id) => {
        try {
            // console.log(`Deleting user with id: ${id}`); // Thêm log để kiểm tra id
            const res = await deleteUserAPI(id);
            // console.log(">>> res", res); // Thêm log để kiểm tra phản hồi từ API
            if (res && res.data) {
                notification.success({
                    message: "Delete user",
                    description: "Xóa user thành công"
                });
                await loadUser();
            } else {
                notification.error({
                    message: "Error delete user",
                    description: JSON.stringify(res.message || "Không có phản hồi từ server")
                });
            }
        } catch (error) {
            console.log(">>> error", error);
            notification.error({
                message: "Error delete user",
                description: error.message || "Có lỗi xảy ra khi xóa user"
            });
        }
    }

    const columns = [
        {
            title: 'Id',
            dataIndex: 'id',
            render: (_, record) => {
                return (
                    <a href="#"
                        onClick={() => {
                            setDataDetail(record);
                            setIsDetailOpen(true);
                        }}
                    >{record.id}</a>
                )
            }
        },
        {
            title: 'UserName',
            dataIndex: 'username',
        },
        {
            title: 'Email',
            dataIndex: 'email',
        },
        {
            title: 'Vai Trò',
            dataIndex: 'role',
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <div style={{ display: "flex", gap: "20px" }}>
                    <EditOutlined
                        onClick={() => {
                            setIsModalUpdateOpen(true);
                            setDataUpdate(record);
                            // console.log(">>> record", record)
                        }}
                        style={{ cursor: "pointer", color: "orange" }} />
                    <Popconfirm
                        title="Xóa người dùng"
                        description="Bạn chắc chắn xóa user này ?"
                        onConfirm={() => handleDeleteUser(record.id)}
                        okText="Yes"
                        cancelText="No"
                        placement="left"

                    >
                        <DeleteOutlined style={{ cursor: "pointer", color: "red" }} />
                    </Popconfirm>
                </div>
            ),
        },
    ];



    return (
        <>
            <Table
                columns={columns}
                dataSource={dataUsers}
                rowKey={"id"}
                loading={loading}
            />
            <UpdateUserModal
                isModalUpdateOpen={isModalUpdateOpen}
                setIsModalUpdateOpen={setIsModalUpdateOpen}
                dataUpdate={dataUpdate}
                setDataUpdate={setDataUpdate}
                loadUser={loadUser}
            />
            <ViewUserDetail
                dataDetail={dataDetail}
                setDataDetail={setDataDetail}
                isDetailOpen={isDetailOpen}
                setIsDetailOpen={setIsDetailOpen}
            />
        </>
    )
}

export default UserTable;