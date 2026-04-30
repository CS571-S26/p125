export const POOLS = {
  sudo: [
    'Nice try.',
    'Access denied.',
    'sudo: you are not in the sudoers file. This incident will be reported.',
    "Error 418: I'm a teapot.",
    'lol no.',
  ],
  exit: [
    'There is no escape.',
    'You can check out any time you like, but you can never leave.',
    'exit 0 — just kidding.',
    'This terminal does not support that operation.',
    'Nice try.',
  ],
  rm: [
    'rm: /: Permission denied',
    'nice try, but no',
    "I wouldn't do that if I were you.",
    'Error: root filesystem is read-only',
  ],
  hello: [
    'hey 👋',
    "what's up?",
    'oh hi there',
    'hello, friend',
    'greetings, visitor',
    'yo',
  ],
}

export function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}
