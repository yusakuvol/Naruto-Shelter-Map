import { describe, expect, it } from 'vitest';
import { cn } from './utils';

describe('cn', () => {
  it('単一のクラス名を返す', () => {
    expect(cn('foo')).toBe('foo');
  });

  it('複数のクラス名を結合', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('条件付きクラス名（truthy）', () => {
    expect(cn('foo', true && 'bar')).toBe('foo bar');
  });

  it('条件付きクラス名（falsy）', () => {
    expect(cn('foo', false && 'bar')).toBe('foo');
  });

  it('undefined と null を無視', () => {
    expect(cn('foo', undefined, null, 'bar')).toBe('foo bar');
  });

  it('オブジェクト形式の条件', () => {
    expect(cn({ foo: true, bar: false, baz: true })).toBe('foo baz');
  });

  it('配列形式のクラス名', () => {
    expect(cn(['foo', 'bar'])).toBe('foo bar');
  });

  it('Tailwind クラスの衝突を解決', () => {
    // tailwind-merge の機能テスト
    expect(cn('px-2', 'px-4')).toBe('px-4');
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
    expect(cn('bg-white', 'bg-black')).toBe('bg-black');
  });

  it('Tailwind の複雑な衝突解決', () => {
    expect(cn('p-4', 'px-2')).toBe('p-4 px-2');
    expect(cn('text-sm', 'text-lg')).toBe('text-lg');
    expect(cn('font-bold', 'font-normal')).toBe('font-normal');
  });

  it('空の入力', () => {
    expect(cn()).toBe('');
    expect(cn('')).toBe('');
    expect(cn('', '', '')).toBe('');
  });

  it('複合的なケース', () => {
    const isActive = true;
    const isDisabled = false;
    const result = cn(
      'base-class',
      isActive && 'active',
      isDisabled && 'disabled',
      { hover: true, focus: false }
    );
    expect(result).toBe('base-class active hover');
  });
});
