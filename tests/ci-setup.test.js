import { expect, test, describe, vi, afterEach } from 'vitest';
const fs = require('fs-extra');
const { setupCI } = require('../scripts/ci-setup');

describe('Aizen-Gate CI/CD Orchestrator', () => {
    
    test('Injects GitHub Actions config file', async () => {
        const mockRoot = '/tmp/project';
        
        vi.spyOn(fs, 'existsSync').mockReturnValue(false);
        const ensureSpy = vi.spyOn(fs, 'ensureDir').mockResolvedValue();
        const writeSpy = vi.spyOn(fs, 'writeFile').mockResolvedValue();

        const result = await setupCI(mockRoot);
        
        expect(result.success).toBe(true);
        expect(ensureSpy).toHaveBeenCalled();
        expect(writeSpy).toHaveBeenCalledWith(
            expect.stringContaining('sa-compliance.yml'),
            expect.stringContaining('name: Aizen-Gate AI Compliance')
        );
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });
});
