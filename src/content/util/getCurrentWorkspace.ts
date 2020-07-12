import {SHA2_256} from '../../util'
import {waitFor} from './waitFor'

export async function getCurrentWorkspace(): Promise<string> {
  const notionSidebarSwitcher = await waitFor('.notion-sidebar-switcher')
  const workspaceTitle = notionSidebarSwitcher.textContent
  if (!workspaceTitle) {
    // TODO: display error
    throw new Error('Missing workspace title')
  }

  const workspaceHash = SHA2_256(workspaceTitle)

  return workspaceHash
}
