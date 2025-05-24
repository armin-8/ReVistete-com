// src/front/pages/BuyerDashboard.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ConfiguracionComprador from "../pages/ConfiguracionComprador";
import useGlobalReducer from "../hooks/useGlobalReducer";

const BuyerDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const { store, dispatch } = useGlobalReducer();
  const navigate = useNavigate();

  /* ---------- logout ---------- */
  const handleLogout = () => {
    dispatch({ type: "auth_logout" });   // limpia token y user en store + sessionStorage
    navigate("/login");                  // o navigate("/") si prefieres volver al home
  };

  const renderContent = () => {
    switch (activeTab) {
      case "orders":
        return <h2 className="text-center">Mis Compras</h2>;
      case "favorites":
        return <h2 className="text-center">Favoritos</h2>;
      case "settings":
        return <ConfiguracionComprador />;
      default:
        return <h2 className="text-center">Bienvenido</h2>;
    }
  };

  return (
    <div className="container my-5 pt-5">
      <div className="row">
        {/* -------- Sidebar -------- */}
        <div className="col-lg-3 mb-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="text-center mb-3">
                <div
                  className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mx-auto"
                  style={{ width: "80px", height: "80px" }}
                >
                  <i className="fas fa-user-circle fa-3x"></i>
                </div>
                <h5 className="mt-3 mb-0">
                  {store?.auth?.user?.first_name} {store?.auth?.user?.last_name}
                </h5>
                <small className="text-muted">
                  @{store?.auth?.user?.username}
                </small>
              </div>

              <hr />

              <ul className="nav nav-pills flex-column">
                <li className="nav-item">
                  <button
                    className={`nav-link text-start w-100 ${
                      activeTab === "overview" ? "active" : ""
                    }`}
                    onClick={() => setActiveTab("overview")}
                  >
                    <i className="fas fa-home me-2"></i> Panel Principal
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link text-start w-100 ${
                      activeTab === "orders" ? "active" : ""
                    }`}
                    onClick={() => setActiveTab("orders")}
                  >
                    <i className="fas fa-box me-2"></i> Mis Compras
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link text-start w-100 ${
                      activeTab === "favorites" ? "active" : ""
                    }`}
                    onClick={() => setActiveTab("favorites")}
                  >
                    <i className="fas fa-heart me-2"></i> Favoritos
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link text-start w-100 ${
                      activeTab === "settings" ? "active" : ""
                    }`}
                    onClick={() => setActiveTab("settings")}
                  >
                    <i className="fas fa-cog me-2"></i> Configuración
                  </button>
                </li>

                {/* ---- Botón Cerrar sesión ---- */}
                <li className="nav-item mt-2">
                  <button
                    className="nav-link text-start w-100 text-danger"
                    onClick={handleLogout}
                  >
                    <i className="fas fa-sign-out-alt me-2"></i> Cerrar sesión
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* -------- Contenido principal -------- */}
        <div className="col-lg-9">{renderContent()}</div>
      </div>
    </div>
  );
};

export default BuyerDashboard;
