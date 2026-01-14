import { describe, it, expect } from 'vitest';
import { FormBuilder } from '../fieldwise';
import { zod } from '../zod';
import { z } from 'zod';

describe('zod validation plugin', () => {
  it('should validate successfully with valid data', async () => {
    const schema = z.object({
      email: z.email('Invalid email')
    });

    const builder = new FormBuilder({ email: 'valid@example.com' });
    zod(schema)(builder['form']);

    let validatedErrors: any = null;
    builder['form'].once('validated', (_values: any, errors: any) => {
      validatedErrors = errors;
    });

    builder['form'].emit('validate');
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(validatedErrors).toBeNull();
  });

  it('should return errors for invalid data', async () => {
    const schema = z.object({
      email: z.email('Invalid email')
    });

    const builder = new FormBuilder({ email: 'not-an-email' });
    zod(schema)(builder['form']);

    let validatedErrors: any = null;
    builder['form'].once('validated', (_values: any, errors: any) => {
      validatedErrors = errors;
    });

    builder['form'].emit('validate');
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(validatedErrors).toEqual({ email: 'Invalid email' });
  });

  it('should handle multiple field errors', async () => {
    const schema = z.object({
      email: z.email('Invalid email'),
      name: z.string().min(1, 'Name required'),
      age: z.number().min(18, 'Must be 18+')
    });

    const builder = new FormBuilder({ email: 'bad', name: '', age: 15 });
    zod(schema)(builder['form']);

    let validatedErrors: any = null;
    builder['form'].once('validated', (_values: any, errors: any) => {
      validatedErrors = errors;
    });

    builder['form'].emit('validate');
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(validatedErrors).toEqual({
      email: 'Invalid email',
      name: 'Name required',
      age: 'Must be 18+'
    });
  });

  it('should only report first error per field', async () => {
    const schema = z.object({
      password: z
        .string()
        .min(8, 'Too short')
        .max(100, 'Too long')
        .regex(/[A-Z]/, 'Needs uppercase')
    });

    const builder = new FormBuilder({ password: 'short' });
    zod(schema)(builder['form']);

    let validatedErrors: any = null;
    builder['form'].once('validated', (_values: any, errors: any) => {
      validatedErrors = errors;
    });

    builder['form'].emit('validate');
    await new Promise((resolve) => setTimeout(resolve, 10));

    // Should only have the first error (Too short)
    expect(validatedErrors).toEqual({
      password: 'Too short'
    });
  });

  it('should handle nested path issues from refinements', async () => {
    const schema = z
      .object({
        password: z.string(),
        confirmPassword: z.string()
      })
      .refine((data) => data.password === data.confirmPassword, {
        message: 'Passwords must match',
        path: ['confirmPassword']
      });

    const builder = new FormBuilder({
      password: 'password123',
      confirmPassword: 'different'
    });
    zod(schema)(builder['form']);

    let validatedErrors: any = null;
    builder['form'].once('validated', (_values: any, errors: any) => {
      validatedErrors = errors;
    });

    builder['form'].emit('validate');
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(validatedErrors).toEqual({
      confirmPassword: 'Passwords must match'
    });
  });

  it('should handle array validation errors', async () => {
    const schema = z.object({
      items: z.array(z.string().min(1, 'Item required'))
    });

    const builder = new FormBuilder({ items: ['valid', ''] });
    zod(schema)(builder['form']);

    let validatedErrors: any = null;
    builder['form'].once('validated', (_values: any, errors: any) => {
      validatedErrors = errors;
    });

    builder['form'].emit('validate');
    await new Promise((resolve) => setTimeout(resolve, 10));

    // Array validation errors are reported at the field level
    expect(validatedErrors).toEqual({ items: 'Item required' });
  });
});
