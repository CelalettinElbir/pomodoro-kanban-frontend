import { useCallback, useEffect, useState } from 'react';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import {
  createColumn,
  createTask,
  deleteColumn,
  deleteTask,
  fetchColumnsWithTasks,
  moveColumn,
  moveTaskApi,
  updateColumn,
  updateTask,
} from './api';
import Column from './components/Column';
import AddColumnCard from './components/AddColumnCard';

const COLUMN_DROPPABLE_PREFIX = 'column-';
const TASK_DRAGGABLE_PREFIX = 'task-';

const getColumnIdFromDroppable = (droppableId) =>
  droppableId.replace(COLUMN_DROPPABLE_PREFIX, '');
const getTaskIdFromDraggable = (draggableId) =>
  draggableId.replace(TASK_DRAGGABLE_PREFIX, '');

const normalizeBoard = (columnsWithTasks = []) => {
  const sortedColumns = [...columnsWithTasks].sort(
    (a, b) => (a.order_index ?? 0) - (b.order_index ?? 0),
  );

  const columnsById = {};
  const columnOrder = [];
  const tasksById = {};
  const taskOrderByColumn = {};

  sortedColumns.forEach((column, columnIndex) => {
    const columnId = String(column.id);
    columnsById[columnId] = {
      id: columnId,
      title: column.title,
      orderIndex: column.order_index ?? columnIndex,
    };
    columnOrder.push(columnId);

    const sortedTasks = [...(column.tasks ?? [])].sort(
      (a, b) => (a.order_index ?? 0) - (b.order_index ?? 0),
    );

    taskOrderByColumn[columnId] = sortedTasks.map((task, taskIndex) => {
      const taskId = String(task.id);
      tasksById[taskId] = {
        ...task,
        id: taskId,
        columnId,
        orderIndex: task.order_index ?? taskIndex,
      };
      return taskId;
    });
  });

  return {
    columnsById,
    columnOrder,
    tasksById,
    taskOrderByColumn,
  };
};

function App() {
  const [columnsById, setColumnsById] = useState({});
  const [columnOrder, setColumnOrder] = useState([]);
  const [tasksById, setTasksById] = useState({});
  const [taskOrderByColumn, setTaskOrderByColumn] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const snapshotState = useCallback(() => ({
    columnsById,
    columnOrder,
    tasksById,
    taskOrderByColumn,
  }), [columnsById, columnOrder, taskOrderByColumn, tasksById]);

  const restoreState = useCallback((snapshot) => {
    setColumnsById(snapshot.columnsById);
    setColumnOrder(snapshot.columnOrder);
    setTasksById(snapshot.tasksById);
    setTaskOrderByColumn(snapshot.taskOrderByColumn);
  }, []);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetchColumnsWithTasks();
      const normalized = normalizeBoard(response.data);
      setColumnsById(normalized.columnsById);
      setColumnOrder(normalized.columnOrder);
      setTasksById(normalized.tasksById);
      setTaskOrderByColumn(normalized.taskOrderByColumn);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddColumn = async (title) => {
    const tempId = `tmp-col-${Date.now()}`;
    const prev = snapshotState();

    setColumnsById((prevColumns) => ({
      ...prevColumns,
      [tempId]: {
        id: tempId,
        title,
        orderIndex: columnOrder.length,
      },
    }));
    setColumnOrder((prevOrder) => [...prevOrder, tempId]);
    setTaskOrderByColumn((prevTaskOrders) => ({
      ...prevTaskOrders,
      [tempId]: [],
    }));

    try {
      const response = await createColumn(title, columnOrder.length);
      const created = response.data;
      const createdId = String(created.id);

      setColumnsById((prevColumns) => {
        const next = { ...prevColumns };
        delete next[tempId];
        next[createdId] = {
          id: createdId,
          title: created.title,
          orderIndex: created.order_index ?? columnOrder.length,
        };
        return next;
      });

      setColumnOrder((prevOrder) =>
        prevOrder.map((columnId) => (columnId === tempId ? createdId : columnId)),
      );

      setTaskOrderByColumn((prevTaskOrders) => {
        const next = { ...prevTaskOrders };
        delete next[tempId];
        next[createdId] = [];
        return next;
      });
    } catch (error) {
      console.error('Kolon ekleme hatası:', error);
      restoreState(prev);
    }
  };

  const handleUpdateColumn = async (columnId, title) => {
    const prev = snapshotState();

    setColumnsById((prevColumns) => ({
      ...prevColumns,
      [columnId]: {
        ...prevColumns[columnId],
        title,
      },
    }));

    try {
      await updateColumn(columnId, { title });
    } catch (error) {
      console.error('Kolon güncelleme hatası:', error);
      restoreState(prev);
    }
  };

  const handleDeleteColumn = async (columnId) => {
    const prev = snapshotState();
    const relatedTaskIds = taskOrderByColumn[columnId] ?? [];

    setColumnOrder((prevOrder) => prevOrder.filter((id) => id !== columnId));

    setColumnsById((prevColumns) => {
      const next = { ...prevColumns };
      delete next[columnId];
      return next;
    });

    setTaskOrderByColumn((prevTaskOrders) => {
      const next = { ...prevTaskOrders };
      delete next[columnId];
      return next;
    });

    setTasksById((prevTasks) => {
      const next = { ...prevTasks };
      relatedTaskIds.forEach((taskId) => {
        delete next[taskId];
      });
      return next;
    });

    try {
      await deleteColumn(columnId);
    } catch (error) {
      console.error('Kolon silme hatası:', error);
      restoreState(prev);
    }
  };

  const handleAddTask = async (columnId, taskPayload) => {
    const normalizedPayload =
      typeof taskPayload === 'string'
        ? { title: taskPayload }
        : {
            title: taskPayload?.title ?? '',
            content: taskPayload?.content ?? '',
            estimated_pomodoros: taskPayload?.estimated_pomodoros ?? 1,
            completed_pomodoros: taskPayload?.completed_pomodoros ?? 0,
          };

    const title = normalizedPayload.title.trim();
    if (!title) return;

    const tempTaskId = `tmp-task-${Date.now()}`;
    const prev = snapshotState();
    const nextIndex = taskOrderByColumn[columnId]?.length ?? 0;

    setTasksById((prevTasks) => ({
      ...prevTasks,
      [tempTaskId]: {
        id: tempTaskId,
        title,
        content: normalizedPayload.content,
        completed_pomodoros: normalizedPayload.completed_pomodoros,
        estimated_pomodoros: normalizedPayload.estimated_pomodoros,
        orderIndex: nextIndex,
        columnId,
      },
    }));

    setTaskOrderByColumn((prevTaskOrders) => ({
      ...prevTaskOrders,
      [columnId]: [...(prevTaskOrders[columnId] ?? []), tempTaskId],
    }));

    try {
      const response = await createTask(title, columnId, {
        content: normalizedPayload.content,
        estimated_pomodoros: normalizedPayload.estimated_pomodoros,
        completed_pomodoros: normalizedPayload.completed_pomodoros,
      });
      const created = response.data;
      const createdId = String(created.id);

      setTasksById((prevTasks) => {
        const next = { ...prevTasks };
        delete next[tempTaskId];
        next[createdId] = {
          ...created,
          id: createdId,
          columnId: String(created.column_id ?? columnId),
          orderIndex: created.order_index ?? nextIndex,
        };
        return next;
      });

      setTaskOrderByColumn((prevTaskOrders) => ({
        ...prevTaskOrders,
        [columnId]: (prevTaskOrders[columnId] ?? []).map((taskId) =>
          taskId === tempTaskId ? createdId : taskId,
        ),
      }));
    } catch (error) {
      console.error('Görev ekleme hatası:', error);
      restoreState(prev);
    }
  };

  const handleUpdateTask = async (taskId, payload) => {
    const prev = snapshotState();

    setTasksById((prevTasks) => ({
      ...prevTasks,
      [taskId]: {
        ...prevTasks[taskId],
        ...payload,
      },
    }));

    try {
      await updateTask(taskId, payload);
    } catch (error) {
      console.error('Görev güncelleme hatası:', error);
      restoreState(prev);
    }
  };

  const handleDeleteTask = async (taskId, columnId) => {
    const prev = snapshotState();

    setTasksById((prevTasks) => {
      const next = { ...prevTasks };
      delete next[taskId];
      return next;
    });

    setTaskOrderByColumn((prevTaskOrders) => ({
      ...prevTaskOrders,
      [columnId]: (prevTaskOrders[columnId] ?? []).filter((id) => id !== taskId),
    }));

    try {
      await deleteTask(taskId);
    } catch (error) {
      console.error('Görev silme hatası:', error);
      restoreState(prev);
    }
  };

  const reorderArray = (list, startIndex, endIndex) => {
    const result = [...list];
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  };

  const onDragEnd = async (result) => {
    const { type, source, destination, draggableId } = result;

    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const prev = snapshotState();

    if (type === 'COLUMN') {
      const nextOrder = reorderArray(columnOrder, source.index, destination.index);
      setColumnOrder(nextOrder);

      try {
        const movedColumnId = draggableId.replace(COLUMN_DROPPABLE_PREFIX, '');
        await moveColumn(movedColumnId, destination.index);
      } catch (error) {
        console.error('Kolon sıralama hatası:', error);
        restoreState(prev);
      }

      return;
    }

    const sourceColumnId = getColumnIdFromDroppable(source.droppableId);
    const destinationColumnId = getColumnIdFromDroppable(destination.droppableId);
    const taskId = getTaskIdFromDraggable(draggableId);

    if (sourceColumnId === destinationColumnId) {
      setTaskOrderByColumn((prevTaskOrders) => ({
        ...prevTaskOrders,
        [sourceColumnId]: reorderArray(
          prevTaskOrders[sourceColumnId] ?? [],
          source.index,
          destination.index,
        ),
      }));
    } else {
      setTaskOrderByColumn((prevTaskOrders) => {
        const sourceTaskIds = [...(prevTaskOrders[sourceColumnId] ?? [])];
        const destinationTaskIds = [...(prevTaskOrders[destinationColumnId] ?? [])];

        sourceTaskIds.splice(source.index, 1);
        destinationTaskIds.splice(destination.index, 0, taskId);

        return {
          ...prevTaskOrders,
          [sourceColumnId]: sourceTaskIds,
          [destinationColumnId]: destinationTaskIds,
        };
      });

      setTasksById((prevTasks) => ({
        ...prevTasks,
        [taskId]: {
          ...prevTasks[taskId],
          columnId: destinationColumnId,
        },
      }));
    }

    try {
      await moveTaskApi(taskId, destinationColumnId, destination.index);
    } catch (error) {
      console.error('Görev taşıma hatası:', error);
      restoreState(prev);
    }
  };

  const boardColumnCount = Math.max(columnOrder.length, 1);

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <header className="border-b border-gray-200 bg-white px-6 py-4">
        <h1 className="flex items-center gap-2 text-xl font-bold">
          <span className="text-red-500">🍅</span>
          PomoKanban
        </h1>
      </header>

      <main className="h-[calc(100vh-72px)] overflow-hidden p-6">
        {isLoading ? (
          <div className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-500">
            Board yükleniyor...
          </div>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex h-full flex-col">
            <div className="mb-4">
              <AddColumnCard onAdd={handleAddColumn} />
            </div>

            <Droppable droppableId="board-columns" direction="horizontal" type="COLUMN">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="grid h-full min-h-0 w-full items-stretch gap-4 overflow-x-auto overflow-y-hidden pb-1"
                  style={{
                    gridTemplateColumns: `repeat(${boardColumnCount}, minmax(0, 1fr))`,
                  }}
                >
                  {columnOrder.map((columnId, index) => {
                    const column = columnsById[columnId];
                    const taskIds = taskOrderByColumn[columnId] ?? [];
                    const tasks = taskIds.map((taskId) => tasksById[taskId]).filter(Boolean);

                    if (!column) return null;

                    return (
                      <Column
                        key={column.id}
                        column={column}
                        index={index}
                        tasks={tasks}
                        onAddTask={handleAddTask}
                        onDeleteColumn={handleDeleteColumn}
                        onDeleteTask={handleDeleteTask}
                        onUpdateColumn={handleUpdateColumn}
                        onUpdateTask={handleUpdateTask}
                      />
                    );
                  })}

                  {provided.placeholder}
                </div>
              )}
            </Droppable>
            </div>
          </DragDropContext>
        )}
      </main>
    </div>
  );
}

export default App;
