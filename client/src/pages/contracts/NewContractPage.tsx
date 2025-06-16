import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { contracts } from '../../services/api';

const NewContractPage = () => {
  const [step, setStep] = useState(1);
  const [metadata, setMetadata] = useState({
    title: '',
    expiry_date: '',
  });
  const [contractId, setContractId] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  // Handlers for metadata
  const handleMetaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMetadata({ ...metadata, [e.target.name]: e.target.value });
  };

  // File handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f && f.type === 'application/pdf' && f.size <= 10 * 1024 * 1024) {
      setFile(f);
      setError(null);
    } else {
      setError('Please select a PDF file under 10MB.');
    }
  };

  // Step 1: Submit contract metadata
  const handleContractSubmit = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const payload = {
        title: metadata.title,
        status: 'Draft',
        expiry_date: metadata.expiry_date,
      };
      console.log('Contract creation payload:', payload);
      const contractRes = await contracts.create(payload);
      setContractId(contractRes.id);
      setStep(2);
    } catch (err: any) {
      setError(err.message || 'Failed to create contract.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Upload file
  const handleFileUpload = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (!file || !contractId) throw new Error('No file or contract ID');
      const formData = new FormData();
      formData.append('file', file);
      await contracts.uploadVersion(contractId, formData);
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to upload file.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white rounded-lg shadow p-8 mt-8">
      <h2 className="text-xl font-bold mb-6">Upload New Contract</h2>
      {step === 1 && (
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700" htmlFor="title">Title</label>
          <Input name="title" value={metadata.title} onChange={handleMetaChange} required />
          <label className="block text-sm font-medium text-gray-700" htmlFor="expiry_date">Expiry Date</label>
          <Input name="expiry_date" type="date" value={metadata.expiry_date} onChange={handleMetaChange} required />
          {/* Hidden status field, always Draft */}
          <input type="hidden" name="status" value="Draft" />
          <div className="flex justify-end gap-2">
            <Button onClick={handleContractSubmit} disabled={!metadata.title || !metadata.expiry_date || isLoading}>{isLoading ? 'Creating...' : 'Next'}</Button>
          </div>
        </div>
      )}
      {step === 2 && (
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">Upload PDF</label>
          <input type="file" accept="application/pdf" onChange={handleFileChange} />
          {file && <div className="text-green-600">{file.name}</div>}
          <div className="flex justify-between mt-4">
            <Button variant="secondary" onClick={() => setStep(1)} disabled={isLoading}>Back</Button>
            <Button onClick={handleFileUpload} disabled={!file || isLoading}>{isLoading ? 'Uploading...' : 'Upload Contract'}</Button>
          </div>
        </div>
      )}
      {error && <div className="mt-4 p-2 bg-red-100 text-red-700 rounded">{error}</div>}
      {success && <div className="mt-4 p-2 bg-green-100 text-green-700 rounded">Contract uploaded! Redirecting...</div>}
    </div>
  );
};

export default NewContractPage; 