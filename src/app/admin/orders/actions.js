// app/orders/actions.js
export const fetchOrders = async (page = 1, limit = 10, search = "") => {
    try {
        const response = await fetch(`/api/orders?page=${page}&limit=${limit}&search=${search}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Failed to fetch orders:", error);
        return { success: false, message: "Gagal memuat pesanan" };
    }
};

// Fungsi untuk mengupdate status pesanan menjadi 'received' atau 'shipped' dengan nomor resi
export const updateOrderWithTracking = async (orderId, trackingNumber) => {
    try {
        const response = await fetch("/api/orders", {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ orderId, trackingNumber }),
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Failed to update order:", error);
        return { success: false, message: "Gagal memperbarui status pesanan" };
    }
};
