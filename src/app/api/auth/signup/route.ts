import {NextRequest,NextResponse} from 'next/server';
import {admin} from '@/lib/supabase/admin';

export const runtime='nodejs';

export async function POST(request:NextRequest){
 let body:unknown;
 try{body=await request.json()}catch{return NextResponse.json({error:'Invalid request body.'},{status:400})}
 const {email,password,organization_name}=body as {email?:unknown;password?:unknown;organization_name?:unknown};
 if(typeof email!=='string'||email.length>254||!/^\S+@\S+\.\S+$/.test(email.trim()))return NextResponse.json({error:'Enter a valid email address.'},{status:400});
 if(typeof password!=='string'||password.length<8||password.length>128)return NextResponse.json({error:'Password must be between 8 and 128 characters.'},{status:400});
 if(typeof organization_name!=='string'||organization_name.trim().length<1||organization_name.trim().length>120)return NextResponse.json({error:'Organization name must be between 1 and 120 characters.'},{status:400});
 const normalizedEmail=email.trim().toLowerCase();
 try{
  const {data,error}=await admin.auth.admin.createUser({email:normalizedEmail,password,email_confirm:true,user_metadata:{organization_name:organization_name.trim()}});
  if(error){
   if(error.message.toLowerCase().includes('already'))return NextResponse.json({error:'An account with this email already exists. Sign in instead.'},{status:409});
   console.error('Supabase account creation failed:',error.message);
   return NextResponse.json({error:'Could not create your account. Please try again.'},{status:502});
  }
  const {error:profileError}=await admin.from('users').upsert({id:data.user.id,email:normalizedEmail,organization_name:organization_name.trim()},{onConflict:'id'});
  if(profileError){
   await admin.auth.admin.deleteUser(data.user.id);
   console.error('Profile setup failed:',profileError.message);
   return NextResponse.json({error:'Could not finish setting up your account. Please try again.'},{status:500});
  }
  return NextResponse.json({created:true},{status:201});
 }catch(error){
  console.error('Signup service unavailable:',error instanceof Error?error.message:'unknown error');
  return NextResponse.json({error:'Account creation is temporarily unavailable.'},{status:503});
 }
}
