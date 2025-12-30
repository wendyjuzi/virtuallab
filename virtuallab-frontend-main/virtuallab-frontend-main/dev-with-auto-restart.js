import chokidar from 'chokidar';
import spawn from 'cross-spawn';

let viteProcess = null;

function startVite() {
  if (viteProcess) {
    viteProcess.kill();
  }
  viteProcess = spawn('npm', ['run', 'dev'], { stdio: 'inherit', shell: true });
}

function restartVite() {
  console.log('\n[auto-restart] 检测到 public/static/json 目录变动，正在重启 Vite...');
  startVite();
}

startVite();

const watcher = chokidar.watch('public/static/json', {
  ignoreInitial: true,
  persistent: true,
});

watcher.on('add', restartVite)
    .on('change', restartVite)
    .on('unlink', restartVite);

process.on('SIGINT', () => {
  if (viteProcess) viteProcess.kill();
  process.exit();
});