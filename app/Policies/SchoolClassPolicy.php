<?php

namespace App\Policies;

use App\Models\SchoolClass;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class SchoolClassPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return false;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, SchoolClass $schoolClass): bool
    {
        return false;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return false;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, SchoolClass $schoolClass): bool
    {
        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, SchoolClass $schoolClass): bool
    {
        return false;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, SchoolClass $schoolClass): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, SchoolClass $schoolClass): bool
    {
        return false;
    }

    public function markAttendance(User $user, SchoolClass $class): bool
    {
        // School year must be active
        // if ($class->schoolYear->is_locked) {
        //     return false;
        // }

        // Admins can always mark
        if ($user->hasRole('super-admin') || $user->hasRole('school-admin')) {
            return true;
        }

        // Subject teacher can mark their own class
        if (
            $user->hasRole('teacher') &&
            $class->teacher_id === $user->teacher?->id
        ) {
            return true;
        }

        // else deny
        return false;
    }
}
