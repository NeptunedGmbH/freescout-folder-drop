(function () {
    var droppableIds: number[] = [];
    var draggingIds: number[] = [];

    function pointerIsFine(): boolean {
        return window.matchMedia("(pointer: fine)").matches;
    }

    function isDroppable(id: number): boolean {
        var i = 0;
        for (i = 0; i < droppableIds.length; i++) {
            if (droppableIds[i] === id) {
                return true;
            }
        }
        return false;
    }

    function parseId(value: string | null): number {
        var id = parseInt(value || "", 10);
        return id > 0 ? id : 0;
    }

    function folderItem(target: EventTarget | null): HTMLElement | null {
        if (!(target instanceof Element)) {
            return null;
        }
        var item = target.closest("#folders li[data-folder_id]");
        return item instanceof HTMLElement ? item : null;
    }

    function rowFrom(target: EventTarget | null): HTMLElement | null {
        if (!(target instanceof Element)) {
            return null;
        }
        var row = target.closest("tr.conv-row[data-conversation_id]");
        return row instanceof HTMLElement ? row : null;
    }

    function idsForRow(row: HTMLElement): number[] {
        var ownId = parseId(row.getAttribute("data-conversation_id"));
        var checkbox = row.querySelector(".conv-checkbox");
        var selected = checkbox instanceof HTMLInputElement && checkbox.checked;
        if (!selected) {
            return ownId > 0 ? [ownId] : [];
        }
        var table = row.closest("table");
        var scope: ParentNode = table || document;
        var boxes = scope.querySelectorAll(".conv-checkbox:checked");
        var ids: number[] = [];
        var i = 0;
        for (i = 0; i < boxes.length; i++) {
            var box = boxes[i];
            if (!(box instanceof HTMLInputElement)) {
                continue;
            }
            var id = parseId(box.value);
            if (id > 0) {
                ids.push(id);
            }
        }
        if (!ids.length && ownId > 0) {
            ids.push(ownId);
        }
        return ids;
    }

    function prepareRows(): void {
        var rows = document.querySelectorAll("tr.conv-row[data-conversation_id]");
        var i = 0;
        for (i = 0; i < rows.length; i++) {
            var row = rows[i];
            if (!(row instanceof HTMLElement)) {
                continue;
            }
            var links = row.querySelectorAll("a");
            var j = 0;
            for (j = 0; j < links.length; j++) {
                var link = links[j];
                if (link instanceof HTMLElement) {
                    link.setAttribute("draggable", "false");
                }
            }
            if (pointerIsFine()) {
                row.setAttribute("draggable", "true");
            } else {
                row.removeAttribute("draggable");
            }
        }
    }

    function markTargets(active: boolean): void {
        var items = document.querySelectorAll("#folders li[data-folder_id]");
        var i = 0;
        for (i = 0; i < items.length; i++) {
            var item = items[i];
            if (!(item instanceof HTMLElement)) {
                continue;
            }
            var valid = active && isDroppable(parseId(item.getAttribute("data-folder_id")));
            if (valid) {
                item.classList.add("folderdrop-valid");
                if (!item.hasAttribute("data-folderdrop-title")) {
                    item.setAttribute("data-folderdrop-title", item.getAttribute("title") || "");
                }
                item.setAttribute("title", "Markierung setzen");
            } else {
                item.classList.remove("folderdrop-valid");
                item.classList.remove("folderdrop-over");
                if (item.hasAttribute("data-folderdrop-title")) {
                    var previous = item.getAttribute("data-folderdrop-title") || "";
                    if (previous) {
                        item.setAttribute("title", previous);
                    } else {
                        item.removeAttribute("title");
                    }
                    item.removeAttribute("data-folderdrop-title");
                }
            }
        }
    }

    function onDragStart(event: DragEvent): void {
        var row = rowFrom(event.target);
        if (!row) {
            return;
        }
        var link = event.target instanceof Element ? event.target.closest("a") : null;
        if (link && row.contains(link) && link.getAttribute("draggable") !== "false") {
            event.preventDefault();
            if (event.dataTransfer) {
                event.dataTransfer.clearData();
            }
            return;
        }
        if (!pointerIsFine() || row.getAttribute("draggable") !== "true") {
            event.preventDefault();
            return;
        }
        draggingIds = idsForRow(row);
        if (event.dataTransfer) {
            event.dataTransfer.effectAllowed = "copy";
            event.dataTransfer.setData("text/plain", draggingIds.join(","));
        }
        markTargets(true);
    }

    function onDragOver(event: DragEvent): void {
        var item = folderItem(event.target);
        if (!item || !draggingIds.length) {
            return;
        }
        if (!isDroppable(parseId(item.getAttribute("data-folder_id")))) {
            return;
        }
        event.preventDefault();
        item.classList.add("folderdrop-over");
    }

    function onDragLeave(event: DragEvent): void {
        var item = folderItem(event.target);
        if (!item) {
            return;
        }
        var next = event.relatedTarget;
        if (next instanceof Node && item.contains(next)) {
            return;
        }
        item.classList.remove("folderdrop-over");
    }

    function clearDrag(): void {
        draggingIds = [];
        markTargets(false);
    }

    function onDrop(event: DragEvent): void {
        var item = folderItem(event.target);
        if (!item) {
            return;
        }
        var folderId = parseId(item.getAttribute("data-folder_id"));
        var ids = draggingIds.slice();
        clearDrag();
        if (!isDroppable(folderId) || !ids.length) {
            return;
        }
        event.preventDefault();
        fsAjax(
            {
                folder_id: folderId,
                conversation_ids: ids
            },
            laroute.route("folderdrop.ajax"),
            function (response: unknown) {
                var data = response as { msg?: string; attached?: number };
                if (!isAjaxSuccess(response)) {
                    showFloatingAlert("error", data && data.msg ? data.msg : "Keine Markierung gesetzt");
                    return;
                }
                if (data && data.attached && data.attached > 0) {
                    showFloatingAlert("success", data.msg || "Markierung gesetzt");
                }
            }
        );
    }

    function loadTargets(): void {
        var mailboxId = $("body:first").attr("data-mailbox_id") || "";
        if (!mailboxId) {
            droppableIds = [];
            return;
        }
        fsAjax(
            { mailbox_id: mailboxId },
            laroute.route("folderdrop.ajax"),
            function (response: unknown) {
                droppableIds = [];
                if (!isAjaxSuccess(response) || !response || typeof response !== "object") {
                    return;
                }
                var ids = (response as { folder_ids?: unknown }).folder_ids;
                if (!ids || typeof (ids as { length?: number }).length !== "number") {
                    return;
                }
                var list = ids as unknown[];
                var i = 0;
                for (i = 0; i < list.length; i++) {
                    var id = Number(list[i]);
                    if (id > 0) {
                        droppableIds.push(id);
                    }
                }
            },
            true
        );
    }

    function hookLoadConversations(): void {
        var original = loadConversations;
        if (!original || original.__folderdrop) {
            return;
        }
        var wrapped: LoadConversationsFn = function (page, table, noLoader) {
            var previous = fsAjax;
            fsAjax = function (data, url, success, noLoaderAjax) {
                return previous(data, url, function (response: unknown) {
                    if (success) {
                        success(response);
                    }
                    prepareRows();
                }, noLoaderAjax);
            };
            try {
                return original(page, table, noLoader);
            } finally {
                fsAjax = previous;
            }
        };
        wrapped.__folderdrop = true;
        loadConversations = wrapped;
    }

    function start(): void {
        document.addEventListener("dragstart", onDragStart, true);
        document.addEventListener("dragover", onDragOver);
        document.addEventListener("dragleave", onDragLeave);
        document.addEventListener("drop", onDrop);
        document.addEventListener("dragend", clearDrag);
        var fine = window.matchMedia("(pointer: fine)");
        if (typeof fine.addEventListener === "function") {
            fine.addEventListener("change", prepareRows);
        }
        hookLoadConversations();
        prepareRows();
        loadTargets();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", start);
    } else {
        start();
    }
})();
