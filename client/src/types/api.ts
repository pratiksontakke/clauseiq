// Auth Types
export interface User {
  id: string;
  email: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user_id: string;
  email?: string;  // Optional since it might come from JWT payload
}

// Contract Types
export type ContractStatus = 'Draft' | 'NeedsRevision' | 'AwaitingSignatures' | 'Signed' | 'ExpiringSoon' | 'Expired';
export type ParticipantRole = 'CM' | 'AS' | 'CO';
export type ParticipantStatus = 'Invited' | 'Signed' | 'Declined' | 'Withdrawn';
export type AITaskStatus = 'Pending' | 'Running' | 'Completed' | 'Failed';
export type AITaskType = 'ClauseExtraction' | 'RiskAssessment' | 'Embedding' | 'Diff' | 'Chat';

export interface Contract {
  id: string;
  title: string;
  status: ContractStatus;
  expiry_date: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  role: ParticipantRole;
}

export interface ContractVersion {
  id: string;
  contract_id: string;
  version_num: number;
  file_url: string;
  status: string;
  created_at: string;
}

export interface Participant {
  id: string;
  contract_id: string;
  user_id: string;
  role: ParticipantRole;
  signing_order: number | null;
  status: ParticipantStatus;
  email: string;
  name: string;
}

export interface AITask {
  status: AITaskStatus;
  result: any | null;
  updated_at: string;
}

export interface ContractDetail extends Contract {
  versions: ContractVersion[];
  participants: Participant[];
  ai_tasks: {
    [versionId: string]: {
      [taskType in AITaskType]?: AITask;
    };
  };
}

export interface ContractsResponse {
  contracts: Contract[];
}

// Comment Types
export interface Comment {
  id: string;
  contract_id: string;
  version_id: string;
  user_id: string;
  parent_id?: string;
  content: string;
  location?: string;
  status: 'Open' | 'Resolved' | 'Locked';
  created_at: string;
  user: {
    email: string;
  };
}

// AI Types
export interface Clause {
  type: string;
  text: string;
  page: number;
  confidence: number;
}

export interface Risk {
  severity: 'High' | 'Medium' | 'Low';
  description: string;
  page: number;
  recommendation: string;
}

export interface DiffSummary {
  summary: string;
  diffs: Array<{
    section: string;
    old: string;
    new: string;
  }>;
}

export interface ChatResponse {
  answer: string;
  citations: Array<{
    text: string;
    page: number;
  }>;
} 