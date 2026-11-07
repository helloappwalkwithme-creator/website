/* Abschalten-Test: Preis, Stripe-Kasse und Berichtszugang an einer Stelle. */
(function (root) {
  "use strict";

  var CONFIG = {
    /* Einmalpreis in Euro. Die Seiten setzen den Betrag von hier. */
    PREIS_EURO: 9,

    /* Slugs. Dieselben Namen stehen in den Adressen der Ergebnisseiten
       und im Parameter typ der Berichtsseite. */
    TYPEN: ["dauerlaeufer", "gruebler", "erschoepft-wach", "reguliert"],

    /* Eine Stripe-Kasse pro Typ. Die Links leiten nach der Zahlung auf
       /abschalten-test/bericht?typ=TYP&zugang=BERICHT_ZUGANG */
    CHECKOUT_URL: {
      dauerlaeufer: "https://buy.stripe.com/fZu9AT9EM8xz4A5dmycIE00",
      gruebler: "https://buy.stripe.com/28E6oH7wEeVXfeJciucIE01",
      "erschoepft-wach": "https://buy.stripe.com/14A4gz8AIaFH0jPaamcIE02",
      reguliert: "https://buy.stripe.com/eVq3cv9EMaFH3w182ecIE03"
    },

    /* Gleicher Wert wie der Parameter zugang in der Stripe-Weiterleitung. */
    BERICHT_ZUGANG: "hqZh2itDp4SPntzdri6bZb6yi00koImD"
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
