// src/front/store.js

export const initialStore = () => {
  // Verificar si ya existe un token en sessionStorage
  const token = sessionStorage.getItem("token");
  const user = sessionStorage.getItem("user")
    ? JSON.parse(sessionStorage.getItem("user"))
    : null;

  return {
    message: null,
    todos: [
      { id: 1, title: "Make the bed", background: null },
      { id: 2, title: "Do my homework", background: null },
    ],
    auth: {
      token: token,
      user: user,
      isAuthenticated: !!token,
      error: null,
      loading: false,
    },
    products: [],
    cart: {
      items: [],
      total: 0,
    },
  };
};

export default function storeReducer(store, action = {}) {
  switch (action.type) {
    // —————————————— CASOS DE AUTENTICACIÓN ——————————————

    case "auth_request": {
      return {
        ...store,
        auth: {
          ...store.auth,
          loading: true,
          error: null,
        },
      };
    }

    case "auth_success": {
      const { token, user } = action.payload;

      // Guardar en sessionStorage
      sessionStorage.setItem("token", token);
      sessionStorage.setItem("user", JSON.stringify(user));

      return {
        ...store,
        auth: {
          ...store.auth,
          token: token,
          user: user,
          isAuthenticated: true,
          loading: false,
          error: null,
        },
      };
    }

    case "auth_failure": {
      const { error } = action.payload;

      // Limpiar sessionStorage
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");

      return {
        ...store,
        auth: {
          ...store.auth,
          token: null,
          user: null,
          isAuthenticated: false,
          loading: false,
          error: error,
        },
      };
    }

    case "auth_logout": {
      // Borrar sessionStorage al hacer logout
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");

      return {
        ...store,
        auth: {
          token: null,
          user: null,
          isAuthenticated: false,
          loading: false,
          error: null,
        },
      };
    }

    // —————————————— CASOS DE CARRITO ——————————————

    case "add_to_cart": {
      const {
        id,
        title,
        price,
        discount = 0,
        image = "",
        quantity = 1,
      } = action.payload;

      const existingIndex = store.cart.items.findIndex(
        (item) => item.id === id
      );

      let updatedItems;
      if (existingIndex >= 0) {
        // Ya existe en el carrito: sumamos/restamos quantity
        updatedItems = store.cart.items
          .map((item, idx) => {
            if (idx !== existingIndex) return item;
            const newQty = item.quantity + quantity;
            return { ...item, quantity: newQty };
          })
          // Eliminamos aquellos que queden en 0 o menos
          .filter((item) => item.quantity > 0);
      } else {
        // No existía: solo lo añadimos si quantity > 0
        if (quantity <= 0) {
          return store;
        }
        updatedItems = [
          ...store.cart.items,
          { id, title, price, discount, image, quantity },
        ];
      }

      return {
        ...store,
        cart: {
          items: updatedItems,
          total: calculateTotal(updatedItems),
        },
      };
    }

    case "remove_from_cart": {
      const updatedItems = store.cart.items.filter(
        (item) => item.id !== action.payload
      );
      return {
        ...store,
        cart: {
          items: updatedItems,
          total: calculateTotal(updatedItems),
        },
      };
    }

    // —————————————— OTROS CASOS (productos, todos, mensajes, etc.) ——————————————

    // Aquí puedes agregar más cases como "set_products", "clear_cart", "set_message", etc.

    default:
      return store;
  }
}

// Función auxiliar para calcular el total del carrito
function calculateTotal(items) {
  return items.reduce((sum, item) => {
    const unitPrice = item.discount
      ? item.price * (1 - item.discount / 100)
      : item.price;
    return sum + unitPrice * item.quantity;
  }, 0);
}
