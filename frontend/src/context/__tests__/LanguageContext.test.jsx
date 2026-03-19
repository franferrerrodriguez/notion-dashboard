import { render, screen, fireEvent, renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LanguageProvider, useLanguage } from '../LanguageContext';

describe('LanguageContext', () => {
  it('provides default language (es)', () => {
    const wrapper = ({ children }) => <LanguageProvider>{children}</LanguageProvider>;
    const { result } = renderHook(() => useLanguage(), { wrapper });

    expect(result.current.lang).toBe('es');
  });

  it('changes language and updates translations', () => {
    const TestComponent = () => {
      const { lang, setLang, t } = useLanguage();
      return (
        <div>
          <span data-testid="lang">{lang}</span>
          <span data-testid="greet">{t('welcome_back')}</span>
          <button onClick={() => setLang('en')}>Switch to EN</button>
        </div>
      );
    };

    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );

    expect(screen.getByTestId('lang')).toHaveTextContent('es');

    fireEvent.click(screen.getByText('Switch to EN'));

    expect(screen.getByTestId('lang')).toHaveTextContent('en');
  });

  it('throws error if used outside Provider', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      renderHook(() => useLanguage());
    }).toThrow('useLanguage must be used within a LanguageProvider');

    consoleSpy.mockRestore();
  });
});
