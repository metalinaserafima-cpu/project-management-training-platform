import func2url from '../../backend/func2url.json';

const AUTH_URL = func2url.auth;
const SUBMISSIONS_URL = func2url.submissions;
const UPLOAD_IMAGE_URL = func2url['upload-image'];
const DESIGN_DOCUMENTS_URL = func2url['design-documents'];

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'student' | 'teacher';
}

const TOKEN_KEY = 'prolevel_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token: string) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

async function request(url: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) headers['X-Authorization'] = `Bearer ${token}`;

  const res = await fetch(url, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Ошибка запроса');
  }
  return data;
}

export const authApi = {
  register: (name: string, email: string, password: string, role: 'student' | 'teacher') =>
    request(`${AUTH_URL}?action=register`, {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role }),
    }),
  login: (email: string, password: string) =>
    request(`${AUTH_URL}?action=login`, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  me: () => request(`${AUTH_URL}?action=me`),
};

export interface Submission {
  id: number;
  user_id: number;
  task_key: string;
  task_title: string;
  content: Record<string, unknown>;
  status: 'in_progress' | 'submitted' | 'reviewed' | 'needs_revision';
  teacher_comment: string | null;
  grade: number | null;
  created_at: string;
  updated_at: string;
  student_name?: string;
  student_email?: string;
}

export const submissionsApi = {
  list: (taskKey?: string) =>
    request(`${SUBMISSIONS_URL}${taskKey ? `?task_key=${encodeURIComponent(taskKey)}` : ''}`),
  get: (id: number) => request(`${SUBMISSIONS_URL}?id=${id}`),
  save: (taskKey: string, taskTitle: string, content: Record<string, unknown>, status: 'in_progress' | 'submitted') =>
    request(SUBMISSIONS_URL, {
      method: 'POST',
      body: JSON.stringify({ task_key: taskKey, task_title: taskTitle, content, status }),
    }),
  review: (id: number, grade: number | null, comment: string, status: 'reviewed' | 'needs_revision') =>
    request(`${SUBMISSIONS_URL}?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify({ grade, teacher_comment: comment, status }),
    }),
  reset: (id: number) => request(`${SUBMISSIONS_URL}?id=${id}`, { method: 'DELETE' }),
};

export const uploadImageApi = {
  upload: (base64Image: string, contentType: string) =>
    request(UPLOAD_IMAGE_URL, {
      method: 'POST',
      body: JSON.stringify({ image: base64Image, content_type: contentType }),
    }) as Promise<{ url: string }>,
};

export type ProjectType = 'construction' | 'marketing' | 'event' | 'production' | 'social' | 'other';
export type DesignDocStatus = 'in_progress' | 'submitted' | 'accepted' | 'needs_revision';

export interface DesignDocument {
  id: number;
  user_id: number;
  title: string;
  project_type: ProjectType;
  status: DesignDocStatus;
  sections: Record<string, string>;
  teacher_comment: string | null;
  created_at: string;
  updated_at: string;
  submitted_at: string | null;
  student_name?: string;
  student_email?: string;
}

export const designDocumentsApi = {
  list: () => request(DESIGN_DOCUMENTS_URL) as Promise<{ documents: DesignDocument[] }>,
  get: (id: number) => request(`${DESIGN_DOCUMENTS_URL}?id=${id}`) as Promise<{ document: DesignDocument }>,
  create: (title: string, projectType: ProjectType) =>
    request(DESIGN_DOCUMENTS_URL, {
      method: 'POST',
      body: JSON.stringify({ title, project_type: projectType }),
    }) as Promise<{ document: DesignDocument }>,
  save: (id: number, sections: Record<string, string>, title?: string, projectType?: ProjectType) =>
    request(`${DESIGN_DOCUMENTS_URL}?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify({ sections, ...(title ? { title } : {}), ...(projectType ? { project_type: projectType } : {}) }),
    }) as Promise<{ document: DesignDocument }>,
  submit: (id: number, sections: Record<string, string>) =>
    request(`${DESIGN_DOCUMENTS_URL}?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify({ sections, status: 'submitted' }),
    }) as Promise<{ document: DesignDocument }>,
  accept: (id: number) =>
    request(`${DESIGN_DOCUMENTS_URL}?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify({ action: 'accept' }),
    }) as Promise<{ document: DesignDocument }>,
  requestRevision: (id: number, comment: string) =>
    request(`${DESIGN_DOCUMENTS_URL}?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify({ action: 'revise', teacher_comment: comment }),
    }) as Promise<{ document: DesignDocument }>,
  remove: (id: number) => request(`${DESIGN_DOCUMENTS_URL}?id=${id}`, { method: 'DELETE' }),
};