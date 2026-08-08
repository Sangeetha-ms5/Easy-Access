import { useState, useRef, useEffect, type KeyboardEvent } from 'react'

// ─── Types ───────────────────────────────────────────────────────────────────

type Page =
  | 'home'
  | 'login'
  | 'otp'
  | 'find-schemes'
  | 'eligible-schemes'
  | 'scheme-details'
  | 'departments'
  | 'department-schemes'
  | 'eligibility-form'
  | 'apply'
  | 'my-applications'
  | 'application-tracking'
  | 'profile'
  | 'notifications'
  | 'dashboard'
  | 'nearest-office'

interface UserData {
  name: string
  phone: string
  address: string
  age: string
  occupation: string
  income: string
  state: string
  category: string
  disability: string
}

interface Scheme {
  id: string
  name: string
  department: string
  icon: string
  shortDesc: string
  benefit: string
  eligibility: string[]
  documents: string[]
  process: string[]
  color: string
}

interface ChatMessage {
  role: 'user' | 'ai' | 'rep'
  text: string
  time?: string
}

interface Application {
  id: string
  scheme: string
  department: string
  departmentIcon: string
  submitted: string
  status: 'submitted' | 'under-verification' | 'approved' | 'rejected'
  color: string
}

// ─── Data ────────────────────────────────────────────────────────────────────

const STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh',
  'Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka',
  'Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram',
  'Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu',
  'Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal',
  'Delhi','Jammu & Kashmir',
]

const SCHEMES: Scheme[] = [
  {
    id: 'pm-kisan',
    name: 'PM-KISAN Samman Nidhi',
    department: 'Agriculture & Farmers Welfare',
    icon: '🌾',
    shortDesc: 'Direct income support of ₹6,000/year to eligible farmer families in three equal installments.',
    benefit: '₹6,000 per year in 3 installments of ₹2,000 each directly to bank account',
    eligibility: ['Age: 18 years and above','Must own agricultural land','Annual income below ₹2 lakh','Small and marginal farmers','Valid Aadhaar card required'],
    documents: ['Aadhaar Card','Land ownership documents','Bank account passbook','Mobile number linked to Aadhaar'],
    process: ['Register on PM-KISAN portal or visit nearest CSC','Upload required documents','Verification by state government','Approval and DBT transfer to bank account'],
    color: '#16a34a',
  },
  {
    id: 'scholarship',
    name: 'National Scholarship Scheme',
    department: 'Education Department',
    icon: '🎓',
    shortDesc: 'Merit-based scholarship for students from economically weaker sections pursuing higher education.',
    benefit: 'Up to ₹50,000/year for tuition + ₹12,000/year for maintenance allowance',
    eligibility: ['Age: 17–25 years','Minimum 60% marks in last exam','Annual family income below ₹2.5 lakh','Admitted to recognized institution'],
    documents: ['Aadhaar Card','Income certificate','Last marksheet','Caste certificate (if applicable)','Bank passbook','Admission letter'],
    process: ['Apply on National Scholarship Portal','Upload verified documents','Institute verification','Ministry approval and scholarship disbursement'],
    color: '#7c3aed',
  },
  {
    id: 'ayushman',
    name: 'Ayushman Bharat – PMJAY',
    department: 'Health Department',
    icon: '🏥',
    shortDesc: 'Health coverage of ₹5 lakh per family per year for secondary and tertiary hospitalization.',
    benefit: '₹5,00,000 per family per year for medical treatment at empanelled hospitals',
    eligibility: ['Family listed in SECC 2011 database','Annual income below ₹3 lakh','No existing ESI/CGHS coverage','Valid Aadhaar card'],
    documents: ['Aadhaar Card','Ration card','Income certificate','SECC family member proof'],
    process: ['Check eligibility on PMJAY portal','Visit nearest Common Service Centre','Get Ayushman card generated','Use card at any empanelled hospital'],
    color: '#dc2626',
  },
  {
    id: 'pmay',
    name: 'Pradhan Mantri Awas Yojana',
    department: 'Housing Department',
    icon: '🏠',
    shortDesc: 'Affordable housing for urban/rural poor with interest subsidy on home loans.',
    benefit: 'Interest subsidy up to ₹2.67 lakh on home loan; ₹1.2 lakh grant for rural housing',
    eligibility: ['Annual income below ₹6 lakh (EWS) or ₹12 lakh (LIG)','No pucca house in family name','First-time home buyer','Valid Aadhaar card'],
    documents: ['Aadhaar Card','Income certificate','Property documents','Bank statements','Caste certificate (SC/ST)'],
    process: ['Apply online on PMAY portal or visit bank/HFC','Submit documents for verification','Bank sanction of loan','Subsidy credited to loan account'],
    color: '#ea580c',
  },
  {
    id: 'mudra',
    name: 'PM MUDRA Yojana',
    department: 'Industries & MSME',
    icon: '💼',
    shortDesc: 'Collateral-free loans up to ₹10 lakh for non-farm small businesses and enterprises.',
    benefit: 'Loans: Shishu (up to ₹50K), Kishore (₹50K–5L), Tarun (₹5L–10L)',
    eligibility: ['Age: 18–65 years','Non-farm business activity','No existing loan default','Valid business plan'],
    documents: ['Aadhaar Card','PAN Card','Business plan','Bank statements (6 months)','Identity and address proof'],
    process: ['Approach nearest bank/MFI/NBFC','Submit loan application with business plan','Bank assessment and approval','Loan disbursement to business account'],
    color: '#0369a1',
  },
  {
    id: 'ujjwala',
    name: 'PM Ujjwala Yojana',
    department: 'Women & Child Department',
    icon: '👩',
    shortDesc: 'Free LPG connection for women from BPL households to improve cooking fuel access.',
    benefit: 'Free LPG connection + first cylinder + stove subsidy worth ₹1,600',
    eligibility: ['Woman head of household','Age: 18 years and above','BPL family','No existing LPG connection in household'],
    documents: ['Aadhaar Card','BPL ration card','Bank passbook','Proof of address'],
    process: ['Apply at nearest LPG distributor','Submit KYC documents','BPL verification by agency','Connection issued within 7 days'],
    color: '#b45309',
  },
]

const DEPARTMENTS = [
  { name: 'Agriculture', icon: '🌾', schemeCount: 12, color: '#16a34a' },
  { name: 'Education', icon: '🎓', schemeCount: 18, color: '#7c3aed' },
  { name: 'Health', icon: '🏥', schemeCount: 9, color: '#dc2626' },
  { name: 'Women & Child', icon: '👩', schemeCount: 14, color: '#db2777' },
  { name: 'Labour & Employment', icon: '👷', schemeCount: 7, color: '#d97706' },
  { name: 'Housing', icon: '🏠', schemeCount: 5, color: '#ea580c' },
  { name: 'Social Welfare', icon: '🤝', schemeCount: 11, color: '#0891b2' },
  { name: 'Industries & MSME', icon: '💼', schemeCount: 8, color: '#0369a1' },
  { name: 'Transport', icon: '🚌', schemeCount: 4, color: '#6d28d9' },
  { name: 'Rural Development', icon: '🌿', schemeCount: 10, color: '#15803d' },
]

const SAMPLE_APPLICATIONS: Application[] = [
  { id: 'CB-AGR-2026-10245', scheme: 'Farmer Support Scheme', department: 'Agriculture & Farmers Welfare', departmentIcon: '🌾', submitted: '02 Aug 2026', status: 'under-verification', color: '#16a34a' },
  { id: 'CB-EDU-2026-08812', scheme: 'National Scholarship Scheme', department: 'Education Department', departmentIcon: '🎓', submitted: '28 Jul 2026', status: 'approved', color: '#7c3aed' },
  { id: 'CB-HLT-2026-07330', scheme: 'Ayushman Bharat – PMJAY', department: 'Health Department', departmentIcon: '🏥', submitted: '15 Jul 2026', status: 'submitted', color: '#dc2626' },
]

const NOTIFICATIONS_DATA = [
  { id: 1, icon: '✅', title: 'Application Submitted', desc: 'Your application CB-AGR-2026-10245 has been successfully submitted.', time: '2 hours ago', read: false, color: '#16a34a' },
  { id: 2, icon: '🔄', title: 'Status Updated', desc: 'Application CB-AGR-2026-10245 is now Under Verification by the department.', time: '1 hour ago', read: false, color: '#d97706' },
  { id: 3, icon: '📄', title: 'Document Required', desc: 'Please upload your latest land ownership document for CB-AGR-2026-10245.', time: '45 min ago', read: false, color: '#dc2626' },
  { id: 4, icon: '🎉', title: 'Application Approved', desc: 'Congratulations! CB-EDU-2026-08812 has been approved. Benefit will be credited soon.', time: '3 days ago', read: true, color: '#16a34a' },
  { id: 5, icon: '💬', title: 'Officer Message', desc: 'Agriculture officer Ramesh K. has sent you a message regarding your application.', time: '5 days ago', read: true, color: '#0369a1' },
  { id: 6, icon: '🌟', title: 'New Eligible Scheme', desc: 'You may be eligible for PM Fasal Bima Yojana. Check your eligibility now.', time: '1 week ago', read: true, color: '#7c3aed' },
]

const OFFICES = [
  { name: 'District Government Service Centre', area: 'Mandya', dist: '2.4 km', phone: '08232-222101', services: ['Application Assistance','Document Verification','Scheme Support','Grievances'], lat: 12.5244, lng: 76.8962 },
  { name: 'Taluk Agricultural Office', area: 'Maddur', dist: '5.1 km', phone: '08232-233445', services: ['Farmer Schemes','Land Records','Kisan Credit Card','Crop Insurance'], lat: 12.5918, lng: 77.0437 },
  { name: 'Common Service Centre (CSC)', area: 'Pandavapura', dist: '8.7 km', phone: '08232-245678', services: ['Online Applications','Aadhaar Services','Certificates','DBT Enrollment'], lat: 12.4876, lng: 76.6984 },
]

const AI_KNOWLEDGE: Record<string, string> = {
  scheme: "I can help you find the right scheme! Based on your profile, you may be eligible for PM-KISAN, Ayushman Bharat, and PMAY. Would you like details on any of these?",
  eligible: "To check eligibility, complete the Find Schemes form with your age, occupation, income, state, category and disability status. All 6 fields are required for personalized results.",
  document: "Commonly required documents: Aadhaar Card, Income Certificate, Ration Card, Bank Passbook, and Residence Certificate. Keep both originals and self-attested copies ready.",
  apply: "To apply: 1) Check eligibility 2) Gather documents 3) Click Apply Now 4) Fill personal details 5) Upload documents 6) Verify OTP 7) Review & Submit. Track status in My Applications.",
  rejection: "If your application was rejected, check the rejection reason in My Applications → View Details. Common reasons: incorrect documents, income mismatch, or duplicate application. You can re-apply after rectifying issues.",
  benefit: "Benefits are transferred directly to your Aadhaar-linked bank account (DBT). Processing time is 15–30 working days after approval. Ensure your bank account is active and linked to Aadhaar.",
  grievance: "For grievances, use 'Connect to Department Representative' in this chat, or visit your nearest Government Service Centre. You can also call the national helpline: 1800-11-0001 (toll free).",
  office: "I can help you find the nearest government office. Based on your registered address in Mandya district, there are 3 offices within 9 km. Click 'Find Nearest Office' below for directions.",
  default: "Hello! I'm your Easy Access AI assistant 🙏 I can help with:\n• Finding eligible schemes\n• Document guidance\n• Application status\n• Grievances & escalation\n\nWhat would you like help with today?",
}

const statusConfig = {
  'submitted': { label: 'Submitted', color: '#0369a1', bg: '#eff6ff', icon: '📤' },
  'under-verification': { label: 'Under Verification', color: '#d97706', bg: '#fffbeb', icon: '🔄' },
  'approved': { label: 'Approved', color: '#16a34a', bg: '#f0fdf4', icon: '✅' },
  'rejected': { label: 'Rejected', color: '#dc2626', bg: '#fef2f2', icon: '❌' },
}

// ─── Shared Components ────────────────────────────────────────────────────────

function Logo({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex items-center gap-2.5 group">
      <div className="w-9 h-9 rounded-xl bg-green-600 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
        <span className="text-white font-bold text-sm" style={{ fontFamily: 'Poppins' }}>EA</span>
      </div>
      <div className="flex flex-col leading-none">
        <span className="font-bold text-base text-green-700" style={{ fontFamily: 'Poppins' }}>Easy Access</span>
        <span className="text-xs text-slate-400 font-medium">Government Services</span>
      </div>
    </button>
  )
}

function AshokChakra() {
  return (
    <svg viewBox="0 0 40 40" width="20" height="20" className="inline-block">
      {Array.from({ length: 24 }).map((_, i) => (
        <line key={i} x1="20" y1="20"
          x2={20 + 14 * Math.cos((i * 15 * Math.PI) / 180)}
          y2={20 + 14 * Math.sin((i * 15 * Math.PI) / 180)}
          stroke="#1d4ed8" strokeWidth="1" opacity="0.7" />
      ))}
      <circle cx="20" cy="20" r="14" fill="none" stroke="#1d4ed8" strokeWidth="1.5" opacity="0.7" />
      <circle cx="20" cy="20" r="2" fill="#1d4ed8" opacity="0.7" />
    </svg>
  )
}

function IndiaMap() {
  return (
    <svg viewBox="0 0 400 480" className="w-full h-full" style={{ filter: 'drop-shadow(0 8px 32px rgba(22,163,74,0.18))' }}>
      <defs>
        <linearGradient id="mapGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#22c55e" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#16a34a" stopOpacity="0.7" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <path d="M 195 28 L 220 35 L 250 30 L 268 42 L 278 60 L 282 80 L 275 95 L 288 108 L 298 125 L 302 145 L 295 162 L 310 178 L 318 198 L 312 218 L 322 238 L 315 258 L 300 272 L 290 292 L 278 308 L 268 328 L 252 348 L 238 366 L 220 382 L 205 400 L 195 418 L 188 432 L 182 418 L 175 402 L 162 385 L 148 368 L 132 350 L 118 332 L 105 312 L 98 292 L 88 272 L 82 252 L 78 232 L 85 212 L 78 192 L 72 172 L 78 152 L 85 132 L 95 115 L 108 100 L 118 85 L 122 65 L 135 50 L 152 38 L 172 30 Z"
        fill="url(#mapGrad)" stroke="#15803d" strokeWidth="2" filter="url(#glow)" opacity="0.85" />
      <path d="M 150 120 L 250 125" stroke="white" strokeWidth="0.8" opacity="0.4" />
      <path d="M 130 180 L 280 185" stroke="white" strokeWidth="0.8" opacity="0.4" />
      <path d="M 115 240 L 305 248" stroke="white" strokeWidth="0.8" opacity="0.4" />
      <path d="M 105 300 L 295 308" stroke="white" strokeWidth="0.8" opacity="0.4" />
      <path d="M 180 120 L 175 420" stroke="white" strokeWidth="0.8" opacity="0.3" />
      <path d="M 220 118 L 218 390" stroke="white" strokeWidth="0.8" opacity="0.3" />
      {[
        [195, 155, 'Delhi'],[160, 280, 'Mumbai'],[245, 310, 'Kolkata'],
        [215, 355, 'Hyderabad'],[195, 395, 'Chennai'],[168, 310, 'Pune'],
        [148, 220, 'Jaipur'],[250, 200, 'Patna'],
      ].map(([cx, cy, label]) => (
        <g key={String(label)}>
          <circle cx={Number(cx)} cy={Number(cy)} r="4" fill="white" opacity="0.9" />
          <circle cx={Number(cx)} cy={Number(cy)} r="2" fill="#15803d" />
          <text x={Number(cx)+7} y={Number(cy)+4} fontSize="8" fill="white" opacity="0.8" style={{ fontFamily: 'Inter' }}>{String(label)}</text>
        </g>
      ))}
    </svg>
  )
}

function StepIndicator({ steps, current }: { steps: string[]; current: number }) {
  return (
    <div className="flex items-center mb-8">
      {steps.map((step, i) => (
        <div key={i} className="flex items-center flex-1">
          <div className={`flex items-center gap-2 ${i <= current ? 'text-green-700' : 'text-slate-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all flex-shrink-0 ${
              i < current ? 'bg-green-600 border-green-600 text-white' :
              i === current ? 'bg-white border-green-600 text-green-700' :
              'bg-white border-slate-300 text-slate-400'}`}>
              {i < current ? '✓' : i + 1}
            </div>
            <span className="text-xs font-medium hidden sm:block whitespace-nowrap">{step}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={`flex-1 h-0.5 mx-2 rounded transition-colors ${i < current ? 'bg-green-600' : 'bg-slate-200'}`} />
          )}
        </div>
      ))}
    </div>
  )
}

function StatusBadge({ status }: { status: Application['status'] }) {
  const c = statusConfig[status]
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: c.bg, color: c.color }}>
      <span>{c.icon}</span>{c.label}
    </span>
  )
}

function Header({ currentPage, onNavigate, unreadCount }: {
  currentPage: Page
  onNavigate: (p: Page) => void
  unreadCount: number
}) {
  const [langOpen, setLangOpen] = useState(false)
  const [lang, setLang] = useState('EN')
  const [profileOpen, setProfileOpen] = useState(false)
  const [logoutConfirm, setLogoutConfirm] = useState(false)
  const langs = ['EN','हि','বাং','தமிழ்','తె','ಕ','മ','ਪੰ']

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Logo onClick={() => onNavigate('home')} />

          <nav className="hidden md:flex items-center gap-6">
            {([
              { label: 'Home', page: 'home' as Page },
              { label: 'Categories', page: 'departments' as Page },
              { label: 'Find Schemes', page: 'find-schemes' as Page },
              { label: 'My Applications', page: 'my-applications' as Page },
            ]).map(({ label, page }) => (
              <button key={page} onClick={() => onNavigate(page)}
                className={`nav-link text-sm font-medium pb-0.5 transition-colors ${currentPage === page ? 'text-green-700 active' : 'text-slate-600 hover:text-green-700'}`}>
                {label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {/* Language */}
            <div className="relative">
              <button onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:border-green-400 hover:text-green-700 transition-colors">
                🌐 {lang}
                <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor"><path d="M8 10.5L3 5.5h10L8 10.5z" /></svg>
              </button>
              {langOpen && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg p-2 grid grid-cols-2 gap-1 w-36 animate-fade-in z-50">
                  {langs.map(l => (
                    <button key={l} onClick={() => { setLang(l); setLangOpen(false) }}
                      className={`px-2 py-1.5 rounded-lg text-sm font-medium transition-colors ${l === lang ? 'bg-green-50 text-green-700' : 'hover:bg-slate-50 text-slate-600'}`}>
                      {l}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notifications */}
            <button onClick={() => onNavigate('notifications')} className="relative w-9 h-9 rounded-xl hover:bg-slate-100 flex items-center justify-center transition-colors">
              <span className="text-lg">🔔</span>
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full border border-white flex items-center justify-center text-white text-xs font-bold">{unreadCount}</span>
              )}
            </button>

            {/* Profile */}
            <div className="relative">
              <button onClick={() => setProfileOpen(!profileOpen)}
                className="w-9 h-9 rounded-xl bg-green-600 flex items-center justify-center hover:bg-green-700 transition-colors">
                <span className="text-white text-sm">👤</span>
              </button>
              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden animate-fade-in z-50">
                  <div className="bg-green-50 px-4 py-3 border-b border-slate-100">
                    <p className="font-bold text-slate-800 text-sm" style={{ fontFamily: 'Poppins' }}>Rajesh Kumar</p>
                    <p className="text-xs text-slate-400">+91 98765 43210</p>
                  </div>
                  {[
                    { icon: '👤', label: 'My Profile', page: 'profile' as Page },
                    { icon: '📋', label: 'My Applications', page: 'my-applications' as Page },
                    { icon: '🔔', label: 'Notifications', page: 'notifications' as Page },
                    { icon: '🌐', label: 'Language', page: null },
                    { icon: '❓', label: 'Help & Support', page: null },
                  ].map(item => (
                    <button key={item.label}
                      onClick={() => { setProfileOpen(false); if (item.page) onNavigate(item.page) }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors text-left">
                      <span className="text-base">{item.icon}</span>
                      <span className="text-sm text-slate-700 font-medium">{item.label}</span>
                    </button>
                  ))}
                  <div className="border-t border-slate-100">
                    <button onClick={() => { setProfileOpen(false); setLogoutConfirm(true) }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 transition-colors text-left text-red-600">
                      <span>🚪</span>
                      <span className="text-sm font-medium">Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Logout dialog */}
      {logoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full mx-4">
            <div className="text-4xl text-center mb-3">🚪</div>
            <h3 className="text-lg font-bold text-slate-800 text-center mb-2" style={{ fontFamily: 'Poppins' }}>Confirm Logout</h3>
            <p className="text-slate-500 text-sm text-center mb-6">Are you sure you want to logout from Easy Access?</p>
            <div className="flex gap-3">
              <button onClick={() => setLogoutConfirm(false)}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:border-slate-300 transition-all">
                Cancel
              </button>
              <button onClick={() => { setLogoutConfirm(false); onNavigate('login') }}
                className="flex-1 py-3 rounded-xl bg-red-500 text-white font-semibold text-sm hover:bg-red-600 transition-all">
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ─── AI Chatbot ───────────────────────────────────────────────────────────────

function AIChatbot({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<'ai' | 'rep'>('ai')
  const [input, setInput] = useState('')
  const [listening, setListening] = useState(false)
  const [escalated, setEscalated] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'ai', text: AI_KNOWLEDGE.default, time: 'now' }
  ])
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const now = () => new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })

  const send = () => {
    if (!input.trim()) return
    const userMsg = input.trim()
    setInput('')
    setMessages(m => [...m, { role: 'user', text: userMsg, time: now() }])
    setTimeout(() => {
      if (mode === 'rep') {
        setMessages(m => [...m, { role: 'rep', text: `Thank you for your message. I'm officer Ramesh Kumar from Agriculture Department. I've reviewed your application CB-AGR-2026-10245. ${userMsg.toLowerCase().includes('status') ? 'Your documents are under verification and will be processed within 3 working days.' : 'Please let me know if you need any further assistance.'}`, time: now() }])
      } else {
        const lower = userMsg.toLowerCase()
        let response = AI_KNOWLEDGE.default
        if (lower.includes('scheme')) response = AI_KNOWLEDGE.scheme
        if (lower.includes('document') || lower.includes('paper')) response = AI_KNOWLEDGE.document
        if (lower.includes('apply') || lower.includes('application')) response = AI_KNOWLEDGE.apply
        if (lower.includes('eligible')) response = AI_KNOWLEDGE.eligible
        if (lower.includes('reject')) response = AI_KNOWLEDGE.rejection
        if (lower.includes('benefit') || lower.includes('money')) response = AI_KNOWLEDGE.benefit
        if (lower.includes('grievance') || lower.includes('complain')) response = AI_KNOWLEDGE.grievance
        if (lower.includes('office') || lower.includes('visit')) response = AI_KNOWLEDGE.office
        setMessages(m => [...m, { role: 'ai', text: response, time: now() }])
      }
    }, 800)
  }

  const toggleVoice = () => {
    setListening(l => !l)
    if (!listening) {
      setTimeout(() => {
        setListening(false)
        setInput('What documents do I need for PM-KISAN?')
      }, 2000)
    }
  }

  const connectRep = () => {
    setMode('rep')
    setEscalated(true)
    setMessages(m => [...m,
      { role: 'ai', text: 'Connecting you to a Government Representative from Agriculture Department...', time: now() },
      { role: 'rep', text: 'Hello! I\'m Officer Ramesh Kumar (ID: AGR-0042), verified representative from Agriculture & Farmers Welfare Department. 🟢 How can I assist you today?', time: now() }
    ])
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="chat-bubble w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col" style={{ height: '520px' }}>
          {/* Header */}
          <div className={`px-4 py-3 flex items-center justify-between ${mode === 'rep' ? 'bg-blue-700' : 'bg-green-600'}`}>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-lg">
                {mode === 'rep' ? '👨‍💼' : '🤖'}
              </div>
              <div>
                <p className="text-white font-semibold text-sm" style={{ fontFamily: 'Poppins' }}>
                  {mode === 'rep' ? 'Govt. Representative' : 'Easy Access AI'}
                </p>
                <p className="text-xs" style={{ color: mode === 'rep' ? '#bfdbfe' : '#bbf7d0' }}>
                  {mode === 'rep' ? '🟢 Agriculture Dept · Verified' : 'Always here to help'}
                </p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white text-lg">✕</button>
          </div>

          {/* Tab bar */}
          <div className="flex border-b border-slate-100">
            {[{ key: 'ai', label: '🤖 AI Assistant' }, { key: 'rep', label: '👨‍💼 Representative' }].map(tab => (
              <button key={tab.key} onClick={() => setMode(tab.key as 'ai' | 'rep')}
                className={`flex-1 py-2 text-xs font-semibold transition-colors ${mode === tab.key ? 'text-green-700 border-b-2 border-green-600' : 'text-slate-400 hover:text-slate-600'}`}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {(msg.role === 'ai' || msg.role === 'rep') && (
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2 flex-shrink-0 mt-1 ${msg.role === 'rep' ? 'bg-blue-100' : 'bg-green-100'}`}>
                    {msg.role === 'rep' ? '👨‍💼' : '🤖'}
                  </div>
                )}
                <div className="max-w-[78%]">
                  <div className={`rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-line ${
                    msg.role === 'user' ? 'bg-green-600 text-white rounded-br-sm' :
                    msg.role === 'rep' ? 'bg-blue-50 text-slate-700 rounded-bl-sm border border-blue-100' :
                    'bg-slate-100 text-slate-700 rounded-bl-sm'}`}>
                    {msg.text}
                  </div>
                  {msg.time && <p className="text-slate-400 text-xs mt-0.5 px-1">{msg.time}</p>}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Quick actions */}
          {mode === 'ai' && !escalated && (
            <div className="px-4 pb-2 flex flex-wrap gap-1.5">
              {['Check eligibility','Document help','Track application','Find office'].map(q => (
                <button key={q} onClick={() => { setInput(q); }}
                  className="px-2.5 py-1 bg-green-50 border border-green-200 text-green-700 rounded-full text-xs font-medium hover:bg-green-100 transition-colors">
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Connect to rep */}
          {mode === 'ai' && !escalated && (
            <div className="px-4 pb-2">
              <button onClick={connectRep}
                className="w-full py-2 rounded-xl border border-blue-300 text-blue-700 text-xs font-semibold hover:bg-blue-50 transition-colors flex items-center justify-center gap-1.5">
                👨‍💼 Connect to Department Representative →
              </button>
            </div>
          )}

          {/* Escalation - find office */}
          {escalated && (
            <div className="px-4 pb-2">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
                <p className="text-xs text-amber-700 font-semibold mb-1.5">Need In-Person Assistance?</p>
                <button onClick={() => { setOpen(false); onNavigate('nearest-office') }}
                  className="w-full py-1.5 rounded-lg bg-amber-500 text-white text-xs font-semibold hover:bg-amber-600 transition-colors">
                  📍 Find Nearest Government Office →
                </button>
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t border-slate-100 flex gap-2">
            <button onClick={toggleVoice}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all flex-shrink-0 ${listening ? 'bg-red-500 text-white animate-pulse' : 'border border-slate-200 text-slate-500 hover:border-green-400 hover:text-green-600'}`}>
              🎤
            </button>
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()}
              placeholder={listening ? 'Listening...' : 'Ask anything...'}
              className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-green-400 transition-colors" />
            <button onClick={send}
              className="w-9 h-9 rounded-xl bg-green-600 hover:bg-green-700 flex items-center justify-center text-white transition-colors flex-shrink-0">
              ➤
            </button>
          </div>
        </div>
      )}

      <button onClick={() => setOpen(!open)}
        className="relative flex items-center gap-2.5 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-2xl shadow-lg transition-all hover:shadow-xl active:scale-95">
        <span className="text-xl">🤖</span>
        <span className="text-sm font-semibold" style={{ fontFamily: 'Poppins' }}>Ask AI</span>
        {!open && <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />}
      </button>
    </div>
  )
}

// ─── Pages ────────────────────────────────────────────────────────────────────

function HomePage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-green-50/40 to-white pt-12 pb-20 px-4">
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(22,163,74,0.12) 0%, transparent 50%), radial-gradient(circle at 20% 80%, rgba(34,197,94,0.08) 0%, transparent 50%)'
        }} />
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center relative">
          <div className="animate-slide-up">
            <div className="flex items-center gap-1 mb-5">
              <div className="w-6 h-1.5 rounded-full bg-orange-500" />
              <div className="w-6 h-1.5 rounded-full bg-white border border-slate-200" />
              <div className="w-6 h-1.5 rounded-full bg-green-600" />
              <AshokChakra />
              <span className="text-xs font-medium text-slate-400 ml-1">Government of India</span>
            </div>
            <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-3 py-1.5 rounded-full text-xs font-semibold mb-4">
              🇮🇳 #GovernmentSchemesForYou
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-5 text-slate-900" style={{ fontFamily: 'Poppins' }}>
              Discover Government<br />
              <span className="text-green-600">Schemes & Services</span><br />
              <span className="text-2xl sm:text-3xl font-semibold text-slate-500">on one simple platform.</span>
            </h1>
            <p className="text-slate-500 text-base leading-relaxed mb-8 max-w-md">
              Easy Access brings all central and state government schemes together — check eligibility, apply online, and track your applications in minutes.
            </p>
            <div className="flex flex-wrap gap-3 mb-10">
              <button onClick={() => onNavigate('login')}
                className="flex items-center gap-2.5 bg-green-600 hover:bg-green-700 text-white px-7 py-3.5 rounded-2xl font-semibold text-base shadow-lg shadow-green-600/25 transition-all hover:shadow-xl active:scale-95"
                style={{ fontFamily: 'Poppins' }}>
                Get Started →
              </button>
              <button onClick={() => onNavigate('departments')}
                className="flex items-center gap-2.5 bg-white border-2 border-slate-200 hover:border-green-400 text-slate-700 px-7 py-3.5 rounded-2xl font-semibold text-base transition-all hover:text-green-700">
                Browse Schemes
              </button>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[['1200+','Active Schemes'],['30+','Departments'],['28 States','Coverage']].map(([v, l]) => (
                <div key={l} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                  <p className="text-green-700 font-bold text-xl" style={{ fontFamily: 'Poppins' }}>{v}</p>
                  <p className="text-slate-400 text-xs mt-0.5">{l}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="relative w-64 h-80 sm:w-80 sm:h-96 animate-float">
              <div className="absolute inset-0 rounded-full bg-green-400/10 blur-3xl scale-110" />
              <IndiaMap />
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-green-600 text-sm font-semibold mb-1">Popular Categories</p>
              <h2 className="text-2xl font-bold text-slate-800" style={{ fontFamily: 'Poppins' }}>Explore by Department</h2>
            </div>
            <button onClick={() => onNavigate('departments')} className="text-green-600 text-sm font-semibold hover:text-green-700">View all →</button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {DEPARTMENTS.map(dept => (
              <button key={dept.name} onClick={() => onNavigate('department-schemes')}
                className="flex flex-col items-center gap-2.5 p-4 bg-white rounded-2xl border border-slate-100 hover:border-green-300 hover:shadow-md transition-all group">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl" style={{ background: dept.color + '15' }}>{dept.icon}</div>
                <div className="text-center">
                  <p className="text-slate-700 font-semibold text-xs group-hover:text-green-700 transition-colors" style={{ fontFamily: 'Poppins' }}>{dept.name}</p>
                  <p className="text-slate-400 text-xs">{dept.schemeCount} schemes</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 px-4 bg-green-50/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-green-600 text-sm font-semibold mb-2">Simple Process</p>
            <h2 className="text-2xl font-bold text-slate-800" style={{ fontFamily: 'Poppins' }}>How Easy Access Works</h2>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-5">
            {[
              { step: '01', icon: '📋', title: 'Register', desc: 'Sign up with your mobile number and basic details in under 2 minutes.' },
              { step: '02', icon: '🔍', title: 'Find Schemes', desc: 'Enter your profile to get matched with eligible government schemes.' },
              { step: '03', icon: '✅', title: 'Check Eligibility', desc: 'Answer quick questions to confirm eligibility for each scheme.' },
              { step: '04', icon: '📤', title: 'Apply Online', desc: 'Submit your application with documents and track status in real-time.' },
            ].map(item => (
              <div key={item.step} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm relative overflow-hidden">
                <span className="absolute top-3 right-4 text-5xl font-black text-slate-100" style={{ fontFamily: 'Poppins' }}>{item.step}</span>
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="font-bold text-slate-800 mb-1.5" style={{ fontFamily: 'Poppins' }}>{item.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-green-600 rounded-3xl p-10 text-white shadow-xl shadow-green-600/20">
            <p className="text-green-200 text-sm font-semibold mb-3">Start Today — It's Free</p>
            <h2 className="text-2xl sm:text-3xl font-bold mb-4" style={{ fontFamily: 'Poppins' }}>Find schemes you never knew you were eligible for</h2>
            <p className="text-green-100 mb-7 text-sm">Over 1,200 central and state government schemes in one place.</p>
            <button onClick={() => onNavigate('login')}
              className="bg-white text-green-700 font-bold px-8 py-3.5 rounded-xl hover:bg-green-50 transition-colors shadow-sm"
              style={{ fontFamily: 'Poppins' }}>
              Get Started Now →
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

function DashboardPage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  return (
    <div className="min-h-screen bg-slate-50/60 px-4 py-8">
      <div className="max-w-5xl mx-auto">
        {/* Welcome */}
        <div className="bg-gradient-to-r from-green-600 to-green-500 rounded-3xl p-7 mb-6 text-white shadow-lg shadow-green-600/20 relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/10" />
          <div className="absolute -right-2 bottom-2 w-24 h-24 rounded-full bg-white/5" />
          <div className="flex items-center gap-4 mb-5 relative">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-3xl">👋</div>
            <div>
              <p className="text-green-200 text-sm font-medium">Good morning</p>
              <h1 className="text-2xl font-bold" style={{ fontFamily: 'Poppins' }}>Welcome back, Rajesh Kumar</h1>
              <p className="text-green-200 text-xs mt-0.5">Mandya, Karnataka · Farmer</p>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-3 relative">
            {[
              { label: 'Submitted', value: '3', color: '#bbf7d0' },
              { label: 'Under Verification', value: '1', color: '#fde68a' },
              { label: 'Approved', value: '1', color: '#86efac' },
              { label: 'Rejected', value: '0', color: '#fca5a5' },
            ].map(s => (
              <div key={s.label} className="bg-white/15 rounded-2xl p-3 text-center backdrop-blur-sm">
                <p className="text-2xl font-bold" style={{ fontFamily: 'Poppins' }}>{s.value}</p>
                <p className="text-green-200 text-xs leading-tight mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-5">
            {/* Recommended */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-slate-800" style={{ fontFamily: 'Poppins' }}>Recommended Schemes</h2>
                <button onClick={() => onNavigate('eligible-schemes')} className="text-green-600 text-xs font-semibold hover:text-green-700">See all →</button>
              </div>
              <div className="space-y-3">
                {SCHEMES.slice(0, 3).map(s => (
                  <div key={s.id} className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100 hover:border-green-200 hover:bg-green-50/30 transition-all cursor-pointer group"
                    onClick={() => onNavigate('scheme-details')}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: s.color + '18' }}>{s.icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 text-sm truncate" style={{ fontFamily: 'Poppins' }}>{s.name}</p>
                      <p className="text-xs text-slate-400">{s.department}</p>
                    </div>
                    <span className="text-green-600 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">Apply →</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent apps */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-slate-800" style={{ fontFamily: 'Poppins' }}>Recent Applications</h2>
                <button onClick={() => onNavigate('my-applications')} className="text-green-600 text-xs font-semibold hover:text-green-700">View all →</button>
              </div>
              <div className="space-y-3">
                {SAMPLE_APPLICATIONS.slice(0, 2).map(app => (
                  <div key={app.id} className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: app.color + '18' }}>{app.departmentIcon}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 text-sm truncate">{app.scheme}</p>
                      <p className="text-xs text-slate-400 font-mono">{app.id}</p>
                    </div>
                    <StatusBadge status={app.status} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="space-y-4">
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
              <h2 className="font-bold text-slate-800 mb-4" style={{ fontFamily: 'Poppins' }}>Quick Actions</h2>
              <div className="space-y-2.5">
                {[
                  { icon: '🔍', label: 'Find Schemes', page: 'find-schemes' as Page, color: '#16a34a' },
                  { icon: '📋', label: 'My Applications', page: 'my-applications' as Page, color: '#7c3aed' },
                  { icon: '🔔', label: 'Notifications', page: 'notifications' as Page, color: '#d97706' },
                  { icon: '👤', label: 'My Profile', page: 'profile' as Page, color: '#0369a1' },
                ].map(a => (
                  <button key={a.label} onClick={() => onNavigate(a.page)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors text-left border border-slate-100 group">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg" style={{ background: a.color + '15' }}>{a.icon}</div>
                    <span className="text-sm font-semibold text-slate-700 group-hover:text-green-700 transition-colors">{a.label}</span>
                    <span className="ml-auto text-slate-300 group-hover:text-green-500 transition-colors">→</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Helpline */}
            <div className="bg-green-50 border border-green-200 rounded-3xl p-5">
              <p className="font-bold text-green-800 text-sm mb-1" style={{ fontFamily: 'Poppins' }}>Need Help?</p>
              <p className="text-green-600 text-xs mb-3">Call the national helpline 24×7</p>
              <p className="text-green-800 font-bold text-lg font-mono">1800-11-0001</p>
              <p className="text-green-500 text-xs">Toll Free</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function LoginPage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const [mode, setMode] = useState<'citizen' | 'dept' | 'explore'>('citizen')
  const [form, setForm] = useState({ name: '', phone: '', address: '' })
  const valid = form.name.trim() && form.phone.length === 10 && form.address.trim()

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/60 to-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <StepIndicator steps={['Account', 'Verify', 'Profile', 'Schemes']} current={0} />
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
          <div className="bg-green-600 px-8 pt-8 pb-6">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-3xl mb-4">🇮🇳</div>
            <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Poppins' }}>Welcome to Easy Access</h1>
            <p className="text-green-200 text-sm mt-1">Your gateway to government schemes</p>
          </div>
          <div className="p-8">
            <div className="flex rounded-xl border border-slate-200 p-1 mb-6 gap-1">
              {([['citizen','👤 Citizen'],['dept','🏛 Department'],['explore','🔍 Explore']] as const).map(([key, label]) => (
                <button key={key} onClick={() => setMode(key)}
                  className={`flex-1 py-2 px-2 rounded-lg text-xs font-semibold transition-all ${mode === key ? 'bg-green-600 text-white shadow-sm' : 'text-slate-500 hover:text-green-600'}`}
                  style={{ fontFamily: 'Poppins' }}>
                  {label}
                </button>
              ))}
            </div>
            {mode === 'citizen' && (
              <div className="space-y-4 animate-fade-in">
                {[
                  { key: 'name', label: 'Full Name', placeholder: 'Rajesh Kumar', type: 'text', icon: '👤' },
                  { key: 'phone', label: 'Phone Number', placeholder: '9876543210', type: 'tel', icon: '📱' },
                  { key: 'address', label: 'Address', placeholder: 'Village/Town, District, State', type: 'text', icon: '📍' },
                ].map(field => (
                  <div key={field.key}>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">{field.label}</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base">{field.icon}</span>
                      <input type={field.type} placeholder={field.placeholder}
                        value={form[field.key as keyof typeof form]}
                        onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                        maxLength={field.key === 'phone' ? 10 : undefined}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all" />
                    </div>
                  </div>
                ))}
                <button disabled={!valid} onClick={() => onNavigate('otp')}
                  className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all ${valid ? 'bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-600/25 active:scale-95' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                  style={{ fontFamily: 'Poppins' }}>
                  Continue →
                </button>
              </div>
            )}
            {mode === 'dept' && (
              <div className="animate-fade-in space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
                  <p className="font-semibold mb-1">Government Department Login</p>
                  <p className="text-xs text-blue-500">Use your official credentials to manage schemes and applications.</p>
                </div>
                {['Department ID','Official Email','Password'].map(f => (
                  <input key={f} placeholder={f} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-green-400 transition-all" />
                ))}
                <button className="w-full py-3.5 rounded-xl bg-green-600 text-white font-semibold text-sm hover:bg-green-700 transition-all" style={{ fontFamily: 'Poppins' }}>Sign In →</button>
              </div>
            )}
            {mode === 'explore' && (
              <div className="animate-fade-in text-center py-4">
                <div className="text-5xl mb-4">🔍</div>
                <p className="text-slate-700 font-semibold mb-2" style={{ fontFamily: 'Poppins' }}>Browse without signing in</p>
                <p className="text-slate-400 text-sm mb-6">Explore all available schemes without creating an account.</p>
                <button onClick={() => onNavigate('departments')}
                  className="w-full py-3.5 rounded-xl bg-green-600 text-white font-semibold text-sm hover:bg-green-700 transition-all"
                  style={{ fontFamily: 'Poppins' }}>
                  Explore Services →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function OTPPage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const [otp, setOtp] = useState(['','','','','',''])
  const [resent, setResent] = useState(false)
  const [timer, setTimer] = useState(30)
  const inputs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (timer > 0) { const t = setTimeout(() => setTimer(x => x - 1), 1000); return () => clearTimeout(t) }
  }, [timer])

  const handleChange = (i: number, v: string) => {
    if (!/^\d?$/.test(v)) return
    const next = [...otp]; next[i] = v; setOtp(next)
    if (v && i < 5) inputs.current[i + 1]?.focus()
  }
  const handleKeyDown = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) inputs.current[i - 1]?.focus()
  }
  const filled = otp.every(d => d !== '')

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/60 to-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <StepIndicator steps={['Account', 'Verify', 'Profile', 'Schemes']} current={1} />
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-green-50 border border-green-200 flex items-center justify-center text-3xl mx-auto mb-4">📱</div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2" style={{ fontFamily: 'Poppins' }}>Verify Your Mobile</h2>
            <p className="text-slate-500 text-sm">We've sent a 6-digit OTP to <span className="font-semibold text-slate-700">+91 98765 43210</span></p>
          </div>
          <div className="flex gap-2.5 justify-center mb-6">
            {otp.map((digit, i) => (
              <input key={i} ref={el => { inputs.current[i] = el }}
                type="text" inputMode="numeric" maxLength={1} value={digit}
                onChange={e => handleChange(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                className={`otp-input ${digit ? 'filled' : ''}`} />
            ))}
          </div>
          <div className="flex items-center justify-center mb-8 text-sm">
            {timer > 0 ? (
              <span className="text-slate-400">Resend in <span className="font-semibold text-slate-600">{timer}s</span></span>
            ) : (
              <button onClick={() => { setTimer(30); setResent(true); setTimeout(() => setResent(false), 2000) }}
                className="text-green-600 font-semibold hover:text-green-700 transition-colors">Resend OTP</button>
            )}
          </div>
          {resent && <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 text-sm text-green-700 text-center mb-4 animate-fade-in">✓ OTP resent successfully</div>}
          <button disabled={!filled} onClick={() => onNavigate('find-schemes')}
            className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all ${filled ? 'bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-600/25 active:scale-95' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
            style={{ fontFamily: 'Poppins' }}>
            Verify & Continue →
          </button>
        </div>
      </div>
    </div>
  )
}

function FindSchemesPage({ onNavigate, onSetUserData }: { onNavigate: (p: Page) => void; onSetUserData: (d: Partial<UserData>) => void }) {
  const [form, setForm] = useState({ age: '', occupation: '', income: '', state: '', category: '', disability: '' })
  const allFilled = Object.values(form).every(v => v.trim() !== '')
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/40 to-white px-4 py-10">
      <div className="max-w-2xl mx-auto">
        <StepIndicator steps={['Account', 'Verify', 'Profile', 'Schemes']} current={2} />
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-3 py-1.5 rounded-full text-xs font-semibold mb-3">🎯 Personalized for You</div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2" style={{ fontFamily: 'Poppins' }}>Find Schemes For You</h1>
          <p className="text-slate-500 text-sm">Tell us about yourself to get matched with the right government schemes.</p>
        </div>
        <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-8">
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Age <span className="text-red-400">*</span></label>
              <input type="number" placeholder="e.g. 32" min="1" max="120" value={form.age} onChange={e => set('age', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Occupation <span className="text-red-400">*</span></label>
              <select value={form.occupation} onChange={e => set('occupation', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all bg-white">
                <option value="">Select occupation</option>
                {['Farmer','Student','Salaried Employee','Self Employed / Business','Daily Wage Worker','Homemaker','Unemployed','Retired / Senior Citizen'].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Annual Family Income <span className="text-red-400">*</span></label>
              <select value={form.income} onChange={e => set('income', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all bg-white">
                <option value="">Select income range</option>
                {['Below ₹1 lakh','₹1–2 lakh','₹2–3 lakh','₹3–5 lakh','₹5–8 lakh','₹8–12 lakh','Above ₹12 lakh'].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">State <span className="text-red-400">*</span></label>
              <select value={form.state} onChange={e => set('state', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all bg-white">
                <option value="">Select state</option>
                {STATES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Category / Caste <span className="text-red-400">*</span></label>
              <select value={form.category} onChange={e => set('category', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all bg-white">
                <option value="">Select category</option>
                {['General','OBC','SC','ST','EWS','Minority'].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Disability Status <span className="text-red-400">*</span></label>
              <select value={form.disability} onChange={e => set('disability', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all bg-white">
                <option value="">Select status</option>
                {['None','Physical Disability','Visual Impairment','Hearing Impairment','Intellectual Disability','Multiple Disabilities'].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>
          <div className="mt-6 mb-6">
            <div className="flex justify-between text-xs text-slate-400 mb-1.5">
              <span>Profile completion</span>
              <span className="font-semibold text-green-600">{Object.values(form).filter(v => v).length}/6 fields</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full transition-all duration-500"
                style={{ width: `${(Object.values(form).filter(v => v).length / 6) * 100}%` }} />
            </div>
          </div>
          <button disabled={!allFilled} onClick={() => { onSetUserData(form); onNavigate('eligible-schemes') }}
            className={`w-full py-4 rounded-xl font-bold text-sm transition-all ${allFilled ? 'bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-600/25 active:scale-95' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
            style={{ fontFamily: 'Poppins' }}>
            {allFilled ? 'Find Schemes For You →' : 'Complete all fields to continue'}
          </button>
        </div>
      </div>
    </div>
  )
}

function EligibleSchemesPage({ onNavigate, onSelectScheme, userData }: {
  onNavigate: (p: Page) => void; onSelectScheme: (s: Scheme) => void; userData: Partial<UserData>
}) {
  const eligible = SCHEMES.filter(s => {
    if (userData.occupation === 'Farmer' && s.id === 'pm-kisan') return true
    if (userData.occupation === 'Student' && s.id === 'scholarship') return true
    if (s.id === 'ayushman') return true
    if (s.id === 'pmay') return true
    if (userData.occupation === 'Self Employed / Business' && s.id === 'mudra') return true
    return true
  })

  return (
    <div className="min-h-screen bg-slate-50/50 px-4 py-10">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => onNavigate('find-schemes')} className="w-9 h-9 rounded-xl border border-slate-200 hover:border-green-400 flex items-center justify-center transition-colors text-slate-500 hover:text-green-600">←</button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800" style={{ fontFamily: 'Poppins' }}>Schemes You May Be Eligible For</h1>
            <p className="text-slate-400 text-sm">{eligible.length} schemes matched your profile</p>
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6 flex flex-wrap gap-2 items-center">
          {[['Age', userData.age],['Occupation', userData.occupation],['State', userData.state],['Category', userData.category]].map(([k, v]) => (
            <div key={k} className="flex items-center gap-1.5 bg-white rounded-xl px-3 py-1.5 border border-green-100">
              <span className="text-xs text-slate-400">{k}:</span>
              <span className="text-xs font-semibold text-slate-700">{v || '—'}</span>
            </div>
          ))}
          <button onClick={() => onNavigate('find-schemes')} className="text-xs text-green-600 font-semibold ml-auto hover:text-green-700">Edit Profile</button>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {eligible.map(scheme => (
            <div key={scheme.id} className="scheme-card bg-white rounded-2xl border border-slate-100 shadow-sm p-6 cursor-pointer" onClick={() => { onSelectScheme(scheme); onNavigate('scheme-details') }}>
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: scheme.color + '18' }}>{scheme.icon}</div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-800 text-sm leading-snug" style={{ fontFamily: 'Poppins' }}>{scheme.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{scheme.department}</p>
                </div>
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0"><span className="text-green-600 text-xs">✓</span></div>
              </div>
              <p className="text-slate-500 text-xs leading-relaxed mb-4">{scheme.shortDesc}</p>
              <div className="bg-green-50 rounded-xl px-3 py-2 mb-4">
                <p className="text-xs text-green-600 font-semibold">💰 Benefit</p>
                <p className="text-xs text-slate-600 mt-0.5">{scheme.benefit}</p>
              </div>
              <button onClick={e => { e.stopPropagation(); onSelectScheme(scheme); onNavigate('scheme-details') }}
                className="w-full py-2.5 rounded-xl text-green-700 border border-green-300 hover:bg-green-600 hover:text-white font-semibold text-xs transition-all"
                style={{ fontFamily: 'Poppins' }}>
                Click Here →
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function SchemeDetailsPage({ onNavigate, scheme }: { onNavigate: (p: Page) => void; scheme: Scheme | null }) {
  if (!scheme) return null
  return (
    <div className="min-h-screen bg-slate-50/50 px-4 py-10">
      <div className="max-w-3xl mx-auto">
        <button onClick={() => onNavigate('eligible-schemes')} className="flex items-center gap-2 text-slate-500 hover:text-green-600 text-sm font-medium mb-6 transition-colors">← Back to Schemes</button>
        <div className="rounded-3xl overflow-hidden shadow-lg mb-6" style={{ background: `linear-gradient(135deg, ${scheme.color}ee, ${scheme.color}99)` }}>
          <div className="p-8 text-white">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-4xl">{scheme.icon}</div>
              <div>
                <p className="text-white/70 text-sm">{scheme.department}</p>
                <h1 className="text-xl font-bold" style={{ fontFamily: 'Poppins' }}>{scheme.name}</h1>
              </div>
            </div>
            <p className="text-white/85 text-sm leading-relaxed">{scheme.shortDesc}</p>
            <div className="mt-4 bg-white/20 rounded-xl px-4 py-3">
              <p className="text-white/70 text-xs font-medium">💰 Key Benefit</p>
              <p className="text-white text-sm font-semibold mt-0.5">{scheme.benefit}</p>
            </div>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-5 mb-6">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2" style={{ fontFamily: 'Poppins' }}>
              <span className="w-6 h-6 rounded-lg bg-green-100 flex items-center justify-center text-xs">✓</span> Eligibility Criteria
            </h3>
            <ul className="space-y-2.5">
              {scheme.eligibility.map((e, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                  <span className="w-4 h-4 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">✓</span>{e}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2" style={{ fontFamily: 'Poppins' }}>
              <span className="w-6 h-6 rounded-lg bg-blue-100 flex items-center justify-center text-xs">📄</span> Required Documents
            </h3>
            <ul className="space-y-2.5">
              {scheme.documents.map((d, i) => (
                <li key={i} className="flex items-center gap-2.5 text-sm text-slate-600">
                  <span className="text-blue-400 text-xs">●</span>{d}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6">
          <h3 className="font-bold text-slate-800 mb-5" style={{ fontFamily: 'Poppins' }}>Application Process</h3>
          <div className="space-y-4">
            {scheme.process.map((step, i) => (
              <div key={i} className="flex gap-4 items-start">
                <div className="w-7 h-7 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</div>
                <p className="text-sm text-slate-600 leading-relaxed pt-0.5">{step}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={() => onNavigate('eligibility-form')}
            className="flex-1 py-4 rounded-2xl border-2 border-green-600 text-green-700 font-bold hover:bg-green-50 transition-all" style={{ fontFamily: 'Poppins' }}>
            Check Eligibility →
          </button>
          <button onClick={() => onNavigate('apply')}
            className="flex-1 py-4 rounded-2xl bg-green-600 text-white font-bold hover:bg-green-700 shadow-lg shadow-green-600/25 transition-all active:scale-95" style={{ fontFamily: 'Poppins' }}>
            Apply Now →
          </button>
        </div>
      </div>
    </div>
  )
}

function DepartmentsPage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const [search, setSearch] = useState('')
  const filtered = DEPARTMENTS.filter(d => d.name.toLowerCase().includes(search.toLowerCase()))
  return (
    <div className="min-h-screen bg-slate-50/50 px-4 py-10">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-slate-800 mb-2" style={{ fontFamily: 'Poppins' }}>Browse by Department</h1>
          <p className="text-slate-500 text-sm">Select a department to explore available government schemes</p>
        </div>
        <div className="relative mb-8 max-w-md mx-auto">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search departments..."
            className="w-full pl-10 pr-4 py-3.5 rounded-2xl border border-slate-200 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all bg-white shadow-sm" />
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(dept => (
            <button key={dept.name} onClick={() => onNavigate('department-schemes')}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 text-left hover:shadow-md hover:border-green-200 transition-all group">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-4 transition-transform group-hover:scale-105" style={{ background: dept.color + '18' }}>{dept.icon}</div>
              <h3 className="font-bold text-slate-800 text-sm mb-1 group-hover:text-green-700 transition-colors" style={{ fontFamily: 'Poppins' }}>{dept.name}</h3>
              <p className="text-slate-400 text-xs mb-3">{dept.schemeCount} active schemes</p>
              <div className="flex items-center gap-1 text-green-600 text-xs font-semibold">View Schemes →</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function DepartmentSchemesPage({ onNavigate, onSelectScheme }: { onNavigate: (p: Page) => void; onSelectScheme: (s: Scheme) => void }) {
  return (
    <div className="min-h-screen bg-slate-50/50 px-4 py-10">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => onNavigate('departments')} className="flex items-center gap-2 text-slate-500 hover:text-green-600 text-sm font-medium mb-6 transition-colors">← Back to Departments</button>
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center text-3xl">🌾</div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800" style={{ fontFamily: 'Poppins' }}>Agriculture Department</h1>
            <p className="text-slate-400 text-sm">12 active schemes available</p>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {SCHEMES.map(scheme => (
            <div key={scheme.id} className="scheme-card bg-white rounded-2xl border border-slate-100 shadow-sm p-6 cursor-pointer" onClick={() => { onSelectScheme(scheme); onNavigate('scheme-details') }}>
              <div className="flex items-start gap-4 mb-3">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: scheme.color + '18' }}>{scheme.icon}</div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm" style={{ fontFamily: 'Poppins' }}>{scheme.name}</h3>
                  <p className="text-xs text-slate-400">{scheme.department}</p>
                </div>
              </div>
              <p className="text-slate-500 text-xs leading-relaxed mb-4">{scheme.shortDesc}</p>
              <button onClick={e => { e.stopPropagation(); onSelectScheme(scheme); onNavigate('scheme-details') }}
                className="w-full py-2 rounded-xl border border-green-300 text-green-700 hover:bg-green-600 hover:text-white font-semibold text-xs transition-all">
                View Details →
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function EligibilityFormPage({ onNavigate, scheme }: { onNavigate: (p: Page) => void; scheme: Scheme | null }) {
  const [form, setForm] = useState({ age: '', state: '', landOwn: '', landSize: '', income: '', crop: '', farmerCat: '' })
  const [result, setResult] = useState<null | 'eligible' | 'not-eligible'>(null)
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))
  const allFilled = Object.values(form).every(v => v)

  const check = () => {
    const age = parseInt(form.age)
    const incomeLow = form.income === 'Below ₹1 lakh' || form.income === '₹1–2 lakh'
    setResult(age >= 18 && incomeLow && form.landOwn === 'Yes' ? 'eligible' : 'not-eligible')
  }

  if (result) return (
    <div className="min-h-screen bg-slate-50/50 px-4 py-10 flex items-center justify-center">
      <div className="max-w-md w-full">
        <div className={`rounded-3xl p-8 text-center shadow-xl ${result === 'eligible' ? 'bg-green-50 border-2 border-green-300' : 'bg-red-50 border-2 border-red-200'}`}>
          <div className="text-6xl mb-4">{result === 'eligible' ? '✅' : '❌'}</div>
          <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Poppins', color: result === 'eligible' ? '#15803d' : '#dc2626' }}>
            {result === 'eligible' ? 'You Are Eligible!' : 'You Are Not Eligible'}
          </h2>
          <p className="text-slate-500 text-sm mb-6">
            {result === 'eligible' ? `You qualify for ${scheme?.name}.` : 'You do not meet the eligibility criteria for this scheme.'}
          </p>
          {result === 'not-eligible' && (
            <div className="bg-white rounded-2xl p-4 mb-6 text-left">
              <p className="text-xs font-semibold text-slate-600 mb-2">Reasons:</p>
              {parseInt(form.age) < 18 && <p className="text-xs text-red-600">✕ Must be 18 years or older</p>}
              {form.income !== 'Below ₹1 lakh' && form.income !== '₹1–2 lakh' && <p className="text-xs text-red-600">✕ Income must be below ₹2 lakh/year</p>}
              {form.landOwn !== 'Yes' && <p className="text-xs text-red-600">✕ Must own agricultural land</p>}
            </div>
          )}
          <div className="flex flex-col gap-3">
            {result === 'eligible' ? (
              <button onClick={() => onNavigate('apply')} className="w-full py-3.5 rounded-2xl bg-green-600 text-white font-bold hover:bg-green-700 transition-all" style={{ fontFamily: 'Poppins' }}>Apply for Scheme →</button>
            ) : (
              <>
                <button onClick={() => onNavigate('eligible-schemes')} className="w-full py-3.5 rounded-2xl bg-green-600 text-white font-bold hover:bg-green-700 transition-all" style={{ fontFamily: 'Poppins' }}>View Other Schemes</button>
                <button onClick={() => setResult(null)} className="w-full py-3.5 rounded-2xl border border-slate-200 text-slate-600 font-semibold hover:border-green-300 transition-all text-sm">Try Again</button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50/50 px-4 py-10">
      <div className="max-w-xl mx-auto">
        <button onClick={() => onNavigate('scheme-details')} className="flex items-center gap-2 text-slate-500 hover:text-green-600 text-sm font-medium mb-6 transition-colors">← Back to Scheme</button>
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl" style={{ background: (scheme?.color || '#16a34a') + '18' }}>{scheme?.icon || '🌾'}</div>
          <div>
            <h1 className="text-xl font-bold text-slate-800" style={{ fontFamily: 'Poppins' }}>Check Eligibility</h1>
            <p className="text-slate-400 text-sm">{scheme?.name}</p>
          </div>
        </div>
        <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-8">
          <div className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Age</label>
                <input type="number" placeholder="e.g. 35" value={form.age} onChange={e => set('age', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-green-400 transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">State</label>
                <select value={form.state} onChange={e => set('state', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-green-400 bg-white transition-all">
                  <option value="">Select state</option>
                  {STATES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Land Ownership</label>
                <select value={form.landOwn} onChange={e => set('landOwn', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-green-400 bg-white transition-all">
                  <option value="">Select</option><option>Yes</option><option>No</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Land Size (Acres)</label>
                <select value={form.landSize} onChange={e => set('landSize', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-green-400 bg-white transition-all">
                  <option value="">Select</option>
                  {['< 1 Acre','1–2 Acres','2–5 Acres','5–10 Acres','> 10 Acres'].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Annual Income</label>
                <select value={form.income} onChange={e => set('income', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-green-400 bg-white transition-all">
                  <option value="">Select</option>
                  {['Below ₹1 lakh','₹1–2 lakh','₹2–3 lakh','₹3–5 lakh','Above ₹5 lakh'].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Main Crop Type</label>
                <select value={form.crop} onChange={e => set('crop', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-green-400 bg-white transition-all">
                  <option value="">Select</option>
                  {['Rice','Wheat','Maize','Sugarcane','Cotton','Pulses','Vegetables','Fruits','Other'].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Farmer Category</label>
              <select value={form.farmerCat} onChange={e => set('farmerCat', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-green-400 bg-white transition-all">
                <option value="">Select</option>
                {['Marginal Farmer (< 1 Ha)','Small Farmer (1–2 Ha)','Medium Farmer (2–10 Ha)','Large Farmer (> 10 Ha)'].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>
          <button disabled={!allFilled} onClick={check}
            className={`mt-6 w-full py-4 rounded-xl font-bold text-sm transition-all ${allFilled ? 'bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-600/25 active:scale-95' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
            style={{ fontFamily: 'Poppins' }}>
            Check Eligibility →
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Apply (5-step enhanced) ──────────────────────────────────────────────────

function ApplyPage({ onNavigate, scheme }: { onNavigate: (p: Page) => void; scheme: Scheme | null }) {
  const [step, setStep] = useState(0)
  const [showSMS, setShowSMS] = useState(false)
  const [docState, setDocState] = useState<Record<string, 'idle' | 'uploaded' | 'verified'>>({
    'Aadhaar Card': 'idle', 'Income Certificate': 'idle', 'Land Document': 'idle',
    'Bank Details': 'idle', 'Residence Certificate': 'idle',
  })
  const [aadhaar, setAadhaar] = useState('8742 5631 9012')
  const [aadhaarMasked, setAadhaarMasked] = useState(false)
  const [otpDigits, setOtpDigits] = useState(['','','','','',''])
  const otpRefs = useRef<(HTMLInputElement|null)[]>([])
  const [timer, setTimer] = useState(30)
  const APP_ID = 'CB-AGR-2026-10245'
  const steps = ['Personal Details', 'Documents', 'Verification', 'Review', 'Submit']

  useEffect(() => {
    if (step === 2 && timer > 0) {
      const t = setTimeout(() => setTimer(x => x - 1), 1000)
      return () => clearTimeout(t)
    }
  }, [step, timer])

  const handleOtpChange = (i: number, v: string) => {
    if (!/^\d?$/.test(v)) return
    const next = [...otpDigits]; next[i] = v; setOtpDigits(next)
    if (v && i < 5) otpRefs.current[i+1]?.focus()
  }
  const handleOtpKey = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[i] && i > 0) otpRefs.current[i-1]?.focus()
  }

  const uploadDoc = (doc: string) => {
    setDocState(d => ({ ...d, [doc]: 'uploaded' }))
    setTimeout(() => setDocState(d => ({ ...d, [doc]: 'verified' })), 1200)
  }
  const allDocsVerified = Object.values(docState).every(v => v === 'verified')
  const otpFilled = otpDigits.every(d => d !== '')

  // Success + SMS
  if (step >= 5) {
    return (
      <div className="min-h-screen bg-slate-50/60 px-4 py-10">
        <div className="max-w-xl mx-auto">
          {/* Success card */}
          <div className="bg-white rounded-3xl shadow-xl border border-green-200 p-8 mb-5 text-center animate-slide-up">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center text-4xl mx-auto mb-5">🎉</div>
            <div className="inline-flex items-center gap-2 bg-green-50 border border-green-300 text-green-700 px-3 py-1.5 rounded-full text-xs font-semibold mb-4">✓ Application Submitted Successfully!</div>
            <h2 className="text-2xl font-bold text-slate-800 mb-1" style={{ fontFamily: 'Poppins' }}>You're all set, Rajesh!</h2>
            <p className="text-slate-400 text-sm mb-6">Your application has been received by the department.</p>

            <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-left mb-5">
              {[
                ['Application ID', APP_ID],
                ['Department', 'Agriculture & Farmers Welfare'],
                ['Scheme', 'Farmer Support Scheme'],
                ['Submitted On', '08 Aug 2026, 10:34 AM'],
                ['Status', 'Submitted / Under Verification'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between items-center py-2 border-b border-green-100 last:border-0">
                  <span className="text-xs text-slate-400">{k}</span>
                  <span className={`text-xs font-bold ${k === 'Application ID' ? 'text-green-700 font-mono text-sm' : 'text-slate-700'}`}>{v}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <button onClick={() => onNavigate('application-tracking')}
                className="py-3 rounded-xl bg-green-600 text-white font-semibold text-xs hover:bg-green-700 transition-all col-span-1" style={{ fontFamily: 'Poppins' }}>
                Track →
              </button>
              <button onClick={() => onNavigate('my-applications')}
                className="py-3 rounded-xl border border-green-300 text-green-700 font-semibold text-xs hover:bg-green-50 transition-all col-span-1">
                My Apps
              </button>
              <button onClick={() => onNavigate('dashboard')}
                className="py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:border-green-300 transition-all col-span-1">
                Dashboard
              </button>
            </div>
          </div>

          {/* SMS mockup */}
          <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-6 animate-slide-up">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-sm">📱</div>
              <div>
                <p className="text-xs font-bold text-slate-700">SMS Notification</p>
                <p className="text-xs text-slate-400">Sent to +91 98765 43210</p>
              </div>
              <span className="ml-auto text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">Delivered ✓</span>
            </div>

            {/* Phone mockup */}
            <div className="bg-slate-900 rounded-3xl p-4 mx-auto max-w-xs relative overflow-hidden">
              <div className="w-12 h-1 bg-slate-700 rounded-full mx-auto mb-4" />
              <div className="bg-slate-800 rounded-2xl p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-xs">EA</div>
                  <span className="text-white text-xs font-semibold">Easy Access</span>
                  <span className="ml-auto text-slate-400 text-xs">now</span>
                </div>
                <div className="bg-white rounded-xl p-3">
                  <p className="text-slate-800 text-xs leading-relaxed">
                    <span className="font-bold">Easy Access:</span> Your application has been successfully submitted.<br />
                    <span className="font-bold">Application ID: {APP_ID}.</span><br />
                    Track your application on Easy Access.
                  </p>
                  <button className="mt-2 w-full py-1.5 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 transition-colors">
                    Open Easy Access →
                  </button>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full border-2 border-slate-700 mx-auto mt-3" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50/60 px-4 py-10">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => step > 0 ? setStep(s => s-1) : onNavigate('scheme-details')}
            className="w-9 h-9 rounded-xl border border-slate-200 hover:border-green-400 flex items-center justify-center transition-colors text-slate-500 hover:text-green-600">←</button>
          <div>
            <h1 className="text-xl font-bold text-slate-800" style={{ fontFamily: 'Poppins' }}>Apply for Farmer Support Scheme</h1>
            <p className="text-slate-400 text-sm">Agriculture & Farmers Welfare Department</p>
          </div>
        </div>

        <StepIndicator steps={steps} current={step} />

        <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-8">
          {/* Step 0 — Personal Details */}
          {step === 0 && (
            <div className="animate-fade-in">
              <h3 className="font-bold text-slate-800 mb-5 text-base" style={{ fontFamily: 'Poppins' }}>Personal Details</h3>
              <div className="space-y-4">
                {[
                  { label: 'Full Name', value: 'Rajesh Kumar', icon: '👤' },
                  { label: 'Phone Number', value: '+91 98765 43210', icon: '📱' },
                  { label: 'Address', value: 'Village Hosalli, Mandya, Karnataka 571401', icon: '📍' },
                ].map(f => (
                  <div key={f.label}>
                    <label className="block text-sm font-semibold text-slate-600 mb-1.5">{f.label}</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2">{f.icon}</span>
                      <input defaultValue={f.value} className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all" />
                    </div>
                  </div>
                ))}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-600 mb-1.5">State</label>
                    <select defaultValue="Karnataka" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-green-400 bg-white transition-all">
                      {STATES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-600 mb-1.5">District</label>
                    <input defaultValue="Mandya" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-green-400 transition-all" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-1.5">Occupation</label>
                  <select defaultValue="Farmer" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-green-400 bg-white transition-all">
                    {['Farmer','Student','Self Employed','Daily Wage Worker','Homemaker','Unemployed'].map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 1 — Documents */}
          {step === 1 && (
            <div className="animate-fade-in">
              <h3 className="font-bold text-slate-800 mb-2 text-base" style={{ fontFamily: 'Poppins' }}>Documents</h3>
              <p className="text-slate-400 text-sm mb-5">Upload your documents. Each will be auto-verified after upload.</p>

              <div className="mb-5">
                <label className="block text-sm font-semibold text-slate-600 mb-1.5">Aadhaar Number</label>
                <div className="relative">
                  <input
                    value={aadhaarMasked ? 'XXXX XXXX ' + aadhaar.slice(-4) : aadhaar}
                    onChange={e => !aadhaarMasked && setAadhaar(e.target.value)}
                    readOnly={aadhaarMasked}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-green-400 transition-all font-mono"
                  />
                  <button onClick={() => setAadhaarMasked(m => !m)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-green-600 font-semibold hover:text-green-700">
                    {aadhaarMasked ? 'Show' : 'Mask'}
                  </button>
                </div>
                {aadhaarMasked && <p className="text-xs text-green-600 mt-1.5 flex items-center gap-1">🔒 Aadhaar number masked for security</p>}
              </div>

              <p className="text-sm font-semibold text-slate-700 mb-3">Required Documents</p>
              <div className="space-y-3">
                {Object.entries(docState).map(([doc, state]) => (
                  <div key={doc} className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all ${
                    state === 'verified' ? 'border-green-300 bg-green-50' :
                    state === 'uploaded' ? 'border-amber-300 bg-amber-50' :
                    'border-slate-200 bg-white hover:border-green-200'}`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${state === 'verified' ? 'bg-green-100' : state === 'uploaded' ? 'bg-amber-100' : 'bg-slate-100'}`}>📄</div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-700">{doc}</p>
                      <p className="text-xs text-slate-400">
                        {state === 'verified' ? '✓ Verified' : state === 'uploaded' ? '⟳ Verifying...' : 'PDF, JPG, PNG (max 5MB)'}
                      </p>
                    </div>
                    {state === 'idle' && (
                      <button onClick={() => uploadDoc(doc)}
                        className="px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-semibold hover:bg-green-700 transition-colors">
                        Upload
                      </button>
                    )}
                    {state === 'uploaded' && <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />}
                    {state === 'verified' && <span className="text-green-600 font-bold text-lg">✓</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2 — OTP */}
          {step === 2 && (
            <div className="animate-fade-in text-center">
              <div className="w-16 h-16 rounded-2xl bg-green-50 border border-green-200 flex items-center justify-center text-3xl mx-auto mb-4">📱</div>
              <h3 className="font-bold text-slate-800 text-lg mb-2" style={{ fontFamily: 'Poppins' }}>OTP Verification</h3>
              <p className="text-slate-500 text-sm mb-6">Enter the 6-digit OTP sent to <span className="font-semibold text-slate-700">+91 98765 43210</span></p>
              <div className="flex gap-2.5 justify-center mb-5">
                {otpDigits.map((digit, i) => (
                  <input key={i} ref={el => { otpRefs.current[i] = el }}
                    type="text" inputMode="numeric" maxLength={1} value={digit}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKey(i, e)}
                    className={`otp-input ${digit ? 'filled' : ''}`} />
                ))}
              </div>
              <div className="mb-6 text-sm">
                {timer > 0
                  ? <span className="text-slate-400">Resend in <span className="font-semibold text-slate-600">{timer}s</span></span>
                  : <button onClick={() => setTimer(30)} className="text-green-600 font-semibold hover:text-green-700">Resend OTP</button>
                }
              </div>
              <button disabled={!otpFilled} onClick={() => setStep(3)}
                className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all ${otpFilled ? 'bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-600/25 active:scale-95' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                style={{ fontFamily: 'Poppins' }}>
                Verify →
              </button>
            </div>
          )}

          {/* Step 3 — Review */}
          {step === 3 && (
            <div className="animate-fade-in">
              <h3 className="font-bold text-slate-800 mb-5 text-base" style={{ fontFamily: 'Poppins' }}>Review & Submit</h3>
              {[
                { heading: 'Personal Information', icon: '👤', items: [['Name','Rajesh Kumar'],['Phone','+91 98765 43210'],['Address','Village Hosalli, Mandya, Karnataka'],['State','Karnataka'],['District','Mandya'],['Occupation','Farmer']] },
                { heading: 'Eligibility', icon: '✅', items: [['Age','38 years'],['Land Ownership','2.5 Acres'],['Annual Income','₹1.4 lakh'],['Farmer Category','Small Farmer'],['Category','OBC']] },
                { heading: 'Documents', icon: '📄', items: Object.entries(docState).map(([d, s]) => [d, s === 'verified' ? '✓ Verified' : '⚠ Pending']) },
                { heading: 'Mobile Verification', icon: '📱', items: [['Mobile','+91 98765 43210'],['OTP Verified','Yes ✓']] },
                { heading: 'Scheme & Department', icon: '🌾', items: [['Scheme','Farmer Support Scheme'],['Department','Agriculture & Farmers Welfare'],['Benefit','₹6,000/year (3 installments)']] },
              ].map(section => (
                <div key={section.heading} className="mb-5 bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <p className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wide flex items-center gap-1.5">{section.icon} {section.heading}</p>
                  <div className="space-y-2">
                    {section.items.map(([k, v]) => (
                      <div key={k} className="flex justify-between text-sm">
                        <span className="text-slate-400">{k}</span>
                        <span className={`font-semibold ${v.includes('✓') ? 'text-green-700' : v.includes('⚠') ? 'text-amber-600' : 'text-slate-700'}`}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 mb-5">
                <p className="text-xs text-amber-700"><span className="font-bold">Declaration:</span> I declare that all information is true and correct. I understand that false information may lead to rejection and legal action.</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(0)} className="flex-1 py-3.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:border-green-300 transition-all">Edit Details</button>
                <button onClick={() => setStep(5)} className="flex-1 py-3.5 rounded-xl bg-green-600 text-white font-bold text-sm hover:bg-green-700 shadow-lg shadow-green-600/25 transition-all active:scale-95" style={{ fontFamily: 'Poppins' }}>Submit Application →</button>
              </div>
            </div>
          )}

          {step < 3 && (
            <div className="flex gap-3 mt-8">
              <button onClick={() => setStep(s => s + 1)}
                disabled={step === 1 && !allDocsVerified}
                className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all ${
                  (step === 1 && !allDocsVerified) ? 'bg-slate-100 text-slate-400 cursor-not-allowed' :
                  'bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-600/20 active:scale-95'}`}
                style={{ fontFamily: 'Poppins' }}>
                {step === 1 ? (allDocsVerified ? 'Verify & Continue →' : `Upload all documents (${Object.values(docState).filter(v=>v==='verified').length}/5)`) : 'Continue →'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── My Applications ──────────────────────────────────────────────────────────

function MyApplicationsPage({ onNavigate, onSelectApp }: { onNavigate: (p: Page) => void; onSelectApp: (a: Application) => void }) {
  const [filter, setFilter] = useState<'all' | Application['status']>('all')
  const filtered = filter === 'all' ? SAMPLE_APPLICATIONS : SAMPLE_APPLICATIONS.filter(a => a.status === filter)

  return (
    <div className="min-h-screen bg-slate-50/60 px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-7">
          <div>
            <h1 className="text-2xl font-bold text-slate-800" style={{ fontFamily: 'Poppins' }}>My Applications</h1>
            <p className="text-slate-400 text-sm">{SAMPLE_APPLICATIONS.length} applications found</p>
          </div>
          <button onClick={() => onNavigate('find-schemes')} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-green-700 transition-all">+ New</button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {[['all','All'],['submitted','Submitted'],['under-verification','Under Verification'],['approved','Approved'],['rejected','Rejected']].map(([key, label]) => (
            <button key={key} onClick={() => setFilter(key as typeof filter)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${filter === key ? 'bg-green-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-500 hover:border-green-300'}`}>
              {label}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {filtered.map(app => {
            const cfg = statusConfig[app.status]
            return (
              <div key={app.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-all">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: app.color + '18' }}>{app.departmentIcon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-bold text-slate-800 text-sm" style={{ fontFamily: 'Poppins' }}>{app.scheme}</h3>
                      <StatusBadge status={app.status} />
                    </div>
                    <p className="text-xs text-slate-400 mb-1">{app.department}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-xs font-mono font-semibold text-slate-500">{app.id}</span>
                      <span className="text-xs text-slate-400">Submitted: {app.submitted}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <button onClick={() => { onSelectApp(app); onNavigate('application-tracking') }}
                    className="flex-1 py-2.5 rounded-xl border border-green-300 text-green-700 text-xs font-semibold hover:bg-green-50 transition-all">
                    View Details →
                  </button>
                  <button onClick={() => { onSelectApp(app); onNavigate('application-tracking') }}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-500 text-xs font-semibold hover:bg-slate-200 transition-all">
                    Track
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">📭</div>
            <h3 className="font-bold text-slate-700 mb-2">No applications found</h3>
            <p className="text-slate-400 text-sm mb-6">You have no {filter !== 'all' ? filter : ''} applications yet.</p>
            <button onClick={() => onNavigate('find-schemes')} className="bg-green-600 text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-green-700 transition-colors">Find Schemes</button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Application Tracking ─────────────────────────────────────────────────────

function ApplicationTrackingPage({ onNavigate, app }: { onNavigate: (p: Page) => void; app: Application | null }) {
  const selectedApp = app || SAMPLE_APPLICATIONS[0]

  const timeline = [
    { label: 'Application Submitted', date: '02 Aug 2026, 10:34 AM', done: true, note: 'Application received and reference ID generated.' },
    { label: 'Document Verification', date: '03 Aug 2026, 02:15 PM', done: true, note: 'All 5 documents verified by the system.' },
    { label: 'Department Review', date: 'In Progress', done: false, active: true, note: 'Agriculture officer reviewing your application.' },
    { label: 'Application Approved', date: 'Pending', done: false, active: false, note: '' },
    { label: 'Benefit Disbursed', date: 'Pending', done: false, active: false, note: '' },
  ]

  return (
    <div className="min-h-screen bg-slate-50/60 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-7">
          <button onClick={() => onNavigate('my-applications')} className="w-9 h-9 rounded-xl border border-slate-200 hover:border-green-400 flex items-center justify-center transition-colors text-slate-500 hover:text-green-600">←</button>
          <div>
            <h1 className="text-xl font-bold text-slate-800" style={{ fontFamily: 'Poppins' }}>Track Application</h1>
            <p className="text-slate-400 text-sm font-mono">{selectedApp.id}</p>
          </div>
        </div>

        {/* Summary card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-5">
          <div className="grid grid-cols-2 gap-4">
            {[
              ['Application ID', selectedApp.id],
              ['Department', selectedApp.department],
              ['Scheme', selectedApp.scheme],
              ['Last Updated', '08 Aug 2026'],
            ].map(([k, v]) => (
              <div key={k}>
                <p className="text-xs text-slate-400 mb-0.5">{k}</p>
                <p className={`text-sm font-semibold text-slate-700 ${k === 'Application ID' ? 'font-mono text-green-700' : ''}`}>{v}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 mb-1">Current Status</p>
              <StatusBadge status={selectedApp.status} />
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400 mb-0.5">Expected Completion</p>
              <p className="text-sm font-semibold text-slate-700">22 Aug 2026</p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-5">
          <h3 className="font-bold text-slate-800 mb-6" style={{ fontFamily: 'Poppins' }}>Application Timeline</h3>
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-100" />
            <div className="space-y-6">
              {timeline.map((t, i) => (
                <div key={i} className="flex gap-5 relative">
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 z-10 transition-all ${
                    t.done ? 'bg-green-600 border-green-600' :
                    t.active ? 'bg-white border-green-600' :
                    'bg-white border-slate-200'}`}>
                    {t.done ? <span className="text-white text-xs">✓</span> :
                     t.active ? <span className="w-2.5 h-2.5 rounded-full bg-green-500 block" style={{ animation: 'pulse 2s infinite' }} /> :
                     <span className="w-2 h-2 rounded-full bg-slate-200 block" />}
                  </div>
                  <div className="flex-1 pb-2">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className={`text-sm font-semibold ${t.done ? 'text-slate-800' : t.active ? 'text-green-700' : 'text-slate-400'}`} style={{ fontFamily: 'Poppins' }}>{t.label}</p>
                      {t.active && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">In Progress</span>}
                    </div>
                    <p className="text-xs text-slate-400">{t.date}</p>
                    {t.note && <p className="text-xs text-slate-500 mt-1 bg-slate-50 rounded-lg px-3 py-2">{t.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => onNavigate('my-applications')} className="py-3.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:border-green-300 transition-all">My Applications</button>
          <button onClick={() => onNavigate('dashboard')} className="py-3.5 rounded-xl bg-green-600 text-white font-semibold text-sm hover:bg-green-700 transition-all">Dashboard →</button>
        </div>
      </div>
    </div>
  )
}

// ─── Profile ─────────────────────────────────────────────────────────────────

function ProfilePage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const [editMode, setEditMode] = useState(false)
  const [logoutConfirm, setLogoutConfirm] = useState(false)

  return (
    <div className="min-h-screen bg-slate-50/60 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Profile hero */}
        <div className="bg-gradient-to-br from-green-600 to-green-500 rounded-3xl p-7 mb-5 text-white relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10" />
          <div className="flex items-center gap-5 relative">
            <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center text-4xl border-2 border-white/30">👨‍🌾</div>
            <div>
              <h2 className="text-xl font-bold" style={{ fontFamily: 'Poppins' }}>Rajesh Kumar</h2>
              <p className="text-green-200 text-sm">+91 98765 43210</p>
              <p className="text-green-200 text-xs mt-0.5">Village Hosalli, Mandya, Karnataka</p>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-300" />
                <span className="text-green-200 text-xs">Verified Citizen</span>
              </div>
            </div>
          </div>
        </div>

        {/* Info sections */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800" style={{ fontFamily: 'Poppins' }}>Personal Information</h3>
            <button onClick={() => setEditMode(!editMode)} className="text-xs text-green-600 font-semibold hover:text-green-700 border border-green-300 px-3 py-1.5 rounded-lg hover:bg-green-50 transition-all">
              {editMode ? 'Save' : '✏ Edit'}
            </button>
          </div>
          <div className="space-y-4">
            {[
              { label: 'Full Name', value: 'Rajesh Kumar', icon: '👤' },
              { label: 'Date of Birth', value: '15 August 1985', icon: '🎂' },
              { label: 'Occupation', value: 'Farmer', icon: '🌾' },
              { label: 'Annual Income', value: '₹1,40,000', icon: '💰' },
              { label: 'Category', value: 'OBC', icon: '📋' },
              { label: 'State', value: 'Karnataka', icon: '📍' },
            ].map(f => (
              <div key={f.label} className="flex items-center gap-3">
                <span className="text-base">{f.icon}</span>
                <div className="flex-1">
                  <p className="text-xs text-slate-400">{f.label}</p>
                  {editMode
                    ? <input defaultValue={f.value} className="w-full mt-0.5 px-2 py-1 rounded-lg border border-slate-200 text-sm outline-none focus:border-green-400 transition-all" />
                    : <p className="text-sm font-semibold text-slate-700">{f.value}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Menu items */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-4">
          {[
            { icon: '📋', label: 'My Applications', badge: '3', action: () => onNavigate('my-applications') },
            { icon: '🔔', label: 'Notifications', badge: '3', action: () => onNavigate('notifications') },
            { icon: '🌐', label: 'Language Preference', badge: 'EN', action: () => {} },
            { icon: '❓', label: 'Help & Support', badge: null, action: () => {} },
            { icon: '🔒', label: 'Privacy & Security', badge: null, action: () => {} },
          ].map(item => (
            <button key={item.label} onClick={item.action}
              className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0">
              <span className="text-lg">{item.icon}</span>
              <span className="flex-1 text-sm font-medium text-slate-700 text-left">{item.label}</span>
              {item.badge && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">{item.badge}</span>}
              <span className="text-slate-300 text-sm">›</span>
            </button>
          ))}
        </div>

        <button onClick={() => setLogoutConfirm(true)}
          className="w-full py-3.5 rounded-xl border-2 border-red-200 text-red-600 font-semibold text-sm hover:bg-red-50 transition-all flex items-center justify-center gap-2">
          🚪 Logout
        </button>

        {logoutConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full mx-4">
              <div className="text-4xl text-center mb-3">🚪</div>
              <h3 className="text-lg font-bold text-slate-800 text-center mb-2" style={{ fontFamily: 'Poppins' }}>Confirm Logout</h3>
              <p className="text-slate-500 text-sm text-center mb-6">Are you sure you want to logout?</p>
              <div className="flex gap-3">
                <button onClick={() => setLogoutConfirm(false)} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm">Cancel</button>
                <button onClick={() => { setLogoutConfirm(false); onNavigate('login') }} className="flex-1 py-3 rounded-xl bg-red-500 text-white font-semibold text-sm hover:bg-red-600">Logout</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Notifications ────────────────────────────────────────────────────────────

function NotificationsPage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const [notifications, setNotifications] = useState(NOTIFICATIONS_DATA)
  const markAll = () => setNotifications(n => n.map(x => ({ ...x, read: true })))

  return (
    <div className="min-h-screen bg-slate-50/60 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-7">
          <div>
            <h1 className="text-2xl font-bold text-slate-800" style={{ fontFamily: 'Poppins' }}>Notifications</h1>
            <p className="text-slate-400 text-sm">{notifications.filter(n => !n.read).length} unread</p>
          </div>
          <button onClick={markAll} className="text-xs text-green-600 font-semibold hover:text-green-700 border border-green-300 px-3 py-1.5 rounded-lg hover:bg-green-50 transition-all">Mark all read</button>
        </div>

        <div className="space-y-3">
          {notifications.map(notif => (
            <div key={notif.id}
              onClick={() => setNotifications(n => n.map(x => x.id === notif.id ? { ...x, read: true } : x))}
              className={`flex gap-4 p-4 rounded-2xl border cursor-pointer transition-all hover:shadow-sm ${notif.read ? 'bg-white border-slate-100' : 'bg-white border-green-200 shadow-sm'}`}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: notif.color + '18' }}>
                {notif.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm font-semibold ${notif.read ? 'text-slate-700' : 'text-slate-900'}`} style={{ fontFamily: 'Poppins' }}>{notif.title}</p>
                  {!notif.read && <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0 mt-1.5" />}
                </div>
                <p className="text-xs text-slate-500 leading-relaxed mt-0.5">{notif.desc}</p>
                <p className="text-xs text-slate-400 mt-1.5">{notif.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Nearest Office ───────────────────────────────────────────────────────────

function NearestOfficePage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const [selected, setSelected] = useState(0)

  return (
    <div className="min-h-screen bg-slate-50/60 px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <button onClick={() => onNavigate('my-applications')} className="flex items-center gap-2 text-slate-500 hover:text-green-600 text-sm font-medium mb-6 transition-colors">← Back</button>
        <div className="mb-7">
          <h1 className="text-2xl font-bold text-slate-800 mb-1" style={{ fontFamily: 'Poppins' }}>Nearest Government Offices</h1>
          <p className="text-slate-400 text-sm">Based on your registered address: Mandya, Karnataka</p>
        </div>

        {/* Simple map */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden mb-5">
          <div className="relative bg-green-50/60 h-48 flex items-center justify-center" style={{
            backgroundImage: 'radial-gradient(circle, rgba(22,163,74,0.07) 1px, transparent 1px)', backgroundSize: '20px 20px'
          }}>
            <svg viewBox="0 0 400 200" className="absolute inset-0 w-full h-full opacity-20">
              <path d="M 50 80 Q 100 60 160 90 Q 200 110 250 80 Q 300 55 350 85" stroke="#16a34a" strokeWidth="3" fill="none" />
              <path d="M 80 40 L 80 160" stroke="#94a3b8" strokeWidth="1.5" />
              <path d="M 200 30 L 200 170" stroke="#94a3b8" strokeWidth="1.5" />
              <path d="M 320 40 L 320 160" stroke="#94a3b8" strokeWidth="1.5" />
              <path d="M 20 100 L 380 100" stroke="#94a3b8" strokeWidth="1.5" />
              <path d="M 20 140 L 380 140" stroke="#94a3b8" strokeWidth="1.5" />
            </svg>
            {OFFICES.map((o, i) => (
              <button key={i} onClick={() => setSelected(i)}
                className={`absolute transition-all ${i===0 ? 'top-12 left-1/4' : i===1 ? 'top-8 left-1/2' : 'bottom-10 right-1/4'}`}>
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm shadow-lg transition-all ${selected===i ? 'bg-green-600 border-green-700 scale-125' : 'bg-white border-green-400'}`}>
                  📍
                </div>
                <div className={`absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-semibold px-2 py-0.5 rounded-full shadow transition-all ${selected===i ? 'bg-green-600 text-white' : 'bg-white text-slate-700 border border-slate-200'}`}>
                  {o.dist}
                </div>
              </button>
            ))}
            <div className="absolute bottom-2 right-3 bg-white/80 backdrop-blur-sm rounded-xl px-3 py-1.5 text-xs text-slate-500 border border-slate-200">
              📍 Mandya District, Karnataka
            </div>
          </div>
        </div>

        {/* Office cards */}
        <div className="space-y-4">
          {OFFICES.map((office, i) => (
            <div key={i} onClick={() => setSelected(i)}
              className={`bg-white rounded-2xl border shadow-sm p-5 cursor-pointer transition-all hover:shadow-md ${selected === i ? 'border-green-400 ring-2 ring-green-100' : 'border-slate-100'}`}>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center text-xl flex-shrink-0">🏛️</div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm" style={{ fontFamily: 'Poppins' }}>{office.name}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">📍 {office.area}</p>
                    </div>
                    <span className="text-xs bg-green-50 border border-green-200 text-green-700 px-2.5 py-1 rounded-full font-semibold flex-shrink-0">{office.dist}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {office.services.map(s => (
                      <span key={s} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{s}</span>
                    ))}
                  </div>
                  <div className="mt-3 flex gap-2.5">
                    <a href={`https://maps.google.com/?q=${office.lat},${office.lng}`} target="_blank" rel="noreferrer"
                      onClick={e => e.stopPropagation()}
                      className="flex-1 py-2.5 rounded-xl bg-green-600 text-white text-xs font-semibold text-center hover:bg-green-700 transition-colors">
                      🗺 Get Directions
                    </a>
                    <a href={`tel:${office.phone}`} onClick={e => e.stopPropagation()}
                      className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold text-center hover:border-green-300 hover:text-green-700 transition-all">
                      📞 Call Office
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Escalation banner */}
        <div className="mt-5 bg-amber-50 border border-amber-200 rounded-2xl p-5 text-center">
          <p className="text-sm font-semibold text-amber-800 mb-1" style={{ fontFamily: 'Poppins' }}>Need In-Person Assistance?</p>
          <p className="text-xs text-amber-600 mb-3">Visit any office above for application help, document verification, or grievance redressal.</p>
          <p className="text-xs text-amber-700 font-semibold">National Helpline: <span className="font-mono">1800-11-0001</span> (Toll Free)</p>
        </div>
      </div>
    </div>
  )
}

// ─── App root ─────────────────────────────────────────────────────────────────

export default function App() {
  const [page, setPage] = useState<Page>('home')
  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(null)
  const [selectedApp, setSelectedApp] = useState<Application | null>(null)
  const [userData, setUserData] = useState<Partial<UserData>>({})
  const unread = NOTIFICATIONS_DATA.filter(n => !n.read).length

  const navigate = (p: Page) => {
    setPage(p)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const noHeader = ['login', 'otp'].includes(page)

  return (
    <div className="min-h-screen bg-white">
      {!noHeader && <Header currentPage={page} onNavigate={navigate} unreadCount={unread} />}

      <main>
        {page === 'home' && <HomePage onNavigate={navigate} />}
        {page === 'dashboard' && <DashboardPage onNavigate={navigate} />}
        {page === 'login' && <LoginPage onNavigate={navigate} />}
        {page === 'otp' && <OTPPage onNavigate={navigate} />}
        {page === 'find-schemes' && <FindSchemesPage onNavigate={navigate} onSetUserData={d => setUserData(p => ({ ...p, ...d }))} />}
        {page === 'eligible-schemes' && <EligibleSchemesPage onNavigate={navigate} onSelectScheme={setSelectedScheme} userData={userData} />}
        {page === 'scheme-details' && <SchemeDetailsPage onNavigate={navigate} scheme={selectedScheme} />}
        {page === 'departments' && <DepartmentsPage onNavigate={navigate} />}
        {page === 'department-schemes' && <DepartmentSchemesPage onNavigate={navigate} onSelectScheme={setSelectedScheme} />}
        {page === 'eligibility-form' && <EligibilityFormPage onNavigate={navigate} scheme={selectedScheme} />}
        {page === 'apply' && <ApplyPage onNavigate={navigate} scheme={selectedScheme} />}
        {page === 'my-applications' && <MyApplicationsPage onNavigate={navigate} onSelectApp={setSelectedApp} />}
        {page === 'application-tracking' && <ApplicationTrackingPage onNavigate={navigate} app={selectedApp} />}
        {page === 'profile' && <ProfilePage onNavigate={navigate} />}
        {page === 'notifications' && <NotificationsPage onNavigate={navigate} />}
        {page === 'nearest-office' && <NearestOfficePage onNavigate={navigate} />}
      </main>

      <AIChatbot onNavigate={navigate} />
    </div>
  )
}
