import React, { useState, useEffect, useContext } from "react";
import { Context } from "../store/appContext";

const MisDatos = () => {
  const { store } = useContext(Context);
  const user = store.auth.user;

  const [nombre, setNombre] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [usuario, setUsuario] = useState("");
  const [email, setEmail] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");

  // Cargar los datos actuales al montar el componente
  useEffect(() => {
    if (user) {
      setNombre(user.nombre || "");
      setApellidos(user.apellidos || "");
      setUsuario(user.username || "");
      setEmail(user.email || "");
      setFechaNacimiento(user.fecha_nacimiento || "");
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const datos = {
      nombre,
      apellidos,
      username: usuario,
      email,
      fecha_nacimiento: fechaNacimiento,
    };

    try {
      const response = await fetch(`${process.env.BACKEND_URL}/user/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${store.auth.token}`,
        },
        body: JSON.stringify(datos),
      });

      if (!response.ok) {
        throw new Error("Error al actualizar los datos");
      }

      alert("Datos actualizados correctamente.");
    } catch (error) {
      console.error(error);
      alert("Hubo un error al actualizar tus datos.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h4>Mis Datos</h4>
      <div className="mb-3">
        <label className="form-label">Nombre</label>
        <input type="text" className="form-control" value={nombre} onChange={(e) => setNombre(e.target.value)} />
      </div>
      <div className="mb-3">
        <label className="form-label">Apellidos</label>
        <input type="text" className="form-control" value={apellidos} onChange={(e) => setApellidos(e.target.value)} />
      </div>
      <div className="mb-3">
        <label className="form-label">Usuario</label>
        <input type="text" className="form-control" value={usuario} onChange={(e) => setUsuario(e.target.value)} />
      </div>
      <div className="mb-3">
        <label className="form-label">Email</label>
        <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="mb-3">
        <label className="form-label">Fecha de nacimiento</label>
        <input type="date" className="form-control" value={fechaNacimiento} onChange={(e) => setFechaNacimiento(e.target.value)} />
      </div>
      <button type="submit" className="btn btn-primary">Guardar cambios</button>
    </form>
  );
};

export default MisDatos;
