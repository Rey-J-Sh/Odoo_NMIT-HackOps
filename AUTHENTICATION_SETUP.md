# Authentication Setup Guide

This guide explains how to set up the authentication system for Shiv Accounts Cloud.

## Features Implemented

### 1. Authentication System
- **Email/Password Login**: Users can sign in with email and password
- **User Registration**: New users can create accounts with role selection
- **Role-Based Access**: Two user roles - Admin and Invoicing User
- **Protected Routes**: Pages are protected based on authentication status
- **User Profile Management**: Automatic profile creation and management

### 2. User Roles
- **Admin**: Full access to all features
- **Invoicing User**: Access to invoices, payments, and basic features

### 3. Security Features
- **Row Level Security (RLS)**: Database-level security policies
- **Protected Routes**: Frontend route protection
- **Session Management**: Automatic session handling
- **User Profile Sync**: Automatic profile creation on signup

## Setup Instructions

### 1. Supabase Configuration

1. **Enable Email Authentication**:
   - Go to Supabase Dashboard → Authentication → Settings
   - Enable "Email" provider
   - Set up email templates (optional)

2. **Configure Redirect URLs**:
   - Add `http://localhost:3000/auth/callback` to allowed redirect URLs
   - Add your production domain callback URL

3. **Database Setup**:
   - Run the updated `database/schema.sql` to create user tables and RLS policies
   - The schema includes user management and security policies

### 2. Environment Variables

Ensure your `.env.local` file has:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Demo Users

The system includes demo users for testing:

**Admin User**:
- Email: `admin@shivaccounts.com`
- Password: `admin123`
- Role: Admin (full access)

**Invoicing User**:
- Email: `invoice@shivaccounts.com`
- Password: `invoice123`
- Role: Invoicing User (limited access)

## Usage

### 1. Login Process
1. Navigate to `/login`
2. Enter email and password
3. System redirects to dashboard on successful login

### 2. Registration Process
1. Navigate to `/signup`
2. Fill in name, email, password, and select role
3. System creates account and redirects to login

### 3. Navigation
- **Navigation Bar**: Shows user info and logout option
- **Role-Based Menu**: Different menu items based on user role
- **Protected Pages**: Automatic redirect to login if not authenticated

## File Structure

```
src/
├── app/
│   ├── login/page.tsx          # Login page
│   ├── signup/page.tsx         # Registration page
│   ├── unauthorized/page.tsx   # Access denied page
│   └── auth/callback/page.tsx  # Auth callback handler
├── components/
│   ├── Navigation.tsx          # Navigation component
│   └── ProtectedRoute.tsx      # Route protection
├── contexts/
│   └── AuthContext.tsx         # Authentication context
└── lib/
    └── supabase.ts             # Supabase configuration
```

## Security Features

### 1. Database Security
- **Row Level Security (RLS)**: Users can only access their own data
- **Role-Based Policies**: Different access levels for different roles
- **Automatic Profile Creation**: User profiles created on first login

### 2. Frontend Security
- **Protected Routes**: Pages require authentication
- **Role-Based Access**: Different features for different roles
- **Session Management**: Automatic session handling

### 3. User Management
- **Profile Sync**: User profiles automatically created
- **Role Assignment**: Roles assigned during registration
- **Session Persistence**: Login state maintained across page refreshes

## Troubleshooting

### Common Issues

1. **Login Not Working**:
   - Check Supabase email provider is enabled
   - Verify redirect URLs are configured
   - Check browser console for errors

2. **Profile Not Created**:
   - Check database RLS policies
   - Verify user table exists
   - Check auth callback page

3. **Role-Based Access Issues**:
   - Verify user role in database
   - Check RLS policies
   - Verify role assignment during signup

### Debug Steps

1. Check browser console for errors
2. Verify Supabase configuration
3. Check database policies
4. Test with demo accounts

## Next Steps

1. **Email Verification**: Add email verification for new accounts
2. **Password Reset**: Implement password reset functionality
3. **User Management**: Add admin panel for user management
4. **Audit Logging**: Add user activity logging
5. **Multi-Factor Authentication**: Add 2FA support

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review Supabase documentation
3. Check browser console for errors
4. Verify environment variables

