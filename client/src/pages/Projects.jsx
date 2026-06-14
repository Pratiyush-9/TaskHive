import { useEffect, useState } from 'react';
import { useTeam } from '../context/TeamContext';
import { createProject, getProjectsByTeam, deleteProject } from '../utils/api';
import { toast } from 'react-toastify';
import { MdFolderOpen, MdAdd, MdDelete, MdCalendarToday } from 'react-icons/md';

const Projects = () => {
  const { teams, fetchTeams } = useTeam();
  const [projects, setProjects] = useState([]);
  const [deleteConfirm, setDeleteConfirm] = useState(null); // stores project id to delete
  const [selectedTeam, setSelectedTeam] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    dueDate: ''
  });

  useEffect(() => { fetchTeams(); }, []);

  useEffect(() => {
    if (teams.length > 0 && !selectedTeam) {
      setSelectedTeam(teams[0]._id);
    }
  }, [teams]);

  useEffect(() => {
    if (selectedTeam) loadProjects();
  }, [selectedTeam]);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const { data } = await getProjectsByTeam(selectedTeam);
      setProjects(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createProject({ ...newProject, team: selectedTeam });
      toast.success('Project created! 🎉');
      setShowModal(false);
      setNewProject({ name: '', description: '', dueDate: '' });
      loadProjects();
    } catch (error) {
      toast.error('Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  // handleDelete uses deleteConfirm state instead of receiving id directly
  // this way we avoid window.confirm() and use our own modal
  const handleDelete = async () => {
    try {
      await deleteProject(deleteConfirm);
      toast.success('Project deleted');
      setDeleteConfirm(null); // close modal
      loadProjects(); // refresh list
    } catch (error) {
      toast.error('Failed to delete project');
    }
  };

  const getStatusColor = (status) => {
    if (status === 'active') return 'bg-green-50 text-green-700';
    if (status === 'completed') return 'bg-blue-50 text-blue-700';
    return 'bg-yellow-50 text-yellow-700';
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-400 text-sm mt-1">
            Organize your work into projects.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500
          text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <MdAdd size={18} />
          New Project
        </button>
      </div>

      {/* Team Selector — only shows if user has multiple teams */}
      {teams.length > 1 && (
        <div className="flex gap-2">
          {teams.map(team => (
            <button
              key={team._id}
              onClick={() => setSelectedTeam(team._id)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors
              ${selectedTeam === team._id
                ? 'bg-violet-600 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {team.name}
            </button>
          ))}
        </div>
      )}

      {/* Projects Grid */}
      {loading ? (
        <div className="text-center py-16">
          <p className="text-gray-400">Loading projects...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <MdFolderOpen size={48} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No projects yet</p>
          <p className="text-gray-400 text-sm mt-1">
            Create your first project to get started
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-4 bg-violet-600 text-white px-4 py-2
            rounded-lg text-sm font-medium hover:bg-violet-500"
          >
            New Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {projects.map((project) => (
            <div key={project._id}
              className="bg-white rounded-xl p-5 border border-gray-100
              shadow-sm hover:shadow-md transition-shadow">

              {/* Project Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center
                justify-center shrink-0">
                  <MdFolderOpen size={22} className="text-violet-600" />
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium
                  ${getStatusColor(project.status)}`}>
                    {project.status}
                  </span>
                  {/* onClick sets deleteConfirm to project id → opens custom modal */}
                  <button
                    onClick={() => setDeleteConfirm(project._id)}
                    className="text-gray-300 hover:text-red-500 transition-colors"
                  >
                    <MdDelete size={18} />
                  </button>
                </div>
              </div>

              <h3 className="font-semibold text-gray-900 mb-1">{project.name}</h3>
              <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                {project.description || 'No description'}
              </p>

              {/* Footer */}
              <div className="flex items-center justify-between pt-3
              border-t border-gray-100">
                <div className="flex items-center gap-1 text-gray-400 text-xs">
                  <MdCalendarToday size={14} />
                  {project.dueDate
                    ? new Date(project.dueDate).toLocaleDateString()
                    : 'No due date'
                  }
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-5 h-5 rounded-full bg-violet-600 flex items-center
                  justify-center text-white text-xs font-bold">
                    {project.owner?.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs text-gray-400">{project.owner?.name}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center
        justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Create New Project
            </h2>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Project Name
                </label>
                <input
                  type="text"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  placeholder="e.g. Website Redesign"
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5
                  text-sm focus:outline-none focus:border-violet-400"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Description
                </label>
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject({
                    ...newProject, description: e.target.value
                  })}
                  placeholder="What is this project about?"
                  rows={3}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5
                  text-sm focus:outline-none focus:border-violet-400 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={newProject.dueDate}
                  onChange={(e) => setNewProject({
                    ...newProject, dueDate: e.target.value
                  })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5
                  text-sm focus:outline-none focus:border-violet-400"
                />
              </div>

              {teams.length > 1 && (
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Team</label>
                  <select
                    value={selectedTeam}
                    onChange={(e) => setSelectedTeam(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5
                    text-sm focus:outline-none focus:border-violet-400"
                  >
                    {teams.map(team => (
                      <option key={team._id} value={team._id}>{team.name}</option>
                    ))}
                  </select>
                </div>
              )}

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
                  {loading ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal — custom modal instead of window.confirm() */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center
        justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm mx-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center
            justify-center mx-auto mb-4">
              <MdDelete size={24} className="text-red-500" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 text-center mb-2">
              Delete Project?
            </h2>
            <p className="text-gray-400 text-sm text-center mb-6">
              This action cannot be undone. All tasks in this project will be lost.
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

export default Projects;