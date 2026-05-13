let openWall: (() => void) | null = null;

export function registerAuthWallOpener(fn: () => void) {
  openWall = fn;
}

export function triggerAuthWall() {
  openWall?.();
}
