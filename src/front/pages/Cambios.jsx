import React from "react";

const Cambios = () => {
  return (
    <div className="container py-5 mt-5">
      <h1 className="mb-4">Política de cambios</h1>
      <p>
        En ReVístete queremos que quedés 100% satisfecho con tu compra. Si por
        alguna razón necesitás cambiar tu prenda, este es el proceso:
      </p>
      <ul className="list-unstyled">
        <li className="mb-2">
          <strong>Periodo de cambio:</strong> Tenés hasta 7 días hábiles después
          de recibir tu pedido para solicitar un cambio.
        </li>
        <li className="mb-2">
          <strong>Condiciones:</strong> La prenda debe estar en las mismas
          condiciones en las que la recibiste: sin uso, con etiquetas
          originales y en su empaque.
        </li>
        <li className="mb-2">
          <strong>Proceso:</strong>  
          <ol className="mt-2 mb-2">
            <li>Escribinos a cambios@revistete.com indicando tu número de pedido y el motivo del cambio.</li>
            <li>Te enviaremos un código de devolución para que puedas mandar la prenda de vuelta (el costo de envío corre por nuestra cuenta).</li>
            <li>Una vez recibamos la prenda y verifiquemos su estado, te despacharemos el nuevo talle o modelo que hayas elegido.</li>
          </ol>
        </li>
        <li>
          <strong>Productos no cambiables:</strong> Prendas con signos evidentes de uso o sin etiquetas originales. Tampoco se hacen cambios en accesorios.
        </li>
      </ul>
      <hr />
      <p className="mt-4">
        Si tenés alguna duda extra, escribinos a{" "}
        <a href="mailto:cambios@revistete.com" className="text-decoration-underline">
          cambios@revistete.com
        </a>.
      </p>
    </div>
  );
};

export default Cambios;
