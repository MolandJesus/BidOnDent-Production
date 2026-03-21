type TimeoutAbortController = {
  controller: AbortController;
  clear: () => void;
  didTimeout: () => boolean;
};

export function createTimeoutAbortController(timeoutMs: number): TimeoutAbortController {
  const controller = new AbortController();
  let timedOut = false;
  const timeoutId = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);

  return {
    controller,
    clear: () => clearTimeout(timeoutId),
    didTimeout: () => timedOut,
  };
}
