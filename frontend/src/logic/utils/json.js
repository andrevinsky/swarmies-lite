export function safelyUnwrapJson(json) {
  try {
    return [ null, JSON.parse(json) ];
  } catch (ex) {
    return [ ex ];
  }
}
