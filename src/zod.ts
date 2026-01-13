import { z } from 'zod';
import type { Form, Values, Errors } from './Form';

export function zod<T extends Values>(schema: z.ZodSchema<T>) {
  return function (form: Form<T>): void {
    form.registerValidator((values) => {
      const result = schema.safeParse(values);

      if (result.success) {
        return null;
      }

      // Validation failed - convert Zod errors to Form format
      const errors: Errors<T> = {};

      result.error.issues.forEach((issue) => {
        const path = issue.path[0];
        if (path && typeof path === 'string' && !errors[path as keyof T]) {
          errors[path as keyof T] = issue.message;
        }
      });

      return errors;
    });
  };
}
