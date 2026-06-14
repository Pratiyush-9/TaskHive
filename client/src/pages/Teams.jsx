import { useEffect, useState } from 'react';
import { useTeam } from '../context/TeamContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { MdGroup, MdAdd, MdPerson } from 'react-icons/md';

const Teams = () => {
  const { teams, fetchTeams, createTeam, addMember, updateMemberCapacity } = useTeam();
  const { user } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddMember, setShowAddMember] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [newTeam, setNewTeam] = useState({ name: '', description: '' });
  const [newMember, setNewMember] = useState({ email: '', capacity: 5 });
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchTeams(); }, []);

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createTeam(newTeam);
      toast.success('Team created! 🐝');
      setShowCreateModal(false);
      setNewTeam({ name: '', description: '' });
    } catch (error) {
      toast.error('Failed to create team');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Find user by email first
      const res = await fetch(
        `http://localhost:5000/api/auth/find?email=${newMember.email}`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      const data = await res.json();
      if (!data._id) {
        toast.error('User not found');
        return;
      }
      await addMember(showAddMember, {
        userId: data._id,
        capacity: newMember.capacity
      });
      toast.success('Member added!');
      setShowAddMember(null);
      setNewMember({ email: '', capacity: 5 });
    } catch (error) {
      toast.error('Failed to add member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Teams</h1>
          <p className="text-gray-400 text-sm mt-1">
            Manage your teams and members.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500
          text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <MdAdd size={18} />
          Create Team
        </button>
      </div>

      {/* Teams Grid */}
      {teams.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <MdGroup size={48} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No teams yet</p>
          <p className="text-gray-400 text-sm mt-1">
            Create your first team to get started
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-4 bg-violet-600 text-white px-4 py-2 
            rounded-lg text-sm font-medium hover:bg-violet-500"
          >
            Create Team
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {teams.map((team) => (
            <div key={team._id}
              className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">

              {/* Team Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center
                  justify-center">
                    <MdGroup size={22} className="text-violet-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{team.name}</h3>
                    <p className="text-gray-400 text-xs">{team.description}</p>
                  </div>
                </div>
                <span className="text-xs bg-violet-50 text-violet-600 
                px-2 py-1 rounded-full font-medium">
                  {team.members.length} members
                </span>
              </div>

              {/* Members List */}
              <div className="space-y-3 mb-4">
                {team.members.map((member) => (
                  <div key={member.user._id}
                    className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center
                      justify-center text-white text-xs font-bold">
                        {member.user.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {member.user.name}
                        </p>
                        <p className="text-xs text-gray-400">{member.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">
                        Capacity:
                      </span>
                      <select
                        value={member.capacity}
                        onChange={async (e) => {
                          await updateMemberCapacity(team._id, {
                            userId: member.user._id,
                            capacity: Number(e.target.value)
                          });
                          toast.success('Capacity updated!');
                        }}
                        className="text-xs border border-gray-200 rounded px-1 py-0.5
                        text-gray-700 focus:outline-none focus:border-violet-400"
                      >
                        {[1,2,3,4,5,6,7,8,9,10].map(n => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Member Button */}
              <button
                onClick={() => setShowAddMember(team._id)}
                className="w-full border border-dashed border-gray-300 text-gray-400
                hover:border-violet-400 hover:text-violet-600 py-2 rounded-lg
                text-sm transition-colors flex items-center justify-center gap-1"
              >
                <MdAdd size={16} />
                Add Member
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Create Team Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Create New Team
            </h2>
            <form onSubmit={handleCreateTeam} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Team Name</label>
                <input
                  type="text"
                  value={newTeam.name}
                  onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                  placeholder="e.g. Development Team"
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
                  value={newTeam.description}
                  onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })}
                  placeholder="What does this team work on?"
                  rows={3}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5
                  text-sm focus:outline-none focus:border-violet-400 resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
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
                  {loading ? 'Creating...' : 'Create Team'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Add Member
            </h2>
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
                  onChange={(e) => setNewMember({
                    ...newMember, capacity: Number(e.target.value)
                  })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5
                  text-sm focus:outline-none focus:border-violet-400"
                >
                  {[1,2,3,4,5,6,7,8,9,10].map(n => (
                    <option key={n} value={n}>{n} tasks</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddMember(null)}
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
                  {loading ? 'Adding...' : 'Add Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Teams;