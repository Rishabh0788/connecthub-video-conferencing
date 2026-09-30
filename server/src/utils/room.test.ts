import { describe, expect, it } from 'vitest';
import { generateRoomCode } from './room.js';
describe('room code', () => { it('generates expected format', () => expect(generateRoomCode()).toMatch(/^[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}$/)); });
