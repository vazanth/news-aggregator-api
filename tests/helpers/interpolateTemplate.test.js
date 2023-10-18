const interpolateTemplate = require('../../src/helpers/interpolateTemplate');

describe('verifying the interpolate function', () => {
  it('should replace the value within curly braces', () => {
    const template = '<html>{{user}}</html>';
    const data = { user: 'test', verificationLink: '111' };

    const result = interpolateTemplate(template, data);

    expect(result).toEqual('<html>test</html>');
  });

  it('should replace the all the values if there are multiple curly braces', () => {
    const template = '<html>{{user}}<div>{{verificationLink}}</div></html>';
    const data = { user: 'test', verificationLink: '111' };

    const result = interpolateTemplate(template, data);

    expect(result).toEqual('<html>test<div>111</div></html>');
  });
});
