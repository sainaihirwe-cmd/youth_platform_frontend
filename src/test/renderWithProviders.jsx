import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AppProviders } from '../App';

/** Renders UI inside the real providers and a memory router. */
export function renderWithProviders(ui, { route = '/', path = '*', extraRoutes = null } = {}) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <AppProviders>
        <Routes>
          <Route path={path} element={ui} />
          {extraRoutes}
        </Routes>
      </AppProviders>
    </MemoryRouter>
  );
}
