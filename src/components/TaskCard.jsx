import { Draggable } from '@hello-pangea/dnd';

const TaskCard = ({ task, index }) => {
  return (
    <Draggable draggableId={task.id.toString()} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="bg-white p-4 mb-3 rounded-md shadow-sm border border-gray-200 hover:border-blue-400 transition-colors"
        >
          <p className="font-medium text-gray-800">{task.title}</p>
          <div className="flex items-center mt-2 text-xs text-gray-500">
            <span>🍅 {task.completed_pomodoros}/{task.estimated_pomodoros}</span>
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default TaskCard;