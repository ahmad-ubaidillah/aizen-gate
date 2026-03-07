import { expect, test, describe, vi, afterEach } from 'vitest';
const fs = require('fs-extra');
const path = require('path');
const { runAutoLoop } = require('../scripts/auto-loop');

describe('Aizen-Gate Auto Loop', () => {
    
    test('Identifies next PENDING task and transitions to In Progress', async () => {
        const mockRoot = '/tmp/project';
        const mockBoard = `
| ID | Task | Depends On | Agent | Status | Expectation |
|----|------|------------|-------|--------|-------------|
| T-001 | Task 1 | - | @DEV | Todo | Expectation 1 |
`;
        const mockState = `**Current focus:** none\n**Last activity:** none`;

        vi.spyOn(fs, 'existsSync').mockReturnValue(true);
        vi.spyOn(fs, 'readFileSync').mockImplementation((p) => {
            if (p.includes('board.md')) return mockBoard;
            if (p.includes('state.md')) return mockState;
            return '';
        });
        const writer = vi.spyOn(fs, 'writeFileSync').mockImplementation(() => {});

        const result = await runAutoLoop(mockRoot);
        
        expect(result.success).toBe(true);
        expect(result.task.id).toBe('T-001');
        
        // Match the call to write the updated board
        expect(writer).toHaveBeenCalledWith(expect.stringContaining('board.md'), expect.stringContaining('In Progress'));
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });
});
