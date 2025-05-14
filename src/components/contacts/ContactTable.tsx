import { useState, useEffect } from 'react';
import { useContacts } from '../../contexts/ContactContext';
import { WeekDay, SequenceStage, Contact } from '../../types';
import { FileSpreadsheet, Trash2 } from 'lucide-react';
import CSVImportModal from './CSVImportModal';
import CelebrationEffect from '../common/CelebrationEffect';
import { DataTable } from '../common/DataTable';
import { ColumnDef } from '@tanstack/react-table';

interface ContactTableProps {
  day: WeekDay;
  stage: SequenceStage;
}

const ContactTable = ({ day, stage }: ContactTableProps) => {
  const { filteredContacts, leadGoal, deleteContacts } = useContacts();
  const [contacts, setContacts] = useState(filteredContacts(day, stage));
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);

  const columns: ColumnDef<Contact>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllRowsSelected()}
          onChange={table.getToggleAllRowsSelectedHandler()}
          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
        />
      ),
      size: 50,
    },
    {
      accessorKey: 'entityName',
      header: 'Entity Name',
      size: 200,
    },
    {
      accessorKey: 'primaryContact',
      header: 'Primary Contact',
      size: 180,
    },
    {
      accessorKey: 'emailAddress',
      header: 'Email Address',
      size: 220,
    },
    {
      accessorKey: 'phoneNumber',
      header: 'Phone Number',
      size: 140,
    },
    {
      accessorKey: 'companyLinkedIn',
      header: 'Company LinkedIn',
      size: 160,
      cell: ({ getValue }) => {
        const value = getValue() as string;
        return value ? (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            View Profile
          </a>
        ) : null;
      },
    },
    {
      accessorKey: 'contactLinkedIn',
      header: 'Contact LinkedIn',
      size: 160,
      cell: ({ getValue }) => {
        const value = getValue() as string;
        return value ? (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            View Profile
          </a>
        ) : null;
      },
    },
    {
      accessorKey: 'contactFacebook',
      header: 'Contact Facebook',
      size: 160,
      cell: ({ getValue }) => {
        const value = getValue() as string;
        return value ? (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            View Profile
          </a>
        ) : null;
      },
    },
    {
      accessorKey: 'notes',
      header: 'Notes',
      size: 200,
    },
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

      <div className="p-4">
        <DataTable
          data={contacts}
          columns={columns}
          frozenColumns={['select', 'entityName']}
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