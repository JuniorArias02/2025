const fs = require('fs');
const path = require('path');

const MEMORIES_DIR = path.join(__dirname, '../public/memories');
const OUTPUT_FILE = path.join(__dirname, '../public/memories.json');

// Supported extensions
const VALID_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.mp4', '.mov'];

async function generateManifest() {
    console.log('🔍 Scanning specific folder for your memories...');

    if (!fs.existsSync(MEMORIES_DIR)) {
        console.log(`⚠️ Folder "public/memories" not found. Creating it...`);
        fs.mkdirSync(MEMORIES_DIR, { recursive: true });
    }

    try {
        const files = fs.readdirSync(MEMORIES_DIR);
        
        const mediaFiles = files
            .filter(file => VALID_EXTENSIONS.includes(path.extname(file).toLowerCase()))
            .map(file => {
                // Try to guess date from filename or modification time
                const fullPath = path.join(MEMORIES_DIR, file);
                const stats = fs.statSync(fullPath);
                
                return {
                    filename: file,
                    path: `/memories/${file}`,
                    type: path.extname(file).toLowerCase() === '.mp4' || path.extname(file).toLowerCase() === '.mov' ? 'video' : 'image',
                    date: stats.mtime, // You can manually edit the JSON later if needed
                    caption: "" // Placeholder for captions
                };
            })
            .sort((a, b) => new Date(a.date) - new Date(b.date)); // Sort chronologically

        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(mediaFiles, null, 2));
        console.log(`✅ Success! Found ${mediaFiles.length} memories.`);
        console.log(`📄 Manifest saved to public/memories.json`);
        
    } catch (error) {
        console.error('❌ Error scanning directory:', error);
    }
}

generateManifest();
