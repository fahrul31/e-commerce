// components/SortDropdown.jsx
export default function SortDropdown({ value, onChange }) {
    return (
        <select
            className="px-3 py-2 border rounded-md w-full"
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
        >
            <option value="">Urutkan / Filter</option>
            <option value="termurah">Harga Termurah</option>
            <option value="termahal">Harga Termahal</option>
            <option value="1">Unggulan</option>
            <option value="0">Reguler</option>
        </select>
    );
}
