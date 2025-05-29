// src/front/pages/Cart.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

const Cart = () => {
  const { store, dispatch } = useGlobalReducer();
  const navigate = useNavigate();
  const { items, total } = store.cart;

  const handleRemove = id =>
    dispatch({ type: "remove_from_cart", payload: id });

  const handleQuantity = (id, delta) => {
    const item = items.find(i => i.id === id);
    if (!item) return;
    // reenviamos un add o un remove parcial, o podrías crear acción específica
    dispatch({
      type: "add_to_cart",
      payload: { ...item, quantity: delta > 0 ? delta : -1 }
    });
  };

  return (
    <div className="container my-5 pt-5">
      <h2>Mi carrito</h2>
      {items.length === 0 ? (
        <p>Tu carrito está vacío.</p>
      ) : (
        <div className="list-group">
          {items.map(item => (
            <div
              key={item.id}
              className="list-group-item d-flex justify-content-between align-items-center"
            >
              <div>
                <h6>{item.title}</h6>
                <small>
                  Precio:{" "}
                  {item.discount
                    ? (item.price * (1 - item.discount / 100)).toFixed(2)
                    : item.price.toFixed(2)}{" "}
                  x {item.quantity}
                </small>
              </div>
              <div className="d-flex align-items-center">
                <button
                  className="btn btn-sm btn-outline-secondary me-2"
                  onClick={() => handleQuantity(item.id, -1)}
                  disabled={item.quantity <= 1}
                >
                  –
                </button>
                <button
                  className="btn btn-sm btn-outline-secondary me-2"
                  onClick={() => handleQuantity(item.id, +1)}
                >
                  +
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleRemove(item.id)}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}

          <div className="list-group-item d-flex justify-content-between">
            <strong>Subtotal</strong>
            <strong>{total.toFixed(2)}</strong>
          </div>

          <div className="list-group-item text-end">
            <button
              className="btn btn-primary"
              onClick={() => navigate("/checkout")}
            >
              Continuar con la compra
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
