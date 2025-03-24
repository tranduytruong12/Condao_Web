import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchProductByIdAPI, addToCartAPI } from '../services/api.service';
import '../styles/productDetail.css';
import { notification, Spin } from 'antd';

const ProductDetail = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadProduct = async () => {
            try {
                const res = await fetchProductByIdAPI(id);
                if (res.data) {
                    setProduct(res.data.product);
                    console.log(">check ", res.data)
                }
            } catch (error) {
                console.error("Failed to fetch product details", error);
            } finally {
                setLoading(false);
            }
        };
        loadProduct();
    }, [id]);

    const handleAddToCart = async () => {
        try {
            const res = await addToCartAPI(product.id);
            if (res.data) {
                notification.success({
                    message: "Thông báo",
                    description: "thêm sản phẩm vào giỏ hàng thành công"
                });
            } else {
                notification.error({
                    message: "Lỗi",
                    description: "thêm sản phẩm vào giỏ hàng thất bại hoặc bạn chưa đăng nhập"
                });
            }
        } catch (error) {
            console.error("Failed to add product to cart", error);
            // message.error("Failed to add product to cart");
        }
    };

    if (loading) return <div className="center-spinner"><Spin size="large" /></div>;
    if (!product) return <div>Loading...</div>;

    return (
        <div className="product-detail-container">
            <div className="product-detail-content">
                <div className="product-detail-left">
                    <img src={product.image.startsWith('http') ? product.image : `${import.meta.env.VITE_BACKEND_URL}/image/products/${product.image}`}
                        alt={product.name} className="product-detail-image" />
                </div>
                <div className="product-detail-right">
                    <h1 className="product-detail-title">{product.name}</h1>
                    <div className="product-detail-price">
                        {product.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                    </div>
                    <div className="product-detail-description">
                        <h3>Description</h3>
                        <p>{product.description}</p>
                    </div>
                    <div className="product-detail-stock">
                        <span>Stock: {product.stock}</span>
                    </div>
                    <div className="product-detail-actions">
                        <button className="btn-add-to-cart" onClick={handleAddToCart}>Add to Cart</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
