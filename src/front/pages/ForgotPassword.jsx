import React, { useState } from "react";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [debugUrl, setDebugUrl] = useState(""); // Solo para desarrollo

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email) {
            setError("Por favor ingresa tu correo electrónico");
            return;
        }

        setIsSubmitting(true);
        setError("");
        setMessage("");
        setDebugUrl("");

        try {
            const backendUrl = import.meta.env.VITE_BACKEND_URL;

            const response = await fetch(`${backendUrl}/api/request-password-reset`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(data.message);
                // Para desarrollo, mostrar el enlace de restablecimiento
                if (data.debug_url) {
                    setDebugUrl(data.debug_url);
                    console.log("Debug URL:", data.debug_url);
                }
            } else {
                setError(data.error || "Ocurrió un error al procesar tu solicitud");
            }
        } catch (error) {
            setError("No se pudo conectar con el servidor. Intenta nuevamente más tarde.");
            console.error("Error:", error);
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
                            <h2 className="text-center mb-4">Recuperar Contraseña</h2>

                            {message && (
                                <div className="alert alert-success">{message}</div>
                            )}

                            {error && (
                                <div className="alert alert-danger">{error}</div>
                            )}

                            {/* URL de Debug - Solo para desarrollo */}
                            {debugUrl && (
                                <div className="alert alert-info">
                                    {/* <p>Link para desarrollo (quitar en producción):</p> */}
                                    <a href={debugUrl} target="_blank" rel="noopener noreferrer">
                                        Restablecer contraseña
                                    </a>
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label htmlFor="email" className="form-label">Correo electrónico</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        id="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Ingresa tu correo electrónico"
                                        required
                                    />
                                    <div className="form-text">
                                        Te enviaremos un enlace para restablecer tu contraseña.
                                    </div>
                                </div>

                                <div className="d-grid">
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Enviando...
                                            </>
                                        ) : (
                                            "Enviar Enlace de Restablecimiento"
                                        )}
                                    </button>
                                </div>

                                <div className="mt-3 text-center">
                                    <p>
                                        <a href="/login" className="text-decoration-none">Volver al inicio de sesión</a>
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

export default ForgotPassword;