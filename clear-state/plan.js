/* Clear State, Version 3. Der Nutzer baut seinen Plan selbst.
   Lead wie der 3-Tage-Starter: register_tripwire_lead und register_lead.
   Flow-Name clearstate_flow. Bausteine und Einwilligungen liegen in
   p_onboarding_data. Kein neues Datenbankfeld. */
(function () {
  "use strict";

  var SUPABASE_URL = "https://jztwnumtwihomgxwlwor.supabase.co";
  var SUPABASE_ANON_KEY = "sb_publishable_yWcwDruITLbaok1rBl4Fiw_Ddjn9xZe";
  var FLOW = "clearstate_flow";
  var WA_NUMBER = "491632225456";
  var BOT_MESSAGE = "Hallo, ich möchte meinen Clear-State-Plan starten. Bitte aktiviere meinen Zugang.";
  var ACCESS_LABEL = "Mein Zugangscode:";
  var STORE = "smh_clearstate_v3";

  var MAIL_TEXT = "Schick mir meinen Plan per Mail. Die Datenschutzerklärung hab ich gelesen. Ich kann mich jederzeit abmelden.";
  var WA_TEXT = "Schick mir zusätzlich 3 Tage lang eine Aufgabe pro Tag per WhatsApp. Danach noch eine Nachricht mit einem Angebot für ein Gespräch. Mit STOP höre ich jederzeit auf.";
  var EIGEN_TEXT = "Ich mache die Übungen auf eigene Verantwortung. Sie ersetzen keinen Arzt.";

  var MUSTER = [
    { id: "a", label: "Ich arbeite abends weiter, obwohl Feierabend ist.", dann: "arbeit ich abends weiter", tag: "wenn du heute nach Feierabend den Laptop aufmachen willst" },
    { id: "b", label: "Ich greif ständig zum Handy.", dann: "greif ich zum Handy", tag: "wenn du heute zum Handy greifst, ohne dass was war" },
    { id: "c", label: "Im Bett geht das Grübeln los.", dann: "geht im Bett das Grübeln los", tag: "wenn du heute im Bett anfängst zu grübeln" },
    { id: "d", label: "Ich werd schnell gereizt oder laut.", dann: "werd ich kurz angebunden oder laut", tag: "wenn du heute merkst, dass die Stimme kürzer wird" },
    { id: "e", label: "Ich schieb wichtige Sachen vor mir her.", dann: "schieb ich die Sache weiter", tag: "wenn du heute was wegschiebst" },
    { id: "f", label: "Ich brauch abends Bier, Wein oder Snacks, um runterzukommen.", dann: "hol ich mir Bier, Wein oder was zu essen", tag: "wenn du heute abends zum Kühlschrank gehst" }
  ];

  var OFT = [
    { id: "0", label: "An keinem Abend", satz: "an keinem Abend" },
    { id: "12", label: "An 1 bis 2 Abenden", satz: "an ein bis zwei Abenden" },
    { id: "34", label: "An 3 bis 4 Abenden", satz: "an drei bis vier Abenden" },
    { id: "56", label: "An 5 bis 6 Abenden", satz: "an fünf bis sechs Abenden" },
    { id: "jeden", label: "An jedem Abend", satz: "an jedem Abend" }
  ];

  var SEIT = [
    { id: "wochen", label: "Ein paar Wochen", satz: "ein paar Wochen" },
    { id: "monate", label: "Ein paar Monate", satz: "ein paar Monate" },
    { id: "jahre", label: "Ein, zwei Jahre", satz: "ein, zwei Jahre" },
    { id: "laenger", label: "Länger", satz: "länger als zwei Jahre" }
  ];

  var VERSUCHT = [
    { id: "nein", label: "Nein" },
    { id: "einmal", label: "Ja, einmal" },
    { id: "oefter", label: "Ja, öfter" }
  ];

  var AUSLOESER = [
    { id: "allein", label: "Ein voller Tag, und ich bin endlich allein", kurz: "ich nach einem vollen Tag endlich allein bin" },
    { id: "mail", label: "Eine Mail oder Nachricht vom Job", kurz: "eine Mail oder Nachricht vom Job kommt" },
    { id: "gespraech", label: "Ein Gespräch, das nicht gut lief", kurz: "ein Gespräch nicht gut lief" },
    { id: "langeweile", label: "Langeweile, nichts los", kurz: "Langeweile da ist" },
    { id: "muede", label: "Ich bin müde, aber nicht ruhig", kurz: "ich müde bin, aber nicht ruhig" },
    { id: "offen", label: "Ich denk an etwas, das noch offen ist", kurz: "ich an etwas denke, das noch offen ist" },
    { id: "unklar", label: "Weiß ich nicht genau", kurz: "ich den Auslöser nicht genau benennen kann" }
  ];

  var KOERPER = [
    { id: "brust", label: "Brust eng, Atmung flach", kurz: "die Brust eng und die Atmung flach", typ: "strom" },
    { id: "kiefer", label: "Kiefer oder Schultern fest", kurz: "Kiefer oder Schultern fest", typ: "strom" },
    { id: "bauch", label: "Unruhe in Bauch oder Beinen", kurz: "Unruhe in Bauch oder Beinen", typ: "strom" },
    { id: "kopf", label: "Kopf voll, Gedanken rasen", kurz: "den Kopf voll", typ: "strom" },
    { id: "platt", label: "Eher schwer und platt", kurz: "mich eher schwer und platt", typ: "spar" },
    { id: "kaum", label: "Merk ich gar nicht", kurz: "im Körper kaum was", typ: "auto" }
  ];

  var BEDUERFNIS = [
    { id: "sicherheit", label: "Ich hab dann das Gefühl, alles im Griff zu haben.", satz: "das Gefühl, alles im Griff zu haben", aha: "Das ist kein Problem mit Disziplin. Dein Kopf holt sich Sicherheit." },
    { id: "selbst", label: "Endlich bestimm ich mal selbst, was ich mache.", satz: "ein Stück Freiheit, das dir sonst keiner gibt", aha: "Den ganzen Tag bestimmen andere. Das Muster ist dein Stück Freiheit." },
    { id: "bindung", label: "Ich fühl mich weniger allein.", satz: "das Gefühl, nicht ganz allein zu sein", aha: "Dahinter steckt der Wunsch nach Nähe. Ein Verbot füllt die Stille nicht." },
    { id: "anerkennung", label: "Ich hab das Gefühl, ich leiste was und bin wer.", satz: "das Gefühl, dass du was leistest", aha: "Dein Kopf will spüren, dass du was taugst. Du brauchst einen anderen Beweis, keinen Verzicht." },
    { id: "ausgleich", label: "Ich hab's mir verdient nach dem Tag.", satz: "einen Ausgleich für einen Tag, an dem du mehr gegeben hast, als zurückkam", aha: "Dir steht ein Ausgleich zu. Nur kostet dich diese Art am nächsten Tag mehr." },
    { id: "sinn", label: "Es lenkt mich ab von der Frage, wofür das alles ist.", satz: "eine Pause von der Frage, wofür das alles ist", aha: "Das Muster ist eine Pause von einer großen Frage. Solange die Frage offen ist, kommt es wieder." }
  ];

  var PREIS = [
    { id: "schlaf", label: "Schlaf und Energie" },
    { id: "gesundheit", label: "Gesundheit" },
    { id: "job", label: "Klarheit und Leistung im Job" },
    { id: "leute", label: "Zeit mit Leuten, die mir wichtig sind" },
    { id: "respekt", label: "Respekt vor mir selbst" },
    { id: "spass", label: "Spaß am Leben" }
  ];

  var STOPP = [
    { id: "wort", label: "Ein Stoppwort im Kopf und einmal lang ausatmen" },
    { id: "raum", label: "Aufstehen und den Raum wechseln" },
    { id: "wasser", label: "Kaltes Wasser ins Gesicht", note: "Nur, wenn Herz und Blutdruck mitmachen." },
    { id: "knie", label: "10 Kniebeugen oder kurz raus an die Luft" }
  ];

  var HUERDE = {
    a: [
      { id: "a1", label: "Laptop nach Feierabend in den Rucksack und in den Flur" },
      { id: "a2", label: "Job-Mail auf dem Handy abmelden" }
    ],
    b: [
      { id: "b1", label: "Handy ab 21 Uhr in einen anderen Raum" },
      { id: "b2", label: "Apps vom Startbildschirm nehmen" }
    ],
    c: [
      { id: "c1", label: "Handy und Laptop nicht im Schlafzimmer" },
      { id: "c2", label: "Zettel und Stift neben dem Bett" }
    ],
    d: [
      { id: "d1", label: "Nach dem Heimkommen 10 Minuten nichts besprechen" },
      { id: "d2", label: "Handy-Benachrichtigungen ab 19 Uhr aus" }
    ],
    e: [
      { id: "e1", label: "Die Sache vorm Feierabend schon aufklappen und offen lassen" },
      { id: "e2", label: "Ablenkungstabs schließen" }
    ],
    f: [
      { id: "f1", label: "Nicht auf Vorrat kaufen" },
      { id: "f2", label: "Was anderes Kaltes trinken in den Kühlschrank stellen" }
    ]
  };

  var ERSATZ = {
    sicherheit: [
      { id: "s1", label: "Offenes in 5 Minuten aufschreiben und jeder Sache eine Uhrzeit geben" },
      { id: "s2", label: "Kurzer Tagesabschluss: Was ist erledigt, was kommt morgen?" }
    ],
    selbst: [
      { id: "e1", label: "20 Minuten am Abend, die nur dir gehören" },
      { id: "e2", label: "Morgen eine Sache selbst festlegen, bevor andere den Tag bestimmen" }
    ],
    bindung: [
      { id: "b1", label: "Einen Menschen anrufen statt scrollen" },
      { id: "b2", label: "Ein festes Treffen pro Woche" }
    ],
    anerkennung: [
      { id: "a1", label: "Drei Sachen aufschreiben, die heute gut waren" },
      { id: "a2", label: "Eine Sache zu Ende bringen statt fünf anfangen" }
    ],
    ausgleich: [
      { id: "u1", label: "Eine echte Belohnung, die dir guttut: Sauna, gutes Essen oder ein Spaziergang" },
      { id: "u2", label: "Eine Grenze im Job klar ansprechen" }
    ],
    sinn: [
      { id: "n1", label: "5 Minuten still sitzen und fragen: Wofür mach ich das?" },
      { id: "n2", label: "Eine Stunde pro Woche für etwas, das dir früher wichtig war" }
    ]
  };

  var DAUER = [
    { id: "1", label: "1 Minute" },
    { id: "2", label: "2 Minuten" },
    { id: "5", label: "5 Minuten" },
    { id: "10", label: "10 Minuten" }
  ];

  var SAETZE = [
    { id: "abend", label: "Ich bin einer, der abends abschalten kann." },
    { id: "feierabend", label: "Ich bin einer, der Feierabend macht, wenn Feierabend ist." },
    { id: "ruhig", label: "Ich bin einer, der ruhig bleibt, wenn es eng wird." },
    { id: "durch", label: "Ich bin einer, der durchzieht, was er sich vornimmt." },
    { id: "da", label: "Ich bin einer, der da ist, wo er gerade ist." }
  ];

  var STATEMENTS = [
    { phase: "erkennen", text: "Ich merk oft erst hinterher, dass ich wieder im alten Muster war." },
    { phase: "erkennen", text: "Ich weiß eigentlich nicht genau, warum ich das mache." },
    { phase: "unterbrechen", text: "Ich merk es im Moment, aber ich mach trotzdem weiter." },
    { phase: "unterbrechen", text: "Wenn der Druck da ist, ist mein Kopf zu schnell für gute Vorsätze." },
    { phase: "neu", text: "Ich lass das Alte weg, aber dann fehlt mir was." },
    { phase: "neu", text: "Ich fang gut an, und nach ein paar Tagen ist es wieder weg." },
    { phase: "verankern", text: "Wenn es mal klappt, fühlt es sich an, als würde ich mich verstellen." },
    { phase: "verankern", text: "Ein schlechter Tag reicht, und ich denk: Ich bin halt so." }
  ];

  var ENG = {
    erkennen: {
      name: "Erkennen",
      baustein: "deinem Muster",
      text: "Meist merkst du erst hinterher, dass es wieder passiert ist. Deshalb fängst du mit Zählen an, nicht mit Verzicht.",
      tage: "Die ersten Tage zählst du nur und merkst dir, wo im Körper du es gespürt hast."
    },
    unterbrechen: {
      name: "Unterbrechen",
      baustein: "deinem Stopp",
      text: "Du merkst es im Moment, und trotzdem läuft es weiter. Du brauchst einen Stopp über den Körper, und eine Hürde, die das Alte umständlicher macht.",
      tage: "Die ersten Tage machst du den Stopp, auch einmal ohne Anlass."
    },
    neu: {
      name: "Neu einüben",
      baustein: "deinem Ersatz",
      text: "Du schaffst es ein paar Tage, dann ist es wieder da. Wenn du nur weglässt, fehlt dir was. Dein Ersatz muss so klein sein, dass er auch an einem schlechten Tag geht.",
      tage: "Die ersten Tage machst du den Ersatz kleiner als geplant. Eine Minute zählt."
    },
    verankern: {
      name: "Verankern",
      baustein: "deinem Satz",
      text: "Du kannst es eigentlich. Es fühlt sich noch nach Anstrengung an. Jeden Abend ein Strich, und einmal kurz dein Satz. Ein schlechter Tag zählt nicht als Beweis.",
      tage: "Die ersten Tage zählst du die Striche. Jeder ist ein Beweis für deinen Satz."
    },
    laeuft: {
      name: "Läuft schon",
      baustein: "deinem Satz",
      text: "Bei dir greift das meiste schon. Es geht jetzt darum, es auch in vollen Wochen zu halten.",
      tage: "Halt die Regel auch in einer vollen Woche. Dann sitzt sie."
    }
  };

  var KOERPER_TEXT = {
    strom: "Dein Körper ist abends noch im Alarm. Was hilft: lang ausatmen, bewegen, den Raum wechseln.",
    spar: "Dein Körper ist eher leer als ruhig. Platt sein ist nicht dasselbe wie entspannt sein. Was hilft: kurz in Bewegung kommen, raus an die Luft, dann erst runterfahren.",
    auto: "Du merkst im Körper kaum was. Das Signal ist noch leise. Was hilft: dreimal am Tag kurz innehalten und fragen, wo du gerade angespannt bist."
  };

  var STEPS = [
    { id: "muster", block: 1, type: "one", key: "muster", h: "Was davon nervt dich gerade am meisten?", sub: "Tipp eins an.", options: MUSTER },
    { id: "oft", block: 1, type: "one", key: "oft", h: "An wie vielen Abenden letzte Woche ist das passiert?", sub: "Ehrlich, ohne schönreden.", options: OFT },
    { id: "seit", block: 1, type: "one", key: "seit", h: "Wie lange geht das schon so?", options: SEIT },
    { id: "versucht", block: 1, type: "one", key: "versucht", h: "Hast du schon mal versucht, das zu ändern?", options: VERSUCHT },
    { id: "ausloeser", block: 1, type: "multi", key: "ausloeser", h: "Was passiert meistens kurz davor?", sub: "Tipp an, was passt. Mehrere gehen.", options: AUSLOESER },
    { id: "koerper", block: 1, type: "one", key: "koerper", h: "Wo merkst du es zuerst im Körper?", options: KOERPER },
    { id: "beduerfnis", block: 1, type: "one", key: "beduerfnis", h: "Was bringt es dir am ehesten?", sub: "Jedes Muster bringt dir was. Sonst würdest du es nicht machen.", options: BEDUERFNIS },
    { id: "preis", block: 1, type: "one", key: "preis", h: "Wenn es noch ein Jahr genau so weitergeht: Was kostet es dich am meisten?", options: PREIS },
    { id: "atem", block: 2, type: "atem", h: "Mach das jetzt einmal mit. 30 Sekunden.", sub: "Zweimal kurz durch die Nase ein. Dann lang durch den Mund aus. Dreimal." },
    { id: "stopp", block: 2, type: "one", key: "stopp", h: "Wenn der Moment kommt: Was würdest du wirklich machen?", options: STOPP },
    { id: "ersatz", block: 3, type: "one", key: "ersatz", h: "Was davon passt als Ersatz?", options: function () { return ERSATZ[state.beduerfnis] || []; } },
    { id: "dauer", block: 3, type: "one", key: "dauer", h: "Wie viel schaffst du an einem schlechten Tag?", sub: "Mach es so klein, dass du keine Ausrede findest.", options: DAUER },
    { id: "regel", block: 4, type: "regel", h: "So sieht deine Regel aus. Passt sie?", sub: "Du kannst sie ändern." },
    { id: "huerde", block: 4, type: "huerde", h: "Was würde das alte Muster umständlicher machen?", sub: "Tipp eins an, oder schreib deins." },
    { id: "satz", block: 5, type: "satz", h: "Wie willst du in vier Wochen über dich sagen können?", sub: "Tipp eins an, oder schreib deinen Satz." },
    { id: "engpass", block: 0, type: "scale", h: "Wo bleibst du hängen?", sub: "Acht kurze Sätze. 1 heißt gar nicht. 5 heißt genau." },
    { id: "plan", block: 0, type: "plan", h: "Dein fertiger Plan" },
    { id: "signup", block: 0, type: "signup", h: "Soll ich dir deinen Plan schicken?" },
    { id: "danke", block: 0, type: "danke", h: "Danke." }
  ];

  var state = blank();
  var stepIndex = 0;
  var timer = null;
  var params = new URLSearchParams(location.search);

  function blank() {
    return {
      muster: null, oft: null, seit: null, versucht: null,
      ausloeser: [], koerper: null, beduerfnis: null, preis: null,
      atem: null, stopp: null, ersatz: null, dauer: null,
      regelWenn: "", regelDann: "", huerde: null, huerdeFrei: "",
      satz: null, satzFrei: "", phasen: [0, 0, 0, 0, 0, 0, 0, 0],
      landed_at: null
    };
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function byId(list, id) {
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }

  function el(id) { return document.getElementById(id); }

  function save() {
    try {
      sessionStorage.setItem(STORE, JSON.stringify({ step: STEPS[stepIndex].id, state: state }));
    } catch (e) { /* privates Fenster */ }
  }

  function load() {
    try {
      var raw = sessionStorage.getItem(STORE);
      if (!raw) return false;
      var data = JSON.parse(raw);
      if (!data || !data.state) return false;
      state = data.state;
      if (!Array.isArray(state.ausloeser)) state.ausloeser = [];
      if (!Array.isArray(state.phasen) || state.phasen.length !== 8) state.phasen = [0, 0, 0, 0, 0, 0, 0, 0];
      state.phasen = state.phasen.map(function (n) { return Number(n) || 0; });
      var idx = 0;
      STEPS.forEach(function (s, i) { if (s.id === data.step) idx = i; });
      stepIndex = idx;
      return true;
    } catch (e) { return false; }
  }

  function musterObj() { return byId(MUSTER, state.muster); }
  function oftObj() { return byId(OFT, state.oft); }
  function seitObj() { return byId(SEIT, state.seit); }
  function koerperObj() { return byId(KOERPER, state.koerper); }
  function bedObj() { return byId(BEDUERFNIS, state.beduerfnis); }
  function preisObj() { return byId(PREIS, state.preis); }
  function stoppObj() { return byId(STOPP, state.stopp); }
  function dauerObj() { return byId(DAUER, state.dauer); }
  function ersatzObj() {
    var list = ERSATZ[state.beduerfnis] || [];
    return byId(list, state.ersatz);
  }
  function ausloeserObj() {
    var id = state.ausloeser[0];
    return id ? byId(AUSLOESER, id) : null;
  }

  function huerdeText() {
    if (state.huerde === "eigen") return (state.huerdeFrei || "").trim();
    var list = HUERDE[state.muster] || [];
    var hit = byId(list, state.huerde);
    return hit ? hit.label : "";
  }

  function satzText() {
    if (state.satz === "eigen") {
      var t = (state.satzFrei || "").trim();
      if (!t) return "";
      if (/^ich bin einer, der/i.test(t)) return t.charAt(0).toUpperCase() + t.slice(1);
      return "Ich bin einer, der " + t.replace(/^\.+/, "");
    }
    var hit = byId(SAETZE, state.satz);
    return hit ? hit.label : "";
  }

  function musterText() {
    var m = musterObj();
    var a = ausloeserObj();
    var k = koerperObj();
    var b = bedObj();
    if (m && a && k && b) {
      return "Wenn " + a.kurz + ", merk ich " + k.kurz + ", dann " + m.dann + ". Das holt mir " + b.satz + ".";
    }
    return m ? m.label : "";
  }

  function regelSatz() {
    var wenn = (state.regelWenn || "").trim();
    var dann = (state.regelDann || "").trim();
    if (!wenn || !dann) return "";
    var h = huerdeText();
    var line = "Wenn " + wenn + ", dann " + dann + ".";
    if (h) line += " Damit es leichter wird: " + h + ".";
    return line;
  }

  function fixDann(s, e, d) {
    var stopp = s ? s.label : "";
    var rest = "";
    if (e && d) rest = e.label + " für " + d.label;
    else if (e) rest = e.label;
    if (stopp && rest) return stopp + " und danach " + rest;
    return stopp || rest;
  }

  function scores() {
    var s = { erkennen: 0, unterbrechen: 0, neu: 0, verankern: 0 };
    STATEMENTS.forEach(function (st, i) { s[st.phase] += Number(state.phasen[i] || 0); });
    if (state.koerper === "kaum") s.erkennen += 2;
    if (state.versucht === "oefter") s.neu += 1;
    if (state.seit === "laenger") s.verankern += 1;
    return s;
  }

  function engpassId() {
    var s = scores();
    var order = ["erkennen", "unterbrechen", "neu", "verankern"];
    var low = order.every(function (k) { return s[k] <= 4; });
    if (low) return "laeuft";
    var best = order[0];
    order.forEach(function (k) { if (s[k] > s[best]) best = k; });
    return best;
  }

  function koerperTyp() {
    var k = koerperObj();
    return k ? k.typ : "";
  }

  function planRows() {
    var b = bedObj();
    var stoppLine = stoppObj() ? stoppObj().label : "";
    var ersatzLine = "";
    if (ersatzObj() && dauerObj()) ersatzLine = ersatzObj().label + ", " + dauerObj().label;
    else if (ersatzObj()) ersatzLine = ersatzObj().label;
    return [
      { name: "Muster", on: !!musterText(), text: musterText() || "noch offen", aha: b && state.preis ? b.aha : "" },
      { name: "Stopp", on: !!stoppLine, text: stoppLine || "noch offen", aha: stoppLine ? (state.atem === "unruhiger" ? "Die Atemübung war gerade eher unangenehm. Ein Stopp über den Raum geht dann oft leichter." : "Ein Vorsatz ist zu langsam, wenn der Alarm schon läuft. Ein Stopp über den Körper geht schneller.") : "" },
      { name: "Ersatz", on: !!ersatzLine, text: ersatzLine || "noch offen", aha: dauerObj() ? "Wenn du nur weglässt, fehlt dir was. Dann kommt das Alte zurück." : "" },
      { name: "Regel und Hürde", on: !!regelSatz(), text: regelSatz() || "noch offen", aha: huerdeText() ? "Die Hürde macht das Alte umständlicher. Dann muss der Stopp weniger kämpfen." : "" },
      { name: "Satz", on: !!satzText(), text: satzText() || "noch offen", aha: satzText() ? "Der Satz sitzt, wenn du ihn an etwas hängst, das du wirklich getan hast." : "" }
    ];
  }

  var planSeen = false;
  var planFilled = {};
  var planOpen = false;
  var flashText = "";
  var flashUntil = 0;
  var flashTimer = null;
  var FLASH = {
    "Muster": "Muster steht.",
    "Stopp": "Stopp steht.",
    "Ersatz": "Ersatz steht.",
    "Regel und Hürde": "Regel steht.",
    "Satz": "Satz steht."
  };

  function renderPlan() {
    var box = el("cs-plan");
    if (!box) return;
    var rows = planRows();
    var on = rows.filter(function (r) { return r.on; }).length;
    var newly = "";
    rows.forEach(function (r) {
      if (r.on && planSeen && !planFilled[r.name]) newly = r.name;
      planFilled[r.name] = !!r.on;
    });
    planSeen = true;
    if (newly) {
      flashText = FLASH[newly] || (newly + " steht.");
      flashUntil = Date.now() + 1600;
    }
    var showFlash = !!(flashText && Date.now() < flashUntil);
    var html = '<button type="button" class="cs-plan__toggle" aria-expanded="' + (planOpen ? "true" : "false") + '" aria-controls="cs-rows"><span class="cs-plan__title">Dein Plan (' + on + '/5)</span><span class="cs-plan__chev" aria-hidden="true"></span></button>';
    html += '<p class="cs-flash"' + (showFlash ? "" : " hidden") + ">" + esc(showFlash ? flashText : "") + "</p>";
    html += '<ol class="cs-rows" id="cs-rows">';
    rows.forEach(function (r) {
      html += '<li class="cs-row ' + (r.on ? "is-on" : "is-off") + '"><span class="cs-row__name">' + esc(r.name) + '</span><p class="cs-row__text">' + esc(r.text) + "</p>";
      if (r.aha) html += '<p class="cs-aha">' + esc(r.aha) + "</p>";
      html += "</li>";
    });
    html += "</ol>";
    box.innerHTML = html;
    box.classList.toggle("is-open", planOpen);
    box.classList.toggle("is-confirmed", showFlash);
    box.setAttribute("aria-label", "Dein Plan, " + on + " von 5 Bausteinen");
    if (showFlash) {
      clearTimeout(flashTimer);
      flashTimer = setTimeout(function () {
        if (Date.now() < flashUntil) return;
        box.classList.remove("is-confirmed");
        var flash = box.querySelector(".cs-flash");
        if (flash && flash.textContent === flashText) flash.hidden = true;
      }, Math.max(200, flashUntil - Date.now() + 40));
    }
    var toggle = box.querySelector(".cs-plan__toggle");
    if (toggle) toggle.addEventListener("click", function () {
      planOpen = !planOpen;
      box.classList.toggle("is-open", planOpen);
      toggle.setAttribute("aria-expanded", planOpen ? "true" : "false");
    });
  }

  function progressLabel(step) {
    if (step.block >= 1 && step.block <= 5) return "Baustein " + step.block + " von 5";
    if (step.id === "engpass") return "Wo du hängen bleibst";
    if (step.id === "plan") return "Dein nächster Schritt";
    if (step.id === "signup" || step.id === "danke") return "Dein Plan";
    return "";
  }

  function choiceHtml(opt, pressed, multi) {
    return '<button type="button" class="choicecard cs-choice" data-id="' + esc(opt.id) + '" aria-pressed="' + (pressed ? "true" : "false") + '">' +
      '<span class="choicecard__mark' + (multi ? " choicecard__mark--box" : "") + '"></span>' +
      '<span class="choicecard__text"><strong>' + esc(opt.label) + "</strong>" +
      (opt.note ? "<small>" + esc(opt.note) + "</small>" : "") +
      "</span></button>";
  }

  function optionsOf(step) {
    return typeof step.options === "function" ? step.options() : step.options;
  }

  function stopTimer() {
    if (timer) { clearInterval(timer); timer = null; }
  }

  function go(delta) {
    stopTimer();
    var next = stepIndex + delta;
    if (next < 0 || next >= STEPS.length) return;
    stepIndex = next;
    if (STEPS[stepIndex].id === "regel" && delta > 0) {
      var d = defaultRegelBits();
      state.regelWenn = d.wenn;
      state.regelDann = d.dann;
    }
    save();
    render();
    focusQuestion();
  }

  function focusQuestion() {
    window.requestAnimationFrame(function () {
      var q = document.querySelector("#cs-step .cs-progress") || document.querySelector("#cs-step h2");
      if (!q) return;
      var rect = q.getBoundingClientRect();
      var top = 96;
      var bottom = window.innerHeight - 24;
      var plan = el("cs-plan");
      if (plan && plan.getBoundingClientRect().height) {
        var pr = plan.getBoundingClientRect();
        if (pr.top > window.innerHeight * 0.45) bottom = pr.top - 16;
      }
      if (rect.top >= top && rect.top <= bottom - 72) return;
      window.scrollTo({ top: Math.max(0, window.scrollY + rect.top - top), behavior: "smooth" });
    });
  }

  function defaultRegelBits() {
    var a = ausloeserObj();
    return { wenn: a ? a.kurz : "", dann: fixDann(stoppObj(), ersatzObj(), dauerObj()) };
  }

  function render() {
    renderPlan();
    var host = el("cs-step");
    var step = STEPS[stepIndex];
    var planBox = el("cs-plan");
    if (planBox && step && step.id === "danke") planBox.classList.remove("is-locked");
    if (planBox && step && (step.id === "plan" || step.id === "signup")) {
      planBox.classList.add("is-locked");
      planOpen = false;
      planBox.classList.remove("is-open");
      var lockedToggle = planBox.querySelector(".cs-plan__toggle");
      if (lockedToggle) lockedToggle.setAttribute("aria-expanded", "false");
      planBox.querySelectorAll(".cs-rows").forEach(function (node) {
        node.setAttribute("aria-hidden", "true");
      });
      var flash = planBox.querySelector(".cs-flash");
      if (flash) {
        flash.hidden = false;
        flash.textContent = "Dein Plan ist noch zu.";
        flash.classList.add("cs-lock");
      }
    }
    if (!host || !step) return;
    var html = '<div class="cs-step">';
    var prog = progressLabel(step);
    if (prog) html += '<p class="cs-progress">' + esc(prog) + "</p>";
    html += "<h2>" + esc(stepTitle(step)) + "</h2>";
    if (stepSub(step)) html += '<p class="cs-sub">' + esc(stepSub(step)) + "</p>";
    html += bodyOf(step);
    html += '<p class="err" id="cs-error" role="alert"></p>';
    html += "</div>";
    host.innerHTML = html;
    bind(step);
  }

  function stepTitle(step) {
    if (step.id === "ersatz") {
      var b = bedObj();
      return b ? "Dein Muster holt dir " + b.satz + ". Das brauchst du weiter, nur auf einem anderen Weg. Was davon passt?" : step.h;
    }
    if (step.id === "danke" && state.vorname) return "Danke, " + state.vorname + ".";
    if (step.id === "plan") return ENG[engpassId()].name;
    return step.h;
  }

  function stepSub(step) {
    if (step.id === "stopp" && state.atem === "unruhiger") {
      return "Die Atemübung war gerade eher unangenehm. Der Raumwechsel ist dann oft der leichtere Stopp.";
    }
    if (step.id === "plan") return engpassSatz();
    return step.sub || "";
  }

  function bodyOf(step) {
    if (step.type === "one" || step.type === "multi") return choicesBody(step) + nav(step.type === "multi");
    if (step.type === "atem") return atemBody();
    if (step.type === "regel") return regelBody();
    if (step.type === "huerde") return huerdeBody();
    if (step.type === "satz") return satzBody();
    if (step.type === "scale") return scaleBody();
    if (step.type === "plan") return planBody();
    if (step.type === "signup") return signupBody();
    if (step.type === "danke") return dankeBody();
    return "";
  }

  function nav(showNext) {
    return '<div class="cs-nav">' +
      (stepIndex > 0 ? '<button class="btn btn--ghost" type="button" data-cs="back">Zurück</button>' : "") +
      (showNext ? '<button class="btn btn--primary" type="button" data-cs="next">Weiter</button>' : "") +
      "</div>";
  }

  function choicesBody(step) {
    var list = optionsOf(step);
    var multi = step.type === "multi";
    var html = '<div class="cs-choices" role="group">';
    list.forEach(function (opt) {
      var pressed = multi ? state.ausloeser.indexOf(opt.id) >= 0 : state[step.key] === opt.id;
      html += choiceHtml(opt, pressed, multi);
    });
    html += "</div>";
    return html;
  }

  function atemBody() {
    return '<p class="cs-timer" id="cs-timer" hidden>30</p>' +
      '<button class="btn btn--primary btn--block" type="button" id="cs-atem-start">Jetzt 30 Sekunden mitmachen</button>' +
      '<div id="cs-atem-after" hidden><p>Wie ist es jetzt?</p><div class="cs-choices">' +
      choiceHtml({ id: "ruhiger", label: "Ruhiger" }, state.atem === "ruhiger", false) +
      choiceHtml({ id: "gleich", label: "Gleich" }, state.atem === "gleich", false) +
      choiceHtml({ id: "unruhiger", label: "Unruhiger" }, state.atem === "unruhiger", false) +
      "</div></div>" +
      '<p class="cs-skip"><button class="textlink" type="button" data-cs="skip-atem">Ich mach das später</button></p>' +
      nav(false);
  }

  function regelBody() {
    return '<div class="field"><label for="cs-wenn">Wenn</label><input class="input" id="cs-wenn" maxlength="240" value="' + esc(state.regelWenn) + '"></div>' +
      '<div class="field"><label for="cs-dann">dann</label><input class="input" id="cs-dann" maxlength="300" value="' + esc(state.regelDann) + '"></div>' +
      nav(true).replace("Weiter", "Passt");
  }

  function huerdeBody() {
    var list = HUERDE[state.muster] || [];
    var html = '<div class="cs-choices">';
    list.forEach(function (opt) { html += choiceHtml(opt, state.huerde === opt.id, false); });
    html += choiceHtml({ id: "eigen", label: "Ich schreib selbst" }, state.huerde === "eigen", false);
    html += "</div>";
    html += '<div class="field" id="cs-huerde-feld"' + (state.huerde === "eigen" ? "" : " hidden") + '><label for="cs-huerde-frei">Deine Hürde</label><input class="input" id="cs-huerde-frei" maxlength="200" value="' + esc(state.huerdeFrei) + '"></div>';
    html += nav(true);
    return html;
  }

  function satzBody() {
    var html = '<div class="cs-choices">';
    SAETZE.forEach(function (opt) { html += choiceHtml(opt, state.satz === opt.id, false); });
    html += choiceHtml({ id: "eigen", label: "Eigener Satz" }, state.satz === "eigen", false);
    html += "</div>";
    html += '<div class="field" id="cs-satz-feld"' + (state.satz === "eigen" ? "" : " hidden") + '><label for="cs-satz-frei">Ich bin einer, der</label><input class="input" id="cs-satz-frei" maxlength="180" value="' + esc(state.satzFrei) + '"></div>';
    html += nav(true);
    return html;
  }

  function scaleBody() {
    var html = "";
    STATEMENTS.forEach(function (st, i) {
      html += '<div class="cs-scale-block"><p>' + esc(st.text) + '</p><div class="cs-scale" role="group" aria-label="' + esc(st.text) + '">';
      for (var n = 1; n <= 5; n++) {
        html += '<button type="button" data-scale="' + i + '" data-n="' + n + '" aria-pressed="' + (Number(state.phasen[i]) === n ? "true" : "false") + '">' + n + "</button>";
      }
      html += '</div><div class="cs-scale-legend"><span>gar nicht</span><span>genau</span></div></div>';
    });
    html += nav(true);
    return html;
  }

  function engpassSatz() {
    var text = ENG[engpassId()].text;
    var dot = text.indexOf(". ");
    return dot === -1 ? text : text.slice(0, dot + 1);
  }

  function sessionHref() {
    return "/session?via=clearstate&utm_source=clearstate&utm_medium=builder&utm_campaign=clearstate_flow";
  }

  function planDetailHtml() {
    var eng = ENG[engpassId()];
    var ktyp = koerperTyp();
    var oft = oftObj();
    var seit = seitObj();
    var html = "<h3>Dein fertiger Plan</h3>";
    if (oft && seit) html += "<p>Das war letzte Woche " + esc(oft.satz) + ". Und das geht schon " + esc(seit.satz) + " so.</p>";
    if (state.versucht === "oefter") html += "<p>Du hast es schon öfter versucht. Du hast bisher an der falschen Stelle angesetzt.</p>";
    if (preisObj()) html += "<p>Der Preis: " + esc(preisObj().label) + ".</p>";
    if (engpassId() === "laeuft") html += "<p>Deshalb fängst du mit " + esc(eng.baustein) + " an.</p>";
    else html += "<p>Du bleibst meistens beim " + esc(eng.name) + " hängen. Deshalb fängst du mit " + esc(eng.baustein) + " an.</p>";
    html += "<p>" + esc(eng.text) + "</p>";
    html += "<p>" + esc(eng.tage) + "</p>";
    if (ktyp && KOERPER_TEXT[ktyp]) html += "<h3>Was dein Körper dabei macht</h3><p>" + esc(KOERPER_TEXT[ktyp]) + "</p>";
    if (state.atem === "unruhiger") html += "<p>Die Atemübung war für dich gerade eher unangenehm. Nimm als Stopp lieber den Raumwechsel.</p>";
    if (state.stopp === "wasser") html += "<p>Kaltes Wasser ins Gesicht nur, wenn Herz und Blutdruck mitmachen.</p>";
    html += "<h3>So benutzt du ihn</h3><ul class=\"cs-use\">" +
      "<li>Heute: Richte die Hürde ein. Das dauert zwei Minuten und macht den Rest leichter.</li>" +
      "<li>Wenn es passiert: Erst der Stopp, dann der Ersatz. Mehr nicht.</li>" +
      "<li>Abends: Ein Strich, wenn du es gemacht hast. Und einmal kurz dein Satz.</li>" +
      "<li>Wenn es nicht klappt: Mach den Ersatz kleiner, nicht größer. Ein schlechter Tag zählt nicht.</li>" +
      "</ul>";
    html += '<p class="cs-note">Das ist ein Selbsttest. Er zeigt dir, wo du ansetzen kannst. Er ersetzt keinen Arzt.</p>';
    return html;
  }

  function planBody() {
    return '<div class="cs-gates">' +
      '<button type="button" class="cs-gate" data-cs="mail">Plan per E-Mail</button>' +
      '<a class="cs-gate" href="' + sessionHref() + '">Kostenlose Potenzialanalyse mit Janosch</a>' +
      "</div>" +
      '<p class="cs-note">Du suchst dir einen Weg aus.</p>' +
      nav(false);
  }

  function signupBody() {
    return '<form id="cs-form" novalidate>' +
      '<div class="field"><label for="cs-vorname">Vorname</label><input class="input" id="cs-vorname" name="vorname" autocomplete="given-name" maxlength="80" required></div>' +
      '<div class="field"><label for="cs-email">E-Mail</label><input class="input" id="cs-email" name="email" type="email" autocomplete="email" inputmode="email" maxlength="200" required></div>' +
      '<div class="consent"><input type="checkbox" id="cs-mail"><label for="cs-mail">' + esc(MAIL_TEXT).replace("Datenschutzerklärung", '<a href="/datenschutz" target="_blank" rel="noopener">Datenschutzerklärung</a>') + "</label></div>" +
      '<div class="consent"><input type="checkbox" id="cs-wa"><label for="cs-wa">' + esc(WA_TEXT) + "</label></div>" +
      '<div class="consent"><input type="checkbox" id="cs-eigen"><label for="cs-eigen">' + esc(EIGEN_TEXT) + "</label></div>" +
      '<button class="btn btn--primary btn--block" type="submit" id="cs-send">Schick mir meinen Plan</button>' +
      '<p class="hint">Ich nutze deine Daten nur für deinen Plan und diese Nachrichten und gebe sie nicht weiter. WhatsApp gehört zu Meta mit Sitz in den USA. Wenn du WhatsApp wählst, laufen die Nachrichten über deren Server. Details in der <a href="/datenschutz" target="_blank" rel="noopener">Datenschutzerklärung</a>. Du kannst deine Einwilligung jederzeit widerrufen: STOP in WhatsApp oder der Link in jeder Mail. Die Mail kommt erst, wenn du deine Adresse über den Link im Postfach bestätigst.</p>' +
      "</form>" + nav(false);
  }

  function dankeBody() {
    var html = planDetailHtml();
    html += '<div class="cs-actions"><button class="btn btn--ghost btn--block" type="button" data-cs="download">Plan speichern</button></div>';
    html += "<p>Schau in dein Postfach und bestätige deine Adresse. Dann kommt derselbe Plan auch per Mail.</p>";
    if (state.whatsapp) {
      html += "<p>Tipp hier und schick die fertige Nachricht ab. Dann kommt morgen früh Tag 1.</p>";
      html += '<a class="btn btn--primary btn--block" id="cs-wa-link" href="#">WhatsApp öffnen</a>';
    }
    html += '<div class="cs-soft"><p>Wenn du dein Muster mal mit jemandem durchgehen willst, mach ich das gern mit dir. 30 Minuten, kostenlos, ohne Verkaufsgespräch.</p><a class="textlink" href="' + sessionHref() + '">Potenzialanalyse anschauen</a></div>';
    return html;
  }

  function fail(msg) {
    var box = el("cs-error");
    if (!box) return;
    box.textContent = msg;
    box.classList.add("is-visible");
  }

  function bind(step) {
    var host = el("cs-step");
    var back = host.querySelector("[data-cs=back]");
    if (back) back.addEventListener("click", function () { go(-1); });

    if (step.type === "one") {
      host.querySelectorAll(".cs-choice").forEach(function (btn) {
        btn.addEventListener("click", function () {
          state[step.key] = btn.getAttribute("data-id");
          save();
          setTimeout(function () { go(1); }, 160);
        });
      });
    }

    if (step.type === "multi") {
      host.querySelectorAll(".cs-choice").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var id = btn.getAttribute("data-id");
          var i = state.ausloeser.indexOf(id);
          if (i >= 0) state.ausloeser.splice(i, 1);
          else state.ausloeser.push(id);
          btn.setAttribute("aria-pressed", i >= 0 ? "false" : "true");
          save();
        });
      });
      host.querySelector("[data-cs=next]").addEventListener("click", function () {
        if (!state.ausloeser.length) return fail("Tipp wenigstens eins an.");
        go(1);
      });
    }

    if (step.type === "atem") {
      var start = el("cs-atem-start");
      var after = el("cs-atem-after");
      var clock = el("cs-timer");
      start.addEventListener("click", function () {
        start.hidden = true;
        clock.hidden = false;
        var left = 30;
        clock.textContent = String(left);
        stopTimer();
        timer = setInterval(function () {
          left -= 1;
          clock.textContent = String(left);
          if (left <= 0) {
            stopTimer();
            clock.hidden = true;
            after.hidden = false;
          }
        }, 1000);
      });
      after.querySelectorAll(".cs-choice").forEach(function (btn) {
        btn.addEventListener("click", function () {
          state.atem = btn.getAttribute("data-id");
          go(1);
        });
      });
      host.querySelector("[data-cs=skip-atem]").addEventListener("click", function () {
        state.atem = "spaeter";
        go(1);
      });
    }

    if (step.type === "regel") {
      host.querySelector("[data-cs=next]").addEventListener("click", function () {
        state.regelWenn = el("cs-wenn").value.trim();
        state.regelDann = el("cs-dann").value.trim();
        if (!state.regelWenn || !state.regelDann) return fail("Schreib noch den Wenn-Teil und den Dann-Teil.");
        go(1);
      });
    }

    if (step.type === "huerde") {
      host.querySelectorAll(".cs-choice").forEach(function (btn) {
        btn.addEventListener("click", function () {
          state.huerde = btn.getAttribute("data-id");
          host.querySelectorAll(".cs-choice").forEach(function (b) { b.setAttribute("aria-pressed", "false"); });
          btn.setAttribute("aria-pressed", "true");
          el("cs-huerde-feld").hidden = state.huerde !== "eigen";
          save();
        });
      });
      host.querySelector("[data-cs=next]").addEventListener("click", function () {
        state.huerdeFrei = el("cs-huerde-frei") ? el("cs-huerde-frei").value.trim() : state.huerdeFrei;
        if (!huerdeText()) return fail("Wähl eine Hürde, oder schreib deine.");
        go(1);
      });
    }

    if (step.type === "satz") {
      host.querySelectorAll(".cs-choice").forEach(function (btn) {
        btn.addEventListener("click", function () {
          state.satz = btn.getAttribute("data-id");
          host.querySelectorAll(".cs-choice").forEach(function (b) { b.setAttribute("aria-pressed", "false"); });
          btn.setAttribute("aria-pressed", "true");
          el("cs-satz-feld").hidden = state.satz !== "eigen";
          save();
        });
      });
      host.querySelector("[data-cs=next]").addEventListener("click", function () {
        state.satzFrei = el("cs-satz-frei") ? el("cs-satz-frei").value.trim() : state.satzFrei;
        if (!satzText()) return fail("Wähl einen Satz, oder schreib deinen.");
        go(1);
      });
    }

    if (step.type === "scale") {
      host.querySelectorAll("[data-scale]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var i = Number(btn.getAttribute("data-scale"));
          var n = Number(btn.getAttribute("data-n"));
          state.phasen[i] = n;
          host.querySelectorAll('[data-scale="' + i + '"]').forEach(function (b) {
            b.setAttribute("aria-pressed", b === btn ? "true" : "false");
          });
          save();
        });
      });
      host.querySelector("[data-cs=next]").addEventListener("click", function () {
        if (state.phasen.some(function (n) { return !n; })) return fail("Bewerte noch jeden Satz, von 1 bis 5.");
        go(1);
      });
    }

    if (step.type === "plan") {
      host.querySelector("[data-cs=mail]").addEventListener("click", function () { go(1); });
    }

    if (step.type === "signup") {
      el("cs-form").addEventListener("submit", function (e) {
        e.preventDefault();
        submit();
      });
    }

    if (step.type === "danke") {
      var link = el("cs-wa-link");
      if (link && state.waHref) link.href = state.waHref;
      var dl = host.querySelector("[data-cs=download]");
      if (dl) dl.addEventListener("click", download);
    }
  }

  function planPlain() {
    var eng = ENG[engpassId()];
    var lines = [
      "DEIN PLAN",
      "",
      "Muster: " + musterText(),
      "Stopp: " + (stoppObj() ? stoppObj().label : ""),
      "Ersatz: " + (ersatzObj() ? ersatzObj().label : "") + (dauerObj() ? ", " + dauerObj().label : ""),
      "Regel: " + regelSatz(),
      "Satz: " + satzText(),
      "",
      engpassId() === "laeuft"
        ? "Deshalb fängst du mit " + eng.baustein + " an. " + eng.text
        : "Du bleibst meistens beim " + eng.name + " hängen. Deshalb fängst du mit " + eng.baustein + " an. " + eng.text,
      eng.tage
    ];
    var ktyp = koerperTyp();
    if (ktyp && KOERPER_TEXT[ktyp]) lines.push("", "Was dein Körper dabei macht", KOERPER_TEXT[ktyp]);
    if (preisObj()) lines.push("", "Der Preis: " + preisObj().label + ".");
    lines.push(
      "",
      "So benutzt du ihn",
      "Heute: Richte die Hürde ein. Das dauert zwei Minuten und macht den Rest leichter.",
      "Wenn es passiert: Erst der Stopp, dann der Ersatz. Mehr nicht.",
      "Abends: Ein Strich, wenn du es gemacht hast. Und einmal kurz dein Satz.",
      "Wenn es nicht klappt: Mach den Ersatz kleiner, nicht größer. Ein schlechter Tag zählt nicht.",
      "",
      "Das ist ein Selbsttest. Er ersetzt keinen Arzt."
    );
    return lines.join("\n");
  }

  function download() {
    var blob = new Blob([planPlain()], { type: "text/plain;charset=utf-8" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "clear-state-plan.txt";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1500);
  }

  function accessCode() {
    var p = function () { return Math.random().toString(36).substring(2, 6).toUpperCase(); };
    return p() + "-" + p();
  }

  async function callRpc(name, body) {
    var r = await fetch(SUPABASE_URL + "/rest/v1/rpc/" + name, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": "Bearer " + SUPABASE_ANON_KEY
      },
      body: JSON.stringify(body)
    });
    if (!r.ok) throw new Error(name + ": " + r.status);
    return r;
  }

  async function submit() {
    var vorname = el("cs-vorname").value.trim();
    var email = el("cs-email").value.trim().toLowerCase();
    var mail = el("cs-mail").checked;
    var wa = el("cs-wa").checked;
    var eigen = el("cs-eigen").checked;
    var err = el("cs-error");
    if (err) err.classList.remove("is-visible");
    if (!vorname) return fail("Bitte deinen Vornamen eingeben.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail("Bitte eine gültige E-Mail eingeben.");
    if (!mail) return fail("Setz noch den Haken bei der Mail, sonst darf ich dir den Plan nicht schicken.");
    if (!eigen) return fail("Setz noch den Haken bei der Eigenverantwortung.");

    var btn = el("cs-send");
    btn.disabled = true;
    btn.textContent = "…";
    var now = new Date().toISOString();
    var code = accessCode();
    var eng = engpassId();
    var m = musterObj();
    var onboarding = {
      magnet: "clearstate",
      flow: FLOW,
      access_code: code,
      muster: state.muster,
      muster_text: m ? m.label : "",
      muster_dann: m ? m.dann : "",
      tag1_wenn: m ? m.tag : "",
      oft: state.oft,
      seit: state.seit,
      versucht: state.versucht,
      ausloeser: state.ausloeser.slice(),
      ausloeser_text: ausloeserObj() ? ausloeserObj().label : "",
      koerper: state.koerper,
      koerper_text: koerperObj() ? koerperObj().label : "",
      koerper_typ: koerperTyp(),
      beduerfnis: state.beduerfnis,
      beduerfnis_satz: bedObj() ? bedObj().satz : "",
      preis: state.preis,
      preis_text: preisObj() ? preisObj().label : "",
      atem_wirkung: state.atem,
      stopp: state.stopp,
      stopp_text: stoppObj() ? stoppObj().label : "",
      ersatz: state.ersatz,
      ersatz_text: ersatzObj() ? ersatzObj().label : "",
      dauer: state.dauer,
      dauer_text: dauerObj() ? dauerObj().label : "",
      huerde: state.huerde,
      huerde_text: huerdeText(),
      regel_wenn: state.regelWenn,
      regel_dann: state.regelDann,
      regel: regelSatz(),
      identitaet: satzText(),
      engpass: eng,
      engpass_name: ENG[eng].name,
      phasen: scores(),
      phasen_antworten: state.phasen.slice(),
      plan_text: planPlain(),
      consents: {
        mail: { given: true, text: MAIL_TEXT, at: now },
        whatsapp: { given: wa, text: WA_TEXT, at: wa ? now : null },
        eigenverantwortung: { given: true, text: EIGEN_TEXT, at: now }
      },
      utm_source: params.get("utm_source"),
      utm_medium: params.get("utm_medium"),
      utm_campaign: params.get("utm_campaign"),
      via: params.get("via"),
      referrer: document.referrer || null,
      landed_at: state.landed_at || now
    };

    try {
      await callRpc("register_tripwire_lead", {
        p_email: email, p_first_name: vorname, p_delivery_channel: "email",
        p_source: FLOW, p_language: "de",
        p_onboarding_data: onboarding, p_access_code: code
      });
      await callRpc("register_lead", {
        p_email: email, p_first_name: vorname, p_delivery_channel: "email",
        p_source: FLOW, p_language: "de",
        p_onboarding_data: onboarding, p_access_code: code,
        p_chosen_path: FLOW, p_flow_name: FLOW
      });
      if (window.smhNotify) {
        await window.smhNotify({
          kind: "clearstate",
          name: vorname,
          email: email,
          phone: "",
          page: "clear-state",
          route: "Clear State",
          answers: [
            { frage: "Muster", antwort: m ? m.label : "" },
            { frage: "Engpass", antwort: ENG[eng].name },
            { frage: "WhatsApp", antwort: wa ? "ja" : "nein" }
          ]
        });
      }
      state.vorname = vorname;
      state.whatsapp = wa;
      var text = encodeURIComponent(BOT_MESSAGE + "\n\n" + ACCESS_LABEL + " " + code);
      state.waHref = "https://wa.me/" + WA_NUMBER + "?text=" + text;
      save();
      go(1);
    } catch (e) {
      console.error("Clear State speichern:", e);
      btn.disabled = false;
      btn.textContent = "Schick mir meinen Plan";
      fail("Da ist etwas schiefgelaufen. Bitte versuch es gleich noch einmal.");
    }
  }

  function openBuilder() {
    var bauer = el("bauer");
    if (bauer) bauer.hidden = false;
    document.body.classList.add("cs-on");
    if (!state.landed_at) state.landed_at = new Date().toISOString();
    render();
    focusQuestion();
  }

  function start() {
    var weiter = params.get("weiter");
    var stufen = { verhalten: 1, gefuehle: 1, alarm: 1, ruhe: 1, satz: 1, werte: 1, wofuer: 1 };
    if (weiter && stufen[weiter]) {
      location.replace("/clear-state/" + weiter);
      return;
    }
    var los = el("cs-los");
    if (los) los.addEventListener("click", function () {
      stepIndex = 0;
      openBuilder();
    });
    if (load() && (stepIndex > 0 || state.muster)) openBuilder();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
