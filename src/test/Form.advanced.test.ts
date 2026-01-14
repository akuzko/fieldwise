import { describe, it, expect, vi } from 'vitest';
import { FormBuilder } from '../fieldwise';

describe('Form - Advanced Features', () => {
  describe('event unsubscribe', () => {
    it('should stop receiving events after unsubscribing', () => {
      const builder = new FormBuilder({ name: '' });
      const form = (builder as any).form;
      const handler = vi.fn();

      const unsubscribe = form.on('change', handler);
      form.emit('change', 'name', 'First');
      expect(handler).toHaveBeenCalledTimes(1);

      unsubscribe();
      form.emit('change', 'name', 'Second');
      expect(handler).toHaveBeenCalledTimes(1); // Still 1, not called again
    });

    it('should handle multiple subscribers and unsubscribe one', () => {
      const builder = new FormBuilder({ name: '' });
      const form = (builder as any).form;
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      const unsubscribe1 = form.on('change', handler1);
      form.on('change', handler2);

      form.emit('change', 'name', 'Test');
      expect(handler1).toHaveBeenCalledTimes(1);
      expect(handler2).toHaveBeenCalledTimes(1);

      unsubscribe1();
      form.emit('change', 'name', 'Test2');
      expect(handler1).toHaveBeenCalledTimes(1); // Still 1
      expect(handler2).toHaveBeenCalledTimes(2); // Called again
    });
  });

  describe('event queueing', () => {
    it('should queue events when no handlers exist', () => {
      const builder = new FormBuilder({ name: '' });
      const form = (builder as any).form;

      // Emit validationStart before handler is registered (no default handler for this)
      form.emit('validationStart');

      const handler = vi.fn();
      form.on('validationStart', handler);

      // Handler should receive queued event
      expect(handler).toHaveBeenCalled();
    });

    it('should process multiple queued events in FIFO order', () => {
      const builder = new FormBuilder({ name: '' });
      const form = (builder as any).form;

      // Use validationStart which has no default handler
      form.emit('validationStart');
      form.emit('validationStart');
      form.emit('validationStart');

      const handler = vi.fn();
      form.on('validationStart', handler);

      expect(handler).toHaveBeenCalledTimes(3);
    });

    it('should process queued events with once()', () => {
      const builder = new FormBuilder({ name: '' });
      const form = (builder as any).form;

      form.emit('validationStart');
      form.emit('validationStart');

      const handler = vi.fn();
      form.once('validationStart', handler);

      // Should only process first queued event
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should not queue events when handlers exist', () => {
      const builder = new FormBuilder({ name: '' });
      const form = (builder as any).form;
      const handler = vi.fn();

      form.on('change', handler);
      form.emit('change', 'name', 'Value');

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith('name', 'Value');
    });
  });

  describe('emitLater', () => {
    it('should emit event asynchronously', async () => {
      const builder = new FormBuilder({ name: '' });
      const form = (builder as any).form;
      const handler = vi.fn();

      form.on('change', handler);

      form.emitLater('change', 'name', 'Async Value');

      // Should not be called immediately
      expect(handler).not.toHaveBeenCalled();

      // Wait for next tick
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(handler).toHaveBeenCalledWith('name', 'Async Value');
    });
  });

  describe('multiple validators', () => {
    it('should run all sync validators', async () => {
      const builder = new FormBuilder({ name: '', email: '' });
      const form = (builder as any).form;

      // Validator 1: name required
      form.registerValidator((values: any) => {
        return values.name ? null : { name: 'Name required' };
      });

      // Validator 2: email required
      form.registerValidator((values: any) => {
        return values.email ? null : { email: 'Email required' };
      });

      let validatedErrors: any = null;
      form.once('validated', (_values: any, errors: any) => {
        validatedErrors = errors;
      });

      form.emit('validate');

      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(validatedErrors).toEqual({
        name: 'Name required',
        email: 'Email required'
      });
    });

    it('should run async validators', async () => {
      const builder = new FormBuilder({ username: '' });
      const form = (builder as any).form;

      // Async validator
      form.registerValidator(async (values: any) => {
        await new Promise((resolve) => setTimeout(resolve, 5));
        return values.username === 'taken'
          ? { username: 'Username taken' }
          : null;
      });

      let validatedErrors: any = null;
      form.once('validated', (_values: any, errors: any) => {
        validatedErrors = errors;
      });

      form.setValue('username', 'taken');
      form.emit('validate');

      await new Promise((resolve) => setTimeout(resolve, 20));

      expect(validatedErrors).toEqual({ username: 'Username taken' });
    });

    it('should run error-dependent validators with sync errors', async () => {
      const builder = new FormBuilder({ email: '', username: '' });
      const form = (builder as any).form;

      // Pure validator (arity < 2)
      form.registerValidator((values: any) => {
        return values.email ? null : { email: 'Email required' };
      });

      // Error-dependent validator (arity >= 2)
      const mockAsyncValidator = vi.fn((values: any, syncErrors: any) => {
        // Skip expensive check if sync errors exist
        if (syncErrors && Object.keys(syncErrors).length > 0) {
          return null;
        }
        // Expensive async validation
        return { username: 'Username taken' };
      });

      form.registerValidator(mockAsyncValidator);

      let validatedErrors: any = null;
      form.once('validated', (_values: any, errors: any) => {
        validatedErrors = errors;
      });

      form.emit('validate');

      await new Promise((resolve) => setTimeout(resolve, 10));

      // Should receive sync errors as second argument
      expect(mockAsyncValidator).toHaveBeenCalledWith(
        { email: '', username: '' },
        { email: 'Email required' }
      );

      // Should only have email error (async validator returned null)
      expect(validatedErrors).toEqual({ email: 'Email required' });
    });

    it('should run error-dependent validator when no sync errors', async () => {
      const builder = new FormBuilder({ email: 'valid@example.com' });
      const form = (builder as any).form;

      // Pure validator that passes
      form.registerValidator((values: any) => {
        return values.email ? null : { email: 'Required' };
      });

      // Error-dependent async validator
      form.registerValidator(async (values: any, syncErrors: any) => {
        if (syncErrors && Object.keys(syncErrors).length > 0) {
          return null;
        }
        // Simulate async check
        await new Promise((resolve) => setTimeout(resolve, 5));
        return { email: 'Email already exists' };
      });

      let validatedErrors: any = null;
      form.once('validated', (_values: any, errors: any) => {
        validatedErrors = errors;
      });

      form.emit('validate');

      await new Promise((resolve) => setTimeout(resolve, 20));

      expect(validatedErrors).toEqual({ email: 'Email already exists' });
    });

    it('should merge errors from multiple async validators', async () => {
      const builder = new FormBuilder({ name: '', email: '' });
      const form = (builder as any).form;

      form.registerValidator(async (values: any) => {
        await new Promise((resolve) => setTimeout(resolve, 5));
        return values.name ? null : { name: 'Name required' };
      });

      form.registerValidator(async (values: any) => {
        await new Promise((resolve) => setTimeout(resolve, 5));
        return values.email ? null : { email: 'Email required' };
      });

      let validatedErrors: any = null;
      form.once('validated', (_values: any, errors: any) => {
        validatedErrors = errors;
      });

      form.emit('validate');

      await new Promise((resolve) => setTimeout(resolve, 20));

      expect(validatedErrors).toEqual({
        name: 'Name required',
        email: 'Email required'
      });
    });

    it('should handle sync error-dependent validators', async () => {
      const builder = new FormBuilder({ email: '' });
      const form = (builder as any).form;

      // Pure sync validator
      form.registerValidator((values: any) => {
        return values.email ? null : { email: 'Email required' };
      });

      // Sync error-dependent validator (arity >= 2, not async)
      form.registerValidator((values: any, syncErrors: any) => {
        if (syncErrors && Object.keys(syncErrors).length > 0) {
          return { email: 'Additional sync error' };
        }
        return null;
      });

      let validatedErrors: any = null;
      form.once('validated', (_values: any, errors: any) => {
        validatedErrors = errors;
      });

      form.emit('validate');

      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(validatedErrors).toEqual({
        email: 'Additional sync error'
      });
    });
  });

  describe('validationStart event', () => {
    it('should emit validationStart when validation begins', () => {
      const builder = new FormBuilder({ name: '' });
      const form = (builder as any).form;
      const handler = vi.fn();

      form.on('validationStart', handler);
      form.emit('validate');

      expect(handler).toHaveBeenCalled();
    });

    it('should set isValidating to true during validation', async () => {
      const builder = new FormBuilder({ name: '' });
      const form = (builder as any).form;

      form.registerValidator(async (values: any) => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        return null;
      });

      expect(form.isValidating).toBe(false);

      form.emit('validate');

      // Check immediately after emit - should be true
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(form.isValidating).toBe(true);

      // Wait for validation to complete
      await new Promise((resolve) => setTimeout(resolve, 20));
      expect(form.isValidating).toBe(false);
    });
  });

  describe('errors event', () => {
    it('should set errors via errors event', () => {
      const builder = new FormBuilder({ name: '', email: '' });
      const form = (builder as any).form;

      form.emit('errors', { name: 'Invalid name', email: 'Invalid email' });

      expect(form.get('name').error).toBe('Invalid name');
      expect(form.get('email').error).toBe('Invalid email');
    });

    it('should clear errors by passing empty object', () => {
      const builder = new FormBuilder({ name: '' });
      const form = (builder as any).form;

      form.emit('errors', { name: 'Error' });
      expect(form.get('name').error).toBe('Error');

      form.emit('errors', {});
      expect(form.get('name').error).toBe(null);
    });
  });

  describe('field notification', () => {
    it('should not notify subscriber if field has no subscribers', () => {
      const builder = new FormBuilder({ name: '', email: '' });
      const form = (builder as any).form;

      // This should not throw even though name has no subscribers
      expect(() => {
        form.setValue('name', 'Test');
      }).not.toThrow();
    });
  });
});
