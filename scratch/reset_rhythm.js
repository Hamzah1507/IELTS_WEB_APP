require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

(async () => {
  try {
    const { data: usersData, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) throw listError;
    
    const rhythm = usersData.users.find(u => u.email === 'rhytm@vectragroup.com');
    if (!rhythm) {
      console.log('Rhythm not found in auth.users!');
      process.exit(1);
    }

    console.log(`Found Rhythm. ID: ${rhythm.id}`);
    console.log(`Email: ${rhythm.email}`);

    const { data, error: updateError } = await supabase.auth.admin.updateUserById(
      rhythm.id,
      { password: 'Vectra@12345' }
    );

    if (updateError) throw updateError;

    console.log('Password updated successfully for Rhythm.');

    // Verification check for duplicates
    const { data: verifyData } = await supabase.auth.admin.listUsers();
    const rhythms = verifyData.users.filter(u => u.email === 'rhytm@vectragroup.com');
    if (rhythms.length > 1) {
      console.log('WARNING: Multiple Rhythms found in auth.users!');
    } else {
      console.log('No duplicate auth users found.');
    }

    const { data: studentsData } = await supabase.from('students').select('*').eq('email', 'ridhammesariya@gmail.com');
    if (studentsData.length > 1) {
      console.log('WARNING: Multiple Rhythms found in public.students!');
    } else {
      console.log('No duplicate public.students found.');
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
})();
