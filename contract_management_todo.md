## GLOBAL SPECIFICATIONS TO MAINTAIN

### UX Frame Requirements
- [ ] **Top-Navigation Bar** (visible after login)
  - [ ] Logo (left) - returns to dashboard on click
  - [ ] "Contracts" link - always highlighted state
  - [ ] "Tasks" link - red badge shows open count number
  - [ ] Profile avatar (right) - opens dropdown with Settings, Logout options

- [ ] **Page Shell Layout**
  - [ ] Max-width 1280px, centered on page
  - [ ] "Cloud Background" color (#F7F7F7) applied to body
  - [ ] Content area uses exactly 24px vertical rhythm spacing
  - [ ] All interactive accents use "Coral Primary" (#FF385C)
  - [ ] Body text and icons use "Ink Text" (#222222)

- [ ] **PDF Viewer Pattern**
  - [ ] Left 70% - PDF pages display area
  - [ ] Right 30% - contextual panel (Tabs or Comments)
  - [ ] Mobile (<768px) - panels collapse to bottom drawer

---

## PHASE 0 – REPO & INFRASTRUCTURE ⚡ MUST

### Backend Infrastructure Tasks
- [ ] **B-01: Authentication System**
  - [ ] `/auth/login` - Email/password authentication via Supabase
  - [ ] `/auth/refresh` - JWT token refresh endpoint
  - [ ] `/auth/reset-password` - Password reset flow
  - [ ] Supabase JWT middleware for protected routes
  - [ ] User session management and token validation


### Frontend Foundation Tasks
- [ ] **F-01: Auth Form Component** (Screens 00, 01, 03)
  - [ ] Email input field with validation
  - [ ] Password input field with show/hide toggle
  - [ ] Login button with loading state
  - [ ] "Forgot Password" link functionality
  - [ ] Supabase-UI hooks integration
  - [ ] Form error handling and display
  - [ ] Redirect logic after successful authentication

- [ ] **Base Theme Implementation**
  - [ ] CSS variables setup for color palette
  - [ ] Typography system (font families, sizes, weights)
  - [ ] Base component styling framework
  - [ ] Responsive breakpoints configuration
  - [ ] Icon system integration

**Phase 0 Completion Criteria**: All users can authenticate and see basic UI framework

---

## PHASE 1 – AUTHENTICATION & ROUTING ⚡ MUST

### Backend Authentication Tasks
- [ ] **JWT + /me Endpoint**
  - [ ] `/me` endpoint returning user profile and role
  - [ ] JWT token validation middleware
  - [ ] Role-based access control (CM/AS/CO)
  - [ ] User permissions mapping
  - [ ] Session timeout handling

### Frontend Routing Tasks
- [ ] **Role Router Implementation**
  - [ ] Route protection based on user roles
  - [ ] CM (Contract Manager) dashboard access
  - [ ] AS (Authorised Signatory) limited access
  - [ ] CO (Contract Observer) read-only access
  - [ ] Unauthorized access redirects
  - [ ] Role-specific navigation menu items

**Phase 1 Completion Criteria**: Users see appropriate interface based on their role

---

## PHASE 2 – UPLOAD + AI PROCESSING ⚡ MUST

### Backend Core Services
- [ ] **B-02: Contract Upload Endpoint**
  - [ ] `POST /contracts` - File upload with metadata
  - [ ] PDF file validation (size, format, corruption check)
  - [ ] Pre-signed URL generation for file storage
  - [ ] Contract metadata extraction and storage
  - [ ] Initial contract status setting to "Processing"

- [ ] **B-05: AI Processing Pipeline (Celery task)**
  - [ ] PDF text extraction using OCR/text parsing
  - [ ] Text chunking for AI processing
  - [ ] Queue management for AI tasks
  - [ ] Error handling and retry logic
  - [ ] Processing status updates via WebSocket

### Backend AI Services (Detailed)
- [ ] **AI-01: Clause Extraction Task**
  - [ ] GPT-4o API integration for clause analysis
  - [ ] Extract exactly 4 key clauses minimum
  - [ ] Format output as structured JSON
  - [ ] Include "other_clauses[]" array for additional clauses
  - [ ] Clause categorization (termination, payment, liability, etc.)
  - [ ] Confidence scoring for each extracted clause

- [ ] **AI-02: Risk Assessment Task**
  - [ ] GPT-4o API integration for risk analysis
  - [ ] Identify high/medium/low risk clauses
  - [ ] Generate risk descriptions and recommendations
  - [ ] PDF coordinate mapping for risk highlights
  - [ ] Risk severity scoring algorithm
  - [ ] Legal risk categorization

- [ ] **AI-03: Document Embedding Task**
  - [ ] text-embedding-3-small API integration
  - [ ] Text chunking strategy (overlap, size optimization)
  - [ ] pgvector database storage setup
  - [ ] Embedding indexing for fast retrieval
  - [ ] Chunk metadata storage (page numbers, sections)

- [ ] **AI-04: RAG Chat Endpoint**
  - [ ] `POST /ai/chat` - Question answering system
  - [ ] pgvector similarity search implementation
  - [ ] Context retrieval and ranking
  - [ ] GPT-3.5 API integration for responses
  - [ ] Chat history management
  - [ ] Response citation with source references

- [ ] **AI-06: Cost-Guard Middleware**
  - [ ] Token usage tracking per user/contract/day
  - [ ] 2,000 token daily limit enforcement
  - [ ] Usage analytics and reporting
  - [ ] Cost calculation and alerts
  - [ ] Rate limiting implementation

- [ ] **AI-07: WebSocket AI Events**
  - [ ] `ai_ready` event payload structure
  - [ ] Real-time progress updates during processing
  - [ ] Error event broadcasting
  - [ ] Client reconnection handling

- [ ] **WebSocket Infrastructure**
  - [ ] Supabase real-time subscriptions setup
  - [ ] Event broadcasting system
  - [ ] Client connection management
  - [ ] Message queuing and delivery guarantees

### Frontend Dashboard & Upload
- [ ] **F-02: Dashboard Tiles** (Screen 05-CM)
  - [ ] "Draft" tile with count and click handler
  - [ ] "Review" tile with pending review count
  - [ ] "Await Sign" tile with signature pending count
  - [ ] "Signed" tile with completed contracts count
  - [ ] "Expiring" tile with expiry warnings count
  - [ ] Tile hover effects and animations
  - [ ] Real-time count updates via WebSocket

- [ ] **F-04: Upload Wizard Modal** (Screen 06)
  - [ ] Step 1: File selection with drag-and-drop
  - [ ] Step 2: Contract metadata form (title, parties, expiry)
  - [ ] Step 3: Upload confirmation and progress
  - [ ] File validation feedback (size, format)
  - [ ] Progress bar during upload
  - [ ] Success/error state handling
  - [ ] Modal close and reset functionality

- [ ] **F-05: Contract Header** (Screen 07-*)
  - [ ] Contract title display and editing (CM only)
  - [ ] Status chip with color coding (Draft/Review/Signed)
  - [ ] Expiry date banner with countdown
  - [ ] Last modified timestamp
  - [ ] Contract parties information
  - [ ] Action buttons contextual to user role

- [ ] **F-06: Tabs Component** (Screen 07-*)
  - [ ] Tab navigation: Overview, Versions, Diff, Clauses, Risk, Chat, Comments, Audit
  - [ ] Active tab highlighting with Coral Primary
  - [ ] Tab content lazy loading
  - [ ] Keyboard navigation support
  - [ ] Responsive tab collapsing on mobile
  - [ ] Tab state persistence across page reloads

### Frontend AI Components (Detailed)
- [ ] **F-16: Clauses Tab Table**
  - [ ] Render AI-01 JSON data as structured table
  - [ ] Columns: Clause Type, Content Preview, Page Reference, Confidence
  - [ ] Click row → PDF highlight with scroll-to-page
  - [ ] Search/filter functionality within clauses
  - [ ] Export clauses to CSV/PDF
  - [ ] Clause editing capability (CM only)

- [ ] **F-17: Risk Tab List**
  - [ ] Render AI-02 JSON data as categorized list
  - [ ] Risk severity badges with color coding:
    - [ ] High: Coral (#FF385C)
    - [ ] Medium: Ink at 70% opacity
    - [ ] Low: Ink at 40% opacity
  - [ ] Hover → PDF overlay with red outline boxes
  - [ ] Risk description expandable cards
  - [ ] Risk mitigation recommendations
  - [ ] Risk acknowledgment checkboxes (AS role)

- [ ] **F-18: Chat Widget Enhancements**
  - [ ] Token counter display (used/remaining of 2,000)
  - [ ] Send button disabled when cap reached
  - [ ] Reset time tooltip (00:00 UTC)
  - [ ] Message thread display with timestamps
  - [ ] Source citations for AI responses
  - [ ] Copy response button
  - [ ] Chat history persistence

- [ ] **F-19: AI Updating Overlay**
  - [ ] Dimmed tabs during AI processing
  - [ ] Loading spinner with processing status
  - [ ] Progress percentage display
  - [ ] Cancel processing option
  - [ ] Error state handling with retry button
  - [ ] Estimated completion time

- [ ] **F-09: Chat Widget (Read-only Phase)**
  - [ ] Chat interface layout and styling
  - [ ] Message bubble design (user vs AI)
  - [ ] Input field with send button
  - [ ] RAG Q&A display formatting
  - [ ] WebSocket connection for real-time responses

**Phase 2 Completion Criteria**: PDF uploads process within 60 seconds, AI clauses and risks display correctly, basic chat functionality works

---

## PHASE 3 – VERSIONS & DOCUMENT COMPARISON ⚡ MUST

### Backend Version Management
- [ ] **B-04: Versions Endpoint**
  - [ ] `GET /contracts/{id}/versions` - List all versions
  - [ ] `POST /contracts/{id}/versions` - Upload new version
  - [ ] Version numbering system (v1, v2, v3...)
  - [ ] Version metadata storage (upload date, user, comments)
  - [ ] File storage with version paths
  - [ ] Version access permissions (CM can upload, AS/CO read-only)

- [ ] **B-06: AI Diff Endpoint**
  - [ ] `POST /ai/diff` - Compare two versions
  - [ ] Text-based difference calculation
  - [ ] Visual diff formatting for frontend
  - [ ] Page-by-page comparison logic
  - [ ] Change categorization (added, removed, modified)

- [ ] **AI-05: Diff Summary Task**
  - [ ] GPT-3.5 API integration for summary generation
  - [ ] Maximum 5 bullet points constraint
  - [ ] Reference correct clause numbers
  - [ ] Highlight significant changes only
  - [ ] Change impact analysis

### Frontend Version Management
- [ ] **F-07: Versions Tab** (Screen 07-*)
  - [ ] Version list with upload dates and users
  - [ ] Version selection checkboxes (compare any two)
  - [ ] Upload new version button (CM only)
  - [ ] Version download links
  - [ ] Version comparison trigger
  - [ ] Version deletion option (CM only with confirmation)

- [ ] **F-08: Diff Tab** (Screen 07-*)
  - [ ] Side-by-side PDF comparison view
  - [ ] Change highlighting (green additions, red deletions)
  - [ ] Synchronized scrolling between versions
  - [ ] Jump to next/previous change buttons
  - [ ] Zoom controls for detailed comparison
  - [ ] Print/export diff report

- [ ] **F-20: Diff Tab Summary**
  - [ ] Display AI-05 bullet summary above comparison
  - [ ] Expandable summary section
  - [ ] Link bullet points to specific changes
  - [ ] Summary regeneration option
  - [ ] Change statistics (X additions, Y deletions)

### Version Interactions
- [ ] **Auto-trigger Diff Updates**
  - [ ] Opening Versions tab auto-triggers diff when two versions selected
  - [ ] Loading states during diff calculation
  - [ ] Error handling for diff generation failures
  - [ ] Cache diff results for performance

**Phase 3 Completion Criteria**: Users can upload new versions, see side-by-side diffs, and get AI-generated change summaries

---

## PHASE 4 – COMMENTS & COLLABORATION ⚡ MUST

### Backend Comment System
- [ ] **B-07: Comments CRUD Operations**
  - [ ] `GET /comments/{contract_id}` - Fetch comment threads
  - [ ] `POST /comments` - Create new comment
  - [ ] `POST /comments/{id}/reply` - Reply to comment
  - [ ] `PUT /comments/{id}` - Edit comment (author only)
  - [ ] `DELETE /comments/{id}` - Delete comment (author only)
  - [ ] Comment threading and nesting logic
  - [ ] Comment status tracking (open, resolved, closed)

- [ ] **WebSocket Comment Events**
  - [ ] `comment_new` event broadcasting
  - [ ] `comment_reply` event broadcasting
  - [ ] `comment_resolved` event broadcasting
  - [ ] Real-time notifications to relevant users
  - [ ] Comment typing indicators

### Frontend Comment System
- [ ] **F-10: Comments Panel** (Screen 07-*)
  - [ ] Threaded comment display with indentation
  - [ ] Add new comment form with rich text editor
  - [ ] Reply to comment functionality
  - [ ] Comment author and timestamp display
  - [ ] Edit/delete options for comment authors
  - [ ] Comment resolution toggle (CM only)
  - [ ] Read-only mode when contract is Signed
  - [ ] Comment search and filtering

- [ ] **Request-Change Banner**
  - [ ] Display when comments require action from user
  - [ ] Action button to resolve pending comments
  - [ ] Comment count display in banner
  - [ ] Dismiss banner option
  - [ ] Priority highlighting for urgent comments

### Comment Persistence
- [ ] **Comment Version Tracking**
  - [ ] Comments persist across contract versions
  - [ ] Version-specific comment display
  - [ ] Comment migration between versions
  - [ ] Historical comment preservation

**Phase 4 Completion Criteria**: Users can add comments, reply in threads, and see real-time comment updates

---

## PHASE 5 – DIGITAL SIGNING & DOCUMENT SEALING ⚡ MUST

### Backend Signing Infrastructure
- [ ] **B-08: Sign Endpoint**
  - [ ] `POST /sign` - Capture digital signature
  - [ ] Signature validation and verification
  - [ ] Multi-party signing workflow (AS → CM counter-sign)
  - [ ] Signature metadata storage (timestamp, IP, user agent)
  - [ ] Legal text acceptance logging
  - [ ] Signature certificate generation

- [ ] **B-09: Sealing Routine**
  - [ ] PDF document stamping with signatures
  - [ ] Digital signature certificate creation
  - [ ] Document hash generation for integrity
  - [ ] Sealed document storage with timestamp
  - [ ] Original document preservation
  - [ ] Certificate chain validation

- [ ] **B-10: Realtime Events**
  - [ ] `ai_ready` event when processing completes
  - [ ] `comment_new` event for new comments
  - [ ] `contract_signed` event when fully executed
  - [ ] `signing_requested` event for signature workflow
  - [ ] Event payload standardization

### Frontend Signing Interface
- [ ] **F-11: Sign Modal** (Screen 07-*)
  - [ ] Digital signature canvas with drawing tools
  - [ ] Legal text display with scroll requirement
  - [ ] "I agree" confirmation checkbox
  - [ ] Sign button with confirmation dialog
  - [ ] Signature preview before submission
  - [ ] Clear signature option
  - [ ] Cancel signing option

- [ ] **F-12: Signed Banner** (Screens 10, 08-AS)
  - [ ] Green status chip indicating "Signed" status
  - [ ] Download signed document button
  - [ ] Download signature certificate button
  - [ ] Signing completion timestamp
  - [ ] All parties signed confirmation
  - [ ] Chat widget disabled state
  - [ ] Read-only mode activation

### Signing Workflow
- [ ] **Multi-party Signing Process**
  - [ ] AS (Authorised Signatory) signs first
  - [ ] Notification sent to CM for counter-signature
  - [ ] CM counter-signature completion
  - [ ] Final document sealing and distribution
  - [ ] Email notifications to all parties

**Phase 5 Completion Criteria**: Complete signing workflow with sealed PDF and certificate generation

---

## PHASE 6 – CONTRACT LIFECYCLE MANAGEMENT 📋 SHOULD

### Backend Lifecycle Services
- [ ] **B-11: Cron Jobs**
  - [ ] Daily expiry date monitoring
  - [ ] 30-day expiry warning emails
  - [ ] 7-day expiry urgent emails
  - [ ] 1-day expiry final warning emails
  - [ ] Contract renewal reminder system
  - [ ] Automated status updates

- [ ] **B-12: View-Receipt Endpoint**
  - [ ] `POST /view-receipt` - Debounced view tracking
  - [ ] User activity logging
  - [ ] Last viewed timestamp updates
  - [ ] View analytics collection
  - [ ] Access audit trail

### Frontend Lifecycle Management
- [ ] **F-13: Expiry Banner** (Any detail screen)
  - [ ] Yellow banner for 30-day warning
  - [ ] Red banner for 7-day urgent warning
  - [ ] Renew CTA button functionality
  - [ ] Countdown timer display
  - [ ] Dismiss banner option
  - [ ] Expiry date editing (CM only)

- [ ] **Dashboard Tile Counts**
  - [ ] Real-time count updates
  - [ ] Expiring contracts highlighting
  - [ ] Status-based filtering
  - [ ] Quick action buttons on tiles

### Email Notifications
- [ ] **Expiry Email Templates**
  - [ ] 30-day warning template
  - [ ] 7-day urgent template
  - [ ] 1-day final warning template
  - [ ] Renewal completion confirmation
  - [ ] Personalized email content

**Phase 6 Completion Criteria**: Automatic expiry monitoring with email notifications and dashboard updates

---

## PHASE 7 – NOTIFICATIONS & USER EXPERIENCE 📋 SHOULD

### Backend Notification Services
- [ ] **Email Templates**
  - [ ] Contract uploaded notification
  - [ ] Signature request notification
  - [ ] Comment added notification
  - [ ] Contract signed confirmation
  - [ ] Version updated notification
  - [ ] Expiry warning notifications

- [ ] **Rate Limits** (skipping for now)
  - [ ] API endpoint rate limiting
  - [ ] Email sending rate limits
  - [ ] User action throttling
  - [ ] Abuse prevention measures

### Frontend Notification System
- [ ] **F-14: Notification Bell** (All screens)
  - [ ] Real-time toast notifications
  - [ ] Notification history panel
  - [ ] Mark as read functionality
  - [ ] Notification filtering options
  - [ ] Sound alerts toggle
  - [ ] Desktop push notifications

- [ ] **Settings Page**
  - [ ] Email notification preferences
  - [ ] Real-time notification toggle
  - [ ] Sound alert preferences
  - [ ] Theme selection
  - [ ] Language selection
  - [ ] Account management options

- [ ] **F-21: Cost Badge** (Optional)
  - [ ] Daily token usage display
  - [ ] Usage vs 2,000 limit visualization
  - [ ] Cost tracking analytics
  - [ ] Usage history chart
  - [ ] Alert threshold settings

**Phase 7 Completion Criteria**: Complete notification system with user preference controls

---

## PHASE 8 – DOCUMENTATION & DEMO ⚡ MUST

### Backend Documentation
- [ ] **OpenAPI Documentation**
  - [ ] Complete API endpoint documentation
  - [ ] Request/response schemas
  - [ ] Authentication examples
  - [ ] Error response documentation
  - [ ] Rate limiting information

- [ ] **Postman Collection**
  - [ ] All API endpoints with examples
  - [ ] Environment variables setup
  - [ ] Authentication flow examples
  - [ ] Test data and scenarios

### Frontend Documentation
- [ ] **README with GIFs**
  - [ ] Installation and setup instructions
  - [ ] Feature demonstrations with GIFs
  - [ ] User role explanations
  - [ ] Troubleshooting guide
  - [ ] Development environment setup

- [ ] **Loom Demo Video**
  - [ ] Complete product walkthrough
  - [ ] Role-based feature demonstrations
  - [ ] AI capabilities showcase
  - [ ] Signing workflow demonstration
  - [ ] Admin and user perspectives

**Phase 8 Completion Criteria**: Complete documentation and demo materials ready for stakeholder review

---

## DETAILED QUALITY ASSURANCE CHECKPOINTS

### Phase-by-Phase Testing Requirements

#### **T-1: Authentication Testing**
- [ ] Create CM user account successfully
- [ ] Create AS user account successfully  
- [ ] Create CO user account successfully
- [ ] Verify role router directs CM to full dashboard
- [ ] Verify role router limits AS to signing-only interface
- [ ] Verify role router limits CO to read-only interface
- [ ] Test password reset functionality
- [ ] Test session timeout and re-authentication

#### **T-2: Upload and AI Processing**
- [ ] Upload PDF contract file
- [ ] Verify AI processing starts within 5 seconds
- [ ] Verify AI clauses appear within 60 seconds
- [ ] Check clause extraction accuracy (4+ clauses)
- [ ] Verify risk assessment displays with severity levels
- [ ] Test chat functionality with basic questions
- [ ] Verify token counter displays and decrements

#### **T-A1: Detailed AI Testing**
- [ ] Upload NDA contract
- [ ] Verify Clauses tab lists exactly 4 canonical clauses minimum
- [ ] Verify "other_clauses[]" array populated if applicable
- [ ] Check Risk tab shows at least one highlight if "indemnify" clause present
- [ ] Verify risk severity badges use correct colors
- [ ] Test PDF highlight functionality when clicking clause rows
- [ ] Verify embedding search works in chat

#### **T-3: Version Management**
- [ ] Upload second version of contract
- [ ] Verify version list shows v1 and v2
- [ ] Select both versions for comparison
- [ ] Verify Diff tab shows side-by-side comparison
- [ ] Check diff highlights additions in green, deletions in red
- [ ] Verify 3-bullet summary appears above diff

#### **T-A3: Advanced Diff Testing**
- [ ] Upload contract version 2 with specific changes
- [ ] Verify Diff tab shows ≤5-bullet summary
- [ ] Check summary references correct clause numbers
- [ ] Verify summary highlights only significant changes
- [ ] Test synchronized scrolling between versions
- [ ] Verify jump to next/previous change functionality

#### **T-4: Comment Collaboration**
- [ ] AS user adds comment to contract
- [ ] Verify CM user receives real-time notification
- [ ] CM user replies to AS comment
- [ ] Verify comment thread displays correctly
- [ ] Check thread persistence when uploading v2
- [ ] Test comment resolution workflow
- [ ] Verify read-only mode after signing

#### **T-A4: Risk Interaction Testing**
- [ ] Hover over risk item in Risk tab
- [ ] Verify red outline appears on PDF at correct location
- [ ] Move mouse away from risk item
- [ ] Verify red outline disappears on mouse-out
- [ ] Test risk item click functionality
- [ ] Verify risk descriptions expand correctly

#### **T-5: Complete Signing Workflow**
- [ ] AS user initiates signing process
- [ ] Verify sign modal opens with canvas
- [ ] AS user draws signature on canvas
- [ ] AS user checks "I agree" checkbox
- [ ] AS user confirms signature
- [ ] Verify CM receives signing notification
- [ ] CM user counter-signs document
- [ ] Verify sealed PDF generated successfully
- [ ] Verify signature certificate downloadable
- [ ] Check both parties can download signed documents

#### **T-6: Expiry Management**
- [ ] Set contract expiry date to 30 days from now
- [ ] Verify yellow expiry banner appears
- [ ] Force expiry date to 7 days from now
- [ ] Verify banner changes to red
- [ ] Check reminder email sent to appropriate parties
- [ ] Test renew CTA functionality
- [ ] Verify dashboard tile counts update

#### **T-7: Notification Preferences**
- [ ] Access Settings page
- [ ] Toggle email notifications off
- [ ] Perform action that would normally send email
- [ ] Verify no email sent when disabled
- [ ] Toggle real-time notifications off
- [ ] Verify toasts suppressed appropriately
- [ ] Re-enable notifications and verify functionality restored

### UI Interaction Testing
- [ ] **Versions Tab Auto-trigger**: Opening Versions tab with two versions selected automatically updates Diff tab
- [ ] **Risk Hover Overlay**: Risk list hover draws red boxes on PDF canvas overlay at correct coordinates
- [ ] **Token Counter Behavior**: Chat token counter decrements client-side; send button greys out at cap with reset time tooltip
- [ ] **PDF Highlight Accuracy**: Clicking clause rows highlights correct text sections in PDF viewer
- [ ] **Mobile Responsiveness**: All panels collapse correctly to bottom drawer on mobile (<768px)
- [ ] **WebSocket Reliability**: Real-time events work consistently across browser refreshes and network interruptions

### Color and Layout Validation
- [ ] **Clause Selection**: Selected clause row shows Coral underline + bold Ink text
- [ ] **Risk Severity Badges**: 
  - [ ] High: Coral (#FF385C)
  - [ ] Medium: Ink at 70% opacity
  - [ ] Low: Ink at 40% opacity
- [ ] **Page Layout**: Max-width 1280px maintained, content uses 24px vertical rhythm
- [ ] **PDF Viewer**: Maintains 70% left / 30% right split on desktop
- [ ] **Navigation**: "Contracts" link always highlighted, "Tasks" link shows red badge with count

### Performance and Reliability Testing
- [ ] **AI Processing Speed**: Contract processing completes within 60 seconds for typical documents
- [ ] **Chat Response Time**: AI chat responses return within 10 seconds
- [ ] **File Upload Speed**: PDF uploads complete within 30 seconds for files up to 50MB
- [ ] **Real-time Updates**: WebSocket events appear within 2 seconds across all connected clients
- [ ] **Token Limit Enforcement**: System blocks requests when 2,000 daily token limit reached
- [ ] **Rate Limiting**: Chat limited to 8 messages per minute per user

### Security and Access Control Testing
- [ ] **Role Permissions**: CM can upload, AS can only sign, CO can only view
- [ ] **Document Access**: Users can only access contracts they're authorized for
- [ ] **Signature Integrity**: Signed documents cannot be modified after sealing
- [ ] **Token Security**: JWT tokens expire appropriately and refresh correctly
- [ ] **File Security**: PDF files accessible only via pre-signed URLs with proper authentication

---

## TECHNICAL SPECIFICATIONS COMPLIANCE

### API Contract Requirements
- [ ] OpenAPI specification locked for endpoints B-02 through B-09
- [ ] Frontend can stub JSON responses during parallel development
- [ ] All API responses follow consistent error handling format
- [ ] Request/response validation implemented
- [ ] Proper HTTP status codes used throughout

### Real-time Event System
- [ ] Supabase real-time subscriptions configured
- [ ] Frontend can subscribe to events before backend emits them
- [ ] Event payload standardization maintained
- [ ] Connection retry logic implemented
- [ ] Event ordering guaranteed

### File Storage System
- [ ] PDFs stored via pre-signed URLs
- [ ] Frontend never blocks on backend file streaming
- [ ] Version files stored with proper naming convention
- [ ] File integrity verification on upload
- [ ] Secure file access with time-limited URLs

### Color Palette Enforcement
- [ ] Only three approved colors used throughout:
  - [ ] Coral Primary (#FF385C) - interactive accents
  - [ ] Ink Text (#222222) - body text and icons  
  - [ ] Cloud Background (#F7F7F7) - page background
- [ ] No additional palette entries beyond approved colors
- [ ] Consistent color usage across all components

### Layout Standards Compliance
- [ ] Typography system fixed - no frontend wait on design decisions
- [ ] 24px vertical rhythm maintained throughout
- [ ] Mobile breakpoint (<768px) behavior standardized
- [ ] PDF viewer layout ratios maintained (70%/30%)
- [ ] Responsive design patterns consistent

---

## PROJECT MANAGEMENT NOTES

### Team Independence Requirements
- [ ] Backend and Frontend teams can work simultaneously within each phase
- [ ] API contracts defined clearly for parallel development
- [ ] Mock data available for frontend development
- [ ] Design system specifications locked to prevent blocking
- [ ] WebSocket event schemas defined upfront

### Phase Gate Requirements
- [ ] Each phase must pass ALL specified tests before proceeding
- [ ] No phase can begin until previous phase completion criteria met
- [ ] Quality assurance checkpoints mandatory at each phase end
- [ ] Stakeholder approval required before advancing phases
- [ ] Documentation updates required at each phase completion

### Scope Control
- [ ] No new features added without updating this specification
- [ ] All scope changes require stakeholder approval
- [ ] PRD updates mandatory before implementation changes
- [ ] Change requests must include impact analysis
- [ ] Feature modifications require test plan updates

---

*Check each box as tasks are completed and tested. All boxes must be checked before considering the project complete. This specification contains every feature, interaction, and requirement from the original documentation without modification or assumption.*