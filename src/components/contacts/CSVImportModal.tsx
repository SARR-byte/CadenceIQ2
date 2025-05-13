import { useState } from 'react';
import { useContacts } from '../../contexts/ContactContext';
import { WeekDay } from '../../types';
import { Upload, X, FileSpreadsheet, Check } from 'lucide-react';

interface CSVImportModalProps {
  day: WeekDay;
  onClose: () => void;
  onComplete: () => void;
}

const CSVImportModal = ({ day, onClose, onComplete }: CSVImportModalProps) => {
  const { importContacts } = useContacts();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<Array<Record<string, string>>>([]);
  const [error, setError] = useState<string | null>(null);
  const [importStep, setImportStep] = useState<'upload' | 'preview' | 'complete'>('upload');
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    
    if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
      setError('Please select a valid CSV file');
      return;
    }
    
    setFile(selectedFile);
    setError(null);
    parseCSV(selectedFile);
  };
  
  const parseCSV = (csvFile: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csv = e.target?.result as string;
        const lines = csv.split('\n');
        
        const headers = lines[0].split(',').map(header => 
          header.trim().replace(/^"(.*)"$/, '$1')
        );
        
        const parsedData = lines.slice(1).filter(line => line.trim()).map(line => {
          const values = line.split(',').map(value => 
            value.trim().replace(/^"(.*)"$/, '$1')
          );
          
          const row: Record<string, string> = {};
          headers.forEach((header, index) => {
            row[header] = values[index] || '';
          });
          
          return row;
        });
        
        setPreview(parsedData);
        setImportStep('preview');
      } catch (err) {
        setError('Error parsing CSV file. Please check the format.');
      }
    };
    
    reader.onerror = () => {
      setError('Error reading the file');
    };
    
    reader.readAsText(csvFile);
  };
  
  const handleImport = async () => {
    try {
      const contacts = preview.map(row => ({
        entityName: row['Entity Name'] || row['ENTITY NAME'] || row['Company'] || '',
        primaryContact: row['Primary Contact'] || row['PRIMARY CONTACT'] || row['Name'] || '',
        emailAddress: row['Email Address'] || row['EMAIL ADDRESS'] || row['Email'] || '',
        phoneNumber: row['Phone Number'] || row['PHONE NUMBER'] || row['Phone'] || '',
        companyLinkedIn: row['Company LinkedIn'] || row['COMPANY LINKEDIN'] || '',
        contactLinkedIn: row['Contact LinkedIn'] || row['CONTACT LINKEDIN'] || '',
        contactFacebook: row['Contact Facebook'] || row['CONTACT FACEBOOK'] || '',
        notes: row['Notes'] || row['NOTES'] || '',
        day
      }));
      
      await importContacts(contacts);
      setImportStep('complete');
      onComplete();
    } catch (err) {
      setError('Error importing contacts');
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
              <div className="space-y-4">
                <div className="text-center p-6 border-2 border-dashed border-gray-300 rounded-md">
                  <FileSpreadsheet className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-2 text-sm text-gray-600">
                    <label htmlFor="csv-upload" className="cursor-pointer font-medium text-blue-600 hover:text-blue-500">
                      Upload a CSV file
                      <input
                        id="csv-upload"
                        name="csv-upload"
                        type="file"
                        accept=".csv"
                        className="sr-only"
                        onChange={handleFileChange}
                      />
                    </label>
                    <p className="mt-1">or drag and drop</p>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    CSV file should include: Entity Name, Primary Contact, Email Address, Phone Number
                  </p>
                  {error && (
                    <p className="mt-2 text-sm text-red-600">
                      {error}
                    </p>
                  )}
                </div>
                
                <div className="text-sm text-gray-500">
                  <p>Column mapping:</p>
                  <ul className="list-disc pl-5 mt-1">
                    <li>Entity Name (required)</li>
                    <li>Primary Contact (required)</li>
                    <li>Email Address (required)</li>
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
                  <p className="text-sm text-red-600">
                    {error}
                  </p>
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
              <>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none"
                >
                  Cancel
                </button>
              </>
            )}
            
            {importStep === 'preview' && (
              <>
                <button
                  type="button"
                  onClick={() => setImportStep('upload')}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none mr-2"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleImport}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none inline-flex items-center"
                >
                  <Upload className="h-4 w-4 mr-1" />
                  Import Contacts
                </button>
              </>
            )}
            
            {importStep === 'complete' && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none"
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