/**
 * TEMPLATES — Full-screen layout skeletons that wire organisms together.
 *
 * Rules:
 * - Define the layout/structure of a screen (spacing, scroll, safe area)
 * - Contain organisms and molecules positioned into a screen layout
 * - Do NOT contain real data — receive everything via props (act as a layout shell)
 * - One template per screen type (e.g. ListTemplate, DetailTemplate, FormTemplate)
 *
 * Examples:
 * - AuthTemplate (centered card layout for login/register screens)
 * - ListDetailTemplate (list on top, detail card below — for trip search results)
 * - DashboardTemplate (header + scrollable content + bottom nav)
 * - ChatTemplate (message list + fixed input bar at bottom)
 * - FullScreenFormTemplate (scrollable form with a sticky submit button)
 *
 * Note: In Expo Router, the actual screens live in src/app/ (as Expo routes).
 * Templates are the reusable layout shells that screens compose.
 */
