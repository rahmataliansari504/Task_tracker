/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { X, Edit, Eye, Plus, Search, Calendar, Filter } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  setTasks,
  addTask,
  updateTask,
  removeTask,
} from "../redux/features/task/taskSlice";
import { logout } from "../redux/features/auth/authSlice";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ClipLoader from "react-spinners/ClipLoader";

axios.defaults.withCredentials = true;

const API_URL =
  import.meta.env.VITE_BACKEND_BASE_URL || "http://localhost:3000";

// --- Sub Components ---

const TaskDetailModal = ({ task, onClose }) => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center p-4">
    <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md border border-gray-100 animate-in fade-in zoom-in duration-200">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-2xl font-bold text-gray-800">{task.title}</h2>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full"><X size={20} /></button>
      </div>
      
      <div className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg">
           <p className="text-gray-600 text-sm whitespace-pre-wrap">{task.description}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500 block mb-1">Status</span>
            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full font-medium">{task.status}</span>
          </div>
          <div>
            <span className="text-gray-500 block mb-1">Priority</span>
            <span className={`px-3 py-1 rounded-full font-medium ${
              task.priority === 'High' ? 'bg-red-100 text-red-700' :
              task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
              'bg-green-100 text-green-700'
            }`}>{task.priority}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-gray-500">
           <Calendar size={16} />
           <span>Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "Not set"}</span>
        </div>
      </div>
    </div>
  </div>
);

const EditTaskModal = ({ task, onSave, onClose }) => {
  const [editedTask, setEditedTask] = useState(task);

  const handleSave = () => {
    onSave(editedTask);
    onClose();
  };

  const inputClass = "w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none mb-4";

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center p-4">
      <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in duration-200">
        <h2 className="text-xl font-bold mb-6 text-gray-800">Edit Task</h2>
        
        <input
          type="text"
          value={editedTask.title}
          onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
          className={inputClass}
          placeholder="Task Title"
        />
        
        <textarea
          value={editedTask.description}
          onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
          className={inputClass}
          rows="3"
          placeholder="Description"
        />
        
        <div className="grid grid-cols-2 gap-4 mb-4">
            <select
            value={editedTask.status}
            onChange={(e) => setEditedTask({ ...editedTask, status: e.target.value })}
            className={inputClass}
            >
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Done">Done</option>
            </select>

            <select
            value={editedTask.priority}
            onChange={(e) => setEditedTask({ ...editedTask, priority: e.target.value })}
            className={inputClass}
            >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            </select>
        </div>

        <input
          type="date"
          value={editedTask.dueDate ? editedTask.dueDate.split("T")[0] : ""}
          onChange={(e) => setEditedTask({ ...editedTask, dueDate: e.target.value })}
          className={inputClass}
        />

        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md transition">Save Changes</button>
        </div>
      </div>
    </div>
  );
};

// --- Main Board Component ---

const TrelloBoard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [viewTask, setViewTask] = useState(null);
  const [editTask, setEditTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const tasks = useSelector((state) => state.tasks.tasks);

  const override = {
    display: "block",
    margin: "0 auto",
    borderColor: "#4F46E5", // Indigo-600
  };

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/v1/tasks`);
        dispatch(setTasks(response.data));
        setLoading(false);
      } catch (err) {
        if (err.response && err.response.status === 401) {
          dispatch(logout());
          navigate("/login");
        } else {
          setError(err.message);
          setLoading(false);
        }
      }
    };
    fetchTasks();
  }, [dispatch, navigate]);

  const columns = {
    todo: { id: "todo", title: "To Do", tasks: tasks.filter((task) => task.status === "To Do") },
    inProgress: { id: "inProgress", title: "In Progress", tasks: tasks.filter((task) => task.status === "In Progress") },
    done: { id: "done", title: "Done", tasks: tasks.filter((task) => task.status === "Done") },
  };

  const onDragEnd = async (result) => {
    const { source, destination } = result;
    if (!destination) return;

    const task = columns[source.droppableId].tasks[source.index];
    const updatedTask = {
      ...task,
      status: destination.droppableId === "inProgress" ? "In Progress" : destination.droppableId === "done" ? "Done" : "To Do",
    };

    try {
      const response = await axios.put(`${API_URL}/api/v1/tasks/${task._id}`, updatedTask);
      dispatch(updateTask(response.data));
    } catch (err) {
      if (err.response?.status === 401) { dispatch(logout()); navigate("/login"); } 
      else setError(err.message);
    }
  };

  const addNewTask = async () => {
    const newTask = {
      title: "New Task",
      description: "Add description...",
      status: "To Do",
      priority: "Medium",
      dueDate: new Date().toISOString().split("T")[0],
    };
    try {
      const response = await axios.post(`${API_URL}/api/v1/tasks`, newTask);
      dispatch(addTask(response.data));
    } catch (err) {
       // Error handling same as above
    }
  };

  const deleteTask = async (taskId) => {
    if(!window.confirm("Are you sure?")) return;
    try {
      await axios.delete(`${API_URL}/api/v1/tasks/${taskId}`);
      dispatch(removeTask(taskId));
    } catch (err) { /* Error handling */ }
  };

  const handleEditTask = async (updatedTask) => {
    try {
      const response = await axios.put(`${API_URL}/api/v1/tasks/${updatedTask._id}`, updatedTask);
      dispatch(updateTask(response.data));
    } catch (err) { /* Error handling */ }
  };

  // Helper for priority color badge
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-50 text-red-600 border-red-200';
      case 'Medium': return 'bg-yellow-50 text-yellow-600 border-yellow-200';
      case 'Low': return 'bg-green-50 text-green-600 border-green-200';
      default: return 'bg-gray-50 text-gray-600';
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-500">
      <ClipLoader color="#4F46E5" loading={loading} cssOverride={override} size={60} />
      <p className="mt-4 animate-pulse">Syncing your board...</p>
    </div>
  );

  if (error) return <div className="p-8 text-center text-red-500 bg-red-50 rounded-lg m-4">Error: {error}</div>;

  const filteredTasks = tasks.filter(
    (task) => task.title.toLowerCase().includes(searchTerm.toLowerCase()) || task.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Re-filtering columns based on search
  const filteredColumns = {
    todo: { ...columns.todo, tasks: filteredTasks.filter((task) => task.status === "To Do") },
    inProgress: { ...columns.inProgress, tasks: filteredTasks.filter((task) => task.status === "In Progress") },
    done: { ...columns.done, tasks: filteredTasks.filter((task) => task.status === "Done") },
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* --- Toolbar --- */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <button
          onClick={addNewTask}
          className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
        >
          <Plus size={20} /> <span className="font-medium">New Task</span>
        </button>

        <div className="flex w-full md:w-auto gap-3">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search tasks..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative">
             <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <Filter size={16} />
             </div>
             <select
                className="pl-9 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
            >
                <option value="recent">Recent</option>
                <option value="alphabetical">A-Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* --- Kanban Board --- */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {Object.values(filteredColumns).map((column) => (
            <div key={column.id} className="bg-gray-100/50 p-4 rounded-xl border border-gray-200/60 flex flex-col max-h-[calc(100vh-200px)]">
              
              {/* Column Header */}
              <div className="flex justify-between items-center mb-4 px-1">
                <h2 className="font-bold text-gray-700 flex items-center gap-2">
                  {column.title}
                  <span className="bg-gray-200 text-gray-600 text-xs py-0.5 px-2 rounded-full">{column.tasks.length}</span>
                </h2>
                <div className={`w-3 h-3 rounded-full ${
                    column.id === 'todo' ? 'bg-gray-400' : 
                    column.id === 'inProgress' ? 'bg-indigo-400' : 'bg-green-400'
                }`}></div>
              </div>

              {/* Droppable Area */}
              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`flex-1 overflow-y-auto pr-2 transition-colors rounded-lg min-h-[150px] ${
                        snapshot.isDraggingOver ? 'bg-indigo-50/50 ring-2 ring-indigo-200 border-dashed border-2 border-indigo-300' : ''
                    }`}
                  >
                    {column.tasks.map((task, index) => (
                      <Draggable key={task._id} draggableId={task._id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`bg-white p-4 mb-3 rounded-lg shadow-sm border border-gray-100 group hover:shadow-md transition-all ${
                                snapshot.isDragging ? 'rotate-2 shadow-xl ring-2 ring-indigo-500 z-50' : ''
                            }`}
                            style={provided.draggableProps.style}
                          >
                            <div className="flex justify-between items-start mb-2">
                                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${getPriorityColor(task.priority)}`}>
                                    {task.priority}
                                </span>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => setViewTask(task)} className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-indigo-600"><Eye size={14}/></button>
                                    <button onClick={() => setEditTask(task)} className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-blue-600"><Edit size={14}/></button>
                                    <button onClick={() => deleteTask(task._id)} className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-red-600"><X size={14}/></button>
                                </div>
                            </div>

                            <h3 className="font-semibold text-gray-800 mb-1 leading-tight">{task.title}</h3>
                            <p className="text-xs text-gray-500 line-clamp-2 mb-3">{task.description}</p>
                            
                            <div className="flex items-center text-xs text-gray-400 mt-auto pt-2 border-t border-gray-50">
                                <Calendar size={12} className="mr-1" />
                                {task.dueDate ? new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : "No date"}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      {viewTask && <TaskDetailModal task={viewTask} onClose={() => setViewTask(null)} />}
      {editTask && <EditTaskModal task={editTask} onSave={handleEditTask} onClose={() => setEditTask(null)} />}
    </div>
  );
};

export default TrelloBoard;