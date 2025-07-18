/**
 /**
 * Server-side Activity Service
 * Handles all Firebase operations for activities on the server
 */

import { BaseRepository } from './base-service';

interface Activity {
  id?: string;
  type: string;
  userId: string;
  timestamp: Date;
  [key: string]: any;
}

export class ActivityService extends BaseRepository<Activity> {
    constructor() {
        super('activities');
    }

    // Add your activity-related methods here
}




