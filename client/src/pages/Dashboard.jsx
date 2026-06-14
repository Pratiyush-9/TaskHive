import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTeam } from '../context/TeamContext';
import { getTasksByTeam, getActivity, autoReassign } from '../utils/api';
import { toast } from 'react-toastify';
import { MdRefresh, MdCheckCircle, MdPending, MdArrowOutward } from 'react-icons/md';

const Dashboard = () => {
  const { user } = useAuth();
  const { teams, fetchTeams, currentTeam, fetchTeamById } = useTeam();
  const [tasks, setTasks] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reassigning, setReassigning] = useState(false);

  useEffect(() => { fetchTeams(); }, []);

  useEffect(() => {
    if (teams.length > 0 && !currentTeam) fetchTeamById(teams[0]._id);
  }, [teams]);

  useEffect(() => {
    if (currentTeam) loadTasksAndActivity();
  }, [currentTeam]);

  const loadTasksAndActivity = async () => {
    setLoading(true);
    try {
      const [tasksRes, activityRes] = await Promise.all([
        getTasksByTeam(currentTeam._id),
        getActivity(currentTeam._id)
      ]);
      setTasks(tasksRes.data);
      setActivity(activityRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAutoReassign = async () => {
    setReassigning(true);
    try {
      const { data } = await autoReassign(currentTeam._id);
      toast.success(`✅ ${data.message}`);
      loadTasksAndActivity();
    } catch (error) {
      toast.error('Reassignment failed');
    } finally {
      setReassigning(false);
    }
  };

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;
  const pendingTasks = tasks.filter(t => t.status === 'todo').length;

  const getMemberTaskCount = (userId) =>
    tasks.filter(t =>
      t.assignedTo && t.assignedTo._id === userId &&
      t.status !== 'completed'
    ).length;

  const getMemberStatus = (taskCount, capacity) => {
    if (taskCount > capacity) return { label: 'Overloaded', color: 'text-red-500', bg: 'bg-red-50' };
    if (taskCount === capacity) return { label: 'At Capacity', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    return { label: 'Available', color: 'text-violet-600', bg: 'bg-violet-50' };
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">Plan, prioritize, and accomplish your tasks.</p>
        </div>
        <div className="flex gap-3">
          {currentTeam && (
            <button
              onClick={handleAutoReassign}
              disabled={reassigning}
              className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500
              text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 text-sm font-medium"
            >
              <MdRefresh size={18} className={reassigning ? 'animate-spin' : ''} />
              {reassigning ? 'Rebalancing...' : '+ Reassign Tasks'}
            </button>
          )}
          <button className="flex items-center gap-2 border border-gray-200
          text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">
            Import Data
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-violet-600 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between mb-4">
            <p className="text-violet-200 text-sm">Total Projects</p>
            <button className="w-7 h-7 bg-violet-500 rounded-lg flex items-center justify-center">
              <MdArrowOutward size={14} />
            </button>
          </div>
          <p className="text-4xl font-bold">{teams.length}</p>
          <p className="text-violet-200 text-xs mt-2">{teams.length}+ Active teams</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="text-gray-400 text-sm">Running Tasks</p>
            <button className="w-7 h-7 bg-gray-50 rounded-lg flex items-center justify-center">
              <MdArrowOutward size={14} className="text-gray-400" />
            </button>
          </div>
          <p className="text-4xl font-bold text-gray-900">{inProgressTasks}</p>
          <p className="text-violet-500 text-xs mt-2">{inProgressTasks}+ Increased from last month</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="text-gray-400 text-sm">Ended Projects</p>
            <button className="w-7 h-7 bg-gray-50 rounded-lg flex items-center justify-center">
              <MdArrowOutward size={14} className="text-gray-400" />
            </button>
          </div>
          <p className="text-4xl font-bold text-gray-900">{completedTasks}</p>
          <p className="text-violet-500 text-xs mt-2">{completedTasks}+ Increased from last month</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="text-gray-400 text-sm">Pending</p>
            <button className="w-7 h-7 bg-gray-50 rounded-lg flex items-center justify-center">
              <MdArrowOutward size={14} className="text-gray-400" />
            </button>
          </div>
          <p className="text-4xl font-bold text-gray-900">{pendingTasks}</p>
          <p className="text-gray-400 text-xs mt-2">On Discuss</p>
        </div>
      </div>

      {/* Team Workload + Activity */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Team Collaboration */}
        <div className="md:col-span-2 bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-gray-900 font-semibold text-lg">Team Collaboration</h2>
            <button className="text-sm text-violet-600 border border-gray-200
            px-3 py-1 rounded-lg hover:bg-gray-50">
              + Add Member
            </button>
          </div>
          {currentTeam ? (
            <div className="space-y-4">
              {currentTeam.members.map((member) => {
                const taskCount = getMemberTaskCount(member.user._id);
                const status = getMemberStatus(taskCount, member.capacity);
                const percentage = Math.min((taskCount / member.capacity) * 100, 100);
                return (
                  <div key={member.user._id} className="flex items-center gap-4">
                    <div className="w-9 h-9 rounded-full bg-violet-600 flex items-center
                    justify-center text-white text-sm font-bold shrink-0">
                      {member.user.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <div>
                          <p className="text-gray-900 text-sm font-medium">{member.user.name}</p>
                          <p className="text-gray-400 text-xs">Load: {taskCount}/{member.capacity} Tasks</p>
                        </div>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${status.bg} ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full transition-all ${
                            taskCount > member.capacity ? 'bg-red-500' :
                            taskCount === member.capacity ? 'bg-yellow-500' : 'bg-violet-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400 text-sm">No team found.</p>
              <a href="/teams" className="text-violet-600 text-sm font-medium mt-1 block">
                Create a team →
              </a>
            </div>
          )}
        </div>

        {/* Activity Log */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-gray-900 font-semibold text-lg">Recent Activity</h2>
            <button className="text-gray-400 hover:text-gray-600">+</button>
          </div>
          {activity.length > 0 ? (
            <div className="space-y-3 max-h-72 overflow-y-auto">
              {activity.map((log) => (
                <div key={log._id} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center
                  justify-center shrink-0 mt-0.5">
                    <MdCheckCircle size={14} className="text-violet-600" />
                  </div>
                  <div>
                    <p className="text-gray-700 text-sm font-medium">{log.action}</p>
                    <p className="text-gray-400 text-xs mt-0.5">
                      {new Date(log.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No activity yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;