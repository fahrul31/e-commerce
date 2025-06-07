export default function CategoryFilter({ categories = [], value, onChange }) {
    return (
        <select
            className="px-3 py-2 border rounded-md w-full"
            value={value}
            onChange={(e) => onChange(e.target.value)}
        >
            <option value="">Semua Kategori</option>
            {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                    {cat.name}
                </option>
            ))}
        </select>
    );
}