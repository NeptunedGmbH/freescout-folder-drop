<?php

namespace Modules\FolderDrop\Http\Controllers;

use App\Conversation;
use App\Folder;
use App\Mailbox;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Modules\FolderDrop\DropPlan;
use Modules\Tags\Entities\Tag;

class FolderDropController extends Controller
{
    /**
     * folder_id und Gesprächs-IDs setzen die Markierung. Ohne folder_id kommen die Zielordner.
     */
    public function ajax(Request $request)
    {
        if ($request->exists('folder_id') || $request->exists('conversation_ids')) {
            return $this->drop($request);
        }

        return $this->targets($request);
    }

    /**
     * Custom Folder mit Markierung für die aktuelle Mailbox.
     */
    public function targets(Request $request)
    {
        $user = \Auth::user();
        $mailboxId = (int) $request->input('mailbox_id');
        $ids = [];

        if ($user && $mailboxId > 0) {
            $mailbox = Mailbox::find($mailboxId);
            if ($mailbox && $user->can('view', $mailbox)) {
                $folders = Folder::where('mailbox_id', $mailboxId)
                    ->where('type', DropPlan::TYPE_CUSTOM)
                    ->get();
                foreach ($folders as $folder) {
                    $meta = is_array($folder->meta) ? $folder->meta : [];
                    if ((int) ($meta['tag_id'] ?? 0) > 0) {
                        $ids[] = (int) $folder->id;
                    }
                }
            }
        }

        return \Response::json([
            'status' => 'success',
            'folder_ids' => $ids,
        ]);
    }

    /**
     * Setzt nur die Markierung des Custom Folders derselben Mailbox.
     */
    public function drop(Request $request)
    {
        $user = \Auth::user();
        $folder = Folder::find($request->input('folder_id'));
        $built = $this->folderData($folder);
        $conversations = $this->conversations($request->input('conversation_ids'), $user);

        $attached = 0;
        if ($built && class_exists(Tag::class)) {
            $attached = DropPlan::apply($built, $conversations, function ($tagName, $conversationId) {
                Tag::attachByName($tagName, $conversationId);
            });
        }

        if ($attached > 0) {
            return \Response::json([
                'status' => 'success',
                'attached' => $attached,
                'msg' => __('Markierung gesetzt'),
            ]);
        }

        return \Response::json([
            'status' => 'success',
            'attached' => 0,
            'msg' => __('Keine Markierung gesetzt'),
        ]);
    }

    /**
     * Tag-Name nur aus der tag_id des Ordners. Der Request liefert keinen Namen.
     *
     * @param \App\Folder|null $folder
     * @return array|null
     */
    private function folderData($folder)
    {
        if (!$folder) {
            return null;
        }

        $meta = is_array($folder->meta) ? $folder->meta : [];
        $tagId = (int) ($meta['tag_id'] ?? 0);
        $tagName = '';
        if ($tagId > 0 && class_exists(Tag::class)) {
            $tag = Tag::find($tagId);
            if ($tag && $tag->name) {
                $tagName = (string) $tag->name;
            }
        }

        return [
            'type' => (int) $folder->type,
            'mailbox_id' => (int) $folder->mailbox_id,
            'tag_id' => $tagId,
            'tag_name' => $tagName,
        ];
    }

    /**
     * @param mixed $rawIds
     * @param \App\User|null $user
     * @return array
     */
    private function conversations($rawIds, $user)
    {
        if (!is_array($rawIds)) {
            $rawIds = [$rawIds];
        }

        $ids = [];
        foreach ($rawIds as $rawId) {
            if (is_scalar($rawId) && is_numeric($rawId)) {
                $id = (int) $rawId;
                if ($id > 0) {
                    $ids[$id] = $id;
                }
            }
        }
        if (!$ids) {
            return [];
        }

        $conversations = [];
        foreach (Conversation::whereIn('id', array_values($ids))->get() as $conversation) {
            $conversations[] = [
                'id' => (int) $conversation->id,
                'mailbox_id' => (int) $conversation->mailbox_id,
                'visible' => $user ? $user->can('view', $conversation) === true : false,
            ];
        }

        return $conversations;
    }
}
