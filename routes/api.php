<?php

use App\Http\Controllers\FileController;
use App\Http\Controllers\RatingController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('auth:api')->get('/user', function (Request $request) {
    return $request->user();
});

Route::apiResource('files', FileController::class);
Route::get('/files', [FileController::class, 'show']);

Route::post('/rating', [RatingController::class, 'store']);
Route::get('/rating', [RatingController::class, 'show']);
