import { useState } from 'react';
import { X, RefreshCw, Copy, Clock } from 'lucide-react';
import { SocialProfile } from '../../types';
import classNames from 'classnames';

interface InsightsModalProps {
  socialProfile: SocialProfile;
  onClose: () => void;
  onRefresh?: () => Promise<void>;
}

const InsightsModal = ({ socialProfile, onClose, onRefresh }: InsightsModalProps) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const { companyInfo, personalInfo, lastUpdated } = socialProfile;
  const [error, setError] = useState<string | null>(null);

  const handleRefresh = async () => {
    if (onRefresh) {
      setIsRefreshing(true);
      setError(null);
      try {
        await onRefresh();
      } catch (err) {
        setError('Failed to refresh profile data. Please try again.');
      } finally {
        setIsRefreshing(false);
      }
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Not available';
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const InsightSection = ({ title, items, priority = false }: { title: string; items: string[]; priority?: boolean }) => (
    <div className="mb-6">
      <h4 className={classNames(
        "text-lg font-semibold mb-3",
        priority ? "text-amber-600" : "text-gray-900"
      )}>
        {title}
      </h4>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li 
            key={index}
            className="flex items-start group bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow"
          >
            <span className="w-2 h-2 mt-2 mr-2 rounded-full bg-gray-400 flex-shrink-0" />
            <span className="flex-grow">{item}</span>
            <button
              onClick={() => copyToClipboard(item)}
              className={classNames(
                "ml-2 p-1 rounded transition-colors opacity-0 group-hover:opacity-100",
                copiedText === item ? "text-green-600" : "text-gray-400 hover:text-gray-600"
              )}
              title={copiedText === item ? "Copied!" : "Copy to clipboard"}
            >
              <Copy className="w-4 h-4" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-7xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <div className="flex items-center space-x-4">
                <h3 className="text-2xl font-semibold text-gray-900">Social Profile Analysis</h3>
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="w-4 h-4 mr-1" />
                  Last Updated: {formatDate(lastUpdated)}
                </div>
              </div>
              <div className="flex items-center space-x-4">
                {onRefresh && (
                  <button
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className={classNames(
                      "inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium",
                      isRefreshing
                        ? "bg-gray-100 text-gray-400"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    )}
                  >
                    <RefreshCw className={classNames(
                      "w-4 h-4 mr-2",
                      isRefreshing && "animate-spin"
                    )} />
                    {isRefreshing ? "Refreshing..." : "Refresh Data"}
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Company Intelligence Column */}
              <div className="space-y-6 bg-gray-50 p-6 rounded-lg">
                <h4 className="text-xl font-semibold text-gray-900 mb-4">Company Intelligence</h4>
                
                {companyInfo ? (
                  <>
                    <InsightSection 
                      title="Company Overview"
                      items={[
                        `Founded: ${companyInfo.founded}`,
                        ...companyInfo.milestones
                      ]}
                      priority
                    />
                    
                    <InsightSection 
                      title="Recent Achievements"
                      items={companyInfo.awards}
                    />
                    
                    <InsightSection 
                      title="Latest Developments"
                      items={companyInfo.recentNews}
                      priority
                    />
                    
                    <InsightSection 
                      title="Core Offerings"
                      items={companyInfo.offerings}
                    />
                    
                    <InsightSection 
                      title="Company Culture"
                      items={companyInfo.culture}
                    />
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-500 bg-white rounded-lg shadow-sm">
                    <p>No company information available</p>
                    <p className="text-sm mt-2">Click refresh to fetch company data</p>
                  </div>
                )}
              </div>

              {/* Contact Research Column */}
              <div className="space-y-6 bg-gray-50 p-6 rounded-lg">
                <h4 className="text-xl font-semibold text-gray-900 mb-4">Contact Research</h4>
                
                {personalInfo ? (
                  <>
                    <InsightSection 
                      title="Professional Background"
                      items={personalInfo.career}
                      priority
                    />
                    
                    <InsightSection 
                      title="Education"
                      items={personalInfo.education}
                    />
                    
                    <InsightSection 
                      title="Areas of Interest"
                      items={personalInfo.interests}
                    />
                    
                    <InsightSection 
                      title="Thought Leadership"
                      items={personalInfo.publications}
                    />
                    
                    <InsightSection 
                      title="Social Impact"
                      items={personalInfo.causes}
                    />
                    
                    <InsightSection 
                      title="Recent Activity"
                      items={personalInfo.recentActivity}
                      priority
                    />
                    
                    <InsightSection 
                      title="Notable Achievements"
                      items={personalInfo.achievements}
                    />
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-500 bg-white rounded-lg shadow-sm">
                    <p>No personal information available</p>
                    <p className="text-sm mt-2">Click refresh to fetch contact data</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={onClose}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsightsModal;