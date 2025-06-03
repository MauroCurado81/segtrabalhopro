import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ouvovpinxrcjzbdmwpdi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91dm92cGlueHJjanpiZG13cGRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxMTY5MDMsImV4cCI6MjA2MzY5MjkwM30.2cTvi4BBVRaHCVWXaCYU72GiL5rHOm4jHj-gORFfOr4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);