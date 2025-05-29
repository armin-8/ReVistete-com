import useGlobalReducer from "../hooks/useGlobalReducer";

// dentro del .map(product => (…) ) …
const { dispatch } = useGlobalReducer();

<button
  className="btn btn-sm btn-outline-primary"
  onClick={() =>
    dispatch({
      type: "add_to_cart",
      payload: {
        id: product.id,
        title: product.title,
        price: product.price,
        discount: product.discount,
        // añade aquí las propiedades necesarias (imagen, talla, etc)
      }
    })
  }
>
  Añadir al carrito
</button>
