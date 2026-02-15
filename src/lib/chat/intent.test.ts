import { describe, expect, it } from 'vitest';
import { classifyIntent } from './intent';

describe('classifyIntent', () => {
  it('空文字は unknown', () => {
    expect(classifyIntent('')).toBe('unknown');
    expect(classifyIntent('   ')).toBe('unknown');
  });

  it('災害種別で disaster', () => {
    expect(classifyIntent('津波対応の避難所は？')).toBe('disaster');
    expect(classifyIntent('洪水で避難できるところ')).toBe('disaster');
    expect(classifyIntent('土砂災害')).toBe('disaster');
    expect(classifyIntent('地震対応')).toBe('disaster');
    expect(classifyIntent('火災')).toBe('disaster');
  });

  it('最寄りで nearest', () => {
    expect(classifyIntent('一番近い避難所は？')).toBe('nearest');
    expect(classifyIntent('近くの避難所を教えて')).toBe('nearest');
    expect(classifyIntent('最寄りの避難所')).toBe('nearest');
  });

  it('収容人数で capacity', () => {
    expect(classifyIntent('収容人数が多い避難所')).toBe('capacity');
    expect(classifyIntent('定員がわかる避難所')).toBe('capacity');
    expect(classifyIntent('何人入れますか')).toBe('capacity');
  });

  it('種別で shelter_type', () => {
    expect(classifyIntent('指定避難所だけ')).toBe('shelter_type');
    expect(classifyIntent('緊急避難場所は？')).toBe('shelter_type');
  });

  it('件数で count', () => {
    expect(classifyIntent('今何件ある？')).toBe('count');
    expect(classifyIntent('一覧を見たい')).toBe('count');
    expect(classifyIntent('いくつある')).toBe('count');
  });

  it('2文字以上の一般クエリは place_or_name', () => {
    expect(classifyIntent('鳴門')).toBe('place_or_name');
    expect(classifyIntent('松茂町の避難所')).toBe('place_or_name');
  });

  it('1文字は unknown', () => {
    expect(classifyIntent('あ')).toBe('unknown');
  });
});
