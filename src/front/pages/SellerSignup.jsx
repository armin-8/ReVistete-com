// src/front/pages/SellerSignup.jsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const SellerSignup = () => {
    const [formData, setFormData] = useState({
        email: "",
        firstName: "",
        lastName: "",
        username: "",
        password: "",
        confirmPassword: "",
        phone: ""   // <-- Agregado campo phone
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const { dispatch } = useGlobalReducer();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        if (errors[name]) {
            setErrors({ ...errors, [name]: "" });
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Validar email
        if (!formData.email) {
            newErrors.email = "El correo electrónico es obligatorio";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Formato de correo electrónico inválido";
        }

        // Validar nombres
        if (!formData.firstName.trim()) {
            newErrors.firstName = "El nombre es obligatorio";
        }
        if (!formData.lastName.trim()) {
            newErrors.lastName = "Los apellidos son obligatorios";
        }

        // Validar username
        if (!formData.username.trim()) {
            newErrors.username = "El nombre de usuario es obligatorio";
        } else if (formData.username.length < 4) {
            newErrors.username = "El nombre de usuario debe tener al menos 4 caracteres";
        }

        // Validar contraseña
        if (!formData.password) {
            newErrors.password = "La contraseña es obligatoria";
        } else if (formData.password.length < 6) {
            newErrors.password = "La contraseña debe tener al menos 6 caracteres";
        }

        // Validar confirmación de contraseña
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Las contraseñas no coinciden";
        }

        // Validar teléfono (código país + dígitos, mínimo 8 caracteres)
        if (!formData.phone.trim()) {
            newErrors.phone = "El número de teléfono es obligatorio";
        } else if (!/^\d{8,15}$/.test(formData.phone.replace(/\D/g, ""))) {
            newErrors.phone = "Formato de teléfono inválido (solo dígitos, 8–15 caracteres)";
        }

        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formErrors = validateForm();
        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            return;
        }

        setIsSubmitting(true);

        try {
            const backendUrl = import.meta.env.VITE_BACKEND_URL;

            const response = await fetch(`${backendUrl}/api/register/seller`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: formData.email,
                    first_name: formData.firstName,
                    last_name: formData.lastName,
                    username: formData.username,
                    password: formData.password,
                    phone: formData.phone,   // <-- Enviamos el teléfono ingresado
                    role: "seller"
                }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || "Error en el registro");
            }

            dispatch({
                type: "auth_success",
                payload: {
                    token: data.token,
                    user: data.user
                }
            });

            navigate("/seller-dashboard");
        } catch (error) {
            setErrors({
                general: error.message || "Ocurrió un error durante el registro"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container my-5 pt-5">
            <div className="row justify-content-center">
                <div className="col-md-8 col-lg-6">
                    <div className="card shadow">
                        <div className="card-body p-4">
                            <h2 className="text-center mb-4">Registro de Vendedor</h2>

                            {errors.general && (
                                <div className="alert alert-danger">{errors.general}</div>
                            )}

                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label htmlFor="email" className="form-label">
                                        Correo electrónico
                                    </label>
                                    <input
                                        type="email"
                                        className={`form-control ${errors.email ? "is-invalid" : ""}`}
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                                </div>

                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="firstName" className="form-label">
                                            Nombre
                                        </label>
                                        <input
                                            type="text"
                                            className={`form-control ${errors.firstName ? "is-invalid" : ""}`}
                                            id="firstName"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            required
                                        />
                                        {errors.firstName && (
                                            <div className="invalid-feedback">{errors.firstName}</div>
                                        )}
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="lastName" className="form-label">
                                            Apellidos
                                        </label>
                                        <input
                                            type="text"
                                            className={`form-control ${errors.lastName ? "is-invalid" : ""}`}
                                            id="lastName"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            required
                                        />
                                        {errors.lastName && (
                                            <div className="invalid-feedback">{errors.lastName}</div>
                                        )}
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="username" className="form-label">
                                        Nombre de usuario
                                    </label>
                                    <input
                                        type="text"
                                        className={`form-control ${errors.username ? "is-invalid" : ""}`}
                                        id="username"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        required
                                    />
                                    {errors.username && (
                                        <div className="invalid-feedback">{errors.username}</div>
                                    )}
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="phone" className="form-label">
                                        Teléfono (solo dígitos)
                                    </label>
                                    <input
                                        type="text"
                                        className={`form-control ${errors.phone ? "is-invalid" : ""}`}
                                        id="phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        required
                                    />
                                    {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="password" className="form-label">
                                        Contraseña
                                    </label>
                                    <input
                                        type="password"
                                        className={`form-control ${errors.password ? "is-invalid" : ""}`}
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                    />
                                    {errors.password && (
                                        <div className="invalid-feedback">{errors.password}</div>
                                    )}
                                </div>

                                <div className="mb-4">
                                    <label htmlFor="confirmPassword" className="form-label">
                                        Confirmar contraseña
                                    </label>
                                    <input
                                        type="password"
                                        className={`form-control ${errors.confirmPassword ? "is-invalid" : ""}`}
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        required
                                    />
                                    {errors.confirmPassword && (
                                        <div className="invalid-feedback">{errors.confirmPassword}</div>
                                    )}
                                </div>

                                <div className="d-grid">
                                    <button
                                        type="submit"
                                        className="btn btn-primary btn-lg"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <span
                                                    className="spinner-border spinner-border-sm me-2"
                                                    role="status"
                                                    aria-hidden="true"
                                                ></span>
                                                Procesando...
                                            </>
                                        ) : (
                                            "Crear cuenta ReVistete"
                                        )}
                                    </button>
                                </div>

                                <div className="mt-3 text-center">
                                    <p>
                                        ¿Ya tienes una cuenta? <a href="/login">Iniciar sesión</a>
                                    </p>
                                </div>
                            </form>
                        </div>
                    </div>

                    <div className="card mt-4 shadow-sm">
                        <div className="card-body">
                            <h5 className="card-title">Beneficios de ser vendedor</h5>
                            <ul className="list-unstyled">
                                <li className="mb-2">
                                    <i className="fas fa-check text-success me-2"></i>Gana dinero por la ropa que ya no usas
                                </li>
                                <li className="mb-2">
                                    <i className="fas fa-check text-success me-2"></i>Contribuye a la moda sostenible
                                </li>
                                <li className="mb-2">
                                    <i className="fas fa-check text-success me-2"></i>Da una segunda vida a prendas casi nuevas
                                </li>
                                <li>
                                    <i className="fas fa-check text-success me-2"></i>Gestiona tu propio catálogo de forma sencilla
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SellerSignup;
