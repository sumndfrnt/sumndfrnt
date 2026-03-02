export interface SDEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  city: string;
  ticketUrl: string;
  imageUrl?: string;
  createdAt: string;
}

export const defaultEvents: SDEvent[] = [];
