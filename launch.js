delete process.env.ELECTRON_RUN_AS_NODE;
const { spawn } = require('child_process');
const electronPath = require('electron');
const child = spawn(electronPath, ['.'], { stdio: 'inherit', env: process.env });
child.on('exit', code => process.exit(code ?? 0));
