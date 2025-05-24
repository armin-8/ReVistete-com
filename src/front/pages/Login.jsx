// src/front/pages/Login.jsx

import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

const Login = () => {
    const [credentials, setCredentials] = useState({
        email: "",
        password: ""
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { store, dispatch } = useGlobalReducer();
    const navigate = useNavigate();
    const location = useLocation();

    // Obtener parámetros de query (si los hay)
    const queryParams = new URLSearchParams(location.search);
    const redirectTo = queryParams.get("redirect") || "/";

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCredentials({ ...credentials, [name]: value });

        // Limpiar error específico
        if (errors[name]) {
            setErrors({ ...errors, [name]: "" });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validación básica
        const newErrors = {};
        if (!credentials.email) {
            newErrors.email = "El correo electrónico es obligatorio";
        }
        if (!credentials.password) {
            newErrors.password = "La contraseña es obligatoria";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsSubmitting(true);

        try {
            const backendUrl = import.meta.env.VITE_BACKEND_URL;

            const response = await fetch(`${backendUrl}/api/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(credentials)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Credenciales inválidas");
            }

            // Login exitoso
            dispatch({
                type: "auth_success",
                payload: {
                    token: data.token,
                    user: data.user
                }
            });

            // Redireccionar según el rol del usuario
            if (data.user.role === "seller") {
                navigate("/seller-dashboard");
            } else {
                navigate("/"); // o a otra página para compradores
            }

        } catch (error) {
            setErrors({
                general: error.message || "Error al iniciar sesión. Inténtalo de nuevo."
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container my-5 pt-5">
            <div className="row justify-content-center">
                <div className="col-md-6 col-lg-5">
                    <div className="card shadow">
                        <div className="card-body p-4">
                            <h2 className="text-center mb-4">Iniciar Sesión</h2>

                            {errors.general && (
                                <div className="alert alert-danger">{errors.general}</div>
                            )}

                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label htmlFor="email" className="form-label">Correo electrónico</label>
                                    <input
                                        type="email"
                                        className={`form-control ${errors.email ? "is-invalid" : ""}`}
                                        id="email"
                                        name="email"
                                        value={credentials.email}
                                        onChange={handleChange}
                                        required
                                    />
                                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="password" className="form-label">Contraseña</label>
                                    <input
                                        type="password"
                                        className={`form-control ${errors.password ? "is-invalid" : ""}`}
                                        id="password"
                                        name="password"
                                        value={credentials.password}
                                        onChange={handleChange}
                                        required
                                    />
                                    {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                                </div>

                                <div className="mb-3 form-check">
                                    <input type="checkbox" className="form-check-input" id="rememberMe" />
                                    <label className="form-check-label" htmlFor="rememberMe">Recordarme</label>
                                </div>

                                <div className="d-grid">
                                    <button
                                        type="submit"
                                        className="btn btn-dark btn-lg"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Iniciando sesión...
                                            </>
                                        ) : (
                                            "Iniciar sesión"
                                        )}
                                    </button>
                                </div>

                                <div className="mt-3 text-center">
                                    <p>
                                        ¿No tienes cuenta? Regístrate como{" "}
                                        <Link to="/seller-signup">vendedor</Link> o{" "}
                                        <Link to="/buyer-signup">comprador</Link>
                                    </p>
                                    <p className="mt-2">
                                        <Link to="/forgot-password" className="text-decoration-none">¿Olvidaste tu contraseña?</Link>
                                    </p>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;