import type { ReactNode } from 'react'

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div>
      <h1>Dashboard NavBar</h1>
      {children}
    </div>
  )
}