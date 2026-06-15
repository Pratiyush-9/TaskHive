import { useEffect, useState } from 'react';
import { useTeam } from '../context/TeamContext';
import { getProjectsByTeam, createTask, getTasksByTeam, updateTask, deleteTask } from '../utils/api';
import { toast } from 'react-toastify';
import { MdAdd, MdDelete } from 'react-icons/md';

// 4 columns — Todo orange, In Progress yellow, Overdue red, Completed green
const COLUMNS = [
  { key: 'todo', label: 'Todo', color: 'bg-orange-400', light: 'bg-orange-50' },
  { key: 'in-progress', label: 'In Progress', color: 'bg-yellow-400', light: 'bg-yellow-50' },
  { key: 'overdue', label: 'Overdue', color: 'bg-red-500', light: 'bg-red-50' },
  { key: 'completed', label: 'Completed', color: 'bg-green-400', light: 'bg-green-50' },
];

// Check if task is overdue
// A task is overdue if dueDate is in the past AND status is not completed
const isOverdue = (task) => {
  if (!task.dueDate) return false;
  if (task.status === 'completed') return false;
  return new Date(task.dueDate) < new Date();
};

const Tasks = () => {
  const { teams, fetchTeams, currentTeam, fetchTeamById } = useTeam();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'todo',
    assignedTo: '',
    project: '',
    dueDate: ''
  });

  useEffect(() => { fetchTeams(); }, []);

  useEffect(() => {
    if (teams.length > 0 && !currentTeam) fetchTeamById(teams[0]._id);
  }, [teams]);

  useEffect(() => {
    if (currentTeam) {
      loadTasks();
      loadProjects();
    }
  }, [currentTeam]);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const { data } = await getTasksByTeam(currentTeam._id);
      setTasks(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadProjects = async () => {
    try {
      const { data } = await getProjectsByTeam(currentTeam._id);
      setProjects(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createTask({ ...newTask, team: currentTeam._id });
      toast.success('Task created! ✅');
      setShowModal(false);
      setNewTask({
        title: '', description: '', priority: 'medium',
        status: 'todo', assignedTo: '', project: '', dueDate: ''
      });
      loadTasks();
    } catch (error) {
      toast.error('Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await updateTask(taskId, { status: newStatus });
      toast.success('Status updated!');
      loadTasks();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTask(deleteConfirm);
      toast.success('Task deleted');
      setDeleteConfirm(null);
      loadTasks();
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  const getPriorityColor = (priority) => {
    if (priority === 'high') return 'bg-red-100 text-red-600';
    if (priority === 'medium') return 'bg-yellow-100 text-yellow-600';
    return 'bg-green-100 text-green-600';
  };

  // Filter tasks into columns
  // Overdue check runs first — overdue tasks go to overdue column
  const getColumnTasks = (key) => {
    if (key === 'overdue') {
      return tasks.filter(t => isOverdue(t));
    }
    // Non-overdue tasks filtered by status
    return tasks.filter(t => !isOverdue(t) && t.status === key);
  };

  const TaskCard = ({ task }) => (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100
    hover:shadow-md transition-shadow">

      {/* Priority + Delete */}
      <div className="flex items-center justify-between mb-2">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium
        ${getPriorityColor(task.priority)}`}>
          {task.priority}
        </span>
        <button
          onClick={() => setDeleteConfirm(task._id)}
          className="text-gray-300 hover:text-red-500 transition-colors"
        >
          <MdDelete size={16} />
        </button>
      </div>

      {/* Title */}
      <h4 className="font-semibold text-gray-900 text-sm mb-1">{task.title}</h4>
      {task.description && (
        <p className="text-gray-400 text-xs mb-2 line-clamp-2">{task.description}</p>
      )}

      {/* Due date — shows in red if overdue */}
      {task.dueDate && (
        <p className={`text-xs mb-2 font-medium ${
          isOverdue(task) ? 'text-red-500' : 'text-gray-400'
        }`}>
          📅 Due: {new Date(task.dueDate).toLocaleDateString()}
          {isOverdue(task) && ' — Overdue!'}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
        {task.assignedTo ? (
          <div className="flex items-center gap-1">
            <div className="w-5 h-5 rounded-full bg-violet-600 flex items-center
            justify-center text-white text-xs font-bold">
              {task.assignedTo.name?.charAt(0).toUpperCase()}
            </div>
            <span className="text-xs text-gray-400">{task.assignedTo.name}</span>
          </div>
        ) : (
          <span className="text-xs text-gray-300">Unassigned</span>
        )}

        <select
          value={task.status}
          onChange={(e) => handleStatusChange(task._id, e.target.value)}
          className="text-xs border border-gray-200 rounded px-1 py-0.5
          text-gray-600 focus:outline-none focus:border-violet-400"
        >
          <option value="todo">Todo</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-400 text-sm mt-1">Manage and track all your tasks.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500
          text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <MdAdd size={18} />
          New Task
        </button>
      </div>

      {/* Kanban Board — 4 columns */}
      {loading ? (
        <div className="text-center py-16">
          <p className="text-gray-400">Loading tasks...</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {COLUMNS.map((col) => {
            const colTasks = getColumnTasks(col.key);
            return (
              <div key={col.key} className="flex flex-col">

                {/* Colored Column Header */}
                <div className={`${col.color} rounded-t-xl px-4 py-3 flex items-center
                justify-between`}>
                  <h3 className="font-bold text-white text-sm">{col.label}</h3>
                  <span className="bg-white/30 text-white text-xs font-bold
                  px-2 py-0.5 rounded-full">
                    {colTasks.length}
                  </span>
                </div>

                {/* Light colored body */}
                <div className={`${col.light} rounded-b-xl p-3 flex-1 min-h-64
                space-y-3`}>
                  {colTasks.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-300 text-sm">No tasks</p>
                    </div>
                  ) : (
                    colTasks.map(task => <TaskCard key={task._id} task={task} />)
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Task Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4
          max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Create New Task
            </h2>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Task Title</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="e.g. Design login page"
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5
                  text-sm focus:outline-none focus:border-violet-400"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">Description</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Task details..."
                  rows={3}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5
                  text-sm focus:outline-none focus:border-violet-400 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5
                    text-sm focus:outline-none focus:border-violet-400"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Status</label>
                  <select
                    value={newTask.status}
                    onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5
                    text-sm focus:outline-none focus:border-violet-400"
                  >
                    <option value="todo">Todo</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              {/* Due Date field — NEW */}
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5
                  text-sm focus:outline-none focus:border-violet-400"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">Assign To</label>
                <select
                  value={newTask.assignedTo}
                  onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5
                  text-sm focus:outline-none focus:border-violet-400"
                >
                  <option value="">Unassigned</option>
                  {currentTeam?.members.map(member => (
                    <option key={member.user._id} value={member.user._id}>
                      {member.user.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">Project</label>
                <select
                  value={newTask.project}
                  onChange={(e) => setNewTask({ ...newTask, project: e.target.value })}
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5
                  text-sm focus:outline-none focus:border-violet-400"
                >
                  <option value="">Select project</option>
                  {projects.map(project => (
                    <option key={project._id} value={project._id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 border border-gray-200 text-gray-600 py-2.5
                  rounded-lg text-sm font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-violet-600 text-white py-2.5 rounded-lg
                  text-sm font-medium hover:bg-violet-500 disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm mx-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center
            justify-center mx-auto mb-4">
              <MdDelete size={24} className="text-red-500" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 text-center mb-2">
              Delete Task?
            </h2>
            <p className="text-gray-400 text-sm text-center mb-6">
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 border border-gray-200 text-gray-600 py-2.5
                rounded-lg text-sm font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 bg-red-500 text-white py-2.5 rounded-lg
                text-sm font-medium hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;