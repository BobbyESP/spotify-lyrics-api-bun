import { build, type Options } from 'tsup'

const tsupConfig: Options = {
    entry: ['src/**/*.ts'],
    splitting: false,
    sourcemap: false,
    clean: true,
    bundle: true,
} satisfies Options

await Promise.all([
    // ? tsup esm
    build({
        outDir: 'dist',
        format: 'esm',
        target: 'esnext',
        cjsInterop: false,
        //outExtension: ({ format }) => ({ js: '.mjs' }),
        ...tsupConfig
    }),
])

process.exit()