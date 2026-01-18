<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SchoolYear;
use Illuminate\Http\Request;

class SchoolYearLockController extends Controller
{
    /**
     * Lock the specified school year.
     */
    public function lock(SchoolYear $schoolYear)
    {
        if ($schoolYear->is_locked) {
            return back()->withErrors([
                'message' => 'School year is already locked.'
            ]);
        }

        // Safety check: must not be active
        if ($schoolYear->status == 'active') {
            return back()->withErrors([
                'message' => 'Deactivate school year before locking.'
            ]);
        }

        $schoolYear->update([
            'is_locked' => true,
        ]);

        return back()->with('success', 'School year locked successfully.');
    }

    /**
     * Unlock the specified school year.
     */
    public function unlock(SchoolYear $schoolYear)
    {
        if (!$schoolYear->is_locked) {
            return back()->withErrors([
                'message' => 'School year is not locked.'
            ]);
        }

        // OPTIONAL: restrict role
        // abort_unless(auth()->user()->hasRole('Super Admin'), 403);

        $schoolYear->update([
            'is_locked' => false,
        ]);

        return back()->with('success', 'School year unlocked successfully.');
    }
}
