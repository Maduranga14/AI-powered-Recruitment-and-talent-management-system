export default function JobTag({ label, variant = "default" }) {
    return (
        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${variant === "salary" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-700"}`}>
            {label}
        </span>
    );
}
