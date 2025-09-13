export default function Header({ title, description }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
      {description && (
        <p className="text-gray-600 mt-2">{description}</p>
      )}
    </div>
  );
}