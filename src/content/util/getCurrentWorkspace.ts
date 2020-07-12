import {SHA2_256} from '../../util'
import {waitFor} from './waitFor'

export async function getCurrentWorkspace(): Promise<string> {
  const notionSidebarSwitcher = await waitFor('.notion-sidebar-switcher')
  const workspaceTitle = notionSidebarSwitcher.textContent || ''

  const workspaceHash = SHA2_256(workspaceTitle)

  return workspaceHash
}
