<?php

require dirname(__DIR__).'/DropPlan.php';

use Modules\FolderDrop\DropPlan;

$failed = 0;

function check($label, $condition)
{
    global $failed;
    if ($condition) {
        echo "ok $label\n";
        return;
    }
    $failed++;
    fwrite(STDERR, "FAIL $label\n");
}

function recorded(array $folder, array $conversations)
{
    $calls = [];
    $count = DropPlan::apply($folder, $conversations, function ($tagName, $conversationId) use (&$calls) {
        $calls[] = [$tagName, $conversationId];
    });

    return [$count, $calls];
}

$onboarding = [
    'type' => 200,
    'mailbox_id' => 5,
    'tag_id' => 9,
    'tag_name' => 'onboarding',
];

$visible = [
    'id' => 11,
    'mailbox_id' => 5,
    'visible' => true,
    'tag_name' => 'vom-client',
];

list($count, $calls) = recorded($onboarding, [$visible]);
check('erfolg setzt den tag des ordners', $count === 1 && $calls === [['onboarding', 11]]);

list($count, $calls) = recorded([
    'type' => 200,
    'mailbox_id' => 5,
    'tag_id' => 0,
    'tag_name' => 'vom-client',
], [$visible]);
check('fehlender tag setzt nichts', $count === 0 && $calls === []);

list($count, $calls) = recorded([
    'type' => 200,
    'mailbox_id' => 5,
    'tag_id' => 9,
    'tag_name' => '',
], [$visible]);
check('tag ohne namen setzt nichts', $count === 0 && $calls === []);

list($count, $calls) = recorded([
    'type' => 1,
    'mailbox_id' => 5,
    'tag_id' => 9,
    'tag_name' => 'onboarding',
], [$visible]);
check('systemordner setzt nichts', $count === 0 && $calls === []);

list($count, $calls) = recorded([
    'type' => 20,
    'mailbox_id' => 5,
    'tag_id' => 9,
    'tag_name' => 'onboarding',
], [$visible]);
check('mir zugewiesen setzt nichts', $count === 0 && $calls === []);

list($count, $calls) = recorded($onboarding, [[
    'id' => 12,
    'mailbox_id' => 8,
    'visible' => true,
]]);
check('fremde mailbox setzt nichts', $count === 0 && $calls === []);

list($count, $calls) = recorded($onboarding, [[
    'id' => 13,
    'mailbox_id' => 5,
    'visible' => false,
]]);
check('fehlendes recht setzt nichts', $count === 0 && $calls === []);

list($count, $calls) = recorded($onboarding, [
    $visible,
    ['id' => 12, 'mailbox_id' => 8, 'visible' => true],
    ['id' => 13, 'mailbox_id' => 5, 'visible' => false],
]);
check('nur das erlaubte gespraech derselben mailbox', $count === 1 && $calls === [['onboarding', 11]]);

exit($failed === 0 ? 0 : 1);
