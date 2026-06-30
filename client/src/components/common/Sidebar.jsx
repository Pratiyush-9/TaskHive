import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  MdDashboard,
  MdGroup,
  MdFolderOpen,
  MdSettings,
  MdLogout,
  MdCalendarMonth,
  MdTask
} from 'react-icons/md';
import { toast } from 'react-toastify';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const navLinks = [
    { to: '/dashboard', icon: <MdDashboard size={20} />, label: 'Dashboard' },
    { to: '/projects', icon: <MdFolderOpen size={20} />, label: 'Projects' },
    { to: '/teams', icon: <MdGroup size={20} />, label: 'Teams' },
    { to: '/calendar', icon: <MdCalendarMonth size={20} />, label: 'Calendar' },
    { to: '/tasks', icon: <MdTask size={20} />, label: 'Tasks' },
];

  const generalLinks = [
    { to: '/settings', icon: <MdSettings size={20} />, label: 'Settings' },
  ];

  return (
    <div className="w-64 h-screen bg-white border-r border-gray-200
    flex flex-col fixed left-0 top-0 overflow-y-auto">

      {/* Logo */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center">
          <span className="text-xl font-bold text-gray-900">TaskHive</span>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 p-4 space-y-1">
        <p className="text-xs text-gray-400 uppercase tracking-wider mb-3 px-3">
          Menu
        </p>
        {navLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
              ${isActive
                ? 'bg-violet-50 text-violet-600 font-semibold border-l-4 border-violet-600'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            {link.icon}
            <span className="text-sm">{link.label}</span>
          </NavLink>
        ))}

        <p className="text-xs text-gray-400 uppercase tracking-wider mb-3 px-3 pt-4">
          General
        </p>
        {generalLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
              ${isActive
                ? 'bg-violet-50 text-violet-600 font-semibold border-l-4 border-violet-600'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            {link.icon}
            <span className="text-sm">{link.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="p-4 border-t border-gray-100">
        <button
          type="button"
          onClick={() => navigate('/settings')}
          className="flex items-center gap-3 px-3 py-2 mb-2 rounded-lg text-left w-full hover:bg-gray-50 transition-colors"
          aria-label="Open settings"
        >
          <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-white text-sm font-bold overflow-hidden shrink-0">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user?.name || 'User avatar'}
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{user?.name?.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg
          text-gray-500 hover:bg-gray-50 hover:text-red-500
          transition-colors w-full"
        >
          <MdLogout size={20} />
          <span className="text-sm">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;