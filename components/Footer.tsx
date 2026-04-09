import React from 'react';

const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="mt-auto bg-white border-t border-slate-200">
            <div className="container px-4 py-6 mx-auto">
                <p className="text-sm text-center text-slate-500">
                    &copy; {currentYear} MedDireto. Todos os direitos reservados.
                </p>
            </div>
        </footer>
    );
};

export default Footer;