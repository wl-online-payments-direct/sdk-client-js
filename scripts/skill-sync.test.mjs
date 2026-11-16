import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { parseRegions, run, syncMarkdown, syncVersionedLinks } from './skill-sync.mjs';

const fence = '```';

function fixture({ example, markdown, skill = '# Skill\n', readme = 'See /v1.2.3/skill/SKILL.md\n' }) {
    const root = mkdtempSync(join(tmpdir(), 'skill-sync-'));
    mkdirSync(join(root, 'scripts'));
    mkdirSync(join(root, 'skill', 'examples'), { recursive: true });
    mkdirSync(join(root, 'skill', 'references'));
    writeFileSync(
        join(root, 'scripts', 'skill-sync.config.json'),
        JSON.stringify({
            skillDir: 'skill',
            examplesDir: 'skill/examples',
            version: { file: 'package.json', pattern: '"version"\\s*:\\s*"([^"]+)"' },
            versionedLinkFiles: ['README.md'],
        }),
    );
    writeFileSync(join(root, 'package.json'), '{ "version": "1.2.3" }');
    writeFileSync(join(root, 'README.md'), readme);
    writeFileSync(join(root, 'skill', 'SKILL.md'), skill);
    writeFileSync(join(root, 'skill', 'examples', 'a.ts'), example);
    writeFileSync(join(root, 'skill', 'references', 'flows.md'), markdown);
    return root;
}

const example = ['function f() {', '    // [START one]', '    const a = 1;', '    // [END one]', '}', ''].join('\n');
const boundBlock = (body) => `<!-- region: one -->\n${fence}ts\n${body}\n${fence}\n`;

test('parseRegions dedents and drops nested markers', () => {
    const errors = [];
    const regions = parseRegions(
        ['// [START outer]', '  a', '  // [START inner]', '    b', '  // [END inner]', '// [END outer]'].join('\n'),
        'x.ts',
        errors,
    );
    assert.deepEqual(errors, []);
    assert.equal(regions.find((r) => r.name === 'outer').content, 'a\n  b');
    assert.equal(regions.find((r) => r.name === 'inner').content, 'b');
});

test('parseRegions reports unclosed and mismatched markers', () => {
    const errors = [];
    parseRegions('// [START a]\n// [END b]\n// [START c]\n', 'x.ts', errors);
    assert.equal(errors.length, 2);
    assert.match(errors[0], /closes "a"/);
    assert.match(errors[1], /"c" is not closed/);
});

test('syncMarkdown replaces the bound block', () => {
    const errors = [];
    const regions = new Map([['one', { content: 'const a = 1;' }]]);
    const result = syncMarkdown(boundBlock('old'), 'f.md', regions, errors);
    assert.deepEqual(errors, []);
    assert.equal(result.text, boundBlock('const a = 1;'));
});

test('syncMarkdown reports an unknown region and a binding without a fence', () => {
    const errors = [];
    syncMarkdown('<!-- region: nope -->\ntext\n', 'f.md', new Map(), errors);
    assert.match(errors[0], /directly above a code fence/);
});

test('syncVersionedLinks updates every link', () => {
    const result = syncVersionedLinks('a /v0.0.1/skill b /v9.9.9/skill/SKILL.md', '1.2.3', 'skill');
    assert.equal(result.count, 2);
    assert.equal(result.text, 'a /v1.2.3/skill b /v1.2.3/skill/SKILL.md');
});

test('check passes when everything is in sync', () => {
    const root = fixture({ example, markdown: boundBlock('const a = 1;') });
    assert.deepEqual(run(root, 'check'), { errors: [], outdated: [] });
});

test('check reports an outdated block and write fixes it', () => {
    const root = fixture({ example, markdown: boundBlock('const a = 2;'), readme: 'x /v1.0.0/skill\n' });
    assert.deepEqual(run(root, 'check').outdated, ['skill/references/flows.md', 'README.md']);
    run(root, 'write');
    assert.deepEqual(run(root, 'check'), { errors: [], outdated: [] });
    assert.equal(readFileSync(join(root, 'README.md'), 'utf8'), 'x /v1.2.3/skill\n');
});

test('check reports an unused region, a version in SKILL.md and a missing versioned link', () => {
    const root = fixture({ example, markdown: 'no blocks\n', skill: 'Use v1.2.3\n', readme: 'no link\n' });
    const { errors } = run(root, 'check');
    assert.equal(errors.length, 3);
    assert.match(errors[0], /"one" is not used/);
    assert.match(errors[1], /must not contain an SDK version/);
    assert.match(errors[2], /no versioned skill link/);
});
