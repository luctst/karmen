import { createBrowserRouter } from "react-router-dom"

import { Queue } from "./screens/queue/Queue"
import { Workspace } from "./screens/workspace/Workspace"

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Queue />,
  },
  {
    path: "/dossiers/:id",
    element: <Workspace />,
  },
])
