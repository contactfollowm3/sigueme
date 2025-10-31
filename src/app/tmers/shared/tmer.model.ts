import { Booking } from '../../booking/shared/booking.model';

export class Tmer {
  static readonly CATEGORIES = ['Influencer', 'Independent', 'Psychologist',
    'Politician', 'Religious leader', 'Philosopher', 'Model',
    'Fitness instructor/trainer', 'Sociologist', 'Cientist',
    'Astrologer', 'Magician', 'Witch/Warlock',
    'Homemaker/Housewife', 'Handyman', 'Student', 'Artist', 'Writer/Author', 'Chef',
    'Teacher/Educator', 'Doctor/Physician', 'Programmer/Developer',
    'Consultan', 'Journalist', 'Entrepreneur', 'Athlete', 'Engineer',
    'Economist','Lawyer','Actor/Actress','Designer','Not applicable'];



  
  _id:string | undefined;
  title:string | undefined;
  city: string | undefined;
  street:string | undefined;
  category: string | undefined;
  image: string | undefined;
  //bedrooms: number | undefined;
  bedrooms: string | undefined;
  languajes: string | undefined;
  age: number | undefined;
  description: string | undefined;
  dailyRate: number | undefined;
  shared: boolean | undefined;
  user: {
    username: string;
  }
  createdAt: string | undefined;
  bookings: Booking[];


  // Other methods or constructors...
}



