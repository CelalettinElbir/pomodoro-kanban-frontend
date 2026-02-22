import { Droppable } from '@hello-pangea/dnd';
import TaskCard from './TaskCard';

const Column = ({ column }) => {
  return (
    <div className="bg-gray-100 w-80 rounded-lg flex flex-col max-h-full">
      <div className="p-4 flex justify-between items-center">
        <h2 className="font-bold text-gray-700 uppercase text-sm tracking-wide">
          {column.title}
        </h2>
        <span className="bg-gray-300 text-gray-600 px-2 py-1 rounded text-xs">
          {column.tasks?.length || 0}
        </span>
      </div>

      <Droppable droppableId={column.id.toString()}>
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="p-2 flex-grow overflow-y-auto min-h-[200px]"
          >
            {column.tasks?.map((task, index) => (
              <TaskCard key={task.id} task={task} index={index} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default Column;