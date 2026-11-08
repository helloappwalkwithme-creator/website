/* Wege und Bedürfnisse. Preise stehen hier nicht. Aufruf im Browser und mit node. */
(function (factory) {
  var api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (typeof window !== "undefined") window.SMHKatalog = api;
})(function () {
  "use strict";

  var TRACK_KEYS = ["fbclid", "gclid", "wbraid", "gbraid", "msclkid", "ttclid", "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];

  var ANGEBOTE = [
    {
      id: "integrated-man",
      name: "Integrated Man",
      publikum: "maenner",
      flow: "integrated_man_flow",
      digistoreProdukt: "688460",
      influencerProdukt: "732212",
      preisEnv: "STRIPE_PRICE_INTEGRATED_MAN",
      dauer: "90 Tage, eine Nachricht am Tag",
      kanal: "WhatsApp oder Telegram",
      gratisTage: 4,
      gratisHref: "/integrated-man.html",
      komposition: "Ein Thema für 90 Tage. Die anderen Themen sind nicht automatisch dabei.",
      themen: [
        { id: "porn", satz: "Ich verliere Stunden an den schnellen Kick, und danach ist da Leere.", href: "/integrated-man.html?p=porn" },
        { id: "gettinggirls", satz: "Ich sehe die Frau, die mir gefällt, und tue dann doch nichts.", href: "/integrated-man.html?p=gettinggirls" },
        { id: "relationship", satz: "Wir leben nebeneinander her, und der Respekt wird leiser.", href: "/integrated-man.html?p=relationship" }
      ]
    },
    {
      id: "career-power",
      name: "Career & Power",
      publikum: "maenner",
      flow: "career_power_flow",
      digistoreProdukt: "688580",
      preisEnv: "STRIPE_PRICE_CAREER_POWER",
      dauer: "90 Tage, eine Nachricht am Tag",
      kanal: "WhatsApp oder Telegram",
      gratisTage: 4,
      gratisHref: "/careerandpower.html",
      komposition: "Ein berufliches Thema für 90 Tage. Nicht Teil von Integrated Man.",
      themen: [
        { id: "stagnation", satz: "Ich leiste viel und werde bei Beförderungen oft übergangen.", href: "/careerandpower.html?p=stagnation" },
        { id: "overload", satz: "Ich ertrinke im Tagesgeschäft und komme an die Richtung nicht ran.", href: "/careerandpower.html?p=overload" },
        { id: "invisibility", satz: "In wichtigen Meetings werde ich überhört.", href: "/careerandpower.html?p=invisibility" }
      ]
    },
    {
      id: "elite-closer",
      name: "Elite Closer",
      publikum: "maenner",
      flow: "elite_closer_flow",
      digistoreProdukt: "688583",
      preisEnv: "STRIPE_PRICE_ELITE_CLOSER",
      dauer: "90 Tage, eine Nachricht am Tag",
      kanal: "WhatsApp oder Telegram",
      gratisTage: 4,
      gratisHref: "/elitecloser.html",
      komposition: "Ein Vertriebsthema für 90 Tage. Nicht Teil von Integrated Man.",
      themen: [
        { id: "conversion", satz: "Ich habe Gespräche und schließe sie am Ende nicht ab.", href: "/elitecloser.html?p=conversion" },
        { id: "reluctance", satz: "Ich drücke mich vor der Akquise, wenn Ablehnung droht.", href: "/elitecloser.html?p=reluctance" },
        { id: "discounting", satz: "Ich knicke beim Preis zu früh ein und gebe Rabatt.", href: "/elitecloser.html?p=discounting" }
      ]
    },
    {
      id: "loving-woman",
      name: "The Loving Woman",
      publikum: "frauen",
      flow: "loving_woman_flow",
      digistoreProdukt: "688575",
      preisEnv: "STRIPE_PRICE_LOVING_WOMAN",
      dauer: "90 Tage, eine Nachricht am Tag",
      kanal: "WhatsApp oder Telegram",
      gratisTage: 4,
      gratisHref: "/ThelovingWoman.html",
      komposition: "Ein Thema für 90 Tage. Die anderen Themen sind nicht automatisch dabei.",
      themen: [
        { id: "peoplepleasing", satz: "Ich mache es allen recht und verliere mich dabei.", href: "/ThelovingWoman.html?p=peoplepleasing" },
        { id: "dating", satz: "Mein Selbstwert hängt an seiner Nachricht.", href: "/ThelovingWoman.html?p=dating" },
        { id: "somatic", satz: "Ich spüre eine Leere und bin wie hinter Glas.", href: "/ThelovingWoman.html?p=somatic" }
      ]
    },
    {
      id: "lightness",
      name: "Lightness",
      publikum: "frauen",
      flow: "path_to_lightness_flow",
      digistoreProdukt: "719920",
      preisEnv: "STRIPE_PRICE_LIGHTNESS",
      dauer: "90 Tage, eine Nachricht am Tag",
      kanal: "WhatsApp oder Telegram",
      gratisTage: 4,
      gratisHref: "/lightness.html",
      komposition: "Ein Thema für 90 Tage. Nicht Teil von The Loving Woman.",
      themen: [
        { id: "boundaries", satz: "Ich sage Ja, obwohl ich Nein meine.", href: "/lightness.html?p=boundaries" },
        { id: "overload", satz: "Mein Kopf steht nie still, und ich zerdenke Entscheidungen.", href: "/lightness.html?p=overload" },
        { id: "tension", satz: "Eine Unruhe bleibt, auch wenn gerade nichts anliegt.", href: "/lightness.html?p=tension" }
      ]
    },
    {
      id: "integrated-soul",
      name: "Integrated Soul",
      publikum: "frauen",
      flow: "integrated_soul_flow",
      digistoreProdukt: "688579",
      preisEnv: "STRIPE_PRICE_INTEGRATED_SOUL",
      dauer: "90 Tage, eine Nachricht am Tag",
      kanal: "WhatsApp oder Telegram",
      gratisTage: 4,
      gratisHref: "/TheIntegratedSoul.html",
      komposition: "Ein Thema für 90 Tage. Nicht Teil von The Loving Woman.",
      themen: [
        { id: "emptiness", satz: "Ich erreiche viel und fühle mich trotzdem leer.", href: "/TheIntegratedSoul.html?p=emptiness" }
      ]
    },
    {
      id: "parent-in-peace",
      name: "Parent in Peace",
      publikum: "eltern",
      flow: "parent_in_peace_flow",
      digistoreProdukt: "688578",
      preisEnv: "STRIPE_PRICE_PARENT_IN_PEACE",
      dauer: "90 Tage, eine Nachricht am Tag",
      kanal: "WhatsApp oder Telegram",
      gratisTage: 4,
      gratisHref: "/Parentinpeace.html",
      komposition: "Ein Elternthema für 90 Tage. Nicht Teil von The Loving Woman.",
      themen: [
        { id: "anger", satz: "Ich raste bei den Kindern aus und es tut mir danach leid.", href: "/Parentinpeace.html?p=anger" }
      ]
    },
    {
      id: "connected-couples",
      name: "Connected Couples",
      publikum: "paare",
      flow: "connected_couples_flow",
      digistoreProdukt: "688576",
      preisEnv: "STRIPE_PRICE_CONNECTED_COUPLES",
      dauer: "90 Tage, eine Nachricht am Tag",
      kanal: "WhatsApp oder Telegram",
      gratisTage: 4,
      gratisHref: "/connectedcouple.html",
      komposition: "Ein Paarthema für 90 Tage. Nicht in Integrated Man oder The Loving Woman enthalten.",
      themen: [
        { id: "communication", satz: "Wir reden viel und verstehen uns trotzdem nicht.", href: "/connectedcouple.html?p=communication" }
      ]
    }
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
      angebotId: "integrated-man",
      thema: "gettinggirls"
    },
    {
      id: "drang",
      gruppe: "Männer",
      satz: "Der schnelle Kick reizt mich mehr als echte Nähe.",
      angebotId: "integrated-man",
      thema: "porn"
    },
    {
      id: "naehe",
      gruppe: "Männer",
      satz: "Wir leben nebeneinander her, und der Respekt wird leiser.",
      angebotId: "integrated-man",
      thema: "relationship"
    },
    {
      id: "befoerderung",
      gruppe: "Beruf",
      satz: "Ich leiste viel und werde bei Beförderungen oft übergangen.",
      angebotId: "career-power",
      thema: "stagnation"
    },
    {
      id: "rabatt",
      gruppe: "Beruf",
      satz: "Ich knicke beim Preis zu früh ein und gebe Rabatt.",
      angebotId: "elite-closer",
      thema: "discounting"
    },
    {
      id: "allen-recht",
      gruppe: "Frauen",
      satz: "Ich mache es allen recht und verliere mich dabei.",
      angebotId: "loving-woman",
      thema: "peoplepleasing"
    },
    {
      id: "nachricht",
      gruppe: "Frauen",
      satz: "Mein Selbstwert hängt an seiner Nachricht.",
      angebotId: "loving-woman",
      thema: "dating"
    },
    {
      id: "ja-nein",
      gruppe: "Frauen",
      satz: "Ich sage Ja, obwohl ich Nein meine.",
      angebotId: "lightness",
      thema: "boundaries"
    },
    {
      id: "leer",
      gruppe: "Frauen",
      satz: "Ich erreiche viel und fühle mich trotzdem leer.",
      angebotId: "integrated-soul",
      thema: "emptiness"
    },
    {
      id: "kinder",
      gruppe: "Eltern und Paare",
      satz: "Ich raste bei den Kindern aus und es tut mir danach leid.",
      angebotId: "parent-in-peace",
      thema: "anger"
    },
    {
      id: "paar",
      gruppe: "Eltern und Paare",
      satz: "Wir reden viel und verstehen uns trotzdem nicht.",
      angebotId: "connected-couples",
      thema: "communication"
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
