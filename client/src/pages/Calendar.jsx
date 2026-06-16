import { useEffect, useState } from 'react';
import { useTeam } from '../context/TeamContext';
import { getTasksByTeam } from '../utils/api';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { MdKeyboardArrowDown } from 'react-icons/md';

const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

const MONTHS = ['January','February','March','April','May','June',
  'July','August','September','October','November','December'];
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 30 }, (_, i) => currentYear - 29 + i);

const Calendar = () => {
  const { teams, fetchTeams, currentTeam, fetchTeamById } = useTeam();
  const [tasks, setTasks] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [date, setDate] = useState(new Date());
  const [view, setView] = useState('month');
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => { fetchTeams(); }, []);
  useEffect(() => {
    if (teams.length > 0 && !currentTeam) fetchTeamById(teams[0]._id);
  }, [teams]);
  useEffect(() => {
    if (currentTeam) loadTasks();
  }, [currentTeam]);

  const loadTasks = async () => {
    try {
      const { data } = await getTasksByTeam(currentTeam._id);
      setTasks(data);
    } catch (error) { console.error(error); }
  };

  const events = tasks
    .filter(task => task.dueDate)
    .map(task => ({
      id: task._id,
      title: task.title,
      start: new Date(task.dueDate),
      end: new Date(task.dueDate),
      resource: task
    }));

  const eventStyleGetter = (event) => {
    const priority = event.resource?.priority;
    let backgroundColor = '#8b5cf6';
    if (priority === 'high') backgroundColor = '#ef4444';
    if (priority === 'medium') backgroundColor = '#f59e0b';
    if (priority === 'low') backgroundColor = '#10b981';
    return {
      style: {
        backgroundColor,
        borderRadius: '6px',
        border: 'none',
        color: 'white',
        fontSize: '11px',
        padding: '1px 5px'
      }
    };
  };

  // Custom toolbar — fixes Today/Back/Next + adds month/year picker
  const CustomToolbar = ({ onNavigate, onView, view: currentView, date: toolbarDate }) => {
    const month = toolbarDate.getMonth();
    const year = toolbarDate.getFullYear();

    return (
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">

        {/* Left — navigation */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onNavigate('TODAY')}
            className="px-3 py-1.5 text-xs font-medium border border-gray-200
            rounded-lg hover:bg-violet-50 hover:text-violet-600 hover:border-violet-300
            transition-colors"
          >
            Today
          </button>
          <button
            onClick={() => onNavigate('PREV')}
            className="px-3 py-1.5 text-xs font-medium border border-gray-200
            rounded-lg hover:bg-gray-50 transition-colors"
          >
            ‹ Back
          </button>
          <button
            onClick={() => onNavigate('NEXT')}
            className="px-3 py-1.5 text-xs font-medium border border-gray-200
            rounded-lg hover:bg-gray-50 transition-colors"
          >
            Next ›
          </button>
        </div>

        {/* Center — clickable month/year picker */}
        <div className="relative">
          <button
            onClick={() => setShowPicker(!showPicker)}
            className="flex items-center gap-1 font-semibold text-gray-900
            hover:text-violet-600 px-3 py-1.5 rounded-lg hover:bg-violet-50
            transition-colors text-sm"
          >
            {MONTHS[month]} {year}
            <MdKeyboardArrowDown size={16} className={`transition-transform
            ${showPicker ? 'rotate-180' : ''}`} />
          </button>

          {/* Picker Dropdown */}
          {showPicker && (
            <div className="absolute top-10 left-1/2 -translate-x-1/2 z-50
            bg-white rounded-2xl shadow-xl border border-gray-100 p-4 w-64">

              {/* Year */}
              <p className="text-xs font-semibold text-gray-400 uppercase
              tracking-wider mb-2">Year</p>
              <div className="grid grid-cols-4 gap-1 mb-4 max-h-28 overflow-y-auto">
                {YEARS.map(y => (
                  <button
                    key={y}
                    onClick={() => {
                      const newDate = new Date(toolbarDate);
                      newDate.setFullYear(y);
                      setDate(newDate);
                    }}
                    className={`text-xs py-1.5 rounded-lg transition-colors
                    ${y === year
                      ? 'bg-violet-600 text-white font-semibold'
                      : 'hover:bg-violet-50 text-gray-700'
                    }`}
                  >
                    {y}
                  </button>
                ))}
              </div>

              {/* Month */}
              <p className="text-xs font-semibold text-gray-400 uppercase
              tracking-wider mb-2">Month</p>
              <div className="grid grid-cols-3 gap-1">
                {MONTHS.map((m, i) => (
                  <button
                    key={m}
                    onClick={() => {
                      const newDate = new Date(toolbarDate);
                      newDate.setMonth(i);
                      setDate(newDate);
                      setShowPicker(false);
                    }}
                    className={`text-xs py-1.5 rounded-lg transition-colors
                    ${i === month
                      ? 'bg-violet-600 text-white font-semibold'
                      : 'hover:bg-violet-50 text-gray-700'
                    }`}
                  >
                    {m.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right — view switcher */}
        <div className="flex items-center gap-1">
          {['month', 'week', 'day'].map(v => (
            <button
              key={v}
              onClick={() => onView(v)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg
              transition-colors capitalize
              ${currentView === v
                ? 'bg-violet-600 text-white'
                : 'border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
          <p className="text-gray-400 text-sm mt-1">
            Manage your schedule and deadlines.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <span className="text-xs text-gray-500">High</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
            <span className="text-xs text-gray-500">Medium</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
            <span className="text-xs text-gray-500">Low</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Calendar */}
        <div className="md:col-span-2 bg-white rounded-xl border border-gray-100
        shadow-sm p-5">
          <BigCalendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 420 }}
            eventPropGetter={eventStyleGetter}
            onSelectEvent={(event) => setSelectedEvent(event.resource)}
            view={view}
            onView={setView}
            date={date}
            onNavigate={setDate}
            components={{ toolbar: CustomToolbar }}
            popup
          />
        </div>

        {/* Task Detail Panel */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Task Details</h3>

          {!selectedEvent ? (
            <div className="text-center py-10">
              <div className="text-4xl mb-3">📅</div>
              <p className="text-gray-500 font-medium text-sm">
                Click a task on the calendar
              </p>
              <p className="text-gray-300 text-xs mt-1">
                to see its details here
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-400 mb-1">Task</p>
                <p className="font-semibold text-gray-900">{selectedEvent.title}</p>
              </div>

              {selectedEvent.description && (
                <div>
                  <p className="text-xs text-gray-400 mb-1">Description</p>
                  <p className="text-sm text-gray-600">{selectedEvent.description}</p>
                </div>
              )}

              <div>
                <p className="text-xs text-gray-400 mb-1">Priority</p>
                <span className={`text-xs px-2 py-1 rounded-full font-medium
                ${selectedEvent.priority === 'high' ? 'bg-red-50 text-red-600'
                  : selectedEvent.priority === 'medium' ? 'bg-yellow-50 text-yellow-600'
                  : 'bg-green-50 text-green-600'}`}>
                  {selectedEvent.priority}
                </span>
              </div>

              <div>
                <p className="text-xs text-gray-400 mb-1">Status</p>
                <span className={`text-xs px-2 py-1 rounded-full font-medium
                ${selectedEvent.status === 'completed' ? 'bg-green-50 text-green-600'
                  : selectedEvent.status === 'in-progress' ? 'bg-blue-50 text-blue-600'
                  : 'bg-gray-50 text-gray-500'}`}>
                  {selectedEvent.status}
                </span>
              </div>

              {selectedEvent.assignedTo && (
                <div>
                  <p className="text-xs text-gray-400 mb-1">Assigned To</p>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-violet-600
                    flex items-center justify-center text-white text-xs font-bold">
                      {selectedEvent.assignedTo.name?.charAt(0).toUpperCase()}
                    </div>
                    <p className="text-sm text-gray-700">
                      {selectedEvent.assignedTo.name}
                    </p>
                  </div>
                </div>
              )}

              <div>
                <p className="text-xs text-gray-400 mb-1">Due Date</p>
                <p className="text-sm text-gray-700">
                  {new Date(selectedEvent.dueDate).toLocaleDateString('en-US', {
                    weekday: 'long', year: 'numeric',
                    month: 'long', day: 'numeric'
                  })}
                </p>
              </div>

              <button
                onClick={() => setSelectedEvent(null)}
                className="w-full border border-gray-200 text-gray-500
                py-2 rounded-lg text-sm hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Calendar;