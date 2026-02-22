// App.jsx (Ana Yapı)
import React, { useState, useEffect } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import { fetchColumnsWithTasks, createColumn, moveTaskApi } from './api';
import Column from './components/Column';
import AddColumnCard from './components/AddColumnCard'; // Yeni bileşen

function App() {
  const [columns, setColumns] = useState([]);

  const loadData = async () => {
    const res = await fetchColumnsWithTasks();
    debugger;
    // Backend'den gelen veriyi order_index'e göre sıralayalım
    const sortedColumns = res.data.sort((a, b) => a.order_index - b.order_index);
    setColumns(sortedColumns);
    
  };

  useEffect(() => { loadData(); }, []);

  const onDragEnd = async (result) => { /* ... önceki sürükle bırak mantığı ... */ };

  return (
    <div className="flex flex-col h-screen bg-[#f3f4f6]">
      {/* Üst Bar */}
      <header className="px-6 py-4 bg-white border-b border-gray-200 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <span className="text-red-500">🍅</span> PomoKanban
        </h1>
      </header>

      {/* Ana Board Alanı */}
      <main className="flex-1 overflow-x-auto overflow-y-hidden p-6">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex items-start gap-6 h-full">
            {/* Mevcut Kolonlar */}
            {columns.map((col) => (
              <Column key={col.id} column={col} onRefresh={loadData} />
            ))}

            {/* Yeni Kolon Ekleme Kartı (En Sonda) */}
            <AddColumnCard 
              onAdd={(title) => {
                createColumn(title, columns.length).then(loadData);
              }} 
            />
          </div>
        </DragDropContext>
      </main>
    </div>
  );
}

export default App;