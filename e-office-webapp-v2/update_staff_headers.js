#!/usr/bin/env node
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const staffFolders = [
    'admin-prodi',
    'admin-fakultas',
    'ketua-prodi',
    'staff-fakultas',
    'manajer-tu',
    'supervisor',
    'upa',
    'super-admin'
];

const basePath = 'd:/UNDIP/PKL FSM/skl/e-office-webapp-v2/src/app';

function updateAppHeaderInFile(filePath) {
    try {
        let content = readFileSync(filePath, 'utf8');
        const originalContent = content;

        // Replace <AppHeader /> with <AppHeader greetingOnly={true} />
        content = content.replace(/<AppHeader \/>/g, '<AppHeader greetingOnly={true} />');

        if (content !== originalContent) {
            writeFileSync(filePath, content, 'utf8');
            console.log(`✅ Updated: ${filePath}`);
            return true;
        }
        return false;
    } catch (error) {
        console.error(`❌ Error updating ${filePath}:`, error.message);
        return false;
    }
}

function processDirectory(dirPath) {
    let updatedCount = 0;

    try {
        const items = readdirSync(dirPath);

        for (const item of items) {
            const fullPath = join(dirPath, item);
            const stat = statSync(fullPath);

            if (stat.isDirectory()) {
                updatedCount += processDirectory(fullPath);
            } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
                if (updateAppHeaderInFile(fullPath)) {
                    updatedCount++;
                }
            }
        }
    } catch (error) {
        console.error(`Error processing directory ${dirPath}:`, error.message);
    }

    return updatedCount;
}

console.log('🔄 Updating AppHeader in staff pages...\n');

let totalUpdated = 0;

for (const folder of staffFolders) {
    const folderPath = join(basePath, folder);
    console.log(`\n📁 Processing ${folder}...`);
    const count = processDirectory(folderPath);
    totalUpdated += count;
    console.log(`   ${count} files updated in ${folder}`);
}

console.log(`\n✨ Done! Total files updated: ${totalUpdated}`);
