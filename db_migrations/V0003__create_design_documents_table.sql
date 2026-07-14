CREATE TABLE design_documents (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  project_type TEXT NOT NULL DEFAULT 'other',
  status TEXT NOT NULL DEFAULT 'in_progress',
  sections JSONB NOT NULL DEFAULT '{}'::jsonb,
  teacher_comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  submitted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_design_documents_user_id ON design_documents(user_id);
CREATE INDEX idx_design_documents_status ON design_documents(status);