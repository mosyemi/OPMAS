<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class AuthController extends Controller
{
    public function showLogin()
    {
        if (Auth::check()) {
            return redirect('/dashboard');
        }
        return Inertia::render('LoginPage');
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        $email = $credentials['email'];
        $password = $credentials['password'];

        // 1. Look for user in the database
        $user = User::where('email', $email)->first();

        // 2. Allow login if user exists and password is 'password' OR matches DB hash
        if ($user && ($password === 'password' || Hash::check($password, $user->password))) {
            Auth::login($user);
            $request->session()->regenerate();

            return redirect()->intended('/dashboard');
        }

        // 3. Fallback demo login for old frontend login credentials
        if ($email === 'operator@example.com' && $password === 'password') {
            $demoUser = User::firstOrCreate(
                ['email' => 'operator@example.com'],
                ['name' => 'Demo Operator', 'password' => Hash::make('password')]
            );
            Auth::login($demoUser);
            $request->session()->regenerate();
            
            return redirect()->intended('/dashboard');
        }

        return back()->withErrors([
            'email' => 'The provided credentials do not match our records.',
        ]);
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/login');
    }
}