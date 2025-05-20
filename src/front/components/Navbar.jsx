// import { Link } from "react-router-dom";

// export const Navbar = () => {

// 	return (
// 		<nav className="navbar navbar-light bg-light">
// 			<div className="container">
// 				<Link to="/">
// 					<span className="navbar-brand mb-0 h1">React Boilerplate</span>
// 				</Link>
// 				<div className="ml-auto">
// 					<Link to="/demo">
// 						<button className="btn btn-primary">Check the Context in action</button>
// 					</Link>
// 				</div>
// 			</div>
// 		</nav>
// 	);
// };

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import ReVistete2 from "../assets/img/ReVistete2.png";

export const Navbar = () => {
	const { store, dispatch } = useGlobalReducer();
	const navigate = useNavigate();
	const [scrolled, setScrolled] = useState(false);

	// Detectar scroll para cambiar el color del navbar
	useEffect(() => {
		const handleScroll = () => {
			if (window.scrollY > 80) {
				setScrolled(true);
			} else {
				setScrolled(false);
			}
		};

		window.addEventListener("scroll", handleScroll);

		// Limpieza del event listener al desmontar
		return () => {
			window.removeEventListener("scroll", handleScroll);
		};
	}, []);

	// Manejar click en vender (redirige a registro o a crear anuncio)
	const handleSellClick = () => {
		if (store.auth?.isAuthenticated && store.auth?.user?.role === "seller") {
			navigate("/seller-dashboard");
		} else if (store.auth?.isAuthenticated) {
			navigate("/become-seller"); // Ruta para convertirse en vendedor si ya es usuario
		} else {
			navigate("/seller-signup"); // Ruta para registro de vendedor
		}
	};

	// Clases dinámicas basadas en el estado de scroll
	const navbarClass = scrolled
		? "navbar navbar-expand-lg fixed-top bg-white navbar-light shadow-sm transition-all"
		: "navbar navbar-expand-lg fixed-top bg-black navbar-dark transition-all";

	return (
		<nav className={navbarClass}>
			<div className="container">
				<Link to="/" className="navbar-brand fw-bold d-flex align-items-center">
					<img src={ReVistete2} className="me-2" style={{ height: '50px' }} />
					ReVistete
				</Link>

				{/* Botón hamburguesa para móviles */}
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

				{/* Contenido del navbar */}
				<div className="collapse navbar-collapse" id="navbarSupportedContent">
					{/* Menús centrales */}
					<ul className="navbar-nav mx-auto mb-2 mb-lg-0">
						{/* Menú Hombre con dropdown */}
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
								<li><Link className="dropdown-item" to="/hombre/zapatos">Abrigos</Link></li>
								<li><hr className="dropdown-divider" /></li>
								<li><Link className="dropdown-item" to="/hombre/ofertas">Ofertas</Link></li>
								<li><Link className="dropdown-item" to="/hombre">Ver todo</Link></li>
							</ul>
						</li>

						{/* Menú Mujer con dropdown */}
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
								<li><Link className="dropdown-item" to="/mujer/zapatos">Abrigos</Link></li>
								<li><hr className="dropdown-divider" /></li>
								<li><Link className="dropdown-item" to="/mujer/ofertas">Ofertas</Link></li>
								<li><Link className="dropdown-item" to="/mujer">Ver todo</Link></li>
							</ul>
						</li>

						{/* Botón Vender */}
						<li className="nav-item">
							<button
								className="nav-link btn btn-link"
								onClick={handleSellClick}
							>
								Vender
							</button>
						</li>
					</ul>

					{/* Íconos a la derecha */}
					<ul className="navbar-nav ms-auto mb-2 mb-lg-0">
						{/* Favoritos */}
						<li className="nav-item">
							<Link className="nav-link" to="/favoritos">
								<i className="fa-regular fa-heart"></i>
							</Link>
						</li>

						{/* Cuenta/Login */}
						<li className="nav-item">
							<Link className="nav-link" to={store.auth?.isAuthenticated ? "/perfil" : "/login"}>
								<i className="fa-regular fa-user"></i>
							</Link>
						</li>

						{/* Carrito */}
						<li className="nav-item">
							<Link className="nav-link position-relative" to="/carrito">
								<i className="fa-solid fa-cart-shopping"></i>
								{/* Indicador de items en carrito (opcional) */}
								{store.cart?.items?.length > 0 && (
									<span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
										{store.cart.items.length}
										<span className="visually-hidden">items en carrito</span>
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