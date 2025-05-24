// src/front/pages/BuyerSignup.jsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

const BuyerSignup = () => {
    const [formData, setFormData] = useState({
        email: "",
        first_name: "",
        last_name: "",
        username: "",
        password: "",
        confirm_password: "",
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const { dispatch } = useGlobalReducer();

    const handleChange = ({ target: { name, value } }) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.email.trim()) {
            newErrors.email = "El correo electrónico es obligatorio";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Formato de correo electrónico inválido";
        }

        if (!formData.first_name.trim()) newErrors.first_name = "El nombre es obligatorio";
        if (!formData.last_name.trim()) newErrors.last_name = "Los apellidos son obligatorios";
        if (!formData.username.trim()) {
            newErrors.username = "El nombre de usuario es obligatorio";
        } else if (formData.username.length < 4) {
            newErrors.username = "Debe tener al menos 4 caracteres";
        }

        if (!formData.password) {
            newErrors.password = "La contraseña es obligatoria";
        } else if (formData.password.length < 6) {
            newErrors.password = "Debe tener al menos 6 caracteres";
        }

        if (formData.password !== formData.confirm_password) {
            newErrors.confirm_password = "Las contraseñas no coinciden";
        }

        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setIsSubmitting(true);

        try {
            const backendUrl = import.meta.env.VITE_BACKEND_URL;

            const payload = {
                email: formData.email,
                first_name: formData.first_name,
                last_name: formData.last_name,
                username: formData.username,
                password: formData.password,
                role: "buyer"
            };

            console.log("ENVIANDO A BACKEND:", payload); // Debug

            const response = await fetch(`${backendUrl}/api/register/buyer`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Error en el registro");
            }

            dispatch({
                type: "auth_success",
                payload: {
                    token: data.token,
                    user: data.user
                }
            });

            navigate("/comprador/panel");
        } catch (error) {
            console.error("Error en registro:", error);
            setErrors({ general: error.message });
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
                            <h2 className="text-center mb-4">Registro de Comprador</h2>

                            {errors.general && (
                                <div className="alert alert-danger">{errors.general}</div>
                            )}

                            <form onSubmit={handleSubmit}>
                                {[
                                    { label: "Correo electrónico", name: "email", type: "email" },
                                    { label: "Nombre", name: "first_name", type: "text" },
                                    { label: "Apellidos", name: "last_name", type: "text" },
                                    { label: "Nombre de usuario", name: "username", type: "text" },
                                    { label: "Contraseña", name: "password", type: "password" },
                                    { label: "Confirmar contraseña", name: "confirm_password", type: "password" }
                                ].map(({ label, name, type }) => (
                                    <div key={name} className="mb-3">
                                        <label htmlFor={name} className="form-label">{label}</label>
                                        <input
                                            type={type}
                                            className={`form-control ${errors[name] ? "is-invalid" : ""}`}
                                            id={name}
                                            name={name}
                                            value={formData[name]}
                                            onChange={handleChange}
                                        />
                                        {errors[name] && (
                                            <div className="invalid-feedback">{errors[name]}</div>
                                        )}
                                    </div>
                                ))}


                                <div className="d-grid">
                                    <button
                                        type="submit"
                                        className="btn btn-primary btn-lg"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
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
                            <h5 className="card-title">Beneficios de comprar en ReVistete</h5>
                            <ul className="list-unstyled">
                                <li><i className="fas fa-check text-success me-2"></i> Prendas de marca a precios accesibles</li>
                                <li><i className="fas fa-check text-success me-2"></i> Economía circular y sostenible</li>
                                <li><i className="fas fa-check text-success me-2"></i> Prendas únicas y exclusivas</li>
                                <li><i className="fas fa-check text-success me-2"></i> Garantía de calidad</li>
                            </ul>
                        </div>
                    </div>

                </div >
            </div >
        </div >
    );
};

export default BuyerSignup;
