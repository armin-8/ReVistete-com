import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
	return (
		<div className="container-fluid p-0">
			{/* ───────── Hero Section ───────── */}
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
				/>
				<div className="container my-5">
					<div className="row">
						{/* ¿Quieres vender? */}
						<div className="col-md-6">
							<div className="card shadow-sm mb-4">
								<div className="card-body text-center p-4">
									<i className="fas fa-tshirt fa-3x text-primary mb-3" />
									<h3>¿Quieres vender?</h3>
									<p>Convierte tu ropa poco usada en dinero y dale una segunda vida</p>
									<Link to="/seller-signup" className="btn btn-danger btn-lg">
										Empezar a vender
									</Link>
								</div>
							</div>
						</div>
						{/* ¿Buscas comprar? */}
						<div className="col-md-6">
							<div className="card shadow-sm mb-4">
								<div className="card-body text-center p-4">
									<i className="fas fa-shopping-bag fa-3x text-success mb-3" />
									<h3>¿Buscas comprar?</h3>
									<p>Descubre prendas únicas a precios increíbles con garantía de calidad</p>
									<Link to="/buyer-signup" className="btn btn-danger btn-lg">
										Registrarse para comprar
									</Link>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* ───────── NUEVO Banner informativo ───────── */}
			<section className="py-5">
				<div className="container">
					<div className="row align-items-center">
						{/* Imagen */}
						<div className="col-lg-6 mb-4 mb-lg-0">
							<img
								src="https://modernparenting-onemega.com/wp-content/uploads/2024/03/List-of-Facebook-Groups-To-Help-Declutter-Our-Homes-scaled.jpg"
								className="img-fluid rounded-4 shadow-sm"
								alt="Prendas de segunda mano"
							/>
						</div>
						{/* Texto */}
						<div className="col-lg-6">
							<h2 className="fw-bold">
								¡Dar una segunda vida a tu ropa nunca fue tan fácil!
							</h2>
							<p className="lead">
								Cada prenda reutilizada reduce la huella de carbono y ahorra agua
								valiosa. Únete al movimiento <em>slow fashion</em> y haz la
								diferencia con estilo.
							</p>
						</div>
					</div>
				</div>
			</section>
		</div>
	)

}

export default Home;
