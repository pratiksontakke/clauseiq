# 📚 Contract Lifecycle Management (CLM) Backend Documentation

---

## 1. Database Schema & Relationships

### 1.1. users

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```
- **Purpose:** Stores user accounts.
- **Note:** No global role; roles are per-contract.

---

### 1.2. contracts

```sql
CREATE TABLE contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Draft', 'NeedsRevision', 'AwaitingSignatures', 'Signed', 'ExpiringSoon', 'Expired')),
    expiry_date DATE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```
- **Purpose:** Stores contract metadata and status.
- **Relationship:** `created_by` links to `users`.

---

### 1.3. contract_versions

```sql
CREATE TABLE contract_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
    version_num INTEGER NOT NULL,
    file_url TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Draft', 'Locked', 'Signed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```
- **Purpose:** Stores each version of a contract.
- **Relationship:** Many versions per contract.

---

### 1.4. contract_participants

```sql
CREATE TABLE contract_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('CM', 'AS', 'CO')),
    signing_order INTEGER,
    status TEXT NOT NULL CHECK (status IN ('Invited', 'Signed', 'Declined', 'Withdrawn')),
    UNIQUE (contract_id, user_id)
);
```
- **Purpose:** Defines each user’s role for each contract.
- **Relationship:** Many-to-many between users and contracts.

---

### 1.5. comments

```sql
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
    version_id UUID NOT NULL REFERENCES contract_versions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    location TEXT,
    content TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Open', 'Resolved', 'Locked')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```
- **Purpose:** Threaded comments, linked to contract, version, author, and optionally parent comment.

---

### 1.6. ai_tasks

```sql
CREATE TABLE ai_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
    version_id UUID NOT NULL REFERENCES contract_versions(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('ClauseExtraction', 'RiskAssessment', 'Embedding', 'Diff', 'Chat')),
    status TEXT NOT NULL CHECK (status IN ('Pending', 'Running', 'Completed', 'Failed')),
    result JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```
- **Purpose:** Tracks all AI jobs and their results.

---

### 1.7. embeddings

```sql
CREATE TABLE embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
    version_id UUID NOT NULL REFERENCES contract_versions(id) ON DELETE CASCADE,
    chunk_id TEXT NOT NULL,
    embedding VECTOR(1536) NOT NULL, -- adjust dimension as per model
    text TEXT NOT NULL,
    page_num INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```
- **Purpose:** Stores vector embeddings for semantic search and RAG.

---

### 1.8. notifications

```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    contract_id UUID REFERENCES contracts(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('Email', 'InApp', 'Reminder')),
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```
- **Purpose:** Stores notifications for users.

---

### 1.9. audit_log

```sql
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```
- **Purpose:** Immutable log of all important actions for compliance.

---

## 2. Example Data and Queries

### Example: Alice (CM), Bob (AS), Carol (AS), Dave (CO), Contract C1

#### Insert Users

```sql
INSERT INTO users (id, email, password_hash) VALUES
('U1', 'alice@ex.com', '...'),
('U2', 'bob@ex.com', '...'),
('U3', 'carol@ex.com', '...'),
('U4', 'dave@ex.com', '...');
```

#### Insert Contract

```sql
INSERT INTO contracts (id, title, status, expiry_date, created_by)
VALUES ('C1', 'Vendor-X Master Services Agreement', 'Draft', '2024-12-31', 'U1');
```

#### Insert Contract Version

```sql
INSERT INTO contract_versions (id, contract_id, version_num, file_url, status)
VALUES ('V1', 'C1', 1, 's3://contracts/C1/V1.pdf', 'Draft');
```

#### Assign Participants

```sql
INSERT INTO contract_participants (id, contract_id, user_id, role, signing_order, status) VALUES
('P1', 'C1', 'U1', 'CM', NULL, 'Invited'),
('P2', 'C1', 'U2', 'AS', 1, 'Invited'),
('P3', 'C1', 'U3', 'AS', 2, 'Invited'),
('P4', 'C1', 'U4', 'CO', NULL, 'Invited');
```

#### Add a Comment

```sql
INSERT INTO comments (id, contract_id, version_id, user_id, parent_id, location, content, status)
VALUES ('CM1', 'C1', 'V1', 'U2', NULL, 'Page 5, Para 2', 'Payment terms seem short...', 'Open');
```

#### Query: All contracts for Bob

```sql
SELECT c.*
FROM contracts c
JOIN contract_participants p ON c.id = p.contract_id
WHERE p.user_id = 'U2';
```

#### Query: All comments for contract C1, version V1

```sql
SELECT c.*, u.email
FROM comments c
JOIN users u ON c.user_id = u.id
WHERE c.contract_id = 'C1' AND c.version_id = 'V1'
ORDER BY c.created_at;
```

---

## 3. AI Add-ons: Deep Logic & Example

### 3.1. Clause Extraction

**Logic:**
- Triggered on contract version upload/lock.
- Backend extracts text, sends to GPT-4 with a prompt to extract and categorize clauses.
- Result (JSON) is stored in `ai_tasks.result`.

**Example:**
```json
{
  "clauses": [
    {
      "type": "Payment Terms",
      "text": "Payment shall be remitted within 45 days of invoice.",
      "page": 5,
      "confidence": 0.98
    },
    {
      "type": "Termination",
      "text": "Either party may terminate with 30 days notice.",
      "page": 12,
      "confidence": 0.95
    }
  ]
}
```
**DB Command:**
```sql
INSERT INTO ai_tasks (contract_id, version_id, type, status, result)
VALUES ('C1', 'V1', 'ClauseExtraction', 'Completed', '{...}');
```

---

### 3.2. Risk Assessment

**Logic:**
- Triggered on contract version upload/lock.
- Backend sends text to GPT-3.5/4 with a risk-detection prompt.
- Result (JSON) is stored in `ai_tasks.result`.

**Example:**
```json
{
  "risks": [
    {
      "severity": "High",
      "description": "Unlimited liability clause found.",
      "page": 8,
      "recommendation": "Negotiate a cap on liability."
    }
  ]
}
```
**DB Command:**
```sql
INSERT INTO ai_tasks (contract_id, version_id, type, status, result)
VALUES ('C1', 'V1', 'RiskAssessment', 'Completed', '{...}');
```

---

### 3.3. Version Diff

**Logic:**
- Triggered on new version upload.
- Backend compares text of previous and new version, sends to GPT-3.5/4 for summary.
- Result (JSON) is stored in `ai_tasks.result`.

**Example:**
```json
{
  "summary": "Payment terms changed from 30 to 45 days.",
  "diffs": [
    {
      "section": "Payment Terms",
      "old": "30 days",
      "new": "45 days"
    }
  ]
}
```
**DB Command:**
```sql
INSERT INTO ai_tasks (contract_id, version_id, type, status, result)
VALUES ('C1', 'V2', 'Diff', 'Completed', '{...}');
```

---

### 3.4. Embedding Generation

**Logic:**
- On version upload, backend splits text into chunks.
- Each chunk is embedded (vectorized) and stored in `embeddings`.

**Example:**
```sql
INSERT INTO embeddings (contract_id, version_id, chunk_id, embedding, text, page_num)
VALUES ('C1', 'V1', 'chunk_001', '[0.123, 0.456, ...]', 'Payment shall be remitted...', 5);
```

---

### 3.5. RAG Chat

**Logic:**
- User asks a question.
- Backend embeds the question, finds most similar chunks in `embeddings` using pgvector.
- Sends question + top chunks to GPT-3.5/4 for answer.
- Stores answer in `ai_tasks` (type='Chat').

**Example:**
- Bob asks: “What is the payment term?”
- Backend finds chunk: “Payment shall be remitted within 45 days of invoice.”
- Model answers: “The payment term is 45 days from invoice.”
- Store:
```sql
INSERT INTO ai_tasks (contract_id, version_id, type, status, result)
VALUES ('C1', 'V1', 'Chat', 'Completed', '{"question": "...", "answer": "...", "citations": [...]}');
```

---

## 4. Summary: User Journey & Data Flow

1. **Registration/Login:**  
   Users are created in `users`.

2. **Contract Creation:**  
   CM creates a contract (`contracts`), uploads version (`contract_versions`), assigns participants (`contract_participants`).

3. **AI Processing:**  
   On version upload, AI tasks are created (`ai_tasks`), embeddings generated (`embeddings`).

4. **Collaboration:**  
   Comments are added (`comments`), notifications sent (`notifications`).

5. **Review & Signing:**  
   AS/CM sign in order (`contract_participants` status updated), audit trail logged (`audit_log`).

6. **RAG Chat & AI Add-ons:**  
   Users interact with AI features, results stored in `ai_tasks` and `embeddings`.

7. **Versioning & Edge Cases:**  
   New versions repeat the flow, with diffs and risk re-analysis.

8. **Expiry & Renewal:**  
   Notifications and status updates as expiry approaches.

9. **Data Retrieval:**  
   All data is queryable by user, contract, version, or role, supporting dashboards and audit.
