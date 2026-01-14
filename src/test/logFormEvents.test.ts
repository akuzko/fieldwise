import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { FormBuilder } from '../fieldwise';
import { Form } from '../Form';

describe('logFormEvents', () => {
  let consoleLogSpy: any;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    Form.debugMode = false;
  });

  it('should log all events when debugMode is true', () => {
    Form.debugMode = true;

    const builder = new FormBuilder({ name: '', email: '' });
    const form = (builder as any).form;

    form.emit('change', 'name', 'Test');
    form.emit('changeMany', { email: 'test@example.com' });
    form.emit('reset');

    expect(consoleLogSpy).toHaveBeenCalledWith(
      '[Form Event] change:',
      'name',
      'Test'
    );
    expect(consoleLogSpy).toHaveBeenCalledWith('[Form Event] changeMany:', {
      email: 'test@example.com'
    });
    expect(consoleLogSpy).toHaveBeenCalledWith(
      '[Form Event] reset:',
      '[no payload]'
    );
  });

  it('should log only specified events when debugMode.only is set', () => {
    Form.debugMode = { only: ['validate', 'validated'] };

    const builder = new FormBuilder({ name: '' });
    const form = (builder as any).form;

    form.emit('change', 'name', 'Test');
    form.emit('validate');

    // Should not log 'change' event
    expect(consoleLogSpy).not.toHaveBeenCalledWith(
      '[Form Event] change:',
      'name',
      'Test'
    );

    // Should log 'validate' event
    expect(consoleLogSpy).toHaveBeenCalledWith(
      '[Form Event] validate:',
      '[no payload]'
    );
  });

  it('should not log events when debugMode is false', () => {
    Form.debugMode = false;

    const builder = new FormBuilder({ name: '' });
    const form = (builder as any).form;

    form.emit('change', 'name', 'Test');

    expect(consoleLogSpy).not.toHaveBeenCalled();
  });

  it('should log events with no payload correctly', () => {
    Form.debugMode = true;

    const builder = new FormBuilder({ name: '' });
    const form = (builder as any).form;

    form.emit('validate');

    expect(consoleLogSpy).toHaveBeenCalledWith(
      '[Form Event] validate:',
      '[no payload]'
    );
  });

  it('should log validated event with values and errors', async () => {
    Form.debugMode = true;

    const builder = new FormBuilder({ name: '' });
    const form = (builder as any).form;

    form.registerValidator((values: any) => {
      return values.name ? null : { name: 'Required' };
    });

    form.emit('validate');

    await new Promise((resolve) => setTimeout(resolve, 10));

    // Find the validated event log call
    const validatedCall = consoleLogSpy.mock.calls.find(
      (call: any) => call[0] === '[Form Event] validated:'
    );

    expect(validatedCall).toBeDefined();
    expect(validatedCall[1]).toEqual({ name: '' }); // values
    expect(validatedCall[2]).toEqual({ name: 'Required' }); // errors
  });

  it('should log errors event', () => {
    Form.debugMode = true;

    const builder = new FormBuilder({ name: '' });
    const form = (builder as any).form;

    form.emit('errors', { name: 'Custom error' });

    expect(consoleLogSpy).toHaveBeenCalledWith('[Form Event] errors:', {
      name: 'Custom error'
    });
  });
});
