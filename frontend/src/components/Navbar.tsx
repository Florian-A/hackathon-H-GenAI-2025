import { Link, useLocation } from 'react-router-dom';
import veoliaLogo from '../assets/veolialogo.png';

function Navbar() {
    const location = useLocation();

    const isActive = (path: string) => {
        return location.pathname === path ? 'bg-[#EE2737] text-white' : 'text-[#EE2737] hover:bg-[#EE2737] hover:text-white';
    };

    return (
        <nav className="sticky top-0 z-50 bg-white shadow-lg border-b-2 border-[#EE2737]">
            <div className="max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    <div className="flex items-center">
                        {/* Logo */}
                        <div className="flex-shrink-0">
                            <img
                                src={veoliaLogo}
                                alt="Veolia Logo"
                                className="h-20 w-auto"
                            />
                        </div>

                        {/* Liens de navigation */}
                        <div className="hidden md:block ml-10">
                            <div className="flex space-x-4">
                                <Link
                                    to="/"
                                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${isActive('/')}`}
                                >
                                    Tables
                                </Link>
                                <Link
                                    to="/resultats"
                                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${isActive('/resultats')}`}
                                >
                                    Requêtes
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navbar; 