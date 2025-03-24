import axios from './axios.customize';

const createUserAPI = (email, username, password, phone, role) => {
    const URL_BACKEND = "/v2/api/create-user";
    const data = {
        email: email,
        password: password,
        username: username,
        phone: phone,
        role: role
    }
    return axios.post(URL_BACKEND, data);
}

const register = (email, username, password, phone) => {
    const URL_BACKEND = "/v2/api/register";
    const data = {
        email: email,
        password: password,
        username: username,
        phone: phone,
    }
    return axios.post(URL_BACKEND, data);
}

const updateUserAPI = (id, username, email, phone, role) => {
    const URL_BACKEND = "/v2/api/update-user";
    const data = {
        id: id,
        username: username,
        email: email,
        phone: phone,
        role: role,
    }
    return axios.put(URL_BACKEND, data);
}

const deleteUserAPI = (id) => {
    const URL_BACKEND = `/v2/api/delete-user/${id}`;//backtick
    return axios.delete(URL_BACKEND);
}

const fetchAllUserAPI = () => {
    const URL_BACKEND = "/v2/api/user-all";
    return axios.get(URL_BACKEND);
}

const handleUploadFile = (file, folder) => {
    const URL_BACKEND = `/v2/api/file`;
    let config = {
        headers: {
            "upload-type": folder,
            "Content-Type": "multipart/form-data"
        }
    }

    const bodyFormData = new FormData();
    bodyFormData.append("image", file)
    return axios.post(URL_BACKEND, bodyFormData, config);
}

const fetchAllRoleAPI = () => {
    const URL_BACKEND = "/v2/api/role-all";
    return axios.get(URL_BACKEND);
}

const loginApi = (email, password) => {
    const URL_BACKEND = "/v2/api/login";
    const data = {
        email: email,
        password: password
    }
    return axios.post(URL_BACKEND, data);
}

const getAccountAPI = () => {
    const URL_BACKEND = "/v2/api/verify-token";
    return axios.get(URL_BACKEND);
}

const fetchAllProductsAPI = () => {
    const URL_BACKEND = "/v2/api/product-all";
    return axios.get(URL_BACKEND);
}

const fetchProductByIdAPI = (id) => {
    const URL_BACKEND = `/v2/api/product/${id}`;
    return axios.get(URL_BACKEND);
}

const fetchAllCartAPI = () => {
    const URL_BACKEND = "/v2/api/cart";
    return axios.get(URL_BACKEND);
}

const addToCartAPI = (productId, quantity = 1) => {
    const URL_BACKEND = "/v2/api/cart/add";
    const data = {
        productId: productId,
        quantity: quantity
    }
    return axios.post(URL_BACKEND, data);
}

const deleteFromCartAPI = (cartItemId) => {
    const URL_BACKEND = `/v2/api/cart/delete/${cartItemId}`;
    return axios.delete(URL_BACKEND);
}

const updateCartQuantityAPI = (cartItemId, quantity) => {
    const URL_BACKEND = `/v2/api/cart/update/${cartItemId}`;
    const data = {
        quantity: quantity
    }
    return axios.put(URL_BACKEND, data);
}

const createProductAPI = (name, description, price, stock, categoryId, image) => {
    const URL_BACKEND = "/v2/api/product";
    const data = {
        name: name,
        description: description,
        price: price,
        stock: stock,
        categoryId: categoryId,
        image: image
    };
    return axios.post(URL_BACKEND, data);
};

const updateProductAPI = (id, name, description, price, stock, categoryId, image) => {
    const URL_BACKEND = "/v2/api/update-product";
    const data = {
        id,
        name,
        price,
        description,
        stock,
        categoryId,
        image
    }
    return axios.put(URL_BACKEND, data);
}

const deleteProductAPI = (id) => {
    const URL_BACKEND = `/v2/api/delete-product/${id}`;
    return axios.delete(URL_BACKEND);
}

const fetchAllCategoryAPI = () => {
    const URL_BACKEND = "/v2/api/category-all";
    return axios.get(URL_BACKEND);
}

const searchProductsAPI = (query) => {
    const URL_BACKEND = `/v2/api/products/search?name=${encodeURIComponent(query)}`;
    return axios.get(URL_BACKEND);
}

const fetchAllProductsByCategoryAPI = (categoryId) => {
    const URL_BACKEND = `/v2/api/product/category/${categoryId}`;
    return axios.get(URL_BACKEND);
}

const fetchOrdersAPI = () => {
    const URL_BACKEND = "/v2/api/orders";
    return axios.get(URL_BACKEND);
}

export const updateOrderStatusAPI = async (orderId, status) => {
    try {
        const response = await axios.put(
            `/v2/api/order/${orderId}/status`,
            { status },
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            }
        );
        return response;
    } catch (error) {
        throw error;
    }
};

export {
    createUserAPI,
    updateUserAPI,
    fetchAllUserAPI,
    deleteUserAPI,
    handleUploadFile,
    fetchAllRoleAPI,
    loginApi,
    getAccountAPI,
    fetchAllProductsAPI,
    fetchProductByIdAPI,
    fetchAllCartAPI,
    addToCartAPI,
    deleteFromCartAPI,
    updateCartQuantityAPI,
    register,
    createProductAPI,
    updateProductAPI,
    deleteProductAPI,
    fetchAllCategoryAPI,
    searchProductsAPI,
    fetchAllProductsByCategoryAPI,
    fetchOrdersAPI,
}