import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchProductByIdAPI, addToCartAPI } from '../services/api.service';
import { message } from 'antd';
import '../styles/ProductDetail.css';

const ProductDetailPage = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const response = await fetchProductByIdAPI(id);
                setProduct(response.data.data);
            } catch (err) {
                setError('Không thể tải thông tin sản phẩm');
                console.error('Product fetch error:', err);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchProduct();
        }
    }, [id]);

    const handleAddToCart = async () => {
        try {
            await addToCartAPI(product.id, 1);
            message.success('Đã thêm sản phẩm vào giỏ hàng');
        } catch (err) {
            message.error('Không thể thêm sản phẩm vào giỏ hàng');
            console.error('Add to cart error:', err);
        }
    };

    if (loading) {
        return (
            <div className="product-detail-container">
                <div className="loading">
                    <div className="loading-spinner"></div>
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="product-detail-container">
                <div className="error-message">
                    <h2>Lỗi</h2>
                    <p>{error || 'Không tìm thấy sản phẩm'}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="product-detail-container">
            <div className="product-detail-content">
                <div className="product-detail-left">
                    <img
                        src={product.image}
                        alt={product.name}
                        className="product-detail-image"
                    />
                </div>
                <div className="product-detail-right">
                    <h1 className="product-detail-title">{product.name}</h1>
                    <p className="product-detail-price">
                        {new Intl.NumberFormat('vi-VN', {
                            style: 'currency',
                            currency: 'VND'
                        }).format(product.price)}
                    </p>
                    <div className="product-detail-description">
                        <h3>Mô tả sản phẩm</h3>
                        <p>{product.description}</p>
                    </div>
                    <p className="product-detail-stock">
                        Còn lại: {product.stock} sản phẩm
                    </p>
                    <div className="product-detail-actions">
                        <button
                            className="btn-add-to-cart"
                            onClick={handleAddToCart}
                        >
                            Thêm vào giỏ hàng
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailPage; 