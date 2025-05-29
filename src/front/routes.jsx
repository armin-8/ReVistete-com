// Import necessary components and functions from react-router-dom.

import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import Home from "/src/front/pages/Home.jsx";
import Demo from "/src/front/pages/Demo.jsx";
import Single from "/src/front/pages/Single.jsx";
import Layout from "/src/front/pages/Layout.jsx";
import SellerSignup from "./pages/SellerSignup";
import SellerDashboard from "./pages/SellerDashboard";
import Login from "./pages/Login";
import BuyerSignup from "./pages/BuyerSignup";
import BuyerDashboard from "./pages/BuyerDashboard";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ProductCatalog from "./pages/ProductCatalog";
import ProductDetail from "./pages/ProductDetail";


export const router = createBrowserRouter(
  createRoutesFromElements(
    // CreateRoutesFromElements function allows you to build route elements declaratively.
    // Create your routes here, if you want to keep the Navbar and Footer in all views, add your new routes inside the containing Route.
    // Root, on the contrary, create a sister Route, if you have doubts, try it!
    // Note: keep in mind that errorElement will be the default page when you don't get a route, customize that page to make your project more attractive.
    // Note: The child paths of the Layout element replace the Outlet component with the elements contained in the "element" attribute of these child paths.

    // Root Route: All navigation will start from here.
    <Route path="/" element={<Layout />} errorElement={<h1>Not found!</h1>} >

      {/* Nested Routes: Defines sub-routes within the BaseHome component. */}
      <Route path="/" element={<Home />} />
      <Route path="/single/:theId" element={<Single />} />  {/* Dynamic route for single items */}
      <Route path="/demo" element={<Demo />} />
      <Route path="/seller-signup" element={<SellerSignup />} /> {/* Nueva ruta */}
      <Route path="/seller-dashboard" element={<SellerDashboard />} />
      <Route path="/login" element={<Login />} />
      <Route path="/buyer-signup" element={<BuyerSignup />} />
      <Route path="/registro-comprador" element={<BuyerSignup />} />
      <Route path="/comprador/panel" element={<BuyerDashboard />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/carrito" element={<Cart />} />

      {/* Rutas del catálogo de productos */}
      <Route path="/catalog" element={<ProductCatalog />} />
      <Route path="/mujer" element={<ProductCatalog />} />
      <Route path="/mujer/:category" element={<ProductCatalog />} />
      <Route path="/hombre" element={<ProductCatalog />} />
      <Route path="/hombre/:category" element={<ProductCatalog />} />
      <Route path="/category/:category" element={<ProductCatalog />} />

      {/* Ruta de detalle del producto */}
      <Route path="/product/:id" element={<ProductDetail />} />

    </Route>
  )
);