interface FolderDropJQuery {
    attr(name: string): string | undefined;
}

interface FolderDropAjaxData {
    folder_id?: number;
    conversation_ids?: number[];
    mailbox_id?: string;
}

interface FolderDropAjaxFn {
    (
        data: FolderDropAjaxData,
        url: string,
        success?: (response: unknown) => void,
        noLoader?: boolean,
        error?: () => void
    ): void;
}

interface LoadConversationsFn {
    (page?: string, table?: unknown, noLoader?: boolean): void;
    __folderdrop?: boolean;
}

declare function $(selector: string): FolderDropJQuery;

declare var fsAjax: FolderDropAjaxFn;

declare const laroute: {
    route(name: string): string;
};

declare function isAjaxSuccess(response: unknown): boolean;

declare function showFloatingAlert(type: string, message: string, noAutohide?: boolean): void;

declare function ajaxFinish(): void;

declare var loadConversations: LoadConversationsFn;
