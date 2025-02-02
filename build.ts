import { build, type Options } from 'tsup'

const tsupConfig: Options = {
    entry: ['src/**/*.ts'],
    splitting: false,
    sourcemap: false,
    clean: true,
    bundle: true
} satisfies Options

await Promise.all([
    // ? tsup cjs
    build({
        outDir: 'dist',
        format: 'cjs',
        target: 'node18',
        // dts: true,
        ...tsupConfig
    })
])

process.exit()