// src/front/pages/BuyerSettings.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { BackendURL } from "../components/BackendURL";

const BuyerSettings = () => {
  const navigate = useNavigate();
  const { store, dispatch } = useGlobalReducer();
  const { token } = store.auth;

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    birthdate: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // 1) Al cargar el componente, traer datos actuales del usuario
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchUserData = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${BackendURL}/api/user/me`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("No fue posible obtener los datos del usuario");
        }

        const data = await res.json();
        setFormData({
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          username: data.username || "",
          email: data.email || "",
          birthdate: data.birthdate ? data.birthdate.split("T")[0] : "",
        });
      } catch (err) {
        console.error(err);
        setMessage({
          type: "error",
          text: "Hubo un problema al cargar tus datos. Inténtalo de nuevo.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [token, navigate]);

  // 2) Manejar cambios en los inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // 3) Validación básica
  const validate = () => {
    const newErrors = {};
    if (!formData.first_name.trim()) newErrors.first_name = "Requerido";
    if (!formData.last_name.trim()) newErrors.last_name = "Requerido";
    if (!formData.username.trim()) newErrors.username = "Requerido";
    if (!formData.email.trim()) {
      newErrors.email = "Requerido";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email inválido";
    }
    if (!formData.birthdate.trim()) newErrors.birthdate = "Requerido";
    return newErrors;
  };

  // 4) Enviar PUT /api/user/me
  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${BackendURL}/api/user/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.msg || "Error actualizando datos");
      }

      const updatedUser = await res.json();

      // 5) Actualizar en estado global y sessionStorage
      dispatch({ type: "UPDATE_USER", payload: updatedUser });

      setMessage({
        type: "success",
        text: "Datos actualizados correctamente.",
      });
    } catch (err) {
      console.error(err);
      setMessage({
        type: "error",
        text: err.message || "Hubo un error al actualizar los datos.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card shadow-sm p-4">
      <h4 className="mb-4">Actualizar mis datos</h4>

      {message && (
        <div
          className={`alert ${
            message.type === "error" ? "alert-danger" : "alert-success"
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="row g-3">
          <div className="col-md-6">
            <label htmlFor="first_name" className="form-label">
              Nombre
            </label>
            <input
              type="text"
              id="first_name"
              name="first_name"
              className={`form-control ${
                errors.first_name ? "is-invalid" : ""
              }`}
              value={formData.first_name}
              onChange={handleChange}
              disabled={loading}
            />
            {errors.first_name && (
              <div className="invalid-feedback">{errors.first_name}</div>
            )}
          </div>

          <div className="col-md-6">
            <label htmlFor="last_name" className="form-label">
              Apellidos
            </label>
            <input
              type="text"
              id="last_name"
              name="last_name"
              className={`form-control ${
                errors.last_name ? "is-invalid" : ""
              }`}
              value={formData.last_name}
              onChange={handleChange}
              disabled={loading}
            />
            {errors.last_name && (
              <div className="invalid-feedback">{errors.last_name}</div>
            )}
          </div>

          <div className="col-md-6">
            <label htmlFor="username" className="form-label">
              Usuario
            </label>
            <input
              type="text"
              id="username"
              name="username"
              className={`form-control ${
                errors.username ? "is-invalid" : ""
              }`}
              value={formData.username}
              onChange={handleChange}
              disabled={loading}
            />
            {errors.username && (
              <div className="invalid-feedback">{errors.username}</div>
            )}
          </div>

          <div className="col-md-6">
            <label htmlFor="email" className="form-label">
              Correo
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className={`form-control ${errors.email ? "is-invalid" : ""}`}
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
            />
            {errors.email && (
              <div className="invalid-feedback">{errors.email}</div>
            )}
          </div>

          <div className="col-md-6">
            <label htmlFor="birthdate" className="form-label">
              Fecha de nacimiento
            </label>
            <input
              type="date"
              id="birthdate"
              name="birthdate"
              className={`form-control ${
                errors.birthdate ? "is-invalid" : ""
              }`}
              value={formData.birthdate}
              onChange={handleChange}
              disabled={loading}
            />
            {errors.birthdate && (
              <div className="invalid-feedback">{errors.birthdate}</div>
            )}
          </div>
        </div>

        <div className="mt-4">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BuyerSettings;
