
import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
	return (
		<div className="container-fluid p-0">
			{/* Hero Section */}
			<div
				className="position-relative d-flex align-items-center"
				style={{
					backgroundImage:
						"url('https://images.pexels.com/photos/7667449/pexels-photo-7667449.jpeg')",
					backgroundSize: "cover",
					backgroundPosition: "center",
					minHeight: "600px",
					color: "white",
				}}
			>
				<div
					className="position-absolute top-0 start-0 w-100 h-100"
					style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
				></div>

				{/* // Añadir a Home.jsx cerca del botón "Empezar a vender" */}

				<div className="container my-5">
					<div className="row">
						<div className="col-md-6">
							<div className="card shadow-sm mb-4">
								<div className="card-body text-center p-4">
									<i className="fas fa-tshirt fa-3x text-primary mb-3"></i>
									<h3>¿Quieres vender?</h3>
									<p>Convierte tu ropa poco usada en dinero y dale una segunda vida</p>
									<Link to="/seller-signup" className="btn btn-danger btn-lg">
										Empezar a vender
									</Link>
								</div>
							</div>
						</div>

						<div className="col-md-6">
							<div className="card shadow-sm mb-4">
								<div className="card-body text-center p-4">
									<i className="fas fa-shopping-bag fa-3x text-success mb-3"></i>
									<h3>¿Buscas comprar?</h3>
									<p>Descubre prendas únicas a precios increíbles con garantía de calidad</p>
									<Link to="/buyer-signup" className="btn btn-success btn-lg">
										Registrarse para comprar
									</Link>
								</div>
							</div>
						</div>
					</div>
				</div>

			</div>


			<div className="container my-5">
				<h2 className="display-5 mb-4">Categorías</h2>
				<div className="row g-4">
					{categories.map((category) => (
						<div key={category.id} className="col-6 col-md-4 col-lg-4">
							<div className="card h-100 border-0 shadow-sm">
								<div className="position-relative">
									<img
										src={category.image}
										className="card-img-top"
										alt={category.name}
										style={{ height: "200px", objectFit: "cover" }}
									/>
									<div
										className="position-absolute bottom-0 start-0 w-100 p-3"
										style={{ background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)" }}
									>
										<h5 className="card-title m-0 text-white">{category.name}</h5>
									</div>
								</div>
								<div className="card-body">
									<a href={`/category/${category.id}`} className="stretched-link text-decoration-none">
										Ver productos
									</a>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

// Category data - limited to 6 categories
const categories = [
	{
		id: 1,
		name: "Vestidos",
		image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
	},
	{
		id: 2,
		name: "Abrigos",
		image: "https://images.pexels.com/photos/7679798/pexels-photo-7679798.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
	},
	{
		id: 3,
		name: "Deportivo",
		image: "https://images.pexels.com/photos/5037318/pexels-photo-5037318.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
	},
	{
		id: 4,
		name: "Blusas",
		image: "https://images.unsplash.com/photo-1554568218-0f1715e72254?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
	},
	{
		id: 5,
		name: "Pantalones",
		image: "https://images.unsplash.com/photo-1542272604-787c3835535d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
	},
	{
		id: 6,
		name: "Camisas",
		image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
	}
];

export default Home;