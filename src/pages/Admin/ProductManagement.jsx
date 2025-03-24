import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Select, Upload, message, Space, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import { fetchAllProductsAPI, createProductAPI, updateProductAPI, deleteProductAPI, fetchAllCategoryAPI, handleUploadFile } from '../../services/api.service';
import '../../styles/ProductManagement.css';

const { Option } = Select;

const ProductManagement = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [form] = Form.useForm();

    useEffect(() => {
        loadProducts();
        loadCategories();
    }, []);

    const loadProducts = async () => {
        try {
            const res = await fetchAllProductsAPI();
            if (res.data) {
                setProducts(res.data.products);
            }
        } catch (error) {
            message.error('Failed to load products');
        }
    };

    const loadCategories = async () => {
        try {
            const res = await fetchAllCategoryAPI();
            if (res.data && res.data.categories) {
                setCategories(res.data.categories);
            }
        } catch (error) {
            message.error('Failed to load categories');
        }
    };

    const handleAddProduct = () => {
        setEditingProduct(null);
        form.resetFields();
        setModalVisible(true);
    };

    const handleEditProduct = (product) => {
        setEditingProduct(product);
        form.setFieldsValue({
            name: product.name,
            price: product.price,
            stock: product.stock,
            categoryId: product.categoryId,
            description: product.description,
            image: product.image
        });
        setModalVisible(true);
    };

    const handleDeleteProduct = async (productId) => {
        try {
            const res = await deleteProductAPI(productId);
            if (res.data) {
                message.success('Product deleted successfully');
                loadProducts();
            }
        } catch (error) {
            message.error('Failed to delete product');
        }
    };

    const handleModalOk = async () => {
        try {
            const values = await form.validateFields();
            if (editingProduct) {
                const res = await updateProductAPI(
                    editingProduct.id,
                    values.name,
                    values.description,
                    values.price,
                    values.stock,
                    values.categoryId,
                    values.image
                );
                if (res.data) {
                    message.success('Product updated successfully');
                    setModalVisible(false);
                    loadProducts();
                }
            } else {
                const res = await createProductAPI(
                    values.name,
                    values.description,
                    values.price,
                    values.stock,
                    values.categoryId,
                    values.image
                );
                if (res.data) {
                    message.success('Product created successfully');
                    setModalVisible(false);
                    loadProducts();
                }
            }
        } catch (error) {
            message.error('Failed to save product');
            console.error('Error:', error);
        }
    };

    const handleImageUpload = async (file) => {
        try {
            const res = await handleUploadFile(file, 'products');
            if (res.data && res.data.name) {
                form.setFieldValue('image', res.data.name);
                message.success('Image uploaded successfully');
            } else {
                message.error('Failed to upload image: Invalid response');
            }
        } catch (error) {
            message.error('Failed to upload image');
            console.error('Error:', error);
        }
    };

    const columns = [
        {
            title: 'Image',
            dataIndex: 'image',
            key: 'image',
            render: (image) => (
                <img 
                    src={image.startsWith('http') ? image : `${import.meta.env.VITE_BACKEND_URL}/image/products/${image}`}
                    alt="Product"
                    style={{ width: 50, height: 50, objectFit: 'cover' }}
                />
            ),
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Price',
            dataIndex: 'price',
            key: 'price',
            render: (price) => (
                <span>{price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</span>
            ),
        },
        {
            title: 'Stock',
            dataIndex: 'stock',
            key: 'stock',
            render: (stock) => (
                <Tag color={stock > 0 ? 'green' : 'red'}>
                    {stock > 0 ? `In Stock (${stock})` : 'Out of Stock'}
                </Tag>
            ),
        },
        {
            title: 'Category',
            dataIndex: 'categoryId',
            key: 'categoryId',
            render: (categoryId) => {
                const category = categories.find(c => c.id === categoryId);
                return category ? category.name : 'N/A';
            },
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button 
                        type="primary" 
                        icon={<EditOutlined />}
                        onClick={() => handleEditProduct(record)}
                    >
                        Edit
                    </Button>
                    <Button 
                        danger 
                        icon={<DeleteOutlined />}
                        onClick={() => handleDeleteProduct(record.id)}
                    >
                        Delete
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <div className="product-management">
            <div className="page-header">
                <h1>Product Management</h1>
                <Button 
                    type="primary" 
                    icon={<PlusOutlined />}
                    onClick={handleAddProduct}
                >
                    Add Product
                </Button>
            </div>

            <Table 
                columns={columns} 
                dataSource={products}
                rowKey="id"
                loading={loading}
            />

            <Modal
                title={editingProduct ? 'Edit Product' : 'Add Product'}
                open={modalVisible}
                onOk={handleModalOk}
                onCancel={() => setModalVisible(false)}
                width={600}
            >
                <Form
                    form={form}
                    layout="vertical"
                >
                    <Form.Item
                        name="name"
                        label="Product Name"
                        rules={[{ required: true, message: 'Please input product name!' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="price"
                        label="Price"
                        rules={[{ required: true, message: 'Please input product price!' }]}
                    >
                        <InputNumber
                            style={{ width: '100%' }}
                            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={value => value.replace(/\$\s?|(,*)/g, '')}
                            min={0}
                        />
                    </Form.Item>

                    <Form.Item
                        name="stock"
                        label="Stock"
                        rules={[{ required: true, message: 'Please input product stock!' }]}
                    >
                        <InputNumber style={{ width: '100%' }} min={0} />
                    </Form.Item>

                    <Form.Item
                        name="categoryId"
                        label="Category"
                        rules={[{ required: true, message: 'Please select a category!' }]}
                    >
                        <Select>
                            {categories.map(category => (
                                <Option key={category.id} value={category.id}>
                                    {category.name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="Description"
                    >
                        <Input.TextArea rows={4} />
                    </Form.Item>

                    <Form.Item
                        name="image"
                        label="Product Image"
                        rules={[{ required: true, message: 'Please upload a product image!' }]}
                    >
                        <Upload
                            listType="picture"
                            maxCount={1}
                            beforeUpload={(file) => {
                                handleImageUpload(file);
                                return false;
                            }}
                        >
                            <Button icon={<UploadOutlined />}>Upload Image</Button>
                        </Upload>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ProductManagement; 