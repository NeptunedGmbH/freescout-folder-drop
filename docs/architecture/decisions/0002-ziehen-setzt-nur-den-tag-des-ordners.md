# 2. Ziehen setzt nur den Tag des Ordners

Date: 2026-11-03

## Status

Accepted

Baut auf [1. Record architecture decisions](0001-record-architecture-decisions.md)

## Kontext

Custom Folders sind Ansichten auf einen Tag, plus Filter. Gmail legt eine Mail auf einem Label ab und das Label kommt dazu. Die Mail verschwindet dadurch nicht aus der Inbox. Die Verschachtelung der Ordner ist ein anderes Modul.

## Entscheidung

Dieses Modul setzt beim Ablegen nur den Tag des getroffenen Custom Folders. Es ändert den Status nicht, räumt andere Tags nicht ab und kennt keine Eltern- oder Kind-Tags.

Es ist nicht Teil von `NestedTags` und verlangt dieses Modul nicht.

Verworfen:

- Drag in das Verschachtelungsmodul legen. Flache Ordner sollen ein Ziel sein, ohne den Baum.
- Den Client den Tag-Namen schicken lassen. Der Ordner ist die Quelle des Tags, sonst lässt sich ein beliebiger Name unterschieben.
- Das Gespräch in den Ordner „verschieben“ und aus Nicht zugewiesen nehmen. Ein Custom Folder ist eine Ansicht, kein Status.

## Konsequenzen

- Ablegen funktioniert mit und ohne verschachtelte Seitenleiste.
- Sind beide Module aktiv, ist ein eingerückter Ordner ein Ziel, weil er ein Custom Folder bleibt.
- Die Hersteller-Module bleiben unangetastet.
