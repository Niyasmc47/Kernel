import { useState, useEffect, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Square, Trash2, Play, Pause, Volume2 } from 'lucide-react';
import { startConversation, sendMessage, submitGrievance } from '../../api';
import { getStoredLanguage, type Language } from '../../utils/language';
import { playKeyClickSound, playEnterSound, playTheoBlipSound } from '../../utils/audioEffects';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  isSummary?: boolean;
}

type Phase = 'IDENTITY' | 'GRIEVANCE' | 'CONFIRMATION' | 'SUBMITTED';
type IdStep = 'INIT' | 'NAME' | 'AGE' | 'LOCATION' | 'EMAIL' | 'DONE';

interface ChatLocale {
  channelTitle: string;
  initLines: string[];
  nameAck: (name: string) => string[];
  ageAck: (age: string) => string[];
  locationAck: (loc: string) => string[];
  emailAck: (name: string) => string[];
  namePlaceholder: string;
  agePlaceholder: string;
  locationPlaceholder: string;
  emailPlaceholder: string;
  grievancePlaceholder: string;
  listening: string;
  whatKernelHeard: string;
  isThatRight: string;
  confirmBtn: string;
  editBtn: string;
  sendBtn: string;
  confirmedTitle: string;
  confirmedSubtitle: string;
  errorConnect: string;
  errorRepeat: string;
  errorTransmit: string;
  summaryIntro: string;
  sentAck: string;
  anythingElseAck: string;
  editAck: string;
  invalidEmail: string;
}

const LOCALES: Record<Language, ChatLocale> = {
  en: {
    channelTitle: 'CONVERSATION WITH THEO',
    initLines: [
      "Hello.",
      "I'm Theo — KERNEL.",
      "I'm here to listen and help however I can.",
      "Before we get started...",
      "What should I call you?"
    ],
    nameAck: (name) => [
      `${name}.`,
      "It's good to meet you.",
      "How old are you?"
    ],
    ageAck: (age) => [
      `${age}.`,
      "Thank you.",
      "Where are you reaching me from?"
    ],
    locationAck: (loc) => [
      `Got it. Location logged: ${loc}.`,
      "Now, what is your email address?",
      "Please enter a valid email so I can send your confirmation and case updates."
    ],
    emailAck: (name) => [
      `Thank you, ${name}.`,
      "I've got your basic details.",
      "Now, please take your time and tell me...",
      "What happened?"
    ],
    namePlaceholder: 'What should I call you?',
    agePlaceholder: 'How old are you?',
    locationPlaceholder: 'Where are you reaching me from?',
    emailPlaceholder: 'Enter your email (e.g. name@example.com)',
    grievancePlaceholder: 'Tell Theo what happened...',
    listening: 'listening...',
    whatKernelHeard: 'WHAT KERNEL HEARD',
    isThatRight: 'Is that right?',
    confirmBtn: 'YES, SEND IT →',
    editBtn: 'NOT QUITE',
    sendBtn: 'Send',
    confirmedTitle: 'MESSAGE RECEIVED',
    confirmedSubtitle: 'Theo has your details. Check your email for next steps.',
    errorConnect: "Couldn't connect. Give it a moment.",
    errorRepeat: "Didn't catch that. Can you say that again?",
    errorTransmit: "Failed to send. Please try again.",
    summaryIntro: "Okay.\nI understand your situation.\nLet me make sure I understood you correctly.",
    sentAck: "Alright.\nSending it.\nYour message is on its way.",
    anythingElseAck: "The problem is noted and securely dispatched. I'm right here with you — is there anything more you want help with?",
    editAck: "No problem. What did I get wrong?",
    invalidEmail: "That doesn't look like a valid email address. Please enter a valid email (e.g. name@example.com)."
  },
  es: {
    channelTitle: 'CONVERSACIÓN CON THEO',
    initLines: [
      "Hola.",
      "Soy Theo — KERNEL.",
      "Estoy aquí para escucharte y ayudarte en lo que pueda.",
      "Antes de comenzar...",
      "¿Cómo debería llamarte?"
    ],
    nameAck: (name) => [
      `${name}.`,
      "Un gusto conocerte.",
      "¿Cuántos años tienes?"
    ],
    ageAck: (age) => [
      `${age}.`,
      "Gracias por compartirlo.",
      "¿Desde dónde te estás comunicando?"
    ],
    locationAck: (loc) => [
      `Entendido. Ubicación registrada: ${loc}.`,
      "Ahora, ¿cuál es tu correo electrónico?",
      "Por favor ingresa un correo válido para enviarte la confirmación y el seguimiento."
    ],
    emailAck: (name) => [
      `Gracias, ${name}.`,
      "Tengo tus datos anotados.",
      "Ahora cuéntame con calma...",
      "¿Qué sucedió?"
    ],
    namePlaceholder: '¿Cómo debería llamarte?',
    agePlaceholder: '¿Cuántos años tienes?',
    locationPlaceholder: '¿Desde dónde te comunicas?',
    emailPlaceholder: 'Ingresa tu correo (ej. nombre@ejemplo.com)',
    grievancePlaceholder: 'Cuéntale a Theo qué ocurrió...',
    listening: 'escuchando...',
    whatKernelHeard: 'LO QUE KERNEL ENTENDIÓ',
    isThatRight: '¿Es correcto?',
    confirmBtn: 'SÍ, ENVIAR →',
    editBtn: 'NO DEL TODO',
    sendBtn: 'Enviar',
    confirmedTitle: 'MENSAJE RECIBIDO',
    confirmedSubtitle: 'Theo tiene tus datos. Revisa tu correo.',
    errorConnect: "No se pudo conectar. Un momento.",
    errorRepeat: "No logré captar eso. ¿Puedes repetirlo?",
    errorTransmit: "Error al enviar. Inténtalo de nuevo.",
    summaryIntro: "Entendido.\nEntiendo tu situación.\nDéjame confirmar si te entendí bien.",
    sentAck: "De acuerdo.\nEnviándolo.\nTu mensaje va en camino.",
    anythingElseAck: "El problema está anotado y enviado de forma segura. Sigo aquí contigo, ¿hay algo más en lo que te pueda ayudar?",
    editAck: "Sin problema. ¿Qué entendí mal?",
    invalidEmail: "Ese no parece un correo electrónico válido. Ingresa un correo válido (ej. nombre@ejemplo.com)."
  },
  fr: {
    channelTitle: 'CONVERSATION AVEC THEO',
    initLines: [
      "Bonjour.",
      "Je suis Theo — KERNEL.",
      "Je suis là pour t'écouter et t'aider du mieux possible.",
      "Avant de commencer...",
      "Comment dois-je t'appeler ?"
    ],
    nameAck: (name) => [
      `${name}.`,
      "Ravi de faire ta connaissance.",
      "Quel âge as-tu ?"
    ],
    ageAck: (age) => [
      `${age} ans.`,
      "Merci de me l'avoir indiqué.",
      "D'où me contactes-tu ?"
    ],
    locationAck: (loc) => [
      `Bien reçu. Localisation enregistrée : ${loc}.`,
      "Maintenant, quelle est ton adresse email exacte ?",
      "Merci d'indiquer un email valide pour recevoir la confirmation et le suivi."
    ],
    emailAck: (name) => [
      `Merci, ${name}.`,
      "J'ai bien noté tes coordonnées.",
      "Maintenant, dis-moi...",
      "Que s'est-il passé ?"
    ],
    namePlaceholder: 'Comment dois-je t\'appeler ?',
    agePlaceholder: 'Quel âge as-tu ?',
    locationPlaceholder: 'D\'où me contactes-tu ?',
    emailPlaceholder: 'Entre ton email (ex. nom@exemple.com)',
    grievancePlaceholder: 'Raconte à Theo ce qui s\'est passé...',
    listening: 'à l\'écoute...',
    whatKernelHeard: 'CE QUE KERNEL A COMPRIS',
    isThatRight: 'Est-ce exact ?',
    confirmBtn: 'OUI, ENVOYER →',
    editBtn: 'PAS TOUT À FAIT',
    sendBtn: 'Envoyer',
    confirmedTitle: 'MESSAGE REÇU',
    confirmedSubtitle: 'Theo a reçu tes informations. Regarde tes emails.',
    errorConnect: "Impossible de se connecter. Un instant.",
    errorRepeat: "Je n'ai pas bien saisi. Peux-tu répéter ?",
    errorTransmit: "Échec d'envoi. Réessaie.",
    summaryIntro: "Compris.\nJe comprends ta situation.\nLaisse-moi vérifier que j'ai bien compris.",
    sentAck: "Entendu.\nC'est envoyé.\nTon message est en route.",
    anythingElseAck: "Le problème est noté et transmis en toute sécurité. Je reste en ligne avec toi — y a-t-il autre chose pour laquelle tu as besoin d'aide ?",
    editAck: "Pas de souci. Qu'ai-je mal compris ?",
    invalidEmail: "Cette adresse email ne semble pas valide. Merci d'entrer un email valide (ex. nom@exemple.com)."
  },
  de: {
    channelTitle: 'GESPRÄCH MIT THEO',
    initLines: [
      "Hallo.",
      "Ich bin Theo — KERNEL.",
      "Ich bin hier, um zuzuhören und zu helfen.",
      "Bevor wir anfangen...",
      "Wie soll ich dich nennen?"
    ],
    nameAck: (name) => [
      `${name}.`,
      "Schön, dich kennenzulernen.",
      "Wie alt bist du?"
    ],
    ageAck: (age) => [
      `${age}.`,
      "Vielen Dank.",
      "Von wo aus erreichst du mich?"
    ],
    locationAck: (loc) => [
      `Verstanden. Standort erfasst: ${loc}.`,
      "Wie lautet deine E-Mail-Adresse?",
      "Bitte gib eine gültige E-Mail-Adresse ein, damit ich dir eine Bestätigung senden kann."
    ],
    emailAck: (name) => [
      `Danke, ${name}.`,
      "Ich habe deine Angaben erfasst.",
      "Jetzt erzähl mir bitte in Ruhe...",
      "Was ist passiert?"
    ],
    namePlaceholder: 'Wie soll ich dich nennen?',
    agePlaceholder: 'Wie alt bist du?',
    locationPlaceholder: 'Von wo aus erreichst du mich?',
    emailPlaceholder: 'E-Mail eingeben (z.B. name@beispiel.de)',
    grievancePlaceholder: 'Erzähle Theo, was passiert ist...',
    listening: 'hört zu...',
    whatKernelHeard: 'WAS KERNEL VERSTANDEN HAT',
    isThatRight: 'Stimmt das so?',
    confirmBtn: 'JA, ABSENDEN →',
    editBtn: 'NICHT GANZ',
    sendBtn: 'Senden',
    confirmedTitle: 'NACHRICHT ERHALTEN',
    confirmedSubtitle: 'Theo hat deine Angaben. Überprüfe deine E-Mails.',
    errorConnect: "Verbindung fehlgeschlagen. Einen Moment bitte.",
    errorRepeat: "Habe das nicht verstanden. Kannst du es wiederholen?",
    errorTransmit: "Senden fehlgeschlagen. Bitte erneut versuchen.",
    summaryIntro: "Alles klar.\nIch verstehe deine Situation.\nLass mich prüfen, ob ich alles richtig verstanden habe.",
    sentAck: "In Ordnung.\nNachricht wird gesendet.\nDeine Nachricht ist unterwegs.",
    anythingElseAck: "Das Problem ist notiert und sicher übermittelt. Ich bin weiterhin hier — gibt es noch etwas, bei dem ich dir helfen kann?",
    editAck: "Kein Problem. Was habe ich falsch verstanden?",
    invalidEmail: "Das scheint keine gültige E-Mail-Adresse zu sein. Bitte gib eine gültige E-Mail ein (z.B. name@beispiel.de)."
  },
  ja: {
    channelTitle: 'THEOとの対話',
    initLines: [
      "こんにちは。",
      "私はTheo — KERNELだ。",
      "力になれるよう、しっかり話を聞くよ。",
      "始める前に...",
      "お名前を教えてもらえるかい？"
    ],
    nameAck: (name) => [
      `${name}さん。`,
      "お会いできて嬉しいよ。",
      "年齢を教えてもらえるかい？"
    ],
    ageAck: (age) => [
      `${age}歳ですね。`,
      "教えてくれてありがとう。",
      "どこから連絡してくれているんだい？"
    ],
    locationAck: (loc) => [
      `了解した。所在地（${loc}）を記録したよ。`,
      "次に、連絡用のメールアドレスを教えてほしい。",
      "確認メッセージや詳細を届けるため、有効なメールアドレスを入力してくれ。"
    ],
    emailAck: (name) => [
      `ありがとう、${name}さん。`,
      "必要な基本情報は受け取ったよ。",
      "さて、落ち着いてほしい...",
      "何があったんだい？"
    ],
    namePlaceholder: 'お名前を入力してください',
    agePlaceholder: '年齢を入力してください',
    locationPlaceholder: '地域・場所を入力してください',
    emailPlaceholder: 'メールアドレスを入力（例: name@example.com）',
    grievancePlaceholder: '何があったのかTheoに話してください...',
    listening: '受信中...',
    whatKernelHeard: 'KERNELが把握した内容',
    isThatRight: 'これで合っていますか？',
    confirmBtn: 'はい、送信する →',
    editBtn: '修正する',
    sendBtn: '送信',
    confirmedTitle: 'メッセージを受信しました',
    confirmedSubtitle: 'Theoが詳細を受け取りました。メールを確認してください。',
    errorConnect: "接続できませんでした。少し待ってから再試行してください。",
    errorRepeat: "聞き取れませんでした。もう一度入力してください。",
    errorTransmit: "送信に失敗しました。もう一度お試しください。",
    summaryIntro: "了解した。\n状況は把握できた。\n正しく理解できたか確認させてくれ。",
    sentAck: "よし。\n送信する。\nメッセージはTheoに届けられた。",
    anythingElseAck: "問題は記録され、安全に送信された。まだ通信は繋がっている。他に手伝えることはあるか？",
    editAck: "問題ない。どこを直せばいい？",
    invalidEmail: "有効なメールアドレスではないようです。正しいメールアドレスを入力してください（例: name@example.com）。"
  },
  hi: {
    channelTitle: 'थियो के साथ बातचीत',
    initLines: [
      "नमस्ते。",
      "मैं थियो — KERNEL हूँ।",
      "मैं आपकी बात सुनने और पूरी मदद करने के लिए यहाँ हूँ।",
      "शुरू करने से पहले...",
      "मैं आपको किस नाम से पुकारूँ?"
    ],
    nameAck: (name) => [
      `${name} जी।`,
      "आपसे मिलकर अच्छा लगा।",
      "आपकी उम्र क्या है?"
    ],
    ageAck: (age) => [
      `${age} वर्ष।`,
      "बताने के लिए धन्यवाद।",
      "आप मुझे कहाँ से संपर्क कर रहे हैं?"
    ],
    locationAck: (loc) => [
      `स्थान दर्ज कर लिया गया: ${loc}।`,
      "अब, आपका विशिष्ट ईमेल पता क्या है?",
      "कृपया एक वैध ईमेल पता दर्ज करें ताकि मैं आपको पुष्टिकरण और मामले का विवरण भेज सकूँ।"
    ],
    emailAck: (name) => [
      `धन्यवाद, ${name} जी।`,
      "मुझे आपकी प्राथमिक जानकारी मिल गई है।",
      "अब कृपया आराम से बताएं...",
      "क्या हुआ था?"
    ],
    namePlaceholder: 'मैं आपको किस नाम से पुकारूँ?',
    agePlaceholder: 'आपकी उम्र क्या है?',
    locationPlaceholder: 'आप कहाँ से संपर्क कर रहे हैं?',
    emailPlaceholder: 'अपना ईमेल दर्ज करें (उदा. name@example.com)',
    grievancePlaceholder: 'थियो को बताएं कि क्या हुआ...',
    listening: 'सुन रहा हूँ...',
    whatKernelHeard: 'KERNEL ने क्या समझा',
    isThatRight: 'क्या यह सही है?',
    confirmBtn: 'हाँ, भेजें →',
    editBtn: 'पूरी तरह नहीं',
    sendBtn: 'भेजें',
    confirmedTitle: 'संदेश प्राप्त हुआ',
    confirmedSubtitle: 'थियो के पास आपका विवरण पहुँच गया है। अपने ईमेल की जाँच करें।',
    errorConnect: "कनेक्ट नहीं हो सका। कृपया कुछ देर प्रतीक्षा करें।",
    errorRepeat: "समझ नहीं आया। क्या आप दोबारा कह सकते हैं?",
    errorTransmit: "भेजने में विफल। कृपया पुनः प्रयास करें।",
    summaryIntro: "ठीक है।\nमुझे आपकी स्थिति समझ आ गई है।\nमैं सुनिश्चित कर लूँ कि मैंने सब सही समझा है।",
    sentAck: "बिल्कुल।\nभेज दिया गया है।\nआपका संदेश रास्ते में है।",
    anythingElseAck: "समस्या नोट कर ली गई है और सुरक्षित रूप से भेज दी गई है। मैं यहीं आपके साथ हूँ — क्या कुछ और है जिसमें आपको मदद चाहिए?",
    editAck: "कोई बात नहीं। मुझसे क्या समझने में भूल हुई?",
    invalidEmail: "यह एक मान्य ईमेल पता नहीं लगता। कृपया एक मान्य ईमेल दर्ज करें (उदा. name@example.com)।"
  },
  ml: {
    channelTitle: 'തിയോയുമായുള്ള സംഭാഷണം',
    initLines: [
      "നമസ്കാരം.",
      "ഞാൻ തിയോ — KERNEL ആണ്.",
      "നിങ്ങളെ കേൾക്കാനും സഹായിക്കാനും ഞാൻ ഇവിടെയുണ്ട്.",
      "തുടങ്ങുന്നതിന് മുൻപ്...",
      "ഞാൻ നിങ്ങളെ എന്താണ് വിളിക്കേണ്ടത്?"
    ],
    nameAck: (name) => [
      `${name}.`,
      "കണ്ടുമുട്ടിയതിൽ സന്തോഷം.",
      "നിങ്ങൾക്ക് എത്ര വയസ്സായി?"
    ],
    ageAck: (age) => [
      `${age}.`,
      "വിവരം പങ്കുവെച്ചതിന് നന്ദി.",
      "നിങ്ങൾ എവിടെ നിന്നാണ് എന്നെ ബന്ധപ്പെടുന്നത്?"
    ],
    locationAck: (loc) => [
      `മനസ്സിലായി. സ്ഥലം രേഖപ്പെടുത്തി: ${loc}.`,
      "ഇനി, നിങ്ങളുടെ ഇമെയിൽ വിലാസം എന്താണ്?",
      "സ്ഥിരീകരണവും വിവരങ്ങളും അയക്കാൻ സാധുവായ ഒരു ഇമെയിൽ നൽകുക."
    ],
    emailAck: (name) => [
      `നന്ദി, ${name}.`,
      "പ്രാഥമിക വിവരങ്ങൾ എനിക്ക് ലഭിച്ചു.",
      "ഇനി പറയൂ...",
      "എന്താണ് സംഭവിച്ചത്?"
    ],
    namePlaceholder: 'നിങ്ങളുടെ പേരെന്താണ്?',
    agePlaceholder: 'നിങ്ങൾക്ക് എത്ര വയസ്സായി?',
    locationPlaceholder: 'നിങ്ങൾ എവിടെ നിന്നാണ് ബന്ധപ്പെടുന്നത്?',
    emailPlaceholder: 'നിങ്ങളുടെ ഇമെയിൽ നൽകുക (उदा: name@example.com)',
    grievancePlaceholder: 'എന്താണ് സംഭവിച്ചതെന്ന് തിയോയോട് പറയൂ...',
    listening: 'കേൾക്കുന്നു...',
    whatKernelHeard: 'KERNEL മനസ്സിലാക്കിയത്',
    isThatRight: 'ഇത് ശരിയാണോ?',
    confirmBtn: 'അതെ, അയക്കുക →',
    editBtn: 'പൂർണ്ണമായും ശരിയല്ല',
    sendBtn: 'അയക്കുക',
    confirmedTitle: 'സന്ദേശം ലഭിച്ചു',
    confirmedSubtitle: 'തിയോയ്ക്ക് നിങ്ങളുടെ വിവരങ്ങൾ ലഭിച്ചു. ഇമെയിൽ പരിശോധിക്കുക.',
    errorConnect: "ബന്ധപ്പെടാൻ കഴിഞ്ഞില്ല. അൽപ്പസമയം കാത്തിരിക്കൂ.",
    errorRepeat: "വ്യക്തമായില്ല. വീണ്ടും പറയാമോ?",
    errorTransmit: "അയക്കാൻ കഴിഞ്ഞില്ല. വീണ്ടും ശ്രമിക്കുക.",
    summaryIntro: "ശരി.\nനിങ്ങളുടെ സാഹചര്യം എനിക്ക് മനസ്സിലായി.\nഞാൻ മനസ്സിലാക്കിയത് ശരിയാണോ എന്ന് പരിശോധിക്കട്ടെ.",
    sentAck: "ശരി.\nഅയച്ചു കഴിഞ്ഞു.\nനിങ്ങളുടെ സന്ദേശം കൈമാറിയിരിക്കുന്നു.",
    anythingElseAck: "പ്രശ്നം രേഖപ്പെടുത്തി സുരക്ഷിതമായി അയച്ചിട്ടുണ്ട്. ഞാൻ ഇവിടെത്തന്നെയുണ്ട് — വേറെ എന്തെങ്കിലും സഹായം ആവശ്യമുണ്ടോ?",
    editAck: "സാരമില്ല. എവിടെയാണ് തെറ്റിയത്?",
    invalidEmail: "ഇതൊരു സാധുവായ ഇമെയിൽ വിലാസമല്ല. ദയവായി ശരിയായ ഇമെയിൽ നൽകുക (उदा: name@example.com)."
  },
  ar: {
    channelTitle: 'محادثة مع ثيو',
    initLines: [
      "مرحباً.",
      "أنا ثيو — KERNEL.",
      "أنا هنا للاستماع إليك ومساعدتك بكل ما أستطيع.",
      "قبل أن نبدأ...",
      "بماذا تحب أن أناديك؟"
    ],
    nameAck: (name) => [
      `${name}.`,
      "تشرفت بلقائك.",
      "كم عمرك؟"
    ],
    ageAck: (age) => [
      `${age}.`,
      "شكراً لمشاركتك ذلك.",
      "من أين تتواصل معي؟"
    ],
    locationAck: (loc) => [
      `تم تسجيل موقعك: ${loc}.`,
      "الآن، ما هو عنوان بريدك الإلكتروني بالتحديد؟",
      "يرجى إدخال بريد إلكتروني صالح لإرسال التأكيد وتفاصيل الحالة."
    ],
    emailAck: (name) => [
      `شكراً لك يا ${name}.`,
      "حصلت على معلوماتك الأساسية.",
      "والآن أخبرني بهدوء...",
      "ماذا حدث؟"
    ],
    namePlaceholder: 'بماذا أناديك؟',
    agePlaceholder: 'كم عمرك؟',
    locationPlaceholder: 'من أين تتواصل معي؟',
    emailPlaceholder: 'أدخل بريدك الإلكتروني (مثل name@example.com)',
    grievancePlaceholder: 'أخبر ثيو بما حدث...',
    listening: 'أستمع إليك...',
    whatKernelHeard: 'ما فهمه KERNEL',
    isThatRight: 'هل هذا صحيح؟',
    confirmBtn: 'نعم، أرسل الآن ←',
    editBtn: 'ليس تماماً',
    sendBtn: 'إرسال',
    confirmedTitle: 'تم استلام الرسالة',
    confirmedSubtitle: 'ثيو لديه التفاصيل الآن. تحقق من بريدك الإلكتروني.',
    errorConnect: "تعذر الاتصال. انتظر لحظة من فضلك.",
    errorRepeat: "لم أسمع ذلك جيداً. هل يمكنك التكرار؟",
    errorTransmit: "فشل الإرسال. يرجى المحاولة مرة أخرى.",
    summaryIntro: "حسناً.\nأتفهم وضعك.\nدعني أتأكد من أنني فهمتك بشكل صحيح.",
    sentAck: "حسناً.\nجاري الإرسال.\nرسالتك في طريقها الآن.",
    anythingElseAck: "تم تسجيل المشكلة وإرسالها بأمان. ما زلت معك على الخط — هل هناك أي شيء آخر تريد المساعدة بشأنه؟",
    editAck: "لا توجد مشكلة. ما الذي أخطأت في فهمه؟",
    invalidEmail: "هذا البريد الإلكتروني غير صالح. يرجى إدخال بريد إلكتروني صحيح (مثل name@example.com)."
  },
  pt: {
    channelTitle: 'CONVERSA COM THEO',
    initLines: [
      "Olá.",
      "Eu sou Theo — KERNEL.",
      "Estou aqui para te ouvir e ajudar no que for preciso.",
      "Antes de começarmos...",
      "Como devo te chamar?"
    ],
    nameAck: (name) => [
      `${name}.`,
      "Prazer em te conhecer.",
      "Quantos anos você tem?"
    ],
    ageAck: (age) => [
      `${age}.`,
      "Obrigado por compartilhar.",
      "De onde você está falando?"
    ],
    locationAck: (loc) => [
      `Localização registrada: ${loc}.`,
      "Agora, qual é o seu endereço de e-mail específico?",
      "Por favor, insira um e-mail válido para que eu possa enviar sua confirmação e acompanhamento."
    ],
    emailAck: (name) => [
      `Obrigado, ${name}.`,
      "Já tenho seus dados iniciais.",
      "Agora me conte com calma...",
      "O que aconteceu?"
    ],
    namePlaceholder: 'Como devo te chamar?',
    agePlaceholder: 'Quantos anos você tem?',
    locationPlaceholder: 'De onde você está falando?',
    emailPlaceholder: 'Digite seu e-mail (ex: nome@exemplo.com)',
    grievancePlaceholder: 'Conte ao Theo o que aconteceu...',
    listening: 'escutando...',
    whatKernelHeard: 'O QUE O KERNEL ENTENDEU',
    isThatRight: 'Está correto?',
    confirmBtn: 'SIM, ENVIAR →',
    editBtn: 'NÃO EXATAMENTE',
    sendBtn: 'Enviar',
    confirmedTitle: 'MENSAGEM RECEBIDA',
    confirmedSubtitle: 'Theo recebeu seus dados. Verifique seu e-mail para os próximos passos.',
    errorConnect: "Não foi possível conectar. Aguarde um momento.",
    errorRepeat: "Não entendi bem. Pode repetir?",
    errorTransmit: "Falha ao enviar. Tente novamente.",
    summaryIntro: "Entendido.\nCompreendo a sua situação.\nDeixe-me confirmar se compreendi direito.",
    sentAck: "Beleza.\nEnviando.\nSua mensagem está a caminho.",
    anythingElseAck: "O problema foi registrado e enviado com segurança. Continuo aqui com você — há mais alguma coisa em que você precisa de ajuda?",
    editAck: "Sem problemas. O que eu entendi errado?",
    invalidEmail: "Este não parece ser um e-mail válido. Por favor, insira um e-mail válido (ex: nome@exemplo.com)."
  },
  ru: {
    channelTitle: 'СВЯЗЬ С ТЕО',
    initLines: [
      "Приветствую.",
      "Я Тео — KERNEL.",
      "Я здесь, чтобы выслушать тебя и помочь во всём, чем смогу.",
      "Прежде чем перейти к делу...",
      "Как мне тебя называть?"
    ],
    nameAck: (name) => [
      `${name}.`,
      "Рад знакомству.",
      "Сколько тебе лет?"
    ],
    ageAck: (age) => [
      `${age}.`,
      "Спасибо за ответ.",
      "Откуда ты выходишь на связь?"
    ],
    locationAck: (loc) => [
      `Местоположение зафиксировано: ${loc}.`,
      "Теперь укажи конкретно свой адрес электронной почты:",
      "Пожалуйста, введи действующий email для получения подтверждения и связи."
    ],
    emailAck: (name) => [
      `Спасибо, ${name}.`,
      "Все необходимые данные получены.",
      "А теперь расскажи подробно...",
      "Что произошло?"
    ],
    namePlaceholder: 'Как мне тебя называть?',
    agePlaceholder: 'Сколько тебе лет?',
    locationPlaceholder: 'Откуда ты выходишь на связь?',
    emailPlaceholder: 'Введи email (например: name@example.com)',
    grievancePlaceholder: 'Расскажи Тео, что случилось...',
    listening: 'слушаю...',
    whatKernelHeard: 'ЧТО ПОНЯЛ KERNEL',
    isThatRight: 'Все верно?',
    confirmBtn: 'ДА, ОТПРАВИТЬ →',
    editBtn: 'НЕ СОВСЕМ',
    sendBtn: 'Отправить',
    confirmedTitle: 'СООБЩЕНИЕ ПОЛУЧЕНО',
    confirmedSubtitle: 'Тео получил твои данные. Проверь электронную почту.',
    errorConnect: "Не удалось подключиться. Подожди минутку.",
    errorRepeat: "Не расслышал. Можешь повторить?",
    errorTransmit: "Ошибка отправки. Попробуй еще раз.",
    summaryIntro: "Понятно.\nКартина ясна.\nПозволь уточнить, всё ли я правильно понял.",
    sentAck: "Хорошо.\nОтправляю.\nТвое сообщение уже в пути.",
    anythingElseAck: "Проблема зафиксирована и надежно отправлена. Я остаюсь на связи с тобой — есть ли что-то еще, с чем я могу помочь?",
    editAck: "Без проблем. Что именно я понял не так?",
    invalidEmail: "Этот адрес электронной почты не похож на настоящий. Пожалуйста, введи действующий email (например: name@example.com)."
  }
};

interface ChatInterfaceProps {
  startChat?: boolean;
}

export default function ChatInterface({ startChat = true }: ChatInterfaceProps) {
  const [lang, setLang] = useState<Language>(getStoredLanguage());
  const locale = LOCALES[lang] || LOCALES.en;

  const [phase, setPhase] = useState<Phase>('IDENTITY');
  const [idStep, setIdStep] = useState<IdStep>('INIT');
  
  const [userData, setUserData] = useState({
    name: '',
    age: '',
    location: '',
    email: '',
    language: lang
  });

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null);

  // Audio voice note recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<any>(null);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);

  // Guards to prevent duplicate sequence runs
  const initStartedRef = useRef(false);
  const activeRunIdRef = useRef(0);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const mimeType = mediaRecorder.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);

        const reader = new FileReader();
        reader.onloadend = () => {
          const base64data = reader.result as string;
          setAudioBase64(base64data);
        };
        reader.readAsDataURL(audioBlob);

        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(200);
      setIsRecording(true);
      setRecordingSeconds(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev >= 120) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      console.error('Microphone access error:', err);
      alert('Could not access microphone. Please ensure microphone permissions are enabled in your browser.');
    }
  };

  const stopRecording = () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const discardRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(null);
    setAudioBase64(null);
    setRecordingSeconds(0);
    setIsPlayingPreview(false);
  };

  const togglePlayPreview = () => {
    if (!audioPreviewRef.current || !audioUrl) return;
    if (isPlayingPreview) {
      audioPreviewRef.current.pause();
      setIsPlayingPreview(false);
    } else {
      audioPreviewRef.current.play();
      setIsPlayingPreview(true);
    }
  };

  const formatRecordingTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const appendMsg = (sender: 'ai' | 'user', text: string, isSummary = false) => {
    setMessages(prev => [...prev, { id: Date.now().toString() + Math.random(), sender, text, isSummary }]);
    if (sender === 'ai') {
      playTheoBlipSound(0.06);
    }
  };

  const simulateKernelTyping = async (lines: string[], delayMs = 1200) => {
    const runId = activeRunIdRef.current;
    setIsTyping(true);
    for (const line of lines) {
      await new Promise(r => setTimeout(r, delayMs));
      if (activeRunIdRef.current !== runId) return;
      appendMsg('ai', line);
    }
    if (activeRunIdRef.current === runId) {
      setIsTyping(false);
    }
  };

  const runInitSequence = async (targetLang: Language) => {
    const runId = ++activeRunIdRef.current;
    const currentLoc = LOCALES[targetLang] || LOCALES.en;
    
    // Clear messages for pristine single-load
    setMessages([]);
    setIsTyping(true);
    
    await new Promise(r => setTimeout(r, 600));
    if (activeRunIdRef.current !== runId) return;

    for (const line of currentLoc.initLines) {
      await new Promise(r => setTimeout(r, 1100));
      if (activeRunIdRef.current !== runId) return;
      appendMsg('ai', line);
    }

    if (activeRunIdRef.current === runId) {
      setIsTyping(false);
      setIdStep('NAME');
    }
  };

  // Only start sequence when startChat is true (after intro video finishes) and run ONCE
  useEffect(() => {
    if (!startChat) return;
    if (initStartedRef.current) return;
    initStartedRef.current = true;

    runInitSequence(lang);
  }, [startChat]);

  // Sync with global language change
  useEffect(() => {
    const handleLangChange = (e: Event) => {
      const customEvent = e as CustomEvent<Language>;
      if (customEvent.detail) {
        const newLang = customEvent.detail;
        setLang(newLang);
        setUserData(prev => ({ ...prev, language: newLang }));

        // If at the initial step, update the intro lines cleanly into the new language
        if (phase === 'IDENTITY' && (idStep === 'INIT' || idStep === 'NAME')) {
          runInitSequence(newLang);
        }
      }
    };

    window.addEventListener('kernel_language_changed', handleLangChange);
    return () => window.removeEventListener('kernel_language_changed', handleLangChange);
  }, [phase, idStep]);

  useEffect(() => {
    if (endOfMessagesRef.current) {
      const scrollContainer = endOfMessagesRef.current.parentElement;
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
    
    if (!isTyping && phase !== 'CONFIRMATION' && phase !== 'SUBMITTED') {
      inputRef.current?.focus();
    }
  }, [messages, isTyping, phase]);

  const startMutation = useMutation({
    mutationFn: (targetLang: string) => startConversation(targetLang),
    onSuccess: (data) => {
      setSessionId(data.sessionId);
    },
    onError: () => {
      appendMsg('ai', locale.errorConnect);
      setIsTyping(false);
    }
  });

  const sendMutation = useMutation({
    mutationFn: ({ sid, msg }: { sid: string, msg: string }) => sendMessage(sid, msg),
    onMutate: () => setIsTyping(true),
    onSuccess: (data) => {
      appendMsg('ai', data.message);
      setIsTyping(false);
      if (data.readyToSubmit) {
        setPhase('CONFIRMATION');
        setAnalysisResult(data.analysisResult);
        setIsTyping(true);
        setTimeout(() => {
           setIsTyping(false);
           appendMsg('ai', locale.summaryIntro);
           appendMsg('ai', data.analysisResult?.summary || data.message, true);
        }, 1200);
      }
    },
    onError: () => {
      appendMsg('ai', locale.errorRepeat);
      setIsTyping(false);
    }
  });

  const submitMutation = useMutation({
    mutationFn: (payload: any) => submitGrievance(payload),
    onSuccess: () => {
      setIsTyping(false);
      appendMsg('ai', locale.sentAck);
      setAudioUrl(null);
      setAudioBase64(null);
      setAnalysisResult(null);

      // Transition back to active interactive dialogue
      setPhase('GRIEVANCE');
      setTimeout(() => {
        simulateKernelTyping([locale.anythingElseAck], 1200);
      }, 900);
    },
    onError: (err: any) => {
      console.error('Submit grievance error:', err);
      setIsTyping(false);
      appendMsg('ai', locale.errorTransmit);
    }
  });

  const handleSend = async () => {
    if (!inputValue.trim() || isTyping) return;
    const userMsg = inputValue.trim();
    appendMsg('user', userMsg);
    setInputValue('');

    if (phase === 'IDENTITY') {
      if (idStep === 'NAME') {
        setUserData(prev => ({ ...prev, name: userMsg }));
        setIdStep('AGE');
        await simulateKernelTyping(locale.nameAck(userMsg));
      } else if (idStep === 'AGE') {
        setUserData(prev => ({ ...prev, age: userMsg }));
        setIdStep('LOCATION');
        await simulateKernelTyping(locale.ageAck(userMsg));
      } else if (idStep === 'LOCATION') {
        setUserData(prev => ({ ...prev, location: userMsg }));
        setIdStep('EMAIL');
        await simulateKernelTyping(locale.locationAck(userMsg));
      } else if (idStep === 'EMAIL') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(userMsg)) {
          await simulateKernelTyping([locale.invalidEmail], 800);
          return;
        }
        setUserData(prev => ({ ...prev, email: userMsg }));
        setIdStep('DONE');
        setPhase('GRIEVANCE');
        await simulateKernelTyping(locale.emailAck(userData.name || 'friend'));
        startMutation.mutate(lang); 
      }
    } else if (phase === 'GRIEVANCE') {
       if (audioBase64 || audioUrl) {
          // Voice note flow: Directly verify if it's the core issue and serious enough to send to mail
          setIsTyping(true);
          setTimeout(() => {
            appendMsg('ai', "Voice transmission received and encrypted.");
          }, 600);
          setTimeout(() => {
            appendMsg('ai', "Please confirm: Is this the main issue you're facing, and is it serious enough to transmit directly to Theo's secure mail?");
            setIsTyping(false);
            setPhase('CONFIRMATION');
            setAnalysisResult({
              summary: `🎙️ Voice Note Recording (${formatRecordingTime(recordingSeconds)}) attached for Theo's direct review.`
            });
          }, 1500);
       } else if (sessionId) {
          // Normal text flow: Continue standard AI dialogue
          sendMutation.mutate({ sid: sessionId, msg: userMsg });
       }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      playEnterSound(0.12);
      handleSend();
    } else if (e.key.length === 1 || e.key === 'Backspace' || e.key === 'Delete' || e.key === ' ') {
      playKeyClickSound(0.08);
    }
  };

  const handleConfirm = (isCorrect: boolean) => {
    if (isCorrect) {
       appendMsg('user', locale.confirmBtn);
       setIsTyping(true);

       // Collect citizen grievance text
       const userMessages = messages.filter(m => m.sender === 'user').map(m => m.text);
       const lastGrievanceMsg = userMessages.length > 0 ? userMessages[userMessages.length - 1] : '';
       
       let grievanceText = analysisResult?.summary?.trim() || '';
       if (grievanceText.length < 10) {
          grievanceText = lastGrievanceMsg.trim();
       }
       if (grievanceText.length < 10) {
          grievanceText = userMessages.join(' - ');
       }
       if (grievanceText.length < 10) {
          grievanceText = audioBase64 
            ? `🎙️ Voice Note Recording (${formatRecordingTime(recordingSeconds)}) submitted by citizen for Theo's direct review.`
            : 'Assistance requested by citizen through communication portal.';
       }

       const parsedAge = parseInt(userData.age, 10);
       const age = (!isNaN(parsedAge) && parsedAge >= 1 && parsedAge <= 150) ? parsedAge : 18;

       const payload = {
          name: userData.name?.trim() || 'Citizen',
          age,
          location: userData.location?.trim() || 'Unknown Location',
          email: userData.email?.trim() || '',
          language: lang || userData.language || 'en',
          grievance: grievanceText,
          voiceNoteBase64: audioBase64 || undefined,
          voiceNoteContentType: audioBase64 ? 'audio/webm' : undefined,
          sessionId: sessionId || ('session-' + Date.now())
       };

       submitMutation.mutate(payload);
    } else {
       appendMsg('user', locale.editBtn);
       discardRecording();
       setPhase('GRIEVANCE');
       simulateKernelTyping([locale.editAck], 1100);
    }
  };

  let placeholder = '';
  let inputType = 'text';

  if (phase === 'IDENTITY') {
     if (idStep === 'NAME') placeholder = locale.namePlaceholder;
     if (idStep === 'AGE') { placeholder = locale.agePlaceholder; inputType = 'number'; }
     if (idStep === 'LOCATION') placeholder = locale.locationPlaceholder;
     if (idStep === 'EMAIL') { placeholder = locale.emailPlaceholder; inputType = 'email'; }
  } else if (phase === 'GRIEVANCE') {
     placeholder = locale.grievancePlaceholder;
  }

  const isInputDisabled = isTyping || idStep === 'INIT' || phase === 'SUBMITTED' || phase === 'CONFIRMATION';

  return (
    <div className="relative flex flex-col h-[54vh] sm:h-[58vh] min-h-[420px] max-h-[580px] w-full max-w-xl mx-auto md:ml-auto overflow-hidden bg-white/90 dark:bg-black/45 backdrop-blur-2xl rounded-2xl border border-gray-200/80 dark:border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] z-10 pointer-events-auto transition-colors duration-300">
      
      {/* Header bar */}
      <div className="px-5 py-3 border-b border-gray-200/80 dark:border-white/5 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2.5">
          <div className="relative w-6 h-6 flex items-center justify-center">
            <img 
              src="/kernel-logo.jpg" 
              alt="Kernel Hero Sigil" 
              className="w-full h-full object-cover rounded-md border border-emerald-500/50 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-sans font-semibold text-[11px] tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
              {locale.channelTitle}
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </span>
          </div>
        </div>
        <span className="font-mono text-[10px] text-gray-500 uppercase px-2 py-0.5 rounded bg-gray-100 dark:bg-white/5 border border-gray-200/60 dark:border-white/5">
          {lang}
        </span>
      </div>

      {/* Chat Timeline */}
      <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-4 z-10 scrollbar-thin">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              {msg.isSummary ? (
                <div className="w-full my-2 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300/80 dark:border-emerald-500/30 text-emerald-950 dark:text-emerald-200 shadow-sm">
                  <div className="font-sans font-semibold text-xs tracking-wider text-emerald-700 dark:text-emerald-400 mb-2 uppercase">
                    {locale.whatKernelHeard}
                  </div>
                  <div className="font-sans text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                    {msg.text}
                  </div>
                </div>
              ) : (
                <div
                  className={`max-w-[88%] md:max-w-[82%] rounded-xl px-4 py-2.5 transition-colors duration-200 ${
                    msg.sender === 'user'
                      ? 'bg-gray-200/90 dark:bg-white/10 text-gray-900 dark:text-white rounded-tr-none border border-gray-300/60 dark:border-white/5 font-sans'
                      : 'bg-emerald-50/90 dark:bg-emerald-950/35 text-emerald-950 dark:text-emerald-200 rounded-tl-none border border-emerald-200/80 dark:border-emerald-500/20 font-sans'
                  }`}
                >
                  <p className="text-sm md:text-[15px] leading-relaxed whitespace-pre-wrap">
                    {msg.text}
                  </p>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center space-x-1.5 text-xs text-emerald-600 dark:text-emerald-400/80 pl-2 font-mono py-1"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" />
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]" />
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]" />
            <span className="text-[11px] ml-1">{locale.listening}</span>
          </motion.div>
        )}
        <div ref={endOfMessagesRef} />
      </div>

      {/* Interactive Controls & Input */}
      <div className="p-4 border-t border-gray-200/80 dark:border-white/5 bg-gray-50/80 dark:bg-black/25 relative z-20">
        
        {/* Hidden Audio Player for Previewing Voice Recording */}
        {audioUrl && (
          <audio 
            ref={audioPreviewRef} 
            src={audioUrl} 
            onEnded={() => setIsPlayingPreview(false)} 
            className="hidden" 
          />
        )}

        {/* Attached Voice Note Banner (When recording is complete and ready to send) */}
        {audioUrl && !isRecording && (
          <div className="mb-3 px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300 animate-in fade-in duration-200">
            <div className="flex items-center space-x-2">
              <Volume2 className="w-4 h-4 text-emerald-500 animate-pulse" />
              <span className="font-mono text-[11px] font-semibold">
                VOICE NOTE READY ({formatRecordingTime(recordingSeconds)})
              </span>
            </div>
            <div className="flex items-center space-x-1.5">
              <button
                type="button"
                onClick={togglePlayPreview}
                className="p-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-700 dark:text-emerald-300 transition-colors"
                title={isPlayingPreview ? "Pause" : "Play Preview"}
              >
                {isPlayingPreview ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={discardRecording}
                className="p-1.5 rounded-lg hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-colors"
                title="Discard voice note"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {phase === 'CONFIRMATION' ? (
          <div className="flex flex-col space-y-2.5">
            <div className="text-xs font-medium text-gray-700 dark:text-gray-400 text-center font-sans">
              {locale.isThatRight}
            </div>
            <div className="flex space-x-3">
              <button
                disabled={isTyping || submitMutation.isPending}
                onClick={() => handleConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-300 dark:border-white/20 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-800 dark:text-white text-xs font-sans font-medium transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {locale.editBtn}
              </button>
              <button
                disabled={isTyping || submitMutation.isPending}
                onClick={() => handleConfirm(true)}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-sans font-medium transition-all shadow-[0_4px_15px_rgba(16,185,129,0.3)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {submitMutation.isPending ? (
                  <span>TRANSMITTING...</span>
                ) : (
                  <span>{locale.confirmBtn}</span>
                )}
              </button>
            </div>
          </div>
        ) : phase === 'SUBMITTED' ? (
          <div className="text-center py-2">
            <div className="font-sans font-semibold text-emerald-600 dark:text-emerald-400 text-sm tracking-wide mb-1">
              {locale.confirmedTitle}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {locale.confirmedSubtitle}
            </p>
          </div>
        ) : isRecording ? (
          /* Live Recording Controls */
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-red-950/30 border border-red-500/40 animate-pulse">
            <div className="flex items-center space-x-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              <span className="font-mono text-xs text-red-400 font-semibold">
                RECORDING VOICE NOTE ({formatRecordingTime(recordingSeconds)})
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={stopRecording}
                className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-sans text-xs font-medium flex items-center space-x-1.5 shadow-md cursor-pointer transition-all"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Stop &amp; Attach</span>
              </button>
              <button
                type="button"
                onClick={discardRecording}
                className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
                title="Cancel Recording"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            {phase === 'GRIEVANCE' ? (
              <textarea
                ref={inputRef as any}
                rows={1}
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  playKeyClickSound(0.08);
                }}
                onKeyDown={handleKeyDown}
                placeholder={audioUrl ? "Voice note attached! (Add text or press Send)" : placeholder}
                disabled={isInputDisabled}
                className="flex-1 bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none resize-none transition-all disabled:opacity-50"
              />
            ) : (
              <input
                ref={inputRef as any}
                type={inputType}
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  playKeyClickSound(0.08);
                }}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                disabled={isInputDisabled}
                className="flex-1 bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none transition-all disabled:opacity-50"
              />
            )}

            {/* Microphone Button for Grievance Phase */}
            {phase === 'GRIEVANCE' && (
              <button
                type="button"
                onClick={startRecording}
                disabled={isInputDisabled}
                title="Record Voice Note"
                className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
                  audioUrl
                    ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                    : 'border-gray-300 dark:border-white/10 hover:border-emerald-500/60 text-gray-600 dark:text-gray-300 hover:text-emerald-400 hover:bg-white/5'
                }`}
              >
                <Mic className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => {
                if (!inputValue.trim() && audioUrl) {
                  setInputValue("🎙️ [Voice note attached for Theo]");
                  setTimeout(() => handleSend(), 50);
                } else {
                  handleSend();
                }
              }}
              disabled={isInputDisabled || (!inputValue.trim() && !audioUrl)}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-sans font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_2px_10px_rgba(16,185,129,0.25)] flex items-center justify-center cursor-pointer"
            >
              {locale.sendBtn}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
