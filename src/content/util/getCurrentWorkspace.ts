import {waitFor} from './waitFor'

export async function getCurrentWorkspace(): Promise<string> {
  const notionSidebarSwitcher = await waitFor('.notion-sidebar-switcher')
  const workspaceTitle = notionSidebarSwitcher.textContent
  const workspaceIdentifier = workspaceTitle?.replace(/[^a-zA-Z0-9]/g, '-') ?? ''

  return workspaceIdentifier
}
