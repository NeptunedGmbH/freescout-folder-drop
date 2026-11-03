# FolderDrop

Add-on for the official [Custom Folders](https://freescout.net/module/custom-folders/) module. Version 0.1.

Drag conversations from the list onto a custom folder. That only sets the tag for that folder. The conversation status stays as it is.

The module stays idle unless Custom Folders is active and FreeScout has marked its license as activated. The license key is never read.

License: [MIT](LICENSE).

## Installation

This repository is the FreeScout module. It belongs in `Modules/FolderDrop`. In this setup that is `/data/Modules/FolderDrop`.

```bash
docker cp . freescout-app:/data/Modules/FolderDrop
docker exec -w /www/html freescout-app php artisan module:enable FolderDrop
docker exec -w /www/html freescout-app php artisan freescout:module-install folderdrop
```

The container has no Node. `Public/js/module.js` is the built file shipped with the module. After changing the TypeScript source, build it on the host with `npm run build`.

## Activate

Activate the module in FreeScout, under Manage → Modules, or in the `freescout-app` container:

```bash
php artisan module:enable FolderDrop
```

Clear the cache once afterwards so the active build is loaded.

## Rollback

Turn the module off. It has no table of its own and no migration. Tags that were set stay, the same as a tag set by hand.

```bash
docker exec -w /www/html freescout-app php artisan module:disable folderdrop
```

## NestedTags

`NestedTags` is optional. This module does not require it. When nesting is installed alongside, indented folders stay drop targets, because they are still custom folders.

## UpdateGuard

UpdateGuard runs the read-only command. It does not write, does not migrate, and does not open a connection.

```bash
php artisan folderdrop:health --json
```

Exit code 0 and `"status":"ok"` mean the files, the classes, the `folderdrop.ajax` route, the public file `modules/folderdrop/js/module.js`, and the same version in `version.txt` and `module.json` all check out.

`version.txt` on `main` is the version line. Release 0.1 publishes `FolderDrop.zip`. `scripts/sha256sums.sh` writes `SHA256SUMS` in GNU format `<64 hex>  FolderDrop.zip` and rejects any other filename. The workflow `.github/workflows/sha256sums.yml` attaches that file to a release that already contains `FolderDrop.zip`.
