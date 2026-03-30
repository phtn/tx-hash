import { spawn } from 'node:child_process'

const [command, ...args] = process.argv.slice(2)

if (!command) {
  console.error('Usage: node scripts/run-with-baseline-filter.mjs <command> [...args]')
  process.exit(1)
}

const warningPattern = /\[baseline-browser-mapping\]/

function pipeWithFilter(stream, writer) {
  let buffer = ''

  stream.setEncoding('utf8')
  stream.on('data', (chunk) => {
    buffer += chunk
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''

    for (const line of lines) {
      if (!warningPattern.test(line)) {
        writer.write(`${line}\n`)
      }
    }
  })

  stream.on('end', () => {
    if (buffer && !warningPattern.test(buffer)) {
      writer.write(buffer)
    }
  })
}

const child = spawn(command, args, {
  stdio: ['inherit', 'pipe', 'pipe'],
  env: {
    ...process.env,
    BROWSERSLIST_IGNORE_OLD_DATA: 'true',
    BASELINE_BROWSER_MAPPING_IGNORE_OLD_DATA: 'true'
  }
})

pipeWithFilter(child.stdout, process.stdout)
pipeWithFilter(child.stderr, process.stderr)

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal)
    return
  }

  process.exit(code ?? 1)
})
