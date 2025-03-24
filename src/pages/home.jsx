import { useEffect, useState } from 'react';
import { fetchAllProductsAPI, addToCartAPI, fetchAllCategoryAPI, fetchAllProductsByCategoryAPI } from '../services/api.service';
import { useNavigate } from 'react-router-dom';
import { notification, Spin, Empty, Badge, Tag } from 'antd';
import { ShoppingCartOutlined, EyeOutlined, FireOutlined, StarOutlined } from '@ant-design/icons';
import gsap from 'gsap';
import Slideshow from '../components/slideshow/Slideshow';
import '../styles/home.css';

const HomePage = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        loadCategories();
    }, []);

    useEffect(() => {
        if (selectedCategory) {
            loadProductsByCategory(selectedCategory);
        } else {
            loadProducts();
        }
    }, [selectedCategory]);

    const loadCategories = async () => {
        try {
            const res = await fetchAllCategoryAPI();
            if (res.data && res.data.categories) {
                setCategories(res.data.categories);
            }
        } catch (error) {
            console.error("Failed to fetch categories", error);
            notification.error({
                message: "Lỗi",
                description: "Không thể tải danh mục sản phẩm"
            });
        }
    };

    const loadProducts = async () => {
        try {
            const res = await fetchAllProductsAPI();
            if (res.data) {
                setProducts(res.data.products);
            }
        } catch (error) {
            console.error("Failed to fetch products", error);
            notification.error({
                message: "Lỗi",
                description: "Không thể tải sản phẩm"
            });
        } finally {
            setLoading(false);
        }
    };

    const loadProductsByCategory = async (categoryId) => {
        setLoading(true);
        try {
            const res = await fetchAllProductsByCategoryAPI(categoryId);
            if (res.data) {
                setProducts(res.data);
            }
        } catch (error) {
            console.error("Failed to fetch products by category", error);
            notification.error({
                message: "Lỗi",
                description: "Không thể tải sản phẩm theo danh mục"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = async (product, event) => {
        try {
            const res = await addToCartAPI(product.id);
            if (res.data) {
                notification.success({
                    message: "Thông báo",
                    description: "Thêm sản phẩm vào giỏ hàng thành công"
                });
                window.dispatchEvent(new Event('cartUpdated'));
                animateProductToCart(event.target);
            } else {
                notification.error({
                    message: "Lỗi",
                    description: "Thêm sản phẩm vào giỏ hàng thất bại hoặc bạn chưa đăng nhập"
                });
            }
        } catch (error) {
            console.error("Failed to add product to cart", error);
        }
    };

    const animateProductToCart = (button) => {
        const productCard = button.closest('.product-card');
        const productImage = productCard.querySelector('.product-image');
        const cartIcon = document.querySelector('.anticon-shopping-cart');

        if (!cartIcon) {
            console.error('Cart icon not found');
            return;
        }

        const productImageClone = productImage.cloneNode(true);
        productImageClone.style.position = 'fixed';
        productImageClone.style.zIndex = 1000;
        productImageClone.style.width = '100px';
        productImageClone.style.height = '100px';
        productImageClone.style.top = `${productImage.getBoundingClientRect().top}px`;
        productImageClone.style.left = `${productImage.getBoundingClientRect().left}px`;
        productImageClone.style.objectFit = 'contain';
        productImageClone.style.borderRadius = '50%';
        productImageClone.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';

        document.body.appendChild(productImageClone);

        gsap.to(productImageClone, {
            duration: 1.5,
            x: cartIcon.getBoundingClientRect().left - productImage.getBoundingClientRect().left,
            y: cartIcon.getBoundingClientRect().top - productImage.getBoundingClientRect().top,
            scale: 0.1,
            opacity: 0.7,
            ease: "power2.inOut",
            onComplete: () => {
                productImageClone.remove();
                gsap.to(cartIcon, {
                    scale: 1.5,
                    duration: 0.3,
                    yoyo: true,
                    repeat: 1
                });
            }
        });
    };

    const handleViewDetails = (product) => {
        navigate(`/product/${product.id}`);
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <div className="home-container">
            <div className="hero-section">
                <div className="slideshow-container">
                    <Slideshow />
                </div>
                <div className="hero-content">
                    <h1 className="hero-title">Khám phá sản phẩm chất lượng</h1>
                    <p className="hero-subtitle">Tìm kiếm và mua sắm những sản phẩm tốt nhất với giá cả hợp lý</p>
                </div>
            </div>

            <div className="home-content">

                <div className={`category-sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
                    <div className="category-header">
                        <h2 className="category-title">Danh mục sản phẩm</h2>
                        <div className="category-count">{categories.length} danh mục</div>
                    </div>
                    <div className="category-list">
                        <div 
                            className={`category-item ${selectedCategory === null ? 'active' : ''}`}
                            onClick={() => {
                                setSelectedCategory(null);
                                setIsMobileMenuOpen(false);
                            }}
                        >
                            <span className="category-icon">🏠</span>
                            <span className="category-name">Tất cả sản phẩm</span>
                        </div>
                        {categories.map((category) => (
                            <div 
                                key={category.id}
                                className={`category-item ${selectedCategory === category.id ? 'active' : ''}`}
                                onClick={() => {
                                    setSelectedCategory(category.id);
                                    setIsMobileMenuOpen(false);
                                }}
                            >
                                <span className="category-icon">📦</span>
                                <span className="category-name">{category.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="products-section">
                    <div className="section-header">
                        <h1 className="home-title">
                            {selectedCategory 
                                ? categories.find(c => c.id === selectedCategory)?.name 
                                : "Tất cả sản phẩm"}
                        </h1>
                        <div className="product-count">
                            {products.length} sản phẩm
                        </div>
                    </div>

                    {loading ? (
                        <div className="center-spinner">
                            <Spin size="large" />
                        </div>
                    ) : (
                        <div className="products-grid">
                            {products.length > 0 ? (
                                products.map((product, index) => (
                                    <div key={index} className="product-card">
                                        <div className="product-image-container">
                                            <img
                                                src={product.image.startsWith('http') ? product.image : `${import.meta.env.VITE_BACKEND_URL}/image/products/${product.image}`}
                                                alt={product.name}
                                                className="product-image"
                                                onClick={() => handleViewDetails(product)}
                                            />
                                            {product.stock <= 0 && (
                                                <div className="out-of-stock-overlay">
                                                    <span>Hết hàng</span>
                                                </div>
                                            )}
                                            {product.stock > 0 && product.stock < 10 && (
                                                <div className="low-stock-overlay">
                                                    <span>Sắp hết hàng</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="product-info">
                                            <div className="product-header">
                                                <h2 className="product-title" onClick={() => handleViewDetails(product)}>
                                                    {product.name}
                                                </h2>
                                                <div className="product-rating">
                                                    <StarOutlined />
                                                    <span>4.5</span>
                                                </div>
                                            </div>
                                            <div className="product-details">
                                                <div className="product-price">
                                                    <span className="price-label">Giá:</span>
                                                    <span className="price-value">
                                                        {product.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                                                    </span>
                                                </div>
                                                <div className="product-stock">
                                                    <span className={`stock-indicator ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}></span>
                                                    {product.stock > 0 ? `Còn hàng (${product.stock})` : 'Hết hàng'}
                                                </div>
                                            </div>
                                            <div className="product-buttons">
                                                <button 
                                                    className="add-to-cart-btn" 
                                                    onClick={(e) => handleAddToCart(product, e)}
                                                    disabled={product.stock <= 0}
                                                >
                                                    <ShoppingCartOutlined />
                                                    {product.stock > 0 ? 'Thêm vào giỏ hàng' : 'Hết hàng'}
                                                </button>
                                                <button className="details-btn" onClick={() => handleViewDetails(product)}>
                                                    <EyeOutlined />
                                                    Chi tiết
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="no-products">
                                    <Empty 
                                        description="Không có sản phẩm nào" 
                                        image={Empty.PRESENTED_IMAGE_SIMPLE} 
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HomePage;