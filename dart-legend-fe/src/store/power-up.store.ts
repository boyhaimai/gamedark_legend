import { atom } from "jotai";

export interface ItemPowerUp {
  duration: number;
  upgradeCost: number;
  isActive: boolean;
  level: number;
}
export interface IPowerUp {
  magnetValues: ItemPowerUp[];
  shieldValues: ItemPowerUp[];
  speedValues: ItemPowerUp[];
}

export const atomPowerUp = atom<IPowerUp | undefined>(undefined);
