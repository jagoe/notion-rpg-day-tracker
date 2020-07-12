export abstract class Popup {
  protected _popup: HTMLDivElement
  protected _overlay: HTMLDivElement | null = null

  public constructor(protected _name: string) {
    this._popup = this._buildPopup()
  }

  protected _addChildren(...children: Array<HTMLElement>): void {
    children.forEach((element) => {
      this._popup.appendChild(element)
    })
  }

  private _buildPopup() {
    const popup = document.createElement('div')
    popup.classList.add('tt-popup', `tt-popup-${this._name}`)

    return popup
  }

  private _insertOverlay() {
    const overlay = document.createElement('div')
    overlay.id = 'overlay'
    overlay.style.position = 'fixed'
    overlay.style.left = '0'
    overlay.style.top = '0'
    overlay.style.width = '100%'
    overlay.style.height = '100%'
    overlay.addEventListener('click', () => this.hide())
    this._popup.parentElement!.prepend(overlay)

    return overlay
  }

  public append(parent: HTMLElement): void {
    parent.appendChild(this._popup)
  }

  public toggle(): void {
    if (this._popup.classList.contains('show')) {
      this.hide()
    } else {
      this.show()
    }
  }

  public show(): void {
    this._popup.classList.add('show')
    this._overlay = this._insertOverlay()
  }

  public hide(): void {
    this._popup.classList.remove('show')

    // clear all inputs
    const inputs = this._popup.querySelectorAll('input')
    inputs.forEach((input: HTMLInputElement) => (input.value = ''))

    // remove overlay
    if (this._overlay) {
      this._overlay.remove()
      this._overlay = null
    }
  }
}
