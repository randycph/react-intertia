<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Role;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class RoleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $roles = Role::get();

        return Inertia::render('Roles/Index', [
            'roles' => $roles,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|unique:roles,name',
            'status' => 'required|in:active,inactive',
        ]);

        $slug = Str::slug($request->name);

        Role::create([
            'name' => $request->name,
            'slug' => $slug,
            'status' => $request->status,
            'created_by' => Auth::id(),
            'updated_by' => Auth::id(),
        ]);

        return redirect()->back();
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function update(Request $request, Role $role)
    {
        $request->validate([
            'name' => 'required|unique:roles,name,' . $role->id,
            'status' => 'required|in:active,inactive',
        ]);

        $slug = Str::slug($request->name);

        $role->update([
            'name' => $request->name,
            'status' => $request->status,
            'slug' => $slug,
            'updated_by' => Auth::id(),
        ]);

        return redirect()->back();
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Role $role)
    {
        $role->where('status', '!=', 'active')->delete();

        return redirect()->back();
    }

    /**
     * Bulk delete roles.
     */
    public function bulkDelete(Request $request)
    {
        Role::whereIn('id', $request->ids)->delete();
        return redirect()->back();
    }
}
