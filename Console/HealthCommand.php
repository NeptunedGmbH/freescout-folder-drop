<?php

namespace Modules\FolderDrop\Console;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Route;

/**
 * Read-only health check for UpdateGuard.
 *
 *   php artisan folderdrop:health
 *   php artisan folderdrop:health --json
 *
 * Exit 0 means healthy. Exit 1 means unhealthy.
 * The command does not write, migrate, or use the network.
 */
class HealthCommand extends Command
{
    protected $signature = 'folderdrop:health {--json : Print a JSON object}';

    protected $description = 'Read-only FolderDrop health check (UpdateGuard)';

    public function handle()
    {
        $root = dirname(__DIR__);
        $checks = [
            'files' => $this->files($root),
            'classes' => $this->classes(),
            'routes' => $this->routes(),
            'assets' => $this->assets(),
            'version' => $this->versionsMatch($root),
            'customfolders' => $this->customFolders(),
        ];

        $failed = 0;
        foreach ($checks as $result) {
            if ($result !== 'ok') {
                $failed++;
            }
        }

        $status = $failed === 0 ? 'ok' : 'fail';
        $payload = [
            'status' => $status,
            'module' => 'FolderDrop',
            'version' => $this->manifestVersion($root),
            'checks' => $checks,
        ];

        if ($this->option('json')) {
            $encoded = json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
            if ($encoded === false) {
                $this->line('{"status":"fail","module":"FolderDrop","version":"","checks":{"json":"encode failed"}}');

                return 1;
            }
            $this->line($encoded);

            return $failed === 0 ? 0 : 1;
        }

        foreach ($checks as $name => $result) {
            $this->line(str_pad($name, 12).$result);
        }
        $this->line('FolderDrop '.$payload['version'].': '.$status);

        return $failed === 0 ? 0 : 1;
    }

    /**
     * @param string $root
     * @return string
     */
    protected function files($root)
    {
        $relative = [
            'module.json',
            'version.txt',
            'interop.json',
            'start.php',
            'DropPlan.php',
            'Providers/FolderDropServiceProvider.php',
            'Http/routes.php',
            'Http/Controllers/FolderDropController.php',
            'Console/HealthCommand.php',
            'Public/js/module.js',
            'Public/js/laroute.js',
            'Public/css/module.css',
        ];
        $missing = [];
        foreach ($relative as $path) {
            $full = $root.'/'.$path;
            if (!is_file($full) || !is_readable($full)) {
                $missing[] = $path;
            }
        }

        return $missing ? 'missing '.implode(', ', $missing) : 'ok';
    }

    /**
     * @return string
     */
    protected function classes()
    {
        $classes = [
            'Modules\\FolderDrop\\Providers\\FolderDropServiceProvider',
            'Modules\\FolderDrop\\Http\\Controllers\\FolderDropController',
            'Modules\\FolderDrop\\DropPlan',
            'Modules\\FolderDrop\\Console\\HealthCommand',
        ];
        $missing = [];
        foreach ($classes as $class) {
            if (!class_exists($class)) {
                $missing[] = $class;
            }
        }

        return $missing ? 'missing '.implode(', ', $missing) : 'ok';
    }

    /**
     * @return string
     */
    protected function routes()
    {
        try {
            $exists = Route::has('folderdrop.ajax');
        } catch (\Throwable $e) {
            $exists = false;
        }

        return $exists ? 'ok' : 'missing folderdrop.ajax';
    }

    /**
     * @return string
     */
    protected function assets()
    {
        $relative = 'modules/folderdrop/js/module.js';
        try {
            $full = public_path($relative);
            $readable = is_file($full) && is_readable($full);
        } catch (\Throwable $e) {
            $readable = false;
        }

        return $readable ? 'ok' : 'missing '.$relative;
    }

    /**
     * @param string $root
     * @return string
     */
    protected function versionsMatch($root)
    {
        $manifestVersion = $this->manifestVersion($root);
        $file = $root.'/version.txt';
        if (!is_file($file) || !is_readable($file)) {
            return 'version.txt missing';
        }
        $fileVersion = trim((string) file_get_contents($file));
        if ($manifestVersion === '' || $fileVersion !== $manifestVersion) {
            return 'version.txt does not match module.json';
        }

        return 'ok';
    }

    /**
     * @param string $root
     * @return string
     */
    protected function manifestVersion($root)
    {
        $manifest = json_decode((string) file_get_contents($root.'/module.json'), true);
        if (!is_array($manifest) || !isset($manifest['version'])) {
            return '';
        }

        return trim((string) $manifest['version']);
    }

    /**
     * Official Custom Folders must be active and its license marked activated.
     *
     * @return string
     */
    protected function customFolders()
    {
        try {
            if (!\App\Module::isActive('customfolders')) {
                return 'customfolders inactive';
            }
            $module = \App\Module::getByAlias('customfolders');
        } catch (\Exception $e) {
            return 'customfolders unavailable';
        }
        if (!$module || empty($module->activated)) {
            return 'customfolders license inactive';
        }

        return 'ok';
    }
}
