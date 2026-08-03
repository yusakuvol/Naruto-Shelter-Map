// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { createMapStyle } from './mapStyle';

describe('createMapStyle', () => {
  it('防災用途に必要なレイヤーだけを含む', () => {
    const style = createMapStyle();
    const layerIds = style.layers.map((layer) => layer.id);

    expect(layerIds).toHaveLength(48);
    expect(layerIds).toEqual(
      expect.arrayContaining([
        'water',
        'buildings',
        'roads_minor',
        'roads_major',
        'roads_highway',
        'roads_rail',
        'roads_labels_major',
        'places_locality',
      ])
    );
    expect(layerIds).not.toEqual(
      expect.arrayContaining(['address_label', 'pois', 'landuse_zoo'])
    );
  });
});
