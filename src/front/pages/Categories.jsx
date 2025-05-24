import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

// ✨ Convierte “Vestidos de Fiesta” → “vestidos-de-fiesta”
const toSlug = (str) =>
  str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const backend = import.meta.env.VITE_BACKEND_URL;
        const { data } = await axios.get(`${backend}/api/categories`);
        setCategories(data);
      } catch (e) {
        console.error(e);
        setError("Error al cargar las categorías");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <p>Cargando categorías…</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="container mt-5">
      <h2 className="mb-4 text-center">Categorías</h2>

      <div className="row g-4 justify-content-center">
        {categories.map((cat) => {
          const slug = toSlug(cat.name);
          return (
            <div key={cat.id} className="col-6 col-md-4 col-lg-3">
              <div className="category-card shadow-sm">
                <img src={cat.image} alt={cat.name} className="category-image" />
                <div className="category-body">
                  <h3 className="category-title h6 text-center">{cat.name}</h3>

                  {/* Enlaza con la nueva ruta dinámica /category/:slug */}
                  <Link className="category-link" to={`/category/${slug}`}>
                    Ver productos
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Categories;
