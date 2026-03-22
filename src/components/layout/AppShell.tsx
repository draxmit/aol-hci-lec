import { ReactNode } from 'react'
import { WebGLShader } from '../animations/WebGLShader'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import type { Page } from '../../lib/types'

interface Props {
  children: ReactNode
  activePage: Page
  onNavigate: (page: Page) => void
  onOpenOmni: () => void
}

export function AppShell({ children, activePage, onNavigate, onOpenOmni }: Props) {
  return (
    <>
      <WebGLShader />
      <div className="fixed inset-0 flex" style={{ zIndex: 10 }}>
        <Sidebar activePage={activePage} onNavigate={onNavigate} />
        <main className="flex flex-col flex-1 overflow-hidden">
          <TopBar activePage={activePage} onOpenOmni={onOpenOmni} />
          <div
            className="flex-1 overflow-y-auto p-7"
            style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}
          >
            {children}
          </div>
        </main>
      </div>
    </>
  )
}
