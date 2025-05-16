import React from "react";

const Footer = () => {
  return (
    <footer className="bg-dark text-white py-4 mt-auto">
      <div className="container">
        <div className="row text-center text-md-start">
          <div className="col-12 col-md-3 mb-3">
            <h5>Ayuda</h5>
            <ul className="list-unstyled">
              <li><a href="/ayuda" className="text-white text-decoration-none">Centro de ayuda</a></li>
              <li><a href="/contacto" className="text-white text-decoration-none">Contacto</a></li>
              <li><a href="/envios" className="text-white text-decoration-none">Envíos</a></li>
            </ul>
          </div>

          <div className="col-12 col-md-3 mb-3">
            <h5>Sobre Nosotros</h5>
            <ul className="list-unstyled">
              <li><a href="/nosotros" className="text-white text-decoration-none">Nuestra historia</a></li>
              <li><a href="/sostenibilidad" className="text-white text-decoration-none">Sostenibilidad</a></li>
            </ul>
          </div>

          <div className="col-12 col-md-3 mb-3">
            <h5>Términos</h5>
            <ul className="list-unstyled">
              <li><a href="/terminos" className="text-white text-decoration-none">Términos y condiciones</a></li>
              <li><a href="/privacidad" className="text-white text-decoration-none">Política de privacidad</a></li>
            </ul>
          </div>

          <div className="col-12 col-md-3 mb-3">
            <h5>Cambios y Devoluciones</h5>
            <ul className="list-unstyled">
              <li><a href="/cambios" className="text-white text-decoration-none">Política de cambios</a></li>
              <li><a href="/devoluciones" className="text-white text-decoration-none">Política de devoluciones</a></li>
            </ul>
          </div>
        </div>

        <div className="text-center pt-3 border-top border-light">
          <p className="mb-0">&copy; {new Date().getFullYear()} SegundaMano Store. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
