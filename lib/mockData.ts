import { User, Absention } from '@/types';

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Yanto',
    phone: '08592848928',
    password: 'password123',
    faceImage: '/images/man_face.jpeg',
    todayAbsention: 'attend'
  },
  {
    id: '2',
    name: 'Painah',
    phone: '08592849990',
    password: 'password123',
    faceImage: '/images/girl_face.jpeg',
    todayAbsention: 'attend'
  },
  {
    id: '3',
    name: 'Laila',
    phone: '08592849956',
    password: 'password123',
    faceImage: '/images/girl_face.jpeg',
    todayAbsention: 'permission'
  },
  {
    id: '4',
    name: 'Supardi',
    phone: '08592849924',
    password: 'password123',
    faceImage: '/images/man_face.jpeg',
    todayAbsention: 'sick'
  },
];

export const mockAbsentions: Absention[] = [
  {
    id: '1',
    userId: '1',
    datetime: '2025-11-06T08:00:00',
    absention: 'attend'
  },
  {
    id: '2',
    userId: '1',
    datetime: '2025-11-05T08:00:00',
    absention: 'attend'
  },
  {
    id: '3',
    userId: '1',
    datetime: '2025-11-04T08:00:00',
    absention: 'attend'
  },
  {
    id: '4',
    userId: '2',
    datetime: '2025-11-06T08:00:00',
    absention: 'attend'
  },
  {
    id: '5',
    userId: '2',
    datetime: '2025-11-05T08:00:00',
    absention: 'alpha'
  },
  {
    id: '6',
    userId: '3',
    datetime: '2025-11-06T08:00:00',
    absention: 'permission'
  },
  {
    id: '7',
    userId: '3',
    datetime: '2025-11-05T08:00:00',
    absention: 'attend'
  },
  {
    id: '8',
    userId: '4',
    datetime: '2025-11-06T08:00:00',
    absention: 'sick'
  },
  {
    id: '9',
    userId: '4',
    datetime: '2025-11-05T08:00:00',
    absention: 'attend'
  },
];
