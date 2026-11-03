# Spec Delta

## Purpose

Gespräche lassen sich auf einen Custom Folder ziehen. Das setzt den Tag dieses Ordners, wie das Ablegen auf einem Gmail-Label, und verschiebt das Gespräch nicht aus seinem Statusordner.

## ADDED Requirements

### Requirement: Ziehen setzt den Tag des Ordners
Das System MUST erlauben, ein Gespräch oder die markierte Auswahl aus der Liste auf einen sichtbaren Custom Folder derselben Mailbox zu ziehen. Danach MUST das Gespräch den Tag dieses Ordners tragen. Andere Tags MUST bleiben. Der Tag eines Elternordners oder Unterordners MUST NOT gesetzt werden.

#### Scenario: Ein Gespräch
- **WHEN** jemand ein Gespräch auf den Ordner Onboarding zieht und dieser Ordner einen Tag hat
- **THEN** trägt das Gespräch diesen Tag

#### Scenario: Auswahl
- **WHEN** mehrere Gespräche markiert sind und die gezogene Zeile dazugehört
- **THEN** trägt jedes markierte Gespräch der Mailbox den Tag des Zielordners

#### Scenario: Eine Zeile außerhalb der Auswahl
- **WHEN** andere Gespräche markiert sind und die gezogene Zeile nicht dazugehört
- **THEN** erhält nur das gezogene Gespräch den Tag

#### Scenario: Tag schon gesetzt
- **WHEN** das Gespräch den Tag des Zielordners schon trägt
- **THEN** bleibt der Tag gesetzt und das Ziehen gilt als gelungen

#### Scenario: Verschachtelt ohne Wissen um den Baum
- **WHEN** Onboarding unter Personal sichtbar ist und jemand ein Gespräch auf Onboarding zieht
- **THEN** trägt das Gespräch den Tag von Onboarding und nicht den Tag von Personal

#### Scenario: Nachgeladene Zeile
- **WHEN** die Liste weitere Gespräche nachlädt
- **THEN** lässt sich eine nachgeladene Zeile genauso auf einen Ordner ziehen

### Requirement: Klick öffnet das Gespräch
Ein Klick auf den Betreff MUST das Gespräch öffnen. Ein Ziehen MUST NOT die Adresse des Links als Ziel verwenden.

#### Scenario: Betreff anklicken
- **WHEN** jemand den Betreff anklickt, ohne die Zeile auf einen Ordner zu ziehen
- **THEN** öffnet sich das Gespräch und es wird kein Tag gesetzt

### Requirement: Grobe Eingabe scrollt die Liste
Bei grober Eingabe MUST die Gesprächsliste scrollbar bleiben. Ein solches Ziehen MUST NOT einen Tag setzen.

#### Scenario: Finger auf der Liste
- **WHEN** jemand die Gesprächsliste mit dem Finger verschiebt
- **THEN** scrollt die Liste und kein Tag wird gesetzt

### Requirement: Das Gespräch bleibt im Statusordner
Das Ziehen MUST den Status des Gesprächs unverändert lassen. Im Zielordner MUST es nur erscheinen, wenn es die bisherigen Filter dieses Ordners erfüllt.

#### Scenario: Weiter unzugewiesen
- **WHEN** ein unzugewiesenes Gespräch auf einen Custom Folder gezogen wird
- **THEN** ist es danach weiterhin unzugewiesen und trägt zusätzlich den Tag

#### Scenario: Filter des Ordners
- **WHEN** der Zielordner nur eigene Gespräche zeigt und das gezogene Gespräch jemand anderem gehört
- **THEN** trägt das Gespräch den Tag und erscheint in diesem Ordner nicht

### Requirement: Nur Ordner mit Tag sind Ziele
Ein Custom Folder ohne Tag und jeder Systemordner MUST NOT ein Ablegeziel sein. Während des Ziehens MUST ein gültiges Ziel erkennbar sein.

#### Scenario: Ordner ohne Tag
- **WHEN** jemand ein Gespräch auf einen Custom Folder ohne Tag zieht
- **THEN** wird kein Tag gesetzt

#### Scenario: Systemordner
- **WHEN** jemand ein Gespräch auf Nicht zugewiesen oder Mir zugewiesen zieht
- **THEN** wird kein Tag gesetzt

### Requirement: Nur erlaubte Gespräche
Das System MUST den Tag nur setzen, wenn die Person das Gespräch in dieser Mailbox sehen darf und der Ordner ein Custom Folder dieser Mailbox ist. Der Client MUST den Tag nicht selbst benennen dürfen. Das System liest ihn vom Ordner.

#### Scenario: Fremde Mailbox
- **WHEN** ein Gespräch auf einen Ordner einer anderen Mailbox gezogen werden soll
- **THEN** wird kein Tag gesetzt

#### Scenario: Ohne Recht auf das Gespräch
- **WHEN** die Person das Gespräch nicht sehen darf
- **THEN** wird kein Tag gesetzt

### Requirement: UpdateGuard prüft das Modul
Das Modul MUST den Artisan-Befehl `folderdrop:health` registrieren. Mit `--json` MUST die Ausgabe ein JSON-Objekt mit `status` `ok` oder `fail` sein. Exit-Code 0 MUST genau den gesunden Zustand bedeuten. Der Befehl MUST NOT schreiben, migrieren oder das Netzwerk benutzen. Das Modul MUST NOT eine eigene Tabelle anlegen.

#### Scenario: Gesundes Modul
- **WHEN** die Dateien, die Klassen und die Route lesbar sind und `php artisan folderdrop:health --json` läuft
- **THEN** ist der Exit-Code 0 und `status` ist `ok`

#### Scenario: Prüfung ändert nichts
- **WHEN** der Befehl läuft
- **THEN** schreibt er keine Zeile, startet keine Migration und baut keine Verbindung nach außen auf
