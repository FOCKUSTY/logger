export const alphabetize = (object: {[key: string]: unknown}|null) => {
  if (!object) {
    return object
  }

  const sortedObject: { [key: string]: unknown } = {};
  const keys = Object.keys(object);

  keys.sort(function(a, b) {
    return a < b ? -1 : 1
  })

  keys.forEach((key) => {
    const value = object[key];
    
    if (Array.isArray(value)) {
      sortedObject[key] = value.map((v) => {
        return typeof v === 'object' ? alphabetize(v) : v
      })
    } else if (typeof value === 'object' && typeof value !== "function") {
      sortedObject[key] = alphabetize(value as {[key: string]: unknown});
    } else {
      sortedObject[key] = value
    }
  });

  return sortedObject;
}