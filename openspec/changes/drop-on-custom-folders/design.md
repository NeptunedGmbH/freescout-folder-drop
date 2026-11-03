# Design

## Context

Siehe proposal.md. Custom Folders vom Typ 200 tragen die `tag_id` in `folders.meta`. Die Seitenleiste rendert sie als `<li data-folder_id>`. Tags setzt `Tag::attachByName`, und der Ajax `tags.ajax` mit Aktion `add` prüft vorher, ob die Person die Gespräche sehen darf. Custom Folders aktualisiert seine Zähler über `tag.attached`. Eine Rückfrage kennt Gmail beim Ablegen nicht.

## Goals / Non-Goals

**Goals:**

- Die Spec `drop-on-folder` erfüllen, ohne Tags, Custom Folders, NestedTags oder den Core zu patchen.

**Non-Goals:**

- Tags entfernen durch Wegziehen.
- Status ändern, zuweisen, schließen.
- Ebenen sortieren. Das bleibt `NestedTags`.
- Ordner ohne Tag befüllen.

## Decisions

0. **Browser-Code in TypeScript, Server in PHP.** FreeScout lädt Module als PHP und das Browser-Skript als Datei. Die Oberfläche liegt in TypeScript und wird vor dem Ausliefern nach `Public/js/module.js` übersetzt. Im Container gibt es kein Node. Der übersetzte Stand wird mit ausgeliefert. Die Typen enden an den globalen FreeScout-Funktionen (`$`, `fsAjax`, `laroute`). Dafür reicht eine kleine Deklaration.

1. **Eigenes Modul `FolderDrop`, Alias `folderdrop`.** Es verlangt `NestedTags` nicht. Alternative: Drag in `NestedTags`. Verworfen, weil flache Custom Folders das Ziel sein sollen, ohne den Baum zu installieren. Begründung: ADR 2.

2. **Der Server liest den Tag vom Ordner.** Der Client sendet `folder_id` und Gesprächs-IDs. Der Server prüft Typ Custom Folder, dieselbe Mailbox, vorhandene `tag_id` und dass die Person die Gespräche sehen darf, dann `Tag::attachByName`. Liegt NestedTags daneben und der Ordner hat Hauptordner, setzt derselbe Schritt auch deren Tags. Alternative: der Client schickt den Tag-Namen an `tags.ajax`. Verworfen, weil ein gefälschter Name sonst einen beliebigen Tag setzen könnte.

3. **Eigene Drag-Events, nicht `sortable`.** `sortable` hängt die Knoten um. Das Modul setzt native Drag-Events auf `tr.conv-row` und die Ordner-`<li data-folder_id>`. Die Zeile enthält Links, die der Browser sonst als Adresse zieht. `dragstart` auf diesen Links wird abgebrochen, ein Klick öffnet das Gespräch weiter. `dragover` auf dem Ordner-Link ruft `preventDefault` auf, sonst feuert `drop` nicht. Ist die gezogene Zeile Teil der angehakten Auswahl (`.conv-checkbox`), gehen alle angehakten Gespräche dieser Mailbox mit, sonst nur die Zeile.

4. **Ziele kommen vom Server.** Die `<li>` nennt nur `data-folder_id` und ein Icon, nicht den Typ und nicht die `tag_id`. Das Modul liefert die IDs der Custom Folders mit Tag. Nur die werden markiert. `loadConversations()` ersetzt die Zeilen, deshalb werden die Drag-Events danach neu gebunden.

5. **Grobe Eingabe bleibt Scrollen.** Im Bundle liegt DragDropTouch. Ein `draggable` an der Zeile würde dort das Scrollen als Ziehen lesen. `draggable` wird nur bei feinem Zeiger gesetzt.

6. **Kein eigener Zähler.** `tag.attached` schreibt den Zähler in der Datenbank. Die Zahl in der Seitenleiste ist beim Rendern entstanden und darf bis zum nächsten Laden hinterherhinken. Der gesetzte Tag ist das Ergebnis.

7. **UpdateGuard vollständig.** `module.json` nennt `latestVersionUrl` (Inhalt von `version.txt`, eine Versionszeile), `latestVersionZipUrl` (`FolderDrop.zip`), `sha256sumsUrl` und `healthCommand` `folderdrop:health`. Der Befehl ist nur lesend, hat `--json` und endet mit 0 oder 1. `interop.json` nennt FreeScout, PHP, Tags und Custom Folders als `required_dependency` und NestedTags als `optional_integration`. Keine Migration, deshalb kein `updateGuard.migrations`. `scripts/sha256sums.sh` und der GitHub-Workflow schreiben `SHA256SUMS` im Format `<64 hex>  FolderDrop.zip`. Der Health-Check läuft ohne veröffentlichte Release. Die Versions-URL antwortet erst, wenn das Repo und das Release existieren.

## Risks / Trade-offs

- [Die Gesprächsliste ändert die Zeilen-Markup] → ohne erkennbaren Griff passiert nichts, bestehende Klicks bleiben.
- [Ein Ordner filtert enger als sein Tag] → das Gespräch hat den Tag und kann im Ordner trotzdem fehlen. Die Spec sagt das.
- [NestedTags rückt die `<li>` nur um] → die `data-folder_id` bleibt, Ablegen auf einem Unterordner braucht kein Wissen über den Baum.
- [Kanban zieht Karten mit `sortable`] → dieses Modul bindet nur Gesprächszeilen und `#folders`, die Kanban-Seite bleibt unberührt.

## Migration Plan

Modul nach `/data/Modules/FolderDrop` legen, öffentlich verknüpfen, aktivieren. Keine Migration. Rollback: Modul aus. Gesetzte Tags bleiben, wie ein von Hand gesetzter Tag.
