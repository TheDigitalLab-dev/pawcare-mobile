import { nextThemePreference } from '@/components/domain/ThemeToggle';

describe('nextThemePreference', () => {
  it('cicla system → light → dark → system', () => {
    expect(nextThemePreference('system')).toBe('light');
    expect(nextThemePreference('light')).toBe('dark');
    expect(nextThemePreference('dark')).toBe('system');
  });
});
