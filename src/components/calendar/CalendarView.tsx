import { useState } from 'react';
import { useContacts } from '../../contexts/ContactContext';
import { format, addDays, subDays, startOfMonth, endOfMonth, isSameMonth, isSameDay, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

const CalendarView = () => {
  const { calendarEvents } = useContacts();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const prevDay = () => {
    setCurrentDate(subDays(currentDate, 1));
  };
  
  const nextDay = () => {
    setCurrentDate(addDays(currentDate, 1));
  };
  
  const prevMonth = () => {
    setCurrentMonth(subDays(startOfMonth(currentMonth), 1));
  };
  
  const nextMonth = () => {
    setCurrentMonth(addDays(endOfMonth(currentMonth), 1));
  };
  
  // Get the days in the current month
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const startDate = new Date(monthStart);
  const endDate = new Date(monthEnd);
  
  // Adjust start date to include the week's beginning
  startDate.setDate(startDate.getDate() - startDate.getDay());
  
  // Adjust end date to include the week's end
  endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));
  
  // Create an array of dates for the calendar
  const dateArray = [];
  let day = new Date(startDate);
  while (day <= endDate) {
    dateArray.push(new Date(day));
    day.setDate(day.getDate() + 1);
  }
  
  // Get events for the current day
  const todaysEvents = calendarEvents.filter(event => {
    const eventDate = typeof event.date === 'string' ? parseISO(event.date) : event.date;
    return isSameDay(eventDate, currentDate);
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Follow-up Calendar</h1>
      <p className="text-gray-600">
        View and manage your follow-up schedule based on the 7-day sequence
      </p>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg shadow overflow-hidden">
          <div className="flex justify-between items-center p-4 border-b">
            <button
              onClick={prevDay}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>
            
            <h2 className="text-lg font-semibold text-gray-900">
              {format(currentDate, 'MMMM d, yyyy')}
            </h2>
            
            <button
              onClick={nextDay}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </button>
          </div>
          
          <div className="divide-y divide-gray-200">
            <div className="p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Follow-ups for {format(currentDate, 'MMMM d, yyyy')}
              </h3>
              
              {todaysEvents.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No follow-ups scheduled for this day
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {todaysEvents.map(event => (
                    <li key={event.id} className="py-3">
                      <div className="flex items-start">
                        <div className={`mt-1 flex-shrink-0 w-2 h-2 rounded-full ${
                          event.stage === 'First Email' ? 'bg-blue-500' :
                          event.stage === 'Second Email' ? 'bg-green-500' :
                          event.stage === 'Phone/LinkedIn Connect' ? 'bg-purple-500' :
                          'bg-red-500'
                        }`} />
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">{event.entityName}</p>
                          <p className="text-sm text-gray-500">{event.stage}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <button
              onClick={prevMonth}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>
            
            <h2 className="text-base font-medium text-gray-900">
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
            
            <button
              onClick={nextMonth}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </button>
          </div>
          
          <div className="p-4">
            <div className="grid grid-cols-7 gap-px">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                <div key={day} className="text-center p-1 text-xs font-medium text-gray-500">
                  {day}
                </div>
              ))}
              
              {dateArray.map((date, i) => {
                const dayEvents = calendarEvents.filter(event => {
                  const eventDate = typeof event.date === 'string' ? parseISO(event.date) : event.date;
                  return isSameDay(eventDate, date);
                });
                
                return (
                  <button
                    key={i}
                    onClick={() => setCurrentDate(date)}
                    className={`p-2 text-center text-sm ${
                      !isSameMonth(date, currentMonth) 
                        ? 'text-gray-400' 
                        : isSameDay(date, currentDate)
                          ? 'bg-blue-100 text-blue-800 font-semibold rounded'
                          : 'text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <span>{date.getDate()}</span>
                    {dayEvents.length > 0 && (
                      <div className="mt-1 h-1 w-1 mx-auto rounded-full bg-blue-500" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            About The Calendar
          </h3>
        </div>
        
        <div className="p-4">
          <p className="text-sm text-gray-600 mb-4">
            This calendar automatically schedules your follow-ups based on when contacts were marked as attempted:
          </p>
          
          <ul className="space-y-2 text-sm text-gray-600 ml-5 list-disc">
            <li>Second Emails: 7 days from today</li>
            <li>Phone/LinkedIn: 14 days from today</li>
            <li>Break-up Emails: 21 days from today</li>
          </ul>
          
          <p className="mt-4 text-sm text-gray-600">
            You can export this calendar to integrate with your preferred calendar app.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;