import { useEffect, useState } from 'react';
import { Pause, Play, RotateCcw, X } from 'lucide-react';

const POMODORO_DURATION = 25 * 60; // 25 dakika
const SHORT_BREAK = 5 * 60; // 5 dakika
const LONG_BREAK = 15 * 60; // 15 dakika

function PomodoroTimer({ task, onComplete, onClose }) {
  const [timeLeft, setTimeLeft] = useState(POMODORO_DURATION);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState('work'); // 'work', 'shortBreak', 'longBreak'

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          if (mode === 'work') {
            onComplete(task.id);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, mode, onComplete, task.id]);

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">Pomodoro Timer</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-gray-500 hover:bg-gray-100"
            aria-label="Kapat"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-4 rounded-lg bg-gray-50 p-3">
          <h4 className="truncate text-base font-semibold text-gray-800">{task.title}</h4>
          <p className="mt-1 text-sm text-gray-600">
            🍅 {task.completed_pomodoros ?? 0}/{task.estimated_pomodoros ?? 1}
          </p>
        </div>

        <div className="mb-4 flex justify-center gap-2">
          <button
            type="button"
            onClick={() => switchMode('work')}
            className={`rounded-md px-3 py-1 text-sm font-medium ${
              mode === 'work' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            Çalışma
          </button>
          <button
            type="button"
            onClick={() => switchMode('shortBreak')}
            className={`rounded-md px-3 py-1 text-sm font-medium ${
              mode === 'shortBreak' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            Kısa Mola
          </button>
          <button
            type="button"
            onClick={() => switchMode('longBreak')}
            className={`rounded-md px-3 py-1 text-sm font-medium ${
              mode === 'longBreak' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            Uzun Mola
          </button>
        </div>

        <div className="mb-6">
          <div className="mb-2 h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full bg-red-500 transition-all duration-300"
              style={{ width: `${progress()}%` }}
            />
          </div>

          <div className="text-center text-6xl font-bold text-gray-900">{formatTime(timeLeft)}</div>
        </div>

        <div className="flex justify-center gap-3">
          <button
            type="button"
            onClick={() => setIsRunning(!isRunning)}
            className="flex items-center gap-2 rounded-lg bg-gray-900 px-6 py-3 text-white hover:bg-gray-800"
          >
            {isRunning ? <Pause size={20} /> : <Play size={20} />}
            <span>{isRunning ? 'Duraklat' : 'Başlat'}</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="rounded-lg border border-gray-300 p-3 text-gray-700 hover:bg-gray-50"
            aria-label="Sıfırla"
          >
            <RotateCcw size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default PomodoroTimer;
