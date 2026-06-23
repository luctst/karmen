import { createBrowserRouter } from "react-router-dom"

import { Queue } from "./screens/queue/Queue"
import { Workspace } from "./screens/Workspace"

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
