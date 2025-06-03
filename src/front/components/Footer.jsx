// src/front/components/Footer.jsx

import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-dark text-white py-4 mt-auto">
      <div className="container">
        <div className="row text-center text-md-start d-flex justify-content-between">
          {/* Ayuda */}
          <div className="col-12 col-md-4 mb-3">
            <h5 className="mb-3">Ayuda</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/contacto" className="text-white text-decoration-none">
                  Contacto
                </Link>
              </li>
              <li>
                <Link to="/envios" className="text-white text-decoration-none">
                  Envíos
                </Link>
              </li>
            </ul>
          </div>

          {/* Sobre Nosotros */}
          <div className="col-12 col-md-4 mb-3">
            <h5 className="mb-3">Sobre Nosotros</h5>
            <ul className="list-unstyled">
              <li>
                <Link to="/nosotros" className="text-white text-decoration-none">
                  Nuestra historia
                </Link>
              </li>
            </ul>
          </div>

          {/* Cambios y Devoluciones */}
          <div className="col-12 col-md-4 mb-3">
            <h5 className="mb-3">Cambios y Devoluciones</h5>
            <ul className="list-unstyled">
              <li>
                <Link to="/cambios" className="text-white text-decoration-none">
                  Política de cambios
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="text-center pt-3 border-top border-light">
          <p className="mb-0">
            &copy; {new Date().getFullYear()} SegundaMano Store. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
