"use strict";
(function () {
    var droppableIds = [];
    var draggingIds = [];
    var dragChip = null;
    function pointerIsFine() {
        return window.matchMedia("(pointer: fine)").matches;
    }
    function isDroppable(id) {
        var i = 0;
        for (i = 0; i < droppableIds.length; i++) {
            if (droppableIds[i] === id) {
                return true;
            }
        }
        return false;
    }
    function parseId(value) {
        var id = parseInt(value || "", 10);
        return id > 0 ? id : 0;
    }
    function folderItem(target) {
        if (!(target instanceof Element)) {
            return null;
        }
        var item = target.closest("#folders li[data-folder_id]");
        return item instanceof HTMLElement ? item : null;
    }
    function rowFrom(target) {
        if (!(target instanceof Element)) {
            return null;
        }
        var row = target.closest("tr.conv-row[data-conversation_id]");
        return row instanceof HTMLElement ? row : null;
    }
    function idsForRow(row) {
        var ownId = parseId(row.getAttribute("data-conversation_id"));
        var checkbox = row.querySelector(".conv-checkbox");
        var selected = checkbox instanceof HTMLInputElement && checkbox.checked;
        if (!selected) {
            return ownId > 0 ? [ownId] : [];
        }
        var table = row.closest("table");
        var scope = table || document;
        var boxes = scope.querySelectorAll(".conv-checkbox:checked");
        var ids = [];
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
    function prepareRows() {
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
            }
            else {
                row.removeAttribute("draggable");
            }
        }
    }
    function markTargets(active) {
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
            }
            else {
                item.classList.remove("folderdrop-valid");
                item.classList.remove("folderdrop-over");
                if (item.hasAttribute("data-folderdrop-title")) {
                    var previous = item.getAttribute("data-folderdrop-title") || "";
                    if (previous) {
                        item.setAttribute("title", previous);
                    }
                    else {
                        item.removeAttribute("title");
                    }
                    item.removeAttribute("data-folderdrop-title");
                }
            }
        }
    }
    function onDragStart(event) {
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
            var chip = document.createElement("div");
            chip.className = "folderdrop-chip";
            chip.textContent = dragLabel(row, draggingIds.length);
            document.body.appendChild(chip);
            dragChip = chip;
            event.dataTransfer.setDragImage(chip, 14, chip.offsetHeight + 12);
        }
        markTargets(true);
    }
    function dragLabel(row, count) {
        var subject = row.querySelector("td.conv-subject p");
        var text = "";
        if (subject instanceof HTMLElement) {
            text = (subject.textContent || "").replace(/\s+/g, " ").trim();
        }
        if (!text) {
            text = "Gespräch";
        }
        if (text.length > 48) {
            text = text.slice(0, 47) + "…";
        }
        if (count > 1) {
            return count + " Gespräche · " + text;
        }
        return text;
    }
    function onDragOver(event) {
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
    function onDragLeave(event) {
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
    function clearDrag() {
        draggingIds = [];
        markTargets(false);
        if (dragChip && dragChip.parentNode) {
            dragChip.parentNode.removeChild(dragChip);
        }
        dragChip = null;
    }
    function onDrop(event) {
        var item = folderItem(event.target);
        if (!item) {
            return;
        }
        var folderId = parseId(item.getAttribute("data-folder_id"));
        var ids = draggingIds.slice();
        var target = item;
        clearDrag();
        if (!isDroppable(folderId) || !ids.length) {
            return;
        }
        event.preventDefault();
        target.classList.add("folderdrop-wait");
        fsAjax({
            folder_id: folderId,
            conversation_ids: ids
        }, laroute.route("folderdrop.ajax"), function (response) {
            ajaxFinish();
            target.classList.remove("folderdrop-wait");
            target.classList.remove("folderdrop-over");
            var data = response;
            if (!isAjaxSuccess(response)) {
                showFloatingAlert("error", data && data.msg ? data.msg : "Keine Markierung gesetzt");
                return;
            }
            target.classList.add("folderdrop-done");
            window.setTimeout(function () {
                target.classList.remove("folderdrop-done");
            }, 900);
        }, true, function () {
            ajaxFinish();
            target.classList.remove("folderdrop-wait");
        });
    }
    function loadTargets() {
        var mailboxId = $("body:first").attr("data-mailbox_id") || "";
        if (!mailboxId) {
            droppableIds = [];
            return;
        }
        fsAjax({ mailbox_id: mailboxId }, laroute.route("folderdrop.ajax"), function (response) {
            droppableIds = [];
            if (!isAjaxSuccess(response) || !response || typeof response !== "object") {
                return;
            }
            var ids = response.folder_ids;
            if (!ids || typeof ids.length !== "number") {
                return;
            }
            var list = ids;
            var i = 0;
            for (i = 0; i < list.length; i++) {
                var id = Number(list[i]);
                if (id > 0) {
                    droppableIds.push(id);
                }
            }
        }, true);
    }
    function hookLoadConversations() {
        var original = loadConversations;
        if (!original || original.__folderdrop) {
            return;
        }
        var wrapped = function (page, table, noLoader) {
            var previous = fsAjax;
            fsAjax = function (data, url, success, noLoaderAjax) {
                return previous(data, url, function (response) {
                    if (success) {
                        success(response);
                    }
                    prepareRows();
                }, noLoaderAjax);
            };
            try {
                return original(page, table, noLoader);
            }
            finally {
                fsAjax = previous;
            }
        };
        wrapped.__folderdrop = true;
        loadConversations = wrapped;
    }
    function start() {
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
    }
    else {
        start();
    }
})();
