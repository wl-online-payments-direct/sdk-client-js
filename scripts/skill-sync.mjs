#!/usr/bin/env node
/*
 * skill-sync v1.0.0
 *
 * Keeps the code blocks in the Agent Skill Markdown files identical to the named regions in the
 * example files, and keeps the versioned skill links in the README and doc comments at the current
 * SDK version. The same script, at the same version, is used in every client SDK repository.
 *
 * Usage:
 *   node scripts/skill-sync.mjs write   fill code blocks and versioned links
 *   node scripts/skill-sync.mjs check   exit 1 if anything is out of date or malformed
 *
 * Configuration is read from scripts/skill-sync.config.json:
 *   skillDir             folder with SKILL.md and references/ (Markdown files are scanned recursively)
 *   examplesDir          folder with the example files (scanned recursively)
 *   version.file         file that holds the SDK version
 *   version.pattern      regular expression whose first group is the SDK version
 *   versionedLinkFiles   files that must contain a link with "/v<version>/<skillDir>"
 *
 * In an example file, a region is marked with comment lines:
 *   // [START encrypt-payment-request]
 *   ...
 *   // [END encrypt-payment-request]
 * ("#" comments are accepted as well). Regions may be nested; marker lines are never copied.
 *
 * In a Markdown file, a code block is bound to a region by the line directly above its fence:
 *   <!-- region: encrypt-payment-request -->
 *   ```ts
 *   ```
 */

import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const MARKER = /^\s*(?:\/\/|#)\s*\[(START|END) ([a-z0-9][a-z0-9-]*)\]\s*$/;
const MD_BINDING = /^<!-- region: ([a-z0-9][a-z0-9-]*) -->\s*$/;
const FENCE = /^```/;
const SEMVER = /\bv?\d+\.\d+\.\d+\b/;

const normalize = (text) => text.replace(/\r\n/g, '\n');

function listFiles(dir, filter) {
    const result = [];
    for (const entry of readdirSync(dir)) {
        const path = join(dir, entry);
        if (statSync(path).isDirectory()) {
            result.push(...listFiles(path, filter));
        } else if (filter(path)) {
            result.push(path);
        }
    }
    return result.sort();
}

function dedent(lines) {
    const indents = lines.filter((line) => line.trim()).map((line) => line.match(/^\s*/)[0].length);
    const min = indents.length ? Math.min(...indents) : 0;
    return lines.map((line) => line.slice(min)).join('\n');
}

/**
 * Returns the regions of one example file as { name, file, line, content }.
 */
export function parseRegions(text, file, errors) {
    const lines = normalize(text).split('\n');
    const open = [];
    const regions = [];

    lines.forEach((line, index) => {
        const match = line.match(MARKER);
        if (!match) {
            open.forEach((region) => region.lines.push(line));
            return;
        }

        const [, kind, name] = match;
        if (kind === 'START') {
            if (open.some((region) => region.name === name)) {
                errors.push(`${file}:${index + 1}: region "${name}" is already open`);
            }
            open.push({ name, file, line: index + 1, lines: [] });
            return;
        }

        const top = open.pop();
        if (!top) {
            errors.push(`${file}:${index + 1}: [END ${name}] without a matching [START]`);
        } else if (top.name !== name) {
            errors.push(`${file}:${index + 1}: [END ${name}] closes "${top.name}" opened on line ${top.line}`);
        } else {
            regions.push({ name, file, line: top.line, content: dedent(top.lines) });
        }
    });

    open.forEach((region) => errors.push(`${region.file}:${region.line}: region "${region.name}" is not closed`));

    return regions;
}

/**
 * Fills every bound code block in one Markdown file. Returns the new text and the region names used.
 */
export function syncMarkdown(text, file, regionsByName, errors) {
    const lines = normalize(text).split('\n');
    const output = [];
    const used = new Set();

    for (let i = 0; i < lines.length; i++) {
        output.push(lines[i]);
        const binding = lines[i].match(MD_BINDING);
        if (!binding) {
            continue;
        }

        const name = binding[1];
        const fenceLine = lines[i + 1];
        if (fenceLine === undefined || !FENCE.test(fenceLine)) {
            errors.push(`${file}:${i + 1}: region binding "${name}" must be directly above a code fence`);
            continue;
        }

        let end = i + 2;
        while (end < lines.length && !FENCE.test(lines[end])) {
            end++;
        }
        if (end >= lines.length) {
            errors.push(`${file}:${i + 2}: code block for "${name}" is not closed`);
            continue;
        }

        const region = regionsByName.get(name);
        if (!region) {
            errors.push(`${file}:${i + 1}: region "${name}" does not exist in any example file`);
            continue;
        }

        used.add(name);
        output.push(fenceLine, region.content, lines[end]);
        i = end;
    }

    return { text: output.join('\n'), used };
}

/**
 * Replaces the version in every "/v<semver>/<skillDir>" link. Returns the new text and the match count.
 */
export function syncVersionedLinks(text, version, skillDir) {
    const pattern = new RegExp(`/v\\d+\\.\\d+\\.\\d+/${skillDir}\\b`, 'g');
    let count = 0;
    const result = normalize(text).replace(pattern, () => {
        count++;
        return `/v${version}/${skillDir}`;
    });
    return { text: result, count };
}

export function run(root, mode) {
    const config = JSON.parse(readFileSync(join(root, 'scripts', 'skill-sync.config.json'), 'utf8'));
    const errors = [];
    const outdated = [];
    const rel = (path) => relative(root, path).replace(/\\/g, '/');

    const update = (path, current, next) => {
        if (current === next) {
            return;
        }
        if (mode === 'write') {
            writeFileSync(path, next);
        } else {
            outdated.push(rel(path));
        }
    };

    const regionsByName = new Map();
    for (const path of listFiles(join(root, config.examplesDir), () => true)) {
        for (const region of parseRegions(readFileSync(path, 'utf8'), rel(path), errors)) {
            const existing = regionsByName.get(region.name);
            if (existing) {
                errors.push(
                    `${region.file}:${region.line}: region "${region.name}" is also defined in ${existing.file}:${existing.line}`,
                );
            } else {
                regionsByName.set(region.name, region);
            }
        }
    }

    const skillDir = join(root, config.skillDir);
    const examplesDir = resolve(root, config.examplesDir);
    const markdownFiles = listFiles(skillDir, (path) => path.endsWith('.md') && !resolve(path).startsWith(examplesDir));
    const used = new Set();

    for (const path of markdownFiles) {
        const current = normalize(readFileSync(path, 'utf8'));
        const result = syncMarkdown(current, rel(path), regionsByName, errors);
        result.used.forEach((name) => used.add(name));
        update(path, current, result.text);
    }

    for (const [name, region] of regionsByName) {
        if (!used.has(name)) {
            errors.push(`${region.file}:${region.line}: region "${name}" is not used in any Markdown file`);
        }
    }

    const skillMd = join(skillDir, 'SKILL.md');
    const skillText = readFileSync(skillMd, 'utf8');
    if (SEMVER.test(skillText)) {
        errors.push(`${rel(skillMd)}: must not contain an SDK version (found "${skillText.match(SEMVER)[0]}")`);
    }

    const versionMatch = readFileSync(join(root, config.version.file), 'utf8').match(
        new RegExp(config.version.pattern),
    );
    if (!versionMatch) {
        errors.push(`${config.version.file}: no version found with pattern ${config.version.pattern}`);
    } else {
        for (const file of config.versionedLinkFiles) {
            const path = join(root, file);
            const current = normalize(readFileSync(path, 'utf8'));
            const result = syncVersionedLinks(current, versionMatch[1], config.skillDir);
            if (result.count === 0) {
                errors.push(`${file}: no versioned skill link "/v<version>/${config.skillDir}" found`);
            }
            update(path, current, result.text);
        }
    }

    return { errors, outdated };
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;

if (isMain) {
    const mode = process.argv[2];
    if (mode !== 'write' && mode !== 'check') {
        console.error('Usage: node scripts/skill-sync.mjs <write|check>');
        process.exit(2);
    }

    const { errors, outdated } = run(process.cwd(), mode);
    errors.forEach((error) => console.error(`error: ${error}`));
    outdated.forEach((file) => console.error(`out of date: ${file} (run "node scripts/skill-sync.mjs write")`));

    if (errors.length || outdated.length) {
        process.exit(1);
    }
    console.log(mode === 'write' ? 'skill-sync: files updated' : 'skill-sync: skill is up to date');
}
