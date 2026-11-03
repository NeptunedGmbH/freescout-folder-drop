# Tasks

## 1. Modulgerüst

- [x] 1.1 Modul `FolderDrop` (Alias `folderdrop`) mit `module.json`, Provider und Route anlegen, ohne Migration. Verify: `php -l` auf den neuen PHP-Dateien ist ohne Fehler und es gibt kein `Database/Migrations`.
- [x] 1.2 README beschreibt Installation nach `/data/Modules/FolderDrop`, Aktivieren, Rollback und dass `NestedTags` nicht nötig ist. Verify: diese vier Punkte stehen im README.

## 2. Tag vom Ordner setzen

- [x] 2.1 Endpoint nimmt `folder_id` und Gesprächs-IDs, liest den Tag nur aus dem Custom Folder derselben Mailbox und setzt ihn über `Tag::attachByName`, nachdem die Person die Gespräche sehen darf. Ohne Tag, falscher Typ oder fremde Mailbox setzt er nichts. Verify: ein Test mit nachgebauten Ordnerdaten deckt Erfolg, fehlenden Tag, Systemordner, fremde Mailbox und fehlendes Recht ab.

## 3. Ziehen in der Liste

- [x] 3.1 Gesprächszeilen lassen sich mit eigenen Drag-Events ziehen, nicht mit `sortable`. `dragstart` auf den Links der Zeile legt keine Adresse ab, ein Klick öffnet das Gespräch. `dragover` auf dem Ordner verhindert das Ablegen des Links. Ziele sind nur die Ordner-IDs, die der Server als Custom Folder mit Tag nennt. Nach `loadConversations()` sind neue Zeilen wieder ziehbar. Bei grobem Zeiger bleibt `draggable` aus. Gehört die Zeile zur angehakten Auswahl, gehen diese Gespräche der Mailbox mit, sonst nur die Zeile. Verify: das Script schickt `folder_id` und die IDs, keinen Tag-Namen, ruft `sortable` nicht auf und setzt `draggable` nur bei feinem Zeiger.

## 4. UpdateGuard

- [x] 4.1 `folderdrop:health` mit `--json`, `version.txt`, `interop.json`, `latestVersionUrl`, `latestVersionZipUrl` und `sha256sumsUrl`. Kein `Database/Migrations` und kein `updateGuard.migrations`. Verify: `php artisan folderdrop:health --json` endet mit 0 und `"status":"ok"`, und der Befehl schreibt nichts.

## 5. Laufende Instanz

- [x] 5.1 Modul in den Container `freescout-app` legen, öffentlich verknüpfen und aktivieren. Verify: das Modul ist aktiv, Tags und Custom Folders sind unverändert, und es wurde keine Tabelle angelegt.

## Workflow follow-up

- Den Change nach dem Review mit `openspec archive` archivieren.
