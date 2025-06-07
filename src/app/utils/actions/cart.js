export async function addToCart(product_id, quantity = 1) {
    try {
        const res = await fetch("/api/cart", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ product_id, quantity }),
        });

        const data = await res.json();
        return {
            success: res.ok,
            status: res.status,
            message: data.message
        };
    } catch (err) {
        return { success: false, message: err.message };
    }
}
