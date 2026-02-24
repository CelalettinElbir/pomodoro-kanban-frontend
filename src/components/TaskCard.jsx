import { useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Trash2 } from 'lucide-react';

const TASK_DRAGGABLE_PREFIX = 'task-';
const TASK_CARD_PALETTE = [
  'bg-sky-100 border-sky-200',
  'bg-emerald-100 border-emerald-200',
  'bg-violet-100 border-violet-200',
];

const getPaletteIndex = (taskId) => {
  const parsed = Number(taskId);
  if (!Number.isNaN(parsed)) {
    return Math.abs(parsed) % TASK_CARD_PALETTE.length;
  }

  return String(taskId)
    .split('')
    .reduce((accumulator, character) => accumulator + character.charCodeAt(0), 0) % TASK_CARD_PALETTE.length;
};

function TaskCard({ task, index, onUpdateTask, onDeleteTask }) {
  const [isEditing, setIsEditing] = useState(false);
  const [titleDraft, setTitleDraft] = useState(task.title);
  const paletteClassName = TASK_CARD_PALETTE[getPaletteIndex(task.id)];

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmedTitle = titleDraft.trim();

    if (!trimmedTitle || trimmedTitle === task.title) {
      setIsEditing(false);
      setTitleDraft(task.title);
      return;
    }

    onUpdateTask(task.id, { title: trimmedTitle });
    setIsEditing(false);
  };

  return (
    <Draggable draggableId={`${TASK_DRAGGABLE_PREFIX}${task.id}`} index={index}>
      {(provided) => (
        <article
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`rounded-md border p-3 shadow-md transition-transform duration-200 ease-out hover:scale-[1.02] hover:shadow-lg ${paletteClassName}`}
        >
          {isEditing ? (
            <form onSubmit={handleSubmit}>
              <input
                autoFocus
                value={titleDraft}
                onChange={(event) => setTitleDraft(event.target.value)}
                onBlur={handleSubmit}
                className="w-full rounded border border-gray-300 px-2 py-1 text-base leading-relaxed outline-none"
              />
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="w-full text-left text-base font-semibold leading-relaxed text-gray-900"
            >
              {task.title}
            </button>
          )}

          {task.content ? (
            <p className="mt-2 text-sm leading-relaxed text-gray-700">{task.content}</p>
          ) : null}

          <div className="mt-3 flex items-center justify-between text-sm text-gray-700">
            <span>
              🍅 {task.completed_pomodoros ?? 0}/{task.estimated_pomodoros ?? 1}
            </span>
            <button
              type="button"
              onClick={() => onDeleteTask(task.id, task.columnId)}
              className="rounded-md p-1 text-red-500 transition-colors hover:bg-red-50 hover:text-red-600"
              aria-label="Görevi sil"
              title="Görevi sil"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </article>
      )}
    </Draggable>
  );
}

export default TaskCard;
