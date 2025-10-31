export interface User {
  _id: string;
  username: string;
  image?: string; // Add optional image property
}

export interface Review {
  _id?: string;
  text: string;
  rating: number;
  createdAt?: string | Date;
  user?: User; // Use the User interface instead of inline definition
  tmer?: string;
  booking?: string;
}
