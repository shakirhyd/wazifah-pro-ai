/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { RouterProvider } from '@tanstack/react-router';
import { createRouter } from './router';

const router = createRouter();

export default function App() {
  return <RouterProvider router={router} />;
}

