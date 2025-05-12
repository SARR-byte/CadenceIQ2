import { useState } from 'react';
import { Contact } from '../../types';
import { Lightbulb } from 'lucide-react';
import { useContacts } from '../../contexts/ContactContext';
import InsightsModal from './InsightsModal';

interface ContactRowProps {
  contact: Contact;
  isSelected: boolean;
  onSelect: () => void;
}

const ContactRow = ({ contact, isSelected, onSelect }: ContactRowProps) => {
  const { markContactCompleted, generateInsights } = useContacts();
  const [showInsights, setShowInsights] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleToggleComplete = () => {
    markContactCompleted(contact.id);
  };

  const handleShowInsights = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setShowInsights(true);
    
    if (!contact.socialProfile.companyInfo && !contact.socialProfile.personalInfo) {
      setIsGenerating(true);
      try {
        await generateInsights(contact.id);
      } catch (error) {
        console.error('Error generating insights:', error);
      }
      setIsGenerating(false);
    }
  };

  return (
    <>
      <tr className="border-b border-gray-200 hover:bg-gray-50">
        <td className="py-3 px-2 text-center">
          <input 
            type="checkbox" 
            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            checked={isSelected}
            onChange={onSelect}
          />
        </td>
        <td className="py-3 px-3">{contact.entityName}</td>
        <td className="py-3 px-3">{contact.primaryContact}</td>
        <td className="py-3 px-3">{contact.emailAddress}</td>
        <td className="py-3 px-3">{contact.phoneNumber}</td>
        <td className="py-3 px-3">
          {contact.companyLinkedIn && (
            <a 
              href={contact.companyLinkedIn}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              View Profile
            </a>
          )}
        </td>
        <td className="py-3 px-3">
          {contact.contactLinkedIn && (
            <a 
              href={contact.contactLinkedIn}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              View Profile
            </a>
          )}
        </td>
        <td className="py-3 px-3">
          {contact.contactFacebook && (
            <a 
              href={contact.contactFacebook}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              View Profile
            </a>
          )}
        </td>
        <td className="py-3 px-3 max-w-xs relative">
          <div className="flex items-start">
            <div className="flex-grow truncate">{contact.notes}</div>
            <button
              onClick={handleShowInsights}
              className={`ml-2 p-2 rounded-full transition-colors ${
                isGenerating 
                  ? 'bg-amber-100 text-amber-600 animate-pulse'
                  : contact.socialProfile.companyInfo || contact.socialProfile.personalInfo
                    ? 'bg-amber-50 text-amber-500 hover:bg-amber-100'
                    : 'text-amber-500 hover:bg-amber-50'
              }`}
              aria-label="View insights"
              title="View insights"
              disabled={isGenerating}
            >
              <Lightbulb className="w-5 h-5" />
            </button>
          </div>
        </td>
        <td className="py-3 px-3 text-center">
          <div className="relative inline-block w-10 align-middle select-none">
            <input
              type="checkbox"
              id={`toggle-${contact.id}`}
              checked={contact.completed}
              onChange={handleToggleComplete}
              className="sr-only"
            />
            <label
              htmlFor={`toggle-${contact.id}`}
              className={`block overflow-hidden h-6 rounded-full cursor-pointer transition-colors ${
                contact.completed ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`block h-6 w-6 rounded-full bg-white shadow transform transition-transform ${
                  contact.completed ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </label>
          </div>
        </td>
      </tr>
      
      {showInsights && (
        <InsightsModal 
          socialProfile={contact.socialProfile}
          onClose={() => setShowInsights(false)}
          onRefresh={async () => {
            setIsGenerating(true);
            try {
              await generateInsights(contact.id);
            } finally {
              setIsGenerating(false);
            }
          }}
        />
      )}
    </>
  );
};

export default ContactRow;