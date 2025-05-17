// export const initialStore=()=>{
//   return{
//     message: null,
//     todos: [
//       {
//         id: 1,
//         title: "Make the bed",
//         background: null,
//       },
//       {
//         id: 2,
//         title: "Do my homework",
//         background: null,
//       }
//     ]
//   }
// }

// export default function storeReducer(store, action = {}) {
//   switch(action.type){
//     case 'set_hello':
//       return {
//         ...store,
//         message: action.payload
//       };

//     case 'add_task':

//       const { id,  color } = action.payload

//       return {
//         ...store,
//         todos: store.todos.map((todo) => (todo.id === id ? { ...todo, background: color } : todo))
//       };
//     default:
//       throw Error('Unknown action.');
//   }
// }

// src/front/store.js (actualización)

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
    // Añadir estado de autenticación
    auth: {
      token: token,
      user: user,
      isAuthenticated: !!token,
      error: null,
      loading: false,
    },
    // Estado para productos
    products: [],
    // Estado para carrito
    cart: {
      items: [],
      total: 0,
    },
  };
};

export default function storeReducer(store, action = {}) {
  switch (action.type) {
    case "set_hello":
      return {
        ...store,
        message: action.payload,
      };

    case "add_task":
      const { id, color } = action.payload;
      return {
        ...store,
        todos: store.todos.map((todo) =>
          todo.id === id ? { ...todo, background: color } : todo
        ),
      };

    // Acciones de autenticación
    case "auth_loading":
      return {
        ...store,
        auth: {
          ...store.auth,
          loading: true,
          error: null,
        },
      };

    case "auth_success":
      // Guardar token y datos del usuario en sessionStorage
      sessionStorage.setItem("token", action.payload.token);
      sessionStorage.setItem("user", JSON.stringify(action.payload.user));

      return {
        ...store,
        auth: {
          token: action.payload.token,
          user: action.payload.user,
          isAuthenticated: true,
          error: null,
          loading: false,
        },
      };

    case "auth_error":
      return {
        ...store,
        auth: {
          ...store.auth,
          error: action.payload,
          loading: false,
        },
      };

    case "auth_logout":
      // Limpiar sessionStorage
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");

      return {
        ...store,
        auth: {
          token: null,
          user: null,
          isAuthenticated: false,
          error: null,
          loading: false,
        },
      };

    // Acciones para productos
    case "set_products":
      return {
        ...store,
        products: action.payload,
      };

    // Acciones para carrito
    case "add_to_cart":
      const newItem = action.payload;
      const existingItemIndex = store.cart.items.findIndex(
        (item) => item.id === newItem.id
      );

      if (existingItemIndex >= 0) {
        // El producto ya está en el carrito, incrementar cantidad
        const updatedItems = store.cart.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );

        return {
          ...store,
          cart: {
            items: updatedItems,
            total: calculateTotal(updatedItems),
          },
        };
      } else {
        // Añadir nuevo producto al carrito
        const updatedItems = [...store.cart.items, { ...newItem, quantity: 1 }];

        return {
          ...store,
          cart: {
            items: updatedItems,
            total: calculateTotal(updatedItems),
          },
        };
      }

    case "remove_from_cart":
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

    default:
      return store;
  }
}

// Función auxiliar para calcular el total del carrito
function calculateTotal(items) {
  return items.reduce((total, item) => {
    const itemPrice = item.discount
      ? item.price * (1 - item.discount / 100)
      : item.price;

    return total + itemPrice * item.quantity;
  }, 0);
}
