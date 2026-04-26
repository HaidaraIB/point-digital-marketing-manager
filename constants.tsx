
import { AgencySettings, AppData, UserRole, ContractClause } from './types.ts';

export const COUNTRY_CODES = [
  { code: '+964', name: 'العراق', flag: '🇮🇶' },
  { code: '+966', name: 'السعودية', flag: '🇸🇦' },
  { code: '+971', name: 'الإمارات', flag: '🇦🇪' },
  { code: '+962', name: 'الأردن', flag: '🇯🇴' },
  { code: '+965', name: 'الكويت', flag: '🇰🇼' },
  { code: '+90', name: 'تركيا', flag: '🇹🇷' },
  { code: '+44', name: 'بريطانيا', flag: '🇬🇧' },
];

export const DEFAULT_SETTINGS: AgencySettings = {
  name: "وكالة نقطة للتسويق الرقمي",
  logo: "https://b.top4top.io/p_36858vsgh1.png",
  address: "العراق، بغداد، الكرادة",
  phone: "+964 770 000 0000",
  email: "info@noqta.agency",
  services: [
    { name: "إدارة منصات التواصل الاجتماعي", description: "إدارة المحتوى والرد على التعليقات والرسائل" },
    { name: "تصميم الهوية البصرية", description: "تصميم الشعارات والقوالب الرسمية المتكاملة" },
    { name: "إنتاج الفيديو والموشن جرافيك", description: "إنتاج فيديوهات إبداعية ترويجية عالية الجودة" }
  ],
  quotationTerms: [
    "هذا العرض ساري لمدة (15) يوماً من تاريخ الإصدار الموضح أعلاه.",
    "يتم دفع (50%) مقدماً عند توقيع العقد، و(50%) عند التسليم النهائي."
  ],
  twilio: {
    accountSid: "",
    authToken: "",
    fromNumber: "",
    senderName: "NOQTA",
    isEnabled: false
  },
  exchangeRate: 1500 // الافتراضي 1500 دينار لكل دولار
};

export const DEFAULT_CLAUSES: ContractClause[] = [
  { id: '1', title: 'موضوع العقد', content: 'يلتزم الطرف الأول بتقديم الخدمات المتفق عليها للطرف الثاني حسب المواصفات الفنية الموضحة في الملاحق.' },
  { id: '2', title: 'مدة العقد', content: 'يبدأ العمل بهذا العقد من تاريخ التوقيع عليه ولمدة سنة واحدة قابلة للتجديد بموافقة الطرفين.' },
  { id: '3', title: 'الالتزامات المالية', content: 'يلتزم الطرف الثاني بدفع المبالغ المستحقة للطرف الأول في المواعيد المحددة وفقاً لجدول الدفعات المتفق عليه.' }
];

export const INITIAL_DATA: AppData = {
  quotations: [],
  vouchers: [],
  monthlyOpeningBalances: [],
  contracts: [],
  freelancers: [],
  freelanceWorks: [],
  smsLogs: [],
  users: [
    {
      id: "U-001",
      name: "مدير الوكالة",
      username: "admin",
      password: "123",
      role: UserRole.ADMIN,
      createdAt: new Date().toLocaleDateString('ar-IQ')
    }
  ],
  settings: DEFAULT_SETTINGS
};

export const CURRENCY_SYMBOLS = {
  IQD: "د.ع",
  USD: "$"
};
