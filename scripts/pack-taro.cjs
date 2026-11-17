#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const manifestDir = path.join(root, 'packages/taro');
const sourceDir = path.join(root, 'src/core/taro');
const args = process.argv.slice(2);
const outIndex = args.indexOf('--out');
const outDir = path.resolve(outIndex >= 0 ? args[outIndex + 1] : path.join(root, 'artifacts/taro'));
const dependencyRoots = [
  ...(process.env.SUNXU_TARO_NODE_MODULES ? [path.dirname(path.resolve(process.env.SUNXU_TARO_NODE_MODULES))] : []),
  manifestDir,
];
const resolveDependency = (id) => require.resolve(id, { paths: dependencyRoots });
const ts = require(resolveDependency('typescript'));
const reactTypesDir = path.dirname(resolveDependency('@types/react/package.json'));
const taroComponentsDir = path.dirname(resolveDependency('@tarojs/components/package.json'));
const taroDir = path.dirname(resolveDependency('@tarojs/taro/package.json'));
const staging = fs.mkdtempSync(path.join(os.tmpdir(), 'sunxu-taro-pack-'));

try {
  const sources = fs.readdirSync(sourceDir).filter((name) => /\.tsx?$/.test(name)).map((name) => path.join(sourceDir, name));
  const program = ts.createProgram(sources, {
    target: ts.ScriptTarget.ES2017,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    jsx: ts.JsxEmit.ReactJSX,
    strict: true,
    esModuleInterop: true,
    skipLibCheck: true,
    declaration: true,
    rootDir: sourceDir,
    outDir: path.join(staging, 'dist'),
    baseUrl: manifestDir,
    paths: {
      'react': [reactTypesDir],
      'react/*': [path.join(reactTypesDir, '*')],
      '@tarojs/components': [path.join(taroComponentsDir, 'types/index.d.ts')],
      '@tarojs/taro': [path.join(taroDir, 'types/index.d.ts')],
    },
  });
  const diagnostics = ts.getPreEmitDiagnostics(program);
  if (diagnostics.length) {
    process.stderr.write(ts.formatDiagnosticsWithColorAndContext(diagnostics, {
      getCanonicalFileName: (name) => name,
      getCurrentDirectory: () => root,
      getNewLine: () => '\n',
    }));
    process.exitCode = 1;
  } else {
    const result = program.emit();
    if (result.emitSkipped) throw new Error('Taro package emit was skipped.');
    const manifest = JSON.parse(fs.readFileSync(path.join(manifestDir, 'package.json'), 'utf8'));
    delete manifest.scripts;
    delete manifest.devDependencies;
    fs.writeFileSync(path.join(staging, 'package.json'), JSON.stringify(manifest, null, 2) + '\n');
    for (const name of ['tokens.css', 'styles.css', 'overrides.css']) fs.copyFileSync(path.join(sourceDir, name), path.join(staging, name));
    fs.copyFileSync(path.join(root, 'docs/taro-components.md'), path.join(staging, 'README.md'));
    fs.copyFileSync(path.join(root, 'LICENSE'), path.join(staging, 'LICENSE'));
    fs.mkdirSync(outDir, { recursive: true });
    const packed = spawnSync('npm', ['pack', '--json', '--pack-destination', outDir], { cwd: staging, encoding: 'utf8' });
    if (packed.status !== 0) throw new Error(packed.stderr || packed.stdout || 'npm pack failed');
    const info = JSON.parse(packed.stdout)[0];
    process.stdout.write(JSON.stringify({ name: info.name, version: info.version, filename: path.join(outDir, info.filename), integrity: info.integrity, shasum: info.shasum }) + '\n');
  }
} finally {
  fs.rmSync(staging, { recursive: true, force: true });
}
