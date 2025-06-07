export async function getProfile() {
    try {
        const res = await fetch('/api/profile', { cache: 'no-store' });
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.message || 'Gagal memuat profil');
        return { success: true, data: json.data };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

export async function updateProfile(data) {
    try {
        const res = await fetch('/api/profile', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.message || 'Gagal memperbarui profil');
        return { success: true, data: json.data };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

export async function saveAddress(address) {
    try {
        const res = await fetch('/api/profile', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address })
        });
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.message || 'Gagal menyimpan alamat');
        return { success: true, data: json.data };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

export async function deleteAddress(addressId) {
    try {
        const res = await fetch(`/api/profile?addressId=${addressId}`, {
            method: 'DELETE'
        });
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.message || 'Gagal menghapus alamat');
        return { success: true };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

export async function changePassword(currentPassword, newPassword) {
    try {
        const res = await fetch('/api/profile', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ currentPassword, newPassword })
        });
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.message || 'Gagal mengubah password');
        return { success: true };
    } catch (error) {
        return { success: false, message: error.message };
    }
}
