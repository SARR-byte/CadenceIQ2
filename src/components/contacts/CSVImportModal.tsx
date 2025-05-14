import { useState, useCallback } from 'react';
import { useContacts } from '../../contexts/ContactContext';
import { WeekDay } from '../../types';
import { Upload, X, FileSpreadsheet, Check, AlertCircle } from 'lucide-react';
import Papa from 'papaparse';
import { toast } from 'react-toastify';

interface CSVImportModalProps {
  day: WeekDay;
  onClose: () => void;
  onComplete: () => void;
}

interface CSVRow {
  [key: string]: string;
}

const CSVImportModal = ({ day, onClose, onComplete }: CSVImportModalProps) => {
  const { importContacts } = useContacts();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<CSVRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [importStep, setImportStep] = useState<'upload' | 'preview' | 'complete'>('upload');
  const [isProcessing, setIsProcessing] = useState(false);

  const validateHeaders = (headers: string[]): boolean => {
    const requiredFields = ['Entity Name', 'Primary Contact', 'Email Address'];
    const normalizedHeaders = headers.map(h => h.toLowerCase().trim());
    return requiredFields.every(field => 
      normalizedHeaders.includes(field.toLowerCase()) ||
      normalizedHeaders.includes(field.toLowerCase().replace(' ', '_'))
    );
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.type === 'text/csv' || droppedFile?.name.endsWith('.csv')) {
      handleFileSelection(droppedFile);
    } else {
      setError('Please drop a valid CSV file');
    }
  }, []);

  const handleFileSelection = (selectedFile: File) => {
    setFile(selectedFile);
    setError(null);
    
    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          setError('Error parsing CSV file: ' + results.errors[0].message);
          return;
        }

        if (!validateHeaders(results.meta.fields || [])) {
          setError('CSV must include Entity Name, Primary Contact, and Email Address columns');
          return;
        }

        setPreview(results.data as CSVRow[]);
        setImportStep('preview');
      },
      error: (error) => {
        setError('Error reading CSV file: ' + error.message);
      }
    });
  };

  const handleImport = async () => {
    try {
      setIsProcessing(true);
      setError(null);

      const contacts = preview.map(row => ({
        entityName: row['Entity Name'] || row['ENTITY NAME'] || row['entity_name'] || '',
        primaryContact: row['Primary Contact'] || row['PRIMARY CONTACT'] || row['primary_contact'] || '',
        emailAddress: row['Email Address'] || row['EMAIL ADDRESS'] || row['email_address'] || '',
        phoneNumber: row['Phone Number'] || row['PHONE NUMBER'] || row['phone_number'] || '',
        companyLinkedIn: row['Company LinkedIn'] || row['COMPANY LINKEDIN'] || row['company_linkedin'] || '',
        contactLinkedIn: row['Contact LinkedIn'] || row['CONTACT LINKEDIN'] || row['contact_linkedin'] || '',
        contactFacebook: row['Contact Facebook'] || row['CONTACT FACEBOOK'] || row['contact_facebook'] || '',
        notes: row['Notes'] || row['NOTES'] || row['notes'] || '',
        day
      }));

      if (!contacts.every(c => c.entityName && c.primaryContact && c.emailAddress)) {
        throw new Error('All contacts must have an entity name, primary contact, and email address');
      }

      await importContacts(contacts);
      setImportStep('complete');
      toast.success(`Successfully imported ${contacts.length} contacts`);
      onComplete();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error importing contacts';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-xl sm:w-full">
          <div className="flex justify-between items-center px-6 py-4 bg-gray-50 border-b">
            <h3 className="text-lg font-medium text-gray-900">
              Import Contacts from CSV
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="px-6 py-4">
            {importStep === 'upload' && (
              <div 
                className="space-y-4"
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
              >
                <div className="text-center p-6 border-2 border-dashed border-gray-300 rounded-md">
                  <FileSpreadsheet className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-2 text-sm text-gray-600">
                    <label htmlFor="csv-upload" className="cursor-pointer font-medium text-charcoal-600 hover:text-charcoal-500">
                      Upload a CSV file
                      <input
                        id="csv-upload"
                        name="csv-upload"
                        type="file"
                        accept=".csv"
                        className="sr-only"
                        onChange={(e) => e.target.files?.[0] && handleFileSelection(e.target.files[0])}
                      />
                    </label>
                    <p className="mt-1">or drag and drop</p>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    CSV file should include: Entity Name, Primary Contact, Email Address
                  </p>
                  {error && (
                    <div className="mt-2 flex items-center text-sm text-red-600">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {error}
                    </div>
                  )}
                </div>
                
                <div className="text-sm text-gray-500">
                  <p>Required columns:</p>
                  <ul className="list-disc pl-5 mt-1">
                    <li>Entity Name</li>
                    <li>Primary Contact</li>
                    <li>Email Address</li>
                  </ul>
                  <p className="mt-2">Optional columns:</p>
                  <ul className="list-disc pl-5 mt-1">
                    <li>Phone Number</li>
                    <li>Company LinkedIn</li>
                    <li>Contact LinkedIn</li>
                    <li>Contact Facebook</li>
                    <li>Notes</li>
                  </ul>
                </div>
              </div>
            )}
            
            {importStep === 'preview' && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Preview of data to be imported ({preview.length} contacts)
                </p>
                
                <div className="max-h-64 overflow-y-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {preview.length > 0 && Object.keys(preview[0]).map((header, index) => (
                          <th 
                            key={index}
                            className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {preview.slice(0, 5).map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          {Object.values(row).map((value, cellIndex) => (
                            <td key={cellIndex} className="px-3 py-2 text-xs text-gray-800 truncate max-w-xs">
                              {value}
                            </td>
                          ))}
                        </tr>
                      ))}
                      {preview.length > 5 && (
                        <tr>
                          <td 
                            colSpan={Object.keys(preview[0]).length} 
                            className="px-3 py-2 text-xs text-gray-500 text-center"
                          >
                            ... and {preview.length - 5} more rows
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                
                {error && (
                  <div className="flex items-center text-sm text-red-600">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {error}
                  </div>
                )}
              </div>
            )}
            
            {importStep === 'complete' && (
              <div className="text-center py-6">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                  <Check className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="mt-2 text-lg font-medium text-gray-900">Import successful!</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {preview.length} contacts were imported successfully.
                </p>
              </div>
            )}
          </div>
          
          <div className="px-6 py-4 bg-gray-50 text-right">
            {importStep === 'upload' && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none"
              >
                Cancel
              </button>
            )}
            
            {importStep === 'preview' && (
              <>
                <button
                  type="button"
                  onClick={() => setImportStep('upload')}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none mr-2"
                  disabled={isProcessing}
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleImport}
                  disabled={isProcessing}
                  className="px-4 py-2 text-sm font-medium text-white bg-charcoal-600 border border-transparent rounded-md shadow-sm hover:bg-charcoal-700 focus:outline-none inline-flex items-center"
                >
                  {isProcessing ? (
                    <>
                      <Upload className="h-4 w-4 mr-1 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-1" />
                      Import Contacts
                    </>
                  )}
                </button>
              </>
            )}
            
            {importStep === 'complete' && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-white bg-charcoal-600 border border-transparent rounded-md shadow-sm hover:bg-charcoal-700 focus:outline-none"
              >
                Done
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CSVImportModal;