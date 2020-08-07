import { getTranslations } from './index.js';

test('Get translation', () => {
  expect(getTranslations('en').welcomeHeader).toBe('Welcome to Darkwire v2.0');
  expect(getTranslations().welcomeHeader).toBe('Welcome to Darkwire v2.0');
  expect(getTranslations('fr').welcomeHeader).toBe('Bienvenue sur Darkwire v2.0');
  expect(getTranslations('zh-CN').welcomeHeader).toBe('欢迎来到Darkwire v2.0');
  expect(getTranslations('en-US').welcomeHeader).toBe('Welcome to Darkwire v2.0');
  expect(getTranslations('ru-CH').welcomeHeader).toBe('Добро пожаловать на Darkwire v2.0');
});
