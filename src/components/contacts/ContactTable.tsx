import { useState, useEffect } from 'react';
import { useContacts } from '../../contexts/ContactContext';
import { WeekDay, SequenceStage } from '../../types';
import ContactRow from './ContactRow';
import AddContactModal from './AddContactModal';
import { FileSpreadsheet, Trash2 } from 'lucide-react';
import CSVImportModal from './CSVImportModal';
import CelebrationEffect from '../common/CelebrationEffect';
import SpreadsheetTable from '../common/SpreadsheetTable';

interface ContactTableProps {
  day: WeekDay;
  stage: SequenceStage;
}

const ContactTable = ({ day, stage }: ContactTableProps) => {
  const { filteredContacts, leadGoal, deleteContacts } = useContacts();
  const contacts = filteredContacts(day, stage);
  
  const [showAddModal, setShowAddModal] = useState(false);
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
    if (contacts.length > 0 && contacts.every(contact => contact.completed)) {
      setShowCelebration(true);
      
      const timer = setTimeout(() => {
        setShowCelebration(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [contacts]);

  const handleSelectContact = (id: string) => {
    setSelectedContacts(prev => 
      prev.includes(id) 
        ? prev.filter(contactId => contactId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedContacts.length === contacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(contacts.map(contact => contact.id));
    }
  };

  const handleDeleteSelected = () => {
    deleteContacts(selectedContacts);
    setSelectedContacts([]);
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
        />
      </div>
      
      {showAddModal && (
        <AddContactModal 
          day={day}
          onClose={() => setShowAddModal(false)}
        />
      )}
      
      {showImportModal && (
        <CSVImportModal 
          day={day}
          onClose={() => setShowImportModal(false)}
        />
      )}
    </div>
  );
};

export default ContactTable;