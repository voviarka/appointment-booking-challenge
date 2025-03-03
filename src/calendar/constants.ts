export const PRODUCTS = ['SolarPanels', 'Heatpumps'] as const;
export const LANGUAGES = ['German', 'English'] as const;
export const RATINGS = ['Bronze', 'Silver', 'Gold'] as const;

export const ERROR_MESSAGES = {
  DATE_FORMAT: 'Date must be a valid ISO date in YYYY-MM-DD format',
  DATE_REQUIRED: 'Date is required',
  PRODUCTS_ENUM: (products: typeof PRODUCTS) =>
    `Products must be either ${products.join(' or ')}`,
  PRODUCTS_MAX: 'No more than 2 products are allowed',
  PRODUCTS_ARRAY: 'Products must be an array',
  PRODUCTS_EMPTY: 'Products cannot be empty',
  PRODUCTS_REQUIRED: 'Products are required',
  LANGUAGE_ENUM: (languages: typeof LANGUAGES) =>
    `Language must be either ${languages.join(' or ')}`,
  LANGUAGE_REQUIRED: 'Language is required',
  RATING_ENUM: (ratings: typeof RATINGS) =>
    `Rating must be ${ratings.join(', ')}`,
  RATING_REQUIRED: 'Rating is required',
} as const;
