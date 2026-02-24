import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
});

export const fetchColumnsWithTasks = () => api.get('/get_columns_with_tasks/');

export const createColumn = (title, orderIndex) =>
  api.post('/columns/', { title, order_index: orderIndex });

export const updateColumn = (columnId, payload) =>
  api.patch(`/columns/${columnId}/`, payload);

export const deleteColumn = (columnId) => api.delete(`/columns/${columnId}/`);

export const moveColumn = (columnId, newOrderIndex) =>
  api.patch(`/columns/${columnId}/move?new_order_index=${newOrderIndex}`);

export const createTask = (title, columnId, payload = {}) =>
  api.post('/tasks/', { title, column_id: Number(columnId), ...payload });

export const fetchTask = (taskId) => api.get(`/tasks/${taskId}/`);


export const updateTask = (taskId, payload) =>
  api.patch(`/tasks/${taskId}/`, payload);

export const deleteTask = (taskId) => api.delete(`/tasks/${taskId}/`);

export const moveTaskApi = (taskId, newColumnId, newOrderIndex) => {
  const params = new URLSearchParams({
    new_column_id: String(newColumnId),
  });

  if (typeof newOrderIndex === 'number') {
    params.set('new_order_index', String(newOrderIndex));
  }

  return api.patch(`/tasks/${taskId}/move?${params.toString()}`);
};

