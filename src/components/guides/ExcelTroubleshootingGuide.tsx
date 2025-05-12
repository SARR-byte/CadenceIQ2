import React from 'react';
import { Settings, Code2, Layout, FileSpreadsheet, Download } from 'lucide-react';

const ExcelTroubleshootingGuide = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="space-y-8">
        <section className="border-b pb-6">
          <div className="flex items-center gap-3 mb-4">
            <Settings className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold">Check Excel Settings</h2>
          </div>
          <ol className="list-decimal ml-6 space-y-2">
            <li>Open Excel and click on <span className="font-semibold">File → Options</span></li>
            <li>Select <span className="font-semibold">Advanced</span> from the left sidebar</li>
            <li>Scroll to the <span className="font-semibold">Editing options</span> section</li>
            <li>Find and uncheck <span className="font-semibold">"Move selection after Enter"</span></li>
            <li>Click <span className="font-semibold">OK</span> to save changes</li>
          </ol>
        </section>

        <section className="border-b pb-6">
          <div className="flex items-center gap-3 mb-4">
            <Code2 className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-semibold">Check VBA Scripts and Macros</h2>
          </div>
          <ol className="list-decimal ml-6 space-y-2">
            <li>Press <span className="font-mono bg-gray-100 px-1">Alt + F11</span> to open the VBA editor</li>
            <li>Review any active macros in <span className="font-semibold">ThisWorkbook</span> and worksheet modules</li>
            <li>Look for code handling the <span className="font-mono bg-gray-100 px-1">Worksheet_SelectionChange</span> event</li>
            <li>Temporarily disable suspicious macros to test behavior</li>
          </ol>
        </section>

        <section className="border-b pb-6">
          <div className="flex items-center gap-3 mb-4">
            <Layout className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-semibold">Verify Conditional Formatting</h2>
          </div>
          <ol className="list-decimal ml-6 space-y-2">
            <li>Select the problematic range of cells</li>
            <li>Go to <span className="font-semibold">Home → Conditional Formatting → Manage Rules</span></li>
            <li>Review all rules affecting the selected cells</li>
            <li>Remove or modify any rules that might trigger on selection change</li>
          </ol>
        </section>

        <section className="border-b pb-6">
          <div className="flex items-center gap-3 mb-4">
            <FileSpreadsheet className="w-6 h-6 text-orange-600" />
            <h2 className="text-xl font-semibold">Test in New Workbook</h2>
          </div>
          <ol className="list-decimal ml-6 space-y-2">
            <li>Create a new, blank workbook</li>
            <li>Enter test data in a few cells</li>
            <li>Test Tab key behavior in the new workbook</li>
            <li>If the issue doesn't occur, the problem is specific to the original file</li>
          </ol>
        </section>

        <section>
          <div className="flex items-center gap-3 mb-4">
            <Download className="w-6 h-6 text-red-600" />
            <h2 className="text-xl font-semibold">Check Excel Version</h2>
          </div>
          <ol className="list-decimal ml-6 space-y-2">
            <li>Go to <span className="font-semibold">File → Account</span></li>
            <li>Look for <span className="font-semibold">About Excel</span> to check your version</li>
            <li>Visit Microsoft's website to verify you have the latest updates</li>
            <li>Install any pending updates that might fix the issue</li>
          </ol>
        </section>

        <div className="mt-8 bg-blue-50 p-4 rounded-lg">
          <p className="text-blue-800">
            <span className="font-semibold">Expected Behavior:</span> After implementing these fixes, 
            pressing Tab should keep your data in the current cell while moving the selection to the next cell. 
            This maintains normal spreadsheet navigation without affecting your data.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ExcelTroubleshootingGuide;