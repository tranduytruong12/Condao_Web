import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchProductsAPI } from '../services/api.service';
import { addToCartAPI } from '../services/api.service';
import { message } from 'antd';
import '../styles/Search.css';

const SearchPage = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('query');
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSearchResults = async () => {
            try {
                setLoading(true);
                const response = await searchProductsAPI(query);
                setProducts(response.data.data);
            } catch (err) {
                setError('Không thể tải kết quả tìm kiếm');
                console.error('Search error:', err);
            } finally {
                setLoading(false);
            }
        };

        if (query) {
            fetchSearchResults();
        } else {
            setLoading(false);
        }
    }, [query]);

    const handleAddToCart = async (productId) => {
        try {
            await addToCartAPI(productId, 1);
            message.success('Đã thêm sản phẩm vào giỏ hàng');
        } catch (err) {
            message.error('Không thể thêm sản phẩm vào giỏ hàng');
            console.error('Add to cart error:', err);
        }
    };

    if (loading) {
        return (
            <div className="search-container">
                <div className="loading">
                    <div className="loading-spinner"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="search-container">
                <div className="search-header">
                    <h1>Lỗi</h1>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="search-container">
            <div className="search-header">
                <h1>Kết quả tìm kiếm cho "{query}"</h1>
                <p>{products.length} sản phẩm được tìm thấy</p>
            </div>

            {products.length === 0 ? (
                <div className="no-results">
                    <p>Không tìm thấy sản phẩm nào phù hợp với từ khóa "{query}"</p>
                </div>
            ) : (
                <div className="search-results">
                    {products.map((product) => (
                        <div key={product.id} className="product-card">
                            <img
                                src={product.image}
                                alt={product.name}
                                className="product-image"
                            />
                            <div className="product-info">
                                <h3 className="product-name">{product.name}</h3>
                                <p className="product-price">
                                    {new Intl.NumberFormat('vi-VN', {
                                        style: 'currency',
                                        currency: 'VND'
                                    }).format(product.price)}
                                </p>
                                <p className="product-description">
                                    {product.description}
                                </p>
                                <div className="product-actions">
                                    <button
                                        className="add-to-cart-btn"
                                        onClick={() => handleAddToCart(product.id)}
                                    >
                                        Thêm vào giỏ hàng
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SearchPage; 