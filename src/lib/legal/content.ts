/**
 * Public legal texts: Privacy Notice and Terms of Use, in English and Kiswahili.
 * Every statement must stay true to how the system actually works (docs/DATA_PROTECTION_POLICY.md is the internal
 * source; update both together). Kiswahili is a faithful translation of the English text.
 */

export type Lang = "en" | "sw";

export interface LegalSection {
  id: string;
  heading: string;
  /** Paragraphs; an array inside the list is rendered as bullet points. */
  body: (string | string[])[];
}

export interface LegalDoc {
  title: string;
  intro: string;
  sections: LegalSection[];
}

export const LEGAL_META = {
  updated: { en: "Last updated: 16 November 2026", sw: "Ilisasishwa mwisho: 16 Novemba 2026" },
  contact: "info@aquasentinel.com",
  version: "1.0",
};

export const PRIVACY: Record<Lang, LegalDoc> = {
  en: {
    title: "Privacy Notice",
    intro:
      "AquaSentinel helps communities keep their water systems working by watching pump, flow, storage and solar readings, alerting the local team and keeping a maintenance record. This notice explains, in plain language, what personal data we use, why, who can see it, how long we keep it and the rights you have under the Kenya Data Protection Act, 2019.",
    sections: [
      {
        id: "who",
        heading: "1. Who is responsible",
        body: [
          `AquaSentinel operates this service and is responsible for the personal data it processes (the "data controller"). Where a water committee or county office uses AquaSentinel for its water system, we work with them so that the data is used only for that system.`,
          `Contact for any privacy question or request: ${LEGAL_META.contact}.`,
        ],
      },
      {
        id: "what",
        heading: "2. What we collect",
        body: [
          "AquaSentinel is mostly about machines, not people. The water readings (pump on or off, water flow, storage level, solar power and battery) are not personal data. The personal data we hold is kept to the minimum:",
          [
            "Account details: your name, email address and a password (stored only in protected, encrypted form, never readable by us).",
            "Your mobile number: used only to send you water alerts and to confirm that an SMS reply really comes from you. It is never shown in full on screens; the message log shows a masked number.",
            "Your role and site: for example operator, technician or committee member of a named water system.",
            "Your language preference: English or Kiswahili, for SMS alerts.",
            "Activity records: what you did on an incident (for example acknowledged, assigned, recorded a repair, closed), when, and whether through the website or SMS.",
            "Reports and notes you write: for example when you report a leak or record repair findings. Please do not include other people's personal details in notes.",
            "SMS messages: the text of alerts sent to you and your replies, with the masked number and delivery status.",
          ],
          "We do not collect national ID numbers, home locations, payment details, photos of people or any sensitive personal data, and we do not use your data for advertising.",
        ],
      },
      {
        id: "why",
        heading: "3. Why we use it, and on what basis",
        body: [
          [
            "To run the service you are part of: sign you in, show you your site, send alerts and let you respond (necessary to provide the service to your water system).",
            "To keep water systems safe and reliable: record who responded to a fault and what was repaired, so the next failure can be prevented (legitimate interest of the community in a working water supply).",
            "To keep the system secure: detect misuse, protect accounts and investigate problems (legitimate interest and our security duties).",
            "Where we ask for your consent, for example when you are added to a team, you may withdraw it at any time by contacting us; this does not affect what was done before.",
          ],
        ],
      },
      {
        id: "who-sees",
        heading: "4. Who can see your data",
        body: [
          [
            "Only members of your own water system's team, according to their role. The database itself blocks people from seeing other sites' data.",
            "AquaSentinel administrators, only when needed to support or secure the service.",
            "Service providers who run parts of the system for us under contract: Supabase (database and sign-in), Vercel (website hosting) and, when SMS alerts are enabled for a site, a licensed SMS provider and the mobile networks.",
            "Authorities, only if the law requires it.",
          ],
          "We never sell personal data.",
        ],
      },
      {
        id: "where",
        heading: "5. Where your data is stored",
        body: [
          "Our database is hosted by Supabase in the European Union (France), and the website is served by Vercel. This means your data is transferred outside Kenya. We only use providers that protect data with strong security and contractual safeguards, as the Kenya Data Protection Act requires for transfers abroad.",
        ],
      },
      {
        id: "keep",
        heading: "6. How long we keep it",
        body: [
          [
            "Account details and phone number: while you are a member of a water system's team. When you leave, we delete or anonymise them within 30 days of being told.",
            "Incident and maintenance records: for up to 5 years, because they are the water system's repair history. After you leave, your name in these records is replaced with your role.",
            "SMS message log: up to 12 months.",
            "Security logs kept by our hosting providers: for a short period, according to their policies.",
          ],
        ],
      },
      {
        id: "security",
        heading: "7. How we protect it",
        body: [
          [
            "Every connection is encrypted (HTTPS), and stored data is encrypted by our hosting provider.",
            "Each person signs in to their own account, and each role can only do its own actions.",
            "Every important action is recorded, so it is always clear who did what and when.",
            "Each monitoring unit has its own key, which can be cancelled; false or repeated readings are rejected.",
            "Ordinary SMS is not encrypted end to end, so alerts never contain sensitive personal details, and important actions by SMS (such as closing an incident) need confirmation. SMS can never switch a pump on or off.",
          ],
          "If a breach puts your data at risk, we will notify the Office of the Data Protection Commissioner within 72 hours of becoming aware of it, and tell you when it affects you.",
        ],
      },
      {
        id: "rights",
        heading: "8. Your rights",
        body: [
          "Under the Kenya Data Protection Act, 2019, you have the right to:",
          [
            "be informed about how your data is used (this notice);",
            "see the personal data we hold about you;",
            "correct data that is wrong or out of date;",
            "ask us to delete data we no longer need, or object to its use;",
            "withdraw consent where we rely on it.",
          ],
          `To use any of these rights, email ${LEGAL_META.contact}. We will confirm who you are and reply as soon as possible. If you are not satisfied, you may complain to the Office of the Data Protection Commissioner (ODPC), www.odpc.go.ke.`,
        ],
      },
      {
        id: "cookies",
        heading: "9. Cookies and browser storage",
        body: [
          "We use only what is strictly necessary for the website to work. There are no advertising, analytics or tracking cookies, and fonts are served from our own site, so your visit is not shared with other companies.",
          [
            "Sign-in cookie (set by Supabase Auth): keeps you signed in securely. Removed when you sign out.",
            "One browser storage item (\"as-messages-seen\"): remembers when you last opened Messages, so the app can show a dot for new messages. It stays only on your device.",
          ],
          "Because these are strictly necessary, we do not show a cookie banner. You can clear them at any time in your browser settings; you will then need to sign in again.",
        ],
      },
      {
        id: "children",
        heading: "10. Children",
        body: ["AquaSentinel is for adult members of water-system teams. It is not intended for children under 18."],
      },
      {
        id: "changes",
        heading: "11. Changes to this notice",
        body: [
          "If we change how we use personal data, we will update this notice and the date at the top, and tell team members of important changes. This notice is available in English and Kiswahili; if anything is unclear, contact us and we will explain.",
        ],
      },
    ],
  },
  sw: {
    title: "Taarifa ya Faragha",
    intro:
      "AquaSentinel husaidia jamii kudumisha mifumo yao ya maji kwa kufuatilia taarifa za pampu, mtiririko wa maji, hifadhi na nishati ya jua, kutuma tahadhari kwa timu ya eneo hilo na kuhifadhi kumbukumbu za matengenezo. Taarifa hii inaeleza, kwa lugha rahisi, ni data gani binafsi tunayotumia, kwa nini, nani anaweza kuiona, tunaihifadhi kwa muda gani na haki zako chini ya Sheria ya Ulinzi wa Data ya Kenya, 2019.",
    sections: [
      {
        id: "who",
        heading: "1. Nani anawajibika",
        body: [
          `AquaSentinel inaendesha huduma hii na inawajibika kwa data binafsi inayochakatwa ("mdhibiti wa data"). Pale ambapo kamati ya maji au ofisi ya kaunti inatumia AquaSentinel kwa mfumo wake wa maji, tunashirikiana nao ili data itumike kwa mfumo huo pekee.`,
          `Mawasiliano kwa swali au ombi lolote kuhusu faragha: ${LEGAL_META.contact}.`,
        ],
      },
      {
        id: "what",
        heading: "2. Tunachokusanya",
        body: [
          "AquaSentinel inahusu zaidi mashine kuliko watu. Taarifa za maji (pampu kuwaka au kuzima, mtiririko wa maji, kiwango cha hifadhi, nishati ya jua na betri) si data binafsi. Data binafsi tunayohifadhi ni ile ya lazima tu:",
          [
            "Maelezo ya akaunti: jina lako, barua pepe na nenosiri (linahifadhiwa kwa njia salama iliyosimbwa, na hatuwezi kulisoma).",
            "Nambari yako ya simu: inatumika tu kukutumia tahadhari za maji na kuthibitisha kuwa jibu la SMS limetoka kwako kweli. Haionyeshwi kamili kwenye skrini; kumbukumbu ya ujumbe huonyesha nambari iliyofichwa sehemu.",
            "Wadhifa wako na eneo: kwa mfano mwendeshaji, fundi au mwanakamati wa mfumo fulani wa maji.",
            "Lugha unayopendelea: Kiingereza au Kiswahili, kwa tahadhari za SMS.",
            "Kumbukumbu za shughuli: ulichofanya kwenye tukio (kwa mfano kukiri, kumpangia fundi, kurekodi matengenezo, kufunga), lini, na kama ni kupitia tovuti au SMS.",
            "Ripoti na maelezo unayoandika: kwa mfano unaporipoti uvujaji au kurekodi matokeo ya ukaguzi. Tafadhali usiandike maelezo binafsi ya watu wengine.",
            "Ujumbe wa SMS: maandishi ya tahadhari unazotumiwa na majibu yako, pamoja na nambari iliyofichwa sehemu na hali ya kufikishwa.",
          ],
          "Hatukusanyi nambari za vitambulisho, mahali unapoishi, maelezo ya malipo, picha za watu wala data binafsi nyeti, na hatutumii data yako kwa matangazo.",
        ],
      },
      {
        id: "why",
        heading: "3. Kwa nini tunaitumia, na kwa msingi gani",
        body: [
          [
            "Kuendesha huduma unayoshiriki: kukuingiza kwenye akaunti, kukuonyesha eneo lako, kutuma tahadhari na kukuwezesha kujibu (ni lazima ili kutoa huduma kwa mfumo wako wa maji).",
            "Kudumisha mifumo ya maji iwe salama na ya kutegemewa: kurekodi nani alishughulikia hitilafu na nini kilirekebishwa, ili hitilafu inayofuata izuiwe (maslahi halali ya jamii katika huduma ya maji inayofanya kazi).",
            "Kulinda usalama wa mfumo: kugundua matumizi mabaya, kulinda akaunti na kuchunguza matatizo (maslahi halali na wajibu wetu wa usalama).",
            "Pale tunapoomba idhini yako, kwa mfano unapoongezwa kwenye timu, unaweza kuiondoa wakati wowote kwa kuwasiliana nasi; hii haiathiri yaliyofanyika kabla.",
          ],
        ],
      },
      {
        id: "who-sees",
        heading: "4. Nani anaweza kuona data yako",
        body: [
          [
            "Wanatimu wa mfumo wako wa maji pekee, kulingana na wadhifa wao. Hifadhidata yenyewe huzuia watu kuona data ya maeneo mengine.",
            "Wasimamizi wa AquaSentinel, pale tu inapohitajika kusaidia au kulinda huduma.",
            "Watoa huduma wanaoendesha sehemu za mfumo kwa niaba yetu kwa mkataba: Supabase (hifadhidata na kuingia kwenye akaunti), Vercel (kupangisha tovuti) na, tahadhari za SMS zinapowashwa kwa eneo fulani, mtoa huduma wa SMS mwenye leseni na mitandao ya simu.",
            "Mamlaka za serikali, pale tu sheria inapolazimu.",
          ],
          "Hatuuzi data binafsi kamwe.",
        ],
      },
      {
        id: "where",
        heading: "5. Data yako inahifadhiwa wapi",
        body: [
          "Hifadhidata yetu inapangishwa na Supabase katika Umoja wa Ulaya (Ufaransa), na tovuti inahudumiwa na Vercel. Hii ina maana kuwa data yako inahamishiwa nje ya Kenya. Tunatumia tu watoa huduma wanaolinda data kwa usalama thabiti na kinga za kimkataba, kama Sheria ya Ulinzi wa Data ya Kenya inavyotaka kwa uhamisho nje ya nchi.",
        ],
      },
      {
        id: "keep",
        heading: "6. Tunaihifadhi kwa muda gani",
        body: [
          [
            "Maelezo ya akaunti na nambari ya simu: wakati wote ukiwa mwanatimu wa mfumo wa maji. Ukiondoka, tunayafuta au kuyafanya yasiweze kukutambulisha ndani ya siku 30 baada ya kujulishwa.",
            "Kumbukumbu za matukio na matengenezo: hadi miaka 5, kwa sababu ndizo historia ya matengenezo ya mfumo wa maji. Ukiondoka, jina lako katika kumbukumbu hizi hubadilishwa kuwa wadhifa wako.",
            "Kumbukumbu ya ujumbe wa SMS: hadi miezi 12.",
            "Kumbukumbu za usalama zinazohifadhiwa na watoa huduma wetu wa upangishaji: kwa muda mfupi, kulingana na sera zao.",
          ],
        ],
      },
      {
        id: "security",
        heading: "7. Jinsi tunavyoilinda",
        body: [
          [
            "Kila muunganisho umesimbwa (HTTPS), na data iliyohifadhiwa husimbwa na mtoa huduma wetu.",
            "Kila mtu huingia kwenye akaunti yake mwenyewe, na kila wadhifa unaweza kufanya shughuli zake tu.",
            "Kila hatua muhimu hurekodiwa, ili iwe wazi daima nani alifanya nini na lini.",
            "Kila kifaa cha ufuatiliaji kina ufunguo wake unaoweza kufutwa; taarifa za uongo au zilizorudiwa hukataliwa.",
            "SMS ya kawaida haijasimbwa kutoka mwanzo hadi mwisho, kwa hiyo tahadhari hazina maelezo binafsi nyeti, na hatua muhimu kwa SMS (kama kufunga tukio) zinahitaji uthibitisho. SMS haiwezi kamwe kuwasha wala kuzima pampu.",
          ],
          "Data yako ikihatarishwa na uvunjaji wa usalama, tutaarifu Ofisi ya Kamishna wa Ulinzi wa Data ndani ya saa 72 tangu tujue, na kukujulisha pale unapoathirika.",
        ],
      },
      {
        id: "rights",
        heading: "8. Haki zako",
        body: [
          "Chini ya Sheria ya Ulinzi wa Data ya Kenya, 2019, una haki ya:",
          [
            "kujulishwa jinsi data yako inavyotumiwa (taarifa hii);",
            "kuona data binafsi tunayohifadhi kukuhusu;",
            "kurekebisha data isiyo sahihi au iliyopitwa na wakati;",
            "kutuomba tufute data tusiyoihitaji tena, au kupinga matumizi yake;",
            "kuondoa idhini pale tunapoitegemea.",
          ],
          `Ili kutumia haki yoyote kati ya hizi, tuma barua pepe kwa ${LEGAL_META.contact}. Tutathibitisha utambulisho wako na kujibu haraka iwezekanavyo. Usiporidhika, unaweza kuwasilisha malalamiko kwa Ofisi ya Kamishna wa Ulinzi wa Data (ODPC), www.odpc.go.ke.`,
        ],
      },
      {
        id: "cookies",
        heading: "9. Vidakuzi (cookies) na hifadhi ya kivinjari",
        body: [
          "Tunatumia tu kile kilicho lazima kabisa ili tovuti ifanye kazi. Hakuna vidakuzi vya matangazo, takwimu wala ufuatiliaji, na fonti hutolewa kutoka tovuti yetu wenyewe, kwa hiyo ziara yako haishirikiwi na kampuni nyingine.",
          [
            "Kidakuzi cha kuingia (kinawekwa na Supabase Auth): kinakuweka ndani ya akaunti kwa usalama. Kinaondolewa unapotoka.",
            "Kipengele kimoja cha hifadhi ya kivinjari (\"as-messages-seen\"): kinakumbuka mara ya mwisho ulipofungua Ujumbe, ili programu ionyeshe alama kwa ujumbe mpya. Kinabaki kwenye kifaa chako tu.",
          ],
          "Kwa kuwa hivi ni vya lazima kabisa, hatuonyeshi bango la vidakuzi. Unaweza kuvifuta wakati wowote katika mipangilio ya kivinjari chako; kisha utahitaji kuingia tena.",
        ],
      },
      {
        id: "children",
        heading: "10. Watoto",
        body: ["AquaSentinel ni kwa wanatimu wazima wa mifumo ya maji. Haikusudiwi kwa watoto walio chini ya miaka 18."],
      },
      {
        id: "changes",
        heading: "11. Mabadiliko ya taarifa hii",
        body: [
          "Tukibadilisha jinsi tunavyotumia data binafsi, tutasasisha taarifa hii na tarehe iliyo juu, na kuwajulisha wanatimu kuhusu mabadiliko muhimu. Taarifa hii inapatikana kwa Kiingereza na Kiswahili; jambo lolote likiwa halieleweki, wasiliana nasi nasi tutaeleza.",
        ],
      },
    ],
  },
};

export const TERMS: Record<Lang, LegalDoc> = {
  en: {
    title: "Terms of Use",
    intro:
      "These terms explain what AquaSentinel does, what it does not do, and how team members are expected to use it. By signing in, you agree to them.",
    sections: [
      {
        id: "service",
        heading: "1. What AquaSentinel is",
        body: [
          "AquaSentinel watches readings from a community water system (pump, flow, storage, solar power and battery), alerts the local team on the dashboard and by SMS, helps them respond and repair, and keeps a maintenance record. It supports the people who run the water system; it does not replace them.",
        ],
      },
      {
        id: "not",
        heading: "2. What AquaSentinel does not do",
        body: [
          [
            "It never switches pumps or other equipment on or off. All physical actions are done by people on site.",
            "It is not an emergency service. In an emergency that puts people at risk, contact the relevant authorities directly.",
            "It does not guarantee water quality or safety, and it cannot prevent every fault. Readings depend on equipment, power and mobile coverage, which can fail.",
            "Alerts show a suspected cause. A qualified person confirms the real cause on site.",
          ],
        ],
      },
      {
        id: "account",
        heading: "3. Your account",
        body: [
          [
            "Use only your own account, and keep your password private.",
            "Keep your mobile number up to date, so that alerts and SMS replies reach the right person.",
            "Tell us or your committee straight away if you think someone else has used your account.",
          ],
        ],
      },
      {
        id: "use",
        heading: "4. Using AquaSentinel responsibly",
        body: [
          [
            "Report problems honestly, and record what was actually found and done.",
            "Do not include other people's personal details in reports or notes.",
            "Do not try to access other sites' data, interfere with the system or send false readings.",
            "Follow safety rules and use qualified people when working near pumps, electricity and water infrastructure.",
          ],
        ],
      },
      {
        id: "sms",
        heading: "5. SMS alerts",
        body: [
          "When SMS alerts are enabled for your site, you may receive alerts about your water system and can reply to acknowledge them. Messages are sent through a licensed SMS provider and the mobile networks; delivery cannot be guaranteed. A message is shown as \"Delivered\" only when the provider confirms delivery. You can ask to stop SMS alerts at any time.",
        ],
      },
      {
        id: "data",
        heading: "6. Data and privacy",
        body: [
          "How we use personal data is explained in our Privacy Notice. Water readings and maintenance records belong to the water system they come from and are used to keep it working.",
        ],
      },
      {
        id: "availability",
        heading: "7. Availability and changes",
        body: [
          "We work to keep AquaSentinel available and accurate, but it may sometimes be unavailable, for example during maintenance or network outages. We may improve or change the service; we will tell team members about important changes.",
        ],
      },
      {
        id: "law",
        heading: "8. Law and contact",
        body: [
          `These terms are governed by the laws of Kenya. Questions: ${LEGAL_META.contact}.`,
        ],
      },
    ],
  },
  sw: {
    title: "Masharti ya Matumizi",
    intro:
      "Masharti haya yanaeleza AquaSentinel inafanya nini, haifanyi nini, na jinsi wanatimu wanavyotarajiwa kuitumia. Kwa kuingia kwenye akaunti, unakubali masharti haya.",
    sections: [
      {
        id: "service",
        heading: "1. AquaSentinel ni nini",
        body: [
          "AquaSentinel hufuatilia taarifa kutoka mfumo wa maji wa jamii (pampu, mtiririko, hifadhi, nishati ya jua na betri), hutuma tahadhari kwa timu ya eneo hilo kwenye dashibodi na kwa SMS, huwasaidia kushughulikia na kurekebisha, na huhifadhi kumbukumbu za matengenezo. Inawasaidia watu wanaoendesha mfumo wa maji; haiwachukui nafasi yao.",
        ],
      },
      {
        id: "not",
        heading: "2. AquaSentinel haifanyi nini",
        body: [
          [
            "Haiwashi wala kuzima pampu au vifaa vingine kamwe. Hatua zote za kimwili hufanywa na watu walio eneo husika.",
            "Si huduma ya dharura. Katika dharura inayohatarisha watu, wasiliana na mamlaka husika moja kwa moja.",
            "Haihakikishi ubora wala usalama wa maji, na haiwezi kuzuia kila hitilafu. Taarifa hutegemea vifaa, umeme na mtandao wa simu, ambavyo vinaweza kushindwa.",
            "Tahadhari huonyesha chanzo kinachoshukiwa. Mtu mwenye ujuzi huthibitisha chanzo halisi akiwa eneo husika.",
          ],
        ],
      },
      {
        id: "account",
        heading: "3. Akaunti yako",
        body: [
          [
            "Tumia akaunti yako mwenyewe tu, na weka nenosiri lako siri.",
            "Hakikisha nambari yako ya simu ni sahihi, ili tahadhari na majibu ya SMS yamfikie mtu sahihi.",
            "Tujulishe sisi au kamati yako mara moja ukidhani mtu mwingine ametumia akaunti yako.",
          ],
        ],
      },
      {
        id: "use",
        heading: "4. Kutumia AquaSentinel kwa uwajibikaji",
        body: [
          [
            "Ripoti matatizo kwa ukweli, na rekodi kilichopatikana na kilichofanyika kweli.",
            "Usiandike maelezo binafsi ya watu wengine katika ripoti au maelezo.",
            "Usijaribu kuingia kwenye data ya maeneo mengine, kuingilia mfumo au kutuma taarifa za uongo.",
            "Fuata kanuni za usalama na tumia watu wenye ujuzi unapofanya kazi karibu na pampu, umeme na miundombinu ya maji.",
          ],
        ],
      },
      {
        id: "sms",
        heading: "5. Tahadhari za SMS",
        body: [
          "Tahadhari za SMS zinapowashwa kwa eneo lako, unaweza kupokea tahadhari kuhusu mfumo wako wa maji na kujibu ili kuzikiri. Ujumbe hutumwa kupitia mtoa huduma wa SMS mwenye leseni na mitandao ya simu; kufikishwa hakuwezi kuhakikishwa. Ujumbe huonyeshwa \"Umefika\" tu pale mtoa huduma anapothibitisha kufikishwa. Unaweza kuomba kusitisha tahadhari za SMS wakati wowote.",
        ],
      },
      {
        id: "data",
        heading: "6. Data na faragha",
        body: [
          "Jinsi tunavyotumia data binafsi imeelezwa katika Taarifa yetu ya Faragha. Taarifa za maji na kumbukumbu za matengenezo ni mali ya mfumo wa maji zinakotoka na hutumiwa kuudumisha ufanye kazi.",
        ],
      },
      {
        id: "availability",
        heading: "7. Upatikanaji na mabadiliko",
        body: [
          "Tunajitahidi AquaSentinel ipatikane na iwe sahihi, lakini wakati mwingine huenda isipatikane, kwa mfano wakati wa matengenezo au mtandao ukikatika. Tunaweza kuboresha au kubadilisha huduma; tutawajulisha wanatimu kuhusu mabadiliko muhimu.",
        ],
      },
      {
        id: "law",
        heading: "8. Sheria na mawasiliano",
        body: [
          `Masharti haya yanaongozwa na sheria za Kenya. Maswali: ${LEGAL_META.contact}.`,
        ],
      },
    ],
  },
};
