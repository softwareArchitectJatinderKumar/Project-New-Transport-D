Notes: responsiveness changes applied

- Added mobile hamburger and mobile menu handled by `App.menuOpen` signal.
- Topbar shows auth-specific links; mobile menu mirrors same links.
- `styles.scss` updated with .hamburger, .mobile-menu, and responsive table helpers.
- `app.html` replaced Bootstrap nav with the app-shell topbar and mobile menu.
- `transport` and `home` pages have .table-wrap which now supports horizontal scrolling on small screens.

Testing notes:
- Start the app and test on small screens (<=640px) to verify hamburger appears and menu toggles.
- On transport page, ensure the table scrolls horizontally when many columns exist.
