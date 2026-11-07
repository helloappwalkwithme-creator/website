/* Ausführliche Berichte. Nur die Berichtsseite lädt diese Datei.
   Grenze: Wer die Datei im Browser öffnet, liest den Text auch ohne Kauf. */
(function (root, factory) {
  var api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.ABSCHALTEN_BERICHTE = api;
})(typeof window !== "undefined" ? window : global, function () {
  "use strict";

  var BERICHTE = {
    dauerlaeufer: {
      name: "Dauerläufer",
      muster: [
        "Du klappst den Laptop zu. Die Schultern bleiben oben, der Kiefer bleibt zu, ein Bein wippt. Der Atem sitzt hoch und kurz. Der Kalender hat Feierabend. Der Körper hat keins.",
        "18:40, Laptop zu. 18:50, du stehst in der Küche und liest eine Nachricht zu Ende. 19:15, das Handy liegt neben dem Teller. 20:10, du suchst eine Serie, einen Tab oder ein hartes Training, weil Sitzen unruhig ist. 22:40, im Bett ist der Atem noch flach, der erste Termin von morgen ist im Blick. Samstagvormittag läuft dasselbe Tempo."
      ],
      ausloeser: [
        "Der Schnitt zwischen Schreibtisch und Abend fehlt. Der Satz „ich habe frei“ ändert Puls, Kiefer und Atem nicht. Diese Stellen geben dem schnellen Alarm ein neues Startsignal, nachdem der Laptop schon zu ist."
      ],
      ausloeserListe: [
        "Die letzte Nachricht. Ein Satz, dann noch einer. Eine Viertelstunde ist weg, der Körper hat eine neue Aufgabe.",
        "Ein offener Tab mit einer Zahl für morgen. Solange die Zahl leuchtet, ist die Aufgabe an.",
        "Das Handy mit dem Bildschirm nach oben. Jede Aufleuchtung hebt den Blick und den Puls, auch wenn du nicht rangehst.",
        "Ein Tag ohne Schlusszeit. Du arbeitest, bis die Konzentration reißt, und nennst den Riss Feierabend.",
        "Koffein nach 14 Uhr plus ein später Tab. Beides sagt dem Körper: noch wach.",
        "Ein Training am späten Abend bis zur Leere. Die Muskelarbeit hält die Stufe hoch. Das Stopp kommt erst, wenn nichts mehr geht."
      ],
      nervensystem: [
        "Der schnelle Alarm macht dich klar für eine Aufgabe: Puls hoch, Atem kurz, Spannung in Kiefer und Nacken, Blick nach vorn. Der langsame Planer hält die Reihenfolge, was zuerst kommt und was liegen bleiben darf. Im Job brauchst du beide.",
        "Beim Dauerläufer bleibt der Alarm auf der Stufe vom Nachmittag. Es ist keine neue Gefahr. Es fehlt das Gegensignal. Ein längeres Ausatmen senkt die Atemfrequenz, der Puls folgt dem längeren Ausatmen. Aufstehen und den Raum verlassen ändern die Haltung, die der Alarm als Bereitschaft liest. Solange beides ausbleibt, füllt du die Stille mit der nächsten Sache. Die Mail, die Folge, das Scrollen sind Startsignale mit einem anderen Namen. Direkt nach dem Zuklappen sieht das so aus: der Brustkorb hebt sich schnell und flach, der Kiefer bleibt aufeinander, die Schultern sitzen eine Etage zu hoch, der Blick geht alle paar Minuten auf das leuchtende Rechteck. Der Seufzer dreht die Atemlänge um. Der Raumwechsel nimmt die Sitzhaltung des Nachmittags weg. Zehn Minuten ohne Telefon nehmen das Rechteck weg. Am Samstag fehlt der Laptop als Schluss. Du prüfst die Zahlen zum Kaffee, die Schultern sind so hoch wie donnerstags um 18 Uhr."
      ],
      lassen: [
        "Die Mail nach dem Zuklappen fällt weg. Das Training am späten Abend, das du bis zur Leere ziehst, fällt weg. Beides ist ein neues Startsignal. Die offene Sache bekommt eine Uhrzeit für morgen auf einem Zettel. Heute bekommt der Körper das Ende."
      ],
      plan: [
        { tag: "Tag 1", titel: "Physiologischer Seufzer, dann Raumwechsel", text: "Direkt beim Zuklappen, im Stehen, etwa 40 Sekunden. Zweimal durch die Nase einatmen. Der zweite Zug ist kurz und füllt die Lunge bis oben. Dann lang durch den Mund aus, bis die Lunge leer ist. Dreimal hintereinander. Danach den Raum verlassen: bis zur Tür, umdrehen, zurück. Das Handy bleibt auf dem Schreibtisch. Du nimmst es erst in die Hand, wenn du wieder im Raum stehst und die Schultern unten sind." },
        { tag: "Tag 2", titel: "Zehn Minuten ohne Telefon", text: "Nach dem Seufzer von Tag 1. Handy in einen anderen Raum, Bildschirm nach unten. Zehn Minuten. Ein Glas Wasser. Ans Fenster. Hinsetzen. Kommt ein Arbeitssatz, bleibt er ein Satz. Du öffnest ihn nicht. Nach den zehn Minuten holst du das Handy, wenn du es brauchst. Die zehn Minuten sind die Übung, nicht der Vorsatz davor." },
        { tag: "Tag 3", titel: "Kaltes Wasser ins Gesicht", text: "Am Waschbecken, vor dem ersten Hinsetzen, 20 Sekunden. Kaltes Wasser über Stirn, Augen und Wangen. Einmal. Abtrocknen. Hinsetzen. Kälte auf Stirn und Wangen senkt den Puls. 20 Sekunden reichen. Eine kalte Dusche am späten Abend ist ein anderes Signal und hält dich wach. Heute nur das Gesicht." },
        { tag: "Tag 4", titel: "Schlusszeit mit Alarm", text: "Eine Uhrzeit in den Kalender, mit Alarm. Text des Alarms: Laptop zu. Klingelt er und eine Mail ist offen, schreibst du Betreff und Uhrzeit für morgen auf einen Zettel und klappst trotzdem zu. Danach Tag 1: Seufzer, Raum, Handy bleibt liegen. Die Übung ist die Minute am Alarm. Verschieben ist Auslassen." },
        { tag: "Tag 5", titel: "Die letzte Sache auf den Zettel", text: "Kommt der Impuls, nur noch kurz etwas fertig zu machen, schreibst du einen Satz: was, und die Uhrzeit morgen. Der Laptop bleibt zu. Du gehst zurück zu Essen, Duschen oder Sitzen. Dauer: ein Satz. Öffnest du den Laptop dafür, hat der Impuls gewonnen." },
        { tag: "Tag 6", titel: "Zwei Minuten Bewegung, dann Seufzer", text: "Zwanzig Kniebeugen oder zwei Stockwerke Treppe, normales Tempo, nicht bis zum Brennen. Danach hinsetzen und den Seufzer von Tag 1, dreimal. Gesamtdauer etwa zwei Minuten. Die Bewegungsenergie vom Tag hat einen Ausgang. Danach kommt das Stopp. Ein langes Training nach 20 Uhr schiebt das Stopp nach hinten." },
        { tag: "Tag 7", titel: "Eine Zeile", text: "Am Abend eine Zeile auf denselben Zettel: Uhrzeit, zu der der Atem nach unten ging, und die letzte Handlung davor. Unten heißt: Schultern unten, Ausatmen länger als Einatmen, kein Griff zum Laptop. Die Handlung, die das gemacht hat, ist morgen die erste Handlung nach dem Zuklappen. Dieselbe Uhrzeit. Derselbe Seufzer." }
      ],
      naechster: [
        "Sieben Tage setzen den Schnitt an eine Uhrzeit. Im Programm über 90 Tage hängst du dieselbe Stelle an volle Wochen: nach dem Call, vor dem Feierabend, beim Zuklappen. Kurze Übungen, fest im Tag. Den Einstieg findest du bei Fokus im Job."
      ]
    },
    gruebler: {
      name: "Grübler",
      muster: [
        "Der Laptop ist zu. Der Satz aus dem Call von 16 Uhr ist wieder da. Die Mail, die schon raus ist, schreibst du im Kopf um. Der offene Punkt ohne Uhrzeit kommt als Nächstes. Du bist zu Hause und in der Antwort, die du morgen sagen willst.",
        "19:20, du isst und formulierst die Mail neu. 21:00, eine Viertelstunde derselbe Absatz. Eine Serie läuft, und danach weißt du den Inhalt nicht, weil der Satz lauter war. 23:10, Licht aus, die Einleitung für morgen steht im Dunkeln. Sonntagabend öffnet den Montag, bevor der Montag da ist."
      ],
      ausloeser: [
        "Eine offene Schleife aus der Arbeit, mit einem Gegenüber. Ein Kollege wartet auf die Antwort. Im Call ist ein Satz stehen geblieben. Der Empfänger liest die Mail anders, als du sie gemeint hast. Der langsame Planer behandelt das als aktuelle Arbeit und schiebt es in jede Lücke."
      ],
      ausloeserListe: [
        "Ein Gespräch ohne letzten Satz. Der Planer spielt die Sätze, die du im Raum nicht gesagt hast.",
        "Eine Mail, die schon weg ist. Du prüfst den Ton und schreibst sie im Kopf neu.",
        "Ein offener Punkt ohne Uhrzeit. Als Thema im Kopf hat er kein Ende. Mit Stunde und Minute ist er ein Termin.",
        "Stille nach dem Essen. Sobald keine äußere Aufgabe da ist, nimmt sich der Planer die innere.",
        "Das Handy in der Hand, kurz vor dem Schlafen. Der Posteingang liefert neues Material.",
        "Eine Zahl, die noch aussteht. Feedback, eine Entscheidung eines anderen. Du rechnest beide Ausgänge durch und kommst bei keinem an."
      ],
      nervensystem: [
        "Der langsame Planer hält offene Punkte, Formulierungen und die Reihenfolge von morgen. Im Job ist das sein Auftrag. Am Abend braucht er ein Signal, dass die Punkte bis zu einer genannten Uhrzeit zu sind. Ohne das Signal ist eine offene Schleife für ihn aktuelle Arbeit.",
        "Jede neue Formulierung ist ein Startsignal für den schnellen Alarm. Puls und Kiefer gehen mit, auch auf dem Sofa. Du merkst es am engeren Atem bei einem Satz, den niemand sonst hört. Der Planer liefert den Inhalt. Der Alarm liefert die Dringlichkeit. Zusammen wird ein normaler offener Punkt zu etwas, das noch in dieser Nacht einen Besitzer braucht. Zumachen geht über einen Gegenstand außerhalb des Kopfes: Zettel, Uhrzeit, geschlossenes Blatt. Ein Verbot, jetzt nicht mehr daran zu denken, liefert dem Planer den Satz noch einmal. In einer stillen Viertelstunde läuft es so: der Satz aus dem Call ist wieder da, du verschiebst ein Wort, der Kiefer geht zu, der Atem wird kürzer, du prüfst die Wirkung auf den anderen, dann kommt der nächste offene Punkt. Die Viertelstunde hat keinen neuen Fakt. Sie hat den Alarm viermal gestartet. Zehn Minuten mit Timer und Stift geben der Schleife ein Ende. Danach ist der Stift weg."
      ],
      lassen: [
        "Die abgeschickte Mail im Kopf neu schreiben fällt weg. Der Posteingang im Bett fällt weg. Beides ist neues Material für dieselbe Runde. Was noch offen ist, steht auf dem Zettel mit einer Uhrzeit. Was schon raus ist, bleibt raus."
      ],
      plan: [
        { tag: "Tag 1", titel: "Drei Punkte, drei Uhrzeiten", text: "Bevor du den Laptop zuklappst, zwei Minuten. Drei offene Punkte. Hinter jeden eine Uhrzeit von morgen, mit Stunde und Minute. Blatt zu, Schrift nach unten, auf die Tastatur. Ein vierter Punkt am Abend bleibt ungeschrieben bis zum Morgen. Drei sind die Grenze." },
        { tag: "Tag 2", titel: "Grübelzeit, zehn Minuten", text: "Direkt nach dem Zuklappen. Timer auf zehn Minuten. Stuhl, Stift, Blatt. In den zehn Minuten schreibst du, was hochkommt, jeden Punkt in einem Satz. Keine Antwort. Keine neue Mail. Klingelt der Timer, stehst du auf, klappst das Blatt zu und verlässt den Raum. Danach bekommt der nächste Satz keinen Stuhl. Die zehn Minuten waren die Grübelzeit. Der Abend ist zu." },
        { tag: "Tag 3", titel: "Ein Satz, keine Antwort", text: "Jedes Mal, wenn du eine Mail oder einen Satz umformulierst: eine Zeile auf den Zettel von Tag 1. Danach die Hand weg und zurück zu dem, was vor dir liegt. Essen, Weg, Duschen. Die Wirkung des Satzes prüfst du morgen, an der Uhrzeit, die schon dasteht. Heute ist der Satz nur abgelegt." },
        { tag: "Tag 4", titel: "Acht Minuten gehen, ohne Handy", text: "Nach dem Essen. Acht Minuten zu Fuß. Das Handy bleibt in der Wohnung. Keine Kopfhörer. Kein Podcast. Ein Satz, der hochkommt, bleibt ein Satz, während du gehst. Zurück am Tisch schreibst du ihn in einer Zeile auf den Zettel, wenn er noch da ist. Länger als acht Minuten wird bei dir die nächste Besprechung." },
        { tag: "Tag 5", titel: "Im Bett sechs lange Ausatmungen", text: "Licht aus. Startet der Kopf, sagst du innerlich: Das liegt auf dem Zettel. Dann sechsmal: einatmen, ausatmen länger als einatmen. Du stehst nicht auf, um die Formulierung festzuhalten. Das Handy bleibt außerhalb des Betts. Was morgen eine Uhrzeit hat, ist morgen noch da. Was nur im Dunkeln glänzt, hat keinen Zettel verdient." },
        { tag: "Tag 6", titel: "Die Mail von morgen bleibt zu", text: "Die Mail, die dich am Abend verfolgt, bleibt Entwurf oder liegt im Ordner, mit Betreff und Uhrzeit für morgen. Heute öffnest du sie nicht. Gegenlesen ist eine neue Runde mit demselben Text. Kommt der Drang, schreibst du auf den Zettel: morgen, Uhrzeit, Betreff. Handy mit dem Bildschirm nach unten, außerhalb des Schlafzimmers." },
        { tag: "Tag 7", titel: "Welche Zeile wieder kam", text: "Eine Zeile am Abend: welcher Satz heute am häufigsten zurückkam, und welche Uhrzeit morgen ihm gehört. Nur das. In der nächsten Woche bleibt das Blatt. Drei Punkte, drei Uhrzeiten, Schrift nach unten, Grübelzeit zehn Minuten, dann Raum verlassen." }
      ],
      naechster: [
        "Sieben Tage legen die offenen Punkte auf Papier und geben der Runde ein Ende mit Timer. Im Programm über 90 Tage hängst du das an feste Stellen: nach dem Call, vor dem Feierabend, vor dem Licht aus. Den Einstieg findest du bei Fokus im Job."
      ]
    },
    "erschoepft-wach": {
      name: "Erschöpft-Wacher",
      muster: [
        "Die Augen sind schwer. Im Bett wird der Kopf hell. Die Beine sind müde, der Atem wird kürzer, sobald du liegst. Du schiebst Serien, Scrollen und noch eine Runde in der Küche vor das Hinlegen, weil das Bett der Ort ist, an dem die Arbeit scharf wird.",
        "22:30, Licht aus, der Kopf zählt den morgigen Tag. 22:50, du drehst dich und wirst wacher. 3:10, du bist wach, der Puls ist da, die Zahl von morgen liegt auf der Decke. 6:30, der Posteingang ist vor dem Wasser dran. Samstag früh ist der Kopf vor dem Körper wach."
      ],
      ausloeser: [
        "Der Übergang von müde zu liegend ist hell und unfertig. Der schnelle Alarm ist über den Tag nicht mit der Muskelarbeit mitgesunken. Im Sitzen hast du noch Ablenkung. Im Liegen fällt sie weg. Diese Stellen halten die Stufe oben."
      ],
      ausloeserListe: [
        "Helles Licht und ein Bildschirm in der letzten Stunde. Das Handy im Bett ist dasselbe Signal, näher am Kopf.",
        "Koffein nach 14 Uhr. Die Beine sind müde, das System im Kopf ist wach. Beides kommt gleichzeitig im Bett an.",
        "Hinlegen mit einer offenen Liste im Kopf. Was keinen Zettel und keine Uhrzeit hat, wird im Dunkeln zur Aufgabe.",
        "Aufwachen und zum Handy greifen. Licht und die erste Mail machen aus einem kurzen Wachmoment eine zweite Schicht.",
        "Der Morgen beginnt im Posteingang, noch im Liegen. Am nächsten Abend rechnet der Alarm früher mit dieser Schicht.",
        "Eine Liegezeit, die jede Nacht neu verhandelt wird. Liegen bedeutet dann kein Ende."
      ],
      nervensystem: [
        "Müde und wach zugleich ist ein Versatz in der Zeit. Die Muskeln und die Augen haben den Tag quittiert. Der schnelle Alarm hat kein Endsignal bekommen und läuft auf der Stufe weiter, die für Entscheidungen am Nachmittag gepasst hat. Im Liegen wird diese Stufe hörbar, weil die Ablenkung weg ist. Deshalb wirst du im Bett wacher.",
        "Der langsame Planer nutzt die Stunde. Er legt die Reihenfolge von morgen auf, weil gerade niemand etwas anderes verlangt. Jeder Punkt, den er aufmacht, gibt dem Alarm einen Grund, auf Stufe zu bleiben. Nachts ist der Sprung kurz, weil die Bahn schon warm ist. Ein Geräusch reicht, und der Planer ist bei der Zahl, die am Abend schon im Raum stand. Morgens, vor Wasser und Tageslicht, ist er im ersten Punkt. Der Tag startet mit einer offenen Rechnung aus der Nacht. Im Moment des Hinlegens: die Augen sind schwer, der Brustkorb wird flacher und schneller, der Kiefer geht zu, sobald die Liste von morgen anspringt. Helles Display in der letzten Stunde hält diese Stufe. Zehn Minuten Körperdurchgang im Dunkeln geben den Muskeln eine Stelle nach der anderen, ohne neuen Input. Vier ein, acht aus in der Nacht verlängert das Ausatmen, der Puls folgt der längeren Ausatmung."
      ],
      lassen: [
        "Das Handy im Bett fällt weg. Das Scrollen, mit dem du müde werden willst, fällt weg. Der Körper ist müde. Der Bildschirm hält den Alarm an. Die offenen Punkte von morgen stehen auf einem Blatt vor der Tür des Schlafzimmers, nicht auf dem Kissen."
      ],
      plan: [
        { tag: "Tag 1", titel: "Koffein vor 14 Uhr", text: "Die letzte Tasse Kaffee oder der letzte schwarze Tee geht vor 14 Uhr durch. Danach Wasser. Ist 14 Uhr schon vorbei, fällt heute jede Tasse nach 17 Uhr weg, und die Grenze gilt ab morgen. Eine Entscheidung. Am Abend verhandelst du sie nicht neu. Koffein am späten Nachmittag und ein wacher Kopf im Bett kommen zusammen." },
        { tag: "Tag 2", titel: "Die letzte Stunde dunkler", text: "Eine Stunde vor dem Hinlegen. Großes Licht aus. Bildschirm aus dem Schlafzimmer. Das Handy lädt in einem anderen Raum. Eine kleine Lampe zum Zähneputzen. Ist noch etwas offen, kommt es auf den Zettel von Tag 3. Das Licht bleibt unten. Helligkeit in dieser Stunde ist ein Startsignal." },
        { tag: "Tag 3", titel: "Liste vor der Tür", text: "Zwei Minuten, im Stehen, bevor du das Schlafzimmer betrittst. Drei Punkte für morgen, jeder mit einer Uhrzeit. Das Blatt bleibt draußen, auf dem Tisch oder auf der Tastatur. Im Schlafzimmer liegt keine Liste. Was nach der Tür hochkommt, wartet bis zur Uhrzeit auf dem Blatt." },
        { tag: "Tag 4", titel: "Körperdurchgang, zehn Minuten", text: "Im Liegen, Augen zu, ohne Ton, ohne Handy in Reichweite. Zehn Minuten. Aufmerksamkeit von den Füßen nach oben: Füße, Unterschenkel, Oberschenkel, Bauch, Hände, Unterarme, Schultern, Kiefer, Stirn. Etwa 30 Sekunden je Stelle. Du benennst die Stelle innerlich und gehst weiter. Einschlafen in den zehn Minuten ist in Ordnung. Aufstehen und zum Telefon greifen ist die Übung daneben. Danach Licht aus." },
        { tag: "Tag 5", titel: "Dieselbe Liegezeit", text: "Eine Uhrzeit, auf die Viertelstunde genau, mit Alarm. Text: Licht runter, Zettel, hinlegen. Die Uhr gilt auch, wenn du dich noch wach fühlst. Wach ins dunkle Bett, ohne Liste, ist die Übung. Verschieben, bis du müde genug bist, trainiert die Verhandlung. Die Verhandlung ist das Muster." },
        { tag: "Tag 6", titel: "Nachts vier ein, acht aus", text: "Wenn du aufwachst: Licht aus, Handy liegen lassen. Sechs Runden. Einatmen auf vier, ausatmen auf acht. Liegen bleiben. Aufstehen nur, wenn der Körper einen praktischen Grund hat, und zurück ohne Posteingang. Ein Blick in die Mail ist eine zweite Schicht. Der Tag beginnt nicht um drei." },
        { tag: "Tag 7", titel: "Zehn Minuten Morgen ohne Posteingang", text: "Nach dem Aufstehen: Wasser, Fenster oder Tageslicht, zehn Minuten, kein Posteingang. Der erste Arbeitspunkt kommt danach, an der Uhrzeit auf dem Zettel von gestern. Am Abend desselben Tages wieder Liste vor der Tür, Licht runter, dieselbe Liegezeit." }
      ],
      naechster: [
        "Sieben Nächte stellen Licht, Zettel und Liegezeit an dieselbe Stelle. Im Programm über 90 Tage bleibt diese Stelle auch nach einer schweren Woche. Kurze Übungen am Tag, damit weniger Rest mit ins Bett geht. Den Einstieg findest du bei Fokus im Job."
      ]
    },
    reguliert: {
      name: "Regulierter",
      muster: [
        "An einem normalen Tag geht der Laptop zu, und der Körper geht mit. Schultern runter, Ausatmen länger als Einatmen, der Abend gehört einer Sache ohne Ergebnis für morgen. Der Schlaf kommt, ohne dass du ihn verhandelst.",
        "An einem vollen Tag sieht 18:30 anders aus. Der Laptop geht um 20:10 zu, die letzte Mail war noch eine Antwort, um 22:40 liegt der Montag auf dem Kissen. Sonntagabend geht der Posteingang auf. Samstag ist ruhig. Die volle Woche frisst die Stelle, an der du sonst runterkommst."
      ],
      ausloeser: [
        "Der Auslöser ist der Tag, an dem die Ausnahme vernünftig klingt. Ein Termin mehr. Eine Mail, die heute noch schicklicher wirkt als morgen. Ein Sonntag, der wie ein stiller Arbeitstag aussieht. Der schnelle Alarm folgt der Ausnahme in derselben Minute."
      ],
      ausloeserListe: [
        "Eine Schlusszeit, die an vollen Tagen gestrichen wird. Gilt die Uhr nur an ruhigen Tagen, heißt Druck: Ende aus.",
        "Die letzte Mail unter dem Satz, das dauert eine Minute. Die Minute ist der Spalt, durch den die zweite Schicht in den Abend kommt.",
        "Das Handy auf dem Tisch, Bildschirm nach oben, an dem Abend, an dem du schon unten bist.",
        "Sonntagabend. Drei Punkte für Montag aufschreiben ist ein Schluss. Den Posteingang öffnen ist ein Anfang.",
        "Eine Woche ohne eine feste Sache, die kein Ergebnis für den Job produziert. Der Alarm füllt die leere Stunde mit der nächsten Mail.",
        "Wochen außer Haus. Andere Tür, anderes Licht, keine gewohnte Uhrzeit. Ohne Ersatz wird das Zimmer zum Schreibtisch."
      ],
      nervensystem: [
        "Bei dir gehen die beiden Anteile in einer festen Reihenfolge. Der schnelle Alarm steigt, wenn eine Aufgabe oder ein Gespräch da ist: Puls, Atem, Blick nach vorn. Der langsame Planer gibt offene Punkte an eine spätere Uhrzeit ab. Am Abend sinkt die Stufe, weil ein Signal kommt, das der Körper kennt. Dieselbe Uhrzeit. Ein anderer Raum. Ein Ausatmen, das länger ist als das Einatmen. Keine leuchtende Aufgabe im Blick.",
        "Das Signal hält, solange es sich wiederholt. Fällt die Schlusszeit über Wochen aus, wird die Ausnahme zur Grundstufe. Der normale Tag fühlt sich dann eng an, obwohl die Aufgaben dieselben sind. Die Stufe vom Quartalsende ist dann die Stufe des Abends. Der Hebel ist die gleiche Geste am vollen Tag wie am ruhigen: Uhr, Raum, längeres Ausatmen, Zettel zu. An einem normalen Tag um 18:30: Laptop zu, Schultern sinken, Ausatmen wird länger, um 19 Uhr liegt kein zweiter Bildschirm neben dem Teller. An einem vollen Tag um 20:10: die letzte Mail ist noch eine Antwort, der Kiefer ist zu, um 22:40 liegt der Montag auf dem Kissen. Derselbe Mann, zwei Signale. Die Schlusszeit am vollen Tag ist das Signal, das die Ausnahme zur Grundstufe macht, wenn sie fehlt."
      ],
      lassen: [
        "Die Schlusszeit streichen, weil der Tag voll ist, fällt weg. Der volle Tag ist der Tag, an dem die Uhr gilt. Was um diese Uhrzeit noch offen ist, bekommt eine Uhrzeit für morgen. Heute geht der Laptop zu."
      ],
      plan: [
        { tag: "Tag 1", titel: "Die Uhrzeit auch am vollen Tag", text: "Trag die Feierabend-Uhrzeit für sieben Tage ein, einschließlich des Tages, der voll ist. Alarmtext: Laptop zu. Klingelt er, schreibst du Offenes mit Uhrzeit für morgen auf einen Zettel und klappst zu. Die Übung ist das Einhalten an dem Tag, an dem du die Uhr streichen willst. Ein ruhiger Tag zeigt weniger." },
        { tag: "Tag 2", titel: "Dreißig Minuten ohne zweiten Schirm", text: "Die erste halbe Stunde nach der Schlusszeit. Essen, Duschen oder ein Gang. Kein zweiter Bildschirm. Das Handy liegt in einem anderen Raum. Nach dreißig Minuten holst du es, wenn du es brauchst. Die halbe Stunde davor bleibt ohne Nachrichten." },
        { tag: "Tag 3", titel: "Acht Minuten gehen, ohne Handy", text: "Nach der Schlusszeit, acht Minuten draußen oder im Haus. Handy bleibt liegen. Keine Kopfhörer. Acht Minuten, auch wenn der Tag voll war. Kürzen auf die Tür und zurück ist schwächer. Streichen ist Auslassen." },
        { tag: "Tag 4", titel: "Seufzer vor dem schweren Gespräch", text: "Vor dem nächsten Gespräch oder der nächsten heißen Nachricht, im Stehen oder auf dem Stuhl, unter einer Minute. Zweimal durch die Nase ein, der zweite Zug kurz, lang durch den Mund aus. Dreimal. Dieselbe Folge am Abend, wenn die Schultern nach dem Zuklappen noch oben sind. Eine Geste für den Anstieg und für das Ende." },
        { tag: "Tag 5", titel: "Sonntagabend, zwei Minuten", text: "Drei Punkte für Montag, jeder mit einer Uhrzeit. Blatt zu. Posteingang zu. Ein vierter Punkt wartet bis zur ersten Uhrzeit am Montag. Die zwei Minuten ersetzen das Durchgehen des Postfachs. Danach beginnt der Montag am Montag." },
        { tag: "Tag 6", titel: "Ab 21 Uhr liegt das Handy woanders", text: "Ab 21 Uhr: anderer Raum, Bildschirm nach unten, Ton aus. Wartest du auf eine Nachricht, die zu dieser Stunde gehört, holst du sie einmal und legst das Gerät zurück. Die Übung gilt auch an dem Abend, der ruhig wirkt. Der ruhige Abend ist die Wiederholung für den vollen." },
        { tag: "Tag 7", titel: "Eine Zeile zum schweren Tag", text: "Eine Zeile: welcher Tag diese Woche das Runterkommen am schwersten gemacht hat, und welche Minute es trotzdem gemacht hat. Uhrzeit, Seufzer, Zettel oder der Gang ohne Handy. Diese Minute ist in der nächsten vollen Woche die erste Handlung nach dem Alarm. Eine Zeile, kein Plan." }
      ],
      naechster: [
        "Sieben Tage halten die Schlusszeit an dem Tag, der sie streichen will. Im Programm über 90 Tage bleibt dieselbe Stelle im Quartal stehen. Kurze Übungen unter Druck und am Feierabend. Den Einstieg findest du bei Fokus im Job."
      ]
    }
  };

  function teile(bericht) {
    var teile = [];
    bericht.muster.forEach(function (p) { teile.push(p); });
    bericht.ausloeser.forEach(function (p) { teile.push(p); });
    bericht.ausloeserListe.forEach(function (p) { teile.push(p); });
    bericht.nervensystem.forEach(function (p) { teile.push(p); });
    (bericht.lassen || []).forEach(function (p) { teile.push(p); });
    bericht.plan.forEach(function (tag) {
      teile.push(tag.tag + " " + tag.titel + " " + tag.text);
    });
    bericht.naechster.forEach(function (p) { teile.push(p); });
    return teile;
  }

  function textVon(typ) {
    var bericht = BERICHTE[typ];
    if (!bericht) return "";
    return teile(bericht).join(" ");
  }

  function wortzahl(typ) {
    var text = textVon(typ).replace(/\s+/g, " ").trim();
    if (!text) return 0;
    return text.split(" ").length;
  }

  return {
    BERICHTE: BERICHTE,
    textVon: textVon,
    wortzahl: wortzahl
  };
});
