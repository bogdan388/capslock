export const validFormData = {
  zipCode: '48226',
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '2345678901',
};

export const invalidZipCodes = {
  tooShort: '1234',
  tooLong: '123456',
  withLetters: '1234a',
  empty: '',
};

export const invalidEmails = {
  noAtSign: 'johndoe.com',
  noDomain: 'john@',
  noUsername: '@example.com',
  empty: '',
};

export const invalidPhones = {
  tooShort: '123456789',
  tooLong: '12345678901',
  withLetters: '123456789a',
  empty: '',
};

export const outOfAreaZipCode = '12345';

export const interestOptions = ['Independence', 'Safety', 'Therapy', 'Other'] as const;

export const propertyTypes = ['Owned House / Condo', 'Rental Property', 'Mobile Home'] as const;
