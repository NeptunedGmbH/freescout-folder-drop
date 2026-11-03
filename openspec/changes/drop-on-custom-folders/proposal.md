# Proposal

## Why

In Gmail zieht man Mails auf ein Label und das Label ist gesetzt. In FreeScout sind die Labels in der Seitenleiste Custom Folders. Die hängen nur an einem Tag. Ablegen gibt es nicht. Die Verschachtelung ist ein anderes Modul und soll dafür nicht nötig sein.

## What Changes

- Ein Gespräch oder die aktuelle Auswahl lässt sich aus der Liste auf einen Custom Folder der Seitenleiste ziehen.
- Dabei wird nur der Tag dieses Ordners gesetzt. Eltern-Tag, Unter-Tags und andere Tags bleiben unberührt.
- Das Gespräch bleibt in seinem Statusordner. Es erscheint im Custom Folder nur, wenn es dessen Filter erfüllt.
- Ordner ohne Tag und Systemordner sind keine Ziele. Eine Rückfrage gibt es nicht.
- Das Modul `NestedTags` wird nicht vorausgesetzt. Liegt es daneben, sind eingerückte Ordner trotzdem Ziele, weil sie Custom Folders bleiben.

## Capabilities

### New Capabilities

- `drop-on-folder`: Gespräche auf einen Custom Folder ziehen setzt dessen Tag.

### Modified Capabilities

## Impact

- Neues Modul `FolderDrop`, Alias `folderdrop`, Repo `freescout-folder-drop`.
- Keine neue Tabelle. Kein Schreibzugriff auf `folders.meta`. Tags werden über die bestehende Zuordnung gesetzt.
- Seitenleiste und Gesprächsliste. Custom Folders und Tags bleiben unangetastet.
- Unabhängig vom Change `nest-custom-folders` im Repo `freescout-nested-tags`.
