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
        "Du klappst den Laptop zu und bleibst auf der Drehzahl vom Nachmittag. Der Kalender hat Feierabend. Die Schultern sitzen oben, der Kiefer ist zu, ein Bein wippt, obwohl du sitzt. Der Körper hat die Uhr nicht mitgelesen.",
        "Du suchst dir die nächste Sache, damit die Drehzahl irgendwohin kann. Eine Mail, die morgen früh auch noch richtig wäre. Ein Tab mit einer Zahl. Eine Folge, nebenher ein Blick aufs Handy. Oder ein Training, das du so hart ziehst, dass der Körper erst danach aufhört zu drücken. Der Abend wird eine zweite Schicht, nur ohne Termin.",
        "Von außen sieht das aus wie Disziplin. Du lieferst, du bist erreichbar, du lässt wenig liegen. Innen steht der schnelle Alarm noch im Raum. Er hat am Morgen seine Arbeit getan: wach, nach vorn, bereit für den nächsten Punkt. Am Abend hat ihm niemand ein Ende gegeben. Du bist zu Hause, und du bist nicht unten. Sätze bleiben kurz. Essen geht nebenbei. Der Blick geht aufs Handy, auch wenn du gerade nichts suchst. Der Schlaf kommt spät, weil der Körper noch auf Bereitschaft steht. Am nächsten Morgen startest du von dieser Drehzahl aus. Der Tag beginnt schon eine Stufe zu hoch.",
        "Ein normaler Abend, Minute für Minute. 18:40, der Laptop geht zu, die Schultern bleiben oben. 18:50, du stehst in der Küche und liest eine Nachricht zu Ende. 19:15, das Handy liegt neben dem Teller. 20:10, du setzt dich und suchst etwas, das dich noch beschäftigt. 22:40, du liegst, der Atem ist flach, der erste Termin von morgen ist schon im Blick. An diesem Abend hat der Körper kein einziges klares Stopp bekommen. Er hat nur immer wieder ein neues Startsignal."
      ],
      ausloeser: [
        "Der Auslöser ist der Übergang, den du auslässt. Vom Schreibtisch in den Abend, ohne eine Markierung, die der Körper merkt. Der Satz „ich habe jetzt frei“ reicht dafür nicht. Der schnelle Alarm zählt Haltung, Atem, Licht und die Frage, ob noch eine Aufgabe im Blick liegt. Diese Stellen drehen dich hoch, auch wenn der Tag auf dem Papier zu Ende ist."
      ],
      ausloeserListe: [
        "Die letzte Nachricht. Ein Satz, dann noch einer, und eine Viertelstunde ist weg. Der Alarm wertet jede Antwort als Beweis, dass die Schicht weiterläuft.",
        "Ein offener Tab mit einer Zahl für morgen. Solange die Zahl im Blick ist, bleibt die Aufgabe an. Zuklappen ist für den Körper ein anderes Signal als ein Tab, der im Hintergrund leuchtet.",
        "Das Handy mit dem Bildschirm nach oben. Jede Aufleuchtung ist ein neuer Start, auch wenn du nicht rangehst. Der Alarm kennt den Unterschied zwischen deinem Vorsatz und einem leuchtenden Rechteck nicht.",
        "Ein Tag ohne feste Schlusszeit. Du arbeitest, bis die Konzentration reißt, und nennst den Riss Feierabend. Der Körper lernt daraus: Ende ist Erschöpfung, nicht ein Zeitpunkt.",
        "Ein früher Termin am nächsten Morgen. Der Alarm rechnet ihn in den Abend hinein und hält die Spannung, als säße das Gespräch schon im Zimmer. Der langsame Planer liefert die Bilder dazu, der Alarm hält die Drehzahl.",
        "Koffein nach dem Mittag. Du gibst dem Körper ein Wach-Signal und am Abend kein Gegensignal. Die Chemie und der offene Tab ziehen in dieselbe Richtung.",
        "Ein Tag mit vielen kurzen Wechseln. Jede Unterbrechung hat den Alarm neu angefasst. Abends sitzt die Summe in den Schultern, auch wenn die einzelne Sache klein war."
      ],
      nervensystem: [
        "Zwei Anteile arbeiten im Job zusammen. Der schnelle Alarm macht dich klar, wenn etwas ansteht: Puls, Atem, Spannung in Kiefer und Nacken, Blick nach vorn. Der langsame Planer hält die Reihenfolge. Was zuerst kommt, was danach kommt, was liegen bleiben darf und was noch vor dem Ende des Tages einen Besitzer braucht.",
        "Beim Dauerläufer geht der schnelle Alarm am Abend nicht in den Leerlauf. Er bleibt auf der Stufe, die für den Nachmittag gepasst hat. Der Atem sitzt hoch und kurz. Die Muskeln halten eine Bereitschaft, für die gerade keine Aufgabe da ist. Der Planer liefert die Begründung: noch dies, noch das, sonst wird der Morgen eng. Alarm und Planer bestätigen sich gegenseitig. Der eine hält die Spannung, der andere erklärt, warum sie berechtigt ist.",
        "Der Alarm tut, wofür er gebaut ist. Er hat ein Startsignal bekommen und wartet auf ein Endsignal. Das Endsignal ist etwas, das der Körper zählt. Aufstehen. Den Raum verlassen. Ausatmen, länger als einatmen. Den Blick auf einen Punkt legen, der weiter weg ist als ein Bildschirm. Danach erst der nächste Satz im Kopf. Ein Vorsatz ohne diese Schritte bleibt eine Überschrift. Der Alarm führt keine Überschriften aus.",
        "Solange das Endsignal fehlt, liest der Alarm den stillen Abend als Pause vor dem nächsten Einsatz. Stille wird unruhig. Du füllst sie, damit das Gefühl, dass es gleich weitergeht, einen Gegenstand hat. Die Mail, die Folge, das Scrollen sind Ablagen für eine Drehzahl, die noch keinen Parkplatz hat. Runterkommen heißt bei diesem Muster einen Schnitt setzen und die Spannung einmal körperlich zurücknehmen. Danach darf der Abend gewöhnlich sein. Essen an einem Tisch. Duschen. Eine Sache, die kein Ergebnis für morgen produziert. Der Alarm hört auf kurze, klare Signale. Eine lange Rede auf dem Sofa überhört er."
      ],
      plan: [
        { tag: "Tag 1", titel: "Den Raum wechseln", text: "Wenn du den Laptop zuklappst, bleibst du nicht auf dem Stuhl. Stell dich hin. Atme sechsmal aus, jedes Mal länger als ein. Verlass den Raum, in dem du gearbeitet hast. In einer kleinen Wohnung reicht der Weg bis zur Tür, umdrehen, zurück. Erst danach nimmst du das Handy in die Hand. Das dauert unter einer Minute. Du merkst den Schnitt an den Schultern und am Atem, nicht an einem guten Gefühl. Das Gefühl kommt später, der Schnitt kommt zuerst." },
        { tag: "Tag 2", titel: "Eine Uhrzeit, die gilt", text: "Trag eine Feierabend-Uhrzeit in den Kalender, an einem normalen Tag, mit Alarm. Der Alarmtext ist ein Satz: Raum wechseln. Wenn der Alarm kommt und noch eine Mail offen ist, schreib den Betreff auf einen Zettel und klapp den Laptop trotzdem zu. Die Mail bekommt morgen eine Uhrzeit. Heute bekommt der Körper sein Ende. Die Übung ist die Minute am Alarm. Verschieben zählt an diesem Tag als Auslassen." },
        { tag: "Tag 3", titel: "Kiefer und Schultern", text: "Direkt nach dem Raumwechsel: Schultern einmal hoch zu den Ohren, drei Sekunden halten, fallen lassen. Dann den Mund einen Spalt öffnen, bis die Zähne sich nicht berühren, und die Zunge hinter die unteren Schneidezähne legen. Einmal. Das sind die zwei Stellen, an denen der Alarm bei dir am längsten wohnt. Unter dreißig Sekunden. Du machst das im Stehen, bevor du in die Küche gehst." },
        { tag: "Tag 4", titel: "Die ersten zehn Minuten", text: "Die ersten zehn Minuten nach der Arbeit gehören keiner Nachricht. Handy in einen anderen Raum, Bildschirm nach unten. Ein Glas Wasser. Ans Fenster stellen oder das Fenster auf. Hinsetzen. Wenn ein Gedanke an die Arbeit kommt, bleibt er ein Satz, den du nicht ausführst. Nach den zehn Minuten darfst du auf das Handy schauen. Diese zehn Minuten sind der Beweis für den Alarm, dass die Schicht zu ist. Ein Beweis ist eine Handlung, die er wiedererkennen kann." },
        { tag: "Tag 5", titel: "Der Drang nach der letzten Sache", text: "Wenn der Impuls kommt, nur noch kurz etwas fertig zu machen, schreib einen Satz auf den Zettel von Tag 2: was, und um welche Uhrzeit morgen. Dann geh zurück zu dem, was du gerade getan hast. Essen, duschen, sitzen. Du diskutierst den Impuls nicht aus. Der Zettel ist die Antwort. Dauert ein Satz. Wenn du den Laptop dafür wieder öffnest, hat der Impuls gewonnen. Der Stift reicht." },
        { tag: "Tag 6", titel: "Spannung abgeben", text: "Zwanzig Kniebeugen oder zwei Stockwerke Treppe, in normalem Tempo, nicht bis zum Brennen. Danach hinsetzen und sechsmal lang ausatmen, wie an Tag 1. Der Alarm hat bei dir noch Bewegungsenergie vom Tag. Die gibst du ihm in zwei Minuten, und dann kommt das Stopp. Ein langes Training am späten Abend schiebt das Stopp nach hinten und hält die Drehzahl. Kurz, dann sitzen. Das ist die ganze Übung." },
        { tag: "Tag 7", titel: "Die Minute aufschreiben", text: "Am Abend eine Zeile: Um wie viel Uhr war der Körper unten, und was war die letzte Handlung davor. Unten heißt: Schultern unten, Atem tiefer als nur im Brustkorb, kein Drang, sofort die nächste Sache anzufassen. Eine Zeile reicht. Du suchst die Handlung, die den Schnitt gemacht hat, und nimmst sie in die nächste Woche mit. Dieselbe Uhrzeit. Derselbe Raumwechsel. Aus sieben Tagen wird eine Stelle im Tag, die der Alarm wiedererkennt." }
      ],
      naechster: [
        "Sieben Tage zeigen dir den Schnitt an einer konkreten Uhrzeit. Halten tut er, wenn er auch in einer vollen Woche an derselben Stelle hängt. Dafür ist das Programm über 90 Tage da. Kurze Übungen, die in einen Arbeitstag passen, an den Stellen, an denen der Alarm hochgeht, und an der Stelle, an der er ein Ende braucht.",
        "Du fängst mit den kurzen Übungen an. Wenn du das über die neunzig Tage durchziehst, wird aus dem Raumwechsel am Laptop eine feste Stelle. Der Abend hört auf, die zweite Schicht zu sein. Der Griff am Tag bleibt. Dazu kommt ein Ende, das der Körper mitbekommt."
      ]
    },
    gruebler: {
      name: "Grübler",
      muster: [
        "Der Laptop ist zu, und der Kopf dreht die letzte Runde. Das Gespräch von 16 Uhr. Die Mail, deren Ton dir nicht sitzt. Der offene Punkt, für den du die Antwort schon dreimal umgebaut hast. Du bist zu Hause, und du bist noch in dem Satz, den du morgen sagen willst.",
        "Das Gedankenkarussell sieht bei dir nach Arbeit aus, weil die Sätze fachlich sind. Es ist Feierabend im Körper und Schicht im Kopf. Du hörst einen Halbsatz aus dem Meeting noch einmal, verschiebst ein Wort, prüfst, wie der andere ihn aufnehmen wird. Dann kommt der nächste offene Punkt an die Reihe. Der langsame Planer schließt die Akte nicht.",
        "Von außen bist du ruhig. Innen läuft eine zweite Besprechung, und du bist der einzige im Raum. Essen schmeckt nebenher. Eine Serie läuft, und danach weißt du nicht, worum es ging, weil der Satz für morgen lauter war. Im Bett kommt die beste Formulierung. Du stehst noch einmal auf oder tippst sie ins Handy. Danach ist der Kopf hell, und der Satz hat schon die nächste Lücke gefunden.",
        "Ein normaler Abend, Minute für Minute. 18:40, der Laptop geht zu. 18:42, der eine Satz aus dem Call ist wieder da. 19:20, du isst und formulierst die Mail um. 21:00, du sitzt und merkst, dass du die letzte Viertelstunde denselben Absatz gedacht hast. 23:10, Licht aus, und die Einleitung des morgigen Gesprächs steht im Dunkeln vor dir. Der Tag hat aufgehört. Die Akte ist offen geblieben."
      ],
      ausloeser: [
        "Der Auslöser ist eine offene Schleife mit einem Gegenüber aus der Arbeit. Ein Kollege wartet auf die Antwort, im Call ist ein Satz stehen geblieben, der Empfänger liest die Mail anders, als du sie gemeint hast. Der langsame Planer behandelt das als unfertige Arbeit und schiebt sie in jede Lücke. Diese Stellen öffnen die Akte wieder, auch wenn du sie schon einmal geschlossen hattest."
      ],
      ausloeserListe: [
        "Ein Gespräch, das ohne klaren letzten Satz endete. Der Planer spielt die Varianten, die du im Raum nicht gesagt hast.",
        "Eine Mail, die du abgeschickt hast und deren Ton dir danach zu hart oder zu weich vorkommt. Du schreibst sie im Kopf neu, obwohl sie schon weg ist.",
        "Ein offener Punkt ohne Uhrzeit. Solange er nur als Thema im Kopf liegt, hat er keinen Feierabend. Eine Uhrzeit macht aus dem Thema einen Termin, und Termine haben ein Ende.",
        "Stille am Abend. Sobald keine äußere Aufgabe da ist, nimmt sich der Planer die innere vor. Stille ist bei dir die Tür zur nächsten Runde.",
        "Das Handy in der Hand, kurz vor dem Schlafen. Ein Blick in den Posteingang liefert neues Material für die Runde, die gerade leiser werden wollte.",
        "Eine Bewertung, die noch aussteht. Eine Zahl, ein Feedback, eine Entscheidung eines anderen. Der Planer simuliert das Ergebnis in beiden Richtungen und kommt bei keiner an.",
        "Der Übergang ins Bett ohne einen abgelegten Satz. Was im Stehen noch zerstreut war, wird im Liegen scharf. Der Körper ist still, der Planer hat die Bühne."
      ],
      nervensystem: [
        "Der langsame Planer ist der Anteil, der vorausdenkt. Er hält offene Punkte, Formulierungen und die Reihenfolge von morgen. Im Job ist das sein Auftrag. Am Abend, wenn die Arbeit für heute vorbei ist, braucht er ein Signal, dass die Akte bis zu einer genannten Uhrzeit zu ist. Ohne dieses Signal arbeitet er in der Lücke weiter, weil eine offene Akte für ihn eine aktuelle Akte ist.",
        "Der schnelle Alarm hängt sich an diese Runden dran. Jede neue Formulierung ist ein kleines Startsignal: da ist noch ein Satz ohne Abschluss. Puls und Kiefer gehen mit, auch wenn du auf dem Sofa sitzt. Du merkst es daran, dass der Körper mitdenkt. Enger Atem bei einem Satz, den niemand sonst hört. Der Planer liefert den Inhalt, der Alarm liefert die Dringlichkeit. Zusammen fühlt sich ein normaler offener Punkt an wie etwas, das noch heute Nacht einen Besitzer braucht.",
        "Zumachen geht über die Außenwelt, nicht über den Vorsatz, jetzt nicht mehr daran zu denken. Der Planer versteht einen Gegenstand besser als ein Verbot. Ein Zettel mit drei Punkten und drei Uhrzeiten ist so ein Gegenstand. Die Akte hat einen Ort außerhalb des Kopfes und einen Zeitpunkt, an dem sie wieder aufgeht. Bis dahin ist sie zu. Wenn ein Satz zurückkommt, zeigt der Zettel, dass der Punkt schon einen Platz hat. Der Kopf muss ihn nicht noch einmal halten.",
        "Grübeln ist hier ein offenes Programm, das auf Input wartet. Jeder Blick in die Mail, jedes Umdrehen eines Satzes im Dunkeln ist neuer Input. Die Übung entzieht dem Programm den Input und gibt ihm einen Ablageort. Danach darf der Abend ein Abend sein. Der Planer ist am nächsten Morgen wieder da, an der Uhrzeit, die auf dem Zettel steht. Du verlierst den Punkt nicht. Du hörst auf, ihn nachts zu beherbergen."
      ],
      plan: [
        { tag: "Tag 1", titel: "Drei Punkte, drei Uhrzeiten", text: "Bevor du den Laptop zuklappst, schreib drei offene Punkte auf. Hinter jeden eine Uhrzeit von morgen, konkret, mit Stunde und Minute. Dann klapp das Blatt zu und leg es auf die Tastatur, mit der Schrift nach unten. Der Kopf hat die Akte gesehen. Sie liegt außerhalb. Wenn am Abend ein vierter Punkt hochkommt, bleibt er bis morgen früh ungeschrieben. Drei sind die Grenze an diesem Tag. Das dauert zwei Minuten." },
        { tag: "Tag 2", titel: "Zehn Minuten Parkplatz", text: "Stell einen Timer auf zehn Minuten. In diesen zehn Minuten darfst du die Runde drehen, auf einem Stuhl, mit Stift. Was hochkommt, kommt in einen Satz aufs Papier, ohne Antwort und ohne neue Mail. Wenn der Timer klingelt, steht du auf und verlässt den Raum. Die Runde hat ein Ende bekommen, das du hören kannst. Danach gibst du dem nächsten Satz keinen Stuhl mehr. Der Parkplatz war heute. Der Abend ist zu." },
        { tag: "Tag 3", titel: "Ein Satz, keine Antwort", text: "Jedes Mal, wenn du merkst, dass du eine Mail oder einen Satz umformulierst, schreib die Formulierung in einem Satz auf den Zettel von Tag 1. Danach machst du mit dem weiter, was vor dir liegt. Essen, Weg, Duschen. Du prüfst den Satz nicht auf Wirkung. Die Prüfung ist die Arbeit von morgen, an der Uhrzeit, die schon dasteht. Heute ist der Satz nur abgelegt. Ein Griff zum Stift, dann die Hand weg." },
        { tag: "Tag 4", titel: "Acht Minuten ohne Ton", text: "Acht Minuten zu Fuß, ohne Podcast, ohne Telefonat, ohne Kopfhörer. Straße, Treppe, Häuserblock, egal. Der Planer wird in der Stille anklopfen. Du lässt den Satz kommen und schickst ihn auf den Zettel, sobald du zurück bist, in einem Satz. Während du gehst, fasst du ihn nicht an. Die Übung trainiert den Abstand zwischen Auftauchen und Bearbeiten. Acht Minuten reichen. Länger wird bei dir schnell wieder eine Besprechung." },
        { tag: "Tag 5", titel: "Im Bett den Zettel lassen", text: "Wenn der Kopf im Liegen startet, sag innerlich den Satz: Das liegt auf dem Zettel. Dann zähl sechs lange Ausatmungen. Steh nicht auf, um die Formulierung festzuhalten, und nimm das Handy nicht in die Hand. Was stark genug ist, ist morgen früh noch da, an der Uhrzeit auf dem Blatt. Was nur im Dunkeln glänzt, darf verblassen. Die Übung ist das Liegenbleiben. Der Zettel trägt die Verantwortung bis zum Morgen." },
        { tag: "Tag 6", titel: "Die Mail von morgen bleibt zu", text: "Die eine Mail, die dich abends verfolgt, kommt in einen Ordner oder bleibt als Entwurf mit dem Betreff und der Uhrzeit von morgen. Heute öffnest du sie nicht mehr. Auch nicht zum Gegenlesen. Gegenlesen ist eine neue Runde mit demselben Material. Wenn der Drang kommt, schreibst du auf den Zettel: morgen, Uhrzeit, Betreff. Dann Handy mit dem Bildschirm nach unten, außerhalb des Betts. Der Ordner ist der geschlossene Aktendeckel." },
        { tag: "Tag 7", titel: "Welcher Satz wieder kam", text: "Eine Zeile am Abend: Welcher Satz oder welcher Punkt ist heute am häufigsten zurückgekommen, und welche Uhrzeit morgen gehört ihm. Nur das. Du siehst, was der Planer für unerledigt hält, und gibst dem Punkt einen Besitzer in der Zeit. In der nächsten Woche bleibt das Blatt. Drei Punkte, drei Uhrzeiten, Schrift nach unten. Dasselbe Ende, damit der Kopf die Geste wiedererkennt." }
      ],
      naechster: [
        "Sieben Tage legen die Akte auf Papier. Über neunzig Tage wird daraus die Stelle im Tag, an der du zumachst, auch wenn das Gespräch am Nachmittag schwerer war als heute. Das Programm arbeitet mit kurzen Übungen an festen Punkten. Nach dem Call, vor dem Feierabend, im Übergang ins Bett.",
        "Der Kopf darf im Job präzise bleiben. Die Runde am Abend ist eine zweite Besprechung ohne Gegenseite und ohne Ende. Die neunzig Tage geben dieser Besprechung eine Tür, die zugeht. Der Zettel ist der Anfang. Die Wiederholung macht ihn zur Gewohnheit, die auch in einer vollen Woche noch da ist."
      ]
    },
    "erschoepft-wach": {
      name: "Erschöpft-Wacher",
      muster: [
        "Der Körper ist müde, der Kopf bleibt an. Die Augen sind schwer, und sobald du liegst, wird es im Kopf hell. Du hast den Tag gegeben. Die Bereitschaft ist trotzdem noch im System. Müdigkeit und Wachheit liegen übereinander, und die Wachheit gewinnt im Dunkeln.",
        "Der Abend fühlt sich an wie ein Akku auf der Reserve, bei dem das Display noch auf voller Helligkeit steht. Du schiebst Dinge vor dem Hinlegen her, weil das Bett der Ort ist, an dem die Arbeit scharf wird. Serien, Scrollen, noch eine Runde in der Küche. Das sind Versuche, müde genug zu werden, damit der Kopf mitgeht. Der Körper war schon müde. Der Alarm hat das Hinlegen als Start gelesen.",
        "Nachts ist der Sprung kurz. Du wachst auf, und die Zahlen, die Mail, der Termin sind sofort da, ohne Anlauf. Morgens bist du vor dem ersten Kaffee schon im ersten Punkt des Tages. Der Schlaf hat Löcher, und durch die Löcher scheint die Arbeit. Du stehst auf mit dem Gefühl, die Nacht sei eine dünne Decke über demselben Tag gewesen.",
        "Ein normaler Abend, Minute für Minute. 22:10, du bist platt und gehst ins Bad. 22:30, Licht aus, und der Kopf zählt auf, was morgen zuerst dran ist. 22:50, du drehst dich und wirst wacher. 3:10, du bist wach, der Puls ist da, der Tag von morgen liegt auf der Decke. 6:30, der Wecker kommt, und du bist schon mittendrin. Der Körper hat gelegen. Ausgeruht ist ein anderes Wort."
      ],
      ausloeser: [
        "Der Auslöser sitzt im Übergang von müde zu liegend, und in allem, was diesen Übergang hell und unfertig macht. Der schnelle Alarm sinkt über den Tag nicht mit der Muskelleistung mit. Er bleibt auf einer Stufe, die für Entscheidungen richtig war, und das Bett gibt ihm wenig zu tun, also nimmt er sich die offenen Punkte. Diese Stellen halten die Stufe oben."
      ],
      ausloeserListe: [
        "Licht und Bildschirm in der letzten Stunde. Helles Licht sagt dem Alarm, der Tag sei noch in der aktiven Phase. Das Handy im Bett ist dasselbe Signal, nur näher am Kopf.",
        "Koffein nach dem frühen Nachmittag. Die Müdigkeit in den Beinen und ein waches System im Kopf kommen dann gleichzeitig an. Das ist genau die Übereinanderlage, die dich im Bett hell macht.",
        "Hinlegen mit einer offenen Liste im Kopf. Was keinen Zettel und keine Uhrzeit hat, wird im Dunkeln zur Aufgabe. Der Alarm behandelt Unklares als aktuell.",
        "Aufwachen und zum Handy greifen. Das Licht und die erste Mail machen aus einem kurzen Wachmoment eine zweite Schicht. Der Körper kommt aus dem Schlaf, der Alarm geht auf Tagbetrieb.",
        "Morgenroutine, die mit dem Posteingang beginnt. Du bestätigst dem System, dass der Tag vor dem Aufstehen schon läuft. Am nächsten Abend rechnet der Alarm früher mit dieser Schicht.",
        "Tage, an denen du körperlich leer bist und geistig noch haftest. Je weniger Bewegungsreserve da ist, desto lauter wird der Rest an Spannung im Kiefer, im Bauch, in der Brust.",
        "Eine unregelmäßige Liegezeit. Der Alarm lernt kein Fenster, in dem Liegen das Ende bedeutet. Jede Nacht ist ein neuer Verhandlungstermin."
      ],
      nervensystem: [
        "Müde und wach zugleich ist ein zeitlicher Versatz. Die Muskeln und die Augen haben die Arbeit des Tages quittiert. Der schnelle Alarm hat sein Endsignal nicht bekommen und läuft auf der Entscheidungsstufe weiter. Im Sitzen hast du noch Ablenkung. Im Liegen fällt die Ablenkung weg, und die Stufe wird hörbar. Deshalb wirst du im Bett wacher. Das Bett hat den Lärm der Außenwelt leiser gemacht und den Alarm damit freigestellt.",
        "Der langsame Planer nutzt diese freigestellte Stunde. Er legt die Reihenfolge von morgen auf den Tisch, weil niemand sonst etwas verlangt. Jeder Punkt, den er aufmacht, gibt dem Alarm einen neuen Grund, auf Stufe zu bleiben. Nachts ist der Sprung deshalb so kurz: die Bahn ist schon warm. Ein Geräusch, eine volle Blase, ein Traumfetzen reichen, und der Planer ist bei der Zahl, die am Abend schon im Raum stand.",
        "Morgens greift dasselbe Muster nach vorn. Bevor Kaffee, Wasser und Tageslicht da sind, ist der Planer im ersten Punkt. Der Körper ist noch im Hochfahren, der Alarm ist schon im Meeting. Der Tag startet mit einer Schuld an Erholung, und am Abend ist die Übereinanderlage wieder da. Die Schleife schließt sich, wenn das Ende am Abend und der Anfang am Morgen dieselbe Klarheit haben.",
        "Das Endsignal für dieses Muster ist ein dunkler, bekannter Übergang ohne offene Punkte. Licht runter. Handy aus dem Bett. Die drei Punkte von morgen auf Papier, bevor du das Schlafzimmer betrittst. Im Liegen zählt der Atem, nicht der nächste Satz. Wenn du nachts wach wirst, bleibt das Licht aus und das Handy liegen. Der Alarm lernt: Wach im Dunkeln ist noch Nacht. Diese Unterscheidung ist der ganze Hebel. Sie ist konkret, und sie ist jede Nacht dieselbe."
      ],
      plan: [
        { tag: "Tag 1", titel: "Koffein hat eine Uhrzeit", text: "Heute geht die letzte Tasse Kaffee oder der letzte schwarze Tee vor 14 Uhr durch. Danach Wasser. Das ist eine Verhaltensgrenze, damit die Wach-Chemie am Abend nicht gegen das Hinlegen arbeitet. Wenn 14 Uhr schon vorbei ist, gilt die Grenze ab morgen, und heute fällt wenigstens die Tasse nach 17 Uhr weg. Eine Entscheidung, einmal am Tag. Du verhandelst sie am Abend nicht neu." },
        { tag: "Tag 2", titel: "Die letzte Stunde dunkler", text: "Eine Stunde vor dem Hinlegen: großes Licht aus, Bildschirm weg vom Bett, Handy lädt in einem anderen Raum. Eine kleine Lampe reicht zum Zähneputzen. Der Alarm soll Helligkeit mit Arbeit verbinden und Dunkelheit mit Ende. Heute gibst du ihm eine Stunde, in der diese Zuordnung stimmt. Wenn du die Stunde reißen willst, weil noch etwas offen ist, kommt es auf den Zettel von Tag 3, und das Licht bleibt unten." },
        { tag: "Tag 3", titel: "Liste vor der Tür", text: "Bevor du das Schlafzimmer betrittst, schreib drei Punkte für morgen auf, jeden mit einer Uhrzeit. Das Blatt bleibt draußen, auf dem Tisch oder auf der Tastatur. Im Schlafzimmer liegt keine Liste. Der Planer hat die Akte an einem Ort, der nicht das Kissen ist. Die Übung dauert zwei Minuten und passiert im Stehen. Danach ist die Tür eine Grenze. Was danach hochkommt, hat seinen Platz schon verpasst und wartet bis zur Uhrzeit auf dem Blatt." },
        { tag: "Tag 4", titel: "Kiefer, Schultern, Bauch", text: "Im Sitzen, eine Stunde vor dem Licht aus: Kiefer einen Spalt öffnen, Zunge hinter die unteren Zähne. Schultern hoch, drei Sekunden, fallen lassen. Eine Hand auf den Bauch, sechsmal ausatmen, die Ausatmung länger als die Einatmung. Das sind die drei Stellen, an denen die übrige Spannung bei diesem Muster wohnt. Unter einer Minute. Du machst das bei der kleinen Lampe, ohne Handy in der anderen Hand." },
        { tag: "Tag 5", titel: "Dieselbe Liegezeit", text: "Heute und die nächsten Tage gilt eine Liegezeit, auf die Viertelstunde genau, auch wenn du dich noch wach fühlst. Wach ins Bett mit dunklem Raum und ohne Liste ist Teil der Übung. Der Alarm lernt das Fenster nur, wenn es wiederkommt. Verschieben, bis du müde genug bist, trainiert die Verhandlung, und die Verhandlung ist das Muster. Stell einen Alarm auf diese Uhrzeit mit dem Satz: Licht runter, Zettel, hinlegen." },
        { tag: "Tag 6", titel: "Nachts liegen bleiben", text: "Wenn du aufwachst, bleibt das Licht aus und das Handy liegen. Zähl die Ausatmung bis zehn, dann von vorn, bis der nächste Absatz kommt oder bis du wieder weg bist. Steh nur auf, wenn der Körper einen praktischen Grund hat, und komm ohne Umweg über den Posteingang zurück. Ein nächtlicher Blick in die Mail ist eine zweite Schicht. Die Übung ist das Liegen im Dunkeln. Der Tag beginnt nicht um drei." },
        { tag: "Tag 7", titel: "Der Morgen beginnt ohne Posteingang", text: "Die ersten zehn Minuten nach dem Aufstehen: Wasser, Tageslicht oder das Fenster, kein Posteingang. Der erste Arbeitsgedanke bekommt danach seinen Platz, an der Uhrzeit auf dem Zettel von gestern Abend. Du bestätigst dem Alarm, dass der Tag an einer Tür beginnt und nicht im Liegen. Am Abend desselben Tages wiederholst du Tag 3. Liste draußen, Licht runter, dieselbe Liegezeit. Die Nacht und der Morgen sind ein Paar." }
      ],
      naechster: [
        "Sieben Nächte stellen das Fenster hin. Über neunzig Tage wird aus dem Fenster eine Stelle, die auch nach einer schweren Woche noch gilt. Das Programm legt kurze Übungen auf den Tag, damit der Alarm am Abend weniger Rest mit ins Bett nimmt. Fokus am Nachmittag und ein klares Ende gehören zusammen.",
        "Der Körper darf müde sein nach einem vollen Tag. Die Helligkeit im Kopf um halb elf ist die Stufe, die kein Ende bekommen hat. Die neunzig Tage üben dieses Ende an derselben Stelle, bis Liegen wieder Nacht bedeutet und der Morgen bei Wasser und Licht anfängt."
      ]
    },
    reguliert: {
      name: "Regulierter",
      muster: [
        "Du kommst nach der Arbeit runter. An einem normalen Tag geht der Laptop zu, und der Körper geht mit. Der Abend gehört einer Sache, die kein Ergebnis für morgen produzieren muss. Du kannst sitzen, ohne dir die nächste Aufgabe zu suchen. Das ist ein funktionierender Schnitt, und er ist konkret: Uhrzeit, Raum, Atem, und ein Kopf, der die Akte zu hat.",
        "Der schnelle Alarm geht bei dir hoch, wenn der Tag es verlangt, und er findet am Abend den Weg in den Leerlauf. Der langsame Planer packt die offenen Punkte so weit zusammen, dass sie den Abend nicht regieren. Du merkst das daran, dass Gespräche am Abend bei der Sache bleiben, die vor dir liegt, und dass der Schlaf kommt, ohne dass du ihn ausverhandelst.",
        "Die empfindliche Stelle ist die volle Woche. Ein Quartalsende, eine Woche mit Terminen außer Haus, drei Tage mit zu vielen Wechseln. Dann rutscht die feste Uhrzeit, die letzte Mail wird länger, und der Sonntagabend öffnet schon den Montag. Der Abend wird eine zweite Schicht, nur später und kürzer. Es kommt über die Ausnahme, und die Ausnahme wird zur neuen Normalität, wenn der Anker fehlt.",
        "Ein normaler Abend, Minute für Minute, an einem guten Tag. 18:30, der Laptop geht zu. 18:35, du bist aus dem Raum draußen. 19:00, Essen ohne zweiten Bildschirm. 21:30, der Kopf ist bei dem, was du gerade tust. In einer vollen Woche sieht 18:30 anders aus: der Laptop geht um 20:10 zu, die letzte Mail war noch eine Antwort, und um 22:40 liegt der Montag schon auf dem Kissen. Der Unterschied ist die Stelle, die du festgehalten hast oder ausgelassen."
      ],
      ausloeser: [
        "Der Auslöser ist der Tag, an dem die Ausnahme vernünftig klingt. Ein Termin mehr, eine Mail, die heute noch schicklicher wirkt als morgen, ein Sonntag, der sich wie ein stiller Arbeitstag anfühlt. Der Alarm folgt der Ausnahme sofort. Diese Stellen lösen den Anker, auch wenn der normale Tag bei dir sitzt."
      ],
      ausloeserListe: [
        "Eine Schlusszeit, die du an vollen Tagen streichen darfst. Sobald die Uhr nur für ruhige Tage gilt, hat der Alarm gelernt, dass Druck das Ende aufhebt.",
        "Die letzte Mail unter dem Satz, das dauert nur eine Minute. Die Minute ist der Spalt, durch den die zweite Schicht wieder in den Abend kommt.",
        "Das Handy am Tisch, Bildschirm nach oben, an dem Abend, an dem du schon unten bist. Eine Aufleuchtung reicht, um die Akte wieder aufzuklappen.",
        "Sonntagabend ohne Grenze. Drei Punkte für Montag aufzuschreiben ist ein Schluss. Den Posteingang zu öffnen ist ein Anfang. Der Unterschied ist eine Geste.",
        "Eine Woche ohne die eine Sache, die nichts mit Arbeit zu tun hat. Wenn der Abend nur noch Resteverwertung ist, hat der Schnitt keinen Inhalt mehr, und der Alarm füllt ihn.",
        "Druck, den du mit mehr Drehzahl beantwortest, ohne den langen Atem davor. Der Alarm bleibt dann auf der Stufe des Gesprächs und nimmt sie mit nach Hause.",
        "Wochen außer Haus und fremde Hotels, in denen die übliche Tür, das übliche Licht und die übliche Uhrzeit fehlen. Ohne Ersatzanker wird jedes Zimmer zum Schreibtisch."
      ],
      nervensystem: [
        "Bei dir schalten die beiden Anteile in der richtigen Reihenfolge. Der schnelle Alarm geht auf Stufe, wenn eine Aufgabe, ein Gespräch oder eine Entscheidung da ist. Der langsame Planer hält die Reihenfolge und gibt die offenen Punkte an einen späteren Zeitpunkt ab. Am Abend sinkt die Stufe, weil ein Endsignal kommt, das der Körper kennt: dieselbe Uhrzeit, ein anderer Raum, ein Atem, der länger aus- als eingeht, und keine leuchtende Aufgabe im Blick.",
        "Dieses Endsignal ist gelernt. Es ist keine Eigenschaft, die bleibt, wenn du sie ignorierst. Nervensysteme halten, was sich wiederholt, und sie geben her, was eine Woche lang ausfällt. Drei volle Wochen ohne die Schlusszeit reichen, damit der Alarm die Ausnahme für die neue Regel hält. Du merkst es daran, dass der normale Tag sich plötzlich anstrengend anfühlt, obwohl die Aufgaben dieselben sind. Die Stufe vom Quartalsende ist dann die Grundstufe.",
        "Der Hebel ist langweilig und genau deshalb stark. Dieselbe Uhrzeit in der vollen Woche, nicht nur in der ruhigen. Dieselbe Geste am Sonntagabend: drei Punkte, Blatt zu, Posteingang zu. Unter Druck ein langer Atem, bevor du das nächste Thema aufmachst, damit die Stufe zum Gespräch passt und nicht darüber hinausschießt. Der Planer bleibt brauchbar, weil er Punkte an Uhrzeiten bindet. Der Alarm bleibt brauchbar, weil er ein Ende sieht, das auch unter Last noch kommt.",
        "Reguliert heißt hier: der Wechsel funktioniert auf einem normalen Tag, und du hast eine Stelle, an der du ihn festmachst, wenn der Kalender voll wird. Die Arbeit der nächsten Wochen ist der Schutz dieser Stelle. Wer den Schnitt schon kann, verliert ihn an die Ausnahme. Wer die Ausnahme mit demselben Schnitt beantwortet, behält den Abend."
      ],
      plan: [
        { tag: "Tag 1", titel: "Die Uhrzeit auch für die volle Woche", text: "Trag die Feierabend-Uhrzeit für die nächsten sieben Tage ein, einschließlich des Tages, der schon voll aussieht. Der Alarmtext lautet: Laptop zu, Raum wechseln. An dem vollen Tag gilt die Uhrzeit in dem Moment, in dem sie klingelt. Was noch offen ist, bekommt eine Uhrzeit morgen auf einem Zettel. Die Übung ist das Einhalten an dem Tag, an dem du die Uhr am liebsten streichen würdest. Ein ruhiger Tag beweist weniger." },
        { tag: "Tag 2", titel: "Dreißig Minuten ohne zweiten Schirm", text: "Die erste halbe Stunde nach der Schlusszeit gehört einer Sache ohne Nachrichten und ohne zweiten Bildschirm. Essen, Duschen, ein Gang um den Block. Das Handy liegt in einem anderen Raum. Du bestätigst dem Alarm, dass auf die Uhrzeit eine Phase folgt, die er wiedererkennen kann. Dreißig Minuten. Danach darfst du schauen. Die Phase davor bleibt sauber." },
        { tag: "Tag 3", titel: "Zwanzig Minuten, die der Arbeit nicht gehören", text: "Trag zwanzig Minuten in den Kalender für etwas, das kein Ergebnis für den Job produziert. Ein Gang, Kochen, ein Kapitel, ein Training in normalem Tempo. Die zwanzig Minuten haben einen Anfang und ein Ende, wie ein Termin. Der Abend braucht einen Inhalt, sonst füllt der Alarm die Lücke mit der nächsten Mail. Heute findet dieser Termin statt, auch wenn der Tag voll war. Kürzen auf zehn Minuten ist erlaubt. Streichen ist auslassen." },
        { tag: "Tag 4", titel: "Unter Druck zuerst ausatmen", text: "Vor dem nächsten Gespräch oder der nächsten heißen Nachricht: sechsmal ausatmen, länger aus als ein, bevor du das Thema aufmachst. Dieselbe Geste am Abend, wenn du merkst, dass die Drehzahl vom Tag noch da ist. Der Alarm bekommt unter Last ein bekanntes Signal und am Abend dasselbe Signal als Ende. Eine Geste für zwei Stellen. Unter einer Minute, im Stehen oder auf dem Stuhl, bevor die erste Silbe kommt." },
        { tag: "Tag 5", titel: "Sonntagabend zu", text: "Drei Punkte für Montag, jeder mit einer Uhrzeit. Blatt zu. Posteingang zu. Danach beginnt der Montag nicht mehr vor dem Montag. Wenn ein vierter Punkt hochkommt, bleibt er bis zur ersten Uhrzeit am Montag draußen. Die Geste dauert zwei Minuten und ersetzt das Durchscrollen des Postfachs. Der Planer hat einen Ablageort. Der Alarm hat ein Ende vor der Nacht." },
        { tag: "Tag 6", titel: "Nach 21 Uhr liegt das Handy woanders", text: "Ab 21 Uhr liegt das Handy in einem anderen Raum, Bildschirm nach unten, Ton aus. Wenn du auf eine Nachricht wartest, die wirklich zu dieser Stunde gehört, holst du sie einmal und legst das Gerät zurück. Alles andere ist die Akte, die sich selbst wieder öffnet. Die Übung gilt auch an dem Abend, der sich harmlos anfühlt. Der harmlose Abend ist das Training für den vollen." },
        { tag: "Tag 7", titel: "Eine Zeile zur schweren Stelle", text: "Schreib eine Zeile: An welchem Tag war das Runterkommen diese Woche am schwersten, und welche Minute hat trotzdem funktioniert. Die Uhrzeit, der Raumwechsel, die sechs Ausatmungen, der Zettel. Diese Minute nimmst du in die nächste volle Woche als erste Handlung mit, nicht als Idee. Eine Zeile. Damit bleibt der Anker an der Stelle hängen, an der er sonst als Erstes wegbricht." }
      ],
      naechster: [
        "Sieben Tage sichern eine Stelle, die bei dir schon vorhanden ist. Über neunzig Tage bleibt sie auch im Quartal stehen, in dem die Ausnahme jeden Tag vernünftig klingt. Das Programm legt kurze Übungen auf den Arbeitstag, damit Fokus unter Druck und Feierabend an der Uhrzeit zusammen gehören.",
        "Du brauchst kein neues Muster. Du brauchst die Wiederholung des Schnitts an den Tagen, die ihn am ehesten schlucken. Die neunzig Tage sind diese Wiederholung. Kurz, an festen Stellen, auch wenn der Kalender dagegen spricht."
      ]
    }
  };

  function teile(bericht) {
    var teile = [];
    bericht.muster.forEach(function (p) { teile.push(p); });
    bericht.ausloeser.forEach(function (p) { teile.push(p); });
    bericht.ausloeserListe.forEach(function (p) { teile.push(p); });
    bericht.nervensystem.forEach(function (p) { teile.push(p); });
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
