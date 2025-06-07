import Link from "next/link";
import { useState } from "react";
import { ShoppingCart, User, Menu } from "lucide-react";
export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <header className="bg-white shadow-lg sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-xl">E</span>
                        </div>
                        <span className="text-2xl font-bold text-gray-800">E-Shop</span>
                    </div>


                    {/* Right Side Actions */}
                    <div className="flex items-center gap-4">
                        {/* Cart Icon */}
                        <Link href="/cart" className="font-bold text-lg">
                            <button
                                className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            >
                                <ShoppingCart size={20} />
                            </button>
                        </Link>
                        {/* Profile Icon */}
                        <Link href="/profile" className="font-bold text-lg">

                            <button
                                className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            >
                                <User size={20} />
                            </button>
                        </Link>
                        {/* Mobile Menu Button */}
                        <button
                            className="md:hidden p-2 text-gray-600 hover:text-blue-600"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            <Menu size={20} />
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {isMenuOpen && (
                    <nav className="md:hidden mt-4 pt-4 border-t border-gray-200">
                        <div className="flex flex-col gap-3">
                            <a href="/" className="text-gray-700 hover:text-blue-600 font-medium py-2">
                                Beranda
                            </a>
                            <a href="/products" className="text-gray-700 hover:text-blue-600 font-medium py-2">
                                Produk
                            </a>

                        </div>
                    </nav>
                )}
            </div>
        </header>
    );
}