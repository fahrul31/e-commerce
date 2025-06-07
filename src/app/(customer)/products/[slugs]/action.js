export async function fetchProductDetail(id) {
    try {
        const res = await fetch(`/api/products/${id}`);
        const json = await res.json();
        if (!json.success) {
            return { success: false, message: json.message || "Failed to fetch products" };
        }
        return { success: true, data: json.data || [] };
    } catch (error) {
        return { success: false, message: error.message || "Failed to fetch products" };
    }
}

export async function addToCart(product_id, quantity = 1) {
    try {
        const res = await fetch("/api/cart", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ product_id, quantity }),
        });

        const data = await res.json();
        return data;
    } catch (err) {
        return { success: false, message: err.message };
    }
}
