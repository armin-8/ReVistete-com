import React, { useState, useEffect } from "react";

const ConfiguracionComprador = () => {
  const [view, setView] = useState("profile");

  const [nombre, setNombre] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");

  const [actualPassword, setActualPassword] = useState("");
  const [nuevaPassword, setNuevaPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");

  const token = localStorage.getItem("token");

  // Obtener datos del perfil al cargar
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/user/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setNombre(data.nombre || "");
          setApellidos(data.apellidos || "");
          setUsername(data.username || "");
          setEmail(data.email || "");
          setFechaNacimiento(data.fecha_nacimiento || "");
        } else {
          console.error("No se pudo obtener el perfil");
        }
      } catch (error) {
        console.error("Error al cargar el perfil:", error);
      }
    };

    fetchProfile();
  }, [token]);

  const handleSaveProfile = async () => {
    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nombre,
          apellidos,
          username,
          email,
          fecha_nacimiento: fechaNacimiento,
        }),
      });

      if (response.ok) {
        alert("Datos actualizados correctamente.");
      } else {
        alert("Hubo un error al actualizar los datos.");
      }
    } catch (error) {
      console.error(error);
      alert("Error en la solicitud.");
    }
  };

  const handleChangePassword = async () => {
    if (nuevaPassword !== confirmarPassword) {
      alert("Las contraseñas no coinciden.");
      return;
    }

    try {
      const response = await fetch("/api/user/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          actual_password: actualPassword,
          nueva_password: nuevaPassword,
        }),
      });

      if (response.ok) {
        alert("Contraseña cambiada exitosamente.");
        setActualPassword("");
        setNuevaPassword("");
        setConfirmarPassword("");
      } else {
        alert("Hubo un error al cambiar la contraseña.");
      }
    } catch (error) {
      console.error(error);
      alert("Error en la solicitud.");
    }
  };

  return (
    <div>
      <div className="mb-4 d-flex gap-3">
        <button
          className={`btn ${view === "profile" ? "btn-dark" : "btn-outline-drk"}`}
          onClick={() => setView("profile")}
        >
          Mis datos
        </button>
        <button
          className={`btn ${view === "password" ? "btn-dark" : "btn-outline-dark"}`}
          onClick={() => setView("password")}
        >
          Cambiar contraseña
        </button>
      </div>

      {view === "profile" && (
        <div>
          <h4>Actualizar mis datos</h4>
          <input className="form-control my-2" placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
          <input className="form-control my-2" placeholder="Apellidos" value={apellidos} onChange={(e) => setApellidos(e.target.value)} />
          <input className="form-control my-2" placeholder="Usuario" value={username} onChange={(e) => setUsername(e.target.value)} />
          <input className="form-control my-2" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input type="date" className="form-control my-2" value={fechaNacimiento} onChange={(e) => setFechaNacimiento(e.target.value)} />
          <button className="btn btn-danger mt-2" onClick={handleSaveProfile}>Guardar cambios</button>
        </div>
      )}

      {view === "password" && (
        <div>
          <h4>Cambiar contraseña</h4>
          <input type="password" className="form-control my-2" placeholder="Contraseña actual" value={actualPassword} onChange={(e) => setActualPassword(e.target.value)} />
          <input type="password" className="form-control my-2" placeholder="Nueva contraseña" value={nuevaPassword} onChange={(e) => setNuevaPassword(e.target.value)} />
          <input type="password" className="form-control my-2" placeholder="Confirmar contraseña" value={confirmarPassword} onChange={(e) => setConfirmarPassword(e.target.value)} />
          <button className="btn btn-danger mt-2" onClick={handleChangePassword}>Guardar cambios</button>
        </div>
      )}
    </div>
  );
};

export default ConfiguracionComprador;
