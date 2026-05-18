import { CategoryId } from './categories'

export interface Definition {
  term: string
  definition: string
  translation: string // Arabic translation
}

export interface CategoryDefinitions {
  categoryId: CategoryId
  definitions: Definition[]
}

/**
 * Definitions for each subject category.
 * Currently populated for English; other categories can be added later.
 */
export const DEFINITIONS: CategoryDefinitions[] = [
  {
    categoryId: 'English',
    definitions: [
      {
        term: 'Internet',
        definition:
          'A global network that connects millions of computers worldwide to share information.',
        translation: 'شبكة عالمية تربط ملايين أجهزة الكمبيوتر حول العالم لتبادل المعلومات.',
      },
      {
        term: 'Web browser',
        definition: 'A software application used to access and view websites on the Internet.',
        translation: 'برنامج يستخدم للوصول إلى مواقع الويب وعرضها على الإنترنت.',
      },
      {
        term: 'Database',
        definition:
          'An organized collection of data stored electronically for easy access and management.',
        translation: 'مجموعة منظمة من البيانات يتم تخزينها إلكترونياً لسهولة الوصول والإدارة.',
      },
      {
        term: 'Algorithm',
        definition: 'A step-by-step set of instructions used to solve a problem or perform a task.',
        translation: 'مجموعة من الخطوات المتتابعة تستخدم لحل مشكلة أو تنفيذ مهمة.',
      },
      {
        term: 'Table',
        definition: 'A collection of rows and columns used to organize data in a database.',
        translation: 'مجموعة من الصفوف والأعمدة تستخدم لتنظيم البيانات في قاعدة البيانات.',
      },
      {
        term: 'IP address',
        definition: 'A unique number assigned to a device connected to a network.',
        translation: 'رقم فريد يتم تعيينه لجهاز متصل بالشبكة.',
      },
      {
        term: 'Switch',
        definition: 'A networking device that connects devices within the same network.',
        translation: 'جهاز شبكي يربط الأجهزة داخل نفس الشبكة.',
      },
      {
        term: 'Router',
        definition: 'A device that directs data between different networks.',
        translation: 'جهاز يقوم بتوجيه البيانات بين الشبكات المختلفة.',
      },
      {
        term: 'Virus',
        definition: 'A malicious program that can damage or disrupt computer systems.',
        translation: 'برنامج ضار يمكنه إتلاف أو تعطيل أنظمة الكمبيوتر.',
      },
      {
        term: 'Firewall',
        definition: 'A security system that monitors and controls network traffic.',
        translation: 'نظام أمني يراقب ويحكم في حركة البيانات داخل الشبكة.',
      },
      {
        term: 'Compiler',
        definition: 'A program that translates source code into machine language.',
        translation: 'برنامج يحول الكود البرمجي إلى لغة الآلة.',
      },
      {
        term: 'Operating system',
        definition: 'Software that manages computer hardware and software resources.',
        translation: 'برنامج يدير موارد الكمبيوتر من الأجهزة والبرمجيات.',
      },
      {
        term: 'Application software',
        definition: 'Programs designed to help users perform specific tasks.',
        translation: 'برامج مصممة لمساعدة المستخدم في تنفيذ مهام محددة.',
      },
      {
        term: 'Encryption',
        definition: 'The process of converting data into a secure coded form.',
        translation: 'عملية تحويل البيانات إلى شكل مشفر آمن.',
      },
      {
        term: 'Decryption',
        definition: 'The process of converting encrypted data back to its original form.',
        translation: 'عملية تحويل البيانات المشفرة إلى شكلها الأصلي.',
      },
      {
        term: 'Hard disk',
        definition: 'A storage device used to save data permanently.',
        translation: 'جهاز تخزين يستخدم لحفظ البيانات بشكل دائم.',
      },
      {
        term: 'RAM (Random Access Memory)',
        definition: 'Temporary memory used by a computer while running programs.',
        translation: 'ذاكرة مؤقتة يستخدمها الكمبيوتر أثناء تشغيل البرامج.',
      },
      {
        term: 'ROM (Read Only Memory)',
        definition: 'Permanent memory that stores essential system instructions.',
        translation: 'ذاكرة دائمة تخزن تعليمات النظام الأساسية.',
      },
      {
        term: 'Network',
        definition: 'A group of connected devices that can share resources and information.',
        translation: 'مجموعة من الأجهزة المتصلة التي تتبادل الموارد والمعلومات.',
      },
      {
        term: 'Keyboard',
        definition: 'An input device used to type text and commands.',
        translation: 'جهاز إدخال يستخدم لكتابة النصوص والأوامر.',
      },
      {
        term: 'Mouse',
        definition: 'A pointing device used to control the cursor on a computer screen.',
        translation: 'جهاز تأشير يستخدم للتحكم في مؤشر الشاشة.',
      },
      {
        term: 'Chart',
        definition: 'A visual representation of data using graphs or diagrams.',
        translation: 'تمثيل مرئي للبيانات باستخدام مخططات أو رسوم.',
      },
      {
        term: 'Protocol',
        definition: 'A set of rules that govern communication between devices.',
        translation: 'مجموعة قواعد تنظم الاتصال بين الأجهزة.',
      },
      {
        term: 'Homepage',
        definition: 'The main page of a website.',
        translation: 'الصفحة الرئيسية لموقع الويب.',
      },
      {
        term: 'Word processor',
        definition: 'Software used to create and edit text documents.',
        translation: 'برنامج يستخدم لإنشاء وتعديل المستندات النصية.',
      },
      {
        term: 'Worm',
        definition: 'A type of malware that spreads automatically across networks.',
        translation: 'نوع من البرامج الضارة ينتشر تلقائياً عبر الشبكات.',
      },
      {
        term: 'Cloud computing',
        definition: 'Using remote servers on the Internet to store and process data.',
        translation: 'استخدام خوادم بعيدة عبر الإنترنت لتخزين ومعالجة البيانات.',
      },
      {
        term: 'Website',
        definition: 'A collection of related web pages accessible through the Internet.',
        translation: 'مجموعة من صفحات الويب المرتبطة والمتاحة عبر الإنترنت.',
      },
      {
        term: 'Backup',
        definition: 'A copy of data kept for recovery in case of loss or damage.',
        translation: 'نسخة احتياطية من البيانات تستخدم لاسترجاعها عند الفقدان أو التلف.',
      },
      {
        term: 'Bug',
        definition: 'An error or flaw in a computer program.',
        translation: 'خطأ أو عيب في البرنامج.',
      },
      {
        term: 'Modem',
        definition: 'A device that connects a computer or network to the Internet.',
        translation: 'جهاز يربط الكمبيوتر أو الشبكة بالإنترنت.',
      },
      {
        term: 'SDLC (Software Development Life Cycle)',
        definition: 'The process used to design, develop, test, and maintain software.',
        translation: 'العملية المستخدمة لتصميم وتطوير واختبار وصيانة البرامج.',
      },
      {
        term: 'SQL (Structured Query Language)',
        definition: 'A language used to manage and query databases.',
        translation: 'لغة تستخدم لإدارة قواعد البيانات والاستعلام عنها.',
      },
      {
        term: 'Normalization',
        definition: 'The process of organizing database data to reduce redundancy.',
        translation: 'عملية تنظيم البيانات في قاعدة البيانات لتقليل التكرار.',
      },
      {
        term: 'LAN (Local Area Network)',
        definition:
          'A network that connects devices within a small area such as a school or office.',
        translation: 'شبكة تربط الأجهزة داخل منطقة صغيرة مثل المدرسة أو المكتب.',
      },
      {
        term: 'WAN (Wide Area Network)',
        definition: 'A network that covers a large geographical area.',
        translation: 'شبكة تغطي منطقة جغرافية واسعة.',
      },
      {
        term: 'Intrusion Detection System',
        definition: 'A system that detects unauthorized access to a network.',
        translation: 'نظام يكشف محاولات الدخول غير المصرح بها إلى الشبكة.',
      },
      {
        term: 'Authentication',
        definition: "The process of verifying a user's identity.",
        translation: 'عملية التحقق من هوية المستخدم.',
      },
      {
        term: 'Authorization',
        definition: 'The process of granting access rights to resources.',
        translation: 'عملية منح صلاحيات الوصول إلى الموارد.',
      },
      {
        term: 'Digital signature',
        definition: 'An electronic signature used to verify authenticity of digital documents.',
        translation: 'توقيع إلكتروني يستخدم للتحقق من صحة المستندات الرقمية.',
      },
      {
        term: 'Presentation software',
        definition: 'Software used to create slide presentations.',
        translation: 'برنامج يستخدم لإنشاء عروض تقديمية.',
      },
      {
        term: 'Big data',
        definition: 'Extremely large datasets that can be analyzed for insights.',
        translation: 'مجموعات بيانات ضخمة جداً يمكن تحليلها لاستخراج معلومات مفيدة.',
      },
      {
        term: 'Artificial Intelligence',
        definition: 'Technology that enables machines to simulate human intelligence.',
        translation: 'تقنية تمكن الآلات من محاكاة الذكاء البشري.',
      },
      {
        term: 'Cache memory',
        definition: 'High-speed memory used to store frequently accessed data temporarily.',
        translation: 'ذاكرة سريعة تستخدم لتخزين البيانات المستخدمة بشكل متكرر مؤقتاً.',
      },
      {
        term: 'Cloud storage',
        definition: 'Storing data on remote servers accessed via the Internet.',
        translation: 'تخزين البيانات على خوادم بعيدة يتم الوصول إليها عبر الإنترنت.',
      },
      {
        term: 'DDoS (Distributed Denial of Service)',
        definition: 'An attack that overwhelms a server with excessive traffic.',
        translation: 'هجوم يغرق الخادم بكمية هائلة من الطلبات لتعطيله.',
      },
      {
        term: 'Debugging',
        definition: 'The process of finding and fixing errors in software.',
        translation: 'عملية اكتشاف وإصلاح الأخطاء في البرامج.',
      },
      {
        term: 'HTML (HyperText Markup Language)',
        definition: 'The standard language used to create web pages.',
        translation: 'اللغة الأساسية المستخدمة لإنشاء صفحات الويب.',
      },
      {
        term: 'Version control system',
        definition: 'A system that tracks changes in files and source code.',
        translation: 'نظام يتبع التعديلات التي تمت على الملفات والكود البرمجي.',
      },
      {
        term: 'Data fragmentation',
        definition: 'The process of dividing data into smaller parts for storage or transmission.',
        translation: 'عملية تقسيم البيانات إلى أجزاء أصغر للتخزين أو النقل.',
      },
    ],
  },
]

/** Get definitions for a specific category */
export function getDefinitionsForCategory(categoryId: CategoryId): Definition[] {
  const entry = DEFINITIONS.find((d) => d.categoryId === categoryId)
  return entry?.definitions ?? []
}

/** Check if a category has definitions available */
export function hasDefinitions(categoryId: CategoryId): boolean {
  return DEFINITIONS.some((d) => d.categoryId === categoryId && d.definitions.length > 0)
}
