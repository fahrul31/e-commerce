export default function SearchBar({ value, onChange }) {
    return (
        <input
            type="text"
            placeholder="Cari produk..."
            className="w-full md:w-60 px-3 py-2 border rounded-md"
            value={value}
            onChange={(e) => onChange(e.target.value)}
        />
    );
}
