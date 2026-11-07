/* Abschalten-Test: die Werte, die Janosch selbst setzt.
   Preis und Kasse an einer Stelle. Die Seiten lesen nur diese Datei. */
(function (root) {
  "use strict";

  var CONFIG = {
    /* Einmalpreis in Euro. Die Seiten setzen den Betrag von hier. */
    PREIS_EURO: 9,

    /* Slugs. Dieselben Namen stehen in den Adressen der Ergebnisseiten
       und im Parameter typ der Berichtsseite. */
    TYPEN: ["dauerlaeufer", "gruebler", "erschoepft-wach", "reguliert"],

    /* Eine Digistore24-Kasse pro Typ.
       PLATZHALTER durch die Produkt-URL aus Digistore24 ersetzen.
       Dankeseite in Digistore24, je Produkt eine eigene Adresse:
       https://www.shiftmyhorizon.com/abschalten-test/bericht?typ=dauerlaeufer&zugang=DER_WERT_AUS_BERICHT_ZUGANG
       https://www.shiftmyhorizon.com/abschalten-test/bericht?typ=gruebler&zugang=DER_WERT_AUS_BERICHT_ZUGANG
       https://www.shiftmyhorizon.com/abschalten-test/bericht?typ=erschoepft-wach&zugang=DER_WERT_AUS_BERICHT_ZUGANG
       https://www.shiftmyhorizon.com/abschalten-test/bericht?typ=reguliert&zugang=DER_WERT_AUS_BERICHT_ZUGANG
       Ein Produkt für alle Typen reicht, wenn jede Dankeseite den passenden typ trägt. */
    CHECKOUT_URL: {
      dauerlaeufer: "https://www.digistore24.com/product/PLATZHALTER-DAUERLAEUFER",
      gruebler: "https://www.digistore24.com/product/PLATZHALTER-GRUEBLER",
      "erschoepft-wach": "https://www.digistore24.com/product/PLATZHALTER-ERSCHOEPFT-WACH",
      reguliert: "https://www.digistore24.com/product/PLATZHALTER-REGULIERT"
    },

    /* Gleicher Wert wie der Parameter zugang in der Digistore-Dankeseite.
       Solange hier PLATZHALTER steht, öffnet dieser Wert den Bericht nicht.
       Vor dem Verkauf durch eine lange, eigene Zeichenfolge ersetzen. */
    BERICHT_ZUGANG: "PLATZHALTER-ZUGANG",

    /* Gegenlesen auf der Live-Seite, bevor die Kasse steht:
       /abschalten-test/bericht?typ=gruebler&vorschau=PLATZHALTER-VORSCHAU
       Vor dem Verkauf leeren oder durch eine eigene Zeichenfolge ersetzen.
       Auf localhost öffnet die Berichtsseite auch ohne Schlüssel. */
    VORSCHAU_SCHLUESSEL: "PLATZHALTER-VORSCHAU"
  };

  function preisText() {
    return String(CONFIG.PREIS_EURO).replace(".", ",") + " \u20ac";
  }

  function checkout(typ) {
    return CONFIG.CHECKOUT_URL[typ] || "";
  }

  root.ABSCHALTEN_TEST_CONFIG = CONFIG;
  root.abschaltenTestPreis = preisText;
  root.abschaltenTestCheckout = checkout;

  if (typeof module !== "undefined" && module.exports) {
    module.exports = {
      CONFIG: CONFIG,
      preisText: preisText,
      checkout: checkout
    };
  }
})(typeof window !== "undefined" ? window : global);
