export default function PageHeader( { title, subtitle}) {
  return (
    <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
    </div>
  );
}
