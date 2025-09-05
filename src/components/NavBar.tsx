import React, { useState } from "react";
// import "@/app/globals.css";
import "./NavBar.css"
import { FiMenu, FiX } from "react-icons/fi";
import logo from "../assets/Vgen_Logo.png";
import { mainLinks } from "./links";
import LinkList from "@/components/linkLists";

const Navbar: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => setIsOpen(!isOpen);

    return (
        <nav className="navbar">
            {/* Logo */}
            <div className="navbar-logo">
                <a href="https://vgenomics.in/"><img src={logo} alt="VGenomics Logo" /></a>
            </div>

            {/* Desktop Links */}
            <div className="navbar-links">
                <LinkList links={mainLinks} className="flex gap-10 navbar-links" />
            </div>

            {/* Hamburger Icon (Mobile) */}
            <div className="navbar-menu-icon" onClick={toggleMenu}>
                {isOpen ? <FiX size={28} /> : <FiMenu size={28} />}
            </div>

            {/* Sidebar (Mobile) */}
            <div className={`sidebar ${isOpen ? "open" : ""}`}>
                <LinkList
                    links={mainLinks}
                    className="flex flex-col gap-2 pl-2"
                    separator={<br />}
                />
            </div>
        </nav>
    );
};

export default Navbar;
