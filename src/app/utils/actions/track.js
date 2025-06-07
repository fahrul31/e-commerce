export async function trackShipment(trackingNumber, courier) {
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