import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { ChevronDown, ChevronUp, Plus, Lightbulb } from 'lucide-react';
import { useContacts } from '../../contexts/ContactContext';
import { v4 as uuidv4 } from 'uuid';
import InsightsModal from '../contacts/InsightsModal';
import { SequenceStage } from '../../types';

interface Cell {
  id: string;
  value: string;
}

interface Row {
  id: string;
  contactId: string;
  cells: Cell[];
  stage: SequenceStage;
  completed: boolean;
}

interface SpreadsheetTableProps {
  columns: string[];
  initialRows?: number;
  onSave?: (data: Row[]) => void;
  onStageChange?: (contactId: string, stage: SequenceStage) => void;
}

const SpreadsheetTable: React.FC<SpreadsheetTableProps> = ({
  columns,
  initialRows = 10,
  onSave,
  onStageChange
}) => {
  const { generateInsights, markContactCompleted } = useContacts();
  const [rows, setRows] = useState<Row[]>(() => 
    Array.from({ length: initialRows }, (_, rowIndex) => ({
      id: `row-${rowIndex}`,
      contactId: uuidv4(),
      cells: columns.map((_, colIndex) => ({
        id: `cell-${rowIndex}-${colIndex}`,
        value: ''
      })),
      stage: 'First Email',
      completed: false
    }))
  );
  
  const [activeCell, setActiveCell] = useState<{ rowIndex: number; colIndex: number } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [sortColumn, setSortColumn] = useState<number | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [generatingInsights, setGeneratingInsights] = useState<string | null>(null);
  const [showInsightsModal, setShowInsightsModal] = useState(false);
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [processingStage, setProcessingStage] = useState<string | null>(null);
  
  const cellRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const tableEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setError(null);
  }, [rows, activeCell]);

  useEffect(() => {
    if (activeCell && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.selectionStart = inputRef.current.value.length;
      inputRef.current.selectionEnd = inputRef.current.value.length;
    }
  }, [activeCell]);

  const handleStageProgression = async (rowIndex: number) => {
    const row = rows[rowIndex];
    if (!row || processingStage === row.id) return;

    setProcessingStage(row.id);
    try {
      const nextStage = getNextStage(row.stage);
      await markContactCompleted(row.contactId);
      
      const updatedRows = [...rows];
      updatedRows[rowIndex] = {
        ...row,
        stage: nextStage,
        completed: nextStage === 'Breakup Email'
      };
      
      setRows(updatedRows);
      onSave?.(updatedRows);
      
      if (onStageChange) {
        onStageChange(row.contactId, nextStage);
      }
    } catch (error) {
      console.error('Error updating contact stage:', error);
      setError('Failed to update contact stage');
    } finally {
      setProcessingStage(null);
    }
  };

  const getNextStage = (currentStage: SequenceStage): SequenceStage => {
    switch (currentStage) {
      case 'First Email':
        return 'Second Email';
      case 'Second Email':
        return 'Phone/LinkedIn Connect';
      case 'Phone/LinkedIn Connect':
        return 'Breakup Email';
      default:
        return 'Breakup Email';
    }
  };

  const handleCellClick = (rowIndex: number, colIndex: number) => {
    if (activeCell) {
      const { rowIndex: currentRow, colIndex: currentCol } = activeCell;
      const newRows = [...rows];
      newRows[currentRow].cells[currentCol].value = editValue;
      setRows(newRows);
      onSave?.(newRows);
    }
    
    setActiveCell({ rowIndex, colIndex });
    setEditValue(rows[rowIndex].cells[colIndex].value);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>, rowIndex: number, colIndex: number) => {
    if (e.key === 'Tab' || e.key === 'Enter') {
      e.preventDefault();
      
      const newRows = [...rows];
      newRows[rowIndex].cells[colIndex].value = editValue;
      setRows(newRows);
      onSave?.(newRows);
      
      if (e.key === 'Tab') {
        navigateNext(rowIndex, colIndex, e.shiftKey);
      } else {
        navigateDown(rowIndex, colIndex);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setEditValue(rows[rowIndex].cells[colIndex].value);
      setActiveCell(null);
    }
  };

  const navigateNext = (rowIndex: number, colIndex: number, reverse: boolean) => {
    let nextRow = rowIndex;
    let nextCol = colIndex;
    
    if (reverse) {
      if (colIndex > 0) {
        nextCol = colIndex - 1;
      } else if (rowIndex > 0) {
        nextRow = rowIndex - 1;
        nextCol = columns.length - 1;
      }
    } else {
      if (colIndex < columns.length - 1) {
        nextCol = colIndex + 1;
      } else if (rowIndex < rows.length - 1) {
        nextRow = rowIndex + 1;
        nextCol = 0;
      }
    }
    
    setActiveCell({ rowIndex: nextRow, colIndex: nextCol });
    setEditValue(rows[nextRow].cells[nextCol].value);
  };

  const navigateDown = (rowIndex: number, colIndex: number) => {
    if (rowIndex < rows.length - 1) {
      setActiveCell({ rowIndex: rowIndex + 1, colIndex });
      setEditValue(rows[rowIndex + 1].cells[colIndex].value);
    }
  };

  const handleCellChange = (value: string) => {
    setEditValue(value);
  };

  const handleCellBlur = () => {
    if (activeCell) {
      const { rowIndex, colIndex } = activeCell;
      const newRows = [...rows];
      newRows[rowIndex].cells[colIndex].value = editValue;
      setRows(newRows);
      setActiveCell(null);
      onSave?.(newRows);
    }
  };

  const handleSort = (colIndex: number) => {
    if (sortColumn === colIndex) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(colIndex);
      setSortDirection('asc');
    }

    const sortedRows = [...rows].sort((a, b) => {
      const aValue = a.cells[colIndex].value.toLowerCase();
      const bValue = b.cells[colIndex].value.toLowerCase();
      
      if (sortDirection === 'asc') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });

    setRows(sortedRows);
  };

  const handleGenerateInsights = async (rowIndex: number) => {
    setError(null);
    
    if (rowIndex < 0 || rowIndex >= rows.length) {
      setError('Invalid row selected');
      return;
    }

    const row = rows[rowIndex];
    if (!row || !row.contactId) {
      setError('Invalid row data');
      return;
    }

    // Check if required social profile data exists
    const linkedInUrl = row.cells[4]?.value || row.cells[5]?.value; // Company or Contact LinkedIn
    const facebookUrl = row.cells[6]?.value; // Contact Facebook

    if (!linkedInUrl && !facebookUrl) {
      setError('Please add at least one social profile (LinkedIn or Facebook) to generate insights');
      return;
    }

    setGeneratingInsights(row.id);
    try {
      await generateInsights(row.contactId);
      setSelectedRowIndex(rowIndex);
      setShowInsightsModal(true);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setError(errorMessage);
      console.error('Error generating insights:', error);
    } finally {
      setGeneratingInsights(null);
    }
  };

  const addRow = () => {
    const newRowIndex = rows.length;
    const newRow: Row = {
      id: `row-${newRowIndex}`,
      contactId: uuidv4(),
      cells: columns.map((_, colIndex) => ({
        id: `cell-${newRowIndex}-${colIndex}`,
        value: ''
      })),
      stage: 'First Email',
      completed: false
    };
    
    setRows(prev => [...prev, newRow]);
    
    setTimeout(() => {
      tableEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const renderCell = (rowIndex: number, colIndex: number, cell: Cell) => {
    const isInsightsColumn = columns[colIndex] === 'Insights';
    const isContactAttemptColumn = columns[colIndex] === 'Contact Attempt';
    const row = rows[rowIndex];
    
    if (isContactAttemptColumn) {
      return (
        <div className="flex justify-center">
          <button
            onClick={() => handleStageProgression(rowIndex)}
            disabled={processingStage === row.id || row.completed}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              row.completed
                ? 'bg-green-100 text-green-800 cursor-not-allowed'
                : processingStage === row.id
                ? 'bg-blue-100 text-blue-800 cursor-wait'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {row.completed ? 'Complete' : processingStage === row.id ? 'Processing...' : 'Yes'}
          </button>
        </div>
      );
    }

    if (isInsightsColumn) {
      const hasRequiredSocialData = row.cells.some((cell, idx) => 
        (idx === 4 || idx === 5 || idx === 6) && cell.value.trim() !== ''
      );

      return (
        <div className="flex justify-center">
          <button
            onClick={() => handleGenerateInsights(rowIndex)}
            className={`p-2 rounded-full transition-colors ${
              generatingInsights === rows[rowIndex].id
                ? 'bg-amber-100 text-amber-600 animate-pulse'
                : cell.value
                  ? 'bg-amber-50 text-amber-500 hover:bg-amber-100'
                  : hasRequiredSocialData
                    ? 'text-amber-500 hover:bg-amber-50'
                    : 'text-gray-300 cursor-not-allowed'
            }`}
            aria-label="Get insights"
            title={hasRequiredSocialData ? "Get insights" : "Add social profiles to generate insights"}
            disabled={generatingInsights === rows[rowIndex].id || !hasRequiredSocialData}
          >
            <Lightbulb className="w-5 h-5" />
          </button>
        </div>
      );
    }

    return activeCell?.rowIndex === rowIndex && activeCell?.colIndex === colIndex ? (
      <textarea
        ref={inputRef}
        className="w-full bg-transparent border-none focus:outline-none resize-none overflow-hidden"
        value={editValue}
        onChange={e => handleCellChange(e.target.value)}
        onBlur={handleCellBlur}
        onKeyDown={e => handleKeyDown(e, rowIndex, colIndex)}
        rows={1}
        style={{
          height: 'auto',
          minHeight: '1.5rem',
          maxHeight: '6rem'
        }}
        onInput={e => {
          const target = e.target as HTMLTextAreaElement;
          target.style.height = 'auto';
          target.style.height = `${target.scrollHeight}px`;
        }}
      />
    ) : (
      <div className="truncate" title={cell.value}>
        {cell.value}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      <div className="overflow-x-auto shadow-md rounded-lg">
        <table className="w-full border-collapse bg-white table-fixed" role="grid">
          <thead>
            <tr>
              {columns.map((column, colIndex) => (
                <th
                  key={colIndex}
                  className={`sticky top-0 bg-gray-100 px-4 py-2 text-left text-sm font-semibold text-gray-900 border-b cursor-pointer hover:bg-gray-200 ${getColumnWidth(colIndex)}`}
                  onClick={() => handleSort(colIndex)}
                  role="columnheader"
                  aria-sort={sortColumn === colIndex ? sortDirection : 'none'}
                >
                  <div className="flex items-center gap-2">
                    <span className="truncate">{column}</span>
                    {sortColumn === colIndex && (
                      sortDirection === 'asc' ? <ChevronUp className="w-4 h-4 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 flex-shrink-0" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr 
                key={row.id}
                className={`${rowIndex === rows.length - 1 ? 'animate-fadeIn' : ''} ${
                  row.completed ? 'bg-green-50' : ''
                }`}
              >
                {row.cells.map((cell, colIndex) => (
                  <td
                    key={cell.id}
                    className={`border px-4 py-2 ${getColumnWidth(colIndex)} ${
                      activeCell?.rowIndex === rowIndex && activeCell?.colIndex === colIndex
                        ? 'bg-blue-50 outline outline-2 outline-blue-500'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                    ref={el => cellRefs.current[cell.id] = el}
                    role="gridcell"
                    tabIndex={0}
                    aria-selected={activeCell?.rowIndex === rowIndex && activeCell?.colIndex === colIndex}
                  >
                    {renderCell(rowIndex, colIndex, cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <div ref={tableEndRef} />
      </div>
      
      <div className="flex justify-center">
        <button
          onClick={addRow}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Row
        </button>
      </div>

      {showInsightsModal && selectedRowIndex !== null && (
        <InsightsModal
          socialProfile={{
            companyInfo: null,
            personalInfo: null,
            lastUpdated: null
          }}
          onClose={() => setShowInsightsModal(false)}
          onRefresh={async () => {
            if (selectedRowIndex !== null) {
              await handleGenerateInsights(selectedRowIndex);
            }
          }}
        />
      )}
    </div>
  );
};

const getColumnWidth = (colIndex: number) => {
  switch(colIndex) {
    case 0: // Entity Name
      return 'w-[180px] min-w-[180px] max-w-[180px]';
    case 1: // Primary Contact
      return 'w-[160px] min-w-[160px] max-w-[160px]';
    case 2: // Email Address
      return 'w-[220px] min-w-[220px] max-w-[220px]';
    case 3: // Phone Number
      return 'w-[140px] min-w-[140px] max-w-[140px]';
    case 4: // Company LinkedIn
    case 5: // Contact LinkedIn
    case 6: // Contact Facebook
      return 'w-[160px] min-w-[160px] max-w-[160px]';
    case 7: // Notes
      return 'w-[200px] min-w-[200px] max-w-[200px]';
    case 8: // Insights
      return 'w-[100px] min-w-[100px] max-w-[100px]';
    case 9: // Contact Attempt
      return 'w-[120px] min-w-[120px] max-w-[120px]';
    default:
      return 'w-[150px] min-w-[150px] max-w-[150px]';
  }
};

export default SpreadsheetTable;