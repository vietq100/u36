export const countryEnum = {
  vietnam: 232,
} as const;

export type countryEnum = (typeof countryEnum)[keyof typeof countryEnum];
