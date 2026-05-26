/**
 * Components barrel export — Atomic Design structure
 *
 * Import convention:
 *   import { Button } from '@/components/atoms';
 *   import { TripCard } from '@/components/molecules';
 *   import { SeatMap } from '@/components/organisms';
 *   import { ChatTemplate } from '@/components/templates';
 *
 * Or from the root barrel:
 *   import { Button, TripCard, SeatMap } from '@/components';
 */
export * from './atoms';
export * from './molecules';
export * from './organisms';
export * from './templates';
