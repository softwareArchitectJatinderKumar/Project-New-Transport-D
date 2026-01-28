# TODO for Adding Login with Static Credentials and Dashboard

1. [x] Update auth.service.ts: Change UserToken interface to use email instead of username, update login method to accept email and role.
2. [x] Update login.component.ts: Change username to email, add static password check (admin@transport.com / password123).
3. [x] Update login.component.html: Change "Username" label to "EmailId".
4. [x] Update app.routes.ts: Add authGuard to dashboard route.
5. [x] Update dashboard.component.ts: Add a card with link to transports page.
6. [x] Test the login and navigation.
