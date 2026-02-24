import { useState } from 'react';
import { Draggable, Droppable } from '@hello-pangea/dnd';
import { Check, Plus, Trash2, X } from 'lucide-react';
import TaskCard from './TaskCard';

const COLUMN_DROPPABLE_PREFIX = 'column-';

function Column({
  column,
  index,
  tasks,
  onAddTask,
  onUpdateColumn,
  onDeleteColumn,
  onUpdateTask,
  onDeleteTask,
}) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(column.title);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: '',
    content: '',
    estimated_pomodoros: 1,
    completed_pomodoros: 0,
  });

  const resetTaskForm = () => {
    setTaskForm({
      title: '',
      content: '',
      estimated_pomodoros: 1,
      completed_pomodoros: 0,
    });
  };

  const handleColumnTitleSubmit = (event) => {
    event.preventDefault();
    const trimmedTitle = titleDraft.trim();

    if (!trimmedTitle || trimmedTitle === column.title) {
      setIsEditingTitle(false);
      setTitleDraft(column.title);
      return;
    }

    onUpdateColumn(column.id, trimmedTitle);
    setIsEditingTitle(false);
  };

  const handleTaskModalSubmit = (event) => {
    event.preventDefault();
    const trimmedTitle = taskForm.title.trim();

    if (!trimmedTitle) return;

    onAddTask(column.id, {
      title: trimmedTitle,
      content: taskForm.content.trim(),
      estimated_pomodoros: Math.max(Number(taskForm.estimated_pomodoros) || 1, 1),
      completed_pomodoros: Math.max(Number(taskForm.completed_pomodoros) || 0, 0),
    });

    resetTaskForm();
    setIsTaskModalOpen(false);
  };

  return (
    <Draggable draggableId={`${COLUMN_DROPPABLE_PREFIX}${column.id}`} index={index}>
      {(draggableProvided) => (
        <>
          <section
            ref={draggableProvided.innerRef}
            {...draggableProvided.draggableProps}
            className="flex h-full min-h-0 flex-col rounded-xl border border-gray-200 bg-white shadow-sm"
          >
            <header
              {...draggableProvided.dragHandleProps}
              className="flex items-center justify-between gap-2 border-b border-gray-100 p-3"
            >
              {isEditingTitle ? (
                <form onSubmit={handleColumnTitleSubmit} className="flex-1">
                  <input
                    autoFocus
                    value={titleDraft}
                    onChange={(event) => setTitleDraft(event.target.value)}
                    onBlur={handleColumnTitleSubmit}
                    className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm font-semibold outline-none"
                  />
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditingTitle(true)}
                  className="truncate text-left text-lg font-extrabold uppercase tracking-wide text-gray-800"
                >
                  {column.title}
                </button>
              )}

              <div className="flex items-center gap-2">
                <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                  {tasks.length}
                </span>
                <button
                  type="button"
                  onClick={() => onDeleteColumn(column.id)}
                  className="rounded-md p-1 text-red-500 transition-colors hover:bg-red-50 hover:text-red-600"
                  aria-label="Kolonu sil"
                  title="Kolonu sil"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </header>

            <div className="flex justify-end px-3 pt-2">
              <button
                type="button"
                onClick={() => setIsTaskModalOpen(true)}
                className="inline-flex items-center justify-center rounded-md bg-gray-900 p-2 text-white"
                aria-label="Görev ekle"
                title="Görev ekle"
              >
                <Plus size={16} />
              </button>
            </div>

            <Droppable droppableId={`${COLUMN_DROPPABLE_PREFIX}${column.id}`} type="TASK">
              {(droppableProvided) => (
                <div
                  ref={droppableProvided.innerRef}
                  {...droppableProvided.droppableProps}
                  className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-3"
                >
                  {tasks.map((task, taskIndex) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      index={taskIndex}
                      onUpdateTask={onUpdateTask}
                      onDeleteTask={onDeleteTask}
                    />
                  ))}
                  {droppableProvided.placeholder}
                </div>
              )}
            </Droppable>
          </section>

          {isTaskModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
              <form
                onSubmit={handleTaskModalSubmit}
                className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-4 shadow-xl"
              >
                <div className="mb-3">
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Başlık</label>
                  <input
                    autoFocus
                    value={taskForm.title}
                    onChange={(event) =>
                      setTaskForm((prev) => ({ ...prev, title: event.target.value }))
                    }
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none"
                  />
                </div>

                <div className="mb-3">
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Detay</label>
                  <textarea
                    rows={3}
                    value={taskForm.content}
                    onChange={(event) =>
                      setTaskForm((prev) => ({ ...prev, content: event.target.value }))
                    }
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none"
                  />
                </div>

                <div className="mb-4 grid grid-cols-2 gap-2">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-700">Tahmini</label>
                    <input
                      type="number"
                      min={1}
                      value={taskForm.estimated_pomodoros}
                      onChange={(event) =>
                        setTaskForm((prev) => ({
                          ...prev,
                          estimated_pomodoros: event.target.value,
                        }))
                      }
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-700">Tamamlanan</label>
                    <input
                      type="number"
                      min={0}
                      value={taskForm.completed_pomodoros}
                      onChange={(event) =>
                        setTaskForm((prev) => ({
                          ...prev,
                          completed_pomodoros: event.target.value,
                        }))
                      }
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsTaskModalOpen(false);
                      resetTaskForm();
                    }}
                    className="rounded-md border border-gray-200 p-2 text-gray-600 hover:bg-gray-50"
                    aria-label="İptal"
                    title="İptal"
                  >
                    <X size={16} />
                  </button>
                  <button
                    type="submit"
                    className="rounded-md bg-gray-900 p-2 text-white"
                    aria-label="Kaydet"
                    title="Kaydet"
                  >
                    <Check size={16} />
                  </button>
                </div>
              </form>
            </div>
          )}
        </>
      )}
    </Draggable>
  );
}

export default Column;
