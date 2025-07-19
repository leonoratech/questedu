import { BaseEntity } from './basemodel';

export interface College extends BaseEntity {
  name: string;
  accreditation: string;
  affiliation: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  contact: {
    phone: string;
    email: string;
    website: string;
  };
  website: string;
  principalName: string;
  description: string;
  
  // New: This will be the single college for the app
  isDefault: boolean; // Mark the single college as default
}
