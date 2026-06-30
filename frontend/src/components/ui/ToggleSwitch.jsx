export default function ToggleSwitch({ label, description, value, onChange }) {
    return (
        <div className="flex justify-between items-center">
            <div>
                <div className="text-[13.5px] font-semibold text-gray-800">{label}</div>
                {description && <div className="text-xs text-gray-500 mt-0.5">{description}</div>}
            </div>
            <button
                onClick={() => onChange(!value)}
                className={`w-11 h-6 rounded-full relative transition-colors duration-200 shrink-0 ${value ? "bg-blue-600" : "bg-gray-300"}`}
                aria-label={label}
            >
                <span className={`absolute top-[3px] w-[18px] h-[18px] bg-white rounded-full shadow transition-transform duration-200 ${value ? "translate-x-[22px]" : "translate-x-[3px]"}`} />
            </button>
        </div>
    );
}
