import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
  ColumnResizeMode,
  VisibilityState,
} from '@tanstack/react-table';
import { ResizableBox } from 'react-resizable';
import { Eye, EyeOff, Maximize2, ChevronDown } from 'lucide-react';
import classNames from 'classnames';

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  frozenColumns?: string[];
}

export function DataTable<T>({ data, columns, frozenColumns = [] }: DataTableProps<T>) {
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnResizeMode] = useState<ColumnResizeMode>('onChange');
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [tableWidth, setTableWidth] = useState(0);

  const table = useReactTable({
    data,
    columns,
    state: {
      columnVisibility,
    },
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    columnResizeMode,
  });

  useEffect(() => {
    const updateTableWidth = () => {
      if (tableContainerRef.current) {
        setTableWidth(tableContainerRef.current.offsetWidth);
      }
    };

    updateTableWidth();
    window.addEventListener('resize', updateTableWidth);
    return () => window.removeEventListener('resize', updateTableWidth);
  }, []);

  const fitToScreen = () => {
    const availableWidth = tableWidth;
    const visibleColumns = table.getAllColumns().filter(col => col.getIsVisible());
    const newWidth = Math.floor(availableWidth / visibleColumns.length);
    
    visibleColumns.forEach(column => {
      table.getColumn(column.id)?.resize(newWidth);
    });
  };

  const frozenColumnStyles = useMemo(() => {
    let leftOffset = 0;
    const styles: { [key: string]: React.CSSProperties } = {};

    table.getAllColumns().forEach(column => {
      if (frozenColumns.includes(column.id)) {
        styles[column.id] = {
          position: 'sticky',
          left: leftOffset,
          zIndex: 1,
          backgroundColor: 'white',
          boxShadow: '2px 0 4px rgba(0, 0, 0, 0.1)',
        };
        leftOffset += column.getSize();
      }
    });

    return styles;
  }, [frozenColumns, table.getAllColumns()]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="relative">
          <button
            onClick={() => setShowColumnSelector(!showColumnSelector)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <span className="flex items-center">
              {showColumnSelector ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
              Column Visibility
              <ChevronDown className="w-4 h-4 ml-2" />
            </span>
          </button>

          {showColumnSelector && (
            <div className="absolute z-10 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
              <div className="py-1" role="menu">
                {table.getAllColumns().map(column => (
                  <label
                    key={column.id}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={column.getIsVisible()}
                      onChange={column.getToggleVisibilityHandler()}
                      className="mr-2"
                    />
                    {column.id}
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={fitToScreen}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Maximize2 className="w-4 h-4 mr-2 inline" />
          Fit to Screen
        </button>
      </div>

      <div
        ref={tableContainerRef}
        className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm"
        style={{ maxWidth: '100%' }}
      >
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    style={{
                      width: header.getSize(),
                      ...frozenColumnStyles[header.column.id],
                    }}
                    className={classNames(
                      'relative px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider select-none',
                      {
                        'cursor-col-resize': header.column.getCanResize(),
                      }
                    )}
                  >
                    <div className="flex items-center justify-between">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </div>
                    {header.column.getCanResize() && (
                      <ResizableBox
                        width={header.getSize()}
                        height={10}
                        handle={<div className="absolute right-0 top-0 h-full w-4 cursor-col-resize bg-transparent hover:bg-blue-500 hover:opacity-50" />}
                        onResize={(e, { size }) => {
                          header.column.resize(size.width);
                        }}
                        draggableOpts={{ enableUserSelectHack: false }}
                      />
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {table.getRowModel().rows.map(row => (
              <tr key={row.id}>
                {row.getVisibleCells().map(cell => (
                  <td
                    key={cell.id}
                    style={{
                      width: cell.column.getSize(),
                      ...frozenColumnStyles[cell.column.id],
                    }}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                  >
                    <div className="truncate" title={String(cell.getValue())}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}