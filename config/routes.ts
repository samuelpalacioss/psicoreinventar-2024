//  * Users can navigate to these routes regardless of their login status.
// todo register doctor: change this to use a token (magic link)
export const publicRoutes = ['/about', '/services', '/specialists', '/verify-email'];

// * Users if logged in and try to navigate to these routes, they will be redirected to the defaultLoginRedirect.
export const authRoutes = ['/login', '/register', '/reset-password', '/new-password'];

export const defaultLoginRedirect = '/dashboard';

//* Protected routes are those that require the user to be logged in, this is managed on auth.config.ts
