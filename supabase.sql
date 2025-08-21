-- Create custom_forms table
CREATE TABLE custom_forms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID -- Optional: reference to users table
);

-- Create form_fields table for metadata
CREATE TABLE form_fields (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  form_id UUID NOT NULL REFERENCES custom_forms(id) ON DELETE CASCADE,
  field_name VARCHAR(255) NOT NULL,
  field_key VARCHAR(255) NOT NULL,
  field_type VARCHAR(50) NOT NULL, -- text, email, number, select, checkbox, etc.
  validation_rules JSONB, -- Store validation rules as JSON
  options JSONB, -- For select, radio, checkbox options
  placeholder VARCHAR(255),
  is_required BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create form_submissions table for storing form data
CREATE TABLE form_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  form_id UUID NOT NULL REFERENCES custom_forms(id) ON DELETE CASCADE,
  form_data JSONB NOT NULL, -- Store all form field values as key-value pairs
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  submitted_by UUID -- Optional: reference to users table
);

-- Create indexes for better performance
CREATE INDEX idx_form_fields_form_id ON form_fields(form_id);
CREATE INDEX idx_form_fields_sort_order ON form_fields(form_id, sort_order);
CREATE INDEX idx_form_submissions_form_id ON form_submissions(form_id);
CREATE INDEX idx_form_submissions_submitted_at ON form_submissions(submitted_at);

-- RLS Policies (adjust based on your authentication needs)
ALTER TABLE custom_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;

-- Example policies (modify based on your auth requirements)
CREATE POLICY "Allow read access to custom_forms" ON custom_forms FOR SELECT USING (true);
CREATE POLICY "Allow insert access to custom_forms" ON custom_forms FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update access to custom_forms" ON custom_forms FOR UPDATE USING (true);

CREATE POLICY "Allow read access to form_fields" ON form_fields FOR SELECT USING (true);
CREATE POLICY "Allow insert access to form_fields" ON form_fields FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update access to form_fields" ON form_fields FOR UPDATE USING (true);

CREATE POLICY "Allow read access to form_submissions" ON form_submissions FOR SELECT USING (true);
CREATE POLICY "Allow insert access to form_submissions" ON form_submissions FOR INSERT WITH CHECK (true);