import React from 'react';
import renderer, {act} from 'react-test-renderer';
import {describe, expect, it, jest, beforeEach} from '@jest/globals';
import Barmejli from '../src/screens/main/experience/barmejli';
import request from '../src/services/request';

jest.mock('../src/services/request', () => ({__esModule: true, default: {post: jest.fn()}}));
jest.mock('react-native-svg', () => ({__esModule: true, default: 'Svg', Path: 'Path'}));
const post = request.post as jest.MockedFunction<typeof request.post>;
function text(node: any): string {
  if (typeof node === 'string') return node;
  if (Array.isArray(node)) return node.map(text).join(' ');
  return node?.children ? text(node.children) : '';
}
async function generate() {
  let tree!: renderer.ReactTestRenderer;
  await act(async () => { tree = renderer.create(<Barmejli navigation={{goBack: jest.fn()}} route={{params: {prompt: 'Sortie à Tunis 30 DT'}}} />); });
  await act(async () => { await tree.root.findAll(node => node.props.testID === 'barmejli-generate' && typeof node.props.onPress === 'function')[0]!.props.onPress(); });
  return tree;
}
describe('Barmejli programme responses', () => {
  beforeEach(() => { post.mockReset(); });
  it('renders the real programme and the backend interpretation', async () => {
    post.mockResolvedValue({data: {
      id: 1, status: 'DRAFT', request: {city: 'Tunis', budget: 30, mood: 'calme', groupType: 'amis'},
      weather: {summary: 'Ciel dégagé', temperatureC: 25, precipitationProbability: 0},
      totals: {cost: 10, durationMin: 60, distanceKm: 0},
      explanation: {summary: 'Une étape pour 10 DT.', assumptions: ['Horaire estimé.'], travelNote: 'Trajets estimés.'},
      steps: [{id: 1, position: 0, placeName: 'Café réel', title: 'Pause café', startsAt: '2026-10-03T18:00:00Z', endsAt: '2026-10-03T19:00:00Z', estimatedCost: 10, travelMinutes: 0, travelDistanceKm: 0, travelMode: 'walk', reason: '10 DT estimés.', menuSelection: {items: [{name: 'Café crème', priceMillimes: 4500, quantity: 2}], totalMillimes: 9000, validatedAt: '2026-10-01T12:00:00Z'}}],
    }} as any);
    const tree = await generate();
    expect(post).toHaveBeenCalledWith('v1/barmejli/generate', {prompt: 'Sortie à Tunis 30 DT'});
    expect(text(tree.toJSON())).toContain('Café réel');
    expect(text(tree.toJSON())).toContain('Horaire estimé.');
    expect(text(tree.toJSON())).toContain('10 DT estimés.');
    const displayed = text(tree.toJSON()).replace(/\s+/g, ' ');
    expect(displayed).toContain('2 × Café crème · 9.000 DT');
    expect(displayed).toContain('Total menu : 9.000 DT');
    await act(async () => tree.unmount());
  });
  it('shows a clarification returned by the backend instead of a fictitious programme', async () => {
    post.mockRejectedValue({response: {data: {message: 'Précisez un budget total.'}}});
    const tree = await generate();
    expect(text(tree.toJSON())).toContain('Précisez un budget total.');
    expect(text(tree.toJSON())).not.toContain('VOTRE ITINÉRAIRE');
    await act(async () => tree.unmount());
  });
});
