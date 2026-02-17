# Immediate Next Steps - Implementation Guide

This document provides actionable steps for the development team to continue building the WhatsApp Bulk SaaS platform.

---

## 🎯 Priority 1: WhatsApp Business API Integration (Week 1-2)

### Prerequisites
1. **WhatsApp Business Account Setup**
   - [ ] Create a Meta Business Account at [business.facebook.com](https://business.facebook.com)
   - [ ] Apply for WhatsApp Business API access
   - [ ] Register a phone number for testing
   - [ ] Get API credentials (App ID, App Secret, Phone Number ID)

2. **Environment Variables**
   Create `.env.local` file with:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:4000
   NEXT_PUBLIC_API_VERSION=v1
   NEXT_PUBLIC_WHATSAPP_APP_ID=your_app_id
   ```

### Backend Tasks (Priority)

#### 1. WhatsApp API Integration
```javascript
// Backend: /api/whatsapp/send-message
POST /api/v1/whatsapp/send
{
  "to": "+1234567890",
  "message": "Hello from WhatsApp Bulk SaaS",
  "templateId": "optional_template_id"
}
```

**Implementation:**
- Install WhatsApp Cloud API SDK
- Create message sending service
- Handle webhook for delivery status
- Implement rate limiting (80 messages/second for Cloud API)

#### 2. WhatsApp Connection Flow
```javascript
// Backend: /api/whatsapp/connect
POST /api/v1/whatsapp/connect
{
  "wabaId": "whatsapp_business_account_id",
  "phoneNumberId": "phone_number_id",
  "accessToken": "encrypted_access_token"
}
```

#### 3. Webhook Endpoint
```javascript
// Backend: /api/whatsapp/webhook
GET /api/v1/whatsapp/webhook (for verification)
POST /api/v1/whatsapp/webhook (for status updates)
```

### Frontend Tasks (Priority)

#### 1. Create WhatsApp Connection Page
```
src/app/dashboard/whatsapp/connect/page.tsx
```

**Features:**
- Multi-step form (Account Selection → Phone Number → Verification)
- Save WABA ID and Phone Number ID to user profile
- Display connection status

**Component Structure:**
```tsx
<WhatsAppConnectionWizard>
  <Step1_SelectAccount />
  <Step2_SelectPhoneNumber />
  <Step3_Verification />
  <Step4_Success />
</WhatsAppConnectionWizard>
```

#### 2. Create Send Message Page
```
src/app/dashboard/messages/send/page.tsx
```

**Features:**
- Phone number input (with validation)
- Message text area
- Template selector (if templates exist)
- Send button
- Success/error feedback

#### 3. Update Dashboard
Add connection status widget:
```tsx
// src/app/dashboard/page.tsx
{user?.wabaId ? (
  <ConnectionStatus phoneNumber={user.phoneNumberId} />
) : (
  <ConnectWhatsAppButton />
)}
```

---

## 🎯 Priority 2: Contact Management (Week 3-4)

### Database Schema (Backend)

```sql
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  phone_number VARCHAR(20) NOT NULL,
  name VARCHAR(255),
  email VARCHAR(255),
  tags TEXT[], -- PostgreSQL array
  metadata JSONB, -- Custom fields
  opted_in BOOLEAN DEFAULT false,
  opted_in_at TIMESTAMP,
  opted_out_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, phone_number)
);

CREATE INDEX idx_contacts_user_id ON contacts(user_id);
CREATE INDEX idx_contacts_phone ON contacts(phone_number);
CREATE INDEX idx_contacts_tags ON contacts USING GIN(tags);
```

### Backend API Endpoints

```javascript
// Contact CRUD
GET    /api/v1/contacts           // List with pagination, search, filters
POST   /api/v1/contacts           // Create single contact
GET    /api/v1/contacts/:id       // Get contact details
PUT    /api/v1/contacts/:id       // Update contact
DELETE /api/v1/contacts/:id       // Delete contact
POST   /api/v1/contacts/bulk      // Bulk import from CSV
DELETE /api/v1/contacts/bulk      // Bulk delete
PUT    /api/v1/contacts/bulk/tag  // Bulk add tags
```

### Frontend Pages

#### 1. Contact List Page
```
src/app/dashboard/contacts/page.tsx
```

**Features:**
- Data table with pagination
- Search by name/phone/email
- Filter by tags
- Bulk select and actions
- Add contact button
- Export button

#### 2. Add/Edit Contact Form
```
src/app/dashboard/contacts/new/page.tsx
src/app/dashboard/contacts/[id]/edit/page.tsx
```

**Form Fields:**
- Phone number (required, validated)
- Name
- Email
- Tags (multi-select)
- Custom fields (dynamic)
- Opt-in status

#### 3. Bulk Import Page
```
src/app/dashboard/contacts/import/page.tsx
```

**Features:**
- CSV file upload
- Column mapping interface
- Preview table (first 10 rows)
- Validation results
- Import progress bar

**CSV Format:**
```csv
phone,name,email,tags
+1234567890,John Doe,john@example.com,customer;vip
+0987654321,Jane Smith,jane@example.com,lead
```

---

## 🎯 Priority 3: Template Management (Week 5-6)

### Database Schema (Backend)

```sql
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL, -- MARKETING, UTILITY, AUTHENTICATION
  language VARCHAR(10) DEFAULT 'en',
  header_type VARCHAR(20), -- TEXT, IMAGE, VIDEO, DOCUMENT
  header_content TEXT,
  body TEXT NOT NULL,
  footer TEXT,
  buttons JSONB, -- WhatsApp buttons
  variables TEXT[], -- Placeholder variables
  whatsapp_template_id VARCHAR(255), -- From WhatsApp Manager
  status VARCHAR(20) DEFAULT 'DRAFT', -- DRAFT, PENDING, APPROVED, REJECTED
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Backend API Endpoints

```javascript
GET    /api/v1/templates          // List templates
POST   /api/v1/templates          // Create template
GET    /api/v1/templates/:id      // Get template
PUT    /api/v1/templates/:id      // Update template
DELETE /api/v1/templates/:id      // Delete template
POST   /api/v1/templates/:id/submit  // Submit for WhatsApp approval
```

### Frontend Pages

#### 1. Template Library
```
src/app/dashboard/templates/page.tsx
```

**Features:**
- Grid/list view toggle
- Filter by status, category
- Search by name
- Template preview cards
- Approval status badges

#### 2. Template Builder
```
src/app/dashboard/templates/new/page.tsx
```

**Features:**
- Template name input
- Category selector (Marketing, Utility, Authentication)
- Language selector
- Header section (optional: text, image, video, document)
- Body editor with variable insertion `{{1}}`, `{{2}}`
- Footer input (optional)
- Button builder (Call to Action, Quick Reply)
- Live preview panel
- Save as draft / Submit for approval

#### 3. Template Preview Component
```tsx
// src/components/templates/TemplatePreview.tsx
<WhatsAppTemplatePreview
  header="Welcome to our service"
  body="Hi {{1}}, thanks for signing up!"
  footer="Powered by WhatsApp Bulk SaaS"
  buttons={[{ type: 'URL', text: 'Visit Website', url: 'https://example.com' }]}
  variables={{ 1: 'John' }}
/>
```

---

## 🛠️ Development Environment Setup

### 1. Install Dependencies
```bash
cd /home/runner/work/whatsapp-bulk-saas-frontend/whatsapp-bulk-saas-frontend
npm install
```

### 2. Create Environment File
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_API_VERSION=v1
```

### 3. Run Development Server
```bash
npm run dev
```

Application will be available at http://localhost:3001

### 4. Code Quality Tools (Recommended)

**Install Testing Libraries:**
```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom
npm install --save-dev @testing-library/user-event
```

**Install Prettier:**
```bash
npm install --save-dev prettier
```

Create `.prettierrc`:
```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

**Install Husky (Git Hooks):**
```bash
npm install --save-dev husky lint-staged
npx husky init
```

---

## 📦 Recommended NPM Packages

### For Immediate Implementation

```bash
# Data Tables
npm install @tanstack/react-table

# Charts for Analytics (later)
npm install recharts

# Date Picker for Campaign Scheduling
npm install react-datepicker @types/react-datepicker

# CSV Parsing for Contact Import
npm install papaparse @types/papaparse

# Toast Notifications
npm install sonner

# Icons
npm install lucide-react

# Drag and Drop (for CSV upload)
npm install react-dropzone

# Phone Number Validation
npm install libphonenumber-js
```

---

## 📋 File Structure to Create

```
src/
├── app/
│   └── dashboard/
│       ├── whatsapp/
│       │   └── connect/
│       │       └── page.tsx          [NEW]
│       ├── contacts/
│       │   ├── page.tsx              [NEW]
│       │   ├── new/
│       │   │   └── page.tsx          [NEW]
│       │   ├── [id]/
│       │   │   └── edit/
│       │   │       └── page.tsx      [NEW]
│       │   └── import/
│       │       └── page.tsx          [NEW]
│       ├── templates/
│       │   ├── page.tsx              [NEW]
│       │   ├── new/
│       │   │   └── page.tsx          [NEW]
│       │   └── [id]/
│       │       └── edit/
│       │           └── page.tsx      [NEW]
│       └── messages/
│           └── send/
│               └── page.tsx          [NEW]
├── components/
│   ├── whatsapp/
│   │   ├── ConnectionWizard.tsx      [NEW]
│   │   ├── ConnectionStatus.tsx      [NEW]
│   │   └── MessageComposer.tsx       [NEW]
│   ├── contacts/
│   │   ├── ContactTable.tsx          [NEW]
│   │   ├── ContactForm.tsx           [NEW]
│   │   ├── ContactImport.tsx         [NEW]
│   │   └── ContactFilters.tsx        [NEW]
│   └── templates/
│       ├── TemplateBuilder.tsx       [NEW]
│       ├── TemplatePreview.tsx       [NEW]
│       ├── TemplateLibrary.tsx       [NEW]
│       └── VariableEditor.tsx        [NEW]
├── lib/
│   └── api/
│       ├── whatsapp.ts               [NEW]
│       ├── contacts.ts               [NEW]
│       └── templates.ts              [NEW]
└── types/
    ├── whatsapp.ts                   [NEW]
    ├── contact.ts                    [NEW]
    └── template.ts                   [NEW]
```

---

## 🧪 Testing Checklist

### WhatsApp Integration Testing
- [ ] Can connect WhatsApp Business Account
- [ ] Can send a test message successfully
- [ ] Webhook receives delivery status updates
- [ ] Error handling for invalid phone numbers
- [ ] Rate limiting displays correctly

### Contact Management Testing
- [ ] Can add a single contact
- [ ] Can edit contact details
- [ ] Can delete a contact
- [ ] CSV import works with valid data
- [ ] CSV import shows errors for invalid data
- [ ] Search finds contacts correctly
- [ ] Filters work (tags, opt-in status)
- [ ] Bulk actions work (tag, delete)

### Template Management Testing
- [ ] Can create a new template
- [ ] Variable insertion works
- [ ] Preview displays correctly
- [ ] Can save as draft
- [ ] Can submit for approval (if connected to WhatsApp)
- [ ] Can edit existing template
- [ ] Can delete template

---

## 🔒 Security Checklist

- [ ] WhatsApp API tokens encrypted in database
- [ ] Phone numbers validated before sending
- [ ] Rate limiting implemented on message sending
- [ ] Webhook signature verification
- [ ] CSRF protection on all forms
- [ ] Input sanitization for XSS prevention
- [ ] SQL injection prevention (use parameterized queries)
- [ ] File upload validation (CSV only, max size limit)
- [ ] Opt-in/opt-out tracking for GDPR compliance

---

## 📞 Support Resources

### WhatsApp API
- [Cloud API Quick Start](https://developers.facebook.com/docs/whatsapp/cloud-api/get-started)
- [Message Templates Guide](https://developers.facebook.com/docs/whatsapp/message-templates/)
- [Webhook Setup](https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks)
- [Rate Limits](https://developers.facebook.com/docs/whatsapp/cloud-api/rate-limits)

### Next.js & React
- [Next.js App Router](https://nextjs.org/docs/app)
- [Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)

### Libraries
- [React Hook Form](https://react-hook-form.com/get-started)
- [Zod Validation](https://zod.dev/?id=primitives)
- [Tanstack Table](https://tanstack.com/table/v8/docs/guide/introduction)

---

## ✅ Definition of Done

### For WhatsApp Integration
- [ ] Code merged to main branch
- [ ] Backend API deployed
- [ ] Frontend deployed
- [ ] Can send test message successfully
- [ ] Connection status visible in dashboard
- [ ] Documentation updated
- [ ] Tests passing

### For Contact Management
- [ ] All CRUD operations working
- [ ] CSV import functional
- [ ] Search and filters working
- [ ] Bulk actions working
- [ ] Tests passing
- [ ] Documentation updated

### For Template Management
- [ ] Template builder functional
- [ ] Preview displays correctly
- [ ] Submission to WhatsApp working (if applicable)
- [ ] Tests passing
- [ ] Documentation updated

---

*Last Updated: February 17, 2026*
