<?php

Route::group(['middleware' => 'web', 'prefix' => \Helper::getSubdirectory(), 'namespace' => 'Modules\FolderDrop\Http\Controllers'], function () {
    Route::post('/folderdrop/ajax', ['uses' => 'FolderDropController@ajax', 'middleware' => ['auth', 'roles'], 'roles' => ['admin', 'user'], 'laroute' => true])->name('folderdrop.ajax');
});
