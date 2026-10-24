import { createClient as createSupabaseClient, type SupabaseClient } from '@supabase/supabase-js';
let instance:SupabaseClient|undefined;
function getAdmin(){if(!instance){const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;if(!url||!key)throw new Error('Supabase server environment is not configured');instance=createSupabaseClient(url,key,{auth:{autoRefreshToken:false,persistSession:false}})}return instance}
export const admin=new Proxy({} as SupabaseClient,{get(_target,property){const client=getAdmin();const value=(client as any)[property];return typeof value==='function'?value.bind(client):value}});
