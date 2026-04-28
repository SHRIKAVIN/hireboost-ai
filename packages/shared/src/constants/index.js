export const APP_NAME = 'HireBoost AI';
export const API_VERSION = 'v1';
export const API_PREFIX = `/api/${API_VERSION}`;
export const SUPPORTED_RESUME_MIME_TYPES = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
export const SUPPORTED_RESUME_EXTENSIONS = ['.pdf', '.docx'];
export const MAX_RESUME_FILE_SIZE_MB = 10;
export const MAX_RESUME_FILE_SIZE_BYTES = MAX_RESUME_FILE_SIZE_MB * 1024 * 1024;
export const MIN_JOB_DESCRIPTION_LENGTH = 50;
export const MAX_JOB_DESCRIPTION_LENGTH = 20000;
/** Steps shown in the top progress stepper, in order. */
export const WORKFLOW_STEPS = [
    'job-description',
    'upload-resume',
    'review-changes',
    'preview-edit',
    'download',
];
//# sourceMappingURL=index.js.map