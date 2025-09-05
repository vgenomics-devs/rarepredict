import React from "react";
import "./Footer.css"
import logo from "../assets/Vgen_Logo.png";
import LinkList from "@/components/linkLists";
import { mainLinks, bottomLinks } from "./links";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Left Section */}
        <div className="footer-left">
          <div style={{ marginBottom: "20px" }}>
            <img src={logo} alt="Vgenomics" height={26} width={160} />
          </div>
          <p className="footer-tagline">
            Accelerating Discoveries <br />
            for Genetic Diseases
          </p>
        </div>

        {/* Middle Section */}
        <div className="footer-middle">
          <LinkList links={mainLinks.slice(1, 6)} className='flex flex-col gap-4 footer-middle' />
        </div>

        {/* Right Section */}
        <div className="footer-right">
          <p>
            <a href="mailto:support@vgenomics.co.in">support@vgenomics.co.in</a>
          </p>
          <p>+91-120-408 1198</p>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="footer-bottom">
        <div className="footer-bottom-links">
          <LinkList links={bottomLinks} separator="|" />
        </div>
        <p style={{ margin: 0, color: "white" }}>
          Copyright © 2025 Vgenomics  |  All rights reserved
        </p>
      </div>
    </footer>
  );
};

export default Footer;
