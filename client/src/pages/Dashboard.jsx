import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTeam } from '../context/TeamContext';
import { getTasksByTeam, getActivity, autoReassign } from '../utils/api';
import { toast } from 'react-toastify';
import { MdRefresh, MdCheckCircle, MdPending, MdArrowOutward, MdNotifications } from 'react-icons/md';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { teams, fetchTeams, currentTeam, fetchTeamById, addMember } = useTeam();
  const [tasks, setTasks] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reassigning, setReassigning] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showActivityPanel, setShowActivityPanel] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [newMember, setNewMember] = useState({ email: '', capacity: 5 });
  const [addingMember, setAddingMember] = useState(false);

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

  const handleAddMember = async (e) => {
    e.preventDefault();

    if (!currentTeam) {
      toast.error('Create a team first');
      return;
    }

    setAddingMember(true);
    try {
      const res = await fetch(
        `http://localhost:5000/api/auth/find?email=${newMember.email}`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      const data = await res.json();

      if (!data._id) {
        toast.error('User not found');
        return;
      }

      await addMember(currentTeam._id, {
        userId: data._id,
        capacity: newMember.capacity
      });

      toast.success('Member added!');
      setShowAddMemberModal(false);
      setNewMember({ email: '', capacity: 5 });
    } catch (error) {
      toast.error('Failed to add member');
    } finally {
      setAddingMember(false);
    }
  };

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;
  const pendingTasks = tasks.filter(t => t.status === 'todo').length;
  const notifications = activity.slice(0, 5);
  const notificationCount = activity.length;
  const statCards = [
    { title: 'Total Projects', value: teams.length, subtitle: `${teams.length}+ Active teams`, route: '/projects', variant: 'primary' },
    { title: 'Running Tasks', value: inProgressTasks, subtitle: `${inProgressTasks}+ Increased from last month`, route: '/tasks', variant: 'light' },
    { title: 'Ended Projects', value: completedTasks, subtitle: `${completedTasks}+ Increased from last month`, route: '/projects', variant: 'light' },
    { title: 'Pending', value: pendingTasks, subtitle: 'On Discuss', route: '/tasks', variant: 'light' },
  ];

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
          <div className="relative">
            <button
              onClick={() => setShowNotifications((current) => !current)}
              className="relative flex items-center justify-center w-11 h-11 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
              aria-label="Open notifications"
            >
              <MdNotifications size={20} className="relative z-10" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-violet-600 px-1 text-[11px] font-semibold text-white">
                  {notificationCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 rounded-2xl border border-gray-100 bg-white shadow-xl z-20 overflow-hidden">
                <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Notifications</p>
                    <p className="text-xs text-gray-400">Latest activity from your workspace</p>
                  </div>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-gray-400 hover:text-gray-600"
                    aria-label="Close notifications"
                  >
                    ×
                  </button>
                </div>
                <div className="max-h-80 overflow-y-auto p-2">
                  {notifications.length > 0 ? (
                    notifications.map((log) => (
                      <div key={log._id} className="flex gap-3 rounded-xl px-3 py-3 hover:bg-gray-50 transition-colors">
                        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-600">
                          <MdCheckCircle size={16} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{log.action}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {new Date(log.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-8 text-center text-sm text-gray-400">
                      No notifications yet.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <button
            key={card.title}
            type="button"
            onClick={() => navigate(card.route)}
            className={`text-left rounded-xl p-5 border shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-violet-400 ${
              card.variant === 'primary'
                ? 'bg-violet-600 text-white border-violet-600'
                : 'bg-white border-gray-100'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <p className={`text-sm ${card.variant === 'primary' ? 'text-violet-200' : 'text-gray-400'}`}>
                {card.title}
              </p>
              <span className={`w-7 h-7 rounded-lg flex items-center justify-center ${card.variant === 'primary' ? 'bg-violet-500' : 'bg-gray-50'}`}>
                <MdArrowOutward size={14} className={card.variant === 'primary' ? '' : 'text-gray-400'} />
              </span>
            </div>
            <p className={`text-4xl font-bold ${card.variant === 'primary' ? 'text-white' : 'text-gray-900'}`}>
              {card.value}
            </p>
            <p className={`text-xs mt-2 ${card.variant === 'primary' ? 'text-violet-200' : 'text-violet-500'}`}>
              {card.subtitle}
            </p>
          </button>
        ))}
      </div>

      {/* Team Workload + Activity */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Team Collaboration */}
        <div className="md:col-span-2 bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-gray-900 font-semibold text-lg">Team Collaboration</h2>
            <button
              type="button"
              onClick={() => currentTeam ? setShowAddMemberModal(true) : toast.error('Create a team first')}
              className="text-sm text-violet-600 border border-gray-200
              px-3 py-1 rounded-lg hover:bg-gray-50"
            >
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
            <button
              onClick={() => setShowActivityPanel(true)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Expand recent activity"
            >
              +
            </button>
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

      {showActivityPanel && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowActivityPanel(false)}
        >
          <div
            className="w-full max-w-3xl rounded-3xl bg-white shadow-2xl border border-gray-100 overflow-hidden"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Recent Activity</h3>
                <p className="text-sm text-gray-400">Full activity feed for the selected team</p>
              </div>
              <button
                onClick={() => setShowActivityPanel(false)}
                className="rounded-lg px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
                aria-label="Close activity panel"
              >
                Close
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto p-6">
              {activity.length > 0 ? (
                <div className="space-y-4">
                  {activity.map((log) => (
                    <div
                      key={log._id}
                      className="flex items-start gap-4 rounded-2xl border border-gray-100 bg-gray-50/70 px-4 py-4"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-600">
                        <MdCheckCircle size={18} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900">{log.action}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(log.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-16 text-center">
                  <p className="text-gray-500 font-medium">No activity yet.</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Activity will appear here when your team starts working.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showAddMemberModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              Add Member
            </h2>
            <p className="text-sm text-gray-400 mb-4">
              {currentTeam ? `Add a member to ${currentTeam.name}` : 'Create a team first'}
            </p>

            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Member Email
                </label>
                <input
                  type="email"
                  value={newMember.email}
                  onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                  placeholder="member@example.com"
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5
                  text-sm focus:outline-none focus:border-violet-400"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Capacity (max tasks)
                </label>
                <select
                  value={newMember.capacity}
                  onChange={(e) => setNewMember({ ...newMember, capacity: Number(e.target.value) })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5
                  text-sm focus:outline-none focus:border-violet-400"
                >
                  {[1,2,3,4,5,6,7,8,9,10].map((n) => (
                    <option key={n} value={n}>{n} tasks</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddMemberModal(false)}
                  className="flex-1 border border-gray-200 text-gray-600 py-2.5
                  rounded-lg text-sm font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingMember}
                  className="flex-1 bg-violet-600 text-white py-2.5 rounded-lg
                  text-sm font-medium hover:bg-violet-500 disabled:opacity-50"
                >
                  {addingMember ? 'Adding...' : 'Add Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;