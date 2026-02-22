import React, { useState } from 'react';

const AddColumnCard = ({ onAdd }) => {
    const [isEditing, setIsEditing] = useState(false);
    
    // Tek bir obje üzerinden state yönetimi
    const [formData, setFormData] = useState({
        title: '',
        orderIndex: ''
    });

    // Dinamik input handler: name attribute'una göre eşleme yapar
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCancel = () => {
        setFormData({ title: '', orderIndex: '' });
        setIsEditing(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.title.trim()) {
            // Veriyi gönderirken sayıya çevirme işlemini yapıyoruz
            onAdd(formData.title, parseInt(formData.orderIndex) || 0);
            handleCancel();
        }
    };

    if (!isEditing) {
        return (
            <button
                onClick={() => setIsEditing(true)}
                className="w-72 shrink-0 bg-gray-200/50 hover:bg-gray-200 p-4 rounded-xl border-2 border-dashed border-gray-300 text-gray-600 font-medium transition-all flex items-center justify-center gap-2"
            >
                <span className="text-xl">+</span> Yeni Aşama Ekle
            </button>
        );
    }

    return (
        <div className="w-72 shrink-0 bg-gray-200 p-3 rounded-xl shadow-sm">
            <form onSubmit={handleSubmit}>
                <input
                    autoFocus
                    name="title" // State'deki key ile aynı olmalı
                    className="w-full p-2 rounded border border-blue-400 outline-none px-2 py-1 text-sm text-red-500"
                    placeholder="Aşama başlığı girin..."
                    value={formData.title}
                    onChange={handleChange}
                />

                <input 
                    type="number" 
                    name="orderIndex" // State'deki key ile aynı olmalı
                    className="w-full p-2 rounded border border-blue-400 outline-none text-sm mt-2 text-red-500" 
                    placeholder="Sıra numarası (isteğe bağlı)" 
                    value={formData.orderIndex}
                    onChange={handleChange}
                />

                <div className="flex gap-2 mt-2">
                    <button type="submit" className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm font-semibold hover:bg-blue-700">
                        Ekle
                    </button>
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="text-gray-500 hover:text-gray-700 text-sm"
                    >
                        Vazgeç
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddColumnCard;