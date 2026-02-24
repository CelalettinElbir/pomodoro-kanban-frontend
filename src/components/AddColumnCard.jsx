import { useState } from 'react';
import { Check, Plus, X } from 'lucide-react';

function AddColumnCard({ onAdd }) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmedTitle = title.trim();

    if (!trimmedTitle) return;

    onAdd(trimmedTitle);
    setTitle('');
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <button
        type="button"
        onClick={() => setIsEditing(true)}
        className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white p-2 text-gray-700 shadow-sm hover:bg-gray-50"
        aria-label="Kolon ekle"
        title="Kolon ekle"
      >
        <Plus size={18} />
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-sm rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
      <input
        autoFocus
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Kolon başlığı..."
        className="w-full rounded border border-gray-300 px-2 py-1 text-sm outline-none"
      />
      <div className="mt-2 flex gap-2">
        <button
          type="submit"
          className="rounded bg-gray-900 p-2 text-white"
          aria-label="Kaydet"
          title="Kaydet"
        >
          <Check size={16} />
        </button>
        <button
          type="button"
          onClick={() => {
            setIsEditing(false);
            setTitle('');
          }}
          className="rounded border border-gray-200 p-2 text-gray-600"
          aria-label="İptal"
          title="İptal"
        >
          <X size={16} />
        </button>
      </div>
    </form>
  );
}

export default AddColumnCard;
