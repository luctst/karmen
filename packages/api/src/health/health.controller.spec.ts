import { HealthController } from './health.controller';

describe('HealthController', () => {
  const controller = new HealthController();

  it('returns { status: "ok" }', () => {
    expect(controller.getHealth()).toEqual({ status: 'ok' });
  });
});
