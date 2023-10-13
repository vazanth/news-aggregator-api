function interpolateTemplate(template, data) {
  const keys = Object.keys(data);
  keys.forEach((key) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    template = template.replace(regex, data[key]);
  });
  return template;
}

module.exports = interpolateTemplate;
