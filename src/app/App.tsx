import { RouterProvider } from 'react-router-dom'
import { GovernanceBootstrap } from './GovernanceBootstrap'
import { RegistryBootstrap } from './RegistryBootstrap'
import { router } from './routes'

export function App() {
  return (
    <GovernanceBootstrap>
      <RegistryBootstrap>
        <RouterProvider router={router} />
      </RegistryBootstrap>
    </GovernanceBootstrap>
  )
}
