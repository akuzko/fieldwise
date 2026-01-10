import { z } from 'zod';
import type { Form, Values, Errors } from './Form';

export function validateZodSchema<T extends Values>(schema: z.ZodSchema<T>) {
  return function (form: Form<T>): void {
    form.on('validate', () => {
      const values = form.getValues();
      const result = schema.safeParse(values);

      if (result.success) {
        // Validation successful - emit with null errors
        form.emit('validated', {
          values,
          errors: null
        });
      } else {
        // Validation failed - convert Zod errors to our format
        const errors: Errors<T> = {};

        result.error.issues.forEach((issue) => {
          const path = issue.path[0];
          if (path && typeof path === 'string' && !errors[path as keyof T]) {
            errors[path as keyof T] = issue.message;
          }
        });

        form.emit('validated', {
          values,
          errors
        });
      }
    });
  };
}
