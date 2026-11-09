/* Wege und Bedürfnisse. Preise stehen hier nicht. Aufruf im Browser und mit node. */
(function (factory) {
  var api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (typeof window !== "undefined") window.SMHKatalog = api;
})(function () {
  "use strict";

  var TRACK_KEYS = ["fbclid", "gclid", "wbraid", "gbraid", "msclkid", "ttclid", "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];

  function programm(spec) {
    return {
      id: spec.id,
      slug: spec.slug,
      name: spec.name,
      publikum: spec.publikum,
      quelle: spec.quelle,
      rootProblem: spec.rootProblem || null,
      flow: spec.slug,
      preisEnv: spec.preisEnv,
      lookupKey: spec.lookupKey,
      dauer: "90 Tage, eine Nachricht am Tag",
      kanal: "WhatsApp oder Telegram",
      gratisTage: 4,
      gratisHref: spec.href,
      satz: spec.satz,
      komposition: "Ein Programm, 90 Nachrichten zu diesem einen Punkt. Die anderen Programme sind eigene Käufe.",
      themen: [{ id: spec.thema, satz: spec.satz, href: spec.href }]
    };
  }

  var ANGEBOTE = [
    programm({
      id: "porn-recovery", slug: "porn_recovery_flow", name: "Raus aus dem Drang", publikum: "maenner",
      quelle: "integrated_man_flow", rootProblem: "porn", preisEnv: "STRIPE_PRICE_PORN_RECOVERY",
      lookupKey: "porn_recovery_monthly", thema: "porn", href: "/integrated-man.html?p=porn",
      satz: "Ich verliere Stunden an den schnellen Kick, und danach ist da Leere."
    }),
    programm({
      id: "gettinggirls", slug: "gettinggirls_flow", name: "Frauen ansprechen", publikum: "maenner",
      quelle: "integrated_man_flow", rootProblem: "gettinggirls", preisEnv: "STRIPE_PRICE_GETTINGGIRLS",
      lookupKey: "gettinggirls_monthly", thema: "gettinggirls", href: "/integrated-man.html?p=gettinggirls",
      satz: "Ich sehe die Frau, die mir gefällt, und tue dann doch nichts."
    }),
    programm({
      id: "mens-relationship", slug: "mens_relationship_flow", name: "Nähe in der Beziehung", publikum: "maenner",
      quelle: "integrated_man_flow", rootProblem: "relationship", preisEnv: "STRIPE_PRICE_MENS_RELATIONSHIP",
      lookupKey: "mens_relationship_monthly", thema: "relationship", href: "/integrated-man.html?p=relationship",
      satz: "Wir leben nebeneinander her, und der Respekt wird leiser."
    }),
    programm({
      id: "career", slug: "career_flow", name: "Beruf und Aufstieg", publikum: "maenner",
      quelle: "career_power_flow", preisEnv: "STRIPE_PRICE_CAREER",
      lookupKey: "career_monthly", thema: "stagnation", href: "/careerandpower.html?p=stagnation",
      satz: "Ich leiste viel und werde bei Beförderungen oft übergangen."
    }),
    programm({
      id: "sales", slug: "sales_flow", name: "Verkauf", publikum: "maenner",
      quelle: "elite_closer_flow", preisEnv: "STRIPE_PRICE_SALES",
      lookupKey: "sales_monthly", thema: "discounting", href: "/elitecloser.html?p=discounting",
      satz: "Ich knicke beim Preis zu früh ein und gebe Rabatt."
    }),
    programm({
      id: "main-character", slug: "main_character_flow", name: "Bei sich bleiben", publikum: "frauen",
      quelle: "loving_woman_flow", rootProblem: "peoplepleasing", preisEnv: "STRIPE_PRICE_MAIN_CHARACTER",
      lookupKey: "main_character_monthly", thema: "peoplepleasing", href: "/ThelovingWoman.html?p=peoplepleasing",
      satz: "Ich mache es allen recht und verliere mich dabei."
    }),
    programm({
      id: "high-value-dating", slug: "high_value_dating_flow", name: "Selbstwert und Dating", publikum: "frauen",
      quelle: "loving_woman_flow", rootProblem: "dating", preisEnv: "STRIPE_PRICE_HIGH_VALUE_DATING",
      lookupKey: "high_value_dating_monthly", thema: "dating", href: "/ThelovingWoman.html?p=dating",
      satz: "Mein Selbstwert hängt an seiner Nachricht."
    }),
    programm({
      id: "heartbreak", slug: "heartbreak_flow", name: "Nach der Nähe", publikum: "frauen",
      quelle: "loving_woman_flow", rootProblem: "somatic", preisEnv: "STRIPE_PRICE_HEARTBREAK",
      lookupKey: "heartbreak_monthly", thema: "somatic", href: "/ThelovingWoman.html?p=somatic",
      satz: "Ich spüre eine Leere und bin wie hinter Glas."
    }),
    programm({
      id: "leichtigkeit", slug: "leichtigkeit_flow", name: "Leichtigkeit", publikum: "frauen",
      quelle: "path_to_lightness_flow", preisEnv: "STRIPE_PRICE_LEICHTIGKEIT",
      lookupKey: "leichtigkeit_monthly", thema: "boundaries", href: "/lightness.html?p=boundaries",
      satz: "Ich sage Ja, obwohl ich Nein meine."
    }),
    programm({
      id: "secular", slug: "secular_flow", name: "Trotz Erfolg leer", publikum: "frauen",
      quelle: "integrated_soul_flow", preisEnv: "STRIPE_PRICE_SECULAR",
      lookupKey: "secular_monthly", thema: "emptiness", href: "/TheIntegratedSoul.html?p=emptiness",
      satz: "Ich erreiche viel und fühle mich trotzdem leer."
    }),
    programm({
      id: "parenting-loop", slug: "parenting_loop_flow", name: "Ruhig bleiben mit den Kindern", publikum: "eltern",
      quelle: "parent_in_peace_flow", rootProblem: "anger", preisEnv: "STRIPE_PRICE_PARENTING_LOOP",
      lookupKey: "parenting_loop_monthly", thema: "anger", href: "/Parentinpeace.html?p=anger",
      satz: "Ich raste bei den Kindern aus und es tut mir danach leid."
    }),
    programm({
      id: "parental-burnout", slug: "parental_burnout_flow", name: "Eltern, am Limit", publikum: "eltern",
      quelle: "parent_in_peace_flow", rootProblem: "overwhelm", preisEnv: "STRIPE_PRICE_PARENTAL_BURNOUT",
      lookupKey: "parental_burnout_monthly", thema: "overwhelm", href: "/Parentinpeace.html?p=overwhelm",
      satz: "Ich bin ausgelaugt, bevor der Tag mit den Kindern richtig beginnt."
    }),
    programm({
      id: "conflict-to-connection", slug: "conflict_to_connection_flow", name: "Streit und Verstehen", publikum: "paare",
      quelle: "connected_couples_flow", rootProblem: "communication", preisEnv: "STRIPE_PRICE_CONFLICT_TO_CONNECTION",
      lookupKey: "conflict_to_connection_monthly", thema: "communication", href: "/connectedcouple.html?p=communication",
      satz: "Wir reden viel und verstehen uns trotzdem nicht."
    }),
    programm({
      id: "fairplay", slug: "fairplay_flow", name: "Nähe als Paar", publikum: "paare",
      quelle: "connected_couples_flow", rootProblem: "intimacy", preisEnv: "STRIPE_PRICE_FAIRPLAY",
      lookupKey: "fairplay_monthly", thema: "intimacy", href: "/connectedcouple.html?p=intimacy",
      satz: "Wir funktionieren nur noch nebeneinander."
    })
  ];


  var BEDARFE = [
    {
      id: "fokus",
      gruppe: "Arbeit und Feierabend",
      satz: "Eine Nachricht ploppt auf, und danach weiß ich nicht mehr, wo ich war.",
      frei: { label: "Kostenloser 3-Tage-Starter", href: "/fokus" },
      coaching: true
    },
    {
      id: "termine",
      gruppe: "Arbeit und Feierabend",
      satz: "Vor dem Gespräch geht der Puls hoch, und die gute Antwort kommt erst danach.",
      frei: { label: "Kostenloser Einstieg zu Terminen", href: "/termin" },
      coaching: true
    },
    {
      id: "abend",
      gruppe: "Arbeit und Feierabend",
      satz: "Ich sitze zu Hause, und der Kopf ist noch im letzten Meeting.",
      frei: { label: "Abends abschalten, kostenloser Einstieg", href: "/abschalten" },
      test: { label: "Abschalten-Test, kostenlos", href: "/abschalten-test" },
      coaching: true
    },
    {
      id: "nacht",
      gruppe: "Arbeit und Feierabend",
      satz: "Ich liege nachts wach und gehe die Zahlen von morgen durch.",
      frei: { label: "Anleitung für die Nacht, kostenlos", href: "/nacht" },
      coaching: true
    },
    {
      id: "check",
      gruppe: "Arbeit und Feierabend",
      satz: "Ich will sehen, wo ich bei Fokus, Terminen, Feierabend und Schlaf stehe.",
      test: { label: "Umschalt-Check, kostenlos, ohne Anmeldung", href: "/check" },
      coaching: true
    },
    {
      id: "plan",
      gruppe: "Arbeit und Feierabend",
      satz: "Ich will einen eigenen Plan in fünf Bausteinen, ohne Termin.",
      frei: { label: "Clear State, kostenlos", href: "/clear-state" }
    },
    {
      id: "ansprechen",
      gruppe: "Männer",
      satz: "Ich sehe die Frau, die mir gefällt, und tue dann doch nichts.",
      angebotId: "gettinggirls",
      thema: "gettinggirls"
    },
    {
      id: "drang",
      gruppe: "Männer",
      satz: "Der schnelle Kick reizt mich mehr als echte Nähe.",
      angebotId: "porn-recovery",
      thema: "porn"
    },
    {
      id: "naehe",
      gruppe: "Männer",
      satz: "Wir leben nebeneinander her, und der Respekt wird leiser.",
      angebotId: "mens-relationship",
      thema: "relationship"
    },
    {
      id: "befoerderung",
      gruppe: "Beruf",
      satz: "Ich leiste viel und werde bei Beförderungen oft übergangen.",
      angebotId: "career",
      thema: "stagnation"
    },
    {
      id: "rabatt",
      gruppe: "Beruf",
      satz: "Ich knicke beim Preis zu früh ein und gebe Rabatt.",
      angebotId: "sales",
      thema: "discounting"
    },
    {
      id: "allen-recht",
      gruppe: "Frauen",
      satz: "Ich mache es allen recht und verliere mich dabei.",
      angebotId: "main-character",
      thema: "peoplepleasing"
    },
    {
      id: "nachricht",
      gruppe: "Frauen",
      satz: "Mein Selbstwert hängt an seiner Nachricht.",
      angebotId: "high-value-dating",
      thema: "dating"
    },
    {
      id: "ja-nein",
      gruppe: "Frauen",
      satz: "Ich sage Ja, obwohl ich Nein meine.",
      angebotId: "leichtigkeit",
      thema: "boundaries"
    },
    {
      id: "leer",
      gruppe: "Frauen",
      satz: "Ich erreiche viel und fühle mich trotzdem leer.",
      angebotId: "secular",
      thema: "emptiness"
    },
    {
      id: "kinder",
      gruppe: "Eltern und Paare",
      satz: "Ich raste bei den Kindern aus und es tut mir danach leid.",
      angebotId: "parenting-loop",
      thema: "anger"
    },
    {
      id: "paar",
      gruppe: "Eltern und Paare",
      satz: "Wir reden viel und verstehen uns trotzdem nicht.",
      angebotId: "conflict-to-connection",
      thema: "communication"
    },
    {
      id: "ueberlast",
      gruppe: "Eltern und Paare",
      satz: "Ich bin ausgelaugt, bevor der Tag mit den Kindern richtig beginnt.",
      angebotId: "parental-burnout",
      thema: "overwhelm"
    },
    {
      id: "naehe-paar",
      gruppe: "Eltern und Paare",
      satz: "Wir funktionieren nur noch nebeneinander.",
      angebotId: "fairplay",
      thema: "intimacy"
    }
  ];

  function angebot(id) {
    var i;
    for (i = 0; i < ANGEBOTE.length; i++) if (ANGEBOTE[i].id === id) return ANGEBOTE[i];
    return null;
  }

  function bedarf(id) {
    var i;
    for (i = 0; i < BEDARFE.length; i++) if (BEDARFE[i].id === id) return BEDARFE[i];
    return null;
  }

  function themaVon(offer, themaId) {
    if (!offer || !themaId) return null;
    var i;
    for (i = 0; i < offer.themen.length; i++) if (offer.themen[i].id === themaId) return offer.themen[i];
    return null;
  }

  function empfehlung(bedarfId) {
    var row = bedarf(bedarfId);
    if (!row) return null;
    var offer = row.angebotId ? angebot(row.angebotId) : null;
    var thema = offer ? themaVon(offer, row.thema) : null;
    return {
      bedarf: row,
      angebot: offer,
      thema: thema,
      gratisHref: (thema && thema.href) || (offer && offer.gratisHref) || (row.frei && row.frei.href) || null,
      coaching: !!row.coaching
    };
  }

  function fuerPublikum(publikum) {
    return ANGEBOTE.filter(function (a) { return a.publikum === publikum; });
  }

  return {
    TRACK_KEYS: TRACK_KEYS,
    ANGEBOTE: ANGEBOTE,
    BEDARFE: BEDARFE,
    angebot: angebot,
    bedarf: bedarf,
    themaVon: themaVon,
    empfehlung: empfehlung,
    fuerPublikum: fuerPublikum
  };
});
