import { Outlet } from "react-router-dom";
import ScrollToTop from "../components/ScrollToTop";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";


const Layout = () => {
    return (
        <ScrollToTop>
            <Navbar />
            <Outlet />
            <Footer />
        </ScrollToTop>
    );
};

export default Layout;
