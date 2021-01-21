export const safelyExecuteAsync = async promise => {
  try {
    return [ null, await promise ];
  } catch (ex) {
    return [ ex ];
  }
}
