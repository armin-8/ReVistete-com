// src/front/components/Navbar.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import ReVistete2 from "../assets/img/ReVistete2.png";

const Navbar = () => {
  const { store, dispatch } = useGlobalReducer();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  /* --- cambia color al hacer scroll --- */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* --- lógica para “Vender” --- */
  const handleSellClick = () => {
    if (store.auth?.isAuthenticated && store.auth.user.role === "seller")
      navigate("/seller-dashboard");
    else if (store.auth?.isAuthenticated)
      navigate("/become-seller");
    else
      navigate("/seller-signup");
  };

  /* --- clases dinámicas --- */
  const navbarClass = scrolled
    ? "navbar navbar-expand-lg fixed-top bg-white navbar-light shadow-sm transition-all"
    : "navbar navbar-expand-lg fixed-top bg-black navbar-dark transition-all";

  return (
    <nav className={navbarClass}>
      <div className="container">
        {/* ---------- Logo ---------- */}
        <Link to="/" className="navbar-brand fw-bold d-flex align-items-center">
          <img src={ReVistete2} className="me-2" style={{ height: "50px" }} />
          ReVistete
        </Link>

        {/* ---------- Hamburguesa ---------- */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* ---------- Contenido ---------- */}
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          {/* ----------- Menús centrales ----------- */}
          <ul className="navbar-nav mx-auto mb-2 mb-lg-0">
            {/* Hombre */}
            <li className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle"
                href="#"
                id="navbarDropdownHombre"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Hombre
              </a>
              <ul className="dropdown-menu" aria-labelledby="navbarDropdownHombre">
                <li><Link className="dropdown-item" to="/hombre/camisetas">Camisetas</Link></li>
                <li><Link className="dropdown-item" to="/hombre/pantalones">Pantalones</Link></li>
                <li><Link className="dropdown-item" to="/hombre/abrigos">Abrigos</Link></li>
                <li><hr className="dropdown-divider" /></li>
                <li><Link className="dropdown-item" to="/hombre/ofertas">Ofertas</Link></li>
                <li><Link className="dropdown-item" to="/hombre">Ver todo</Link></li>
              </ul>
            </li>

            {/* Mujer */}
            <li className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle"
                href="#"
                id="navbarDropdownMujer"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Mujer
              </a>
              <ul className="dropdown-menu" aria-labelledby="navbarDropdownMujer">
                <li><Link className="dropdown-item" to="/mujer/blusas">Blusas</Link></li>
                <li><Link className="dropdown-item" to="/mujer/vestidos">Vestidos</Link></li>
                <li><Link className="dropdown-item" to="/mujer/abrigos">Abrigos</Link></li>
                <li><hr className="dropdown-divider" /></li>
                <li><Link className="dropdown-item" to="/mujer/ofertas">Ofertas</Link></li>
                <li><Link className="dropdown-item" to="/mujer">Ver todo</Link></li>
              </ul>
            </li>

            {/* Vender */}
            <li className="nav-item">
              <button className="nav-link btn btn-link" onClick={handleSellClick}>
                Vender
              </button>
            </li>
          </ul>

          {/* ----------- Iconos / Perfil ----------- */}
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
            {/* Favoritos */}
            <li className="nav-item me-3">
              <Link className="nav-link" to="/favoritos">
                <i className="fa-regular fa-heart"></i>
              </Link>
            </li>

            {/* Perfil */}
            <li className="nav-item dropdown me-3">
              <button
                className="nav-link dropdown-toggle bg-transparent border-0"
                id="profileDropdown"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <i className="fa-regular fa-user"></i>
              </button>

              <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="profileDropdown">
                {/* Mi perfil */}
                <li>
                  <Link
                    className="dropdown-item"
                    to={
                      store.auth?.isAuthenticated
                        ? store.auth.user.role === "seller"
                          ? "/seller-dashboard"
                          : "/comprador/panel"
                        : "/login"
                    }
                  >
                    Mi perfil
                  </Link>
                </li>

                {/* Cerrar sesión */}
                {store.auth?.isAuthenticated && (
                  <>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button
                        className="dropdown-item text-danger"
                        onClick={() => {
                          dispatch({ type: "auth_logout" });
                          navigate("/login");
                        }}
                      >
                        Cerrar sesión
                      </button>
                    </li>
                  </>
                )}
              </ul>
            </li>

            {/* Carrito */}
            <li className="nav-item">
              <Link to="/carrito" className="nav-link position-relative">
                <i className="fa-solid fa-cart-shopping"></i>
                {store.cart.items.length > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge bg-danger">
                    {store.cart.items.length}
                  </span>
                )}
              </Link>

            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
