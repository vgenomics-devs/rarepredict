import React from "react";
import { NavLink } from "./links";

interface LinkListProps {
    links: NavLink[];
    className?: string;
    separator?: React.ReactNode;
}

const LinkList: React.FC<LinkListProps> = ({ links, className, separator }) => {
    return (
        <nav className={className}>
            {links.map((link, index) => (
                <React.Fragment key={link.label}>
                    <a href={link.href} >{link.label} </a>
                    {separator && index < links.length - 1 && <span>{separator}</span>}
                </React.Fragment>
            ))}
        </nav>
    );
};

export default LinkList;
