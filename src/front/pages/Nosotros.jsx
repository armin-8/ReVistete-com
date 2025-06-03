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
                            Soy una de las creadoras de ReVístete y me apasiona la moda sostenible.
                            Siempre el enfoque es ofrecer una plataforma intuitiva que conecta a
                            quienes desean dar una segunda vida a sus prendas, así como lograr
                            que se apasionen en este mundo de la moda tanto para la compra como
                            para la venta de artículos de segunda mano.
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
                            Soy uno de los creadores de ReVístete , mi misión es impulsar la moda responsable.
                            Creo fervientemente en el poder de dar vida nueva a las prendas y en la belleza
                            de los estilos únicos que surgen de lo pre-loved. Me motiva crear una experiencia
                            amigable y cercana donde cada usuario se sienta parte de esta comunidad que
                            valora la sostenibilidad, el reciclaje y el impacto positivo en nuestro entorno.
                            ¡Bienvenidos a ReVístete, donde cada prenda cuenta una historia!
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Nosotros;
