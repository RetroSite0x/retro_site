import type { CommandHandler } from '../../../types/terminal';

export const cmd_weather: CommandHandler = () => {
  const content = [
    'Weather for Dhaka, Bangladesh',
    '\u2550'.repeat(40),
    '  Temperature: 32\u00b0C (90\u00b0F)',
    '  Condition:   Partly Cloudy',
    '  Humidity:    78%',
    '  Wind:        12 km/h SW',
    '  Feels like:  38\u00b0C',
    '  UV Index:    8 (Very High)',
  ].join('\n');

  return { type: 'output', content };
};
