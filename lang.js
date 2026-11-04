/* Language: explicit ?lang= wins, then the switcher choice, then the browser, else English. */
(function () {
  var CHOICE = "smh_lang_choice";

  function norm(value) {
    var base = String(value || "").toLowerCase().split("-")[0];
    return base === "de" || base === "en" || base === "es" ? base : "";
  }

  window.smhResolveLang = function (explicit) {
    var chosen = norm(explicit);
    if (chosen) return chosen;
    try { chosen = norm(localStorage.getItem(CHOICE)); } catch (e) { chosen = ""; }
    if (chosen) return chosen;
    var list = (navigator.languages && navigator.languages.length)
      ? navigator.languages
      : [navigator.language || ""];
    for (var i = 0; i < list.length; i++) {
      var hit = norm(list[i]);
      if (hit) return hit;
    }
    return "en";
  };

  window.smhRememberLang = function (code) {
    var chosen = norm(code);
    if (!chosen) return;
    try { localStorage.setItem(CHOICE, chosen); } catch (e) {}
  };

  var params = new URLSearchParams(location.search);
  var explicit = norm(params.get("lang"));
  var path = location.pathname.replace(/\/$/, "");
  var match = path.match(/^(.*)-(de|en|es)$/);
  if (!match) return;
  var want = window.smhResolveLang(explicit);
  if (want === match[2]) return;
  /* Colin's private page holds the invite token. Don't send other editions there. */
  if (match[1] === "/p/bible" && want === "en" && match[2] !== "en") return;
  if (explicit) params.set("lang", explicit);
  var query = params.toString();
  location.replace(match[1] + "-" + want + (query ? "?" + query : "") + location.hash);
})();
