// src/front/pages/Cart.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

const Cart = () => {
  const { store, dispatch } = useGlobalReducer();
  const { items, total } = store.cart;
  const navigate = useNavigate();

  const removeItem = id =>
    dispatch({ type: "remove_from_cart", payload: id });

  const changeQty = (id, delta) => {
    // reaprovechamos “add_to_cart” para +1 ó -1
    const item = items.find(i => i.id === id);
    if (!item) return;
    dispatch({
      type: "add_to_cart",
      payload: {
        ...item,
        // si delta es negativo y qty=1 → lo ignoramos
        quantity: delta > 0 ? delta : -1
      }
    });
  };

  return (
    <div className="container my-5 pt-5">
      <h2>Mi carrito</h2>
      {items.length === 0 ? (
        <p>El carrito está vacío.</p>
      ) : (
        <ul className="list-group">
          {items.map(item => {
            const unitPrice = item.discount
              ? item.price * (1 - item.discount / 100)
              : item.price;

            return (
              <li
                key={item.id}
                className="list-group-item d-flex justify-content-between align-items-center"
              >
                <div className="d-flex align-items-center">
                  {/* Esta es la imagen con width=60px */}
                  <img
                    src={item.image}
                    alt={item.title}
                    style={{ width: "60px" }}
                    className="me-3"
                  />
                  <div>
                    <strong>{item.title}</strong>
                    <div>
                      ${unitPrice.toFixed(2)} × {item.quantity}
                    </div>
                  </div>
                </div>
                <div className="d-flex align-items-center">
                  <button
                    className="btn btn-sm btn-outline-secondary me-2"
                    onClick={() => changeQty(item.id, -1)}
                    disabled={item.quantity <= 1}
                  >
                    –
                  </button>
                  <button
                    className="btn btn-sm btn-outline-secondary me-2"
                    onClick={() => changeQty(item.id, +1)}
                  >
                    +
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => removeItem(item.id)}
                  >
                    🗑️
                  </button>
                </div>
              </li>
            );
          })}

          <li className="list-group-item d-flex justify-content-between">
            <strong>Subtotal</strong>
            <strong>${total.toFixed(2)}</strong>
          </li>

          <li className="list-group-item text-end">
            <button
              className="btn btn-primary"
              onClick={() => navigate("/checkout")}
            >
              Continuar con la compra
            </button>
          </li>
        </ul>
      )}
    </div>
  );
};

export default Cart;
