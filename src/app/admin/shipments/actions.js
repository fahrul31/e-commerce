// Fungsi untuk mengambil daftar pengiriman yang sudah "shipped"
export const fetchShipments = async (page = 1, limit = 10) => {
    try {
        const response = await fetch(`/api/shipping?page=${page}&limit=${limit}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Failed to fetch shipping:", error);
        return { success: false, message: "Gagal memuat pengiriman" };
    }
};

// Fungsi untuk mengambil detail pesanan berdasarkan orderId
export const fetchOrderDetails = async (orderId) => {
    try {
        const response = await fetch(`/api/shipping/detail/${orderId}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Failed to fetch order details:", error);
        return { success: false, message: "Gagal memuat detail pesanan" };
    }
};

export const trackShipment = async (trackingNumber, courier) => {
    try {
        console.log(trackingNumber, courier);
        const response = await fetch("/api/shipping/track", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ trackingNumber, courier }),
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Failed to track shipment:", error);
        return { success: false, message: "Gagal melacak pengiriman" };
    }
};
