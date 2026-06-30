import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { MdPerson, MdLock, MdInfo, MdPhotoCamera } from 'react-icons/md';

const MAX_IMAGE_SIZE = 512;

const resizeImage = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const image = new Image();

      image.onload = () => {
        const canvas = document.createElement('canvas');
        const scale = Math.min(MAX_IMAGE_SIZE / image.width, MAX_IMAGE_SIZE / image.height, 1);
        const width = Math.round(image.width * scale);
        const height = Math.round(image.height * scale);

        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext('2d');
        if (!context) {
          reject(new Error('Unable to process image'));
          return;
        }

        context.drawImage(image, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };

      image.onerror = () => reject(new Error('Unable to load image'));
      image.src = reader.result;
    };

    reader.onerror = () => reject(new Error('Unable to read file'));
    reader.readAsDataURL(file);
  });

const Settings = () => {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    setName(user?.name || '');
    setEmail(user?.email || '');
    setAvatar(user?.avatar || '');
    setAvatarPreview(user?.avatar || '');
  }, [user]);

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    resizeImage(file)
      .then((compressedImage) => {
        if (typeof compressedImage === 'string') {
          setAvatar(compressedImage);
          setAvatarPreview(compressedImage);
        }
      })
      .catch(() => {
        toast.error('Could not process the image');
      });
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();

    try {
      setSavingProfile(true);
      await updateProfile({ name, email, avatar });
      toast.success('Profile updated! ✅');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSave = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    toast.success('Password updated! ✅');
  };

  const tabs = [
    { key: 'profile', label: 'Profile', icon: <MdPerson size={18} /> },
    { key: 'password', label: 'Password', icon: <MdLock size={18} /> },
    { key: 'about', label: 'About', icon: <MdInfo size={18} /> },
  ];

  return (
    <div className="space-y-6 max-w-3xl">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-400 text-sm mt-1">
          Manage your account settings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

        {/* Tabs */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3
        h-fit">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
              text-sm transition-colors mb-1
              ${activeTab === tab.key
                ? 'bg-violet-50 text-violet-600 font-semibold'
                : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="md:col-span-3 bg-white rounded-xl border border-gray-100
        shadow-sm p-6">

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Profile Information
              </h2>

              {/* Avatar */}
              <div className="flex items-center gap-4 mb-6 pb-6
              border-b border-gray-100">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-violet-600 overflow-hidden flex items-center justify-center text-white text-2xl font-bold">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Profile preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>{user?.name?.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-500 hover:text-violet-600 hover:border-violet-300 transition-colors"
                    aria-label="Upload profile picture"
                  >
                    <MdPhotoCamera size={14} />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 truncate">{user?.name}</p>
                  <p className="text-sm text-gray-400 truncate">{user?.email}</p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-2 text-sm font-medium text-violet-600 hover:text-violet-500"
                  >
                    Change photo
                  </button>
                </div>
              </div>

              <form onSubmit={handleProfileSave} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5
                    text-sm focus:outline-none focus:border-violet-400"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5
                    text-sm focus:outline-none focus:border-violet-400"
                  />
                </div>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="bg-violet-600 hover:bg-violet-500 text-white
                  px-6 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {savingProfile ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>
          )}

          {/* Password Tab */}
          {activeTab === 'password' && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Change Password
              </h2>
              <form onSubmit={handlePasswordSave} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5
                    text-sm focus:outline-none focus:border-violet-400"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5
                    text-sm focus:outline-none focus:border-violet-400"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5
                    text-sm focus:outline-none focus:border-violet-400"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-violet-600 hover:bg-violet-500 text-white
                  px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
                >
                  Update Password
                </button>
              </form>
            </div>
          )}

          {/* About Tab */}
          {activeTab === 'about' && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                About TaskHive
              </h2>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-violet-50
                rounded-xl">
                  <div>
                    <p className="font-semibold text-gray-900">TaskHive</p>
                    <p className="text-sm text-gray-500">
                      Smart team task management
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    { label: 'Version', value: '1.0.0' },
                    { label: 'Built with', value: 'React + Node.js + MongoDB' },
                  ].map(item => (
                    <div key={item.label}
                      className="flex items-center justify-between py-3
                      border-b border-gray-100">
                      <span className="text-sm text-gray-500">{item.label}</span>
                      <span className="text-sm font-medium text-gray-900">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500 leading-relaxed">
                    TaskHive is a smart project management tool designed to
                    prevent team burnout. It features intelligent workload
                    tracking and an auto-reassign algorithm that balances
                    tasks based on member capacity.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;