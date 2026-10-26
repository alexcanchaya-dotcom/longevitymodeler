// "Get my plan" — zero-account, zero-email fallback (Longevity Offer, Oct 2026).
// Rules: the free number is never gated. This collects NO email and sends nothing.
// It reads the result already on screen (number + top 3 levers) and builds a
// printable / downloadable page, or a mailto: the visitor addresses to themself.
// It does not touch scoring, cookies or ads.

var PLAN_COPY = {
  en: {
    button: 'Get my plan', note: 'Free. No email, no account. Print it, save it, or email it to yourself.',
    title: 'Your habit plan', number: 'Your estimate', levers: 'Your top 3 levers',
    weeks: 'One small step a week',
    week: function (n) { return 'Week ' + n; },
    weekStep: function (lever) { return 'Start one small step on: ' + lever + '.'; },
    week4: 'Keep all three going. Run the calculator again to see where you are.',
    none: 'Your habits already look strong. Keep them going.',
    linked: 'These habits are linked to longer life in studies.',
    disclaimer: 'Educational only. This is not medical advice. Talk to a doctor about your own health.',
    print: 'Print / save as PDF', download: 'Download', email: 'Email it to myself',
    subject: 'My Longevity Modeler habit plan'
  },
  it: {
    button: 'Ottieni il mio piano', note: 'Gratis. Niente email, niente account. Stampalo, salvalo o invialo a te stesso.',
    title: 'Il tuo piano di abitudini', number: 'La tua stima', levers: 'Le tue 3 leve principali',
    weeks: 'Un piccolo passo a settimana',
    week: function (n) { return 'Settimana ' + n; },
    weekStep: function (lever) { return 'Inizia con un piccolo passo su: ' + lever + '.'; },
    week4: 'Mantieni tutte e tre. Rifai il calcolo per vedere a che punto sei.',
    none: 'Le tue abitudini sono già buone. Continua così.',
    linked: 'Negli studi queste abitudini sono legate a una vita più lunga.',
    disclaimer: 'Solo a scopo educativo. Non è un consiglio medico. Parla con un medico della tua salute.',
    print: 'Stampa / salva in PDF', download: 'Scarica', email: 'Invialo a me stesso',
    subject: 'Il mio piano di abitudini Longevity Modeler'
  },
  ru: {
    button: 'Получить мой план', note: 'Бесплатно. Без email и регистрации. Распечатайте, сохраните или отправьте себе.',
    title: 'Ваш план привычек', number: 'Ваша оценка', levers: 'Ваши 3 главных рычага',
    weeks: 'Один маленький шаг в неделю',
    week: function (n) { return 'Неделя ' + n; },
    weekStep: function (lever) { return 'Сделайте один маленький шаг: ' + lever + '.'; },
    week4: 'Продолжайте все три. Пройдите расчёт снова, чтобы увидеть прогресс.',
    none: 'Ваши привычки уже хорошие. Продолжайте.',
    linked: 'В исследованиях эти привычки связаны с более долгой жизнью.',
    disclaimer: 'Только в образовательных целях. Это не медицинский совет. Обсудите своё здоровье с врачом.',
    print: 'Печать / сохранить PDF', download: 'Скачать', email: 'Отправить себе',
    subject: 'Мой план привычек Longevity Modeler'
  },
  // Other 13 languages (Oct 2026). "Longevity Modeler" and "PDF" stay as names.
  es: {
    button: "Obtener mi plan",
    note: "Gratis. Sin email ni cuenta. Imprímelo, guárdalo o envíatelo por email.",
    title: "Tu plan de hábitos",
    number: "Tu estimación",
    levers: "Tus 3 palancas principales",
    weeks: "Un pequeño paso por semana",
    week: function (n) { return "Semana " + n; },
    weekStep: function (lever) { return "Empieza con un pequeño paso en: " + lever + "."; },
    week4: "Mantén los tres. Vuelve a usar la calculadora para ver dónde estás.",
    none: "Tus hábitos ya se ven sólidos. Sigue así.",
    linked: "En los estudios, estos hábitos se asocian con una vida más larga.",
    disclaimer: "Solo con fines educativos. No es consejo médico. Habla con un médico sobre tu salud.",
    print: "Imprimir / guardar como PDF",
    download: "Descargar",
    email: "Enviármelo por email",
    subject: "Mi plan de hábitos de Longevity Modeler"
  },
  pl: {
    button: "Pobierz mój plan",
    note: "Za darmo. Bez e-maila i konta. Wydrukuj, zapisz lub wyślij go sobie e-mailem.",
    title: "Twój plan nawyków",
    number: "Twój szacunek",
    levers: "Twoje 3 najważniejsze dźwignie",
    weeks: "Jeden mały krok na tydzień",
    week: function (n) { return "Tydzień " + n; },
    weekStep: function (lever) { return "Zrób jeden mały krok w obszarze: " + lever + "."; },
    week4: "Kontynuuj wszystkie trzy. Uruchom kalkulator ponownie, aby zobaczyć, gdzie jesteś.",
    none: "Twoje nawyki już wyglądają dobrze. Tak trzymaj.",
    linked: "W badaniach te nawyki wiążą się z dłuższym życiem.",
    disclaimer: "Wyłącznie w celach edukacyjnych. To nie jest porada medyczna. Porozmawiaj z lekarzem o swoim zdrowiu.",
    print: "Drukuj / zapisz jako PDF",
    download: "Pobierz",
    email: "Wyślij do siebie e-mailem",
    subject: "Mój plan nawyków z Longevity Modeler"
  },
  de: {
    button: "Meinen Plan holen",
    note: "Kostenlos. Keine E-Mail, kein Konto. Drucke ihn aus, speichere ihn oder schick ihn dir per E-Mail.",
    title: "Dein Gewohnheitsplan",
    number: "Deine Schätzung",
    levers: "Deine 3 wichtigsten Hebel",
    weeks: "Ein kleiner Schritt pro Woche",
    week: function (n) { return "Woche " + n; },
    weekStep: function (lever) { return "Beginne mit einem kleinen Schritt bei: " + lever + "."; },
    week4: "Bleib bei allen dreien. Nutze den Rechner erneut, um zu sehen, wo du stehst.",
    none: "Deine Gewohnheiten sehen schon stark aus. Mach weiter so.",
    linked: "In Studien werden diese Gewohnheiten mit einem längeren Leben in Verbindung gebracht.",
    disclaimer: "Nur zu Bildungszwecken. Keine medizinische Beratung. Sprich mit einer Ärztin oder einem Arzt über deine Gesundheit.",
    print: "Drucken / als PDF speichern",
    download: "Herunterladen",
    email: "An mich selbst mailen",
    subject: "Mein Gewohnheitsplan von Longevity Modeler"
  },
  fr: {
    button: "Obtenir mon plan",
    note: "Gratuit. Sans e-mail ni compte. Imprimez-le, enregistrez-le ou envoyez-le-vous par e-mail.",
    title: "Votre plan d’habitudes",
    number: "Votre estimation",
    levers: "Vos 3 leviers principaux",
    weeks: "Un petit pas par semaine",
    week: function (n) { return "Semaine " + n; },
    weekStep: function (lever) { return "Commencez par un petit pas sur : " + lever + "."; },
    week4: "Continuez les trois. Refaites le calcul pour voir où vous en êtes.",
    none: "Vos habitudes semblent déjà solides. Continuez ainsi.",
    linked: "Dans les études, ces habitudes sont associées à une vie plus longue.",
    disclaimer: "À titre éducatif uniquement. Ceci n’est pas un avis médical. Parlez de votre santé à un médecin.",
    print: "Imprimer / enregistrer en PDF",
    download: "Télécharger",
    email: "Me l’envoyer par e-mail",
    subject: "Mon plan d’habitudes Longevity Modeler"
  },
  zh: {
    button: "获取我的计划",
    note: "免费。无需邮箱，无需账户。可打印、保存或发送到您自己的邮箱。",
    title: "您的习惯计划",
    number: "您的估算",
    levers: "您最重要的 3 个改进方向",
    weeks: "每周一小步",
    week: function (n) { return "第 " + n + " 周"; },
    weekStep: function (lever) { return "从这一项开始迈出一小步：" + lever + "。"; },
    week4: "三项都坚持下去。再次使用计算器，看看您的进展。",
    none: "您的习惯已经很不错了。继续保持。",
    linked: "研究显示，这些习惯与更长的寿命相关。",
    disclaimer: "仅供教育参考。这不是医疗建议。请就您自己的健康咨询医生。",
    print: "打印 / 另存为 PDF",
    download: "下载",
    email: "发送到我的邮箱",
    subject: "我的 Longevity Modeler 习惯计划"
  },
  pt: {
    button: "Obter meu plano",
    note: "Grátis. Sem email, sem conta. Imprima, salve ou envie para você mesmo por email.",
    title: "Seu plano de hábitos",
    number: "Sua estimativa",
    levers: "Suas 3 principais alavancas",
    weeks: "Um pequeno passo por semana",
    week: function (n) { return "Semana " + n; },
    weekStep: function (lever) { return "Comece com um pequeno passo em: " + lever + "."; },
    week4: "Mantenha os três. Use a calculadora de novo para ver onde você está.",
    none: "Seus hábitos já parecem fortes. Continue assim.",
    linked: "Em estudos, esses hábitos estão ligados a uma vida mais longa.",
    disclaimer: "Apenas para fins educativos. Não é aconselhamento médico. Converse com um médico sobre a sua saúde.",
    print: "Imprimir / salvar como PDF",
    download: "Baixar",
    email: "Enviar para mim por email",
    subject: "Meu plano de hábitos do Longevity Modeler"
  },
  ja: {
    button: "自分のプランを受け取る",
    note: "無料。メールアドレスもアカウントも不要です。印刷・保存するか、自分宛てにメールで送れます。",
    title: "あなたの習慣プラン",
    number: "あなたの推定値",
    levers: "重要な改善ポイント トップ3",
    weeks: "週に一つの小さな一歩",
    week: function (n) { return "第" + n + "週"; },
    weekStep: function (lever) { return "次の項目で小さな一歩を始めましょう：" + lever + "。"; },
    week4: "3つすべてを続けましょう。もう一度計算して、今の状況を確認しましょう。",
    none: "あなたの習慣はすでに良好です。この調子で続けましょう。",
    linked: "研究では、これらの習慣は長寿と関連しています。",
    disclaimer: "教育目的のみ。医学的助言ではありません。ご自身の健康については医師にご相談ください。",
    print: "印刷 / PDFとして保存",
    download: "ダウンロード",
    email: "自分にメールで送る",
    subject: "Longevity Modeler の習慣プラン"
  },
  ko: {
    button: "내 플랜 받기",
    note: "무료. 이메일도 계정도 필요 없습니다. 인쇄하거나 저장하거나 나에게 이메일로 보내세요.",
    title: "나의 습관 플랜",
    number: "나의 추정치",
    levers: "가장 중요한 3가지 개선 요소",
    weeks: "매주 작은 한 걸음",
    week: function (n) { return n + "주차"; },
    weekStep: function (lever) { return "이 항목에서 작은 한 걸음을 시작하세요: " + lever + "."; },
    week4: "세 가지 모두 계속하세요. 계산기를 다시 사용해 현재 상태를 확인하세요.",
    none: "이미 좋은 습관을 갖고 있습니다. 계속 유지하세요.",
    linked: "연구에서 이러한 습관은 더 긴 수명과 관련이 있습니다.",
    disclaimer: "교육 목적으로만 제공됩니다. 의학적 조언이 아닙니다. 본인의 건강에 대해서는 의사와 상담하세요.",
    print: "인쇄 / PDF로 저장",
    download: "다운로드",
    email: "나에게 이메일 보내기",
    subject: "나의 Longevity Modeler 습관 플랜"
  },
  ar: {
    button: "احصل على خطتي",
    note: "مجانًا. بلا بريد إلكتروني ولا حساب. اطبعها أو احفظها أو أرسلها إلى نفسك بالبريد الإلكتروني.",
    title: "خطة عاداتك",
    number: "تقديرك",
    levers: "أهم 3 عوامل لديك",
    weeks: "خطوة صغيرة كل أسبوع",
    week: function (n) { return "الأسبوع " + n; },
    weekStep: function (lever) { return "ابدأ بخطوة صغيرة في: " + lever + "."; },
    week4: "استمر في الثلاثة جميعًا. استخدم الحاسبة مرة أخرى لترى أين وصلت.",
    none: "عاداتك تبدو قوية بالفعل. استمر عليها.",
    linked: "ترتبط هذه العادات في الدراسات بعمر أطول.",
    disclaimer: "لأغراض تعليمية فقط. هذه ليست نصيحة طبية. تحدّث مع طبيب بشأن صحتك.",
    print: "طباعة / حفظ بصيغة PDF",
    download: "تنزيل",
    email: "أرسلها إلى بريدي",
    subject: "خطة عاداتي من Longevity Modeler"
  },
  hi: {
    button: "मेरा प्लान पाएँ",
    note: "मुफ़्त। न ईमेल, न खाता। इसे प्रिंट करें, सेव करें या खुद को ईमेल करें।",
    title: "आपकी आदतों की योजना",
    number: "आपका अनुमान",
    levers: "आपके 3 सबसे अहम सुधार",
    weeks: "हर हफ़्ते एक छोटा कदम",
    week: function (n) { return "हफ़्ता " + n; },
    weekStep: function (lever) { return "इस पर एक छोटा कदम शुरू करें: " + lever + "।"; },
    week4: "तीनों को जारी रखें। आप कहाँ हैं यह देखने के लिए कैलकुलेटर फिर से चलाएँ।",
    none: "आपकी आदतें पहले से अच्छी हैं। इन्हें जारी रखें।",
    linked: "अध्ययनों में ये आदतें लंबी उम्र से जुड़ी पाई गई हैं।",
    disclaimer: "केवल शैक्षिक उद्देश्य के लिए। यह चिकित्सीय सलाह नहीं है। अपने स्वास्थ्य के बारे में डॉक्टर से बात करें।",
    print: "प्रिंट करें / PDF के रूप में सेव करें",
    download: "डाउनलोड करें",
    email: "खुद को ईमेल करें",
    subject: "मेरी Longevity Modeler आदत योजना"
  },
  tr: {
    button: "Planımı al",
    note: "Ücretsiz. E-posta yok, hesap yok. Yazdırın, kaydedin veya kendinize e-postayla gönderin.",
    title: "Alışkanlık planınız",
    number: "Tahmininiz",
    levers: "En önemli 3 kaldıracınız",
    weeks: "Haftada küçük bir adım",
    week: function (n) { return n + ". Hafta"; },
    weekStep: function (lever) { return "Şu konuda küçük bir adımla başlayın: " + lever + "."; },
    week4: "Üçünü de sürdürün. Nerede olduğunuzu görmek için hesaplayıcıyı yeniden kullanın.",
    none: "Alışkanlıklarınız zaten güçlü görünüyor. Böyle devam edin.",
    linked: "Araştırmalarda bu alışkanlıklar daha uzun bir yaşamla ilişkilendirilmiştir.",
    disclaimer: "Yalnızca eğitim amaçlıdır. Tıbbi tavsiye değildir. Kendi sağlığınız hakkında bir doktorla konuşun.",
    print: "Yazdır / PDF olarak kaydet",
    download: "İndir",
    email: "Kendime e-postayla gönder",
    subject: "Longevity Modeler alışkanlık planım"
  },
  nl: {
    button: "Mijn plan ophalen",
    note: "Gratis. Geen e-mail, geen account. Print het, sla het op of mail het naar jezelf.",
    title: "Jouw gewoonteplan",
    number: "Jouw schatting",
    levers: "Jouw 3 belangrijkste hefbomen",
    weeks: "Elke week één kleine stap",
    week: function (n) { return "Week " + n; },
    weekStep: function (lever) { return "Begin met één kleine stap bij: " + lever + "."; },
    week4: "Houd alle drie vol. Gebruik de calculator opnieuw om te zien waar je staat.",
    none: "Je gewoonten zien er al sterk uit. Ga zo door.",
    linked: "In onderzoek worden deze gewoonten in verband gebracht met een langer leven.",
    disclaimer: "Alleen voor educatieve doeleinden. Dit is geen medisch advies. Praat met een arts over je eigen gezondheid.",
    print: "Printen / opslaan als PDF",
    download: "Downloaden",
    email: "Naar mezelf mailen",
    subject: "Mijn Longevity Modeler-gewoonteplan"
  },
  sv: {
    button: "Hämta min plan",
    note: "Gratis. Ingen e-post, inget konto. Skriv ut den, spara den eller mejla den till dig själv.",
    title: "Din vanplan",
    number: "Din uppskattning",
    levers: "Dina 3 viktigaste hävstänger",
    weeks: "Ett litet steg i veckan",
    week: function (n) { return "Vecka " + n; },
    weekStep: function (lever) { return "Börja med ett litet steg inom: " + lever + "."; },
    week4: "Fortsätt med alla tre. Använd kalkylatorn igen för att se var du står.",
    none: "Dina vanor ser redan starka ut. Fortsätt så.",
    linked: "I studier är dessa vanor kopplade till ett längre liv.",
    disclaimer: "Endast i utbildningssyfte. Detta är inte medicinsk rådgivning. Prata med en läkare om din egen hälsa.",
    print: "Skriv ut / spara som PDF",
    download: "Ladda ner",
    email: "Mejla till mig själv",
    subject: "Min vanplan från Longevity Modeler"
  }
};

function planCopy(lang) { return PLAN_COPY[lang] || PLAN_COPY.en; }

function escapeHtml(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

// data: { number: '85.5 years', levers: [{ title, tip }] }
function buildPlanText(data, lang) {
  var c = planCopy(lang);
  var levers = (data.levers || []).slice(0, 3);
  var lines = [c.title, '', c.number + ': ' + (data.number || '--'), '', c.levers + ':'];
  if (!levers.length) lines.push('- ' + c.none);
  levers.forEach(function (l, i) { lines.push((i + 1) + '. ' + l.title + (l.tip ? ' — ' + l.tip : '')); });
  lines.push('', c.weeks + ':');
  for (var w = 1; w <= 3; w++) {
    var lv = levers[w - 1] || levers[0];
    lines.push(c.week(w) + ': ' + (lv ? c.weekStep(lv.title) : c.none));
  }
  lines.push(c.week(4) + ': ' + c.week4, '', c.linked, c.disclaimer, '', 'https://longevitymodeler.com');
  return lines.join('\n');
}

function buildPlanHtml(data, lang) {
  var c = planCopy(lang);
  var text = buildPlanText(data, lang);
  var body = text.split('\n').map(function (l) { return l ? '<p>' + escapeHtml(l) + '</p>' : ''; }).join('');
  var dir = lang === 'ar' && PLAN_COPY.ar ? ' dir="rtl"' : '';
  return '<!doctype html><html lang="' + escapeHtml(PLAN_COPY[lang] ? lang : 'en') + '"' + dir + '><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width,initial-scale=1"><title>' + escapeHtml(c.title) + '</title>' +
    '<style>body{font-family:system-ui,sans-serif;max-width:640px;margin:24px auto;padding:0 16px;line-height:1.5;color:#111}p{margin:4px 0}</style>' +
    '</head><body>' + body + '</body></html>';
}

function buildPlanMailto(data, lang) {
  var c = planCopy(lang);
  // No address: the visitor types their own. Nothing is sent or stored by the site.
  return 'mailto:?subject=' + encodeURIComponent(c.subject) + '&body=' + encodeURIComponent(buildPlanText(data, lang));
}

if (typeof document !== 'undefined') {
  (function () {
    function lang() { try { return currentLanguage; } catch (e) { return 'en'; } }
    function readResult() {
      var num = (document.getElementById('lifespanValue') || {}).textContent || '';
      var cards = document.querySelectorAll('#recommendationChips .lever-card');
      var levers = Array.prototype.map.call(cards, function (card) {
        var t = card.querySelector('h4 span:not(.lever-rank)');
        var tip = card.querySelector('.lever-tip');
        return { title: t ? t.textContent.trim() : '', tip: tip ? tip.textContent.trim() : '' };
      });
      return { number: num.trim(), levers: levers };
    }
    function refreshLabels() {
      var c = planCopy(lang());
      var b = document.getElementById('getMyPlanButton');
      var n = document.getElementById('getMyPlanNote');
      if (b) b.textContent = c.button;
      if (n) n.textContent = c.note;
    }
    function openPlan() {
      var l = lang(), c = planCopy(l), data = readResult();
      var html = buildPlanHtml(data, l);
      var url = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
      var box = document.getElementById('getMyPlanActions');
      box.innerHTML = '';
      function add(label, href, extra) {
        var a = document.createElement('a');
        a.className = 'get-my-plan-link';
        a.href = href; a.textContent = label;
        if (extra) extra(a);
        box.appendChild(a);
      }
      add(c.print, url, function (a) { a.target = '_blank'; a.rel = 'noopener'; });
      add(c.download, url, function (a) { a.download = 'my-habit-plan.html'; });
      add(c.email, buildPlanMailto(data, l));
      box.hidden = false;
      box.style.display = 'flex';
    }
    function init() {
      var b = document.getElementById('getMyPlanButton');
      if (!b) return;
      b.addEventListener('click', openPlan);
      refreshLabels();
      if (typeof applyLanguage === 'function' && !applyLanguage.__planWrapped) {
        var orig = applyLanguage;
        var wrapped = function (x) { var r = orig.apply(this, arguments); refreshLabels(); var a = document.getElementById('getMyPlanActions'); if (a) { a.hidden = true; a.style.display = ''; a.innerHTML = ''; } return r; };
        wrapped.__planWrapped = true;
        applyLanguage = wrapped;
        try { window.applyLanguage = wrapped; } catch (e) {}
      }
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  })();
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PLAN_COPY: PLAN_COPY, buildPlanText: buildPlanText, buildPlanHtml: buildPlanHtml, buildPlanMailto: buildPlanMailto, planCopy: planCopy };
}
