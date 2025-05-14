import { useState, useEffect } from 'react';
import { useContacts } from '../../contexts/ContactContext';
import { WeekDay, SequenceStage } from '../../types';
import { FileSpreadsheet, Trash2 } from 'lucide-react';
import CSVImportModal from './CSVImportModal';
import CelebrationEffect from '../common/CelebrationEffect';
import SpreadsheetTable from '../common/SpreadsheetTable';

interface ContactTableProps {
  day: WeekDay;
  stage: SequenceStage;
  onStageChange: (stage: SequenceStage) => void;
}

const ContactTable = ({ day, stage, onStageChange }: ContactTableProps) => {
  const { filteredContacts, leadGoal, deleteContacts } = useContacts();
  const [contacts, setContacts] = useState(filteredContacts(day, stage));
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);
  
  const columns = [
    'Entity Name',
    'Primary Contact',
    'Email Address',
    'Phone Number',
    'Company LinkedIn',
    'Contact LinkedIn',
    'Contact Facebook',
    'Notes',
    'Insights',
    'Contact Attempt'
  ];

  useEffect(() => {
    setContacts(filteredContacts(day, stage));
  }, [day, stage, filteredContacts]);

  useEffect(() => {
    if (contacts.length > 0 && contacts.every(contact => contact.completed)) {
      setShowCelebration(true);
      const timer = setTimeout(() => {
        setShowCelebration(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [contacts]);

  const handleDeleteSelected = () => {
    deleteContacts(selectedContacts);
    setSelectedContacts([]);
  };

  const handleImportComplete = () => {
    setContacts(filteredContacts(day, stage));
    setShowImportModal(false);
  };

  const handleContactUpdate = (contactId: string, nextStage: SequenceStage) => {
    onStageChange(nextStage);
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {showCelebration && <CelebrationEffect />}
      
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button
            onClick={handleDeleteSelected}
            disabled={selectedContacts.length === 0}
            className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md focus:outline-none ${
              selectedContacts.length === 0 
                ? 'text-gray-400 bg-gray-200' 
                : 'text-white bg-red-600 hover:bg-red-700'
            }`}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete Selected
          </button>
          
          <button
            onClick={() => setShowImportModal(true)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
          >
            <FileSpreadsheet className="h-4 w-4 mr-1" />
            Import CSV
          </button>
        </div>
        
        <div className="text-sm text-gray-500">
          {contacts.length} / {leadGoal} rows
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <SpreadsheetTable 
          columns={columns}
          initialRows={10}
          onSave={(data) => console.log('Saved:', data)}
          onStageChange={handleContactUpdate}
        />
      </div>
      
      {showImportModal && (
        <CSVImportModal 
          day={day}
          onClose={() => setShowImportModal(false)}
          onComplete={handleImportComplete}
        />
      )}
    </div>
  );
};

export default ContactTable;