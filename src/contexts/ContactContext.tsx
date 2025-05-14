import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { addDays } from 'date-fns';
import { generateInsights } from '../utils/api';
import { Contact, WeekDay, SequenceStage, CalendarEvent, SocialProfile } from '../types';

interface ContactContextType {
  contacts: Contact[];
  filteredContacts: (day: WeekDay, stage: SequenceStage) => Contact[];
  addContact: (contact: Omit<Contact, 'id' | 'completed' | 'stage'>) => void;
  deleteContact: (id: string) => void;
  deleteContacts: (ids: string[]) => void;
  updateContact: (contact: Contact) => void;
  markContactCompleted: (id: string) => void;
  importContacts: (contacts: Omit<Contact, 'id' | 'completed' | 'stage'>[]) => Promise<void>;
  leadGoal: number;
  setLeadGoal: (goal: number) => void;
  calendarEvents: CalendarEvent[];
  getContactsStats: () => Record<SequenceStage, number>;
  generateInsights: (contactId: string) => Promise<void>;
}

const ContactContext = createContext<ContactContextType | undefined>(undefined);

const nextStageMap: Record<SequenceStage, SequenceStage> = {
  'First Email': 'Second Email',
  'Second Email': 'Phone/LinkedIn Connect',
  'Phone/LinkedIn Connect': 'Breakup Email',
  'Breakup Email': 'Breakup Email',
};

const stageDaysMap: Record<SequenceStage, number> = {
  'First Email': 0,
  'Second Email': 7,
  'Phone/LinkedIn Connect': 14,
  'Breakup Email': 21,
};

export const ContactProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [contacts, setContacts] = useState<Contact[]>(() => {
    const savedContacts = localStorage.getItem('contacts');
    return savedContacts ? JSON.parse(savedContacts) : [];
  });

  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(() => {
    const savedEvents = localStorage.getItem('calendarEvents');
    return savedEvents ? JSON.parse(savedEvents) : [];
  });

  const [leadGoal, setLeadGoal] = useState<number>(() => {
    const savedGoal = localStorage.getItem('leadGoal');
    return savedGoal ? parseInt(savedGoal, 10) : 10;
  });

  useEffect(() => {
    localStorage.setItem('contacts', JSON.stringify(contacts));
  }, [contacts]);

  useEffect(() => {
    localStorage.setItem('calendarEvents', JSON.stringify(calendarEvents));
  }, [calendarEvents]);

  useEffect(() => {
    localStorage.setItem('leadGoal', leadGoal.toString());
  }, [leadGoal]);

  const filteredContacts = (day: WeekDay, stage: SequenceStage) => {
    return contacts.filter(
      (contact) => contact.day === day && contact.stage === stage
    );
  };

  const addContact = (contact: Omit<Contact, 'id' | 'completed' | 'stage'>) => {
    const newContact: Contact = {
      ...contact,
      id: uuidv4(),
      completed: false,
      stage: 'First Email',
      lastActivity: undefined,
      nextActivity: new Date(),
      socialProfile: {
        companyInfo: null,
        personalInfo: null,
        lastUpdated: null
      }
    };
    
    setContacts((prev) => [...prev, newContact]);
    addCalendarEvent(newContact);
  };

  const deleteContact = (id: string) => {
    setContacts((prev) => prev.filter((contact) => contact.id !== id));
    setCalendarEvents((prev) => prev.filter((event) => event.contactId !== id));
  };

  const deleteContacts = (ids: string[]) => {
    setContacts((prev) => prev.filter((contact) => !ids.includes(contact.id)));
    setCalendarEvents((prev) => prev.filter((event) => !ids.includes(event.contactId)));
  };

  const updateContact = (updatedContact: Contact) => {
    setContacts((prev) =>
      prev.map((contact) =>
        contact.id === updatedContact.id ? updatedContact : contact
      )
    );
  };

  const addCalendarEvent = (contact: Contact) => {
    const today = new Date();
    const nextDate = addDays(today, stageDaysMap[contact.stage]);
    
    const newEvent: CalendarEvent = {
      id: uuidv4(),
      contactId: contact.id,
      entityName: contact.entityName,
      stage: contact.stage,
      date: nextDate,
      completed: false,
    };
    
    setCalendarEvents((prev) => [...prev, newEvent]);
  };

  const markContactCompleted = (id: string) => {
    setContacts((prev) => {
      return prev.map((contact) => {
        if (contact.id === id) {
          if (contact.stage === 'Breakup Email') {
            return { ...contact, completed: true };
          }
          
          const nextStage = nextStageMap[contact.stage];
          const today = new Date();
          const nextActivityDate = addDays(today, stageDaysMap[nextStage] - stageDaysMap[contact.stage]);
          
          const newEvent: CalendarEvent = {
            id: uuidv4(),
            contactId: contact.id,
            entityName: contact.entityName,
            stage: nextStage,
            date: nextActivityDate,
            completed: false,
          };
          
          setCalendarEvents((prev) => [
            ...prev.filter(e => !(e.contactId === id && !e.completed)),
            newEvent
          ]);
          
          return {
            ...contact,
            stage: nextStage,
            completed: false,
            lastActivity: today,
            nextActivity: nextActivityDate,
          };
        }
        return contact;
      });
    });
  };

  const importContacts = async (newContacts: Omit<Contact, 'id' | 'completed' | 'stage'>[]) => {
    const contactsToAdd = newContacts.map((contact) => ({
      ...contact,
      id: uuidv4(),
      completed: false,
      stage: 'First Email' as SequenceStage,
      lastActivity: undefined,
      nextActivity: new Date(),
      socialProfile: {
        companyInfo: null,
        personalInfo: null,
        lastUpdated: null
      }
    }));
    
    setContacts((prev) => [...prev, ...contactsToAdd]);
    
    contactsToAdd.forEach(contact => {
      addCalendarEvent(contact);
    });
  };

  const getContactsStats = () => {
    const stats: Record<SequenceStage, number> = {
      'First Email': 0,
      'Second Email': 0,
      'Phone/LinkedIn Connect': 0,
      'Breakup Email': 0
    };
    
    contacts.forEach(contact => {
      stats[contact.stage]++;
    });
    
    return stats;
  };

  const generateInsights = async (contactId: string) => {
    try {
      const contact = contacts.find(c => c.id === contactId);
      if (!contact) {
        throw new Error('Contact not found. The contact may have been deleted or is no longer available.');
      }

      if (!contact.companyLinkedIn && !contact.contactLinkedIn && !contact.contactFacebook) {
        throw new Error('No social profiles available for analysis. Please add at least one social profile link.');
      }

      const insights = await generateInsights({
        linkedin: contact.contactLinkedIn || contact.companyLinkedIn,
        facebook: contact.contactFacebook
      });

      const updatedContact = {
        ...contact,
        socialProfile: insights
      };

      updateContact(updatedContact);
      
    } catch (error) {
      console.error('Error generating insights:', error);
      throw error instanceof Error ? error : new Error('An unexpected error occurred while generating insights');
    }
  };

  return (
    <ContactContext.Provider
      value={{
        contacts,
        filteredContacts,
        addContact,
        deleteContact,
        deleteContacts,
        updateContact,
        markContactCompleted,
        importContacts,
        leadGoal,
        setLeadGoal,
        calendarEvents,
        getContactsStats,
        generateInsights
      }}
    >
      {children}
    </ContactContext.Provider>
  );
};

export const useContacts = () => {
  const context = useContext(ContactContext);
  if (context === undefined) {
    throw new Error('useContacts must be used within a ContactProvider');
  }
  return context;
};