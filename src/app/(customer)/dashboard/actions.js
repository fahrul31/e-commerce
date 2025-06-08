export async function fetchProducts(page = 1, limit = 5, search = "", category_id = "") {
    try {
        const query = new URLSearchParams({
            page,
            limit,
            ...(search ? { search } : {}),
            ...(category_id ? { category_id } : {}),
        });

        const res = await fetch(`/api/products?${query.toString()}`);
        const json = await res.json();
        if (!json.success) {
            return { success: false, message: json.message || "Failed to fetch products" };
        }
        return { success: true, data: json.data || [] };
    } catch (error) {
        return { success: false, message: error.message || "Failed to fetch products" };
    }
}


export async function fetchCategories() {
    try {
        const res = await fetch(`/api/categories`);
        const json = await res.json();
        if (!json.success) {
            return { success: false, message: json.message || "Failed to fetch categories" };
        }
        return { success: true, data: json.data || [] };
    } catch (error) {
        return { success: false, message: error.message || "Failed to fetch categories" };
    }
}
