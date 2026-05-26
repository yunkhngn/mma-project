/**
 * ORGANISMS — Complex, self-contained UI sections built from molecules and atoms.
 *
 * Rules:
 * - Can connect to global state (Zustand store, context)
 * - Can call service functions (but prefer receiving data via props when possible)
 * - Represent a complete section of the UI with its own logic
 * - Are specific to the app's domain (not generic)
 *
 * Examples:
 * - SeatMap (grid of SeatCard molecules)
 * - TripSearchForm (multiple FormField molecules + Button atom)
 * - BookingList (list of TripCard molecules)
 * - ChatConversation (list of MessageBubble molecules + input)
 * - AdminBookingTable (data table with filter/sort)
 * - RevenueChart (chart + summary statistics)
 * - AppHeader (navigation + user avatar)
 */
