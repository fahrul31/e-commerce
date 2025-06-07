export default function CartItem() {
    return (
        <div className="flex items-center justify-between border p-4 rounded-md">
            <div className="flex items-center gap-4">
                <img src="/produk.jpg" alt="Produk" className="w-16 h-16 object-cover rounded" />
                <div>
                    <p className="font-semibold">Nama Produk</p>
                    <p className="text-sm text-gray-500">Qty: 1</p>
                </div>
            </div>
            <div className="text-right">
                <p className="font-bold text-sm">Rp 150.000</p>
                <button className="text-xs text-red-500 hover:underline mt-1">Hapus</button>
            </div>
        </div>
    );
}
