'use server';

export async function freeModeSignupAction(input: {
  name: string;
  email: string;
  password: string;
  username: string;
  dob: string;
  nationality: string;
  gender: string;
}): Promise<{ success: boolean; message: string }> {
  console.log('[MOCK] Free mode signup:', input.username, input.email);
  return { success: true, message: 'Account created! You can now log in.' };
}
