export async function getCartItems() {
    try {
        const res = await fetch("/api/cart", {
            method: "GET",
            cache: "no-store"
        });
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.message || "Gagal memuat keranjang");
        return { success: true, data: json.data };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

export async function updateCartQuantity(product_id, quantity) {
    try {
        const res = await fetch("/api/cart", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ product_id, quantity })
        });
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.message || "Gagal mengubah jumlah");
        return { success: true };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

export async function removeCartItem(product_id) {
    try {
        const res = await fetch("/api/cart", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ product_id })
        });
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.message || "Gagal menghapus item");
        return { success: true };
    } catch (error) {
        return { success: false, message: error.message };
    }
}
