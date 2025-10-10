export interface Vape {
  id: string | number;
  name: string;
  type: string;
  flavor: string;
  effects: string;
  priceAlgo: number;
  priceUsdc: number;
  hempEarned: number;
  potency: string;
  terpenes: string[];
  color: string;
  image: string;
  strain?: string;
}
