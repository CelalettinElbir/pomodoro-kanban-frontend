import axios from 'axios';


export const moveTask = (taskId, newColumnId) => 
    axios.patch(`${API_URL}/tasks/${taskId}/move?new_column_id=${newColumnId}`);




const api = axios.create({
  baseURL: 'http://localhost:8000',
});

export const fetchColumnsWithTasks = () => api.get('/get_columns_with_tasks/');
export const createColumn = (title, orderIndex) => api.post('/columns/', { title, order_index: orderIndex });
export const moveTaskApi = (taskId, newColumnId) => api.patch(`/tasks/${taskId}/move?new_column_id=${newColumnId}`);