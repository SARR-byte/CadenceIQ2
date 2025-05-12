import { useState } from 'react';
import { WeekDay, SequenceStage } from '../../types';
import ContactTable from './ContactTable';

const weekDays: WeekDay[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const sequenceStages: SequenceStage[] = ['First Email', 'Second Email', 'Phone/LinkedIn Connect', 'Breakup Email'];

const ContactGrid = () => {
  const [selectedDay, setSelectedDay] = useState<WeekDay>('Monday');
  const [selectedStage, setSelectedStage] = useState<SequenceStage>('First Email');
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Contact Management Spreadsheet</h1>
        <p className="text-gray-600">
          Track and manage your outreach campaigns efficiently
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="border-b border-gray-200">
          <div className="flex overflow-x-auto">
            {weekDays.map(day => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-6 py-3 text-sm font-medium ${
                  selectedDay === day
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>
        
        <div className="p-4">
          <div className="flex items-center space-x-4 mb-4">
            <label htmlFor="stage-filter" className="text-sm font-medium text-gray-700">
              Filter by stage:
            </label>
            <select
              id="stage-filter"
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value as SequenceStage)}
              className="mt-1 block w-64 py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              {sequenceStages.map(stage => (
                <option key={stage} value={stage}>
                  {stage}
                </option>
              ))}
            </select>
          </div>
          
          <ContactTable day={selectedDay} stage={selectedStage} />
        </div>
      </div>
    </div>
  );
};

export default ContactGrid;