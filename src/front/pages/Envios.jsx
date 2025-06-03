import React from "react";

const Envios = () => {
  return (
    <div className="container py-5">
      <h1 className="mb-4 mt-5">Envíos</h1>
      <p>
        A continuación, los puntos más
        importantes sobre nuestros envíos:
      </p>
      <ul className="list-unstyled">
        <li className="mb-2">
          <strong>Tiempo de procesamiento:</strong> 1-2 días hábiles desde que
          realizás la compra.
        </li>
        <li className="mb-2">
          <strong>Costos de envío:</strong> Varían según la región y el peso del
          paquete.
        </li>
        <li>
          <strong>Entrega:</strong> Normalmente, los paquetes llegan entre 3 y 5
          días hábiles. En zonas remotas puede demorar un poco más.
        </li>
      </ul>
      <hr />
      <p className="mt-4">
        Si tenés más dudas sobre envíos, podés escribirnos a{" "}
        <a href="mailto:envios@revistete.com" className="text-decoration-underline">
          envios@revistete.com
        </a>.
      </p>
    </div>
  );
};

export default Envios;

