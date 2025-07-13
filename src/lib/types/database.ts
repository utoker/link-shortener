// src/lib/types/database.ts

import { Database } from './database.types';

export type Link = Database['public']['Tables']['links']['Row'];
export type ClickEvent = Database['public']['Tables']['click_events']['Row'];
export type Slug = Link['slug'];
