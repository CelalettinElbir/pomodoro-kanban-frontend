import { useEffect, useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Pause, Play, RotateCcw, Timer, Trash2 } from 'lucide-react';

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

const POMODORO_DURATION = 25 * 60;
const SHORT_BREAK = 5 * 60;
const LONG_BREAK = 15 * 60;

function TaskCard({ task, index, onUpdateTask, onDeleteTask }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [titleDraft, setTitleDraft] = useState(task.title);
  const paletteClassName = TASK_CARD_PALETTE[getPaletteIndex(task.id)];

  const [timeLeft, setTimeLeft] = useState(POMODORO_DURATION);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState('work');

  useEffect(() => {
    if (!isRunning || !isDetailOpen) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          if (mode === 'work') {
            const newCompletedCount = (task.completed_pomodoros ?? 0) + 1;
            onUpdateTask(task.id, { completed_pomodoros: newCompletedCount });
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, isDetailOpen, mode, task.id, task.completed_pomodoros, onUpdateTask]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleReset = () => {
    setIsRunning(false);
    if (mode === 'work') {
      setTimeLeft(POMODORO_DURATION);
    } else if (mode === 'shortBreak') {
      setTimeLeft(SHORT_BREAK);
    } else {
      setTimeLeft(LONG_BREAK);
    }
  };

  const switchMode = (newMode) => {
    setIsRunning(false);
    setMode(newMode);
    if (newMode === 'work') {
      setTimeLeft(POMODORO_DURATION);
    } else if (newMode === 'shortBreak') {
      setTimeLeft(SHORT_BREAK);
    } else {
      setTimeLeft(LONG_BREAK);
    }
  };

  const progress = () => {
    const total =
      mode === 'work' ? POMODORO_DURATION : mode === 'shortBreak' ? SHORT_BREAK : LONG_BREAK;
    return ((total - timeLeft) / total) * 100;
  };

  const handleDetailClose = () => {
    setIsDetailOpen(false);
    setIsRunning(false);
    setTimeLeft(POMODORO_DURATION);
    setMode('work');
  };

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
        <>
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
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setIsDetailOpen(true);
                  }}
                  className="rounded-md p-1 text-blue-500 transition-colors hover:bg-blue-50 hover:text-blue-600"
                  aria-label="Detayları gör"
                  title="Detayları gör"
                >
                  <Timer size={15} />
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onDeleteTask(task.id, task.columnId);
                  }}
                  className="rounded-md p-1 text-red-500 transition-colors hover:bg-red-50 hover:text-red-600"
                  aria-label="Görevi sil"
                  title="Görevi sil"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          </article>

          {isDetailOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="w-full max-w-lg rounded-xl border border-gray-200 bg-white p-6 shadow-2xl">
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900">{task.title}</h3>
                    <p className="mt-2 text-sm text-gray-600">
                      🍅 Tamamlanan: {task.completed_pomodoros ?? 0} / Tahmini:{' '}
                      {task.estimated_pomodoros ?? 1}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleDetailClose}
                    className="rounded-md p-1 text-gray-500 hover:bg-gray-100"
                  >
                    ✕
                  </button>
                </div>

                {task.content ? (
                  <div className="mb-4">
                    <h4 className="mb-2 text-sm font-semibold text-gray-700">Detay</h4>
                    <p className="rounded-lg bg-gray-50 p-3 text-sm leading-relaxed text-gray-800">
                      {task.content}
                    </p>
                  </div>
                ) : null}

                <div className="mb-4 rounded-lg border border-gray-200 bg-gradient-to-br from-red-50 to-orange-50 p-4">
                  <h4 className="mb-3 text-center text-sm font-bold text-gray-700">POMODORO TIMER</h4>

                  <div className="mb-3 flex justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => switchMode('work')}
                      className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                        mode === 'work' ? 'bg-red-500 text-white' : 'bg-white text-gray-700'
                      }`}
                    >
                      Çalışma
                    </button>
                    <button
                      type="button"
                      onClick={() => switchMode('shortBreak')}
                      className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                        mode === 'shortBreak' ? 'bg-green-500 text-white' : 'bg-white text-gray-700'
                      }`}
                    >
                      Kısa Mola
                    </button>
                    <button
                      type="button"
                      onClick={() => switchMode('longBreak')}
                      className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                        mode === 'longBreak' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'
                      }`}
                    >
                      Uzun Mola
                    </button>
                  </div>

                  <div className="mb-3">
                    <div className="mb-2 h-2 w-full overflow-hidden rounded-full bg-white">
                      <div
                        className="h-full bg-red-500 transition-all duration-300"
                        style={{ width: `${progress()}%` }}
                      />
                    </div>
                    <div className="text-center text-5xl font-bold text-gray-900">
                      {formatTime(timeLeft)}
                    </div>
                  </div>

                  <div className="flex justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsRunning(!isRunning)}
                      className="flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                    >
                      {isRunning ? <Pause size={16} /> : <Play size={16} />}
                      <span>{isRunning ? 'Duraklat' : 'Başlat'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleReset}
                      className="rounded-lg border border-gray-300 bg-white p-2 text-gray-700 hover:bg-gray-50"
                      aria-label="Sıfırla"
                    >
                      <RotateCcw size={16} />
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleDetailClose}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                >
                  Kapat
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </Draggable>
  );
}

export default TaskCard;
