// src/components/BuyerSidebar.jsx
import React from "react";

const BuyerSidebar = ({ activeTab, setActiveTab, username }) => {
  const navItems = [
    { label: "Panel Principal", icon: "bi-house", key: "overview" },
    { label: "Mis Compras", icon: "bi-bag-check", key: "orders" },
    { label: "Favoritos", icon: "bi-heart", key: "favorites" },
    { label: "Configuración", icon: "bi-gear", key: "settings" },
  ];

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <div className="text-center mb-4">
          <div
            className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mx-auto"
            style={{ width: "80px", height: "80px" }}
          >
            <i className="bi bi-person-circle fs-1"></i>
          </div>
          <h5 className="mt-3 mb-0">{username || "Usuario"}</h5>
          <small className="text-muted">@{username ? username.toLowerCase() : "usuario"}</small>
        </div>

        <hr />

        <ul className="nav nav-pills flex-column">
          {navItems.map((item, idx) => (
            <li className="nav-item" key={idx}>
              <button
                className={`nav-link text-start w-100 ${activeTab === item.key ? "active" : ""}`}
                onClick={() => setActiveTab(item.key)}
              >
                <i className={`bi ${item.icon} me-2`}></i> {item.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default BuyerSidebar;
