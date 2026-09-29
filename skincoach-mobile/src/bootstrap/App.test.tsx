import { render, screen } from '@testing-library/react-native';

import App from './App';

describe('App', () => {
  it('renders without crashing, landing on the Splash screen', async () => {
    await render(<App />);
    expect(screen.getByText('AI Skin Coach')).toBeOnTheScreen();
    expect(screen.getByText('Your ritual, refined by science.')).toBeOnTheScreen();
  });
});
