// src/front/pages/Cart.jsx
import React from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";

const Cart = () => {
  const { store, dispatch } = useGlobalReducer();
  const { items, total } = store.cart;

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

  // Construye el texto que se va a enviar vía WhatsApp
  const handleContactSeller = () => {
    if (items.length === 0) return;

    // 1) Tomar el teléfono del vendedor del primer ítem
    const firstItem = items[0];
    const phone = firstItem.sellerPhone; // viene de product.seller.phone al agregar al carrito
    if (!phone) {
      alert("No hay teléfono de vendedor disponible.");
      return;
    }

    // 2) Generar una lista de "Producto x Cantidad"
    const itemsText = items
      .map(item => `${item.title} x${item.quantity}`)
      .join(", ");

    // 3) Construir el mensaje
    const message = `Hola, estoy interesado en estos productos: ${itemsText}. Subtotal: $${total.toFixed(
      2
    )}`;

    // 4) Montar la URL de WhatsApp: https://wa.me/<phone>?text=<mensaje codificado>
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

    // 5) Abrir WhatsApp en una nueva pestaña
    window.open(url, "_blank");
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
                  {/* Imagen con width=60px */}
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

          {/* Fila de Subtotal */}
          <li className="list-group-item d-flex justify-content-between">
            <strong>Subtotal</strong>
            <strong>${total.toFixed(2)}</strong>
          </li>

          {/* Botón “Contacta al vendedor” que abre WhatsApp */}
          <li className="list-group-item text-end">
            <button className="btn btn-success" onClick={handleContactSeller}>
              Contacta al vendedor
            </button>
          </li>
        </ul>
      )}
    </div>
  );
};

export default Cart;
