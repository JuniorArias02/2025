const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const INPUT_DIR = path.join(__dirname, '../public/memories');
const OUTPUT_DIR = path.join(__dirname, '../public/memories/optimized');
const MANIFEST_FILE = path.join(__dirname, '../public/memories.json');

// Ensure output dir exists
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const VALID_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

async function optimizeImages() {
    console.log('🚀 Starting image optimization...');

    // Get all files
    const files = fs.readdirSync(INPUT_DIR).filter(file => {
        const ext = path.extname(file).toLowerCase();
        return VALID_EXTENSIONS.includes(ext);
    });

    const optimizedMemories = [];
    let processedCount = 0;

    for (const file of files) {
        const inputPath = path.join(INPUT_DIR, file);
        const outputFilename = path.parse(file).name + '.webp'; // Convert to WebP
        const outputPath = path.join(OUTPUT_DIR, outputFilename);

        // Skip if already exists and is newer than source (basic cache)
        if (fs.existsSync(outputPath)) {
            const inputStats = fs.statSync(inputPath);
            const outputStats = fs.statSync(outputPath);
            if (outputStats.mtime > inputStats.mtime) {
                // console.log(`⏩ Skipping ${file} (already optimized)`);
                optimizedMemories.push(createMemoryEntry(file, outputFilename, inputStats.mtime));
                continue;
            }
        }

        console.log(`✨ Processing: ${file}`);

        try {
            await sharp(inputPath)
                .resize({ width: 1920, height: 1080, fit: 'inside', withoutEnlargement: true }) // Max FHD
                .webp({ quality: 80 }) // Good balance
                .toFile(outputPath);

            const stats = fs.statSync(inputPath);
            optimizedMemories.push(createMemoryEntry(file, outputFilename, stats.mtime));
            processedCount++;
        } catch (err) {
            console.error(`❌ Error processing ${file}:`, err);
        }
    }

    // Handle Videos (Just Copy entries, maybe copy files if needed, but for now just link original)
    // We don't compress video in this simple script, but we included them in list
    const videoExtensions = ['.mp4', '.mov'];
    const videoFiles = fs.readdirSync(INPUT_DIR).filter(file => videoExtensions.includes(path.extname(file).toLowerCase()));

    for (const file of videoFiles) {
        const fullPath = path.join(INPUT_DIR, file);
        const stats = fs.statSync(fullPath);
        optimizedMemories.push({
            filename: file,
            path: `/memories/${file}`, // Link to original for video
            type: 'video',
            date: stats.mtime,
            caption: ""
        });
    }

    // Sort
    optimizedMemories.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Save Manifest
    fs.writeFileSync(MANIFEST_FILE, JSON.stringify(optimizedMemories, null, 2));

    console.log(`\n✅ Done! Optimized ${processedCount} new images.`);
    console.log(`📄 Manifest updated with ${optimizedMemories.length} total memories.`);
}

function createMemoryEntry(originalName, optimizedName, date) {
    return {
        filename: originalName,
        path: `/memories/optimized/${optimizedName}`,
        type: 'image',
        date: date,
        caption: ""
    };
}

optimizeImages();
