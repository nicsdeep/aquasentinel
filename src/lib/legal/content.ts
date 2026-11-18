/**
 * Public trust & legal texts, in English and Kiswahili: Privacy Notice, Terms of Use, Cookies, Security.
 * Every statement must stay true to how the system actually works. docs/DATA_PROTECTION_POLICY.md is the internal
 * source; update both in the same change. Kiswahili is a faithful translation of the English text.
 */

export type Lang = "en" | "sw";
export type DocSlug = "privacy" | "terms" | "cookies" | "security";

export type Block =
  | { p: string }
  | { list: string[] }
  | { table: { head: string[]; rows: string[][] } }
  | { note: string };

export interface Section {
  id: string;
  heading: string;
  /** One plain sentence: the whole section in short. */
  short?: string;
  blocks: Block[];
}

export interface LegalDoc {
  slug: DocSlug;
  title: string;
  lead: string;
  sections: Section[];
}

export const CONTACT = "info@aquasentinel.com";
export const VERSION = "1.4";
export const UPDATED: Record<Lang, string> = { en: "18 November 2026", sw: "18 Novemba 2026" };

export const UI: Record<Lang, Record<string, string>> = {
  en: {
    updated: "Updated",
    version: "Version",
    questionsText: "Write to us and a person will reply, in English or Kiswahili.",
    language: "Language",
    emailUs: "Email us",
  },
  sw: {
    updated: "Ilisasishwa",
    version: "Toleo",
    questionsText: "Tuandikie na mtu atakujibu, kwa Kiingereza au Kiswahili.",
    language: "Lugha",
    emailUs: "Tuandikie",
  },
};

/* ------------------------------------------------------------------------------------------------------------ */
/* Hub                                                                                                            */
/* ------------------------------------------------------------------------------------------------------------ */

export const HUB: Record<Lang, { title: string; emphasis: string; cards: Record<DocSlug, string> }> = {
  en: {
    title: "Your data,",
    emphasis: "in plain words.",
    cards: {
      privacy: "What personal data we use, why, who sees it, how long we keep it and your rights.",
      terms: "What AquaSentinel does, what it never does, and how teams use it responsibly.",
      cookies: "The only two things we store in your browser, and why there is no cookie banner.",
      security: "How community data is protected, and what we complete before a field pilot.",
    },
  },
  sw: {
    title: "Data yako,",
    emphasis: "kwa maneno rahisi.",
    cards: {
      privacy: "Data binafsi tunayotumia, kwa nini, nani anaiona, tunaihifadhi kwa muda gani na haki zako.",
      terms: "AquaSentinel inafanya nini, isichofanya kamwe, na jinsi timu zinavyoitumia kwa uwajibikaji.",
      cookies: "Vitu viwili tu tunavyohifadhi kwenye kivinjari chako, na kwa nini hakuna bango la vidakuzi.",
      security: "Jinsi data ya jamii inavyolindwa, na tunachokamilisha kabla ya majaribio ya uwandani.",
    },
  },
};

/* ------------------------------------------------------------------------------------------------------------ */
/* Privacy Notice                                                                                                 */
/* ------------------------------------------------------------------------------------------------------------ */

const PRIVACY_EN: LegalDoc = {
  slug: "privacy",
  title: "Privacy Notice",
  lead: "AquaSentinel helps communities keep their water systems working: it watches pump, flow, storage and solar readings, alerts the local team and keeps a maintenance record. This notice explains what personal data that involves, and the rights you have.",
  sections: [
    {
      id: "who",
      heading: "Who is responsible",
      short: "AquaSentinel is responsible for your data, and you can reach us at one address.",
      blocks: [
        { p: "AquaSentinel operates this service and is responsible for the personal data it processes (the \"data controller\"). Where a water committee or county office uses AquaSentinel for its water system, we work with them so that the data is used only for that system." },
        { p: `For any privacy question or request, write to ${CONTACT}.` },
      ],
    },
    {
      id: "what",
      heading: "What we collect, and why",
      short: "Only what is needed to alert your team and keep a repair record, nothing more.",
      blocks: [
        { p: "AquaSentinel is mostly about machines, not people. Pump state, water flow, storage level, solar power and battery readings are not personal data. The personal data we hold:" },
        {
          table: {
            head: ["Data", "Why we need it"],
            rows: [
              ["Name and email address (you sign in with a one-time code sent to your email; no password is used)", "To sign you in and show who did what"],
              ["Mobile number", "To send you water alerts and confirm an SMS reply really comes from you. Never shown in full on screens"],
              ["Role and site (e.g. operator of a named water system)", "So you see your own site and can do your role's actions"],
              ["Language (English or Kiswahili)", "To send SMS alerts in your language"],
              ["Activity records: what you did on an incident, when, and by web or SMS", "Accountability and the water system's maintenance history"],
              ["Reports and notes you write", "To describe faults and repairs. Please don't include other people's personal details"],
              ["SMS messages sent to you and your replies, with a masked number", "Delivery records and the incident's history"],
            ],
          },
        },
        { note: "We never collect national ID numbers, home locations, payment details, photos of people or sensitive personal data, and we never use your data for advertising." },
      ],
    },
    {
      id: "basis",
      heading: "Our legal basis",
      short: "We use your data to provide the service, for a reliable water supply, and with your consent where we ask for it.",
      blocks: [
        {
          list: [
            "Providing the service to your water system: signing in, showing your site, sending alerts and letting you respond.",
            "Legitimate interest in a reliable water supply: recording who responded to a fault and what was repaired, so the next failure can be prevented.",
            "Security: detecting misuse, protecting accounts and investigating problems.",
            "Consent, where we ask for it (for example when you join a team). You may withdraw it at any time; this does not affect what was done before.",
          ],
        },
      ],
    },
    {
      id: "who-sees",
      heading: "Who can see your data",
      short: "Your own team, our administrators when needed, and the providers that run the service. Never buyers.",
      blocks: [
        {
          list: [
            "Members of your own water system's team, according to their role. The database blocks everyone else.",
            "The AquaSentinel platform administrator, who manages team access: they can see each team member's name, email address, role and last sign-in, and change roles. Otherwise only when needed to support or secure the service.",
            "Providers that run parts of the service for us under contract: Supabase (database and sign-in), Vercel (website hosting) and, when SMS alerts are enabled for a site, a licensed SMS provider and the mobile networks.",
            "Microsoft (PowerPoint viewer), only if you choose to open the demo presentation on our Demo PPT page.",
            "Authorities, only when the law requires it.",
          ],
        },
        { note: "We never sell personal data." },
      ],
    },
    {
      id: "where",
      heading: "Where your data is stored",
      short: "In the European Union (France), with security and contractual safeguards.",
      blocks: [
        { p: "Our database is hosted by Supabase in the European Union (France), and the website is served by Vercel. This means your data is transferred outside Kenya. We use only providers that protect data with strong security and contractual safeguards, as the Kenya Data Protection Act requires for transfers abroad." },
      ],
    },
    {
      id: "keep",
      heading: "How long we keep it",
      short: "Contact details while you're on the team; repair history up to 5 years; SMS logs up to 12 months.",
      blocks: [
        {
          table: {
            head: ["Data", "Kept for", "Then"],
            rows: [
              ["Account details and phone number", "While you are a team member", "Deleted or anonymised within 30 days of us being told you left"],
              ["Incident and maintenance records", "Up to 5 years (the water system's repair history)", "Your name is replaced with your role after you leave; deleted after 5 years"],
              ["SMS message log", "Up to 12 months", "Deleted"],
              ["Hosting providers' security logs", "A short period", "Deleted by the provider"],
            ],
          },
        },
      ],
    },
    {
      id: "security",
      heading: "How we protect it",
      short: "Encryption, one account per person, role limits, and a record of every important action.",
      blocks: [
        {
          list: [
            "Every connection is encrypted (HTTPS), and stored data is encrypted by our hosting provider.",
            "Each person signs in to their own account; each role can do only its own actions.",
            "Every important action is recorded, so it is always clear who did what and when.",
            "Ordinary SMS is not encrypted end to end, so alerts never contain sensitive personal details, and important SMS actions (such as closing an incident) need confirmation. SMS can never switch a pump on or off.",
          ],
        },
        { p: "If a breach puts your data at risk, we will notify the Office of the Data Protection Commissioner within 72 hours of becoming aware of it, and tell you when it affects you. More detail is on our Security page." },
      ],
    },
    {
      id: "rights",
      heading: "Your rights",
      short: "You can see, correct and delete your data, object, withdraw consent and complain to the ODPC.",
      blocks: [
        { p: "Under the Kenya Data Protection Act, 2019, you have the right to:" },
        {
          list: [
            "be informed about how your data is used (this notice);",
            "see the personal data we hold about you;",
            "correct data that is wrong or out of date;",
            "ask us to delete data we no longer need, or object to its use;",
            "withdraw consent where we rely on it.",
          ],
        },
        { p: `Email ${CONTACT}. We will confirm who you are and reply as soon as possible. If you are not satisfied, you may complain to the Office of the Data Protection Commissioner (ODPC), www.odpc.go.ke.` },
      ],
    },
    {
      id: "cookies",
      heading: "Cookies",
      short: "Only a sign-in cookie and one small setting. No analytics, advertising or tracking.",
      blocks: [
        { p: "We use only what is strictly necessary for the website to work, so there is no cookie banner. The details are on our Cookies page." },
      ],
    },
    {
      id: "children",
      heading: "Children",
      short: "AquaSentinel is for adult team members only.",
      blocks: [{ p: "AquaSentinel is for adult members of water-system teams. It is not intended for children under 18." }],
    },
    {
      id: "changes",
      heading: "Changes to this notice",
      short: "If anything important changes, we update this page and tell team members.",
      blocks: [
        { p: "When we change how we use personal data, we update this notice and its date, and tell team members about important changes. If anything is unclear, contact us and we will explain." },
      ],
    },
  ],
};

const PRIVACY_SW: LegalDoc = {
  slug: "privacy",
  title: "Taarifa ya Faragha",
  lead: "AquaSentinel husaidia jamii kudumisha mifumo yao ya maji: hufuatilia taarifa za pampu, mtiririko, hifadhi na nishati ya jua, hutuma tahadhari kwa timu ya eneo hilo na huhifadhi kumbukumbu za matengenezo. Taarifa hii inaeleza data binafsi inayohusika, na haki ulizonazo.",
  sections: [
    {
      id: "who",
      heading: "Nani anawajibika",
      short: "AquaSentinel inawajibika kwa data yako, na unaweza kutufikia kwa anwani moja.",
      blocks: [
        { p: "AquaSentinel inaendesha huduma hii na inawajibika kwa data binafsi inayochakatwa (\"mdhibiti wa data\"). Pale ambapo kamati ya maji au ofisi ya kaunti inatumia AquaSentinel kwa mfumo wake wa maji, tunashirikiana nao ili data itumike kwa mfumo huo pekee." },
        { p: `Kwa swali au ombi lolote kuhusu faragha, tuandikie ${CONTACT}.` },
      ],
    },
    {
      id: "what",
      heading: "Tunachokusanya, na kwa nini",
      short: "Kile tu kinachohitajika kutahadharisha timu yako na kuhifadhi kumbukumbu ya matengenezo, si zaidi.",
      blocks: [
        { p: "AquaSentinel inahusu zaidi mashine kuliko watu. Hali ya pampu, mtiririko wa maji, kiwango cha hifadhi, nishati ya jua na betri si data binafsi. Data binafsi tunayohifadhi:" },
        {
          table: {
            head: ["Data", "Kwa nini tunaihitaji"],
            rows: [
              ["Jina na barua pepe (unaingia kwa msimbo wa mara moja unaotumwa kwenye barua pepe yako; hakuna nenosiri)", "Kukuingiza kwenye akaunti na kuonyesha nani alifanya nini"],
              ["Nambari ya simu", "Kukutumia tahadhari za maji na kuthibitisha kuwa jibu la SMS limetoka kwako kweli. Haionyeshwi kamili kwenye skrini"],
              ["Wadhifa na eneo (k.m. mwendeshaji wa mfumo fulani wa maji)", "Ili uone eneo lako na ufanye shughuli za wadhifa wako"],
              ["Lugha (Kiingereza au Kiswahili)", "Kutuma tahadhari za SMS kwa lugha yako"],
              ["Kumbukumbu za shughuli: ulichofanya kwenye tukio, lini, na kwa tovuti au SMS", "Uwajibikaji na historia ya matengenezo ya mfumo wa maji"],
              ["Ripoti na maelezo unayoandika", "Kueleza hitilafu na matengenezo. Tafadhali usiandike maelezo binafsi ya watu wengine"],
              ["Ujumbe wa SMS uliotumiwa na majibu yako, pamoja na nambari iliyofichwa sehemu", "Kumbukumbu za kufikishwa na historia ya tukio"],
            ],
          },
        },
        { note: "Hatukusanyi kamwe nambari za vitambulisho, mahali unapoishi, maelezo ya malipo, picha za watu wala data binafsi nyeti, na hatutumii data yako kwa matangazo kamwe." },
      ],
    },
    {
      id: "basis",
      heading: "Msingi wetu wa kisheria",
      short: "Tunatumia data yako kutoa huduma, kwa huduma ya maji inayotegemewa, na kwa idhini yako pale tunapoiomba.",
      blocks: [
        {
          list: [
            "Kutoa huduma kwa mfumo wako wa maji: kukuingiza kwenye akaunti, kukuonyesha eneo lako, kutuma tahadhari na kukuwezesha kujibu.",
            "Maslahi halali katika huduma ya maji inayotegemewa: kurekodi nani alishughulikia hitilafu na nini kilirekebishwa, ili hitilafu inayofuata izuiwe.",
            "Usalama: kugundua matumizi mabaya, kulinda akaunti na kuchunguza matatizo.",
            "Idhini, pale tunapoiomba (kwa mfano unapojiunga na timu). Unaweza kuiondoa wakati wowote; hii haiathiri yaliyofanyika kabla.",
          ],
        },
      ],
    },
    {
      id: "who-sees",
      heading: "Nani anaweza kuona data yako",
      short: "Timu yako, wasimamizi wetu inapohitajika, na watoa huduma wanaoendesha huduma. Kamwe si wanunuzi.",
      blocks: [
        {
          list: [
            "Wanatimu wa mfumo wako wa maji, kulingana na wadhifa wao. Hifadhidata huzuia wengine wote.",
            "Msimamizi mkuu wa jukwaa la AquaSentinel, anayesimamia ufikiaji wa timu: anaweza kuona jina, barua pepe, wadhifa na mara ya mwisho ya kuingia ya kila mwanatimu, na kubadilisha wadhifa. Vinginevyo pale tu inapohitajika kusaidia au kulinda huduma.",
            "Watoa huduma wanaoendesha sehemu za huduma kwa niaba yetu kwa mkataba: Supabase (hifadhidata na kuingia), Vercel (kupangisha tovuti) na, tahadhari za SMS zinapowashwa kwa eneo fulani, mtoa huduma wa SMS mwenye leseni na mitandao ya simu.",
            "Microsoft (kitazamaji cha PowerPoint), pale tu unapochagua kufungua wasilisho la maonyesho kwenye ukurasa wetu wa Demo PPT.",
            "Mamlaka za serikali, pale tu sheria inapolazimu.",
          ],
        },
        { note: "Hatuuzi data binafsi kamwe." },
      ],
    },
    {
      id: "where",
      heading: "Data yako inahifadhiwa wapi",
      short: "Katika Umoja wa Ulaya (Ufaransa), kwa kinga za usalama na za kimkataba.",
      blocks: [
        { p: "Hifadhidata yetu inapangishwa na Supabase katika Umoja wa Ulaya (Ufaransa), na tovuti inahudumiwa na Vercel. Hii ina maana kuwa data yako inahamishiwa nje ya Kenya. Tunatumia tu watoa huduma wanaolinda data kwa usalama thabiti na kinga za kimkataba, kama Sheria ya Ulinzi wa Data ya Kenya inavyotaka kwa uhamisho nje ya nchi." },
      ],
    },
    {
      id: "keep",
      heading: "Tunaihifadhi kwa muda gani",
      short: "Maelezo ya mawasiliano ukiwa kwenye timu; historia ya matengenezo hadi miaka 5; kumbukumbu za SMS hadi miezi 12.",
      blocks: [
        {
          table: {
            head: ["Data", "Inahifadhiwa kwa", "Kisha"],
            rows: [
              ["Maelezo ya akaunti na nambari ya simu", "Ukiwa mwanatimu", "Inafutwa au kufanywa isikutambulishe ndani ya siku 30 tangu tujulishwe umeondoka"],
              ["Kumbukumbu za matukio na matengenezo", "Hadi miaka 5 (historia ya matengenezo ya mfumo wa maji)", "Jina lako hubadilishwa kuwa wadhifa wako ukiondoka; hufutwa baada ya miaka 5"],
              ["Kumbukumbu ya ujumbe wa SMS", "Hadi miezi 12", "Inafutwa"],
              ["Kumbukumbu za usalama za watoa huduma", "Muda mfupi", "Zinafutwa na mtoa huduma"],
            ],
          },
        },
      ],
    },
    {
      id: "security",
      heading: "Jinsi tunavyoilinda",
      short: "Usimbaji, akaunti moja kwa kila mtu, mipaka ya wadhifa, na kumbukumbu ya kila hatua muhimu.",
      blocks: [
        {
          list: [
            "Kila muunganisho umesimbwa (HTTPS), na data iliyohifadhiwa husimbwa na mtoa huduma wetu.",
            "Kila mtu huingia kwenye akaunti yake mwenyewe; kila wadhifa unaweza kufanya shughuli zake tu.",
            "Kila hatua muhimu hurekodiwa, ili iwe wazi daima nani alifanya nini na lini.",
            "SMS ya kawaida haijasimbwa kutoka mwanzo hadi mwisho, kwa hiyo tahadhari hazina maelezo binafsi nyeti, na hatua muhimu kwa SMS (kama kufunga tukio) zinahitaji uthibitisho. SMS haiwezi kamwe kuwasha wala kuzima pampu.",
          ],
        },
        { p: "Data yako ikihatarishwa na uvunjaji wa usalama, tutaarifu Ofisi ya Kamishna wa Ulinzi wa Data ndani ya saa 72 tangu tujue, na kukujulisha pale unapoathirika. Maelezo zaidi yako kwenye ukurasa wetu wa Usalama." },
      ],
    },
    {
      id: "rights",
      heading: "Haki zako",
      short: "Unaweza kuona, kurekebisha na kufuta data yako, kupinga, kuondoa idhini na kulalamika kwa ODPC.",
      blocks: [
        { p: "Chini ya Sheria ya Ulinzi wa Data ya Kenya, 2019, una haki ya:" },
        {
          list: [
            "kujulishwa jinsi data yako inavyotumiwa (taarifa hii);",
            "kuona data binafsi tunayohifadhi kukuhusu;",
            "kurekebisha data isiyo sahihi au iliyopitwa na wakati;",
            "kutuomba tufute data tusiyoihitaji tena, au kupinga matumizi yake;",
            "kuondoa idhini pale tunapoitegemea.",
          ],
        },
        { p: `Tuma barua pepe kwa ${CONTACT}. Tutathibitisha utambulisho wako na kujibu haraka iwezekanavyo. Usiporidhika, unaweza kulalamika kwa Ofisi ya Kamishna wa Ulinzi wa Data (ODPC), www.odpc.go.ke.` },
      ],
    },
    {
      id: "cookies",
      heading: "Vidakuzi (cookies)",
      short: "Kidakuzi cha kuingia na mpangilio mmoja mdogo tu. Hakuna takwimu, matangazo wala ufuatiliaji.",
      blocks: [
        { p: "Tunatumia tu kile kilicho lazima kabisa ili tovuti ifanye kazi, kwa hiyo hakuna bango la vidakuzi. Maelezo yako kwenye ukurasa wetu wa Vidakuzi." },
      ],
    },
    {
      id: "children",
      heading: "Watoto",
      short: "AquaSentinel ni kwa wanatimu wazima pekee.",
      blocks: [{ p: "AquaSentinel ni kwa wanatimu wazima wa mifumo ya maji. Haikusudiwi kwa watoto walio chini ya miaka 18." }],
    },
    {
      id: "changes",
      heading: "Mabadiliko ya taarifa hii",
      short: "Jambo muhimu likibadilika, tunasasisha ukurasa huu na kuwajulisha wanatimu.",
      blocks: [
        { p: "Tukibadilisha jinsi tunavyotumia data binafsi, tunasasisha taarifa hii na tarehe yake, na kuwajulisha wanatimu kuhusu mabadiliko muhimu. Jambo lolote likiwa halieleweki, wasiliana nasi nasi tutaeleza." },
      ],
    },
  ],
};

/* ------------------------------------------------------------------------------------------------------------ */
/* Terms of Use                                                                                                   */
/* ------------------------------------------------------------------------------------------------------------ */

const TERMS_EN: LegalDoc = {
  slug: "terms",
  title: "Terms of Use",
  lead: "These terms explain what AquaSentinel does, what it never does, and how team members are expected to use it. By signing in, you agree to them.",
  sections: [
    {
      id: "service",
      heading: "What AquaSentinel is",
      short: "A tool that watches a water system, alerts the local team and keeps the repair record.",
      blocks: [
        { p: "AquaSentinel watches readings from a community water system (pump, flow, storage, solar power and battery), alerts the local team on the dashboard and by SMS, helps them respond and repair, and keeps a maintenance record. It supports the people who run the water system; it does not replace them." },
      ],
    },
    {
      id: "not",
      heading: "What AquaSentinel does not do",
      short: "It never controls equipment, is not an emergency service and cannot guarantee water safety.",
      blocks: [
        {
          list: [
            "It never switches pumps or other equipment on or off. All physical actions are done by people on site.",
            "It is not an emergency service. In an emergency that puts people at risk, contact the relevant authorities directly.",
            "It does not guarantee water quality or safety, and it cannot prevent every fault. Readings depend on equipment, power and mobile coverage, which can fail.",
            "Alerts show a suspected cause. A qualified person confirms the real cause on site.",
          ],
        },
      ],
    },
    {
      id: "account",
      heading: "Your account",
      short: "One person, one account; never share your sign-in code, and keep your number current.",
      blocks: [
        {
          list: [
            "Use only your own account, and never share the one-time sign-in code we send you.",
            "Keep your mobile number up to date, so alerts and SMS replies reach the right person.",
            "Tell us or your committee straight away if you think someone else has used your account.",
          ],
        },
      ],
    },
    {
      id: "use",
      heading: "Using AquaSentinel responsibly",
      short: "Be honest in reports, respect others' privacy and work safely.",
      blocks: [
        {
          list: [
            "Report problems honestly, and record what was actually found and done.",
            "Do not include other people's personal details in reports or notes.",
            "Do not try to access other sites' data, interfere with the system or send false readings.",
            "Follow safety rules and use qualified people when working near pumps, electricity and water infrastructure.",
          ],
        },
      ],
    },
    {
      id: "sms",
      heading: "SMS alerts",
      short: "Alerts are sent through a licensed provider; \"Delivered\" is shown only when the provider confirms it.",
      blocks: [
        { p: "When SMS alerts are enabled for your site, you may receive alerts about your water system and can reply to acknowledge them. Messages are sent through a licensed SMS provider and the mobile networks; delivery cannot be guaranteed. A message shows as \"Delivered\" only when the provider confirms delivery. You can ask to stop SMS alerts at any time." },
      ],
    },
    {
      id: "data",
      heading: "Data and privacy",
      short: "Our Privacy Notice explains how personal data is used.",
      blocks: [
        { p: "How we use personal data is explained in our Privacy Notice. Water readings and maintenance records belong to the water system they come from and are used to keep it working." },
      ],
    },
    {
      id: "availability",
      heading: "Availability and changes",
      short: "We work to keep it available, and we tell teams about important changes.",
      blocks: [
        { p: "We work to keep AquaSentinel available and accurate, but it may sometimes be unavailable, for example during maintenance or network outages. We may improve or change the service; we will tell team members about important changes." },
      ],
    },
    {
      id: "law",
      heading: "Law and contact",
      short: "Kenyan law applies.",
      blocks: [{ p: `These terms are governed by the laws of Kenya. Questions: ${CONTACT}.` }],
    },
  ],
};

const TERMS_SW: LegalDoc = {
  slug: "terms",
  title: "Masharti ya Matumizi",
  lead: "Masharti haya yanaeleza AquaSentinel inafanya nini, isichofanya kamwe, na jinsi wanatimu wanavyotarajiwa kuitumia. Kwa kuingia kwenye akaunti, unayakubali.",
  sections: [
    {
      id: "service",
      heading: "AquaSentinel ni nini",
      short: "Chombo kinachofuatilia mfumo wa maji, kutahadharisha timu ya eneo hilo na kuhifadhi kumbukumbu ya matengenezo.",
      blocks: [
        { p: "AquaSentinel hufuatilia taarifa kutoka mfumo wa maji wa jamii (pampu, mtiririko, hifadhi, nishati ya jua na betri), hutuma tahadhari kwa timu ya eneo hilo kwenye dashibodi na kwa SMS, huwasaidia kushughulikia na kurekebisha, na huhifadhi kumbukumbu za matengenezo. Inawasaidia watu wanaoendesha mfumo wa maji; haiwachukui nafasi yao." },
      ],
    },
    {
      id: "not",
      heading: "AquaSentinel haifanyi nini",
      short: "Haidhibiti vifaa kamwe, si huduma ya dharura na haiwezi kuhakikisha usalama wa maji.",
      blocks: [
        {
          list: [
            "Haiwashi wala kuzima pampu au vifaa vingine kamwe. Hatua zote za kimwili hufanywa na watu walio eneo husika.",
            "Si huduma ya dharura. Katika dharura inayohatarisha watu, wasiliana na mamlaka husika moja kwa moja.",
            "Haihakikishi ubora wala usalama wa maji, na haiwezi kuzuia kila hitilafu. Taarifa hutegemea vifaa, umeme na mtandao wa simu, ambavyo vinaweza kushindwa.",
            "Tahadhari huonyesha chanzo kinachoshukiwa. Mtu mwenye ujuzi huthibitisha chanzo halisi akiwa eneo husika.",
          ],
        },
      ],
    },
    {
      id: "account",
      heading: "Akaunti yako",
      short: "Mtu mmoja, akaunti moja; usishiriki msimbo wako wa kuingia, na weka nambari yako sahihi.",
      blocks: [
        {
          list: [
            "Tumia akaunti yako mwenyewe tu, na usishiriki kamwe msimbo wa kuingia wa mara moja tunaokutumia.",
            "Hakikisha nambari yako ya simu ni sahihi, ili tahadhari na majibu ya SMS yamfikie mtu sahihi.",
            "Tujulishe sisi au kamati yako mara moja ukidhani mtu mwingine ametumia akaunti yako.",
          ],
        },
      ],
    },
    {
      id: "use",
      heading: "Kutumia AquaSentinel kwa uwajibikaji",
      short: "Kuwa mkweli katika ripoti, heshimu faragha ya wengine na fanya kazi kwa usalama.",
      blocks: [
        {
          list: [
            "Ripoti matatizo kwa ukweli, na rekodi kilichopatikana na kilichofanyika kweli.",
            "Usiandike maelezo binafsi ya watu wengine katika ripoti au maelezo.",
            "Usijaribu kuingia kwenye data ya maeneo mengine, kuingilia mfumo au kutuma taarifa za uongo.",
            "Fuata kanuni za usalama na tumia watu wenye ujuzi unapofanya kazi karibu na pampu, umeme na miundombinu ya maji.",
          ],
        },
      ],
    },
    {
      id: "sms",
      heading: "Tahadhari za SMS",
      short: "Tahadhari hutumwa kupitia mtoa huduma mwenye leseni; \"Umefika\" huonyeshwa tu mtoa huduma anapothibitisha.",
      blocks: [
        { p: "Tahadhari za SMS zinapowashwa kwa eneo lako, unaweza kupokea tahadhari kuhusu mfumo wako wa maji na kujibu ili kuzikiri. Ujumbe hutumwa kupitia mtoa huduma wa SMS mwenye leseni na mitandao ya simu; kufikishwa hakuwezi kuhakikishwa. Ujumbe huonyeshwa \"Umefika\" tu pale mtoa huduma anapothibitisha kufikishwa. Unaweza kuomba kusitisha tahadhari za SMS wakati wowote." },
      ],
    },
    {
      id: "data",
      heading: "Data na faragha",
      short: "Taarifa yetu ya Faragha inaeleza jinsi data binafsi inavyotumiwa.",
      blocks: [
        { p: "Jinsi tunavyotumia data binafsi imeelezwa katika Taarifa yetu ya Faragha. Taarifa za maji na kumbukumbu za matengenezo ni mali ya mfumo wa maji zinakotoka na hutumiwa kuudumisha ufanye kazi." },
      ],
    },
    {
      id: "availability",
      heading: "Upatikanaji na mabadiliko",
      short: "Tunajitahidi ipatikane, na tunawajulisha wanatimu kuhusu mabadiliko muhimu.",
      blocks: [
        { p: "Tunajitahidi AquaSentinel ipatikane na iwe sahihi, lakini wakati mwingine huenda isipatikane, kwa mfano wakati wa matengenezo au mtandao ukikatika. Tunaweza kuboresha au kubadilisha huduma; tutawajulisha wanatimu kuhusu mabadiliko muhimu." },
      ],
    },
    {
      id: "law",
      heading: "Sheria na mawasiliano",
      short: "Sheria za Kenya zinatumika.",
      blocks: [{ p: `Masharti haya yanaongozwa na sheria za Kenya. Maswali: ${CONTACT}.` }],
    },
  ],
};

/* ------------------------------------------------------------------------------------------------------------ */
/* Cookies                                                                                                        */
/* ------------------------------------------------------------------------------------------------------------ */

const COOKIES_EN: LegalDoc = {
  slug: "cookies",
  title: "Cookies",
  lead: "AquaSentinel stores only two small things in your browser, both strictly necessary. There are no analytics, advertising or tracking cookies, so we don't show a cookie banner.",
  sections: [
    {
      id: "list",
      heading: "Everything we store",
      short: "One sign-in cookie and one setting. That is the complete list.",
      blocks: [
        {
          table: {
            head: ["Name", "Type", "Purpose", "How long"],
            rows: [
              ["sb-…-auth-token", "Cookie (set by Supabase Auth)", "Keeps you securely signed in", "Until you sign out or the session expires"],
              ["as-messages-seen", "Browser storage (on your device only)", "Remembers when you last opened Messages, to show a dot for new ones", "Until you clear your browser data"],
            ],
          },
        },
      ],
    },
    {
      id: "none",
      heading: "What we never use",
      short: "No analytics, no advertising, no tracking, no third-party fonts.",
      blocks: [
        { list: ["No analytics or statistics tools.", "No advertising or social-media pixels.", "No tracking across other websites.", "Fonts are served from our own site, so your visit is not shared with other companies."] },
      ],
    },
    {
      id: "embed",
      heading: "The demo presentation",
      short: "Microsoft's PowerPoint viewer loads only if you tap View presentation.",
      blocks: [
        { p: "Our Demo PPT page shows a presentation through Microsoft's PowerPoint viewer (OneDrive). Nothing from Microsoft loads until you tap View presentation. If you do, Microsoft may set its own cookies under its own privacy policy. If you don't, no Microsoft content or cookies reach your browser." },
      ],
    },
    {
      id: "banner",
      heading: "Why there is no cookie banner",
      short: "Strictly necessary storage doesn't need consent; we will ask before adding anything else.",
      blocks: [
        { p: "Both items are strictly necessary for the service you asked for, so consent is not required. If we ever want to add anything that is not strictly necessary, we will update this page first and ask for your consent." },
      ],
    },
    {
      id: "control",
      heading: "Your control",
      short: "Clear them any time in your browser; you'll just need to sign in again.",
      blocks: [
        { p: "You can delete cookies and site data at any time in your browser settings. You will then need to sign in again, and the new-messages dot will reset." },
      ],
    },
  ],
};

const COOKIES_SW: LegalDoc = {
  slug: "cookies",
  title: "Vidakuzi (cookies)",
  lead: "AquaSentinel huhifadhi vitu viwili vidogo tu kwenye kivinjari chako, vyote ni vya lazima kabisa. Hakuna vidakuzi vya takwimu, matangazo wala ufuatiliaji, kwa hiyo hatuonyeshi bango la vidakuzi.",
  sections: [
    {
      id: "list",
      heading: "Kila tunachohifadhi",
      short: "Kidakuzi kimoja cha kuingia na mpangilio mmoja. Hiyo ndiyo orodha kamili.",
      blocks: [
        {
          table: {
            head: ["Jina", "Aina", "Kazi yake", "Muda"],
            rows: [
              ["sb-…-auth-token", "Kidakuzi (kinawekwa na Supabase Auth)", "Kinakuweka ndani ya akaunti kwa usalama", "Hadi utoke au muda wa kikao uishe"],
              ["as-messages-seen", "Hifadhi ya kivinjari (kwenye kifaa chako tu)", "Kinakumbuka mara ya mwisho ulipofungua Ujumbe, ili kuonyesha alama kwa ujumbe mpya", "Hadi ufute data ya kivinjari"],
            ],
          },
        },
      ],
    },
    {
      id: "none",
      heading: "Tusichotumia kamwe",
      short: "Hakuna takwimu, matangazo, ufuatiliaji wala fonti za kampuni nyingine.",
      blocks: [
        { list: ["Hakuna zana za takwimu.", "Hakuna matangazo wala vifuatiliaji vya mitandao ya kijamii.", "Hakuna ufuatiliaji kwenye tovuti nyingine.", "Fonti hutolewa kutoka tovuti yetu wenyewe, kwa hiyo ziara yako haishirikiwi na kampuni nyingine."] },
      ],
    },
    {
      id: "embed",
      heading: "Wasilisho la maonyesho",
      short: "Kitazamaji cha PowerPoint cha Microsoft hupakia tu ukigusa “View presentation”.",
      blocks: [
        { p: "Ukurasa wetu wa Demo PPT unaonyesha wasilisho kupitia kitazamaji cha PowerPoint cha Microsoft (OneDrive). Hakuna kitu cha Microsoft kinachopakiwa hadi uguse “View presentation”. Ukigusa, Microsoft inaweza kuweka vidakuzi vyake chini ya sera yake ya faragha. Usipogusa, hakuna maudhui wala vidakuzi vya Microsoft vinavyofika kwenye kivinjari chako." },
      ],
    },
    {
      id: "banner",
      heading: "Kwa nini hakuna bango la vidakuzi",
      short: "Hifadhi ya lazima kabisa haihitaji idhini; tutauliza kabla ya kuongeza kitu kingine.",
      blocks: [
        { p: "Vitu vyote viwili ni vya lazima kabisa kwa huduma uliyoomba, kwa hiyo idhini haihitajiki. Tukitaka kuongeza chochote kisicho cha lazima kabisa, tutasasisha ukurasa huu kwanza na kuomba idhini yako." },
      ],
    },
    {
      id: "control",
      heading: "Udhibiti wako",
      short: "Vifute wakati wowote kwenye kivinjari; utahitaji tu kuingia tena.",
      blocks: [
        { p: "Unaweza kufuta vidakuzi na data ya tovuti wakati wowote katika mipangilio ya kivinjari chako. Kisha utahitaji kuingia tena, na alama ya ujumbe mpya itaanza upya." },
      ],
    },
  ],
};

/* ------------------------------------------------------------------------------------------------------------ */
/* Security                                                                                                       */
/* ------------------------------------------------------------------------------------------------------------ */

const SECURITY_EN: LegalDoc = {
  slug: "security",
  title: "Security",
  lead: "Water-system data belongs to the community it comes from. This page explains, honestly, how AquaSentinel protects it today and what we complete before any field pilot.",
  sections: [
    {
      id: "access",
      heading: "Access: only the right people",
      short: "One account per person, role limits, and database rules that keep each site separate.",
      blocks: [
        { list: [
          "Everyone signs in to their own account.",
          "Roles (operator, technician, committee) can do only their own actions, and the database checks this on every change, not just the screen.",
          "Row-level security keeps each water system's data visible only to its own team. Automated tests check this on every change before it goes live.",
        ] },
      ],
    },
    {
      id: "encryption",
      heading: "Encryption",
      short: "Encrypted on the way and at rest.",
      blocks: [{ p: "Every connection uses HTTPS. Stored data is encrypted by our database provider. Sign-in uses a one-time code sent to your email, so there is no password to steal; codes expire quickly and work only once." }],
    },
    {
      id: "audit",
      heading: "A record of every important action",
      short: "Nothing important happens without a trace.",
      blocks: [{ p: "Acknowledging, assigning, recording a repair, verifying recovery and closing are all recorded with who did it, when and whether through the website, SMS or the system itself." }],
    },
    {
      id: "devices",
      heading: "Monitoring units",
      short: "Each unit has its own key; false or repeated readings are rejected.",
      blocks: [{ p: "Each monitoring unit has its own key, stored only in protected form, which can be cancelled at any time. Readings that are malformed, repeated or physically implausible are rejected." }],
    },
    {
      id: "sms",
      heading: "SMS, designed with care",
      short: "No sensitive details in SMS, verified replies, confirmation for important actions.",
      blocks: [{ list: [
        "Ordinary SMS is not encrypted end to end, so alerts never contain sensitive personal details.",
        "Replies are accepted only from the phone number of a team member of that site.",
        "Closing an incident by SMS needs a YES confirmation.",
        "SMS can never switch a pump or any equipment on or off.",
      ] }],
    },
    {
      id: "engineering",
      heading: "How we build and release",
      short: "Secrets never reach the browser; every change is tested before going live.",
      blocks: [{ list: [
        "Keys and passwords never reach the browser or the code repository; GitHub scans every change for leaked secrets.",
        "Every change goes through automated checks (code, database security rules and tests) before it can be released.",
        "Production changes happen only through one controlled release pipeline.",
      ] }],
    },
    {
      id: "pilot",
      heading: "What we complete before a field pilot",
      short: "Honest list of the steps still ahead.",
      blocks: [{ list: [
        "A written agreement with the water committee or county on who is responsible for the data.",
        "Community review of the Kiswahili texts, and consent recorded when each person joins.",
        "Confirming registration with the Office of the Data Protection Commissioner, if required.",
        "A data protection impact assessment and a documented security and privacy review.",
        "Automated deletion that follows our retention schedule.",
      ] }],
    },
    {
      id: "report",
      heading: "Report a security concern",
      short: "Tell us; we'll respond quickly and keep you informed.",
      blocks: [{ p: `If you think you've found a security problem, email ${CONTACT} with what you found and how to reproduce it. Please don't access other people's data or disrupt the service. We will respond as quickly as we can and keep you informed.` }],
    },
  ],
};

const SECURITY_SW: LegalDoc = {
  slug: "security",
  title: "Usalama",
  lead: "Data ya mfumo wa maji ni mali ya jamii inakotoka. Ukurasa huu unaeleza, kwa ukweli, jinsi AquaSentinel inavyoilinda leo na tunachokamilisha kabla ya majaribio yoyote ya uwandani.",
  sections: [
    {
      id: "access",
      heading: "Ufikiaji: watu sahihi pekee",
      short: "Akaunti moja kwa kila mtu, mipaka ya wadhifa, na kanuni za hifadhidata zinazotenganisha kila eneo.",
      blocks: [
        { list: [
          "Kila mtu huingia kwenye akaunti yake mwenyewe.",
          "Wadhifa (mwendeshaji, fundi, kamati) unaweza kufanya shughuli zake tu, na hifadhidata hukagua hili kwa kila badiliko, si skrini pekee.",
          "Usalama wa kiwango cha safu huhakikisha data ya kila mfumo wa maji inaonekana kwa timu yake tu. Majaribio ya kiotomatiki hukagua hili kwa kila badiliko kabla halijawekwa hewani.",
        ] },
      ],
    },
    {
      id: "encryption",
      heading: "Usimbaji",
      short: "Imesimbwa ikisafirishwa na ikihifadhiwa.",
      blocks: [{ p: "Kila muunganisho hutumia HTTPS. Data iliyohifadhiwa husimbwa na mtoa huduma wa hifadhidata. Kuingia hutumia msimbo wa mara moja unaotumwa kwenye barua pepe yako, kwa hiyo hakuna nenosiri la kuibiwa; misimbo huisha muda haraka na hutumika mara moja tu." }],
    },
    {
      id: "audit",
      heading: "Kumbukumbu ya kila hatua muhimu",
      short: "Hakuna jambo muhimu linalofanyika bila alama.",
      blocks: [{ p: "Kukiri, kumpangia fundi, kurekodi matengenezo, kuthibitisha maji kurejea na kufunga, vyote hurekodiwa pamoja na nani alifanya, lini na kama ni kupitia tovuti, SMS au mfumo wenyewe." }],
    },
    {
      id: "devices",
      heading: "Vifaa vya ufuatiliaji",
      short: "Kila kifaa kina ufunguo wake; taarifa za uongo au zilizorudiwa hukataliwa.",
      blocks: [{ p: "Kila kifaa cha ufuatiliaji kina ufunguo wake, unaohifadhiwa kwa njia salama tu, na unaweza kufutwa wakati wowote. Taarifa zilizoharibika, zilizorudiwa au zisizowezekana kimaumbile hukataliwa." }],
    },
    {
      id: "sms",
      heading: "SMS, iliyoundwa kwa uangalifu",
      short: "Hakuna maelezo nyeti kwenye SMS, majibu yanathibitishwa, hatua muhimu zinahitaji uthibitisho.",
      blocks: [{ list: [
        "SMS ya kawaida haijasimbwa kutoka mwanzo hadi mwisho, kwa hiyo tahadhari hazina maelezo binafsi nyeti.",
        "Majibu hupokelewa tu kutoka nambari ya simu ya mwanatimu wa eneo hilo.",
        "Kufunga tukio kwa SMS kunahitaji uthibitisho wa NDIYO (YES).",
        "SMS haiwezi kamwe kuwasha wala kuzima pampu au kifaa chochote.",
      ] }],
    },
    {
      id: "engineering",
      heading: "Jinsi tunavyojenga na kutoa matoleo",
      short: "Siri hazifiki kamwe kwenye kivinjari; kila badiliko hujaribiwa kabla ya kuwekwa hewani.",
      blocks: [{ list: [
        "Funguo na manenosiri hayafiki kamwe kwenye kivinjari wala hazina ya msimbo; GitHub hukagua kila badiliko kutafuta siri zilizovuja.",
        "Kila badiliko hupitia ukaguzi wa kiotomatiki (msimbo, kanuni za usalama wa hifadhidata na majaribio) kabla ya kutolewa.",
        "Mabadiliko ya uzalishaji hufanyika tu kupitia njia moja ya utoaji inayodhibitiwa.",
      ] }],
    },
    {
      id: "pilot",
      heading: "Tunachokamilisha kabla ya majaribio ya uwandani",
      short: "Orodha ya kweli ya hatua zilizobaki.",
      blocks: [{ list: [
        "Makubaliano ya maandishi na kamati ya maji au kaunti kuhusu nani anawajibika kwa data.",
        "Jamii kukagua maandishi ya Kiswahili, na idhini kurekodiwa kila mtu anapojiunga.",
        "Kuthibitisha usajili na Ofisi ya Kamishna wa Ulinzi wa Data, ikihitajika.",
        "Tathmini ya athari za ulinzi wa data na ukaguzi wa usalama na faragha ulioandikwa.",
        "Ufutaji wa kiotomatiki unaofuata ratiba yetu ya uhifadhi.",
      ] }],
    },
    {
      id: "report",
      heading: "Ripoti wasiwasi wa usalama",
      short: "Tujulishe; tutajibu haraka na kukujulisha maendeleo.",
      blocks: [{ p: `Ukidhani umegundua tatizo la usalama, tuma barua pepe kwa ${CONTACT} ukieleza ulichogundua na jinsi ya kukirudia. Tafadhali usiingie kwenye data ya watu wengine wala kuvuruga huduma. Tutajibu haraka iwezekanavyo na kukujulisha maendeleo.` }],
    },
  ],
};

export const DOCS: Record<DocSlug, Record<Lang, LegalDoc>> = {
  privacy: { en: PRIVACY_EN, sw: PRIVACY_SW },
  terms: { en: TERMS_EN, sw: TERMS_SW },
  cookies: { en: COOKIES_EN, sw: COOKIES_SW },
  security: { en: SECURITY_EN, sw: SECURITY_SW },
};

export const DOC_ORDER: DocSlug[] = ["privacy", "terms", "cookies", "security"];

/** Trust & legal routes: readable by everyone. Signed-in users see them inside the app shell, visitors in the public layout. */
export const LEGAL_PATHS = ["/legal", ...DOC_ORDER.map((d) => `/${d}`)];
export const isLegalPath = (pathname: string) => LEGAL_PATHS.includes(pathname);
