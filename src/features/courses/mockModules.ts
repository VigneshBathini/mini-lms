// src/features/courses/mockModules.ts
import { Module } from '../../types/course';

export const mockModules: Record<string, Module[]> = {
  '1': [
    { id: 'm1', title: 'Introduction', lessons: 5 },
    { id: 'm2', title: 'Core Concepts', lessons: 8 },
  ],
  '2': [
    { id: 'm3', title: 'Setup & Installation', lessons: 4 },
    { id: 'm4', title: 'Advanced Topics', lessons: 6 },
  ],
};