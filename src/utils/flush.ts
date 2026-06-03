export async function callOptionalFlush(flush: (() => void | Promise<void>) | undefined): Promise<void> {
  if (flush) {
    await flush();
  }
}

