import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
//import { Card, CardImg, CardBody, CardTitle, Button } from 'reactstrap'; // No estamos usando reactstrap directamente, así que lo quitamos
import './Categories.css'; // Asegúrate de crear un archivo Categories.css para los estilos

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(process.env.BACKEND_URL + "/categories");
        setCategories(res.data);
      } catch (error) {
        setError("Error al cargar las categorías.");
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return <p>Cargando categorías...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div className="container mt-5">
      <h2 className="mb-4 text-center">Categorías</h2>
      <div className="row justify-content-center">
        {categories.map((category) => (
          <div key={category.id} className="col-6 col-md-4 col-lg-3 mb-4">
            <div className="category-card shadow-sm">
              <img
                src={category.image}
                alt={category.name}
                className="category-image"
              />
              <div className="category-body">
                <h3 className="category-title h6 text-center">{category.name}</h3>
                {/* Aquí está el cambio importante:
                    En lugar de usar el nombre de la categoría directamente en la URL,
                    usamos una ruta específica para "vestidos de mujer de segunda mano".
                    Asumo que tienes una ruta definida para esto en tu aplicación.
                    Si la ruta es diferente, ajústala en consecuencia.
                */}
                <Link to={category.name.toLowerCase() === 'vestidos' ? "/vestidos-de-mujer-de-segunda-mano" : `/products/${category.name.toLowerCase()}`} className="category-link">
                  Ver productos
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Categories;