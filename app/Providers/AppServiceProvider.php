<?php

namespace App\Providers;

use App\Models\GradingPeriod;
use App\Models\SchoolYear;
use App\Models\Semester;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        Inertia::share([
            'auth' => fn () => [
                'user' => Auth::user(),
                'roles' => Auth::user()?->roles?->pluck('slug') ?? [],
            ],
            'academic' => fn () => academicContext(),
        ]);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
