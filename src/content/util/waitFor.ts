export async function waitFor(selector: string): Promise<Element> {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const el = document.querySelector(selector)
    if (el) return el
    await new Promise((resolve) => setTimeout(resolve, 200))
  }
}
