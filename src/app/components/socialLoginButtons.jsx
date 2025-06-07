// src/components/SocialLoginButtons.jsx

import { ShoppingBag } from 'lucide-react';
import { signIn } from 'next-auth/react';

export default function SocialLoginButtons() {
    return (
        <div className="space-y-3">
            <button
                onClick={() => signIn('google')}
                className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-xl shadow-sm bg-white text-gray-700 hover:bg-gray-50 transition-colors">
                <div className="w-5 h-5 mr-3 bg-red-500 rounded flex items-center justify-center text-white text-xs font-bold">G</div>
                Lanjutkan dengan Google
            </button>
            <button className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-xl shadow-sm bg-white text-gray-700 hover:bg-gray-50 transition-colors">
                <div className="w-5 h-5 mr-3 bg-blue-600 rounded flex items-center justify-center">
                    <span className="text-white font-bold text-xs">f</span>
                </div>
                Lanjutkan dengan Facebook
            </button>
        </div>
    );
}
