import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button';
import { contracts } from '../../services/api';
import type { ContractStatus, Contract } from '../../types/api';

interface StatusTile {
  title: string;
  status: ContractStatus;
  description: string;
}

type ContractStatusMap = Partial<Record<ContractStatus, Contract[]>>;

const DashboardPage = () => {
  const [selectedStatus, setSelectedStatus] = useState<ContractStatus | null>(null);

  // Fetch contracts
  const { data: contractsData, isLoading } = useQuery({
    queryKey: ['contracts', selectedStatus],
    queryFn: () => contracts.list(selectedStatus || undefined),
  });

  // Organize contracts by status
  const contractsByStatus = useMemo<ContractStatusMap>(() => {
    if (!contractsData?.contracts) return {};
    
    return contractsData.contracts.reduce((acc: ContractStatusMap, contract) => {
      if (!acc[contract.status]) {
        acc[contract.status] = [];
      }
      acc[contract.status]?.push(contract);
      return acc;
    }, {});
  }, [contractsData?.contracts]);

  const statusTiles: StatusTile[] = [
    { 
      title: 'Draft', 
      status: 'Draft',
      description: 'Contracts in draft stage'
    },
    { 
      title: 'Needs Revision', 
      status: 'NeedsRevision',
      description: 'Contracts requiring changes'
    },
    { 
      title: 'Awaiting Signatures', 
      status: 'AwaitingSignatures',
      description: 'Pending signatures'
    },
    { 
      title: 'Signed', 
      status: 'Signed',
      description: 'Completed contracts'
    },
    { 
      title: 'Expiring Soon', 
      status: 'ExpiringSoon',
      description: 'Contracts nearing expiry'
    },
    { 
      title: 'Expired', 
      status: 'Expired',
      description: 'Expired contracts'
    }
  ];

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

  const getStatusBadge = (status: ContractStatus) => {
    return (
      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(status)}`}>
        {status === 'AwaitingSignatures' ? 'Awaiting Signatures' :
         status === 'ExpiringSoon' ? 'Expiring Soon' :
         status === 'NeedsRevision' ? 'Needs Revision' :
         status}
      </span>
    );
  };

  // Get filtered contracts based on selected status
  const filteredContracts = useMemo(() => {
    if (!contractsData?.contracts) return [];
    if (!selectedStatus) return contractsData.contracts;
    return contractsByStatus[selectedStatus] || [];
  }, [selectedStatus, contractsData?.contracts, contractsByStatus]);

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink-text">Contract Dashboard</h1>
          <p className="text-ink-medium mt-1">Manage and track your contracts</p>
        </div>
        <Button as={Link} to="/contracts/new" className="bg-coral-primary">
          Upload Contract
        </Button>
      </div>

      {/* Status Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statusTiles.map((tile) => (
          <button
            key={tile.status}
            onClick={() => setSelectedStatus(selectedStatus === tile.status ? null : tile.status)}
            className={`p-4 rounded-lg ${getStatusColor(tile.status)} hover:opacity-90 transition-all ${
              selectedStatus === tile.status ? 'ring-2 ring-coral-primary scale-105' : ''
            }`}
          >
            <div className="text-3xl font-bold">{contractsByStatus[tile.status]?.length || 0}</div>
            <div className="text-sm font-medium">{tile.title}</div>
            <div className="text-xs mt-1 opacity-75">{tile.description}</div>
          </button>
        ))}
      </div>

      {/* Active Filter */}
      {selectedStatus && (
        <div className="flex items-center gap-2 text-sm text-ink-medium">
          <span>Filtering by:</span>
          {getStatusBadge(selectedStatus)}
          <button 
            onClick={() => setSelectedStatus(null)}
            className="text-coral-primary hover:underline"
          >
            Clear filter
          </button>
        </div>
      )}

      {/* Contracts Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-ink-light/10">
          <thead className="bg-cloud-bg">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-ink-medium uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-ink-medium uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-ink-medium uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-ink-medium uppercase tracking-wider">
                Expiry
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-ink-medium uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-ink-light/10">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-ink-medium">
                  Loading contracts...
                </td>
              </tr>
            ) : filteredContracts.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-ink-medium">
                  {selectedStatus 
                    ? `No contracts with status "${selectedStatus}"`
                    : 'No contracts found'}
                </td>
              </tr>
            ) : (
              filteredContracts.map((contract: Contract) => (
                <tr key={contract.id} className="hover:bg-cloud-bg/50">
                  <td className="px-6 py-4 text-sm text-ink-text">
                    <div className="font-medium">{contract.title}</div>
                    <div className="text-xs text-ink-medium">Created {new Date(contract.created_at).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(contract.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium
                      ${contract.role === 'CM' ? 'bg-purple-100 text-purple-600' :
                        contract.role === 'AS' ? 'bg-blue-100 text-blue-600' :
                        'bg-gray-100 text-gray-600'}`}>
                      {contract.role === 'CM' ? 'Contract Manager' :
                       contract.role === 'AS' ? 'Authorised Signatory' :
                       'Contract Observer'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-ink-text">
                    {contract.expiry_date 
                      ? new Date(contract.expiry_date).toLocaleDateString()
                      : '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <Button
                      as={Link}
                      to={`/contracts/${contract.id}`}
                      variant="secondary"
                      size="sm"
                      className="hover:bg-coral-primary hover:text-white"
                    >
                      View Details
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DashboardPage; 