/* istanbul ignore file */
export const MAX_FILE_SIZE = import.meta.VITE_MAX_FILE_SIZE || 4;
export const COMMIT_SHA = import.meta.env.VITE_COMMIT_SHA;

export default import.meta.env.NODE_ENV;
