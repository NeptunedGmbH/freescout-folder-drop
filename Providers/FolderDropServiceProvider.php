<?php

namespace Modules\FolderDrop\Providers;

use Illuminate\Support\ServiceProvider;

defined('FOLDERDROP_MODULE') || define('FOLDERDROP_MODULE', 'folderdrop');

class FolderDropServiceProvider extends ServiceProvider
{
    /**
     * Indicates if loading of the provider is deferred.
     *
     * @var bool
     */
    protected $defer = false;

    /**
     * Boot the application events.
     *
     * @return void
     */
    public function boot()
    {
        $this->hooks();
    }

    /**
     * Register the service provider.
     *
     * @return void
     */
    public function register()
    {
        $this->registerTranslations();
        $this->commands([
            \Modules\FolderDrop\Console\HealthCommand::class,
        ]);
    }

    /**
     * Module hooks.
     *
     * @return void
     */
    public function hooks()
    {
        if (!self::customFoldersReady()) {
            return;
        }

        \Eventy::addFilter('stylesheets', function ($styles) {
            $styles[] = \Module::getPublicPath(FOLDERDROP_MODULE).'/css/module.css';

            return $styles;
        });

        \Eventy::addFilter('javascripts', function ($javascripts) {
            $javascripts[] = \Module::getPublicPath(FOLDERDROP_MODULE).'/js/laroute.js';
            $javascripts[] = \Module::getPublicPath(FOLDERDROP_MODULE).'/js/module.js';

            return $javascripts;
        });
    }

    /**
     * Register translations.
     *
     * @return void
     */
    public function registerTranslations()
    {
        $this->loadJsonTranslationsFrom(__DIR__.'/../Resources/lang');
    }

    /**
     * Get the services provided by the provider.
     *
     * @return array
     */
    public function provides()
    {
        return [];
    }

    /**
     * Official Custom Folders must be on, with its license marked activated.
     * The license key is never read.
     *
     * @return bool
     */
    public static function customFoldersReady()
    {
        try {
            if (!\App\Module::isActive('customfolders')) {
                return false;
            }
            $module = \App\Module::getByAlias('customfolders');
        } catch (\Exception $e) {
            return false;
        }

        return $module && !empty($module->activated);
    }
}
