// src/front/pages/SellerDashboard.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const SellerDashboard = () => {
    const { store } = useGlobalReducer();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("overview");
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [alertMessage, setAlertMessage] = useState("");
    const [alertType, setAlertType] = useState("");
    const [editingProduct, setEditingProduct] = useState(null);

    // Verificar autenticación
    useEffect(() => {
        if (!store.auth?.isAuthenticated || store.auth?.user?.role !== "seller") {
            navigate("/login");
        } else {
            // Cargar productos del vendedor
            loadSellerProducts();
        }
    }, [store.auth, navigate]);

    const loadSellerProducts = async () => {
        try {
            setIsLoading(true);
            const backendUrl = import.meta.env.VITE_BACKEND_URL;

            const response = await fetch(`${backendUrl}/api/seller/products`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${store.auth?.token}`
                }
            });

            if (!response.ok) {
                throw new Error("Error al cargar los productos");
            }

            const data = await response.json();
            setProducts(data.products || []);
        } catch (error) {
            console.error("Error loading products:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Función para eliminar un producto
    const handleDeleteProduct = async (productId) => {
        // Confirmación antes de eliminar
        if (!confirm("¿Estás seguro de que deseas eliminar este producto?")) {
            return;
        }

        try {
            const backendUrl = import.meta.env.VITE_BACKEND_URL;

            const response = await fetch(`${backendUrl}/api/products/${productId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${store.auth?.token}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Error al eliminar el producto");
            }

            // Actualizar la lista de productos (eliminar el producto del estado)
            setProducts(prevProducts => prevProducts.filter(product => product.id !== productId));

            // Mostrar mensaje de éxito
            setAlertMessage("Producto eliminado correctamente");
            setAlertType("success");

        } catch (error) {
            console.error("Error eliminando producto:", error);
            setAlertMessage(error.message || "Ocurrió un error al eliminar el producto");
            setAlertType("danger");
        }
    };


    const handleEditProduct = (product) => {
        setEditingProduct(product);
        setActiveTab("add-product");
    };



    return (
        <div className="container my-5 pt-5">
            <div className="row">
                {/* Sidebar */}
                <div className="col-lg-3 mb-4">
                    <div className="card shadow-sm">
                        <div className="card-body">
                            <div className="text-center mb-3">
                                <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mx-auto" style={{ width: "80px", height: "80px" }}>
                                    <i className="fas fa-user-circle fa-3x"></i>
                                </div>
                                <h5 className="mt-3 mb-0">{store.auth?.user?.first_name} {store.auth?.user?.last_name}</h5>
                                <small className="text-muted">@{store.auth?.user?.username}</small>
                            </div>

                            <hr />

                            <ul className="nav nav-pills flex-column">
                                <li className="nav-item">
                                    <button
                                        className={`nav-link text-start w-100 ${activeTab === "overview" ? "active" : ""}`}
                                        onClick={() => setActiveTab("overview")}
                                    >
                                        <i className="fas fa-home me-2"></i> Panel Principal
                                    </button>
                                </li>
                                <li className="nav-item">
                                    <button
                                        className={`nav-link text-start w-100 ${activeTab === "products" ? "active" : ""}`}
                                        onClick={() => setActiveTab("products")}
                                    >
                                        <i className="fas fa-tshirt me-2"></i> Mis Productos
                                    </button>
                                </li>
                                <li className="nav-item">
                                    <button
                                        className={`nav-link text-start w-100 ${activeTab === "add-product" ? "active" : ""}`}
                                        onClick={() => setActiveTab("add-product")}
                                    >
                                        <i className="fas fa-plus-circle me-2"></i> Añadir Producto
                                    </button>
                                </li>
                                <li className="nav-item">
                                    <button
                                        className={`nav-link text-start w-100 ${activeTab === "offers" ? "active" : ""}`}
                                        onClick={() => setActiveTab("offers")}
                                    >
                                        <i className="fas fa-hand-holding-usd me-2"></i> Ofertas
                                    </button>
                                </li>
                                <li className="nav-item">
                                    <button
                                        className={`nav-link text-start w-100 ${activeTab === "sales" ? "active" : ""}`}
                                        onClick={() => setActiveTab("sales")}
                                    >
                                        <i className="fas fa-chart-line me-2"></i> Ventas
                                    </button>
                                </li>
                                <li className="nav-item">
                                    <button
                                        className={`nav-link text-start w-100 ${activeTab === "settings" ? "active" : ""}`}
                                        onClick={() => setActiveTab("settings")}
                                    >
                                        <i className="fas fa-cog me-2"></i> Perfil
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="col-lg-9">
                    {/* Overview Tab */}
                    {activeTab === "overview" && (
                        <div className="card shadow-sm">
                            <div className="card-body">
                                <h2 className="card-title mb-4">Panel Principal</h2>

                                <div className="row g-4">
                                    <div className="col-md-4">
                                        <div className="card bg-primary text-white">
                                            <div className="card-body d-flex align-items-center">
                                                <i className="fas fa-tshirt fa-3x me-3"></i>
                                                <div>
                                                    <h6 className="card-subtitle mb-1">Productos</h6>
                                                    <h4 className="card-title mb-0">{products.length}</h4>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-md-4">
                                        <div className="card bg-success text-white">
                                            <div className="card-body d-flex align-items-center">
                                                <i className="fas fa-shopping-cart fa-3x me-3"></i>
                                                <div>
                                                    <h6 className="card-subtitle mb-1">Ventas</h6>
                                                    <h4 className="card-title mb-0">0</h4>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-md-4">
                                        <div className="card bg-info text-white">
                                            <div className="card-body d-flex align-items-center">
                                                <i className="fas fa-eye fa-3x me-3"></i>
                                                <div>
                                                    <h6 className="card-subtitle mb-1">Visitas</h6>
                                                    <h4 className="card-title mb-0">0</h4>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="card mt-4">
                                    <div className="card-body">
                                        <h5 className="card-title">Acciones Rápidas</h5>
                                        <div className="d-flex flex-wrap gap-2">
                                            <button
                                                className="btn btn-primary"
                                                onClick={() => setActiveTab("add-product")}
                                            >
                                                <i className="fas fa-plus-circle me-2"></i> Añadir Producto
                                            </button>
                                            <button className="btn btn-outline-secondary">
                                                <i className="fas fa-cog me-2"></i> Configurar de Perfil
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Products Tab */}
                    {activeTab === "products" && (
                        <div className="card shadow-sm">
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <h2 className="card-title mb-0">Mis Productos</h2>
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => setActiveTab("add-product")}
                                    >
                                        <i className="fas fa-plus-circle me-2"></i> Añadir Producto
                                    </button>
                                </div>

                                {alertMessage && (
                                    <div className={`alert alert-${alertType} alert-dismissible fade show`} role="alert">
                                        {alertMessage}
                                        <button
                                            type="button"
                                            className="btn-close"
                                            onClick={() => setAlertMessage("")}
                                        ></button>
                                    </div>
                                )}

                                {isLoading ? (
                                    <div className="text-center my-5">
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">Cargando...</span>
                                        </div>
                                        <p className="mt-2">Cargando tus productos...</p>
                                    </div>
                                ) : products.length === 0 ? (
                                    <div className="text-center my-5">
                                        <i className="fas fa-box-open fa-4x text-muted mb-3"></i>
                                        <h4>No tienes productos publicados</h4>
                                        <p className="text-muted">Comienza a vender añadiendo tu primer producto</p>
                                        <button
                                            className="btn btn-primary mt-2"
                                            onClick={() => setActiveTab("add-product")}
                                        >
                                            <i className="fas fa-plus-circle me-2"></i> Añadir Producto
                                        </button>
                                    </div>
                                ) : (
                                    <div className="table-responsive">
                                        <table className="table table-hover">
                                            <thead>
                                                <tr>
                                                    <th>Imagen</th>
                                                    <th>Título</th>
                                                    <th>Precio</th>
                                                    <th>Estado</th>
                                                    <th>Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {products.map(product => (
                                                    <tr key={product.id}>
                                                        <td>
                                                            <img
                                                                src={product.images?.[0]?.url || 'https://via.placeholder.com/50'}
                                                                alt={product.title}
                                                                className="img-thumbnail"
                                                                style={{ width: "50px", height: "50px", objectFit: "cover" }}
                                                            />
                                                        </td>
                                                        <td>{product.title}</td>
                                                        <td>${product.price.toFixed(2)}</td>
                                                        <td>
                                                            <span className="badge bg-success">Activo</span>
                                                        </td>
                                                        <td>
                                                            <button
                                                                className="btn btn-sm btn-outline-primary me-1"
                                                                onClick={() => handleEditProduct(product)}
                                                            >
                                                                <i className="fas fa-edit"></i>
                                                            </button>
                                                            <button
                                                                className="btn btn-sm btn-outline-danger"
                                                                onClick={() => handleDeleteProduct(product.id)}
                                                            >
                                                                <i className="fas fa-trash"></i>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Add Product Tab */}
                    {activeTab === "add-product" && (
                        <div className="card shadow-sm">
                            <div className="card-body">
                                <h2 className="card-title mb-4">
                                    {editingProduct ? "Editar Producto" : "Añadir Nuevo Producto"}
                                </h2>

                                <AddProductForm
                                    editingProduct={editingProduct}
                                    onProductSaved={() => {
                                        loadSellerProducts();
                                        setEditingProduct(null);
                                        setActiveTab("products");
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Offers Tab */}
                    {activeTab === "offers" && (
                        <div className="card shadow-sm">
                            <div className="card-body">
                                <h2 className="card-title mb-4">Ofertas Recibidas</h2>
                                <OffersSection />
                            </div>
                        </div>
                    )}


                    {/* Sales Tab */}
                    {activeTab === "sales" && (
                        <div className="card shadow-sm">
                            <div className="card-body">
                                <h2 className="card-title mb-4">Mis Ventas</h2>

                                <SalesSection />
                            </div>
                        </div>
                    )}

                    {/* Settings Tab */}
                    {activeTab === "settings" && (
                        <div className="card shadow-sm">
                            <div className="card-body">
                                <h2 className="card-title mb-4">Configuración de la Cuenta</h2>

                                <ProfileSettings />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};


// Componente para mostrar las ofertas recibidas
const OffersSection = () => {
    const [offers, setOffers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState(''); // '', 'pending', 'accepted', 'rejected'
    const [stats, setStats] = useState({ pending: 0, accepted: 0, rejected: 0, total: 0 });
    const { store } = useGlobalReducer();

    useEffect(() => {
        loadOffers();
    }, [filter]);

    const loadOffers = async () => {
        try {
            setIsLoading(true);
            const backendUrl = import.meta.env.VITE_BACKEND_URL;

            // Construir URL con filtros si existen
            let url = `${backendUrl}/api/seller/offers`;
            if (filter) {
                url += `?status=${filter}`;
            }

            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${store.auth?.token}`
                }
            });

            if (!response.ok) {
                throw new Error("Error al cargar las ofertas");
            }

            const data = await response.json();
            setOffers(data.offers || []);
            setStats(data.stats || { pending: 0, accepted: 0, rejected: 0, total: 0 });
        } catch (error) {
            console.error("Error loading offers:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Función para aceptar una oferta
    const handleAcceptOffer = async (offerId) => {
        if (!confirm("¿Estás seguro de que deseas aceptar esta oferta?")) {
            return;
        }

        try {
            const backendUrl = import.meta.env.VITE_BACKEND_URL;
            const response = await fetch(`${backendUrl}/api/offers/${offerId}/accept`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${store.auth?.token}`
                },
                body: JSON.stringify({
                    message: "¡Oferta aceptada! Ponte en contacto conmigo para coordinar la entrega."
                })
            });

            if (!response.ok) {
                throw new Error("Error al aceptar la oferta");
            }

            alert("¡Oferta aceptada exitosamente!");
            loadOffers(); // Recargar ofertas
        } catch (error) {
            console.error("Error:", error);
            alert("Error al aceptar la oferta");
        }
    };

    // Función para rechazar una oferta
    const handleRejectOffer = async (offerId) => {
        const reason = prompt("¿Por qué rechazas esta oferta? (opcional)");

        if (reason === null) return; // Canceló el prompt

        try {
            const backendUrl = import.meta.env.VITE_BACKEND_URL;
            const response = await fetch(`${backendUrl}/api/offers/${offerId}/reject`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${store.auth?.token}`
                },
                body: JSON.stringify({
                    message: reason || "Oferta rechazada"
                })
            });

            if (!response.ok) {
                throw new Error("Error al rechazar la oferta");
            }

            alert("Oferta rechazada");
            loadOffers(); // Recargar ofertas
        } catch (error) {
            console.error("Error:", error);
            alert("Error al rechazar la oferta");
        }
    };

    if (isLoading) {
        return (
            <div className="text-center my-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando ofertas...</span>
                </div>
                <p className="mt-2">Cargando ofertas...</p>
            </div>
        );
    }

    return (
        <>
            {/* Estadísticas de ofertas */}
            <div className="row mb-4">
                <div className="col-md-3">
                    <div className="card bg-warning text-white">
                        <div className="card-body text-center">
                            <h5 className="card-title">{stats.pending}</h5>
                            <p className="card-text mb-0">Pendientes</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card bg-success text-white">
                        <div className="card-body text-center">
                            <h5 className="card-title">{stats.accepted}</h5>
                            <p className="card-text mb-0">Aceptadas</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card bg-danger text-white">
                        <div className="card-body text-center">
                            <h5 className="card-title">{stats.rejected}</h5>
                            <p className="card-text mb-0">Rechazadas</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card bg-info text-white">
                        <div className="card-body text-center">
                            <h5 className="card-title">{stats.total}</h5>
                            <p className="card-text mb-0">Total</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filtros */}
            <div className="mb-3">
                <div className="btn-group" role="group">
                    <button
                        className={`btn ${filter === '' ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => setFilter('')}
                    >
                        Todas
                    </button>
                    <button
                        className={`btn ${filter === 'pending' ? 'btn-warning' : 'btn-outline-warning'}`}
                        onClick={() => setFilter('pending')}
                    >
                        Pendientes
                    </button>
                    <button
                        className={`btn ${filter === 'accepted' ? 'btn-success' : 'btn-outline-success'}`}
                        onClick={() => setFilter('accepted')}
                    >
                        Aceptadas
                    </button>
                    <button
                        className={`btn ${filter === 'rejected' ? 'btn-danger' : 'btn-outline-danger'}`}
                        onClick={() => setFilter('rejected')}
                    >
                        Rechazadas
                    </button>
                </div>
            </div>

            {/* Lista de ofertas */}
            {offers.length === 0 ? (
                <div className="text-center my-5">
                    <i className="fas fa-hand-holding-usd fa-4x text-muted mb-3"></i>
                    <h4>No tienes ofertas {filter && `${filter === 'pending' ? 'pendientes' : filter === 'accepted' ? 'aceptadas' : 'rechazadas'}`}</h4>
                    <p className="text-muted">Las ofertas de los compradores aparecerán aquí</p>
                </div>
            ) : (
                <div className="table-responsive">
                    <table className="table table-hover">
                        <thead className="table-light">
                            <tr>
                                <th>Producto</th>
                                <th>Comprador</th>
                                <th>Oferta</th>
                                <th>Mensaje</th>
                                <th>Fecha</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {offers.map(offer => (
                                <tr key={offer.id}>
                                    <td>
                                        <div className="d-flex align-items-center">
                                            <img
                                                src={offer.product?.images?.[0]?.url || 'https://via.placeholder.com/50'}
                                                alt={offer.product?.title}
                                                className="img-thumbnail me-2"
                                                style={{ width: "50px", height: "50px", objectFit: "cover" }}
                                            />
                                            <div>
                                                <div className="fw-bold">{offer.product?.title}</div>
                                                <small className="text-muted">Precio: ${offer.product?.price}</small>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div>
                                            <div className="fw-bold">{offer.buyer?.first_name}</div>
                                            <small className="text-muted">@{offer.buyer?.username}</small>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="fw-bold text-primary">${offer.amount}</div>
                                        <small className="text-muted">
                                            {((offer.amount / offer.product?.price) * 100).toFixed(0)}% del precio
                                        </small>
                                    </td>
                                    <td>
                                        <small>{offer.message || 'Sin mensaje'}</small>
                                    </td>
                                    <td>
                                        <small>
                                            {new Date(offer.created_at).toLocaleDateString()}<br />
                                            {new Date(offer.created_at).toLocaleTimeString()}
                                        </small>
                                    </td>
                                    <td>
                                        <span className={`badge ${offer.status === 'pending' ? 'bg-warning' :
                                            offer.status === 'accepted' ? 'bg-success' :
                                                'bg-danger'
                                            }`}>
                                            {offer.status === 'pending' ? 'Pendiente' :
                                                offer.status === 'accepted' ? 'Aceptada' : 'Rechazada'}
                                        </span>
                                    </td>
                                    <td>
                                        {offer.status === 'pending' ? (
                                            <div className="btn-group" role="group">
                                                <button
                                                    className="btn btn-sm btn-success"
                                                    onClick={() => handleAcceptOffer(offer.id)}
                                                    title="Aceptar oferta"
                                                >
                                                    <i className="fas fa-check"></i>
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-danger"
                                                    onClick={() => handleRejectOffer(offer.id)}
                                                    title="Rechazar oferta"
                                                >
                                                    <i className="fas fa-times"></i>
                                                </button>
                                            </div>
                                        ) : (
                                            <small className="text-muted">
                                                {offer.responded_at && new Date(offer.responded_at).toLocaleDateString()}
                                            </small>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </>
    );
};



// Componente para mostrar las ventas

const SalesSection = () => {
    const [sales, setSales] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [totalEarnings, setTotalEarnings] = useState(0);
    const { store } = useGlobalReducer();

    useEffect(() => {
        loadSales();
    }, []);

    const loadSales = async () => {
        try {
            setIsLoading(true);
            const backendUrl = import.meta.env.VITE_BACKEND_URL;

            const response = await fetch(`${backendUrl}/api/seller/sales`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${store.auth?.token}`
                }
            });

            if (!response.ok) {
                throw new Error("Error al cargar las ventas");
            }

            const data = await response.json();
            setSales(data.sales || []);
            setTotalEarnings(data.total_earnings || 0);
        } catch (error) {
            console.error("Error loading sales:", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="text-center my-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando ventas...</span>
                </div>
                <p className="mt-2">Cargando tus ventas...</p>
            </div>
        );
    }



    return (
        <>
            {/* Resumen de ganancias */}
            <div className="row mb-4">
                <div className="col-md-6">
                    <div className="card bg-success text-white">
                        <div className="card-body">
                            <div className="d-flex align-items-center">
                                <i className="fas fa-dollar-sign fa-3x me-3"></i>
                                <div>
                                    <h6 className="card-subtitle mb-1">Ganancias Totales</h6>
                                    <h4 className="card-title mb-0">${totalEarnings.toFixed(2)}</h4>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="card bg-info text-white">
                        <div className="card-body">
                            <div className="d-flex align-items-center">
                                <i className="fas fa-shopping-cart fa-3x me-3"></i>
                                <div>
                                    <h6 className="card-subtitle mb-1">Productos Vendidos</h6>
                                    <h4 className="card-title mb-0">{sales.length}</h4>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Lista de ventas */}
            {sales.length === 0 ? (
                <div className="text-center my-5">
                    <i className="fas fa-shopping-cart fa-4x text-muted mb-3"></i>
                    <h4>No tienes ventas todavía</h4>
                    <p className="text-muted">Tus ventas aparecerán aquí una vez que los compradores adquieran tus productos</p>
                    <button
                        className="btn btn-primary mt-2"
                        onClick={() => window.location.reload()}
                    >
                        <i className="fas fa-sync-alt me-2"></i> Actualizar
                    </button>
                </div>
            ) : (
                <div className="table-responsive">
                    <table className="table table-hover">
                        <thead className="table-light">
                            <tr>
                                <th>Producto</th>
                                <th>Comprador</th>
                                <th>Fecha</th>
                                <th>Precio</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sales.map(sale => (
                                <tr key={sale.id}>
                                    <td>
                                        <div className="d-flex align-items-center">
                                            <img
                                                src={sale.product.image || 'https://via.placeholder.com/50'}
                                                alt={sale.product.title}
                                                className="img-thumbnail me-2"
                                                style={{ width: "50px", height: "50px", objectFit: "cover" }}
                                            />
                                            <div>
                                                <div className="fw-bold">{sale.product.title}</div>
                                                <small className="text-muted">#{sale.product.id}</small>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div>
                                            <div className="fw-bold">{sale.buyer.first_name} {sale.buyer.last_name}</div>
                                            <small className="text-muted">{sale.buyer.email}</small>
                                        </div>
                                    </td>
                                    <td>
                                        <div>
                                            <div>{new Date(sale.created_at).toLocaleDateString()}</div>
                                            <small className="text-muted">{new Date(sale.created_at).toLocaleTimeString()}</small>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="fw-bold text-success">${sale.price.toFixed(2)}</div>
                                        {sale.discount > 0 && (
                                            <small className="text-muted">Descuento: {sale.discount}%</small>
                                        )}
                                    </td>
                                    <td>
                                        <span className={`badge ${sale.status === 'completed' ? 'bg-success' :
                                            sale.status === 'pending' ? 'bg-warning' :
                                                sale.status === 'shipped' ? 'bg-info' : 'bg-secondary'
                                            }`}>
                                            {sale.status === 'completed' ? 'Completada' :
                                                sale.status === 'pending' ? 'Pendiente' :
                                                    sale.status === 'shipped' ? 'Enviada' : sale.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="btn-group" role="group">
                                            <button
                                                className="btn btn-sm btn-outline-primary"
                                                title="Ver detalles"
                                            >
                                                <i className="fas fa-eye"></i>
                                            </button>
                                            {sale.status === 'pending' && (
                                                <button
                                                    className="btn btn-sm btn-outline-success"
                                                    title="Marcar como enviado"
                                                >
                                                    <i className="fas fa-shipping-fast"></i>
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </>
    );
};

// Componente para configuración del perfil

const ProfileSettings = () => {
    const { store, dispatch } = useGlobalReducer();
    const [formData, setFormData] = useState({
        first_name: store.auth?.user?.first_name || '',
        last_name: store.auth?.user?.last_name || '',
        username: store.auth?.user?.username || '',
        email: store.auth?.user?.email || '',
        store_name: '',
        store_description: '',
        phone: '',
        //nuevos campos para contacto del vendedor
        whatsapp: '',
        business_email: '',
        social_media: '',
        attention_hours: '',
        payment_methods: [],
        delivery_zones: '',
        return_policy: '',
        current_password: '',
        new_password: '',
        confirm_password: ''
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState('');

    useEffect(() => {
        // Cargar configuración actual del vendedor
        loadSellerSettings();
    }, []);

    const loadSellerSettings = async () => {
        try {
            const backendUrl = import.meta.env.VITE_BACKEND_URL;

            const response = await fetch(`${backendUrl}/api/seller/profile`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${store.auth?.token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setFormData(prev => ({
                    ...prev,
                    // store_name: data.store_name || '',
                    // store_description: data.store_description || '',
                    // phone: data.phone || ''
                    phone: data.phone || '',
                    whatsapp: data.whatsapp || '',
                    business_email: data.business_email || '',
                    social_media: data.social_media || '',
                    attention_hours: data.attention_hours || '',
                    payment_methods: data.payment_methods || [],
                    delivery_zones: data.delivery_zones || '',
                    return_policy: data.return_policy || ''
                }));
            }
        } catch (error) {
            console.error("Error loading seller settings:", error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        // Limpiar errores específicos
        if (errors[name]) {
            setErrors({ ...errors, [name]: "" });
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Validar campos básicos
        if (!formData.first_name.trim()) {
            newErrors.first_name = "El nombre es obligatorio";
        }

        if (!formData.last_name.trim()) {
            newErrors.last_name = "Los apellidos son obligatorios";
        }

        if (!formData.username.trim()) {
            newErrors.username = "El nombre de usuario es obligatorio";
        }

        if (!formData.email.trim()) {
            newErrors.email = "El correo electrónico es obligatorio";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Formato de correo electrónico inválido";
        }

        // Validar contraseñas si se proporcionan
        if (formData.new_password) {
            if (!formData.current_password) {
                newErrors.current_password = "La contraseña actual es obligatoria para cambiar la contraseña";
            }

            if (formData.new_password.length < 6) {
                newErrors.new_password = "La nueva contraseña debe tener al menos 6 caracteres";
            }

            if (formData.new_password !== formData.confirm_password) {
                newErrors.confirm_password = "Las contraseñas no coinciden";
            }
        }

        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formErrors = validateForm();

        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            return;
        }

        setIsSubmitting(true);
        setSuccess('');

        try {
            const backendUrl = import.meta.env.VITE_BACKEND_URL;

            const response = await fetch(`${backendUrl}/api/seller/profile`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${store.auth?.token}`
                },
                body: JSON.stringify({
                    first_name: formData.first_name,
                    last_name: formData.last_name,
                    username: formData.username,
                    email: formData.email,
                    // store_name: formData.store_name,
                    // store_description: formData.store_description,
                    phone: formData.phone,
                    whatsapp: formData.whatsapp,
                    business_email: formData.business_email,
                    social_media: formData.social_media,
                    attention_hours: formData.attention_hours,
                    payment_methods: formData.payment_methods,
                    delivery_zones: formData.delivery_zones,
                    return_policy: formData.return_policy,
                    current_password: formData.current_password || undefined,
                    new_password: formData.new_password || undefined
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Error al actualizar el perfil");
            }

            // Actualizar el estado global con los nuevos datos del usuario
            dispatch({
                type: "auth_success",
                payload: {
                    token: store.auth.token,
                    user: data.user
                }
            });

            setSuccess("Perfil actualizado correctamente");

            // Limpiar campos de contraseña
            setFormData(prev => ({
                ...prev,
                current_password: '',
                new_password: '',
                confirm_password: ''
            }));

        } catch (error) {
            setErrors({
                general: error.message || "Ocurrió un error al actualizar el perfil"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            {errors.general && (
                <div className="alert alert-danger">{errors.general}</div>
            )}

            {success && (
                <div className="alert alert-success">{success}</div>
            )}

            {/* Información Personal */}
            <div className="card mb-4">
                <div className="card-header">
                    <h5 className="mb-0">Información Personal</h5>
                </div>
                <div className="card-body">
                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label htmlFor="first_name" className="form-label">Nombre</label>
                            <input
                                type="text"
                                className={`form-control ${errors.first_name ? "is-invalid" : ""}`}
                                id="first_name"
                                name="first_name"
                                value={formData.first_name}
                                onChange={handleChange}
                                required
                            />
                            {errors.first_name && <div className="invalid-feedback">{errors.first_name}</div>}
                        </div>

                        <div className="col-md-6 mb-3">
                            <label htmlFor="last_name" className="form-label">Apellidos</label>
                            <input
                                type="text"
                                className={`form-control ${errors.last_name ? "is-invalid" : ""}`}
                                id="last_name"
                                name="last_name"
                                value={formData.last_name}
                                onChange={handleChange}
                                required
                            />
                            {errors.last_name && <div className="invalid-feedback">{errors.last_name}</div>}
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label htmlFor="username" className="form-label">Nombre de usuario</label>
                            <input
                                type="text"
                                className={`form-control ${errors.username ? "is-invalid" : ""}`}
                                id="username"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                required
                            />
                            {errors.username && <div className="invalid-feedback">{errors.username}</div>}
                        </div>

                        <div className="col-md-6 mb-3">
                            <label htmlFor="email" className="form-label">Correo electrónico</label>
                            <input
                                type="email"
                                className={`form-control ${errors.email ? "is-invalid" : ""}`}
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                            {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                        </div>
                    </div>

                    <div className="mb-3">
                        <label htmlFor="phone" className="form-label">Teléfono</label>
                        <input
                            type="tel"
                            className="form-control"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="Ingresa tu número de teléfono"
                        />
                    </div>
                </div>
            </div>

            {/* Información de la Tienda */}
            {/* <div className="card mb-4">
                <div className="card-header">
                    <h5 className="mb-0">Información del vendedor</h5>
                </div>
                <div className="card-body">
                    <div className="mb-3">
                        <label htmlFor="store_name" className="form-label">Nombre de la Tienda</label>
                        <input
                            type="text"
                            className="form-control"
                            id="store_name"
                            name="store_name"
                            value={formData.store_name}
                            onChange={handleChange}
                            placeholder="Ingresa el nombre de tu tienda"
                        />
                    </div>

                    <div className="mb-3">
                        <label htmlFor="store_description" className="form-label">Describe lo que vendes</label>
                        <textarea
                            className="form-control"
                            id="store_description"
                            name="store_description"
                            rows="3"
                            value={formData.store_description}
                            onChange={handleChange}
                            placeholder="Describe lo que vendes en pocas palabras"
                        ></textarea>
                    </div>
                </div>
            </div> */}

            {/* Información de Contacto y Ventas */}
            <div className="card mb-4">
                <div className="card-header">
                    <h5 className="mb-0">Información de Contacto y Ventas</h5>
                </div>
                <div className="card-body">
                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label htmlFor="whatsapp" className="form-label">WhatsApp para ventas</label>
                            <input
                                type="tel"
                                className="form-control"
                                id="whatsapp"
                                name="whatsapp"
                                value={formData.whatsapp}
                                onChange={handleChange}
                                placeholder="Ej: +52 1234567890"
                            />
                            <div className="form-text">Número donde los clientes pueden contactarte por WhatsApp</div>
                        </div>

                        <div className="col-md-6 mb-3">
                            <label htmlFor="business_email" className="form-label">Correo electrónico comercial</label>
                            <input
                                type="email"
                                className="form-control"
                                id="business_email"
                                name="business_email"
                                value={formData.business_email}
                                onChange={handleChange}
                                placeholder="ventas@ejemplo.com"
                            />
                            <div className="form-text">Correo para contacto comercial (opcional)</div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label htmlFor="social_media" className="form-label">Enlace a red social principal</label>
                            <input
                                type="url"
                                className="form-control"
                                id="social_media"
                                name="social_media"
                                value={formData.social_media}
                                onChange={handleChange}
                                placeholder="https://instagram.com/tutienda"
                            />
                            <div className="form-text">Instagram, Facebook u otra red donde promociones tus productos</div>
                        </div>

                        <div className="col-md-6 mb-3">
                            <label htmlFor="attention_hours" className="form-label">Horarios de atención</label>
                            <input
                                type="text"
                                className="form-control"
                                id="attention_hours"
                                name="attention_hours"
                                value={formData.attention_hours}
                                onChange={handleChange}
                                placeholder="Ej: Lun-Vie 9am-6pm, Sáb 10am-2pm"
                            />
                        </div>
                    </div>

                    <div className="mb-3">
                        <label htmlFor="payment_methods" className="form-label">Métodos de pago aceptados</label>
                        <select
                            className="form-select"
                            id="payment_methods"
                            name="payment_methods"
                            value={formData.payment_methods}
                            onChange={handleChange}
                            multiple
                        >
                            <option value="efectivo">Efectivo</option>
                            <option value="transferencia">Transferencia bancaria</option>
                            <option value="mercado_pago">Mercado Pago</option>
                            <option value="paypal">PayPal</option>
                            <option value="tarjeta">Tarjeta (en persona)</option>
                            <option value="deposito">Depósito bancario</option>
                        </select>
                        <div className="form-text">Mantén presionada la tecla Ctrl/Cmd para seleccionar múltiples opciones</div>
                    </div>

                    <div className="mb-3">
                        <label htmlFor="delivery_zones" className="form-label">Zonas de entrega o cobertura</label>
                        <textarea
                            className="form-control"
                            id="delivery_zones"
                            name="delivery_zones"
                            rows="2"
                            value={formData.delivery_zones}
                            onChange={handleChange}
                            placeholder="Ej: Todo Guadalajara y Zapopan. Envíos a todo el país por paquetería."
                        ></textarea>
                    </div>

                    <div className="mb-3">
                        <label htmlFor="return_policy" className="form-label">Política de devoluciones</label>
                        <textarea
                            className="form-control"
                            id="return_policy"
                            name="return_policy"
                            rows="2"
                            value={formData.return_policy}
                            onChange={handleChange}
                            placeholder="Ej: Aceptamos devoluciones dentro de los primeros 7 días por defectos."
                        ></textarea>
                    </div>
                </div>
            </div>

            {/* Cambiar Contraseña */}
            <div className="card mb-4">
                <div className="card-header">
                    <h5 className="mb-0">Cambiar Contraseña</h5>
                </div>
                <div className="card-body">
                    <div className="mb-3">
                        <label htmlFor="current_password" className="form-label">Contraseña Actual</label>
                        <input
                            type="password"
                            className={`form-control ${errors.current_password ? "is-invalid" : ""}`}
                            id="current_password"
                            name="current_password"
                            value={formData.current_password}
                            onChange={handleChange}
                            placeholder="Deja en blanco si no quieres cambiar la contraseña"
                        />
                        {errors.current_password && <div className="invalid-feedback">{errors.current_password}</div>}
                    </div>

                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label htmlFor="new_password" className="form-label">Nueva Contraseña</label>
                            <input
                                type="password"
                                className={`form-control ${errors.new_password ? "is-invalid" : ""}`}
                                id="new_password"
                                name="new_password"
                                value={formData.new_password}
                                onChange={handleChange}
                                placeholder="Mínimo 6 caracteres"
                            />
                            {errors.new_password && <div className="invalid-feedback">{errors.new_password}</div>}
                        </div>

                        <div className="col-md-6 mb-3">
                            <label htmlFor="confirm_password" className="form-label">Confirmar Nueva Contraseña</label>
                            <input
                                type="password"
                                className={`form-control ${errors.confirm_password ? "is-invalid" : ""}`}
                                id="confirm_password"
                                name="confirm_password"
                                value={formData.confirm_password}
                                onChange={handleChange}
                                placeholder="Repite la nueva contraseña"
                            />
                            {errors.confirm_password && <div className="invalid-feedback">{errors.confirm_password}</div>}
                        </div>
                    </div>
                </div>
            </div>

            <div className="d-flex justify-content-end">
                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Guardando...
                        </>
                    ) : (
                        "Guardar Cambios"
                    )}
                </button>
            </div>
        </form>
    );
};


// Componente para el formulario de añadir producto
const AddProductForm = ({ editingProduct, onProductSaved }) => {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        category: "",
        subcategory: "",
        size: "",
        brand: "",
        condition: "two_wears", // Valor predeterminado para "dos posturas"
        material: "",
        color: "",
        price: "",
        discount: "",
        images: []
    });

    const [errors, setErrors] = useState({});
    const [uploadedImages, setUploadedImages] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { store } = useGlobalReducer();

    useEffect(() => {
        if (editingProduct) {
            setFormData({
                title: editingProduct.title || "",
                description: editingProduct.description || "",
                category: editingProduct.category || "",
                subcategory: editingProduct.subcategory || "",
                size: editingProduct.size || "",
                brand: editingProduct.brand || "",
                condition: editingProduct.condition || "two_wears",
                material: editingProduct.material || "",
                color: editingProduct.color || "",
                price: editingProduct.price?.toString() || "",
                discount: editingProduct.discount?.toString() || "",
            });

            // Cargar imágenes existentes
            if (editingProduct.images && editingProduct.images.length > 0) {
                const images = editingProduct.images.map(image => ({
                    preview: image.url,
                    isExisting: true
                }));
                setUploadedImages(images);
            }
        }
    }, [editingProduct]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        // Limpiar error específico
        if (errors[name]) {
            setErrors({ ...errors, [name]: "" });
        }
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);

        if (files.length + uploadedImages.length > 8) {
            setErrors({ ...errors, images: "Puedes subir un máximo de 8 imágenes" });
            return;
        }

        // Preview de imágenes
        const newUploadedImages = [...uploadedImages];

        files.forEach(file => {
            const reader = new FileReader();

            reader.onload = (event) => {
                newUploadedImages.push({
                    file: file,
                    preview: event.target.result
                });

                setUploadedImages([...newUploadedImages]);
            };

            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index) => {
        const newImages = [...uploadedImages];
        newImages.splice(index, 1);
        setUploadedImages(newImages);

        // Limpiar error de imágenes si existe
        if (errors.images) {
            setErrors({ ...errors, images: "" });
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = "El título es obligatorio";
        }

        if (!formData.description.trim()) {
            newErrors.description = "La descripción es obligatoria";
        }

        if (!formData.category) {
            newErrors.category = "La categoría es obligatoria";
        }

        if (!formData.size) {
            newErrors.size = "La talla es obligatoria";
        }

        if (!formData.price) {
            newErrors.price = "El precio es obligatorio";
        } else if (isNaN(formData.price) || Number(formData.price) <= 0) {
            newErrors.price = "El precio debe ser un número positivo";
        }

        if (uploadedImages.length === 0) {
            newErrors.images = "Debes subir al menos una imagen";
        }

        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formErrors = validateForm();

        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            return;
        }

        setIsSubmitting(true);

        try {
            const backendUrl = import.meta.env.VITE_BACKEND_URL;
            // 🎯 NUEVO: Primero subir las imágenes a Cloudinary
            const imageUrls = [];

            // Separar imágenes nuevas de las existentes
            const newImages = uploadedImages.filter(img => !img.isExisting);
            const existingImages = uploadedImages.filter(img => img.isExisting);

            // Subir solo las imágenes nuevas
            if (newImages.length > 0) {
                const formData = new FormData();

                // Agregar cada imagen nueva al FormData
                newImages.forEach(img => {
                    if (img.file) {
                        formData.append('images[]', img.file);
                    }
                });

                // Subir imágenes a Cloudinary
                const uploadResponse = await fetch(`${backendUrl}/api/upload/product-images`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${store.auth?.token}`
                    },
                    body: formData
                });

                if (!uploadResponse.ok) {
                    const uploadError = await uploadResponse.json();
                    throw new Error(uploadError.error || 'Error al subir las imágenes');
                }

                const uploadResult = await uploadResponse.json();

                // Agregar las URLs de las imágenes subidas
                uploadResult.uploaded.forEach(img => {
                    imageUrls.push(img.url);
                });
            }

            // Agregar las URLs de las imágenes existentes
            existingImages.forEach(img => {
                imageUrls.push(img.preview);
            });


            // Crear objeto con los datos del producto
            const productData = {
                title: formData.title,
                description: formData.description,
                category: formData.category,
                subcategory: formData.subcategory,
                size: formData.size,
                brand: formData.brand,
                condition: formData.condition,
                material: formData.material,
                color: formData.color,
                price: formData.price,
                discount: formData.discount || 0,
                images: uploadedImages.map(img => img.preview) // Por ahora usamos las previews
            };



            // Determinar si es una edición o una creación
            const url = editingProduct
                ? `${backendUrl}/api/products/${editingProduct.id}`
                : `${backendUrl}/api/products`;

            const method = editingProduct ? "PUT" : "POST";

            // Enviar petición al backend
            const response = await fetch(url, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${store.auth?.token}`
                },
                body: JSON.stringify(productData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `Error al ${editingProduct ? "actualizar" : "crear"} el producto`);
            }

            // Éxito
            alert(`Producto ${editingProduct ? "actualizado" : "añadido"} exitosamente`);

            // Limpiar formulario
            setFormData({
                title: "",
                description: "",
                category: "",
                subcategory: "",
                size: "",
                brand: "",
                condition: "two_wears",
                material: "",
                color: "",
                price: "",
                discount: "",
                images: []
            });

            setUploadedImages([]);

            // Notificar al componente padre
            if (onProductSaved) {
                onProductSaved();
            }

        } catch (error) {
            setErrors({
                general: error.message || `Ocurrió un error al ${editingProduct ? "actualizar" : "añadir"} el producto`
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            {errors.general && (
                <div className="alert alert-danger">{errors.general}</div>
            )}

            <div className="mb-3">
                <label htmlFor="title" className="form-label">Título del producto *</label>
                <input
                    type="text"
                    className={`form-control ${errors.title ? "is-invalid" : ""}`}
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Ej: Vestido floral Zara, usado solo dos veces"
                />
                {errors.title && <div className="invalid-feedback">{errors.title}</div>}
            </div>

            <div className="mb-3">
                <label htmlFor="description" className="form-label">Descripción *</label>
                <textarea
                    className={`form-control ${errors.description ? "is-invalid" : ""}`}
                    id="description"
                    name="description"
                    rows="4"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe tu prenda: estado, razón de venta, detalles, etc."
                ></textarea>
                {errors.description && <div className="invalid-feedback">{errors.description}</div>}
            </div>

            <div className="row">
                <div className="col-md-6 mb-3">
                    <label htmlFor="category" className="form-label">Categoría *</label>
                    <select
                        className={`form-select ${errors.category ? "is-invalid" : ""}`}
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                    >
                        <option value="">Seleccionar categoría...</option>

                        {/* Categorías para Mujer */}
                        <optgroup label="Mujer">
                            <option value="mujer_vestidos">Vestidos</option>
                            <option value="mujer_blusas">Blusas</option>
                            <option value="mujer_pantalones">Pantalones</option>
                            <option value="mujer_faldas">Faldas</option>
                            <option value="mujer_abrigos">Abrigos</option>
                            <option value="mujer_zapatos">Zapatos</option>
                            <option value="mujer_deportivo">Ropa Deportiva</option>
                        </optgroup>

                        {/* Categorías para Hombre */}
                        <optgroup label="Hombre">
                            <option value="hombre_camisetas">Camisetas</option>
                            <option value="hombre_camisas">Camisas</option>
                            <option value="hombre_pantalones">Pantalones</option>
                            <option value="hombre_abrigos">Abrigos</option>
                            <option value="hombre_zapatos">Zapatos</option>
                            <option value="hombre_deportivo">Ropa Deportiva</option>
                        </optgroup>

                        {/* Categorías Unisex */}
                        <optgroup label="Unisex">
                            <option value="unisex_accesorios">Accesorios</option>
                            <option value="unisex_bolsos">Bolsos</option>
                            <option value="unisex_gorras">Gorras</option>
                        </optgroup>
                    </select>
                    {errors.category && <div className="invalid-feedback">{errors.category}</div>}
                    <small className="form-text text-muted">
                        Selecciona la categoría que mejor describa tu producto
                    </small>
                </div>

                <div className="col-md-6 mb-3">
                    <label htmlFor="subcategory" className="form-label">Subcategoría (opcional)</label>
                    <input
                        type="text"
                        className="form-control"
                        id="subcategory"
                        name="subcategory"
                        value={formData.subcategory}
                        onChange={handleChange}
                        placeholder="Ej: Jeans, Casual, Formal, etc."
                    />
                    <small className="form-text text-muted">
                        Añade más detalles sobre el tipo de prenda
                    </small>
                </div>
            </div>

            <div className="row">
                <div className="col-md-6 mb-3">
                    <label htmlFor="size" className="form-label">Talla *</label>
                    <select
                        className={`form-select ${errors.size ? "is-invalid" : ""}`}
                        id="size"
                        name="size"
                        value={formData.size}
                        onChange={handleChange}
                    >
                        <option value="">Seleccionar...</option>
                        <option value="XS">XS</option>
                        <option value="S">S</option>
                        <option value="M">M</option>
                        <option value="L">L</option>
                        <option value="XL">XL</option>
                        <option value="XXL">XXL</option>
                        <option value="custom">Otra (especificar en descripción)</option>
                    </select>
                    {errors.size && <div className="invalid-feedback">{errors.size}</div>}
                </div>

                <div className="col-md-6 mb-3">
                    <label htmlFor="brand" className="form-label">Marca</label>
                    <input
                        type="text"
                        className="form-control"
                        id="brand"
                        name="brand"
                        value={formData.brand}
                        onChange={handleChange}
                        placeholder="Ej: Zara, H&M, Nike..."
                    />
                </div>
            </div>

            <div className="row">
                <div className="col-md-6 mb-3">
                    <label htmlFor="condition" className="form-label">Estado *</label>
                    <select
                        className="form-select"
                        id="condition"
                        name="condition"
                        value={formData.condition}
                        onChange={handleChange}
                    >
                        <option value="new_with_tags">Nuevo con etiquetas</option>
                        <option value="new_without_tags">Nuevo sin etiquetas</option>
                        <option value="two_wears">Dos posturas</option>
                        <option value="very_good">Muy buen estado</option>
                        <option value="good">Buen estado</option>
                        <option value="acceptable">Aceptable</option>
                    </select>
                </div>

                <div className="col-md-6 mb-3">
                    <label htmlFor="color" className="form-label">Color</label>
                    <input
                        type="text"
                        className="form-control"
                        id="color"
                        name="color"
                        value={formData.color}
                        onChange={handleChange}
                        placeholder="Ej: Negro, Rojo, Azul marino..."
                    />
                </div>
            </div>

            <div className="row">
                <div className="col-md-6 mb-3">
                    <label htmlFor="price" className="form-label">Precio (MXN) *</label>
                    <div className="input-group">
                        <span className="input-group-text">$</span>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            className={`form-control ${errors.price ? "is-invalid" : ""}`}
                            id="price"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            placeholder="0.00"
                        />
                        {errors.price && <div className="invalid-feedback">{errors.price}</div>}
                    </div>
                </div>

                <div className="col-md-6 mb-3">
                    <label htmlFor="discount" className="form-label">Descuento (%)</label>
                    <div className="input-group">
                        <input
                            type="number"
                            min="0"
                            max="100"
                            className="form-control"
                            id="discount"
                            name="discount"
                            value={formData.discount}
                            onChange={handleChange}
                            placeholder="0"
                        />
                        <span className="input-group-text">%</span>
                    </div>
                </div>
            </div>

            <div className="mb-4">
                <label className="form-label">Imágenes del producto *</label>
                <div className={`dropzone p-4 text-center border rounded ${errors.images ? "border-danger" : "border-dashed"}`}>
                    <input
                        type="file"
                        id="productImages"
                        accept="image/*"
                        multiple
                        className="d-none"
                        onChange={handleImageUpload}
                    />
                    <label htmlFor="productImages" className="mb-0 cursor-pointer">
                        <div className="py-4">
                            <i className="fas fa-cloud-upload-alt fa-3x text-muted mb-3"></i>
                            <p className="mb-0">Arrastra tus imágenes aquí o haz clic para seleccionarlas</p>
                            <small className="text-muted d-block mt-1">PNG, JPG, JPEG (máx. 8 imágenes)</small>
                            {uploadedImages.length > 0 && (
                                <span className="badge bg-primary mt-2">{uploadedImages.length} imagen(es) seleccionada(s)</span>
                            )}
                        </div>
                    </label>
                </div>
                {errors.images && <div className="text-danger small mt-1">{errors.images}</div>}

                {uploadedImages.length > 0 && (
                    <div className="mt-3">
                        <div className="d-flex flex-wrap gap-2">
                            {uploadedImages.map((image, index) => (
                                <div key={index} className="position-relative">
                                    <img
                                        src={image.preview}
                                        alt={`Preview ${index}`}
                                        className="img-thumbnail"
                                        style={{ width: "100px", height: "100px", objectFit: "cover" }}
                                    />
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-danger position-absolute top-0 end-0 rounded-circle"
                                        onClick={() => removeImage(index)}
                                        style={{ margin: "-10px" }}
                                    >
                                        <i className="fas fa-times"></i>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="row mb-4">
                <div className="col-md-6">
                    <div className="form-check">
                        <input className="form-check-input" type="checkbox" id="termsCheck" required />
                        <label className="form-check-label" htmlFor="termsCheck">
                            Acepto los términos y condiciones
                        </label>
                    </div>
                    <div className="form-check mt-2">
                        <input className="form-check-input" type="checkbox" id="qualityCheck" required />
                        <label className="form-check-label" htmlFor="qualityCheck">
                            Confirmo que la información y las imágenes son verídicas
                        </label>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="card bg-light">
                        <div className="card-body py-2">
                            <small className="text-muted">
                                <i className="fas fa-info-circle me-1"></i>
                                Tu producto será revisado antes de ser publicado para garantizar la calidad de nuestra plataforma.
                            </small>
                        </div>
                    </div>
                </div>
            </div>

            <div className="d-flex justify-content-between">
                {/* El botón de guardar borrador se oculta en modo edición */}
                {!editingProduct && (
                    <button type="button" className="btn btn-outline-secondary">
                        Guardar borrador
                    </button>
                )}

                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            {editingProduct ? "Guardando cambios..." : "Publicando..."}
                        </>
                    ) : (
                        editingProduct ? "Guardar cambios" : "Publicar producto"
                    )}
                </button>
            </div>
        </form>
    );
};





export default SellerDashboard;