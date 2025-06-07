// actions/products.js
export async function fetchProducts(page = 1, limit = 10, search = "", category_id = "") {
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

export async function createProduct(formData) {
    try {
        const payload = new FormData();
        payload.append("name", formData.name);
        payload.append("description", formData.description);
        payload.append("price", formData.price);
        payload.append("category_id", formData.category_id);
        payload.append("featured", formData.featured ? 1 : 0);
        if (formData.image?.[0]) payload.append("image", formData.image[0]);

        const res = await fetch("/api/products", {
            method: "POST",
            body: payload,
        });

        const json = await res.json();
        if (!json.success) {
            return { success: false, message: json.message || "Failed to create product" };
        }
        return { success: true, data: json };
    } catch (error) {
        return { success: false, message: error.message || "Failed to create product" };
    }
}

export async function updateProduct(id, formData) {
    try {
        const payload = new FormData();
        payload.append("id", id);
        payload.append("name", formData.name);
        payload.append("description", formData.description || "");
        payload.append("price", formData.price);
        payload.append("category_id", formData.category_id || "");
        payload.append("featured", formData.featured ? "true" : "false");

        // Jika ada gambar baru di-upload
        if (formData.image?.[0]) {
            payload.append("image", formData.image[0]);
        } else if (formData.image_url) {
            // Jika tidak upload baru, kirim image_url lama agar tidak null
            payload.append("image_url", formData.image_url);
        }

        const res = await fetch(`/api/products/${id}`, {
            method: "PUT",
            body: payload,
        });

        const json = await res.json();

        if (!json.success) {
            return { success: false, message: json.message || "Gagal memperbarui produk" };
        }

        return { success: true, data: json };
    } catch (error) {
        return {
            success: false,
            message: error.message || "Terjadi kesalahan saat memperbarui produk",
        };
    }
}

export async function deleteProduct(id) {
    try {
        const res = await fetch(`/api/products/${id}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" }
        });

        const json = await res.json();
        if (!json.success) {
            return { success: false, message: json.message || "Failed to delete product" };
        }
        return { success: true, data: json };
    } catch (error) {
        return { success: false, message: error.message || "Failed to delete product" };
    }
}


