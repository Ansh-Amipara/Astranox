import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { env } from '../config/env';

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

const uploadFolder = async (dirPath: string, folderPrefix: string) => {
  if (!fs.existsSync(dirPath)) {
    console.warn(`Directory not found: ${dirPath}`);
    return;
  }
  
  // Only upload files, not directories
  const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.png') && fs.statSync(path.join(dirPath, f)).isFile());
  console.log(`Found ${files.length} files in ${dirPath}`);
  
  const limit = 20; // 20 concurrent uploads
  let active = 0;
  let index = 0;
  let successCount = 0;
  let errorCount = 0;

  return new Promise<void>((resolve) => {
    const next = () => {
      if (index >= files.length && active === 0) {
        console.log(`Finished ${folderPrefix}. Success: ${successCount}, Errors: ${errorCount}`);
        return resolve();
      }
      while (active < limit && index < files.length) {
        const file = files[index++];
        const filePath = path.join(dirPath, file);
        const nameWithoutExt = path.basename(file, '.png');
        const publicId = `${folderPrefix}/${nameWithoutExt}`;
        
        active++;
        cloudinary.uploader.upload(filePath, {
          public_id: publicId,
          overwrite: true,
          resource_type: 'image'
        })
        .then(() => {
          successCount++;
          if (successCount % 100 === 0) console.log(`Progress ${folderPrefix}: ${successCount}/${files.length} uploaded...`);
          active--;
          next();
        })
        .catch(err => {
          console.error(`Failed ${publicId}:`, err?.message || err);
          errorCount++;
          active--;
          next();
        });
      }
    };
    next();
  });
};

async function main() {
  const baseSpritesDir = path.resolve(process.cwd(), '../pokemon/sprites/sprites');
  
  const typesDir = path.join(baseSpritesDir, 'types/generation-viii/sword-shield');
  const itemsDir = path.join(baseSpritesDir, 'items');
  const pokemonDir = path.join(baseSpritesDir, 'pokemon');

  console.log('--- Uploading Types ---');
  await uploadFolder(typesDir, 'astranox/types');

  console.log('\n--- Uploading Items ---');
  await uploadFolder(itemsDir, 'astranox/items');

  console.log('\n--- Uploading Pokemon ---');
  await uploadFolder(pokemonDir, 'astranox/pokemon');

  console.log('\nAll uploads finished!');
}

main().catch(console.error);
