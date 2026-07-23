import fs from 'fs';
import path from 'path';

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('./src', (filePath) => {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // Fix process.env
    if (content.includes('process.env')) {
      content = content.replace(/process\.env/g, 'import.meta.env');
      changed = true;
    }

    // Fix navigate
    if (content.includes('useNavigate()') && !content.includes('const navigate = useNavigate()')) {
      content = content.replace(/const\s+router\s*=\s*useNavigate\(\);?/g, 'const navigate = useNavigate();');
      changed = true;
    }

    // Fix useSearchParams
    if (content.includes('useSearchParams()') && content.includes('const searchParams = useSearchParams()')) {
      content = content.replace(/const\s+searchParams\s*=\s*useSearchParams\(\);?/g, 'const [searchParams] = useSearchParams();');
      changed = true;
    }

    // Fix useLocation (pathname)
    if (content.includes('useLocation()') && content.includes('const pathname = useLocation()')) {
      content = content.replace(/const\s+pathname\s*=\s*useLocation\(\);?/g, 'const { pathname } = useLocation();');
      changed = true;
    }

    // Add useParams import if needed
    if (content.includes('useParams') && !content.includes('useParams')) {
      // It's probably easier to just replace useRouter with useParams where needed
    }

    if (changed) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated ${filePath}`);
    }
  }
});
