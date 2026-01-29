import { describe, expect, it } from 'vitest';
import {
  estimateDrivingTime,
  estimateWalkingTime,
  formatTravelTime,
  generateAppleMapsURL,
  generateGoogleMapsURL,
  generateNavigationURL,
} from './navigation';

describe('generateGoogleMapsURL', () => {
  it('徒歩モードでURLを生成', () => {
    const destination = { latitude: 34.173, longitude: 134.609 };
    const url = generateGoogleMapsURL(destination, 'walking');

    expect(url).toContain('https://www.google.com/maps/dir/?api=1');
    expect(url).toContain('destination=34.173%2C134.609');
    expect(url).toContain('travelmode=walking');
  });

  it('車モードでURLを生成', () => {
    const destination = { latitude: 34.173, longitude: 134.609 };
    const url = generateGoogleMapsURL(destination, 'driving');

    expect(url).toContain('travelmode=driving');
  });

  it('デフォルトは徒歩モード', () => {
    const destination = { latitude: 34.173, longitude: 134.609 };
    const url = generateGoogleMapsURL(destination);

    expect(url).toContain('travelmode=walking');
  });

  it('負の座標も正しく処理', () => {
    const destination = { latitude: -33.8688, longitude: 151.2093 }; // シドニー
    const url = generateGoogleMapsURL(destination);

    expect(url).toContain('destination=-33.8688%2C151.2093');
  });
});

describe('generateAppleMapsURL', () => {
  it('Apple Maps URLを生成', () => {
    const destination = { latitude: 34.173, longitude: 134.609 };
    const url = generateAppleMapsURL(destination);

    expect(url).toBe('maps://?daddr=34.173,134.609');
  });

  it('負の座標も正しく処理', () => {
    const destination = { latitude: -33.8688, longitude: 151.2093 };
    const url = generateAppleMapsURL(destination);

    expect(url).toBe('maps://?daddr=-33.8688,151.2093');
  });
});

describe('generateNavigationURL', () => {
  it('Google指定時はGoogle Maps URLを返す', () => {
    const destination = { latitude: 34.173, longitude: 134.609 };
    const url = generateNavigationURL(destination, 'google');

    expect(url).toContain('google.com/maps');
  });

  it('Apple指定時はApple Maps URLを返す', () => {
    const destination = { latitude: 34.173, longitude: 134.609 };
    const url = generateNavigationURL(destination, 'apple');

    expect(url).toContain('maps://');
  });

  it('移動手段を指定できる（Google Maps）', () => {
    const destination = { latitude: 34.173, longitude: 134.609 };
    const url = generateNavigationURL(destination, 'google', 'driving');

    expect(url).toContain('travelmode=driving');
  });
});

describe('estimateWalkingTime', () => {
  it('1kmの徒歩時間は15分', () => {
    const time = estimateWalkingTime(1000); // 1000m
    expect(time).toBe(15);
  });

  it('4kmの徒歩時間は60分（1時間）', () => {
    const time = estimateWalkingTime(4000); // 4000m
    expect(time).toBe(60);
  });

  it('500mの徒歩時間は約8分', () => {
    const time = estimateWalkingTime(500);
    expect(time).toBe(8);
  });

  it('0mの場合は0分', () => {
    const time = estimateWalkingTime(0);
    expect(time).toBe(0);
  });

  it('小数点以下は四捨五入', () => {
    const time = estimateWalkingTime(100); // 100m = 1.5分
    expect(time).toBe(2);
  });
});

describe('estimateDrivingTime', () => {
  it('30kmの車時間は60分（1時間）', () => {
    const time = estimateDrivingTime(30000); // 30km
    expect(time).toBe(60);
  });

  it('15kmの車時間は30分', () => {
    const time = estimateDrivingTime(15000); // 15km
    expect(time).toBe(30);
  });

  it('0mの場合は0分', () => {
    const time = estimateDrivingTime(0);
    expect(time).toBe(0);
  });

  it('1kmの車時間は2分', () => {
    const time = estimateDrivingTime(1000); // 1km
    expect(time).toBe(2);
  });
});

describe('formatTravelTime', () => {
  it('60分未満は「X分」形式', () => {
    expect(formatTravelTime(15)).toBe('15分');
    expect(formatTravelTime(30)).toBe('30分');
    expect(formatTravelTime(59)).toBe('59分');
  });

  it('ちょうど60分は「1時間」', () => {
    expect(formatTravelTime(60)).toBe('1時間');
  });

  it('60分以上は「X時間Y分」形式', () => {
    expect(formatTravelTime(90)).toBe('1時間30分');
    expect(formatTravelTime(125)).toBe('2時間5分');
  });

  it('時間がぴったりの場合は分を省略', () => {
    expect(formatTravelTime(120)).toBe('2時間');
    expect(formatTravelTime(180)).toBe('3時間');
  });

  it('0分の場合', () => {
    expect(formatTravelTime(0)).toBe('0分');
  });

  it('1分の場合', () => {
    expect(formatTravelTime(1)).toBe('1分');
  });
});
