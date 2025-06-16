import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { contracts } from '../../services/api';
import Button from '../../components/ui/Button';
import type { ContractDetail, ContractStatus, AITaskStatus, AITaskType } from '../../types/api';
import { ContractChat } from '../../components/ContractChat';
import { UploadVersionModal } from '../../components/UploadVersionModal';

const ContractDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [selectedAnalysis, setSelectedAnalysis] = useState<string | null>(null);
  const [showAllVersions, setShowAllVersions] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const { data: contract, isLoading } = useQuery<ContractDetail>({
    queryKey: ['contract', id],
    queryFn: () => contracts.getDetails(id!),
    enabled: !!id,
  });

  // When contract data changes, check if we should show analysis
  useEffect(() => {
    if (contract) {
      const latestVersion = [...contract.versions].sort((a, b) => b.version_num - a.version_num)[0];
      const tasks = contract.ai_tasks[latestVersion.id] || {};
      
      // If clause analysis is complete and no analysis is selected, show it
      if (tasks.ClauseExtraction?.status === 'Completed' && !selectedAnalysis) {
        setSelectedAnalysis('ClauseExtraction');
      }
    }
  }, [contract]);

  const handleAnalysisComplete = () => {
    // Reset selected analysis - it will be set by the useEffect when data reloads
    setSelectedAnalysis(null);
  };

  if (isLoading) {
    return (
      <div className="p-6 text-center">
        Loading contract details...
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="p-6 text-center text-red-600">
        Contract not found
      </div>
    );
  }

  // Helper function to get status color
  const getStatusColor = (status: ContractStatus) => {
    switch (status) {
      case 'Draft':
        return 'bg-gray-100 text-gray-600';
      case 'NeedsRevision':
        return 'bg-orange-100 text-orange-600';
      case 'AwaitingSignatures':
        return 'bg-yellow-100 text-yellow-600';
      case 'Signed':
        return 'bg-green-100 text-green-600';
      case 'ExpiringSoon':
        return 'bg-red-100 text-red-600';
      case 'Expired':
        return 'bg-red-200 text-red-800';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  // Helper function to get AI task status color
  const getTaskStatusColor = (status: AITaskStatus) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-600';
      case 'Failed':
        return 'bg-red-100 text-red-600';
      case 'Running':
        return 'bg-yellow-100 text-yellow-600';
      case 'Pending':
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Get latest version and its AI tasks
  const latestVersion = [...contract.versions].sort((a, b) => b.version_num - a.version_num)[0];
  const latestVersionTasks = contract.ai_tasks[latestVersion.id] || {};

  // Helper function to get task icon
  const getTaskIcon = (taskType: AITaskType) => {
    switch (taskType) {
      case 'ClauseExtraction':
        return '📋';
      case 'RiskAssessment':
        return '⚠️';
      case 'Embedding':
        return '🔍';
      case 'Diff':
        return '📊';
      case 'Chat':
        return '💬';
      default:
        return '📄';
    }
  };

  // Helper function to get task display name
  const getTaskDisplayName = (taskType: AITaskType) => {
    switch (taskType) {
      case 'ClauseExtraction':
        return 'Key Clauses';
      case 'RiskAssessment':
        return 'Risk Analysis';
      case 'Embedding':
        return 'Smart Search';
      case 'Diff':
        return 'Version Diff';
      case 'Chat':
        return 'Chat Analysis';
      default:
        return taskType;
    }
  };

  // Function to render clause analysis
  const renderClauseAnalysis = (result: any) => {
    const clauses = JSON.parse(result).clauses;
    return (
      <div className="space-y-4">
        {clauses.map((clause: any, index: number) => (
          <div key={index} className="bg-cloud-bg p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-ink-text">{clause.type}</h4>
              <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
                {Math.round(clause.confidence * 100)}% Confidence
              </span>
            </div>
            <p className="text-sm text-ink-medium whitespace-pre-line">{clause.text}</p>
            <p className="text-xs text-ink-medium mt-2">Page {clause.page}</p>
          </div>
        ))}
      </div>
    );
  };

  // Function to render risk analysis
  const renderRiskAnalysis = (result: any) => {
    const risks = JSON.parse(result).risks;
    return (
      <div className="space-y-4">
        {risks.map((risk: any, index: number) => (
          <div key={index} className="bg-cloud-bg p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium
                ${risk.severity === 'high' ? 'bg-red-100 text-red-600' :
                  risk.severity === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                  'bg-blue-100 text-blue-600'}`}>
                {risk.severity.toUpperCase()}
              </span>
              <h4 className="font-medium text-ink-text">{risk.description}</h4>
            </div>
            <div className="text-sm text-ink-medium bg-white p-3 rounded border border-ink-light/10 mb-2">
              "{risk.risky_text}"
            </div>
            <p className="text-sm text-ink-medium">
              <span className="font-medium">Recommendation:</span> {risk.recommendation}
            </p>
            <p className="text-xs text-ink-medium mt-2">Page {risk.page}</p>
          </div>
        ))}
      </div>
    );
  };

  // Function to render version comparison
  const renderVersionComparison = (result: any) => {
    const { diffs, summary } = result;
    return (
      <div className="space-y-4">
        <div className="bg-cloud-bg p-4 rounded-lg">
          <h4 className="font-medium text-ink-text mb-2">Summary</h4>
          <p className="text-sm text-ink-medium">{summary}</p>
        </div>
        {diffs.map((diff: any, index: number) => (
          <div key={index} className="bg-cloud-bg p-4 rounded-lg">
            <h4 className="font-medium text-ink-text mb-2">{diff.section}</h4>
            <div className="space-y-2">
              <div className="bg-red-50 p-3 rounded text-sm">
                <span className="font-medium text-red-600">Old:</span> {diff.old}
              </div>
              <div className="bg-green-50 p-3 rounded text-sm">
                <span className="font-medium text-green-600">New:</span> {diff.new}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Function to render analysis content
  const renderAnalysisContent = () => {
    if (!selectedAnalysis || !latestVersionTasks[selectedAnalysis as AITaskType]) {
      return null;
    }

    const task = latestVersionTasks[selectedAnalysis as AITaskType];
    if (!task || task.status !== 'Completed' || !task.result) {
      return (
        <div className="text-center py-8 text-ink-medium">
          Analysis {task?.status.toLowerCase() || 'pending'}...
        </div>
      );
    }

    const result = typeof task.result === 'string' ? JSON.parse(task.result) : task.result;

    switch (selectedAnalysis) {
      case 'ClauseExtraction':
        return renderClauseAnalysis(task.result);
      case 'RiskAssessment':
        return renderRiskAnalysis(task.result);
      case 'Diff':
        return renderVersionComparison(result);
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto p-6">
      {/* Contract Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-ink-text mb-2">{contract.title}</h1>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(contract.status)}`}>
              {contract.status}
            </span>
            <span className="text-sm text-ink-medium">
              Created {formatDate(contract.created_at)}
            </span>
          </div>
        </div>
        
        {/* Upload Version Button */}
        <Button
          onClick={() => setShowUploadModal(true)}
          disabled={contract.status === 'Signed' || contract.status === 'Expired'}
        >
          Upload New Version
        </Button>
      </div>

      {/* Upload Version Modal */}
      {showUploadModal && (
        <UploadVersionModal
          contractId={id!}
          onClose={() => setShowUploadModal(false)}
          onSuccess={() => {
            setShowUploadModal(false);
          }}
          onAnalysisComplete={handleAnalysisComplete}
        />
      )}

      {/* Contract Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-ink-text">Contract Information</h3>
              <dl className="mt-4 space-y-4">
                <div>
                  <dt className="text-sm font-medium text-ink-medium">Status</dt>
                  <dd className="mt-1 text-sm text-ink-text">{contract.status}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-ink-medium">Expiry Date</dt>
                  <dd className="mt-1 text-sm text-ink-text">
                    {contract.expiry_date ? formatDate(contract.expiry_date) : 'No expiry date'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-ink-medium">Your Role</dt>
                  <dd className="mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium
                      ${contract.role === 'CM' ? 'bg-purple-100 text-purple-600' :
                        contract.role === 'AS' ? 'bg-blue-100 text-blue-600' :
                        'bg-gray-100 text-gray-600'}`}>
                      {contract.role === 'CM' ? 'Contract Manager' :
                       contract.role === 'AS' ? 'Authorised Signatory' :
                       'Contract Observer'}
                    </span>
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* AI Analysis */}
          <div className="space-y-4">
            {/* Analysis Cards */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-ink-text">AI Analysis</h3>
                <span className="text-sm text-ink-medium">
                  Version {latestVersion.version_num}
                </span>
              </div>

              {/* Task Cards Grid */}
              <div className="space-y-4">
                {Object.entries(latestVersionTasks).map(([taskType, task]) => (
                  <div key={taskType} className="w-full">
                    <button
                      onClick={() => setSelectedAnalysis(selectedAnalysis === taskType ? null : taskType)}
                      className={`w-full p-4 rounded-t-lg transition-all ${
                        selectedAnalysis === taskType 
                          ? 'bg-coral-primary text-white'
                          : 'bg-cloud-bg hover:bg-cloud-bg/80'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl" role="img" aria-label={taskType}>
                            {getTaskIcon(taskType as AITaskType)}
                          </span>
                          <div>
                            <h4 className="text-sm font-medium">
                              {getTaskDisplayName(taskType as AITaskType)}
                            </h4>
                            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mt-1
                              ${selectedAnalysis === taskType 
                                ? 'bg-white/20 text-white' 
                                : task.status === 'Completed'
                                  ? 'bg-green-100 text-green-600'
                                  : task.status === 'Running'
                                    ? 'bg-blue-100 text-blue-600'
                                    : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {task.status}
                            </span>
                          </div>
                        </div>
                        <svg 
                          className={`w-5 h-5 transition-transform ${selectedAnalysis === taskType ? 'rotate-180' : ''}`} 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </button>
                    
                    {/* Analysis Content */}
                    {selectedAnalysis === taskType && (
                      <div className="border-x border-b rounded-b-lg bg-white p-6">
                        {task.status === 'Running' ? (
                          <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coral-primary mx-auto mb-4"></div>
                            <p className="text-ink-medium">Analyzing document...</p>
                          </div>
                        ) : task.status === 'Failed' ? (
                          <div className="text-center py-8">
                            <div className="text-red-600 mb-2">⚠️ Analysis failed</div>
                            <p className="text-ink-medium">Please try re-uploading the document</p>
                          </div>
                        ) : task.status === 'Completed' ? (
                          <div className="w-full">
                            {renderAnalysisContent()}
                          </div>
                        ) : (
                          <p className="text-center py-8 text-ink-medium">
                            Waiting to start analysis...
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Participants Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-ink-text mb-6">Participants</h3>
              <div className="space-y-6">
                {/* Contract Managers */}
                <div>
                  <h4 className="text-sm font-medium text-ink-medium mb-3">Contract Managers</h4>
                  <div className="space-y-2">
                    {contract.participants
                      .filter(p => p.role === 'CM')
                      .map(participant => (
                        <div key={participant.id} className="flex items-center gap-2 text-sm">
                          <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                          <span>{participant.user_id}</span>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Authorized Signatories */}
                <div>
                  <h4 className="text-sm font-medium text-ink-medium mb-3">Authorized Signatories</h4>
                  <div className="space-y-2">
                    {contract.participants
                      .filter(p => p.role === 'AS')
                      .sort((a, b) => (a.signing_order || 0) - (b.signing_order || 0))
                      .map(participant => (
                        <div key={participant.id} className="flex items-center gap-2 text-sm">
                          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                          <span>{participant.user_id}</span>
                          {participant.signing_order && (
                            <span className="text-xs text-ink-medium">(Signs #{participant.signing_order})</span>
                          )}
                        </div>
                      ))}
                  </div>
                </div>

                {/* Contract Observers */}
                <div>
                  <h4 className="text-sm font-medium text-ink-medium mb-3">Contract Observers</h4>
                  <div className="space-y-2">
                    {contract.participants
                      .filter(p => p.role === 'CO')
                      .map(participant => (
                        <div key={participant.id} className="flex items-center gap-2 text-sm">
                          <span className="w-2 h-2 rounded-full bg-gray-500"></span>
                          <span>{participant.user_id}</span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Versions */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-ink-text">Versions</h3>
              <div className="mt-4 space-y-4">
                {[...contract.versions]
                  .sort((a, b) => b.version_num - a.version_num)
                  .slice(0, showAllVersions ? undefined : 4)
                  .map((version) => (
                    <div key={version.id} className="flex items-center justify-between p-3 bg-cloud-bg rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-ink-text">Version {version.version_num}</p>
                        <p className="text-xs text-ink-medium">{formatDate(version.created_at)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <a 
                          href={version.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 bg-ink-light text-ink-text hover:bg-ink-light/90 focus:ring-ink-light/50 px-3 py-1.5 text-sm"
                        >
                          View PDF
                        </a>
                      </div>
                    </div>
                ))}
                
                {contract.versions.length > 4 && (
                  <button
                    onClick={() => setShowAllVersions(!showAllVersions)}
                    className="w-full mt-2 py-2 px-4 text-sm font-medium text-ink-medium hover:text-ink-text transition-colors flex items-center justify-center gap-1"
                  >
                    {showAllVersions ? (
                      <>
                        <span>Show Less</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                      </>
                    ) : (
                      <>
                        <span>Show {contract.versions.length - 4} More</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Chat Section */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-ink-text mb-4">Contract Chat</h3>
              <div className="h-[500px]">
                <ContractChat contractId={id!} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractDetailPage; 