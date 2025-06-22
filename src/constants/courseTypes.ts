import { Event } from '@/types';

export const COURSE_TYPES: Event['type'][] = ['Centralizzato', 'Periferico', 'Iniziativa', 'Didattica a distanza (DAD)', 'E-learning'];

export const COURSE_TYPES_MAP: { [key in Event['type'] | 'Non Specificato']: string } = {
  'Centralizzato': 'Corsi Centralizzati',
  'Periferico': 'Corsi Periferici',
  'Iniziativa': 'Corsi d\'Iniziativa',
  'E-learning': 'Corsi E-learning',
  'Didattica a distanza (DAD)': 'Corsi Didattica a Distanza (DAD)',
  'Non Specificato': 'Non Specificato',
};