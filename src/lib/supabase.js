import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://rjgbnxaahmfyaasyqirp.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_FFTT2v68TjnrZnTBwKaT6Q_GYIY2cNC";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
