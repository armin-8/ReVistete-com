// src/front/pages/Nosotros.jsx

import React from "react";
import jaz from "../assets/img/jaz.png"; // Ajusta la ruta si es necesario
import Armin from "../assets/img/Armin.png"; // Ajusta la ruta si es necesario

const Nosotros = () => {
    return (
        <div className="container py-5 mt-5">
            <h1 className="mb-4">Nuestra historia</h1>
            <p>
                ReVístete nació con la misión de darle una segunda vida a prendas únicas,
                compartiendo historias y promoviendo la moda sostenible. Somos un equipo
                apasionado por el reciclaje de vestuario y creemos que cada prenda tiene
                su propia aventura para contar.
            </p>

            <h2 className="mt-4">Nuestra visión</h2>
            <p>
                Aspiramos a ser el referente principal de ropa de segunda mano, fomentando
                prácticas responsables con el medio ambiente y ofreciendo a nuestros clientes
                prendas de gran calidad a precios accesibles, así como brindando un excelente
                servicio al cliente para solventar cada una de sus dudas.
            </p>

            <hr />


            <h2 className="mt-5">¿Quiénes somos?</h2>

            <section className="py-5">
                <div className="row align-items-center">
                    {/* Columna de la imagen con tamaño fijo */}
                    <div className="col-lg-6 mb-4 mb-lg-0 d-flex justify-content-center justify-content-lg-start">
                        <img
                            src={jaz}
                            alt="Jazmin Monge"
                            style={{
                                width: "300px",       // Ancho fijo
                                height: "400px",      // Alto fijo
                                objectFit: "cover",   // Para que recorte y no deforme
                                borderRadius: "1rem"  // Como rounded-4
                            }}
                        />
                    </div>

                    {/* Columna del texto */}
                    <div className="col-lg-6 p-10">
                        <h2 className="fw-bold">¡Hola!, Mi nombre es Jazmin Monge:</h2>
                        <p className="lead">
                          Soy estudiante de Ingeniería en Sistemas, con experiencia laboral en el área financiera. Me apasiona todo lo relacionado al mundo del gimnasio y el fitness, lo que me impulsa a mantener un estilo de vida activo y saludable. Además, soy fundadora de un pequeño emprendimiento llamado MOA
                        </p>
                    </div>
                </div>
            </section>

            <section className="py-5">
                <div className="row align-items-center">
                    {/* Columna de la imagen con tamaño fijo */}
                    <div className="col-lg-6 mb-4 mb-lg-0 d-flex justify-content-center justify-content-lg-start">
                        <img
                            src={Armin}
                            alt="Armin Perez"
                            style={{
                                width: "300px",       // Ancho fijo
                                height: "400px",      // Alto fijo
                                objectFit: "cover",   // Para que recorte y no deforme
                                borderRadius: "1rem"  // Como rounded-4
                            }}
                        />
                    </div>

                    {/* Columna del texto */}
                    <div className="col-lg-6 p-10">
                        <h2 className="fw-bold">¡Hola!, Mi nombre es Armin Perez:</h2>
                        <p className="lead">
                            Ingeniero Industrial con especialización en comercio electrónico. Actualmente me desempeño como E-commerce Manager, administrando tiendas en Shopify y optimizando experiencias de compra online. Mi formación analítica, combinada con mi pasión por la tecnología disruptiva y la inteligencia artificial, me permite crear soluciones innovadoras en el mundo digital.
                            Fuera del ámbito profesional, soy un apasionado del fútbol y la lectura. Mi espíritu emprendedor me impulsa constantemente a explorar nuevas ideas y transformarlas en proyectos que generen valor.
                            ¡Bienvenidos a ReVístete, donde cada prenda cuenta una historia!
                        </p>
                    </div>
                </div>
            </section>


            <h2 className="mt-4">Tecnologías</h2>
            <p>
                Frontend: React, Vite, Bootstrap 5<br />
                Backend: Flask, Python<br />
                Base de Datos: PostgreSQL/SQLite<br />
                Autenticación: JWT<br />
                Almacenamiento: Cloudinary<br />
                Deployment: GitHub Codespaces<br />
            </p>
            <hr />

        </div>
    );
};

export default Nosotros;
