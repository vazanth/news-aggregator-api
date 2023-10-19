function interpolateTemplate(template, data) {
  let result = template;
  const keys = Object.keys(data);
  keys.forEach((key) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, data[key]);
  });
  return result;
}

module.exports = interpolateTemplate;
