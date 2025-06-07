/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
        return [
            // { source: '/cart', destination: '/customer/cart' },
            // { source: '/home', destination: '/customer/index' },
            // { source: '/profile', destination: '/customer/profile' },
            // { source: '/checkout', destination: '/customer/checkout' },
            // { source: '/products', destination: '/customer/products' },
            // { source: '/product-detail/:id', destination: '/customer/products/:id' },
        ];
    },
};


export default nextConfig;
