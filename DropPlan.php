<?php

namespace Modules\FolderDrop;

/**
 * Entscheidet, welche Gespräche die Markierung eines Custom Folders bekommen.
 * Der Tag-Name kommt nur aus dem Ordner, nie aus dem Client.
 */
class DropPlan
{
    const TYPE_CUSTOM = 200;

    /**
     * @param array $folder type, mailbox_id, tag_id, tag_name
     * @param array $conversations id, mailbox_id, visible
     * @return array|null tag_name and conversation_ids
     */
    public static function plan(array $folder, array $conversations)
    {
        if ((int) ($folder['type'] ?? 0) !== self::TYPE_CUSTOM) {
            return null;
        }

        $mailboxId = (int) ($folder['mailbox_id'] ?? 0);
        $tagId = (int) ($folder['tag_id'] ?? 0);
        $tagName = trim((string) ($folder['tag_name'] ?? ''));
        if ($mailboxId <= 0 || $tagId <= 0 || $tagName === '') {
            return null;
        }

        $ids = [];
        foreach ($conversations as $conversation) {
            if (!is_array($conversation)) {
                continue;
            }
            if ((int) ($conversation['mailbox_id'] ?? 0) !== $mailboxId) {
                continue;
            }
            if (($conversation['visible'] ?? false) !== true) {
                continue;
            }
            $id = (int) ($conversation['id'] ?? 0);
            if ($id > 0) {
                $ids[$id] = $id;
            }
        }

        if (!$ids) {
            return null;
        }

        return [
            'tag_name' => $tagName,
            'conversation_ids' => array_values($ids),
        ];
    }

    /**
     * @param callable $attach function (string $tagName, int $conversationId)
     * @return int
     */
    public static function apply(array $folder, array $conversations, callable $attach)
    {
        $plan = self::plan($folder, $conversations);
        if (!$plan) {
            return 0;
        }

        foreach ($plan['conversation_ids'] as $conversationId) {
            $attach($plan['tag_name'], $conversationId);
        }

        return count($plan['conversation_ids']);
    }
}
