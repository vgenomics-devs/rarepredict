// links.ts
export interface NavLink {
    label: string;
    href: string;
}

export const mainLinks: NavLink[] = [
    { label: "Home", href: "https://vgenomics.in/" },
    { label: "Company", href: "https://vgenomics.in/company/" },
    { label: "Solutions", href: "https://vgenomics.in/solutions-for-labs/" },
    { label: "Our Science", href: "https://vgenomics.in/our-science/" },
    { label: "Patients", href: "https://vgenomics.in/patients/" },
    { label: "Careers", href: "https://vgenomics.in/careers/" },
    { label: "Contact Us", href: "https://vgenomics.in/company/#enquiry" },
];

export const bottomLinks: NavLink[] = [
    { label: "Privacy Policy", href: "https://vgenomics.in/privacy-policy/" },
    { label: "Terms of Use", href: "https://vgenomics.in/terms-of-use/" },
];


