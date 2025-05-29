import React, { useState, useEffect } from 'react';
import { useSearchParams, useParams, Link } from 'react-router-dom';
import useGlobalReducer from '../hooks/useGlobalReducer';

const ProductCatalog = () => {
    // Hook para manejar los parámetros de búsqueda en la URL
    const [searchParams, setSearchParams] = useSearchParams();
    const { gender, category } = useParams(); // Para rutas como /mujer/vestidos
    const { store, dispatch } = useGlobalReducer();

    // Estado para manejar los productos y la carga
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        page: 1,
        per_page: 12,
        total: 0,
        pages: 0
    });
    const [availableFilters, setAvailableFilters] = useState({
        sizes: [],
        brands: [],
        colors: [],
        conditions: []
    });

    // Estado para los filtros activos
    const [filters, setFilters] = useState({
        gender: gender || searchParams.get('gender') || '',
        category: category || searchParams.get('category') || '',
        min_price: searchParams.get('min_price') || '',
        max_price: searchParams.get('max_price') || '',
        size: searchParams.get('size') || '',
        condition: searchParams.get('condition') || '',
        brand: searchParams.get('brand') || '',
        color: searchParams.get('color') || '',
        search: searchParams.get('search') || '',
        sort: searchParams.get('sort') || 'newest'
    });

    // Estado para controlar si el sidebar de filtros está abierto en móvil
    const [showFilters, setShowFilters] = useState(false);

    // Efecto para manejar los parámetros de la ruta
    useEffect(() => {
        // Si viene de una ruta como /mujer/vestidos
        if (gender && category) {
            setFilters(prev => ({
                ...prev,
                gender: gender,
                category: `${gender}_${category}` // Convertir a formato mujer_vestidos
            }));
        }
        // Si viene de una ruta como /category/vestidos (desde el home)
        else if (!gender && category) {
            // Para categorías del home, buscar en todos los géneros
            setFilters(prev => ({
                ...prev,
                category: category
            }));
        }
    }, [gender, category]);

    // Función para construir la URL con los parámetros de filtro
    const buildQueryString = () => {
        const params = new URLSearchParams();

        // Agregar solo los filtros que tienen valor
        Object.entries(filters).forEach(([key, value]) => {
            if (value) {
                params.append(key, value);
            }
        });

        // Agregar paginación
        params.append('page', pagination.page);
        params.append('per_page', pagination.per_page);

        return params.toString();
    };

    // Función para cargar los productos desde el API
    const fetchProducts = async () => {
        setLoading(true);
        try {
            const queryString = buildQueryString();
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/products/catalog?${queryString}`);

            if (response.ok) {
                const data = await response.json();
                setProducts(data.products);
                setPagination(data.pagination);
                setAvailableFilters(data.available_filters);
            } else {
                console.error('Error al cargar productos');
            }
        } catch (error) {
            console.error('Error de conexión:', error);
        } finally {
            setLoading(false);
        }
    };

    // Cargar productos cuando cambien los filtros o la página
    useEffect(() => {
        fetchProducts();
    }, [filters, pagination.page]);

    // Actualizar la URL cuando cambien los filtros
    useEffect(() => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value) {
                params.set(key, value);
            }
        });
        setSearchParams(params);
    }, [filters]);

    // Función para manejar cambios en los filtros
    const handleFilterChange = (filterName, value) => {
        setFilters(prev => ({
            ...prev,
            [filterName]: value
        }));
        // Resetear a la primera página cuando se cambia un filtro
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    // Función para limpiar todos los filtros
    const clearFilters = () => {
        setFilters({
            gender: '',
            category: '',
            min_price: '',
            max_price: '',
            size: '',
            condition: '',
            brand: '',
            color: '',
            search: '',
            sort: 'newest'
        });
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    // Función para manejar el cambio de página
    const handlePageChange = (newPage) => {
        setPagination(prev => ({ ...prev, page: newPage }));
        // Scroll al inicio de la página
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Función para agregar producto al carrito
    const handleAddToCart = (product) => {
        dispatch({
            type: 'add_to_cart',
            payload: product
        });
        // Aquí podrías agregar una notificación de éxito
    };

    return (
        <div className="container-fluid mt-5 pt-5">
            <div className="row">
                {/* Sidebar de Filtros */}
                <div className={`col-lg-3 ${showFilters ? 'd-block' : 'd-none d-lg-block'}`}>
                    {/* Overlay para cerrar filtros en móvil */}
                    {showFilters && (
                        <div
                            className="position-fixed top-0 start-0 w-100 h-100 bg-dark d-lg-none"
                            style={{ opacity: 0.5, zIndex: 1040 }}
                            onClick={() => setShowFilters(false)}
                        />
                    )}

                    <div className={`card shadow-sm mb-4 ${showFilters ? 'position-fixed start-0 top-0 h-100 overflow-auto d-lg-relative' : ''}`}
                        style={showFilters ? { width: '300px', zIndex: 1045 } : {}}>
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h5 className="card-title mb-0">Filtros</h5>
                                <div>
                                    <button
                                        className="btn btn-sm btn-outline-secondary me-2"
                                        onClick={clearFilters}
                                    >
                                        Limpiar
                                    </button>
                                    {/* Botón para cerrar en móvil */}
                                    <button
                                        className="btn btn-sm btn-close d-lg-none"
                                        onClick={() => setShowFilters(false)}
                                        aria-label="Cerrar filtros"
                                    />
                                </div>
                            </div>

                            {/* Búsqueda */}
                            <div className="mb-4">
                                <label className="form-label fw-bold">Buscar</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Buscar productos..."
                                    value={filters.search}
                                    onChange={(e) => handleFilterChange('search', e.target.value)}
                                />
                            </div>

                            {/* Género */}
                            <div className="mb-4">
                                <label className="form-label fw-bold">Género</label>
                                <div className="form-check">
                                    <input
                                        className="form-check-input"
                                        type="radio"
                                        name="gender"
                                        id="gender-all"
                                        checked={filters.gender === ''}
                                        onChange={() => handleFilterChange('gender', '')}
                                    />
                                    <label className="form-check-label" htmlFor="gender-all">
                                        Todos
                                    </label>
                                </div>
                                <div className="form-check">
                                    <input
                                        className="form-check-input"
                                        type="radio"
                                        name="gender"
                                        id="gender-mujer"
                                        checked={filters.gender === 'mujer'}
                                        onChange={() => handleFilterChange('gender', 'mujer')}
                                    />
                                    <label className="form-check-label" htmlFor="gender-mujer">
                                        Mujer
                                    </label>
                                </div>
                                <div className="form-check">
                                    <input
                                        className="form-check-input"
                                        type="radio"
                                        name="gender"
                                        id="gender-hombre"
                                        checked={filters.gender === 'hombre'}
                                        onChange={() => handleFilterChange('gender', 'hombre')}
                                    />
                                    <label className="form-check-label" htmlFor="gender-hombre">
                                        Hombre
                                    </label>
                                </div>
                                <div className="form-check">
                                    <input
                                        className="form-check-input"
                                        type="radio"
                                        name="gender"
                                        id="gender-unisex"
                                        checked={filters.gender === 'unisex'}
                                        onChange={() => handleFilterChange('gender', 'unisex')}
                                    />
                                    <label className="form-check-label" htmlFor="gender-unisex">
                                        Unisex
                                    </label>
                                </div>
                            </div>

                            {/* Categoría */}
                            <div className="mb-4">
                                <label className="form-label fw-bold">Categoría</label>
                                <select
                                    className="form-select"
                                    value={filters.category}
                                    onChange={(e) => handleFilterChange('category', e.target.value)}
                                >
                                    <option value="">Todas las categorías</option>

                                    {/* Si hay un género seleccionado, mostrar solo sus categorías */}
                                    {filters.gender === 'mujer' && (
                                        <>
                                            <option value="mujer_vestidos">Vestidos</option>
                                            <option value="mujer_blusas">Blusas</option>
                                            <option value="mujer_pantalones">Pantalones</option>
                                            <option value="mujer_faldas">Faldas</option>
                                            <option value="mujer_abrigos">Abrigos</option>
                                            <option value="mujer_zapatos">Zapatos</option>
                                            <option value="mujer_deportivo">Ropa Deportiva</option>
                                        </>
                                    )}

                                    {filters.gender === 'hombre' && (
                                        <>
                                            <option value="hombre_camisetas">Camisetas</option>
                                            <option value="hombre_camisas">Camisas</option>
                                            <option value="hombre_pantalones">Pantalones</option>
                                            <option value="hombre_abrigos">Abrigos</option>
                                            <option value="hombre_zapatos">Zapatos</option>
                                            <option value="hombre_deportivo">Ropa Deportiva</option>
                                        </>
                                    )}

                                    {filters.gender === 'unisex' && (
                                        <>
                                            <option value="unisex_accesorios">Accesorios</option>
                                            <option value="unisex_bolsos">Bolsos</option>
                                            <option value="unisex_gorras">Gorras</option>
                                        </>
                                    )}

                                    {/* Si no hay género seleccionado, mostrar todas */}
                                    {!filters.gender && (
                                        <>
                                            <optgroup label="Mujer">
                                                <option value="mujer_vestidos">Vestidos</option>
                                                <option value="mujer_blusas">Blusas</option>
                                                <option value="mujer_pantalones">Pantalones</option>
                                                <option value="mujer_faldas">Faldas</option>
                                                <option value="mujer_abrigos">Abrigos</option>
                                                <option value="mujer_zapatos">Zapatos</option>
                                                <option value="mujer_deportivo">Ropa Deportiva</option>
                                            </optgroup>
                                            <optgroup label="Hombre">
                                                <option value="hombre_camisetas">Camisetas</option>
                                                <option value="hombre_camisas">Camisas</option>
                                                <option value="hombre_pantalones">Pantalones</option>
                                                <option value="hombre_abrigos">Abrigos</option>
                                                <option value="hombre_zapatos">Zapatos</option>
                                                <option value="hombre_deportivo">Ropa Deportiva</option>
                                            </optgroup>
                                            <optgroup label="Unisex">
                                                <option value="unisex_accesorios">Accesorios</option>
                                                <option value="unisex_bolsos">Bolsos</option>
                                                <option value="unisex_gorras">Gorras</option>
                                            </optgroup>
                                        </>
                                    )}
                                </select>
                            </div>

                            {/* Precio */}
                            <div className="mb-4">
                                <label className="form-label fw-bold">Precio</label>
                                <div className="row g-2">
                                    <div className="col-6">
                                        <input
                                            type="number"
                                            className="form-control"
                                            placeholder="Mín"
                                            value={filters.min_price}
                                            onChange={(e) => handleFilterChange('min_price', e.target.value)}
                                        />
                                    </div>
                                    <div className="col-6">
                                        <input
                                            type="number"
                                            className="form-control"
                                            placeholder="Máx"
                                            value={filters.max_price}
                                            onChange={(e) => handleFilterChange('max_price', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Talla */}
                            {availableFilters.sizes.length > 0 && (
                                <div className="mb-4">
                                    <label className="form-label fw-bold">Talla</label>
                                    <select
                                        className="form-select"
                                        value={filters.size}
                                        onChange={(e) => handleFilterChange('size', e.target.value)}
                                    >
                                        <option value="">Todas las tallas</option>
                                        {availableFilters.sizes.map(size => (
                                            <option key={size} value={size}>{size}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Condición */}
                            {availableFilters.conditions.length > 0 && (
                                <div className="mb-4">
                                    <label className="form-label fw-bold">Condición</label>
                                    <select
                                        className="form-select"
                                        value={filters.condition}
                                        onChange={(e) => handleFilterChange('condition', e.target.value)}
                                    >
                                        <option value="">Todas las condiciones</option>
                                        {availableFilters.conditions.map(condition => (
                                            <option key={condition} value={condition}>
                                                {condition === 'new_with_tags' ? 'Nuevo con etiquetas' :
                                                    condition === 'new_without_tags' ? 'Nuevo sin etiquetas' :
                                                        condition === 'two_wears' ? 'Dos posturas' :
                                                            condition === 'very_good' ? 'Muy buen estado' :
                                                                condition === 'good' ? 'Buen estado' :
                                                                    condition === 'acceptable' ? 'Aceptable' : condition}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Marca */}
                            {availableFilters.brands.length > 0 && (
                                <div className="mb-4">
                                    <label className="form-label fw-bold">Marca</label>
                                    <select
                                        className="form-select"
                                        value={filters.brand}
                                        onChange={(e) => handleFilterChange('brand', e.target.value)}
                                    >
                                        <option value="">Todas las marcas</option>
                                        {availableFilters.brands.map(brand => (
                                            <option key={brand} value={brand}>{brand}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Color */}
                            {availableFilters.colors.length > 0 && (
                                <div className="mb-4">
                                    <label className="form-label fw-bold">Color</label>
                                    <select
                                        className="form-select"
                                        value={filters.color}
                                        onChange={(e) => handleFilterChange('color', e.target.value)}
                                    >
                                        <option value="">Todos los colores</option>
                                        {availableFilters.colors.map(color => (
                                            <option key={color} value={color}>{color}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Área principal de productos */}
                <div className="col-lg-9">
                    {/* Encabezado con ordenamiento y botón de filtros móvil */}
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <div>
                            <h2>{filters.category || filters.gender || 'Todos los productos'}</h2>
                            <p className="text-muted">{pagination.total} productos encontrados</p>
                        </div>
                        <div className="d-flex gap-2">
                            {/* Botón para mostrar filtros en móvil */}
                            <button
                                className="btn btn-outline-secondary d-lg-none"
                                onClick={() => setShowFilters(!showFilters)}
                            >
                                <i className="fas fa-filter me-2"></i>
                                Filtros
                            </button>
                            {/* Ordenamiento */}
                            <select
                                className="form-select"
                                style={{ width: 'auto' }}
                                value={filters.sort}
                                onChange={(e) => handleFilterChange('sort', e.target.value)}
                            >
                                <option value="newest">Más recientes</option>
                                <option value="price_asc">Precio: menor a mayor</option>
                                <option value="price_desc">Precio: mayor a menor</option>
                            </select>
                        </div>
                    </div>

                    {/* Grid de productos */}
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Cargando...</span>
                            </div>
                            <p className="mt-3">Cargando productos...</p>
                        </div>
                    ) : products.length === 0 ? (
                        <div className="text-center py-5">
                            <i className="fas fa-search fa-3x text-muted mb-3"></i>
                            <h4>No se encontraron productos</h4>
                            <p className="text-muted">Intenta ajustar los filtros para ver más resultados</p>
                            <button className="btn btn-primary" onClick={clearFilters}>
                                Limpiar filtros
                            </button>
                        </div>
                    ) : (
                        <div className="row g-4">
                            {products.map(product => (
                                <div key={product.id} className="col-6 col-md-4">
                                    <div className="card h-100 product-card shadow-sm border-0">
                                        {/* Imagen del producto */}
                                        <Link to={`/product/${product.id}`} className="text-decoration-none">
                                            <div className="position-relative overflow-hidden">
                                                <img
                                                    src={product.images && product.images.length > 0
                                                        ? product.images[0].url
                                                        : 'https://via.placeholder.com/300x400?text=Sin+imagen'}
                                                    className="card-img-top"
                                                    alt={product.title}
                                                    style={{ height: '300px', objectFit: 'cover' }}
                                                />
                                                {/* Badge de descuento si aplica */}
                                                {product.discount > 0 && (
                                                    <span className="position-absolute top-0 start-0 badge bg-danger m-2">
                                                        -{product.discount}%
                                                    </span>
                                                )}
                                                {/* Botón de favoritos */}
                                                <button
                                                    className="btn btn-light btn-sm position-absolute top-0 end-0 m-2 rounded-circle btn-favorite"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        // Aquí implementarías la lógica de favoritos
                                                    }}
                                                    style={{ width: '40px', height: '40px' }}
                                                >
                                                    <i className="far fa-heart"></i>
                                                </button>
                                            </div>
                                        </Link>

                                        <div className="card-body">
                                            {/* Título del producto */}
                                            <h6 className="card-title text-truncate">
                                                <Link to={`/product/${product.id}`} className="text-decoration-none text-dark">
                                                    {product.title}
                                                </Link>
                                            </h6>

                                            {/* Marca y talla */}
                                            <p className="card-text small text-muted mb-2">
                                                {product.brand && <span>{product.brand} • </span>}
                                                Talla {product.size}
                                            </p>

                                            {/* Precio */}
                                            <div className="d-flex justify-content-between align-items-center">
                                                <div>
                                                    {product.discount > 0 ? (
                                                        <>
                                                            <span className="text-danger fw-bold">
                                                                ${(product.price * (1 - product.discount / 100)).toFixed(2)}
                                                            </span>
                                                            <span className="text-muted text-decoration-line-through ms-2 small">
                                                                ${product.price}
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <span className="fw-bold">${product.price}</span>
                                                    )}
                                                </div>
                                                {/* Botón agregar al carrito */}
                                                <button
                                                    className="btn btn-sm btn-outline-primary"
                                                    onClick={() => handleAddToCart(product)}
                                                >
                                                    <i className="fas fa-shopping-cart"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Paginación */}
                    {pagination.pages > 1 && (
                        <nav className="mt-5" aria-label="Navegación de productos">
                            <ul className="pagination justify-content-center">
                                {/* Botón anterior */}
                                <li className={`page-item ${!pagination.has_prev ? 'disabled' : ''}`}>
                                    <button
                                        className="page-link"
                                        onClick={() => handlePageChange(pagination.page - 1)}
                                        disabled={!pagination.has_prev}
                                        aria-label="Página anterior"
                                    >
                                        <i className="fas fa-chevron-left"></i>
                                    </button>
                                </li>

                                {/* Números de página */}
                                {[...Array(pagination.pages)].map((_, index) => {
                                    const pageNum = index + 1;
                                    // Mostrar solo algunas páginas cerca de la actual
                                    if (
                                        pageNum === 1 ||
                                        pageNum === pagination.pages ||
                                        (pageNum >= pagination.page - 2 && pageNum <= pagination.page + 2)
                                    ) {
                                        return (
                                            <li key={pageNum} className={`page-item ${pageNum === pagination.page ? 'active' : ''}`}>
                                                <button
                                                    className="page-link"
                                                    onClick={() => handlePageChange(pageNum)}
                                                >
                                                    {pageNum}
                                                </button>
                                            </li>
                                        );
                                    } else if (
                                        pageNum === pagination.page - 3 ||
                                        pageNum === pagination.page + 3
                                    ) {
                                        return <li key={pageNum} className="page-item disabled"><span className="page-link">...</span></li>;
                                    }
                                    return null;
                                })}

                                {/* Botón siguiente */}
                                <li className={`page-item ${!pagination.has_next ? 'disabled' : ''}`}>
                                    <button
                                        className="page-link"
                                        onClick={() => handlePageChange(pagination.page + 1)}
                                        disabled={!pagination.has_next}
                                        aria-label="Página siguiente"
                                    >
                                        <i className="fas fa-chevron-right"></i>
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductCatalog;