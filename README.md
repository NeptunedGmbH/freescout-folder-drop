# FolderDrop

Früher Prototyp. Noch kein Release.

Gespräche aus der Liste auf einen Custom Folder ziehen. Dabei wird nur die Markierung dieses Ordners gesetzt. Der Status des Gesprächs bleibt.

Lizenz: [MIT](LICENSE).

## Installation

Das Repository ist das FreeScout-Modul. Es kommt nach `Modules/FolderDrop`. In diesem Setup ist das `/data/Modules/FolderDrop`.

```bash
docker cp . freescout-app:/data/Modules/FolderDrop
docker exec -w /www/html freescout-app php artisan module:enable FolderDrop
docker exec -w /www/html freescout-app php artisan freescout:module-install folderdrop
```

Im Container gibt es kein Node. `Public/js/module.js` liegt übersetzt im Modul. Wer den TypeScript-Quelltext ändert, übersetzt ihn auf dem Host mit `npm run build`.

## Aktivieren

Das Modul in FreeScout aktivieren. In der Verwaltung unter Module, oder im Container `freescout-app`:

```bash
php artisan module:enable FolderDrop
```

Danach den Cache einmal leeren, damit der aktive Stand geladen wird.

## Rollback

Modul aus. Es gibt keine eigene Tabelle und keine Migration. Gesetzte Markierungen bleiben, wie eine von Hand gesetzte Markierung.

```bash
docker exec -w /www/html freescout-app php artisan module:disable folderdrop
```

## NestedTags

`NestedTags` ist nicht nötig. Dieses Modul verlangt es nicht. Liegt die Verschachtelung daneben, bleiben eingerückte Ordner Ziele, weil sie Custom Folders bleiben.

## UpdateGuard

UpdateGuard ruft den nur lesenden Befehl auf. Er schreibt nichts, migriert nichts und baut keine Verbindung auf.

```bash
php artisan folderdrop:health --json
```

Exit-Code 0 und `"status":"ok"` bedeuten, dass die Dateien, die Klassen, die Route `folderdrop.ajax`, die öffentliche Datei `modules/folderdrop/js/module.js` und die gleiche Version in `version.txt` und `module.json` stimmen.

`version.txt` auf `main` ist die Versionszeile. Ein Release und damit `FolderDrop.zip` plus `SHA256SUMS` gibt es noch nicht. Der automatische Download über UpdateGuard wartet darauf. `scripts/sha256sums.sh` schreibt `SHA256SUMS` im GNU-Format `<64 hex>  FolderDrop.zip` und lehnt jeden anderen Dateinamen ab. Der Workflow `.github/workflows/sha256sums.yml` hängt dieselbe Datei erst an ein Release, das `FolderDrop.zip` schon enthält. Er legt selbst kein Release an.
