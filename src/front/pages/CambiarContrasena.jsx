import React, { useState } from "react";

const CambiarContrasena = () => {
  const [actual, setActual] = useState("");
  const [nueva, setNueva] = useState("");
  const [confirmar, setConfirmar] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí deberías hacer la validación y enviar al backend
    console.log({ actual, nueva, confirmar });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h4>Cambiar contraseña</h4>
      <div className="mb-3">
        <label className="form-label">Contraseña actual</label>
        <input type="password" className="form-control" value={actual} onChange={(e) => setActual(e.target.value)} />
      </div>
      <div className="mb-3">
        <label className="form-label">Nueva contraseña</label>
        <input type="password" className="form-control" value={nueva} onChange={(e) => setNueva(e.target.value)} />
      </div>
      <div className="mb-3">
        <label className="form-label">Confirmar nueva contraseña</label>
        <input type="password" className="form-control" value={confirmar} onChange={(e) => setConfirmar(e.target.value)} />
      </div>
      <button type="submit" className="btn btn-primary">Guardar cambios</button>
    </form>
  );
};

export default CambiarContrasena;
