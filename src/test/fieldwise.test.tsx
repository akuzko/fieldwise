import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { fieldwise } from '../fieldwise';
import { z } from 'zod';
import { zod } from '../zod';

describe('fieldwise', () => {
  describe('useForm hook', () => {
    it('should return initial values', () => {
      const { useForm } = fieldwise({ name: '', email: '' }).hooks();
      const { result } = renderHook(() => useForm());

      expect(result.current.fields.name.value).toBe('');
      expect(result.current.fields.email.value).toBe('');
    });

    it('should update field value', () => {
      const { useForm } = fieldwise({ name: '' }).hooks();
      const { result } = renderHook(() => useForm());

      act(() => {
        result.current.emit('change', 'name', 'John');
      });

      expect(result.current.fields.name.value).toBe('John');
    });

    it('should mark field as touched after change', async () => {
      const { useForm } = fieldwise({ name: '' }).hooks();
      const { result } = renderHook(() => useForm());

      expect(result.current.isTouched).toBe(false);

      await act(async () => {
        result.current.emit('change', 'name', 'John');
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(result.current.isTouched).toBe(true);
    });

    it('should reset form', async () => {
      const { useForm } = fieldwise({ name: 'John' }).hooks();
      const { result } = renderHook(() => useForm());

      await act(async () => {
        result.current.emit('change', 'name', 'Jane');
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(result.current.fields.name.value).toBe('Jane');

      await act(async () => {
        result.current.emit('reset');
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(result.current.fields.name.value).toBe('John');
    });
  });

  describe('useSlice hook', () => {
    it('should only include specified fields', () => {
      const { useSlice } = fieldwise({ name: '', email: '', age: 0 }).hooks();
      const { result } = renderHook(() => useSlice(['name', 'email']));

      expect(result.current.fields).toHaveProperty('name');
      expect(result.current.fields).toHaveProperty('email');
      expect(result.current.fields).not.toHaveProperty('age');
    });

    it('should update when subscribed field changes', () => {
      const { useSlice } = fieldwise({ name: '', email: '' }).hooks();
      const { result } = renderHook(() => useSlice(['name']));

      act(() => {
        result.current.emit('change', 'name', 'John');
      });

      expect(result.current.fields.name.value).toBe('John');
    });
  });

  describe('input helper (i)', () => {
    it('should generate input props', () => {
      const { useForm } = fieldwise({ email: '' }).hooks();
      const { result } = renderHook(() => useForm());
      const props = result.current.i('email');

      expect(props.name).toBe('email');
      expect(props.value).toBe('');
      expect(props.error).toBe(null);
      expect(typeof props.onChange).toBe('function');
    });

    it('should update value through onChange', () => {
      const { useForm } = fieldwise({ email: '' }).hooks();
      const { result } = renderHook(() => useForm());

      act(() => {
        result.current.i('email').onChange('test@example.com');
      });

      expect(result.current.fields.email.value).toBe('test@example.com');
    });
  });

  describe('validation', () => {
    it('should validate with Zod schema', async () => {
      const schema = z.object({
        email: z.string().email('Invalid email')
      });
      const { useForm } = fieldwise({ email: '' }).use(zod(schema)).hooks();
      const { result } = renderHook(() => useForm());

      await act(async () => {
        let errors = null;
        result.current.once('validated', ({ errors: validationErrors }) => {
          errors = validationErrors;
          if (validationErrors) {
            result.current.emit('errors', validationErrors);
          }
        });

        result.current.emit('validate');
        await new Promise((resolve) => setTimeout(resolve, 10));
      });

      expect(result.current.fields.email.error).toBe('Invalid email');
    });

    it('should clear errors on valid input', async () => {
      const schema = z.object({
        email: z.string().email('Invalid email')
      });
      const { useForm } = fieldwise({ email: '' }).use(zod(schema)).hooks();
      const { result } = renderHook(() => useForm());

      // First, validate with invalid email
      await act(async () => {
        result.current.once('validated', ({ errors: validationErrors }) => {
          if (validationErrors) {
            result.current.emit('errors', validationErrors);
          }
        });

        result.current.emit('validate');
        await new Promise((resolve) => setTimeout(resolve, 10));
      });

      expect(result.current.fields.email.error).toBe('Invalid email');

      // Then, update to valid email and validate again
      await act(async () => {
        result.current.emit('change', 'email', 'valid@example.com');

        result.current.once('validated', ({ errors: validationErrors }) => {
          if (validationErrors) {
            result.current.emit('errors', validationErrors);
          }
        });

        result.current.emit('validate');
        await new Promise((resolve) => setTimeout(resolve, 10));
      });

      expect(result.current.fields.email.error).toBe(null);
    });
  });

  describe('touch events', () => {
    it('should mark field as touched', async () => {
      const { useForm } = fieldwise({ name: 'John' }).hooks();

      const { result } = renderHook(() => useForm());

      expect(result.current.fields.name.isTouched).toBe(false);

      await act(async () => {
        result.current.emit('touch', 'name');
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(result.current.fields.name.isTouched).toBe(true);
      expect(result.current.fields.name.value).toBe('John');
    });

    it('should mark multiple fields as touched', async () => {
      const { useForm } = fieldwise({ name: '', email: '', age: 0 }).hooks();

      const { result } = renderHook(() => useForm());

      await act(async () => {
        result.current.emit('touchSome', ['name', 'email']);
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(result.current.fields.name.isTouched).toBe(true);
      expect(result.current.fields.email.isTouched).toBe(true);
      expect(result.current.fields.age.isTouched).toBe(false);
    });
  });

  describe('emit.later', () => {
    it('should defer event to microtask', async () => {
      const { useForm } = fieldwise({ name: '' }).hooks();
      const { result } = renderHook(() => useForm());
      let validationRan = false;

      result.current.once('validate', () => {
        validationRan = true;
      });

      result.current.emit.later('validate');

      expect(validationRan).toBe(false);

      // Wait for setTimeout to execute
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(validationRan).toBe(true);
    });
  });
});
